# Student NFC Identity on Cardano

Decentralized student identification system using NFC tags verified against Cardano blockchain NFTs.

## Features

- **NFT-based Identity**: Each student has a unique NFT on Cardano
- **Blockchain Verification**: Verify identity via blockchain instead of database
- **NFC Integration**: MiFare Classic tags store NFT references
- **CIP-25 Compliant**: Standard NFT metadata format

## Hardware Requirements

- **PN532 NFC/RFID Reader Module** (SPI)
- **MiFare Classic 1K NFC Cards**
- **Raspberry Pi** with GPIO support

## Connection

| PN532 Pin | Raspberry Pi Pin |
| --------- | ---------------- |
| SCK       | SCK (GPIO 11)    |
| MOSI      | MOSI (GPIO 10)   |
| MISO      | MISO (GPIO 9)    |
| CS        | D5 (GPIO 5)      |
| GND       | GND              |
| VCC       | 3.3V             |

## Installation

```bash
sudo apt install build-essential python3-dev
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Configuration

```env
BLOCKFROST_PROJECT_ID=preprodXXXXXXXXXXXXXXXXXXXXXX
MNEMONIC=your 24 word mnemonic phrase here
```

Network auto-detected from API key prefix (preprod/mainnet/preview).

## Wallet

No key files! Keys derived from mnemonic:

- Payment: `m/1852'/1815'/0'/0/0`
- Policy: `m/1852'/1815'/0'/2/0`

```bash
python -c "from cardano import get_address; print(get_address())"
```

## Usage

### Register Student (Mint + Write NFC)

```bash
python register_student.py
```

Interactive prompts → Mint NFT → Write to NFC → Done!

### Mint Only

```bash
python mint_student.py
```

```
Student ID: 2025001
Full Name: Nguyen Van A
Department [Computer Science]:
NFC UID (optional):

✓ NFT MINTED
```

### Verify Student

```bash
python verify_student.py           # Single scan
python verify_student.py -c        # Continuous mode
```

```
✓ STUDENT VERIFIED
==================================================
  Student ID: 2025001
  Name: Nguyen Van A
  Department: Computer Science
  Issued: 2025-12-04
```

### Write NFC Only

```bash
python write_student_tag.py --policy <id> --asset <hex> --id <student_id>
```

## Project Structure

```
├── config.py              # Configuration
├── cardano.py             # Blockchain wrapper (MeshSDK-style)
├── nfc.py                 # NFC read/write
├── register_student.py    # Mint + Write NFC (interactive)
├── mint_student.py        # Mint only (interactive)
├── verify_student.py      # Verify via NFC + blockchain
├── write_student_tag.py   # Write NFC only (CLI)
├── .env                   # Config (not committed)
└── .env.example           # Template
```

## NFT Metadata (CIP-25)

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

## NFC Tag Data

```json
{ "p": "policy_id", "a": "asset_hex", "s": "student_id" }
```

## Verification Flow

```
Scan NFC → Query Blockchain → Validate → ✓/✗
```

## Troubleshooting

| Issue            | Solution                     |
| ---------------- | ---------------------------- |
| Auth failed      | Check MiFare Classic 1K card |
| NFT not found    | Wait 1-2 min for indexing    |
| Connection error | Check API key in .env        |

## Resources

- [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
- [Blockfrost](https://blockfrost.io/)
- [PyCardano](https://github.com/Python-Cardano/pycardano)
- [CIP-25](https://cips.cardano.org/cip/CIP-25)
