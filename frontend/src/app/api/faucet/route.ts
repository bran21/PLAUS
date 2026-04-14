import { NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import DevnetTokens from '../../../config/devnet-tokens.json';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const targetWallet = new PublicKey(address);
    // In production we would never put absolute paths here, but this is a local localnet/devnet mock prototype
    const homeDir = process.env.HOME || '/home/jbran';
    const secretKeyString = fs.readFileSync(path.join(homeDir, '.config', 'solana', 'id.json'), 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const adminKeypair = Keypair.fromSecretKey(secretKey);

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const usdcMint = new PublicKey(DevnetTokens.USDC);
    const idrxMint = new PublicKey(DevnetTokens.IDRX);

    const usdcAta = await getOrCreateAssociatedTokenAccount(connection, adminKeypair, usdcMint, targetWallet);
    await mintTo(connection, adminKeypair, usdcMint, usdcAta.address, adminKeypair, 10000 * 1_000_000);

    const idrxAta = await getOrCreateAssociatedTokenAccount(connection, adminKeypair, idrxMint, targetWallet);
    await mintTo(connection, adminKeypair, idrxMint, idrxAta.address, adminKeypair, 150000000 * 1_000_000);

    return NextResponse.json({ success: true, message: 'Tokens minted successfully' });
  } catch (error: any) {
    console.error("Faucet Error:", error);
    return NextResponse.json({ error: error.message || 'Mint failed' }, { status: 500 });
  }
}
