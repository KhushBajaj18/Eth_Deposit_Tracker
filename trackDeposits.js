import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';
import { createInterface } from 'readline';
import { writeDepositToInflux, queryData } from './influxClient.js';

dotenv.config();

const BEACON_DEPOSIT_CONTRACT = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

if (!ALCHEMY_API_KEY) {
  console.error('ALCHEMY_API_KEY is not set. Please check your .env file.');
  process.exit(1);
}

const ALCHEMY_HTTP = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const provider = new ethers.JsonRpcProvider(ALCHEMY_HTTP);

const ABI = [
  "event DepositEvent(bytes pubkey, bytes withdrawal_credentials, bytes amount, bytes signature, bytes index)"
];

const contract = new ethers.Contract(BEACON_DEPOSIT_CONTRACT, ABI, provider);

// Helper function to safely convert BigInt to string
const bigIntToString = (value) => typeof value === 'bigint' ? value.toString() : value;

const handleDeposit = async (pubkey, withdrawal_credentials, amount, signature, index, event) => {
  try {
    const block = await event.getBlock();
    const deposit = {
      blockNumber: event.blockNumber,
      blockTimestamp: parseInt(block.timestamp),
      amount: parseFloat(ethers.utils.formatEther(amount)),
      hash: event.transactionHash,
      pubkey: ethers.hexlify(pubkey)
    };

    console.log('New deposit:', JSON.stringify(deposit, null, 2));
    writeDepositToInflux(deposit); // Save to InfluxDB
  } catch (error) {
    console.error('Error handling deposit:', error);
  }
};

const trackDeposits = async () => {
  console.log('Starting to track deposits...');
  try {
    let lastBlockNumber = await provider.getBlockNumber();
    console.log('Current block number:', lastBlockNumber);

    // Set up the event listener
    contract.on("DepositEvent", handleDeposit);

    // Periodically check for new blocks
    const blockCheckInterval = setInterval(async () => {
      try {
        const currentBlockNumber = await provider.getBlockNumber();
        if (currentBlockNumber > lastBlockNumber) {
          console.log('New block:', currentBlockNumber);
          lastBlockNumber = currentBlockNumber;
        }
      } catch (error) {
        console.error('Error checking block number:', error);
      }
    }, 12000); // Check every 12 seconds

    // Keep the script running
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Press Enter to stop tracking...', () => {
      clearInterval(blockCheckInterval);
      contract.removeAllListeners();
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error setting up deposit tracking:', error);
    process.exit(1);
  }
};

// Start tracking
trackDeposits().catch(console.error);

// Example: Query data after some time
setTimeout(queryData, 60000); // Query data after 1 minute
