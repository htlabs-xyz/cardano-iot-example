# System Architecture: Student NFC Identity on Cardano

## 1. System Overview

Decentralized student identification system that uses NFC tags verified against Cardano blockchain NFTs. Students receive CIP-25 compliant NFTs representing their identity, with NFC tags storing references to on-chain credentials. Verification is performed by scanning NFC tags and querying the blockchain.

**Key Capabilities:**
- NFT-based student identity on Cardano (CIP-25 metadata)
- NFC tag writing and reading via PN532 module (MiFare Classic 1K)
- On-chain identity verification via blockchain lookup
- Interactive student registration (mint NFT + write NFC tag)
- Continuous verification mode for kiosk deployments

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                           │
│                                                             │
│  ┌──────────────────┐  SPI    ┌────────────────────────┐   │
│  │  PN532 NFC       │◄──────►│   Raspberry Pi 5        │   │
│  │  Reader Module   │         │   - SPI Interface       │   │
│  │  - MiFare Classic│         │   - Python Runtime      │   │
│  │  - Read/Write    │         │   - GPIO: 5,9,10,11     │   │
│  └──────────────────┘         └────────────┬───────────┘   │
│                                            │               │
│  ┌──────────────────┐                      │               │
│  │  MiFare Classic  │   NFC Contactless    │               │
│  │  1K NFC Cards    │◄─────────────────────┘               │
│  │  - Student tags  │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                   SOFTWARE LAYER (Python)                    │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  config.py — Configuration management               │    │
│  │  - Blockfrost API key, Mnemonic, Network detection  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐   │
│  │ register_       │  │ mint_           │  │ verify_   │   │
│  │ student.py      │  │ student.py      │  │ student.py│   │
│  │ Mint NFT +      │  │ Mint NFT only   │  │ Scan NFC +│   │
│  │ Write NFC tag   │  │ (interactive)   │  │ Verify on │   │
│  │ (full flow)     │  │                 │  │ blockchain│   │
│  └────────┬────────┘  └───────┬─────────┘  └─────┬─────┘   │
│           │                   │                   │         │
│           ▼                   ▼                   ▼         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  cardano.py — Blockchain wrapper (PyCardano-style)   │   │
│  │  - Wallet from mnemonic (HD derivation)              │   │
│  │  - NFT minting with CIP-25 metadata                  │   │
│  │  - Asset querying via Blockfrost                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  nfc.py — NFC read/write operations                  │   │
│  │  - Write: {policy_id, asset_hex, student_id}         │   │
│  │  - Read: Extract NFT reference from tag              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                   BLOCKCHAIN LAYER                           │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Blockfrost API (Preprod / Mainnet / Preview)        │   │
│  │  - Network auto-detected from API key prefix         │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cardano Blockchain                                  │   │
│  │  - CIP-25 NFT per student (policy_id + STU{id})     │   │
│  │  - Metadata: name, student_id, department,           │   │
│  │    nfc_uid, issued_at                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagram

### Registration Flow (Mint + Write NFC)

```
┌──────────┐  Interactive  ┌──────────────────┐
│ Operator │─────────────►│ register_student │
│          │  Input:       │ .py              │
│          │  ID, Name,    └───────┬──────────┘
│          │  Department           │
└──────────┘                       │
                                   ▼
                          ┌─────────────────┐
                          │ cardano.py      │
                          │ 1. Derive keys  │
                          │    from mnemonic│
                          │ 2. Build CIP-25 │
                          │    metadata     │
                          │ 3. Mint NFT tx  │
                          │ 4. Sign + Submit│
                          └───────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             │             ▼
            ┌───────────┐        │     ┌───────────────┐
            │ Blockfrost│        │     │ nfc.py        │
            │ Submit Tx │        │     │ Write to tag: │
            └───────────┘        │     │ {p: policy_id,│
                                 │     │  a: asset_hex,│
                                 │     │  s: student_id│
                                 │     │ }             │
                                 │     └───────┬───────┘
                                 │             │ NFC
                                 │             ▼
                                 │     ┌───────────────┐
                                 │     │ MiFare Card   │
                                 │     │ (Student Tag) │
                                 │     └───────────────┘
                                 ▼
                          ┌───────────────┐
                          │ Cardano       │
                          │ Blockchain    │
                          │ NFT: STU{id}  │
                          └───────────────┘
```

### Verification Flow

```
┌──────────────┐  NFC Scan  ┌──────────────────┐
│ MiFare Card  │───────────►│ verify_student.py│
│ (Student)    │            └───────┬──────────┘
└──────────────┘                    │ Extract:
                                    │ policy_id + asset_hex
                                    ▼
                           ┌─────────────────┐
                           │ Blockfrost API  │
                           │ Query NFT by    │
                           │ policy + asset  │
                           └───────┬─────────┘
                                   │
                                   ▼
                           ┌─────────────────┐
                           │ Validate:       │
                           │ ✓ NFT exists    │
                           │ ✓ Metadata match│
                           │ ✓ Not revoked   │
                           └───────┬─────────┘
                                   │
                                   ▼
                           ┌─────────────────┐
                           │ Display Result  │
                           │ ✓ VERIFIED      │
                           │ Name, ID, Dept  │
                           │ Issue Date      │
                           └─────────────────┘
```

## 4. NFT Metadata Standard (CIP-25)

```json
{
  "721": {
    "{policy_id}": {
      "STU{student_id}": {
        "name": "Student: Nguyen Van A",
        "student_id": "2025001",
        "student_name": "Nguyen Van A",
        "department": "Computer Science",
        "nfc_uid": "04A2B3C4",
        "issued_at": "2025-12-04"
      }
    }
  }
}
```

**NFC Tag Data (stored on MiFare Classic 1K):**
```json
{ "p": "policy_id", "a": "asset_hex", "s": "student_id" }
```

## 5. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| NFC Hardware | PN532 module (SPI) | Read/write MiFare Classic 1K tags |
| NFC Tags | MiFare Classic 1K | Student identity cards |
| Hardware | Raspberry Pi 5 | Processing unit + GPIO host |
| Language | Python 3 | Application logic |
| NFC Library | nfcpy / custom nfc.py | NFC tag operations |
| Blockchain SDK | PyCardano | Wallet, minting, querying |
| Key Derivation | HD wallet (m/1852'/1815'/0') | Deterministic key generation |
| API | Blockfrost API | Blockchain data access |
| NFT Standard | CIP-25 | NFT metadata format |
| Blockchain | Cardano (Preprod) | Immutable identity storage |

## 6. Security Considerations

- Mnemonic-based key derivation (no key files on disk)
- Payment key: `m/1852'/1815'/0'/0/0`, Policy key: `m/1852'/1815'/0'/2/0`
- NFC tags use MiFare Classic authentication
- Private keys stored in `.env`, never committed
- Network auto-detection from Blockfrost API key prefix
- Verification is read-only (no private keys needed for checking identity)
