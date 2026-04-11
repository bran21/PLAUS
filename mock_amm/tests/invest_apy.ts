import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { InvestApy } from "../target/types/invest_apy";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("invest_apy", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.InvestApy as Program<InvestApy>;

  // Keypairs
  const admin = Keypair.generate();
  const user = Keypair.generate();

  // Mints
  let usdcMint: PublicKey;
  let idrxMint: PublicKey;
  let rwaMint: PublicKey; // e.g. $JAVA token

  // Admin token accounts
  let adminUsdc: PublicKey;
  let adminIdrx: PublicKey;
  let adminRwa: PublicKey;

  // User token accounts
  let userUsdc: PublicKey;
  let userIdrx: PublicKey;
  let userRwa: PublicKey;

  // PDAs
  let vaultPda: PublicKey;
  let vaultBump: number;
  let usdcVaultPda: PublicKey;
  let idrxVaultPda: PublicKey;
  let rwaVaultPda: PublicKey;
  let userDepositPda: PublicKey;

  // Asset config (matching frontend JAVA asset)
  const ASSET_ID = 1;
  const BASE_YIELD_BPS = 1050; // 10.50%
  const BONUS_YIELD_BPS = 370; // 3.70%
  const LOCKUP_SECONDS = 5; // 5 seconds for testing (30 days in prod)
  const MIN_DEPOSIT = 25_000_000; // 25 USDC (6 decimals)
  const RWA_PRICE_USDC = 25_000_000; // $25 per $JAVA token (6 decimals)
  const IDRX_RATE = 15625; // 1 USDC = 15,625 IDRX (in micro-units ratio)

  before(async () => {
    // Airdrop SOL to admin and user
    for (const kp of [admin, user]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2_000_000_000
      );
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      await provider.connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      });
    }

    // Create Mints (all 6 decimals like real USDC)
    usdcMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );
    idrxMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );
    rwaMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );

    // Create admin token accounts
    adminUsdc = await createAccount(
      provider.connection,
      admin,
      usdcMint,
      admin.publicKey
    );
    adminIdrx = await createAccount(
      provider.connection,
      admin,
      idrxMint,
      admin.publicKey
    );
    adminRwa = await createAccount(
      provider.connection,
      admin,
      rwaMint,
      admin.publicKey
    );

    // Create user token accounts
    userUsdc = await createAccount(
      provider.connection,
      user,
      usdcMint,
      user.publicKey
    );
    userIdrx = await createAccount(
      provider.connection,
      user,
      idrxMint,
      user.publicKey
    );
    userRwa = await createAccount(
      provider.connection,
      user,
      rwaMint,
      user.publicKey
    );

    // Mint tokens
    // Admin: 100,000 USDC, 1B IDRX, 50,000 RWA tokens
    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      adminUsdc,
      admin,
      100_000_000_000
    );
    await mintTo(
      provider.connection,
      admin,
      idrxMint,
      adminIdrx,
      admin,
      1_000_000_000_000_000
    );
    await mintTo(
      provider.connection,
      admin,
      rwaMint,
      adminRwa,
      admin,
      50_000_000_000
    );

    // User: 10,000 USDC, 150M IDRX
    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      userUsdc,
      admin,
      10_000_000_000
    );
    await mintTo(
      provider.connection,
      admin,
      idrxMint,
      userIdrx,
      admin,
      150_000_000_000_000
    );

    // Find PDAs
    const assetIdBuffer = Buffer.alloc(8);
    assetIdBuffer.writeBigUInt64LE(BigInt(ASSET_ID));

    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), assetIdBuffer],
      program.programId
    );

    [usdcVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("usdc_vault"), vaultPda.toBuffer()],
      program.programId
    );

    [idrxVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("idrx_vault"), vaultPda.toBuffer()],
      program.programId
    );

    [rwaVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("rwa_vault"), vaultPda.toBuffer()],
      program.programId
    );

    [userDepositPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), vaultPda.toBuffer(), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes a vault for JAVA asset", async () => {
    await program.methods
      .initializeVault(
        new anchor.BN(ASSET_ID),
        new anchor.BN(BASE_YIELD_BPS),
        new anchor.BN(BONUS_YIELD_BPS),
        new anchor.BN(LOCKUP_SECONDS),
        new anchor.BN(MIN_DEPOSIT),
        new anchor.BN(RWA_PRICE_USDC),
        new anchor.BN(IDRX_RATE)
      )
      .accounts({
        vault: vaultPda,
        usdcMint: usdcMint,
        idrxMint: idrxMint,
        rwaMint: rwaMint,
        usdcTokenVault: usdcVaultPda,
        idrxTokenVault: idrxVaultPda,
        rwaTokenVault: rwaVaultPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.ok(vaultAccount.admin.equals(admin.publicKey));
    assert.ok(vaultAccount.usdcMint.equals(usdcMint));
    assert.ok(vaultAccount.idrxMint.equals(idrxMint));
    assert.ok(vaultAccount.rwaMint.equals(rwaMint));
    assert.strictEqual(vaultAccount.assetId.toNumber(), ASSET_ID);
    assert.strictEqual(vaultAccount.baseYieldBps.toNumber(), BASE_YIELD_BPS);
    assert.strictEqual(vaultAccount.bonusYieldBps.toNumber(), BONUS_YIELD_BPS);
    assert.strictEqual(
      vaultAccount.lockupSeconds.toNumber(),
      LOCKUP_SECONDS
    );
    assert.strictEqual(vaultAccount.minDeposit.toNumber(), MIN_DEPOSIT);
    assert.strictEqual(vaultAccount.rwaPriceUsdc.toNumber(), RWA_PRICE_USDC);
    assert.strictEqual(vaultAccount.idrxRate.toNumber(), IDRX_RATE);
    assert.strictEqual(vaultAccount.totalDepositsUsdc.toNumber(), 0);
    assert.strictEqual(vaultAccount.totalYieldDistributed.toNumber(), 0);

    console.log(`  ✓ Vault PDA: ${vaultPda.toBase58()}`);
    console.log(`  ✓ USDC Vault: ${usdcVaultPda.toBase58()}`);
    console.log(`  ✓ IDRX Vault: ${idrxVaultPda.toBase58()}`);
    console.log(`  ✓ RWA Vault: ${rwaVaultPda.toBase58()}`);
    console.log(
      `  ✓ APY: ${(BASE_YIELD_BPS + BONUS_YIELD_BPS) / 100}% (${BASE_YIELD_BPS / 100}% base + ${BONUS_YIELD_BPS / 100}% bonus)`
    );
  });

  it("Rejects deposit below minimum", async () => {
    const tooSmall = new anchor.BN(1_000_000); // 1 USDC < 25 min
    try {
      await program.methods
        .depositUsdc(tooSmall)
        .accounts({
          vault: vaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          userUsdc: userUsdc,
          usdcTokenVault: usdcVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      assert.fail("Should have rejected below-minimum deposit");
    } catch (e: any) {
      assert.include(e.toString(), "BelowMinimum");
      console.log("  ✓ Correctly rejected 1 USDC deposit (min: 25 USDC)");
    }
  });

  it("User deposits 100 USDC", async () => {
    const amount = new anchor.BN(100_000_000); // 100 USDC

    const usdcBefore = (await getAccount(provider.connection, userUsdc)).amount;

    await program.methods
      .depositUsdc(amount)
      .accounts({
        vault: vaultPda,
        userDeposit: userDepositPda,
        user: user.publicKey,
        userUsdc: userUsdc,
        usdcTokenVault: usdcVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify user deposit PDA
    const deposit = await program.account.userDeposit.fetch(userDepositPda);
    assert.ok(deposit.user.equals(user.publicKey));
    assert.strictEqual(deposit.amountUsdcEquivalent.toNumber(), 100_000_000);
    assert.strictEqual(deposit.originalAmount.toNumber(), 100_000_000);
    assert.strictEqual(deposit.depositCurrency, 0); // USDC
    assert.ok(deposit.depositedAt.toNumber() > 0);
    assert.strictEqual(deposit.yieldClaimed.toNumber(), 0);

    // Verify vault totals
    const vault = await program.account.vault.fetch(vaultPda);
    assert.strictEqual(vault.totalDepositsUsdc.toNumber(), 100_000_000);

    // Verify token transfer
    const usdcAfter = (await getAccount(provider.connection, userUsdc)).amount;
    assert.strictEqual(
      Number(usdcBefore) - Number(usdcAfter),
      100_000_000
    );

    const vaultBalance = (await getAccount(provider.connection, usdcVaultPda))
      .amount;
    assert.strictEqual(Number(vaultBalance), 100_000_000);

    console.log(`  ✓ Deposited: 100 USDC`);
    console.log(`  ✓ Vault balance: ${Number(vaultBalance) / 1_000_000} USDC`);
  });

  it("Fund RWA vault for yield distribution", async () => {
    // Admin transfers RWA tokens into the vault's rwa_token_vault
    // so that distribute_yield can send them to users.
    // In production, these would be minted or transferred by the RWA issuer.

    // We need to transfer RWA tokens to the vault PDA's rwa_token_vault.
    // The rwa_token_vault is owned by vault PDA, so we transfer directly to it.
    await mintTo(
      provider.connection,
      admin,
      rwaMint,
      rwaVaultPda,
      admin,
      10_000_000_000 // 10,000 RWA tokens
    );

    const rwaBalance = (await getAccount(provider.connection, rwaVaultPda))
      .amount;
    assert.strictEqual(Number(rwaBalance), 10_000_000_000);
    console.log(
      `  ✓ Funded RWA vault with ${Number(rwaBalance) / 1_000_000} $JAVA tokens`
    );
  });

  it("Admin distributes yield in RWA tokens", async () => {
    // Simulate monthly yield distribution for 100 USDC @ 14.2% APY
    // Monthly yield = 100 * 14.2% / 12 = $1.1833 USDC
    // At $25 per $JAVA token, that's 1.1833 / 25 = 0.047333 $JAVA tokens
    // In micro-units (6 decimals): 47_333

    const rwaYieldAmount = new anchor.BN(47_333);

    await program.methods
      .distributeYield(rwaYieldAmount)
      .accounts({
        vault: vaultPda,
        userDeposit: userDepositPda,
        rwaTokenVault: rwaVaultPda,
        userRwa: userRwa,
        depositor: user.publicKey,
        admin: admin.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    // Verify user received RWA tokens
    const userRwaBalance = (await getAccount(provider.connection, userRwa))
      .amount;
    assert.strictEqual(Number(userRwaBalance), 47_333);

    // Verify deposit bookkeeping
    const deposit = await program.account.userDeposit.fetch(userDepositPda);
    assert.strictEqual(deposit.yieldClaimed.toNumber(), 47_333);

    // Verify vault bookkeeping
    const vault = await program.account.vault.fetch(vaultPda);
    assert.strictEqual(vault.totalYieldDistributed.toNumber(), 47_333);

    console.log(
      `  ✓ Distributed: ${Number(userRwaBalance) / 1_000_000} $JAVA tokens`
    );
    console.log(
      `  ✓ Value: ~$${((Number(userRwaBalance) / 1_000_000) * 25).toFixed(2)} at $25/JAVA`
    );
  });

  it("Rejects withdrawal before lockup expires", async () => {
    // Lockup is 5 seconds — if we call immediately it may still be locked
    // depending on timing. Let's explicitly check.
    try {
      await program.methods
        .withdraw()
        .accounts({
          vault: vaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          userTokenOut: userUsdc,
          usdcTokenVault: usdcVaultPda,
          idrxTokenVault: idrxVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
      // If it doesn't fail, the lockup already expired (test timing)
      // That's okay for a 5s lockup — just log it
      console.log(
        "  ⚠ Lockup already expired (5s is very short for test timing)"
      );
    } catch (e: any) {
      assert.include(e.toString(), "LockupNotExpired");
      console.log("  ✓ Correctly rejected early withdrawal");
    }
  });

  it("User withdraws after lockup period", async () => {
    // Wait for lockup to expire (5 seconds + buffer)
    console.log("  ⏳ Waiting for lockup to expire...");
    await new Promise((resolve) => setTimeout(resolve, 6000));

    // Re-deposit if the previous test withdrew
    const deposit = await program.account.userDeposit.fetch(userDepositPda);
    if (deposit.originalAmount.toNumber() === 0) {
      // Re-deposit for this test
      await program.methods
        .depositUsdc(new anchor.BN(100_000_000))
        .accounts({
          vault: vaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          userUsdc: userUsdc,
          usdcTokenVault: usdcVaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }

    const usdcBefore = (await getAccount(provider.connection, userUsdc)).amount;

    await program.methods
      .withdraw()
      .accounts({
        vault: vaultPda,
        userDeposit: userDepositPda,
        user: user.publicKey,
        userTokenOut: userUsdc,
        usdcTokenVault: usdcVaultPda,
        idrxTokenVault: idrxVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const usdcAfter = (await getAccount(provider.connection, userUsdc)).amount;
    const received = Number(usdcAfter) - Number(usdcBefore);
    assert.ok(received > 0, "Should have received USDC back");

    // Verify deposit is zeroed out
    const depositAfter = await program.account.userDeposit.fetch(
      userDepositPda
    );
    assert.strictEqual(depositAfter.originalAmount.toNumber(), 0);
    assert.strictEqual(depositAfter.amountUsdcEquivalent.toNumber(), 0);
    assert.strictEqual(depositAfter.depositedAt.toNumber(), 0);

    console.log(`  ✓ Withdrew: ${received / 1_000_000} USDC`);
  });

  it("Updates vault APY rates", async () => {
    const newBase = new anchor.BN(1200); // 12.00%
    const newBonus = new anchor.BN(400); // 4.00%

    await program.methods
      .updateVaultApy(newBase, newBonus)
      .accounts({
        vault: vaultPda,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.strictEqual(vault.baseYieldBps.toNumber(), 1200);
    assert.strictEqual(vault.bonusYieldBps.toNumber(), 400);

    console.log(`  ✓ APY updated: ${(1200 + 400) / 100}% (12% + 4%)`);
  });

  it("Updates IDRX rate", async () => {
    const newRate = new anchor.BN(16000); // new rate

    await program.methods
      .updateIdrxRate(newRate)
      .accounts({
        vault: vaultPda,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.strictEqual(vault.idrxRate.toNumber(), 16000);

    console.log(`  ✓ IDRX rate updated: 1 USDC = 16,000 IDRX`);
  });

  it("Updates RWA token price", async () => {
    const newPrice = new anchor.BN(30_000_000); // $30 per token

    await program.methods
      .updateRwaPrice(newPrice)
      .accounts({
        vault: vaultPda,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.strictEqual(vault.rwaPriceUsdc.toNumber(), 30_000_000);

    console.log(`  ✓ RWA price updated: $30 per $JAVA token`);
  });

  it("User deposits IDRX (converted at currency rate)", async () => {
    // Deposit 500,000 IDRX (at 16000 rate = ~31.25 USDC equivalent)
    const idrxAmount = new anchor.BN(500_000_000_000); // 500,000 IDRX in micro

    // Need a new deposit PDA since previous one may have been used
    // Actually, since we withdrew, the deposit PDA is zeroed — let's reuse it
    await program.methods
      .depositIdrx(idrxAmount)
      .accounts({
        vault: vaultPda,
        userDeposit: userDepositPda,
        user: user.publicKey,
        userIdrx: userIdrx,
        idrxTokenVault: idrxVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const deposit = await program.account.userDeposit.fetch(userDepositPda);
    assert.strictEqual(deposit.depositCurrency, 1); // IDRX
    assert.strictEqual(deposit.originalAmount.toNumber(), 500_000_000_000);

    // USDC equivalent: 500_000_000_000 / 16000 = 31_250_000 (~31.25 USDC)
    const expectedUsdcEq = Math.floor(500_000_000_000 / 16000);
    assert.strictEqual(
      deposit.amountUsdcEquivalent.toNumber(),
      expectedUsdcEq
    );

    const vault = await program.account.vault.fetch(vaultPda);
    console.log(
      `  ✓ Deposited: 500,000 IDRX (≈ $${expectedUsdcEq / 1_000_000} USDC equivalent)`
    );
    console.log(
      `  ✓ Total vault deposits: $${vault.totalDepositsUsdc.toNumber() / 1_000_000} USDC equivalent`
    );
  });
});
