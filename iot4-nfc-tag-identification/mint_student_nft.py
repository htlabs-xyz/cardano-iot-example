#!/usr/bin/env python3
import argparse
import json
from datetime import datetime

from pycardano import (
    TransactionBuilder,
    TransactionOutput,
    Value,
    Metadata,
    AuxiliaryData,
    AlonzoMetadata,
    PaymentVerificationKey,
    MultiAsset,
    Asset,
    AssetName,
    Transaction,
    TransactionWitnessSet,
    VerificationKeyWitness,
)
from cardano import init_context, load_wallet, load_policy_key


def build_metadata(policy_id_hex, asset_name, student_id, name, department, nfc_uid):
    return {
        721: {
            policy_id_hex: {
                asset_name: {
                    "name": f"Student: {name}",
                    "student_id": student_id,
                    "student_name": name,
                    "department": department,
                    "nfc_uid": nfc_uid,
                    "issued_at": datetime.now().strftime("%Y-%m-%d"),
                    "issuer": "Student ID System",
                }
            }
        }
    }


def mint_student_nft(student_id, name, department, nfc_uid=""):
    print(f"\n=== Minting Student NFT ===")
    print(f"Student ID: {student_id}")
    print(f"Name: {name}")
    print(f"Department: {department}")
    print(f"NFC UID: {nfc_uid or 'Not provided'}")

    context = init_context()
    payment_skey, payment_vkey, address = load_wallet()
    print(f"Wallet address: {address}")

    utxos = context.utxos(str(address))
    if not utxos:
        print("ERROR: No UTXOs found. Please fund the wallet first.")
        print(f"Address: {address}")
        return None

    policy_skey, policy_vkey, policy_script, policy_id = load_policy_key()
    policy_id_hex = policy_id.payload.hex()
    print(f"Policy ID: {policy_id_hex}")

    asset_name = f"STU{student_id}"
    asset_name_bytes = asset_name.encode("utf-8")
    asset_name_hex = asset_name_bytes.hex()

    metadata = build_metadata(
        policy_id_hex, asset_name, student_id, name, department, nfc_uid
    )
    auxiliary_data = AuxiliaryData(AlonzoMetadata(metadata=Metadata(metadata)))

    my_nft = MultiAsset()
    my_nft[policy_id] = Asset({AssetName(asset_name_bytes): 1})

    builder = TransactionBuilder(context)
    builder.add_input_address(address)
    builder.mint = my_nft
    builder.native_scripts = [policy_script]
    builder.auxiliary_data = auxiliary_data

    min_val = Value(2000000, my_nft)
    output = TransactionOutput(address, min_val)
    builder.add_output(output)

    print("Building transaction...")
    tx_body = builder.build(change_address=address)

    print("Signing transaction...")
    witness_set = TransactionWitnessSet()
    witness_set.vkey_witnesses = [
        VerificationKeyWitness(payment_vkey, payment_skey.sign(tx_body.hash())),
        VerificationKeyWitness(policy_vkey, policy_skey.sign(tx_body.hash())),
    ]
    witness_set.native_scripts = [policy_script]

    signed_tx = Transaction(tx_body, witness_set, auxiliary_data=auxiliary_data)

    print("Submitting transaction...")
    tx_id = context.submit_tx(signed_tx)
    print(f"✓ Transaction submitted: {tx_id}")

    result = {
        "tx_id": str(tx_id),
        "policy_id": policy_id_hex,
        "asset_name": asset_name,
        "asset_name_hex": asset_name_hex,
        "student_id": student_id,
        "student_name": name,
        "department": department,
    }

    print(f"\n=== NFT Minted Successfully ===")
    print(json.dumps(result, indent=2))

    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mint student identity NFT")
    parser.add_argument("--id", required=True, help="Student ID")
    parser.add_argument("--name", required=True, help="Student name")
    parser.add_argument("--dept", required=True, help="Department")
    parser.add_argument("--nfc", default="", help="NFC tag UID (optional)")

    args = parser.parse_args()

    result = mint_student_nft(
        student_id=args.id, name=args.name, department=args.dept, nfc_uid=args.nfc
    )

    if result:
        print("\nTo write to NFC tag, run:")
        print(
            f"python write_student_tag.py --policy {result['policy_id']} "
            f"--asset {result['asset_name_hex']} --id {result['student_id']}"
        )
