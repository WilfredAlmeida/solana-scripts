import { Connection, PublicKey, type ParsedAccountData } from "@solana/web3.js";
import { promises as fs } from "fs";
import path from "path";
import { URL } from "url";
import dotenv from "dotenv";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
  throw new Error("RPC_URL is not defined in environment variables");
}

const main = async () => {
  const connection = new Connection(rpcUrl!);

  const tokenAddress = "7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs";

  const holderAddresses: string[] = [];

  const programAccounts = await connection.getParsedProgramAccounts(
    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    {
      filters: [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 0,
            bytes: tokenAddress,
          },
        },
      ],
    }
  );

  for (const programAccount of programAccounts) {
    const data = programAccount.account.data as ParsedAccountData;
    if (data.parsed.info.tokenAmount.uiAmount > 0) {
      holderAddresses.push(data.parsed.info.owner);
      // console.log(data.parsed.info.owner);
    }
  }

  await fs.writeFile(
    `${path.join(__dirname, "../../output", `${tokenAddress}.csv`)}`,
    holderAddresses.join("\n")
  );
};

main();
