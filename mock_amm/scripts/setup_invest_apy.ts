import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { InvestApy } from "../target/types/invest_apy";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import fs from "fs";
import os from "os";
import path from "path";

// Read the keypair from env var or default devnet location
let secretKeyString: string;
if (process.env.SOLANA_PRIVATE_KEY) {
  secretKeyString = process.env.SOLANA_PRIVATE_KEY;
} else {
  secretKeyString = fs.readFileSync(
    path.join(os.homedir(), ".config", "solana", "id.json"),
    { encoding: "utf8" }
  );
}

// Check if secret is a JSON array string or base58 string
let secretKey: Uint8Array;
try {
  secretKey = Uint8Array.from(JSON.parse(secretKeyString));
} catch (e) {
  // If it's not JSON, assume it's base58 (common for Phantom exports)
  const bs58 = require('bs58');
  secretKey = bs58.decode(secretKeyString);
}
const walletKeypair = Keypair.fromSecretKey(secretKey);

const wallet = new anchor.Wallet(walletKeypair);
const connection = new anchor.web3.Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);
const provider = new anchor.AnchorProvider(connection, wallet, {
  preflightCommitment: "confirmed",
});
anchor.setProvider(provider);

const idl = JSON.parse(
  fs.readFileSync("./target/idl/invest_apy.json", "utf8")
);
const program = new anchor.Program(idl as any, provider);

const mockAmmIdl = JSON.parse(
  fs.readFileSync("./target/idl/mock_amm.json", "utf8")
);
const mockAmmProgram = new anchor.Program(mockAmmIdl as any, provider);

// RWA Asset definitions matching the frontend
const RWA_ASSETS = [
  {
    id: 101,
    ticker: "JAVA",
    name: "Java Premium Coffee Estate",
    baseYieldBps: 1050, // 10.50%
    bonusYieldBps: 370, // 3.70%
    lockupSeconds: 30 * 24 * 60 * 60, // 30 days
    minDeposit: 25_000_000, // 25 USDC
    rwaPriceUsdc: 25_000_000, // $25
  },
  {
    id: 102,
    ticker: "SKYLN",
    name: "Skyline Commercial Tower",
    baseYieldBps: 600,
    bonusYieldBps: 250,
    lockupSeconds: 90 * 24 * 60 * 60, // 90 days
    minDeposit: 100_000_000, // 100 USDC
    rwaPriceUsdc: 100_000_000, // $100
  },
  {
    id: 103,
    ticker: "SGRID",
    name: "Solar Grid Alpha",
    baseYieldBps: 750,
    bonusYieldBps: 350,
    lockupSeconds: 60 * 24 * 60 * 60, // 60 days
    minDeposit: 50_000_000, // 50 USDC
    rwaPriceUsdc: 50_000_000, // $50
  },
  {
    id: 104,
    ticker: "BALI",
    name: "Bali Resort Collection",
    baseYieldBps: 680,
    bonusYieldBps: 300,
    lockupSeconds: 45 * 24 * 60 * 60, // 45 days
    minDeposit: 75_000_000, // 75 USDC
    rwaPriceUsdc: 75_000_000, // $75
  },
  {
    id: 105,
    ticker: "PALM",
    name: "Palm Oil Yield Fund",
    baseYieldBps: 1150,
    bonusYieldBps: 500,
    lockupSeconds: 14 * 24 * 60 * 60, // 14 days
    minDeposit: 10_000_000, // 10 USDC
    rwaPriceUsdc: 10_000_000, // $10
  },
  {
    id: 106,
    ticker: "EVNET",
    name: "EV Charging Network",
    baseYieldBps: 830,
    bonusYieldBps: 400,
    lockupSeconds: 90 * 24 * 60 * 60, // 90 days
    minDeposit: 40_000_000, // 40 USDC
    rwaPriceUsdc: 40_000_000, // $40
  },
];

const IDRX_RATE = 15625; // 1 USDC = 15,625 IDRX

async function setup() {
  console.log(
    `Setting up Invest APY vaults using wallet: ${wallet.publicKey.toBase58()}`
  );

  // Load existing token addresses or create new ones
  let tokensConfig: any;
  const tokensPath = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "config",
    "devnet-tokens.json"
  );

  try {
    tokensConfig = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
    console.log("Using existing token config from devnet-tokens.json");
  } catch {
    console.log("No existing token config found, creating new mints...");
    tokensConfig = {};
  }

  // Ensure USDC and IDRX mints exist
  let usdcMint: PublicKey;
  let idrxMint: PublicKey;

  if (tokensConfig.USDC) {
    usdcMint = new PublicKey(tokensConfig.USDC);
    console.log(`Using existing USDC Mint: ${usdcMint.toBase58()}`);
  } else {
    usdcMint = await createMint(
      connection,
      walletKeypair,
      wallet.publicKey,
      null,
      6
    );
    console.log(`Created USDC Mint: ${usdcMint.toBase58()}`);
  }

  if (tokensConfig.IDRX) {
    idrxMint = new PublicKey(tokensConfig.IDRX);
    console.log(`Using existing IDRX Mint: ${idrxMint.toBase58()}`);
  } else {
    idrxMint = await createMint(
      connection,
      walletKeypair,
      wallet.publicKey,
      null,
      6
    );
    console.log(`Created IDRX Mint: ${idrxMint.toBase58()}`);
  }

  // Get or Create ATAs for user for USDC and IDRX
  const usdcAta = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair,
    usdcMint,
    wallet.publicKey
  );
  // Mint USDC to user for liquidity provision
  await mintTo(
    connection,
    walletKeypair,
    usdcMint,
    usdcAta.address,
    walletKeypair,
    10_000_000 * 1_000_000 // 10M USDC
  );

  const idrxAta = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair,
    idrxMint,
    wallet.publicKey
  );
  await mintTo(
    connection,
    walletKeypair,
    idrxMint,
    idrxAta.address,
    walletKeypair,
    150_000_000 * 1_000_000 // 150M IDRX
  );

  // Setup IDRX / USDC pool
  console.log(`\n--- Setting up IDRX/USDC Pool ---`);
  const [idrxPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), idrxMint.toBuffer(), usdcMint.toBuffer()],
    mockAmmProgram.programId
  );
  const [idrxVaultA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_a"), idrxPoolPda.toBuffer()],
    mockAmmProgram.programId
  );
  const [idrxVaultB] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_b"), idrxPoolPda.toBuffer()],
    mockAmmProgram.programId
  );

  try {
    await mockAmmProgram.methods
      .initializePool()
      .accounts({
        pool: idrxPoolPda,
        mintA: idrxMint,
        mintB: usdcMint,
        vaultA: idrxVaultA,
        vaultB: idrxVaultB,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`  Initialized IDRX/USDC pool: ${idrxPoolPda.toBase58()}`);

    const liqIdrx = 15_000_000 * 1_000_000;
    const liqUsdcIdrx = 1_000 * 1_000_000; // ~ 15000:1 ratio matching the rate
    await mockAmmProgram.methods
      .addLiquidity(new anchor.BN(liqIdrx), new anchor.BN(liqUsdcIdrx))
      .accounts({
        pool: idrxPoolPda,
        user: wallet.publicKey,
        userA: idrxAta.address,
        userB: usdcAta.address,
        vaultA: idrxVaultA,
        vaultB: idrxVaultB,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`  Added initial liquidity: 15,000,000 IDRX and 1,000 USDC`);
  } catch (e) {
    console.log(`  IDRX/USDC pool might already exist or failed: ${e}`);
  }

  // Create RWA token mints for each asset
  const rwaMints: Record<string, string> = {};

  for (const asset of RWA_ASSETS) {
    console.log(`\n--- Setting up ${asset.ticker} (${asset.name}) ---`);

    // Create RWA token mint
    const rwaMint = await createMint(
      connection,
      walletKeypair,
      wallet.publicKey,
      null,
      6
    );
    console.log(`  RWA Mint ($${asset.ticker}): ${rwaMint.toBase58()}`);
    rwaMints[asset.ticker] = rwaMint.toBase58();

    // Find vault PDA
    const assetIdBuffer = Buffer.alloc(8);
    assetIdBuffer.writeBigUInt64LE(BigInt(asset.id));

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), assetIdBuffer],
      program.programId
    );

    const [usdcVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("usdc_vault"), vaultPda.toBuffer()],
      program.programId
    );

    const [idrxVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("idrx_vault"), vaultPda.toBuffer()],
      program.programId
    );

    const [rwaVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("rwa_vault"), vaultPda.toBuffer()],
      program.programId
    );

    // Initialize vault
    console.log(`  Initializing vault...`);
    try {
      await program.methods
        .initializeVault(
          new anchor.BN(asset.id),
          new anchor.BN(asset.baseYieldBps),
          new anchor.BN(asset.bonusYieldBps),
          new anchor.BN(asset.lockupSeconds),
          new anchor.BN(asset.minDeposit),
          new anchor.BN(asset.rwaPriceUsdc),
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
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Seed the RWA vault with tokens for yield distribution
      const supplyAmount = 1_000_000 * 1_000_000; // 1M tokens
      await mintTo(
        connection,
        walletKeypair,
        rwaMint,
        rwaVaultPda,
        walletKeypair,
        supplyAmount
      );

      console.log(
        `  Seeded with ${supplyAmount / 1_000_000} $${asset.ticker} tokens for yield`
      );
    } catch (e) {
      console.log(`  Vault initialization failed (likely already initialized): ${e}`);
    }

    const totalApy = (asset.baseYieldBps + asset.bonusYieldBps) / 100;
    console.log(`  Vault PDA: ${vaultPda.toBase58()}`);
    console.log(`  APY: ${totalApy}% (${asset.baseYieldBps / 100}% base + ${asset.bonusYieldBps / 100}% bonus)`);
    console.log(
      `  Lockup: ${asset.lockupSeconds / (24 * 60 * 60)} days | Min: $${asset.minDeposit / 1_000_000}`
    );

    // Setup AMM Pool for RWA / USDC
    const rwaAta = await getOrCreateAssociatedTokenAccount(
      connection,
      walletKeypair,
      rwaMint,
      wallet.publicKey
    );

    await mintTo(
      connection,
      walletKeypair,
      rwaMint,
      rwaAta.address,
      walletKeypair,
      50_000 * 1_000_000 // 50k RWA tokens to admin
    );

    console.log(`  Setting up AMM Pool for ${asset.ticker}/USDC...`);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), rwaMint.toBuffer(), usdcMint.toBuffer()],
      mockAmmProgram.programId
    );

    const [vaultA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_a"), poolPda.toBuffer()],
      mockAmmProgram.programId
    );

    const [vaultB] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_b"), poolPda.toBuffer()],
      mockAmmProgram.programId
    );

    try {
      await mockAmmProgram.methods
        .initializePool()
        .accounts({
          pool: poolPda,
          mintA: rwaMint,
          mintB: usdcMint,
          vaultA: vaultA,
          vaultB: vaultB,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log(`  Initialized AMM pool: ${poolPda.toBase58()}`);

      const amountRwa = 10_000 * 1_000_000; // 10,000 RWA
      const amountUsdc = 10_000 * asset.rwaPriceUsdc; // 10,000 * price

      await mockAmmProgram.methods
        .addLiquidity(new anchor.BN(amountRwa), new anchor.BN(amountUsdc))
        .accounts({
          pool: poolPda,
          user: wallet.publicKey,
          userA: rwaAta.address,
          userB: usdcAta.address,
          vaultA: vaultA,
          vaultB: vaultB,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log(`  Added initial liquidity: 10,000 ${asset.ticker} and $${amountUsdc / 1_000_000} USDC`);
    } catch (e) {
      console.log(`  AMM pool might already exist or failed: ${e}`);
    }
  }

  console.log("\n========================================");
  console.log("Setup Complete!");
  console.log("========================================");
  console.log(`USDC Mint: ${usdcMint.toBase58()}`);
  console.log(`IDRX Mint: ${idrxMint.toBase58()}`);
  console.log("RWA Token Mints:");
  for (const [ticker, mint] of Object.entries(rwaMints)) {
    console.log(`  $${ticker}: ${mint}`);
  }

  // Save config — update the devnet-tokens.json that the frontend uses
  const configOut = {
    USDC: usdcMint.toBase58(),
    IDRX: idrxMint.toBase58(),
    ...rwaMints,
  };

  fs.writeFileSync(
    tokensPath,
    JSON.stringify(configOut, null, 2)
  );
  console.log(`\nConfig saved to ${tokensPath}`);
}

setup().catch(console.error);
