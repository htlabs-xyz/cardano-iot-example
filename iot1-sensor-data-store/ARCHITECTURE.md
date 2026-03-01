# System Architecture: DHT22 Sensor Data on Cardano

## 1. System Overview

This project integrates a DHT22 temperature/humidity sensor with the Cardano blockchain via Raspberry Pi 5. Sensor readings are collected in real-time, formatted, and stored as immutable on-chain data through Cardano transactions.

**Key Capabilities:**
- Real-time IoT sensor data collection (temperature & humidity)
- Automatic blockchain submission every 2 minutes
- On-chain data retrieval and historical querying
- Auto-retry mechanism (5 retries, 2-second delay)

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                           │
│  ┌──────────────┐    GPIO 4     ┌───────────────────────┐  │
│  │ DHT22 Sensor │ ────────────► │    Raspberry Pi 5     │  │
│  │ (AM2302)     │               │  - ARM Cortex-A76     │  │
│  │ Temp + Humid │               │  - Raspberry Pi OS    │  │
│  └──────────────┘               └───────────┬───────────┘  │
└─────────────────────────────────────────────┼───────────────┘
                                              │
┌─────────────────────────────────────────────┼───────────────┐
│                   SOFTWARE LAYER            │               │
│  ┌──────────────────┐                       │               │
│  │  Python Layer    │◄──────────────────────┘               │
│  │  dht22.py        │  (subprocess call)                    │
│  │  - GPIO access   │──────────────────┐                    │
│  │  - JSON output   │                  │                    │
│  └──────────────────┘                  ▼                    │
│                              ┌──────────────────┐           │
│                              │  TypeScript Layer │           │
│                              │  sensor.ts        │           │
│                              │  - Parse JSON     │           │
│                              │  - Retry logic    │           │
│                              └────────┬─────────┘           │
│                                       │                     │
│  ┌────────────────────────────────────┼─────────────────┐   │
│  │         Blockchain Integration Layer                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ write.ts │  │ read.ts  │  │ scripts/mesh.ts  │   │   │
│  │  │ Build Tx │  │ Query Tx │  │ Mesh SDK Wrapper │   │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────────────┘   │   │
│  └───────┼──────────────┼───────────────────────────────┘   │
└──────────┼──────────────┼───────────────────────────────────┘
           │              │
┌──────────┼──────────────┼───────────────────────────────────┐
│          ▼              ▼     BLOCKCHAIN LAYER               │
│  ┌──────────────────────────────────────┐                   │
│  │        Blockfrost API (Preprod)      │                   │
│  │  - Submit transactions               │                   │
│  │  - Query UTXOs and metadata          │                   │
│  └──────────────────┬───────────────────┘                   │
│                     ▼                                       │
│  ┌──────────────────────────────────────┐                   │
│  │     Cardano Blockchain (Preprod)     │                   │
│  │  - Aiken Smart Contract (Validator)  │                   │
│  │  - Transaction Metadata Storage      │                   │
│  │  - UTXO-based State Management       │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagram

```
┌─────────┐   GPIO    ┌─────────────┐  subprocess  ┌──────────────┐
│ DHT22   │──────────►│ dht22.py    │────────────►│ sensor.ts     │
│ Sensor  │  Pin 4    │ Read GPIO   │   JSON      │ Parse & Retry │
└─────────┘           │ Return JSON │             └──────┬────────┘
                      └─────────────┘                    │
                                                         ▼
                                                ┌────────────────┐
                                                │ write.ts       │
                                                │ Format Datum:  │
                                                │ {sensorName,   │
                                                │  temp * 1000,  │
                                                │  humid * 1000} │
                                                └───────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Mesh SDK        │
                                               │ Build Tx +      │
                                               │ Sign + Submit   │
                                               └────────┬────────┘
                                                        │ HTTPS
                                                        ▼
                                               ┌─────────────────┐
                                               │ Blockfrost API  │
                                               │ (Preprod)       │
                                               └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Cardano Ledger  │
                                               │ Immutable Data  │
                                               └─────────────────┘
```

### Read Flow (Reverse)

```
┌─────────────┐  Query API  ┌─────────────┐  Decode  ┌──────────────┐
│ Cardano     │◄────────────│ Blockfrost  │────────►│ read.ts       │
│ Blockchain  │  UTXOs/Meta │ API         │  JSON   │ Display Data  │
└─────────────┘             └─────────────┘         └──────────────┘
```

## 4. Smart Contract Design

**Language:** Aiken (Plutus v3)

**Datum Structure:**
```aiken
pub type Datum {
  owner: VerificationKeyHash,
  value: Int,
}
```

**Redeemers:**
- `Update` — Owner writes new sensor data to UTXO
- `Withdraw` — Owner withdraws funds (requires value >= input value)

**Validation Logic:**
- Owner signature verification via `extra_signatories`
- `Update`: Requires owner signature only
- `Withdraw`: Requires owner signature + output value >= input value

## 5. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Sensor | DHT22 (AM2302) | Temperature & humidity measurement |
| Hardware | Raspberry Pi 5 | IoT gateway and data processing |
| Sensor Interface | Python 3 + adafruit-circuitpython-dht | GPIO sensor reading |
| Application | TypeScript + Node.js | Data formatting and orchestration |
| Blockchain SDK | Mesh SDK (@meshsdk/core) | Transaction building and signing |
| API | Blockfrost API | Blockchain interaction endpoint |
| Smart Contract | Aiken | On-chain data validation |
| Blockchain | Cardano (Preprod testnet) | Immutable data storage |

## 6. Security Considerations

- Private keys stored in `.env` file, never committed to version control
- SSL/TLS encryption for all Blockfrost API communications
- Owner-only transaction signing via verification key hash
- Smart contract validates all state transitions
- Sensor data multiplied by 1000 for integer precision on-chain
