import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import fs from "fs";
import path from "path";
import os from "os";

async function airdrop() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.log("Usage: yarn run ts-node scripts/airdrop_test_tokens.ts <phantom_wallet_address>");
    return;
  }
  const targetWallet = new PublicKey(args[0]);

  // Load admin keypair
  const secretKeyString = fs.readFileSync(path.join(os.homedir(), ".config", "solana", "id.json"), "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const adminKeypair = Keypair.fromSecretKey(secretKey);

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Load tokens
  const tokensPath = path.join(__dirname, "..", "..", "frontend", "src", "config", "devnet-tokens.json");
  const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

  console.log(`Airdropping to ${targetWallet.toBase58()}...`);

  // Airdrop USDC (10,000)
  const usdcMint = new PublicKey(tokens.USDC);
  const usdcAta = await getOrCreateAssociatedTokenAccount(connection, adminKeypair, usdcMint, targetWallet);
  await mintTo(connection, adminKeypair, usdcMint, usdcAta.address, adminKeypair, 10000 * 1_000_000);
  console.log("Airdropped 10,000 USDC");

  // Airdrop IDRX (150,000,000)
  const idrxMint = new PublicKey(tokens.IDRX);
  const idrxAta = await getOrCreateAssociatedTokenAccount(connection, adminKeypair, idrxMint, targetWallet);
  await mintTo(connection, adminKeypair, idrxMint, idrxAta.address, adminKeypair, 150000000 * 1_000_000);
  console.log("Airdropped 150,000,000 IDRX");

  console.log("Done!");
}

airdrop().catch(console.error);
