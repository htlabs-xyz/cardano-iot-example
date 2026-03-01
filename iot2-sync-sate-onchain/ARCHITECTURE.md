# System Architecture: Smart Lock State Sync on Cardano

## 1. System Overview

This project manages IoT device lock/unlock states on the Cardano blockchain using Aiken smart contracts. It implements role-based access control (RBAC) allowing owners and authorized parties to toggle device states through on-chain UTXO transitions.

**Key Capabilities:**
- On-chain lock/unlock state management via UTXO datum
- Role-based access control (Owner + Authority)
- Status token minting for state tracking
- Real-time state monitoring via Blockfrost API
- Authority transfer capability

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    IoT DEVICE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ESP32 Microcontroller (Optional Hardware)           │   │
│  │  - WiFi connectivity                                 │   │
│  │  - Reads on-chain state via Blockfrost               │   │
│  │  - Controls physical lock mechanism                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                OFF-CHAIN LAYER (TypeScript/Bun)              │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  MeshAdapter (mesh.ts)                              │    │
│  │  - Initialize Plutus scripts from plutus.json       │    │
│  │  - Parameterize with owner pubKeyHash               │    │
│  │  - UTXO query utilities                             │    │
│  └──────────────────────────┬──────────────────────────┘    │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  LockerContract (offchain.ts)                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐  │    │
│  │  │  init()  │ │  lock()  │ │ unLock()  │ │ auth │  │    │
│  │  │  Mint    │ │  Set 1   │ │  Set 0    │ │ orize│  │    │
│  │  │  Token   │ │  locked  │ │  unlocked │ │  ()  │  │    │
│  │  └──────────┘ └──────────┘ └───────────┘ └──────┘  │    │
│  └──────────────────────────┬──────────────────────────┘    │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  Monitor (monitor.ts)                               │    │
│  │  - Query current locker state via Blockfrost        │    │
│  │  - Display authority address + lock status           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                ON-CHAIN LAYER (Aiken Smart Contracts)        │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  locker.mint (Minting Policy)                        │   │
│  │  - Owner-only status token minting                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  locker.spend (Spending Validator)                   │   │
│  │  - Status: Toggle lock (owner OR authority sign)     │   │
│  │  - Authorize: Transfer authority (owner only)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cardano Blockchain (Preprod Testnet)                │   │
│  │  - UTXO state: {authority, is_locked}                │   │
│  │  - Status token tracks which UTXO holds state        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagram

### Lock/Unlock Flow

```
┌──────────┐   call lock()   ┌─────────────────┐
│  Owner/  │────────────────►│ LockerContract  │
│ Authority│                 │ (offchain.ts)   │
└──────────┘                 └───────┬─────────┘
                                     │ 1. Find UTXO with status token
                                     │ 2. Read current datum
                                     │ 3. Build new datum (flip is_locked)
                                     │ 4. Build + Sign Tx
                                     ▼
                             ┌─────────────────┐
                             │ Blockfrost API  │
                             │ Submit Tx       │
                             └───────┬─────────┘
                                     │
                                     ▼
                             ┌─────────────────┐
                             │ Cardano Ledger  │
                             │                 │
                             │ Spend old UTXO: │
                             │ {authority: X,  │
                             │  is_locked: 0}  │
                             │       ↓         │
                             │ Create new UTXO:│
                             │ {authority: X,  │
                             │  is_locked: 1}  │
                             └─────────────────┘
```

### State Monitoring Flow

```
┌──────────┐  poll state  ┌─────────────┐  query   ┌───────────┐
│ ESP32 /  │─────────────►│ monitor.ts  │────────►│ Blockfrost│
│ Monitor  │              │             │◄────────│ API       │
│          │◄─────────────│ Parse datum │  UTXO   └───────────┘
│ Display  │  authority + │ Display     │  data
│ Status   │  lock status │             │
└──────────┘              └─────────────┘
```

## 4. Smart Contract Design

**Language:** Aiken (Plutus v3)

**Datum Structure:**
```aiken
pub type Datum {
  authority: Address,    // Authorized party address
  is_locked: Int,        // 0 = unlocked, 1 = locked
}
```

**Redeemers:**
- `Status` — Toggle lock state (owner OR authority signature required)
- `Authorize` — Transfer authority to new address (owner signature only)

**Validation Rules:**
| Action | Signer Required | State Change |
|--------|----------------|--------------|
| Lock (0→1) | Owner OR Authority | is_locked: 0 → 1 |
| Unlock (1→0) | Owner OR Authority | is_locked: 1 → 0 |
| Authorize | Owner only | authority address changes |

**UTXO Token Tracking:** A unique status token is minted during `init()` and always resides in the UTXO holding the current state. This ensures only one authoritative state exists at any time.

## 5. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| IoT Device | ESP32 (optional) | Physical lock control + state display |
| Runtime | Bun | TypeScript execution environment |
| Off-chain SDK | Mesh SDK (@meshsdk/core) | Transaction building and wallet management |
| API | Blockfrost API | Blockchain queries and tx submission |
| Smart Contract | Aiken | On-chain state validation (Plutus v3) |
| Blockchain | Cardano (Preprod) | Immutable state storage |

## 6. Security Considerations

- Role-based access: Owner has full control, Authority limited to status changes
- All state transitions validated by on-chain smart contract
- Status token prevents duplicate/conflicting state UTXOs
- Authority transfer requires owner-only signature
- Private keys never exposed; mnemonic stored in `.env`
