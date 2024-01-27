import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { promises as fs } from "fs";
import path from "path";
import { URL } from "url";
import dotenv from "dotenv";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const dasUrl = process.env.DAS_URL;

if (!dasUrl) {
  throw new Error("DAS_URL is not defined in environment variables");
}

const getNftHoldersFromCollectionMint = async (
  collectionMintAddress: PublicKey
): Promise<string[]> => {
  let page = 1;
  const holderAddresses: string[] = [];

  while (true) {
    const { data } = await axios.post(dasUrl, {
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByGroup",
      params: {
        groupKey: "collection",
        groupValue: collectionMintAddress.toBase58(),
        page,
        limit: 1000,
      },
    });
    if (data.result.total === 0) break;

    data.result.items.map((asset: any) =>
      holderAddresses.push(asset.ownership.owner)
    );
    page++;
  }
  return holderAddresses;
};

const main = async () => {
  const collectionMintAddress = new PublicKey(
    "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w"
  );

  const holderAddresses = await getNftHoldersFromCollectionMint(
    collectionMintAddress
  );

  console.log(`Found ${holderAddresses.length} holders`);

  await fs.writeFile(
    `${path.join(
      __dirname,
      "../../output",
      `${collectionMintAddress.toBase58()}.csv`
    )}`,
    holderAddresses.join("\n")
  );
};

main();
