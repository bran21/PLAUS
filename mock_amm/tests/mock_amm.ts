import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MockAmm } from "../target/types/mock_amm";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { createMint, createAccount, mintTo, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

describe("mock_amm", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MockAmm as Program<MockAmm>;

  // Keypairs for testing
  const user = Keypair.generate();
  
  // Mints and accounts
  let mintA: PublicKey;
  let mintB: PublicKey;
  let userTokenA: PublicKey;
  let userTokenB: PublicKey;
  let vaultA: PublicKey;
  let vaultB: PublicKey;
  let poolPda: PublicKey;
  let poolBump: number;

  before(async () => {
    // AirDrop SOL to user
    const signature = await provider.connection.requestAirdrop(user.publicKey, 1000000000);
    const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

    // Create Mints
    mintA = await createMint(provider.connection, user, user.publicKey, null, 6);
    mintB = await createMint(provider.connection, user, user.publicKey, null, 6);

    // Create user token accounts
    userTokenA = await createAccount(provider.connection, user, mintA, user.publicKey);
    userTokenB = await createAccount(provider.connection, user, mintB, user.publicKey);

    // Mint tokens to user
    await mintTo(provider.connection, user, mintA, userTokenA, user.publicKey, 1000000000);
    await mintTo(provider.connection, user, mintB, userTokenB, user.publicKey, 1000000000);

    // Find PDAs
    [poolPda, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
      program.programId
    );

    [vaultA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_a"), poolPda.toBuffer()],
      program.programId
    );

    [vaultB] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_b"), poolPda.toBuffer()],
      program.programId
    );
  });

  it("Initialized the pool", async () => {
    await program.methods
      .initializePool()
      .accounts({
        pool: poolPda,
        mintA: mintA,
        mintB: mintB,
        vaultA: vaultA,
        vaultB: vaultB,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const poolAccount = await program.account.pool.fetch(poolPda);
    assert.ok(poolAccount.mintA.equals(mintA));
    assert.ok(poolAccount.mintB.equals(mintB));
    assert.ok(poolAccount.vaultA.equals(vaultA));
    assert.ok(poolAccount.vaultB.equals(vaultB));
    assert.strictEqual(poolAccount.reserveA.toNumber(), 0);
    assert.strictEqual(poolAccount.reserveB.toNumber(), 0);
  });

  it("Added liquidity", async () => {
    const amountA = new anchor.BN(10000000); // 10 tokens
    const amountB = new anchor.BN(50000000); // 50 tokens

    await program.methods
      .addLiquidity(amountA, amountB)
      .accounts({
        pool: poolPda,
        user: user.publicKey,
        userA: userTokenA,
        userB: userTokenB,
        vaultA: vaultA,
        vaultB: vaultB,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const poolAccount = await program.account.pool.fetch(poolPda);
    assert.strictEqual(poolAccount.reserveA.toNumber(), 10000000);
    assert.strictEqual(poolAccount.reserveB.toNumber(), 50000000);
  });

  it("Swapped A to B", async () => {
    const amountIn = new anchor.BN(1000000); // 1 token A
    
    const userBBefore = (await getAccount(provider.connection, userTokenB)).amount;

    await program.methods
      .swap(amountIn, true)
      .accounts({
        pool: poolPda,
        user: user.publicKey,
        userIn: userTokenA,
        userOut: userTokenB,
        vaultA: vaultA,
        vaultB: vaultB,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const poolAccount = await program.account.pool.fetch(poolPda);
    assert.strictEqual(poolAccount.reserveA.toNumber(), 11000000);
    
    const userBAfter = (await getAccount(provider.connection, userTokenB)).amount;
    assert.ok(userBAfter > userBBefore);
  });
});
