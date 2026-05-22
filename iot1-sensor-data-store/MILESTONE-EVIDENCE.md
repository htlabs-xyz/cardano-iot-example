# IoT1 Milestone Evidence: DHT22 Sensor Data on Cardano Preprod

## Runtime Environment

- Device: Raspberry Pi 5
- Hostname: `pi1`
- Static IP: `192.168.1.30`
- OS: Ubuntu 26.04 LTS, ARM64
- Node.js: `v22.22.1`
- npm: `9.2.0`
- Python: `3.14.4`
- Sensor: DHT22 on GPIO 4 / physical pin 7
- Network: Cardano preprod

## Completed Work

- Configured SSH key-based access to the Raspberry Pi 5.
- Set static IP to `192.168.1.30`.
- Installed system dependencies, Node.js/npm, Python GPIO libraries, and project dependencies.
- Generated a Cardano preprod wallet and configured local `.env` on the Raspberry Pi.
- Funded the generated preprod address with faucet tADA.
- Read real DHT22 sensor data from GPIO.
- Submitted one sensor record to Cardano preprod.
- Verified the submitted record by reading it back from chain.

## Sensor Reading Submitted

- Timestamp: `2026-05-18 04:18:19 Asia/Bangkok`
- Temperature: `31.4°C`
- Humidity: `79.8%`
- On-chain temperature value: `31400`
- On-chain humidity value: `79800`

## Cardano Preprod Transaction

- Transaction hash: `ff366f12472ce55b8a66b8a2cb8a1de10d561768adc64e70fba4b3ad383661bf`
- Block hash: `b12bf24a3925242e48249da749d6c22ce1db462a14ce84835770ff59428dc6ed`
- Fee: `180549 lovelace`
- Explorer: https://preprod.cexplorer.io/tx/ff366f12472ce55b8a66b8a2cb8a1de10d561768adc64e70fba4b3ad383661bf

## Verification Commands

```bash
ssh -F .ssh/config rp5-catalyst
cd ~/projects/iot1-sensor-data-store
npm test
npm start -- --write
npm start -- --monitor
```

## Verification Output Summary

```text
DHT22 read:
{"temperature": 31.6, "humidity": 79.2}

Blockchain write:
Temperature: 31.4°C
Humidity: 79.8%
Transaction submitted and confirmed:
ff366f12472ce55b8a66b8a2cb8a1de10d561768adc64e70fba4b3ad383661bf

Blockchain monitor:
Total Records on Chain: 1
Latest Temperature: 31.4°C
Latest Humidity: 79.8%
Explorer:
https://preprod.cexplorer.io/tx/ff366f12472ce55b8a66b8a2cb8a1de10d561768adc64e70fba4b3ad383661bf
```
