import axios from "axios";
import * as dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { URL } from "url";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
  throw new Error("RPC_URL is not defined in environment variables");
}

async function fetchCompressedNfts(walletAddress: string): Promise<any[]> {
  const body = {
    jsonrpc: '2.0',
    id: 'fetch-solana-assets',
    method: 'searchAssets',
    params: {
      ownerAddress: walletAddress,
      tokenType: 'all',
      displayOptions: {
        showNativeBalance: true,
        showInscription: true,
        showCollectionMetadata: true,
      },
    },
  };

  const maxRetries: number = 3;
  let retryCount: number = 0;
  let delayTime: number = 1000;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post(rpcUrl, body);
      if (response.data && response.data.result) {
        const items = response.data.result.items;
        const compressedNfts = items.filter((item: any) => item.compression?.compressed);

        return compressedNfts;
      }
      return [];
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        console.log(`Rate limit hit, retrying after ${delayTime}ms...`);
        await delay(delayTime);
        retryCount++;
        delayTime *= 2;
      } else {
        console.error('Error fetching Solana assets:', error);
        throw new Error('Failed to fetch Solana assets');
      }
    }
  }
  throw new Error('Failed to fetch Solana assets after multiple attempts');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {
  const walletAddress = 'YourWalletAddressHere';
  try {
    const compressedNfts = await fetchCompressedNfts(walletAddress);
    console.log(compressedNfts);
    await fs.writeFile(
      `${path.join(__dirname, "../../output", "compressedNfts.json")}`,
      JSON.stringify(compressedNfts, null, 2)
    );
    console.log('Compressed NFTs data saved successfully.');
  } catch (error) {
    console.error('Failed to fetch and save compressed NFTs:', error);
  }
};

main();
