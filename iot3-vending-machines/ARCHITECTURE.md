# System Architecture: Cardano Asset State Monitor (ESP32)

## 1. System Overview

This project implements a real-time Cardano asset state monitor on an ESP32 microcontroller. The device polls the Blockfrost API to track lock/unlock status of on-chain assets by parsing Plutus datum CBOR data, enabling IoT devices to react to blockchain state changes.

**Key Capabilities:**
- WiFi-connected monitoring of Cardano preprod testnet
- Real-time UTXO polling (configurable interval)
- On-device CBOR parsing of Plutus datum using TinyCBOR
- Bech32 address encoding for human-readable display
- Memory-efficient operation (~100KB free heap)

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ESP32 Development Board                             │   │
│  │  - WiFi 802.11 b/g/n (2.4GHz)                       │   │
│  │  - USB for programming + serial monitor              │   │
│  │  - Optional: Relay module / Pump for vending action  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │ WiFi
┌─────────────────────────────┼───────────────────────────────┐
│                   FIRMWARE LAYER (C++ / Arduino)             │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  main.cpp                                           │    │
│  │  - WiFi connection management                       │    │
│  │  - Polling loop (configurable interval)             │    │
│  │  - Serial output for monitoring                     │    │
│  └─────┬────────────────────────────────┬──────────────┘    │
│        │                                │                   │
│        ▼                                ▼                   │
│  ┌──────────────────┐    ┌──────────────────────────┐       │
│  │ blockfrost.cpp   │    │ datum_parser.cpp          │       │
│  │ - HTTPS client   │    │ - TinyCBOR CBOR parsing   │       │
│  │ - GET /assets/   │    │ - Extract pubKeyHash      │       │
│  │   {unit}/txs     │    │ - Extract lock status     │       │
│  │ - GET /txs/      │    │                           │       │
│  │   {hash}/utxos   │    │ ┌──────────────────────┐  │       │
│  │ - JSON parsing   │    │ │ bech32.cpp           │  │       │
│  │   (ArduinoJson)  │    │ │ - BIP-173 encoding   │  │       │
│  └──────────────────┘    │ │ - addr_test1... fmt  │  │       │
│                          │ └──────────────────────┘  │       │
│                          └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┼───────────────────────────────┐
│                   BLOCKCHAIN LAYER                           │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Blockfrost API (Preprod Testnet)                    │   │
│  │  - /assets/{unit}/transactions                       │   │
│  │  - /txs/{hash}/utxos → inline_datum                  │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cardano Blockchain (Preprod)                        │   │
│  │  - Plutus datum: {authority, is_locked}               │   │
│  │  - Linked to IoT2 Smart Contract                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagram

```
┌────────────────┐                           ┌─────────────────┐
│ ESP32 main.cpp │──── GET /assets/{unit}/ ──►│ Blockfrost API  │
│ Polling Loop   │     transactions          │                 │
│                │◄── Latest tx_hash ────────│                 │
│                │                           │                 │
│                │──── GET /txs/{hash}/ ─────►│                 │
│                │     utxos                 │                 │
│                │◄── inline_datum (CBOR) ───│                 │
└───────┬────────┘                           └─────────────────┘
        │
        ▼
┌────────────────┐
│ datum_parser   │
│                │
│ CBOR Input:    │
│ Tag(121) [     │
│   Tag(121) [   │
│     bytes(28), │ ──► pubKeyHash
│     bytes(28)  │ ──► stakeCredHash
│   ],           │
│   int          │ ──► lockStatus (0/1)
│ ]              │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ bech32.cpp     │
│ pubKeyHash ──► │ addr_test1qz...
│                │
│ Output:        │
│ "Authority:    │
│  addr_test1... │
│  Locked: true" │
└────────────────┘
```

## 4. Plutus Datum Structure

This project reads datum from the IoT2 Smart Contract (Aiken):

```
CBOR Structure:
Tag(121) [              // Constr 0 (outer datum)
  Tag(121) [            // Constr 0 (credential/address)
    bytes(28),          // pubKeyHash (28 bytes)
    bytes(28)           // stakeCredHash (28 bytes)
  ],
  int                   // lockStatus: 0=unlocked, 1=locked
]
```

The ESP32 parses this CBOR on-device using TinyCBOR library without requiring a full Cardano node.

## 5. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Hardware | ESP32 (XIAO ESP32C3 or DevKit) | IoT monitoring device |
| Framework | Arduino (PlatformIO) | Embedded firmware development |
| Language | C++ | Firmware implementation |
| HTTP Client | WiFiClientSecure | HTTPS communication |
| JSON Parser | ArduinoJson v7.0.0 | Blockfrost response parsing |
| CBOR Parser | TinyCBOR 0.5.3-arduino2 | Plutus datum decoding |
| Address Codec | Custom bech32.cpp | Cardano address encoding (BIP-173) |
| API | Blockfrost REST API | Blockchain data access |
| Blockchain | Cardano (Preprod) | State source |

## 6. Security Considerations

- **Development mode** uses `setInsecure()` for SSL (skips certificate validation)
- **Production** should embed Blockfrost root CA certificate for proper TLS verification
- WiFi credentials and API keys stored in `config.h` — must not be committed to version control
- ESP32 is read-only (monitors state, does not submit transactions)
- No private keys stored on the device
