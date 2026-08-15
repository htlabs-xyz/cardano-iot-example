# Cardano IoT Examples

A collection of five educational templates that connect physical devices and real-world workflows with Cardano. The examples target Cardano preprod and are intended for learning, research, and prototyping.

## Choose a template

Each project directory owns its setup, configuration, usage, and troubleshooting instructions. Start with the guide for the template you want to run.

| Template | What it demonstrates | Main stack | Project guide | Demo |
| --- | --- | --- | --- | --- |
| IoT1 — Sensor Data Store | Read DHT22 temperature/humidity data on a Raspberry Pi and record it on Cardano | TypeScript, Python, Raspberry Pi | [Open IoT1 guide](./iot1-sensor-data-store/README.md) | [Watch](https://youtu.be/khH-3ZzBanU) |
| IoT2 — Smart Lock State | Manage lock/unlock state and authority through an Aiken contract | Aiken, TypeScript, Mesh SDK | [Open IoT2 guide](./iot2-sync-state-onchain/README.md) | [Watch](https://youtu.be/8k02ehV1r7Q) |
| IoT3 — Vending/Pump Controller | Let an ESP32 observe IoT2 on-chain state and control a pump/relay output | C++, PlatformIO, ESP32 | [Open IoT3 guide](./iot3-vending-machines/README.md) | [Watch](https://youtu.be/L75_IOXbAu0) |
| IoT4 — NFC Identity | Mint student identity NFTs, write their references to NFC tags, and verify them against Cardano | Python, Raspberry Pi, PN532 | [Open IoT4 guide](./iot4-nfc-tag-identification/README.md) | [Watch](https://youtu.be/79a9eahkA5k) |
| IoT5 — QR Traceability | Mint CIP-68 product NFTs and inspect their supply-chain history through QR codes | Next.js, TypeScript, Aiken | [Open IoT5 guide](./iot5-qr-code-traceability/README.md) | [Watch](https://youtu.be/h_saOa3uWoo) |

## How to use this repository

1. Select a template from the table above.
2. Open that project's README and review its prerequisites and hardware requirements.
3. Configure only the credentials and identifiers required by that project.
4. Use Cardano preprod and test ADA while learning or prototyping.
5. Follow the project's own build, run, verification, and troubleshooting steps.

Commands differ between projects. Do not use this root README as a shared installation guide.

## Shared prerequisites

Depending on the selected template, you may need:

- a Cardano preprod Blockfrost project;
- a test wallet funded from the [Cardano testnet faucet](https://docs.cardano.org/cardano-testnets/tools/faucet);
- Bun, Node.js, Python, Aiken, or PlatformIO; and
- the hardware listed in the selected project guide.

The project README is authoritative for exact versions, environment variables, wiring, and commands.

## Repository layout

- [`iot1-sensor-data-store`](./iot1-sensor-data-store/) — DHT22 sensor monitoring and on-chain data storage.
- [`iot2-sync-state-onchain`](./iot2-sync-state-onchain/) — Aiken lock-state contract and off-chain operations.
- [`iot3-vending-machines`](./iot3-vending-machines/) — ESP32 state monitor and pump/relay controller.
- [`iot4-nfc-tag-identification`](./iot4-nfc-tag-identification/) — NFC-backed student identity verification.
- [`iot5-qr-code-traceability`](./iot5-qr-code-traceability/) — CIP-68 product traceability and QR web interface.

## Security and production scope

- Never commit `.env`, wallet mnemonics, API keys, Wi-Fi credentials, or populated device configuration files.
- Use dedicated preprod wallets with only the funds needed for testing.
- The templates prioritize clarity over production hardening. Real deployments require secure key custody, certificate validation, device provisioning, monitoring, recovery, and a use-case-specific security review.

## Contributing

Issues and pull requests are welcome. Keep changes scoped to the relevant template and update that template's README whenever its setup or behavior changes.

## License

This repository is available under the [MIT License](./LICENSE).
