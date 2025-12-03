#!/usr/bin/env python3
import json
import sys
from nfc import init_pn532, read_json_from_nfc
from cardano import query_asset, get_asset_metadata, check_connection
from config import validate_config


def read_nfc_data(pn532):
    print("\n=== Reading NFC Tag ===")
    print("Place student card on reader...")
    data = read_json_from_nfc(pn532, num_blocks=8, debug=False)
    return data


def verify_on_blockchain(policy_id, asset_name_hex, student_id):
    print("\n=== Querying Blockchain ===")
    print(f"Policy ID: {policy_id}")
    print(f"Asset Name Hex: {asset_name_hex}")

    asset = query_asset(policy_id, asset_name_hex)

    if not asset:
        return {
            "verified": False,
            "error": "NFT not found on blockchain",
            "student_id": student_id,
        }

    metadata = asset.get("onchain_metadata", {})
    onchain_student_id = metadata.get("student_id", "")

    if str(onchain_student_id) != str(student_id):
        return {
            "verified": False,
            "error": "Student ID mismatch",
            "nfc_student_id": student_id,
            "blockchain_student_id": onchain_student_id,
        }

    return {
        "verified": True,
        "student_id": onchain_student_id,
        "student_name": metadata.get("student_name", ""),
        "department": metadata.get("department", ""),
        "issued_at": metadata.get("issued_at", ""),
        "policy_id": policy_id,
        "asset_name": asset.get("asset_name", ""),
        "mint_quantity": asset.get("quantity", ""),
    }


def verify_student():
    errors = validate_config()
    if errors:
        print("Configuration errors:")
        for e in errors:
            print(f"  - {e}")
        return None

    print("Checking blockchain connection...")
    if not check_connection():
        print("ERROR: Cannot connect to Blockfrost API")
        return None
    print("✓ Connected to Blockfrost")

    pn532 = init_pn532()
    nfc_data = read_nfc_data(pn532)

    if not nfc_data:
        print("ERROR: Could not read NFC tag")
        return None

    required_fields = ["p", "a", "s"]
    missing = [f for f in required_fields if f not in nfc_data]
    if missing:
        print(f"ERROR: Invalid NFC data - missing fields: {missing}")
        return None

    policy_id = nfc_data["p"]
    asset_name_hex = nfc_data["a"]
    student_id = nfc_data["s"]

    if len(policy_id) < 56:
        print("WARNING: Policy ID appears truncated, attempting lookup...")

    result = verify_on_blockchain(policy_id, asset_name_hex, student_id)

    print("\n" + "=" * 50)
    if result["verified"]:
        print("✓ STUDENT VERIFIED")
        print("=" * 50)
        print(f"  Student ID: {result['student_id']}")
        print(f"  Name: {result['student_name']}")
        print(f"  Department: {result['department']}")
        print(f"  Issued: {result['issued_at']}")
    else:
        print("✗ VERIFICATION FAILED")
        print("=" * 50)
        print(f"  Error: {result.get('error', 'Unknown error')}")

    return result


def continuous_verify():
    errors = validate_config()
    if errors:
        print("Configuration errors:")
        for e in errors:
            print(f"  - {e}")
        return

    print("Checking blockchain connection...")
    if not check_connection():
        print("ERROR: Cannot connect to Blockfrost API")
        return
    print("✓ Connected to Blockfrost")

    pn532 = init_pn532()
    print("\n=== Continuous Verification Mode ===")
    print("Place student cards on reader (Ctrl+C to exit)\n")

    while True:
        try:
            nfc_data = read_nfc_data(pn532)
            if nfc_data and all(f in nfc_data for f in ["p", "a", "s"]):
                result = verify_on_blockchain(
                    nfc_data["p"], nfc_data["a"], nfc_data["s"]
                )
                print("\n" + "=" * 50)
                if result["verified"]:
                    print("✓ VERIFIED:", result["student_name"])
                else:
                    print("✗ FAILED:", result.get("error", "Unknown"))
                print("=" * 50 + "\n")
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Verify student via NFC + blockchain")
    parser.add_argument(
        "--continuous", "-c", action="store_true", help="Continuous verification mode"
    )
    args = parser.parse_args()

    if args.continuous:
        continuous_verify()
    else:
        verify_student()
