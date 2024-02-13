import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

async function fetchCompressedNfts(walletAddress: string): Promise<any[]> {
  const url: string | undefined = process.env.RPC_URL;
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
      const response = await axios.post(url!, body);
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
