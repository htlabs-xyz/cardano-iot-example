# Cardano Asset State Monitor - ESP32

Real-time Cardano asset state monitor for ESP32 that tracks lock/unlock status via Blockfrost API and Plutus datum parsing.

## Features

- **WiFi Connected**: Monitors Cardano preprod testnet via Blockfrost API
- **Real-time Detection**: Polls every second for asset state changes
- **CBOR Parsing**: Decodes Plutus datum using TinyCBOR library
- **Bech32 Encoding**: Converts pubKeyHash to human-readable Cardano addresses
- **Memory Efficient**: Lightweight CBOR parser, ~100KB free heap

## Hardware Requirements

- **Board**: ESP32 development board (ESP32-DevKit, XIAO ESP32C3, etc.)
- **Cable**: USB for programming
- **Network**: 2.4GHz WiFi

## Software Requirements

- PlatformIO Core or VS Code + PlatformIO extension
- Arduino framework for ESP32
- Libraries (auto-installed):
  - ArduinoJson v7.0.0
  - TinyCBOR 0.5.3-arduino2

## Setup Instructions

### 1. Clone & Configure

```bash
git clone <repo-url>
cd iot3-vending-machines
```

### 2. Update Configuration

Edit `include/config.h`:
```cpp
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"
#define BLOCKFROST_API_KEY "preprod..."
#define ASSET_UNIT "policy_id + hex_asset_name"
#define POLL_INTERVAL_MS 1000
```

### 3. Build & Upload

**VS Code:**
1. Open project in VS Code
2. Click PlatformIO icon → Build
3. Click Upload
4. Open Serial Monitor (115200 baud)

**CLI:**
```bash
pio run --target upload
pio device monitor
```

## Usage

### Serial Output Example

```
=== ESP32 Cardano Asset Monitor ===
===================================

Connecting WiFi...
.........
WiFi OK!
Authority: addr_test1qz... | Locked: true
Authority: addr_test1qz... | Locked: false
```

## Project Structure

```
.
├── platformio.ini          # PlatformIO config
├── include/
│   ├── config.h            # WiFi, API key, asset unit, timing
│   ├── blockfrost.h        # Blockfrost API client
│   ├── datum_parser.h      # Plutus datum CBOR parser
│   └── bech32.h            # Cardano address encoding
├── src/
│   ├── main.cpp            # Entry point, WiFi, polling loop
│   ├── blockfrost.cpp      # HTTPS client, JSON parsing
│   ├── datum_parser.cpp    # CBOR parsing (TinyCBOR)
│   └── bech32.cpp          # Bech32 encoding (BIP-173)
```

## Architecture

```
main.cpp
    │
    ├── blockfrost.cpp      # Blockfrost API
    │   └── fetchAssetState()
    │       ├── GET /assets/{unit}/transactions
    │       └── GET /txs/{hash}/utxos → inline_datum
    │
    └── datum_parser.cpp    # CBOR parsing
        ├── parseDatum()    # Tag121[ Tag121[pubKeyHash, stakeCredHash], lockStatus ]
        └── bech32.cpp      # addr_test1... encoding
```

## Plutus Datum Structure

Expected CBOR format (from IoT2 Aiken smart contract):
```
Tag(121) [              // Constr 0 (outer)
  Tag(121) [            // Constr 0 (credential)
    bytes(28),          // pubKeyHash
    bytes(28)           // stakeCredHash
  ],
  int                   // lockStatus: 0=unlocked, 1=locked
]
```

## Troubleshooting

### WiFi Won't Connect
- Verify SSID and password in `config.h`
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

### API Errors
- Verify Blockfrost API key is valid for preprod
- Check `ASSET_UNIT` format: `{policy_id}{hex_asset_name}`
- Monitor serial output for HTTP error codes

### Datum Parse Errors
- Ensure asset has inline datum (not datum hash)
- Verify datum structure matches expected format
- Check CBOR tags (should be 121 for Constr 0)

### Compilation Errors
- Update PlatformIO platform: `pio pkg update`
- Clean build: `pio run --target clean`

## Security Notes

- **Development**: Uses `setInsecure()` for SSL (skips cert validation)
- **Production**: Embed Blockfrost root CA certificate
- **Credentials**: Don't commit `config.h` with real credentials

## License

MIT
