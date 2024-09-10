import { ethers } from 'ethers';

import fs from 'fs';

import dotenv from 'dotenv';

import { createInterface } from 'readline';

import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const BEACON_DEPOSIT_CONTRACT = '0x00000000219ab540356cBB839Cbe05303d7705Fa';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const TELEGRAM_BOT_TOKEN = '7206534568:AAH2MULbd_m_SxkuEmiR1_kc6zZXAH6wPk4';

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!ALCHEMY_API_KEY || !TELEGRAM_CHAT_ID) {

console.error('Missing environment variables. Please check your .env file.');

process.exit(1);

}

const ALCHEMY_HTTP = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const provider = new ethers.JsonRpcProvider(ALCHEMY_HTTP);

// Initialize Telegram bot

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const ABI = [

"event DepositEvent(bytes pubkey, bytes withdrawal_credentials, bytes amount, bytes signature, bytes index)"

];

const contract = new ethers.Contract(BEACON_DEPOSIT_CONTRACT, ABI, provider);

// Helper function to safely convert BigInt to string

function bigIntToString(value) {

return typeof value === 'bigint' ? value.toString() : value;

}

// Function to send Telegram notification

async function sendTelegramNotification(deposit) {

const message = `

🚨 New Ethereum Deposit Detected 🚨

Block Number: ${deposit.blockNumber}

Timestamp: ${new Date(Number(deposit.blockTimestamp) * 1000).toUTCString()}

Transaction Hash: ${deposit.hash}

Fee: ${ethers.formatEther(deposit.fee)} ETH

Public Key: ${deposit.pubkey}

`;

try {

await bot.sendMessage(TELEGRAM_CHAT_ID, message);

console.log('Telegram notification sent successfully');

} catch (error) {

console.error('Error sending Telegram notification:', error);

}

}

async function handleDeposit(pubkey, withdrawal_credentials, amount, signature, index, event) {

try {

const block = await event.getBlock();

const transaction = await event.getTransaction();

const deposit = {

blockNumber: event.blockNumber,

blockTimestamp: bigIntToString(block.timestamp),

fee: bigIntToString(transaction.gasPrice * transaction.gasLimit),

hash: event.transactionHash,

pubkey: ethers.hexlify(pubkey)

};

console.log('New deposit:', JSON.stringify(deposit, (key, value) => bigIntToString(value), 2));

saveDeposit(deposit);

await sendTelegramNotification(deposit);

} catch (error) {

console.error('Error handling deposit:', error);

}

}

function saveDeposit(deposit) {

const data = JSON.stringify(deposit, (key, value) => bigIntToString(value), 2);

fs.appendFileSync('deposits.json', data + ',\n');

}

async function trackDeposits() {

console.log('Starting to track deposits...');

try {

// Initial block number

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

}, 12000); // Check every 12 seconds (average Ethereum block time)

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

}

// Start tracking

trackDeposits().catch(console.error);