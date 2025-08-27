# Confirm Status Smart Contract

A Cardano-based smart contract system for confirming and tracking status updates on the blockchain, particularly designed for IoT device status confirmation.

## Overview

The Confirm Status contract allows authorized users to create and update status confirmations on the Cardano blockchain. Each status confirmation is represented by a unique NFT token that contains the status data and owner information.

## Architecture

### Smart Contract (Aiken)
- **Validator**: `confirm_status.ak` - Plutus V3 validator written in Aiken
- **Purpose**: Validates spending transactions requiring owner signature verification
- **Datum Structure**:
  - `owner`: VerificationKeyHash of the authorized owner
  - `value`: Integer representing the status value

### Backend Service (NestJS)
- **Framework**: NestJS with TypeScript
- **Port**: 3000 (default)
- **Purpose**: Provides API endpoints and transaction building capabilities

### Blockchain Integration
- **Network**: Cardano Preprod Testnet
- **Library**: MeshSDK for transaction building and wallet integration
- **Provider**: Blockfrost API for blockchain interactions

## Features

- **Status Confirmation**: Create blockchain-verified status updates
- **NFT Representation**: Each status is represented by a unique NFT token
- **Owner Verification**: Only authorized owners can update their status
- **Immutable History**: All status changes are permanently recorded on blockchain
- **Update Mechanism**: Existing status tokens can be updated while maintaining provenance

## Smart Contract Details

### Validator Logic
The `confirm_status` validator ensures that:
1. Only the owner (verified by signature) can spend UTXOs containing their status tokens
2. Transactions must include the owner's signature in `extra_signatories`
3. The datum contains valid owner and value information

### Transaction Flow
1. **First Status Creation**:
   - Mint new NFT with title as asset name
   - Lock NFT at contract address with owner datum
   - Owner signature required

2. **Status Update**:
   - Spend existing UTXO containing status NFT
   - Create new UTXO with updated value
   - Owner signature required for spending

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Bun package manager
- Aiken compiler
- Cardano wallet with testnet ADA
- Blockfrost API key

### Setup

1. **Clone and install dependencies**:
```bash
cd confirm_status
bun install
```

2. **Environment Configuration**:
Create a `.env` file with:
```env
BLOCKFROST_API_KEY=your_blockfrost_api_key
APP_WALLET=your_wallet_mnemonic_phrase
PORT=3000
```

3. **Build the smart contract**:
```bash
bun run build:contract
```

4. **Start the development server**:
```bash
bun run start:dev
```

## Usage

### API Integration

The `ConfirmStatusContract` class provides the main interface:

```typescript
import { ConfirmStatusContract } from './contract/scripts';

const contract = new ConfirmStatusContract({ wallet });

// Confirm or update status
const unsignedTx = await contract.confirmStatus({
    title: "Temperature",
    value: "25.5"
});

// Sign and submit transaction
const signedTx = await wallet.signTx(unsignedTx, true);
const txHash = await wallet.submitTx(signedTx);
```

### Status Confirmation Process

1. **Initialize Contract**: Create contract instance with wallet
2. **Prepare Transaction**: Call `confirmStatus()` with title and value
3. **Sign Transaction**: Use wallet to sign the unsigned transaction
4. **Submit**: Submit signed transaction to network
5. **Verify**: Check transaction confirmation on blockchain

## Testing

Run the test suite:
```bash
# Unit tests
bun run test

# Contract integration tests
bun run test:e2e

# Test with coverage
bun run test:cov
```

The test suite includes:
- Smart contract validation tests
- Transaction building and signing tests
- End-to-end workflow tests

## Scripts

- `bun run build` - Build the NestJS application
- `bun run start:dev` - Start development server with hot reload
- `bun run build:contract` - Compile Aiken smart contract
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

## Project Structure

```
confirm_status/
├── contract/                 # Aiken smart contract
│   ├── validators/
│   │   └── confirm_status.ak # Main validator
│   ├── scripts/             # TypeScript integration
│   │   ├── index.ts         # Contract class
│   │   ├── mesh.ts          # MeshSDK adapter
│   │   └── common.ts        # Utilities
│   └── plutus.json          # Compiled contract
├── src/                     # NestJS backend
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
└── test/                    # Test files
    └── contract.test.ts
```

## Dependencies

### Core Dependencies
- `@meshsdk/core` - Cardano transaction building
- `@nestjs/core` - NestJS framework
- `cbor` - CBOR encoding/decoding

### Development Dependencies
- `typescript` - TypeScript compiler
- `jest` - Testing framework
- `eslint` - Code linting
- `prettier` - Code formatting

## Network Configuration

Currently configured for Cardano Preprod testnet:
- Network ID: 0 (testnet)
- Explorer: https://preprod.cexplorer.io/
- Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet

## License

UNLICENSED - Private project

## Contributing

This project is part of the Cardano IoT example implementation. For questions or contributions, please refer to the main project documentation.