import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import mockAmmIdl from "../config/mock_amm.json";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });

    const programId = new anchor.web3.PublicKey("G2C4aXbXvPQRq2vyLKrjQskxskEVAehNepaSiEnRPvpF");
    return new Program(mockAmmIdl as any, provider);
  }, [connection, wallet]);

  return program;
}
