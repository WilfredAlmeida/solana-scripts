# Solana Scripts
This repo contains miscellaneous scripts to speed up your Solana development. Just pick a file and run it. There's a list of all files at the end.

### Getting Started
You can clone the repo and run the scripts or copy paste them un you existing TypeScript environment.

1. Clone the repo
2. Install Dependencies
   ```pnpm install```
3. Add env variables
4. Run a Script
   ```npx tsx scripts/nft/pullAllAirdroppedAddresses.ts```

**Environment Variables**
Place these in `.env` or equivalent file
- `RPC_URL`
- `DAS_URL`
- `HELIUS_ENRICHED_URL`
- `HELIUS_API_KEY`


### Contributing/Support
Contributions are welcome. Please open an issue before contributing.  
**Important:** Please keep your code readable and documented and add sufficient information about your script in the table below. 


### Support
Open an issue or DM Wilfred on [Twitter/X](https://twitter.com/WilfredAlmeida_) for support.

### List of Scripts
| Script Purpose | Script Path |
| --- | --- |
| Saves all the addresses an NFT was airdropped to in a CSV file | `scripts/nft/pullAllAirdroppedAddresses.ts` |
| Saves all the addresses of holders of an NFT collection to in a CSV file | `scripts/nft/pullAllNftHolders.ts` |
| Saves all the addresses that hold multiple NFTs of a collection to in a CSV file | `scripts/nft/pullAllMultipleNftHolders.ts` |
| Saves all the holders of a token to in a CSV file | `scripts/nft/pullAllTokenHolders.ts` |
