Ethereum Deposit Tracker

Overview

This project is a real-time Ethereum deposit tracker that listens for new deposits to the Ethereum Beacon chain deposit contract. It uses the Alchemy API to interact with the Ethereum blockchain, sends notifications to Telegram, and logs data into InfluxDB.

Features

Real-time Ethereum Deposit Tracking: Listens for DepositEvent on the Beacon Deposit Contract.
Telegram Notifications: Sends instant notifications to a specified Telegram chat.
Data Logging: Optionally logs deposit data into InfluxDB for future analysis.
Safe and Configurable: Uses environment variables for sensitive data.
Prerequisites

Make sure you have the following installed:

Node.js (v14 or later)
Alchemy API Key (Sign up at Alchemy)
Telegram Bot Token (Create a bot via BotFather)
InfluxDB setup (optional)
Getting Started

1. Clone the Repository
bash
Copy code
git clone https://github.com/yourusername/ethereum-deposit-tracker.git
cd ethereum-deposit-tracker
2. Install Dependencies
bash
Copy code
npm install
3. Configure Environment Variables
Create a .env file in the root of the project and add the following:

bash
Copy code
ALCHEMY_API_KEY=your-alchemy-api-key
TELEGRAM_CHAT_ID=your-telegram-chat-id
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
4. Run the Application
bash
Copy code
npm start
The application will start listening for Ethereum deposit events and send Telegram notifications upon detection.

Project Structure

index.js: Main file that tracks deposits, handles notifications, and logs data.
.env: Stores API keys and configuration details.
package.json: Contains project dependencies.
How It Works

Ethereum Network Connection: The app connects to the Ethereum network using the Alchemy API via ethers.js. It listens for the DepositEvent on the Beacon Deposit Contract.
Telegram Bot Integration: When a deposit event is detected, the details (e.g., block number, transaction hash) are sent as a message to a configured Telegram chat.
InfluxDB Logging: Optionally, the deposit data is written to an InfluxDB bucket for future analysis.
Example Telegram Message

yaml
Copy code
🚨 New Ethereum Deposit Detected 🚨
Block Number: 12345678
Timestamp: Mon, 11 Sep 2024 12:34:56 GMT
Transaction Hash: 0xabcdef1234567890
Fee: 0.02 ETH
Public Key: 0x1234abcd5678efgh
InfluxDB Integration (Optional)

If you want to log deposits to an InfluxDB instance, uncomment the relevant lines in the handleDeposit function:

javascript
Copy code
const point = new Point('Deposit')
  .tag('pubkey', deposit.pubkey)
  .intField('blockNumber', deposit.blockNumber)
  .timestamp(new Date())
  .floatField('fee', deposit.fee)
  .stringField('hash', deposit.transactionHash);

writeApi.writePoint(point);
writeApi.close().then(() => {
  console.log('Deposit added to InfluxDB');
});
Make sure to configure your InfluxDB connection details in the index.js file.

Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

License

This project is licensed under the MIT License.

Acknowledgments

ethers.js for the Ethereum integration.
node-telegram-bot-api for Telegram integration.
InfluxDB for data storage.




LINK: to the comprehensive docs: https://khushbajaj2003.atlassian.net/wiki/external/M2ViODI3Y2FiN2RmNDY0MmJiMGNiM2I3MTc2ZTA3N2Q
