# IoT2 — Smart Lock State on Cardano

A Cardano smart contract template for managing IoT lock/unlock state on-chain. Aiken validators enforce the state transition and authority rules; TypeScript and Mesh SDK provide the off-chain transaction operations.

## Demo

[![Watch the video](https://img.youtube.com/vi/8k02ehV1r7Q/0.jpg)](https://www.youtube.com/watch?v=8k02ehV1r7Q)

## Features

- Owner-controlled status-token minting.
- Lock/unlock state stored in an inline datum.
- Owner or delegated authority can change lock state.
- Owner-only authority management.
- Current state lookup through Blockfrost.

## Prerequisites

- [Bun](https://bun.sh/) for the TypeScript operations.
- [Aiken](https://aiken-lang.org/) compatible with the compiler version in `aiken.toml`.
- A Cardano preprod [Blockfrost](https://blockfrost.io/) project.
- A test wallet mnemonic funded with preprod test ADA from the [Cardano faucet](https://docs.cardano.org/cardano-testnets/tools/faucet).

## Quick start

### 1. Install dependencies

```bash
cd iot2-sync-state-onchain
bun install
```

### 2. Configure the environment

Copy the provided environment template to the local environment file loaded by the application. Set:

```text
BLOCKFROST_API_KEY=your_preprod_blockfrost_project_id
MNEMONIC="your test wallet mnemonic"
```

The off-chain implementation currently targets Cardano preprod.

### 3. Build and test the validators

```bash
aiken build
aiken check
```

The compiled blueprint is written to `plutus.json`.

### 4. Run an off-chain operation

The root `index.ts` entrypoint imports `init`, `lock`, `unlock`, and `authority`. Open it and ensure exactly one intended operation call is enabled, then run:

```bash
bun run index.ts
```

The selected operation builds, signs, and submits a real preprod transaction using the configured test wallet. Wait for confirmation before submitting another transaction against the same state UTxO.

### 5. Read the current state

Set the `unit` value in the root `monitor.ts` entrypoint to the locker policy ID followed by the hex-encoded asset name, then run:

```bash
bun run monitor.ts
```

## Architecture

### Smart contract layer (`validators/contract.ak`)

- **Datum:** stores `authority` and `is_locked` (`0` = unlocked, `1` = locked).
- **`Status` redeemer:** changes lock state and requires the owner or authority signature.
- **`Authorize` redeemer:** performs the owner-authorized management path.
- **`locker.mint`:** owner-controlled status-token minting policy.
- **`locker.spend`:** validates state transitions and authorization.

### Off-chain layer (`script/`)

- `mesh.ts` initializes the Plutus scripts and provides wallet/UTxO helpers.
- `offchain.ts` implements `init`, `lock`, `unLock`, and `authorize` transaction builders.
- `script/index.ts` configures the wallet and exports the transaction operations.
- The root `index.ts` selects and invokes one transaction operation.
- `script/monitor.ts` queries and decodes the latest locker state through Blockfrost.
- The root `monitor.ts` supplies the asset unit and invokes the monitor.

## Data flow

1. The owner initializes the contract and mints a status token with the initial datum.
2. The owner or authority spends the current state UTxO and creates its successor with the updated lock state.
3. The contract validates signatures, token continuity, output address, and datum invariants.
4. The monitor resolves the latest asset transaction and decodes the resulting inline datum.

## Security notes

- Use only a dedicated preprod wallet for this educational template.
- Never commit local environment files, API keys, or wallet mnemonics.
- A physical controller should wait for transaction confirmation and canonical state readback before actuating hardware.
- Production deployments require secure key custody, resilient indexing, certificate validation, monitoring, and recovery procedures.

## Related hardware template

The ESP32 controller that consumes this lock state is documented in [`iot3-vending-machines`](../iot3-vending-machines/README.md).
