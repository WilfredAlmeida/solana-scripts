import { Connection, PublicKey } from "@solana/web3.js";
import { promises as fs } from "fs";
import path from "path";
import { URL } from "url";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const rpcUrl = process.env.RPC_URL;
const heliusEnrichedApiUrl = process.env.HELIUS_ENRICHED_URL;
const heliusApiKey = process.env.HELIUS_API_KEY;
if (!rpcUrl || !heliusEnrichedApiUrl || !heliusApiKey) {
  throw new Error(
    "RPC_URL or HELIUS_ENRICHED_URL or HELIUS_API_KEY is not defined in environment variables"
  );
}

const connection = new Connection(rpcUrl!);

const getAllTransactionSignaturesForAddress = async (
  collectionMint: PublicKey
): Promise<string[]> => {
  let lastReceivedTransactionSignature = "";

  const transactionSignatures: string[] = [];

  while (true) {
    const signaturesForAddress = await connection.getSignaturesForAddress(
      collectionMint,
      {
        before: lastReceivedTransactionSignature
          ? lastReceivedTransactionSignature
          : undefined,
        limit: 1000,
      }
    );

    lastReceivedTransactionSignature =
      signaturesForAddress[signaturesForAddress.length - 1].signature;

    const signatures = signaturesForAddress.map(
      (signatureObj) => signatureObj.signature
    );

    transactionSignatures.push(...signatures);

    if (signaturesForAddress.length < 1000) {
      break;
    }
  }

  return transactionSignatures;
};

const getParsedTransactions = async (transactionSignatures: string[]) => {
  const result = await axios.post(
    `${heliusEnrichedApiUrl}/v0/transactions/?api-key=${heliusApiKey}`,
    {
      transactions: transactionSignatures,
    }
  );

  return result.data;
};

const getAirdroppedAddresses = async (collectionMint: PublicKey) => {
  const airdroppedAddresses: string[] = [];

  const transactionSignatures = await getAllTransactionSignaturesForAddress(
    collectionMint
  );

  const batchSize = 100; // 100 is the max batch size for Helius transaction parser API
  for (let i = 0; i < transactionSignatures.length; i += batchSize) {
    const parsedTransactions = await getParsedTransactions(
      transactionSignatures.slice(i, i + batchSize)
    );

    // Depending on your transaction, you might need to adjust the following code to query the correct fields
    // This code works for cNFT minting transactions via Underdog Protocol
    // To adjust this code, call the Helius API and inspect the response
    const addresses = parsedTransactions.map((parsedTransaction: any) => {
      const compressedEvents = parsedTransaction.events.compressed;

      if (compressedEvents) {
        for (let j = 0; j < compressedEvents.length; j++) {
          const compressedEvent = compressedEvents[j];

          if (compressedEvent.type === "COMPRESSED_NFT_MINT") {
            return compressedEvent.newLeafOwner;
          }
        }
      }
    });

    airdroppedAddresses.push(...addresses);
  }

  return airdroppedAddresses.filter((address) => !!address);
};

const main = async () => {
  const collectionMint = new PublicKey(
    "AYED8JzJmMzq3rX61q1WsziKHtuUCLPEHK5673bWjnXr"
  );

  const airdroppedAddresses = await getAirdroppedAddresses(collectionMint);

  console.log(`Found ${airdroppedAddresses.length} airdropped addresses`);

  // Remove duplicate addresses
  // const uniqueAirdroppedAddresses = Array.from(new Set(airdroppedAddresses));

  await fs.writeFile(
    `${path.join(
      __dirname,
      "../../output",
      `${collectionMint.toBase58()}.csv`
    )}`,
    airdroppedAddresses.join("\n")
  );
};

main();
