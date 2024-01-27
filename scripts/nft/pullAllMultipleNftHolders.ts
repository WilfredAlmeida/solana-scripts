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

const findMultipleAddresses = (addresses: string[]) => {
  const visitedAddresses: string[] = [];
  const multipleAddresses: string[] = [];

  for (let address of addresses) {
    if (
      visitedAddresses.includes(address) &&
      !multipleAddresses.includes(address)
    ) {
      multipleAddresses.push(address);
    } else {
      visitedAddresses.push(address);
    }
  }

  return multipleAddresses;
};

const main = async () => {
  const collectionMintAddress = new PublicKey(
    "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w"
  );

  const holderAddresses = await getNftHoldersFromCollectionMint(
    collectionMintAddress
  );

  const multipleHolderAddresses = findMultipleAddresses(holderAddresses);

  console.log(`Found ${multipleHolderAddresses.length} multiple holders`);

  await fs.writeFile(
    `${path.join(
      __dirname,
      "../../output",
      `multiples_${collectionMintAddress.toBase58()}.csv`
    )}`,
    multipleHolderAddresses.join("\n")
  );
};

main();
