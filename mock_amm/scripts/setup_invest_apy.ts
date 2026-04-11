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

// Read the keypair from the default devnet location
const secretKeyString = fs.readFileSync(
  path.join(os.homedir(), ".config", "solana", "id.json"),
  { encoding: "utf8" }
);
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
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

// RWA Asset definitions matching the frontend
const RWA_ASSETS = [
  {
    id: 1,
    ticker: "JAVA",
    name: "Java Premium Coffee Estate",
    baseYieldBps: 1050, // 10.50%
    bonusYieldBps: 370, // 3.70%
    lockupSeconds: 30 * 24 * 60 * 60, // 30 days
    minDeposit: 25_000_000, // 25 USDC
    rwaPriceUsdc: 25_000_000, // $25
  },
  {
    id: 2,
    ticker: "SKYLN",
    name: "Skyline Commercial Tower",
    baseYieldBps: 600,
    bonusYieldBps: 250,
    lockupSeconds: 90 * 24 * 60 * 60, // 90 days
    minDeposit: 100_000_000, // 100 USDC
    rwaPriceUsdc: 100_000_000, // $100
  },
  {
    id: 3,
    ticker: "SGRID",
    name: "Solar Grid Alpha",
    baseYieldBps: 750,
    bonusYieldBps: 350,
    lockupSeconds: 60 * 24 * 60 * 60, // 60 days
    minDeposit: 50_000_000, // 50 USDC
    rwaPriceUsdc: 50_000_000, // $50
  },
  {
    id: 4,
    ticker: "BALI",
    name: "Bali Resort Collection",
    baseYieldBps: 680,
    bonusYieldBps: 300,
    lockupSeconds: 45 * 24 * 60 * 60, // 45 days
    minDeposit: 75_000_000, // 75 USDC
    rwaPriceUsdc: 75_000_000, // $75
  },
  {
    id: 5,
    ticker: "PALM",
    name: "Palm Oil Yield Fund",
    baseYieldBps: 1150,
    bonusYieldBps: 500,
    lockupSeconds: 14 * 24 * 60 * 60, // 14 days
    minDeposit: 10_000_000, // 10 USDC
    rwaPriceUsdc: 10_000_000, // $10
  },
  {
    id: 6,
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
    "frontend",
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

    const totalApy = (asset.baseYieldBps + asset.bonusYieldBps) / 100;
    console.log(`  Vault PDA: ${vaultPda.toBase58()}`);
    console.log(`  APY: ${totalApy}% (${asset.baseYieldBps / 100}% base + ${asset.bonusYieldBps / 100}% bonus)`);
    console.log(
      `  Lockup: ${asset.lockupSeconds / (24 * 60 * 60)} days | Min: $${asset.minDeposit / 1_000_000}`
    );
    console.log(
      `  Seeded with ${supplyAmount / 1_000_000} $${asset.ticker} tokens for yield`
    );
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

  // Save config
  const config = {
    USDC: usdcMint.toBase58(),
    IDRX: idrxMint.toBase58(),
    ...rwaMints,
    investApyProgramId: program.programId.toBase58(),
  };

  fs.writeFileSync(
    path.join(
      __dirname,
      "..",
      "frontend",
      "src",
      "config",
      "invest-apy-tokens.json"
    ),
    JSON.stringify(config, null, 2)
  );
  console.log("\nConfig saved to frontend/src/config/invest-apy-tokens.json");
}

setup().catch(console.error);
