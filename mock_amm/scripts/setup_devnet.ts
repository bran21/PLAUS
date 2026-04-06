import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MockAmm } from "../target/types/mock_amm";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { createMint, createAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";
import os from "os";
import path from "path";

// Read the keypair from the default devnet location
const secretKeyString = fs.readFileSync(path.join(os.homedir(), ".config", "solana", "id.json"), { encoding: 'utf8' });
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
const walletKeypair = Keypair.fromSecretKey(secretKey);

const wallet = new anchor.Wallet(walletKeypair);
const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
});
anchor.setProvider(provider);

// Read the IDL generated from the anchor build
const idl = JSON.parse(fs.readFileSync('./target/idl/mock_amm.json', 'utf8'));

// The deployed program ID
const programId = new anchor.web3.PublicKey("G2C4aXbXvPQRq2vyLKrjQskxskEVAehNepaSiEnRPvpF");

const program = new anchor.Program(idl as any, provider);

async function setup() {
    console.log(`Setting up devnet liquidity using wallet: ${wallet.publicKey.toBase58()}`);

    // Create Tokens
    console.log("Creating Mints...");
    const usdcMint = await createMint(connection, walletKeypair, wallet.publicKey, null, 6);
    console.log(`USDC Mint: ${usdcMint.toBase58()}`);

    const idrxMint = await createMint(connection, walletKeypair, wallet.publicKey, null, 6);
    console.log(`IDRX Mint: ${idrxMint.toBase58()}`);

    const cropMint = await createMint(connection, walletKeypair, wallet.publicKey, null, 6);
    console.log(`CROP Mint: ${cropMint.toBase58()}`);

    // Create Token Accounts for Wallet
    console.log("Creating Token Accounts...");
    const usdcAccount = await createAccount(connection, walletKeypair, usdcMint, wallet.publicKey);
    const idrxAccount = await createAccount(connection, walletKeypair, idrxMint, wallet.publicKey);
    const cropAccount = await createAccount(connection, walletKeypair, cropMint, wallet.publicKey);

    // Mint tokens to Wallet
    console.log("Minting initial supply...");
    // 100,000 USDC
    await mintTo(connection, walletKeypair, usdcMint, usdcAccount, walletKeypair, 100_000 * 1_000_000);
    // 1,500,000,000 IDRX (approx $100k)
    await mintTo(connection, walletKeypair, idrxMint, idrxAccount, walletKeypair, 1_500_000_000 * 1_000_000);
    // 500,000 CROP
    await mintTo(connection, walletKeypair, cropMint, cropAccount, walletKeypair, 500_000 * 1_000_000);

    // --- IDRX/USDC Pool ---
    console.log("Setting up IDRX/USDC Pool...");
    let [idrxUsdcPoolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), idrxMint.toBuffer(), usdcMint.toBuffer()],
        program.programId
    );
    let [idrxVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_a"), idrxUsdcPoolPda.toBuffer()],
        program.programId
    );
    let [usdcVault1] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_b"), idrxUsdcPoolPda.toBuffer()],
        program.programId
    );

    await program.methods
        .initializePool()
        .accounts({
            pool: idrxUsdcPoolPda,
            mintA: idrxMint,
            mintB: usdcMint,
            vaultA: idrxVault,
            vaultB: usdcVault1,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

    // Add Liquidity: 15,000,000 IDRX / 1,000 USDC
    console.log("Adding liquidity to IDRX/USDC...");
    await program.methods
        .addLiquidity(new anchor.BN(15_000_000 * 1_000_000), new anchor.BN(1_000 * 1_000_000))
        .accounts({
            pool: idrxUsdcPoolPda,
            user: wallet.publicKey,
            userA: idrxAccount,
            userB: usdcAccount,
            vaultA: idrxVault,
            vaultB: usdcVault1,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();


    // --- CROP/USDC Pool ---
    console.log("Setting up CROP/USDC Pool...");
    let [cropUsdcPoolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), cropMint.toBuffer(), usdcMint.toBuffer()],
        program.programId
    );
    let [cropVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_a"), cropUsdcPoolPda.toBuffer()],
        program.programId
    );
    let [usdcVault2] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_b"), cropUsdcPoolPda.toBuffer()],
        program.programId
    );

    await program.methods
        .initializePool()
        .accounts({
            pool: cropUsdcPoolPda,
            mintA: cropMint,
            mintB: usdcMint,
            vaultA: cropVault,
            vaultB: usdcVault2,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

    // Add Liquidity: 10,000 CROP / 5,000 USDC
    console.log("Adding liquidity to CROP/USDC...");
    await program.methods
        .addLiquidity(new anchor.BN(10_000 * 1_000_000), new anchor.BN(5_000 * 1_000_000))
        .accounts({
            pool: cropUsdcPoolPda,
            user: wallet.publicKey,
            userA: cropAccount,
            userB: usdcAccount,
            vaultA: cropVault,
            vaultB: usdcVault2,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

    console.log("\nSetup Complete!");
    console.log("------------------------");
    console.log(`USDC Mint: ${usdcMint.toBase58()}`);
    console.log(`IDRX Mint: ${idrxMint.toBase58()}`);
    console.log(`CROP Mint: ${cropMint.toBase58()}`);
    console.log("------------------------");
    console.log("Save these addresses to update TradePanel.tsx!");

    // Save to a file for easy access by frontend
    fs.writeFileSync(
        path.join(__dirname, '..', 'frontend', 'src', 'config', 'devnet-tokens.json'),
        JSON.stringify({
            USDC: usdcMint.toBase58(),
            IDRX: idrxMint.toBase58(),
            CROP: cropMint.toBase58()
        }, null, 2)
    );
}

setup().catch(console.error);
