IoT2 is a Cardano smart contract project for managing IoT device lock/unlock states on-chain. It uses Aiken for smart contracts and TypeScript with Mesh SDK for off-chain interactions.

## Commands

### Smart Contract (Aiken)
```sh
aiken build          # Compile validators to plutus.json
aiken check          # Run all tests
aiken check -m foo   # Run tests matching "foo"
```

### Off-chain (TypeScript/npm)
```sh
npm install          # Install dependencies
npm run index.ts     # Execute main script (currently runs unlock())
npm run monitor.ts   # Monitor locker status by asset unit
```

## Architecture

### Smart Contract Layer (`validators/contract.ak`)
- **Datum**: Stores `authority` (Address) and `is_locked` (Int: 0=unlocked, 1=locked)
- **Redeemers**:
  - `Status`: Toggle lock state (requires owner OR authority signature)
  - `Authorize`: Transfer authority (requires owner signature only)
- **Validators**:
  - `locker.mint`: Owner-only minting policy
  - `locker.spend`: State transition logic with role-based access control

### Off-chain Layer (`script/`)
- **MeshAdapter** (`mesh.ts`): Base class that initializes Plutus scripts from `plutus.json`, parameterizes them with owner's pubKeyHash, and provides UTxO utilities
- **LockerContract** (`offchain.ts`): High-level contract operations:
  - `init()`: Mint new status token
  - `lock()`: Set status to locked (is_locked=1)
  - `unLock()`: Set status to unlocked (is_locked=0)
  - `authorize()`: Transfer authority to new address
- **monitor** (`monitor.ts`): Query current locker state via Blockfrost API

### Key Dependencies
- Aiken libs: `aiken-lang/stdlib`, `logical-mechanism/assist`, `sidan-lab/vodka`
- TypeScript: `@meshsdk/core`, `@blockfrost/blockfrost-js`

## Configuration

Copy `.env.example` to `.env` and set:
- `BLOCKFROST_API_KEY`: Preprod network API key
- `MNEMONIC`: Wallet mnemonic phrase

Network is hardcoded to `preprod` (testnet).

## Data Flow

1. Owner deploys contract → mints status token with initial datum
2. Owner/Authority calls `lock()` or `unLock()` → spends UTxO, creates new UTxO with updated `is_locked`
3. Owner calls `authorize()` → transfers control to new authority address
4. Monitor queries Blockfrost for current state via asset transactions
