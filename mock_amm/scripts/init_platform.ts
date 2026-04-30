import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MockAmm } from "../target/types/mock_amm";
import { InvestApy } from "../target/types/invest_apy";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { createMint, createAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";

// Constants for assets (matching InvestPage and TradePanel)
const ASSET_ID_JAVA = 1;
const ASSET_ID_CROP = 2; // Let's pretend CROP is asset 2

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const mockAmmProgram = anchor.workspace.MockAmm as Program<MockAmm>;
  const investApyProgram = anchor.workspace.InvestApy as Program<InvestApy>;

  const admin = provider.wallet as anchor.Wallet;
  
  if (!admin.payer) {
    throw new Error("Payer not available in AnchorProvider wallet.");
  }

  console.log("Admin wallet:", admin.publicKey.toBase58());

  // 1. Create Mints
  console.log("\n--- Creating Mints ---");
  const usdcMint = await createMint(provider.connection, admin.payer, admin.publicKey, null, 6);
  const idrxMint = await createMint(provider.connection, admin.payer, admin.publicKey, null, 6);
  const cropMint = await createMint(provider.connection, admin.payer, admin.publicKey, null, 6);
  const javaMint = await createMint(provider.connection, admin.payer, admin.publicKey, null, 6);

  console.log("USDC Mint:", usdcMint.toBase58());
  console.log("IDRX Mint:", idrxMint.toBase58());
  console.log("CROP Mint:", cropMint.toBase58());
  console.log("JAVA Mint:", javaMint.toBase58());

  // Write to devnet-tokens.json
  const configPath = "../src/config/devnet-tokens.json";
  fs.writeFileSync(configPath, JSON.stringify({
    USDC: usdcMint.toBase58(),
    IDRX: idrxMint.toBase58(),
    CROP: cropMint.toBase58(),
    JAVA: javaMint.toBase58(),
    SKYLN: cropMint.toBase58(), // Mock same token for testing other assets
    SGRID: cropMint.toBase58(),
    BALI: cropMint.toBase58(),
    PALM: cropMint.toBase58(),
  }, null, 2));

  console.log(`\nWrote config to ${configPath}`);

  // 2. Initialize InvestAPY Vault for JAVA
  console.log("\n--- Initializing JAVA Invest Vault ---");
  const assetIdBuffer = Buffer.alloc(8);
  assetIdBuffer.writeBigUInt64LE(BigInt(ASSET_ID_JAVA));

  const [javaVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), assetIdBuffer],
    investApyProgram.programId
  );

  const [javaUsdcVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault"), javaVaultPda.toBuffer()],
    investApyProgram.programId
  );
  const [javaIdrxVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("idrx_vault"), javaVaultPda.toBuffer()],
    investApyProgram.programId
  );
  const [javaRwaVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("rwa_vault"), javaVaultPda.toBuffer()],
    investApyProgram.programId
  );

  await investApyProgram.methods
    .initializeVault(
      new anchor.BN(ASSET_ID_JAVA),
      new anchor.BN(1050), // Base yield 10.5%
      new anchor.BN(370),  // Bonus yield 3.7%
      new anchor.BN(5),    // Lockup 5 seconds for easy test
      new anchor.BN(25000000), // Min deposit 25 USDC
      new anchor.BN(25000000), // Price 25 USDC
      new anchor.BN(15625) // IDRX rate
    )
    .accounts({
      vault: javaVaultPda,
      usdcMint: usdcMint,
      idrxMint: idrxMint,
      rwaMint: javaMint,
      usdcTokenVault: javaUsdcVaultPda,
      idrxTokenVault: javaIdrxVaultPda,
      rwaTokenVault: javaRwaVaultPda,
      admin: admin.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();
  
  console.log("Initialized Invest Vault for JAVA:", javaVaultPda.toBase58());

  // 3. Initialize MockAMM Pool for JAVA/USDC
  console.log("\n--- Initializing JAVA/USDC AMM Pool ---");
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), javaMint.toBuffer(), usdcMint.toBuffer()],
    mockAmmProgram.programId
  );

  const [ammVaultA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_a"), poolPda.toBuffer()],
    mockAmmProgram.programId
  );

  const [ammVaultB] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_b"), poolPda.toBuffer()],
    mockAmmProgram.programId
  );

  const [poolMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_mint"), poolPda.toBuffer()],
    mockAmmProgram.programId
  );

  await mockAmmProgram.methods
    .initializePool() // no fee parameter
    .accounts({
      pool: poolPda,
      mintA: javaMint,
      mintB: usdcMint,
      vaultA: ammVaultA,
      vaultB: ammVaultB,
      user: admin.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();

  console.log("Initialized AMM Pool for JAVA/USDC:", poolPda.toBase58());

  // 4. Initialize MockAMM Pool for CROP/USDC
  console.log("\n--- Initializing CROP/USDC AMM Pool ---");
  const [cropPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), cropMint.toBuffer(), usdcMint.toBuffer()],
    mockAmmProgram.programId
  );

  const [cropAmmVaultA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_a"), cropPoolPda.toBuffer()],
    mockAmmProgram.programId
  );

  const [cropAmmVaultB] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_b"), cropPoolPda.toBuffer()],
    mockAmmProgram.programId
  );

  const [cropPoolMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool_mint"), cropPoolPda.toBuffer()],
    mockAmmProgram.programId
  );

  await mockAmmProgram.methods
    .initializePool() // no fee parameter
    .accounts({
      pool: cropPoolPda,
      mintA: cropMint,
      mintB: usdcMint,
      vaultA: cropAmmVaultA,
      vaultB: cropAmmVaultB,
      user: admin.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();

  console.log("Initialized AMM Pool for CROP/USDC:", cropPoolPda.toBase58());

  console.log("\n✅ Platform initialization complete.");
  console.log("Make sure to airdrop tokens to your Phantom wallet using a customized script or transfer from this admin wallet if you need to test.");
}

main().catch(console.error);
