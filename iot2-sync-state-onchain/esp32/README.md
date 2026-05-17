# Cardano UTXO Monitor - ESP32C3

Real-time Cardano wallet monitor for XIAO ESP32C3 with PUMP notification.

## Features

- **WiFi Connected**: Monitors Cardano preprod testnet via Blockfrost API
- **Real-time Detection**: Polls every 10 seconds for new UTXOs
- **PUMP Notification**: PUMP duration = ADA received (10 ADA = 10s PUMP on)
- **Non-blocking**: Fully async PUMP control, doesn't freeze monitoring
- **Memory Efficient**: ~100KB free heap, handles 100 UTXOs/page

## Hardware Requirements

- **Board**: Seeed Studio XIAO ESP32C3
- **PUMP**: External PUMP + 220Ω resistor
- **Connection**: GPIO3 (D10) → 220Ω → PUMP+ → GND
- **Cable**: USB-C for programming

## Software Requirements

- PlatformIO Core or VS Code + PlatformIO extension
- Arduino framework for ESP32
- Libraries (auto-instalpump):
  - ArduinoJson v7.0.0

## Pin Configuration

| Component | GPIO | Pin Label |
|-----------|------|-----------|
| PUMP       | GPIO3| D10       |

## Wiring Diagram

```
ESP32C3 GPIO3 (D10) ──┬── 220Ω Resistor ──┬── PUMP Anode (+)
                      │                    │
                      └────────────────────┴── PUMP Cathode (-) ──┬── GND
```

## Setup Instructions

### 1. Clone & Configure

```bash
git clone <repo-url>
cd iot3-vending-machines
```

### 2. Update WiFi Credentials

Edit `include/config.h`:
```cpp
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"
```

### 3. Update Wallet Address (Optional)

Edit `include/config.h`:
```cpp
#define WALLET_ADDRESS "addr_test1q..."
#define BLOCKFROST_API_KEY "preprod..."
```

### 4. Build & Upload

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

### Startup Sequence

1. **WiFi Connection**: PUMP blinks while connecting
2. **Test Blinks**: 2 quick blinks when ready
3. **Initial Poll**: Shows current balance and UTXO count
4. **Monitoring**: Checks every 10 seconds

### Serial Output Example

```
Connecting WiFi...
.........
WiFi OK!
Initial balance: 15.234567 ADA
UTXO count: 3
Monitoring started...

=== NEW UTXO DETECTED ===
Count: 1
TX: abc123...def456#0
Amount: 10.000000 ADA
>>> Received 10.00 ADA!
PUMP notify: 10.00 ADA = 10000ms
PUMP ON
=========================

PUMP remaining: 8500ms
PUMP OFF
```

### PUMP Behavior

| ADA Received | PUMP Duration |
|--------------|--------------|
| 0.5 ADA      | 0.5 seconds  |
| 10 ADA       | 10 seconds   |
| 100 ADA      | 60 seconds (capped) |

Multiple transactions accumulate time (max 60s total).

## Project Structure

```
.
├── platformio.ini          # PlatformIO config
├── include/
│   ├── config.h           # WiFi, API, pins, timing
│   ├── blockfrost.h       # Blockfrost API client
│   ├── utxo_monitor.h     # UTXO tracking logic
│   └── pump_controller.h   # PUMP notification system
├── src/
│   ├── main.cpp           # Entry point, WiFi, loop
│   ├── blockfrost.cpp     # HTTPS + JSON parsing
│   ├── utxo_monitor.cpp   # UTXO set comparison
│   └── pump_controller.cpp # Non-blocking PUMP control
```

## Configuration Constants

Edit `include/config.h` to customize:

```cpp
// Timing
#define POLL_INTERVAL_MS 10000       // 10 seconds

// PUMP Behavior
#define PUMP_MS_PER_ADA 1000          // 1 ADA = 1 second
#define PUMP_MAX_DURATION_MS 60000    // Max 60 seconds
#define PUMP_MIN_DURATION_MS 500      // Min 0.5 seconds
```

## Troubleshooting

### WiFi Won't Connect
- Verify SSID and password in `config.h`
- Check WiFi signal strength
- Ensure 2.4GHz network (ESP32C3 doesn't support 5GHz)

### API Errors
- Verify Blockfrost API key is valid
- Check internet connectivity
- Monitor serial output for HTTP error codes

### PUMP Not Working
- Check wiring: GPIO3 → 220Ω → PUMP+ → GND
- Verify PUMP polarity (longer leg = anode/+)
- Test with multimeter: GPIO3 should be 3.3V when on

### Compilation Errors
- Update PlatformIO platform: `pio pkg update`
- Clean build: `pio run --target clean`
- Check ArduinoJson version in platformio.ini

## Memory Usage

- **WiFi + HTTP Stack**: ~50-60KB
- **JSON Parsing**: ~4KB
- **UTXO Tracking**: ~200 bytes per UTXO
- **Free Heap**: ~100KB (comfortable margin)

## Security Notes

- **Development**: Uses `setInsecure()` for SSL (skips cert validation)
- **Production**: Embed Blockfrost root CA certificate
- **Credentials**: Don't commit `config.h` with real credentials
- Add to `.gitignore` for public repos

## Next Steps

1. **Test**: Send ADA to monitored wallet, verify PUMP lights
2. **Production**: Add SSL certificate validation
3. **Offline Storage**: Persist UTXO state in SPIFFS/EEPROM
4. **Extended Features**: Add OPUMP display, buzzer, etc.


## License

MIT
