import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import fs from "fs";
import os from "os";
import path from "path";
const InvestApyIdl = require("../../src/config/invest_apy.json");
const DevnetTokens = require("../../src/config/devnet-tokens.json");

async function main() {
  const secretKeyString = fs.readFileSync(path.join(os.homedir(), ".config", "solana", "id.json"), "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const adminKeypair = Keypair.fromSecretKey(secretKey);
  const wallet = new anchor.Wallet(adminKeypair);
  
  const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
  anchor.setProvider(provider);

  const program = new Program(InvestApyIdl as any, provider);

  const usdcMint = new PublicKey(DevnetTokens.USDC);
  const assetId = 101; // JAVA

  const assetIdBuffer = Buffer.alloc(8);
  assetIdBuffer.writeBigUInt64LE(BigInt(assetId));

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), assetIdBuffer],
    program.programId
  );

  const [userDeposit] = PublicKey.findProgramAddressSync(
    [Buffer.from("deposit"), vaultPda.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const [usdcTokenVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault"), vaultPda.toBuffer()],
    program.programId
  );

  const userUsdc = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);

  const amountBase = new anchor.BN(25 * 1_000_000); // 25 USDC

  console.log(`Testing investment for wallet ${wallet.publicKey.toBase58()}...`);
  console.log(`Vault PDA: ${vaultPda.toBase58()}`);
  console.log(`User USDC: ${userUsdc.toBase58()}`);
  console.log(`USDC Token Vault: ${usdcTokenVault.toBase58()}`);

  try {
    const sig = await program.methods
      .depositUsdc(amountBase)
      .accounts({
        vault: vaultPda,
        userDeposit: userDeposit,
        user: wallet.publicKey,
        userUsdc: userUsdc,
        usdcTokenVault: usdcTokenVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    
    console.log("Success! Transaction signature:", sig);
  } catch (e) {
    console.error("Simulation failed!");
    console.error(e);
  }
}

main().catch(console.error);
