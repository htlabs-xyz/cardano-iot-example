# IoT + Blockchain Integration: DHT22 Sensor Data on Cardano

A practical example of integrating IoT devices with blockchain technology. This project demonstrates how to read real-world sensor data from a DHT22 temperature/humidity sensor connected to Raspberry Pi 5, and store that data on-chain using the Cardano blockchain.

## 🎯 Project Overview

This repository provides a complete, working example of:
- **IoT Data Collection**: Reading temperature and humidity from DHT22 sensor via Raspberry Pi 5
- **Real-time Monitoring**: Continuous sensor data monitoring with auto-retry mechanism
- **Blockchain Integration**: Creating and submitting transactions to Cardano blockchain
- **Data Immutability**: Storing IoT sensor data permanently on-chain

### Use Cases

- Environmental monitoring with tamper-proof data storage
- Supply chain temperature tracking
- Smart home automation with blockchain verification
- IoT device data provenance and audit trails

## � Demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/khH-3ZzBanU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## �🔄 How It Works

```
      ┌─────────────────┐
      │   DHT22 Sensor  │ (Temperature & Humidity)
      │   GPIO 4, Pin 7 │
      └────────┬────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Raspberry Pi 5                   │
│  ┌───────────────────────────────┐  │
│  │  Python Script (read_dht22.py)│  │
│  │  • Read sensor via GPIO       │  │
│  │  • Return JSON data           │  │
│  └──────────┬────────────────────┘  │
│             │                       │
│             ▼                       │
│  ┌───────────────────────────────┐  │
│  │  Node.js (index.js)           │  │
│  │  • Collect sensor data        │  │
│  │  • Format for blockchain      │  │
│  │  • Auto retry on errors       │  │
│  └──────────┬────────────────────┘  │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│    Cardano Blockchain               │
│  ┌───────────────────────────────┐  │
│  │  Transaction Submission       │  │
│  │  • Metadata: sensor readings  │  │
│  │  • Timestamp                  │  │
│  │  • Immutable storage          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Data Flow

1. **Sensor Reading**: DHT22 sensor measures temperature and humidity
2. **Data Collection**: Raspberry Pi reads sensor data via GPIO pins
3. **Data Processing**: Node.js formats data into JSON structure
4. **Transaction Creation**: Data is embedded into Cardano transaction metadata
5. **On-Chain Storage**: Transaction is submitted to Cardano blockchain
6. **Verification**: Data is permanently stored and publicly verifiable

## 🚀 Quick Start

```bash
# 1. Install Python dependencies
sudo pip3 install rpi-lgpio adafruit-circuitpython-dht --break-system-packages

# 2. Install Node.js dependencies
npm install

# 3. Configure GPIO permissions (one-time setup)
sudo usermod -a -G gpio $USER
sudo reboot

# 4. Run IoT monitor
npm start
```

## 🔧 Hardware Setup

### Components Required

- **Raspberry Pi 5** (or any Raspberry Pi with GPIO)
- **DHT22 Sensor** (AM2302 - Temperature & Humidity sensor)
- **Jumper Wires** (3 wires: Power, Data, Ground)
- **Optional**: 10kΩ pull-up resistor for Data line

### Wiring Diagram

```
DHT22 Sensor          Raspberry Pi 5
┌─────────┐           ┌──────────────┐
│    +    │ ────────► │ Pin 1 (3.3V) │
│         │           │              │
│  Data   │ ────────► │ Pin 7 (GPIO4)│
│         │           │              │
│    -    │ ────────► │ Pin 9 (GND)  │
└─────────┘           └──────────────┘
```

### Connection Table

| DHT22 Pin | Raspberry Pi Pin | GPIO | Description |
|-----------|------------------|------|-------------|
| **+** (VCC) | Pin 1 | 3.3V | Power supply |
| **Data** | Pin 7 | GPIO 4 | Data signal |
| **-** (GND) | Pin 9 | GND | Ground |

**⚠️ Important:** 
- Always use **3.3V**, NOT 5V - Using 5V may damage your Raspberry Pi
- Power off Raspberry Pi before connecting/disconnecting sensors

## 📦 Installation

### Prerequisites

- **Hardware**: Raspberry Pi 5 (or any model with GPIO)
- **OS**: Raspberry Pi OS (Debian-based)
- **Node.js**: v16.x or higher
- **Python**: 3.7 or higher
- **Network**: Internet connection for blockchain transactions

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd iot1
```

### Step 2: Install System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip build-essential python3-dev nodejs npm
```

### Step 3: Install Python Libraries

```bash
# Install DHT22 sensor libraries
sudo pip3 install rpi-lgpio adafruit-circuitpython-dht --break-system-packages
```

### Step 4: Install Node.js Dependencies

```bash
npm install
```

### Step 5: Configure GPIO Permissions

To run without `sudo`, add your user to the `gpio` group:

```bash
sudo usermod -a -G gpio $USER
sudo reboot  # Required for group changes to take effect
```

### Step 6: Configure Cardano Wallet (Optional)

If you want to submit transactions to Cardano blockchain, create a `.env` file:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your Blockfrost API key and wallet mnemonic:

```bash
BLOCKFROST_API_KEY=your_blockfrost_api_key
MNEMONIC="your mnemonic phrase goes here"
```

**How to get credentials:**
- **Blockfrost API Key**: Sign up at [blockfrost.io](https://blockfrost.io) and create a project
- **Mnemonic**: Your 12/15/24-word wallet recovery phrase

**⚠️ Security Warning:** Never commit `.env` file to version control!

### Step 7: Verify Installation

```bash
# Test sensor reading
python3 dht22.py
# Expected output: {"temperature": 23.9, "humidity": 78.6}

# Test with npm
npm test

# Verify GPIO permissions
groups | grep gpio

# Test Node.js environment
node --version
npm --version
```

## 💻 Usage Guide

This project provides 3 main operating modes:

### 1️⃣ Basic Mode: Sensor Data Monitoring

**Purpose:** Continuously read and display temperature/humidity data from DHT22 sensor.

**How to run:**

```bash
# Run continuous monitoring (reads every 0.5 seconds)
npm start

# Or run with auto-reload (for development)
npm run dev
```

**Expected Output:**

```
========================================
DHT22 Real-Time Sensor Monitor
========================================
Connection Details:
  Positive -> 3.3V (Pin 1)
  Out      -> GPIO 4 (Pin 7)
  Negative -> GND (Pin 9)
========================================
Read Interval: 3 seconds
Press Ctrl+C to stop
========================================

[8:15:48 PM] ✓ Reading #1 | Temp: 23.9°C | Humidity: 78.6%
[8:15:54 PM] ✓ Reading #2 | Temp: 23.9°C | Humidity: 78.1%
[8:15:58 PM] ✓ Reading #3 | Temp: 24.0°C | Humidity: 78.1%
[8:16:01 PM] ✓ Reading #4 | Temp: 23.9°C | Humidity: 78.1%
```

**Stop the program:** Press `Ctrl+C`

```
========================================
📊 Session Statistics
========================================
Total readings: 262
Successful: 260
Failed: 2
Success rate: 99.2%
========================================
DHT22 Monitor stopped
========================================
```

**Symbol Explanations:**
- ✓ : Successful reading
- ⟳ : Retrying due to temporary error
- ✗ : Failed after all retry attempts

---

### 2️⃣ One-time Read Mode

**Purpose:** Quick check of current sensor data.

```bash
# Using Python (direct)
python3 dht22.py
# Output: {"temperature": 23.9, "humidity": 78.6}

# Using Node.js wrapper
npm run ms
# Output: { temperature: 23.9, humidity: 78.7 }

# Or use npm test
npm test
```

**When to use:**
- Test if sensor is working
- Debug hardware connections
- Get quick values without continuous monitoring

---

### 3️⃣ Advanced Mode: Write Data to Blockchain

**Purpose:** Read sensor and write data to Cardano blockchain (automatically every 2 minutes).

**Step 1: Check configuration**

```bash
# Check if .env file has all required information
cat .env
```

The `.env` file must contain:
```bash
BLOCKFROST_API_KEY=preprod...your_key_here
MNEMONIC="word1 word2 word3 ... word12"
```

**Step 2: Run blockchain write script**

```bash
npm start -- --write
```

**Expected Output:**

```
╔══════════════════════════════════════════════════════════╗
║       📤 BLOCKCHAIN TRANSACTION - WRITE DATA           ║
╚══════════════════════════════════════════════════════════╝
⏰ Time: 11/4/2025, 8:15:48 PM

📡 Step 1/5: Reading sensor data...
   ✓ Temperature: 23.9°C
   ✓ Humidity: 78.6%

🔨 Step 2/5: Building transaction...
   • Sensor Name: dht22_sensor_01
   • Temperature (on-chain): 23900 (23.9°C × 1000)
   • Humidity (on-chain): 78600 (78.6% × 1000)

   ✓ Transaction built successfully

✍️  Step 3/5: Signing transaction...
   ✓ Transaction signed

📤 Step 4/5: Submitting to Cardano Preprod network...
   ✓ Transaction submitted!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Transaction Hash:
   a1b2c3d4e5f6789abcdef...

🌐 View on Explorer:
   https://preprod.cexplorer.io/tx/a1b2c3d4e5f6789abcdef...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Step 5/5: Waiting for blockchain confirmation...
   ✓ Transaction confirmed on blockchain!

✅ SUCCESS: Data written to Cardano blockchain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Next submission in 2 minutes...
```

**Data stored on blockchain:**

```typescript
// Data format in smart contract
{
  sensorName: 'dht22_sensor_01',
  temperature: 23900,  // = 23.9°C × 1000
  humidity: 78600      // = 78.6% × 1000
}
```

**View transaction on blockchain:**
- **Testnet (Preprod):** https://preprod.cexplorer.io/tx/YOUR_TX_HASH
- **Mainnet:** https://cexplorer.io/tx/YOUR_TX_HASH

**Important Notes:**
- Script runs continuously every 2 minutes
- Each transaction costs ~0.2 ADA gas fee
- Ensure wallet has sufficient ADA balance (minimum 2-3 ADA)
- Data is stored permanently on blockchain and cannot be deleted

---

### 4️⃣ Read Data from Blockchain

**Purpose:** View historical sensor data stored on blockchain.

```bash
# Monitor blockchain data (updates every 30 seconds)
npm run monitor
```

**Expected Output:**

```
╔══════════════════════════════════════════════════════════╗
║       � BLOCKCHAIN QUERY - READ DATA                  ║
╚══════════════════════════════════════════════════════════╝

�🔍 Querying Cardano blockchain...
   • Sensor: dht22_sensor_01
   • Policy ID: d5e6f7a8b9c0d1e2f3...

� Fetching transactions...
   ✓ Found 145 transactions

⚙️  Processing transaction data...
   • Processed 10/145 transactions...
   • Processed 20/145 transactions...
   ...
   • Processed 140/145 transactions...
   ✓ Successfully processed 145 records

✅ Query completed successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Showing 5 most recent records:

📝 Record #141
   Time: 11/4/2025, 8:00:00 PM
   Temperature: 23.8°C
   Humidity: 78.5%
   Transaction: https://preprod.cexplorer.io/tx/abc123...

📝 Record #142
   Time: 11/4/2025, 8:02:00 PM
   Temperature: 23.9°C
   Humidity: 78.6%
   Transaction: https://preprod.cexplorer.io/tx/def456...

[... 3 more records ...]

⏰ Refreshing in 30 seconds...
```

---

### 5️⃣ Auto Retry Feature

The system automatically retries when sensor read errors occur:

**Successful retry example:**

```
[8:20:10 PM] ⟳ Retry 1/5 - Sensor timeout
[8:20:12 PM] ⟳ Retry 2/5 - Timed out waiting for PulseIn on START
[8:20:14 PM] ✓ Reading #5 | Temp: 23.9°C | Humidity: 78.6%
   └─ Success after 2 retries
```

**Failed retry example:**

```
[8:20:20 PM] ⟳ Retry 1/5 - Sensor timeout
[8:20:22 PM] ⟳ Retry 2/5 - No response
[8:20:24 PM] ⟳ Retry 3/5 - Timeout
[8:20:26 PM] ⟳ Retry 4/5 - RuntimeError
[8:20:28 PM] ⟳ Retry 5/5 - Sensor timeout
[8:20:30 PM] ✗ Failed after 5 attempts: Sensor communication error
```

**Retry configuration:**
- Maximum retry attempts: **5 times**
- Delay between retries: **2 seconds**
- Maximum total timeout: **~12 seconds**

---

### 📋 Command Summary

| Command | Purpose | Runs Forever? |
|---------|---------|---------------|
| `npm run write` | Write to blockchain | ✅ Yes (every 2 min) |
| `npm run monitor` | Read from blockchain | ✅ Yes (every 30s) |
| `npm run sensor` | Test sensor directly | ❌ No |

---
### Blockchain Submission Interval

Edit `write.ts` to change how often data is submitted to blockchain:

```typescript
const intervalMs = 2 * 60 * 1000; // Current: 2 minutes
// const intervalMs = 5 * 60 * 1000;  // 5 minutes
// const intervalMs = 10 * 60 * 1000; // 10 minutes
```

### GPIO Pin Configuration

Edit `dht22.py` to use a different GPIO pin:

```python
board_pin = board.D4  # Current: GPIO 4 (Pin 7)
# board_pin = board.D17  # GPIO 17 (Pin 11)
# board_pin = board.D27  # GPIO 27 (Pin 13)
```

### Blockchain Configuration

Configure blockchain settings in `.env` file:

```bash
# Blockfrost API (Get from https://blockfrost.io)
BLOCKFROST_API_KEY=your_blockfrost_api_key

# Wallet Mnemonic (24 words)
MNEMONIC="your mnemonic phrase goes here"
```

**Blockfrost vs Local Node:**
- **Blockfrost** (Recommended): Easy API access, no node setup required
- **Local Node**: More decentralized, requires running cardano-node

## 🐛 Troubleshooting

### Sensor Issues

**Problem: ModuleNotFoundError: No module named 'adafruit_dht'**

```bash
sudo pip3 install rpi-lgpio adafruit-circuitpython-dht --break-system-packages
```

**Problem: Permission denied (GPIO access)**

```bash
sudo usermod -a -G gpio $USER
sudo reboot

# Verify group membership
groups | grep gpio
```

**Problem: Failed to read sensor after 5 attempts**

Check the following:
- ✓ Verify wiring connections (especially Data pin to GPIO 4)
- ✓ Confirm using 3.3V, NOT 5V
- ✓ Increase READ_INTERVAL to 5000ms or higher
- ✓ Try different GPIO pin (GPIO 17, 27)
- ✓ Restart Raspberry Pi
- ✓ Test with: `python3 dht22.py` or `npm test`

**Problem: RuntimeError: Timed out**

This is normal for DHT22 sensors. The script will auto-retry. If persistent:

```bash
# Check power supply (undervoltage can cause issues)
vcgencmd get_throttled

# Check CPU temperature (overheating can affect GPIO)
vcgencmd measure_temp

# Test sensor directly
python3 dht22.py

# Try reading multiple times
for i in {1..5}; do python3 dht22.py; sleep 3; done
```

### Blockchain Issues

**Problem: Transaction submission failed**

Check:
- ✓ `.env` file exists with valid `BLOCKFROST_API_KEY` and `MNEMONIC`
- ✓ Blockfrost API key is for correct network (testnet/mainnet)
- ✓ Wallet has sufficient ADA balance (min 2 ADA for testnet)
- ✓ Mnemonic phrase is correct (12/15/24 words)
- ✓ Network connectivity to Blockfrost API

**Problem: Invalid metadata format**

Ensure sensor data is valid JSON:
```bash
# Test sensor output
python3 dht22.py | jq .

# Expected output:
# {
#   "temperature": 23.9,
#   "humidity": 78.6
# }
```


## 📁 Project Structure

```
iot1/
├── index.ts              # Main sensor monitoring application
├── write.ts              # Blockchain data submission script
├── read.ts               # Read blockchain data
├── read-sensor.ts        # Simple sensor reading script
├── dht22.py              # Python script for DHT22 sensor (GPIO)
├── sensor.ts             # TypeScript sensor interface
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
├── plutus.json           # Cardano smart contract config
├── .env                  # Environment variables (Blockfrost, mnemonic)
├── .env.example          # Environment template
├── action/               # Blockchain transaction handlers
│   ├── claim.ts          # Claim transaction logic
│   ├── read.ts           # Read on-chain data
│   └── write.ts          # Write data to blockchain
├── scripts/              # Smart contract utilities
│   ├── index.ts          # Contract exports
│   └── mesh.ts           # Cardano Mesh SDK integration
└── README.md             # This documentation
```

### Key Files

- **`index.ts`**: Main monitoring app - reads sensor every 3 seconds with retry mechanism
- **`write.ts`**: Submits sensor data to Cardano blockchain every 2 minutes
- **`dht22.py`**: Python script that interfaces with DHT22 via GPIO 4
- **`sensor.ts`**: TypeScript wrapper for Python sensor communication
- **`read-sensor.ts`**: Simple one-time sensor reading script
- **`action/write.ts`**: Creates and submits Cardano transactions with sensor data
- **`action/read.ts`**: Queries blockchain for historical sensor data
- **`scripts/mesh.ts`**: Smart contract wrapper using Mesh SDK
- **`plutus.json`**: Smart contract configuration for on-chain validation
- **`.env`**: Stores Blockfrost API key and wallet mnemonic (never commit!)

## 🔍 How Blockchain Integration Works

### Transaction Creation Process

1. **Read Sensor Data**: Node.js calls Python script to read DHT22
2. **Format Metadata**: Sensor data is formatted as Cardano transaction metadata
3. **Build Transaction**: Use Cardano SDK to construct transaction with metadata
4. **Sign Transaction**: Sign with wallet private key
5. **Submit to Network**: Broadcast to Cardano blockchain
6. **Confirmation**: Wait for transaction confirmation


### Querying On-Chain Data

```typescript
// Example: Read historical sensor data from blockchain
import { readSensorData } from './action/read';

const txHash = "abc123...";
const sensorData = await readSensorData(txHash);
console.log(sensorData);
```

### System Diagnostics

```bash
# Check GPIO status
gpio readall

# Monitor CPU temperature
watch vcgencmd measure_temp

# Check power supply status
vcgencmd get_throttled

# View system logs
journalctl -f
```

## 🎓 Learning Resources

### IoT & Raspberry Pi
- [Raspberry Pi GPIO Documentation](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [DHT22 Sensor Datasheet](https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf)
- [Adafruit DHT Library Guide](https://learn.adafruit.com/dht)

### Cardano Blockchain
- [Cardano Documentation](https://docs.cardano.org/)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Mesh SDK Documentation](https://meshjs.dev/)
- [Transaction Metadata Standard](https://cips.cardano.org/cips/cip20/)

### Example Use Cases
- Supply chain temperature monitoring
- Environmental data marketplaces
- Decentralized sensor networks
- IoT device authentication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.


## 📄 License

ISC

## 🔐 Security Notes

- **Never commit `.env` file to version control** - Add to `.gitignore`
- Never share your mnemonic phrase with anyone
- Use Blockfrost API keys with appropriate permissions
- Store mnemonic securely (consider hardware wallets for mainnet)
- Test on Cardano testnet before mainnet deployment
- Regularly update dependencies for security patches
- Monitor transaction costs and wallet balance on mainnet
- Use separate wallets for testing and production

## ⚡ Performance Tips

- Batch multiple readings into single blockchain transaction to save fees
- Use local Cardano node for faster transaction submission
- Implement data validation before submitting to blockchain
- Consider using IPFS for large data payloads (store hash on-chain)

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check [Troubleshooting](#-troubleshooting) section
- Review [Cardano Stack Exchange](https://cardano.stackexchange.com/)

---

**Built with ❤️ using Raspberry Pi 5 and Cardano Blockchain**
