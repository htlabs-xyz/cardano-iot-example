use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{PolicyId, flatten, without_lovelace}
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, find_input,
}
use cardano/tx
use validation/find.{output_by_addr_value}

pub type Address {
  payment: VerificationKeyHash,
  stake: VerificationKeyHash,
}

pub type Datum {
  authority: Address,
  is_locked: Int,
}

pub type Redeemer {
  Status
  Authorize
}

// Validator: status_management
// Purpose: Controls the spending of UTxOs with embedded Datum that represents a lock/unlock state.
// Parameters:
// - owner: VerificationKeyHash → the designated owner who can authorize actions.
// Behavior:
// - If Redeemer = Status:
// * Toggles UTxO between locked (1) and unlocked (0).
// * Requires signature from either the owner or the authority.
// * Ensures authority cannot be changed.
// * Validates that the output UTxO matches the required state.
// - If Redeemer = Authorize:
// * Requires only the owner's signature.
// Security: Prevents unauthorized state transitions or authority changes.
validator status_management(owner: VerificationKeyHash) {
  mint(_redeemer: Void, _policy_id: PolicyId, transaction: Transaction) {
    let Transaction { extra_signatories, .. } = transaction
    tx.verify_signature(extra_signatories, owner)
  }

  spend(
    datum_opt: Option<Datum>,
    redeemer: Redeemer,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum_input) = datum_opt
    let Transaction { inputs, outputs, extra_signatories, .. } = transaction
    expect Some(input) = find_input(inputs, output_reference)
    let script_address = input.output.address
    let token =
      input.output.value
        |> without_lovelace()
    expect InlineDatum(datum_output_inline) = input.output.datum
    expect datum_output: Datum = datum_output_inline
    let owner_sign = tx.verify_signature(extra_signatories, owner)
    let authority_sign =
      tx.verify_signature(extra_signatories, datum_input.authority.payment)
    let change_authority = datum_input.authority == datum_output.authority
    let utxo_output = output_by_addr_value(outputs, script_address, token)

    when redeemer is {
      // Status: Handle the logic for when the lock status of the datum changes.
      // This ensures that UTxOs are validated correctly depending on whether
      // the contract is in a "locked" or "unlocked" state.
      Status ->
        when datum_input.is_locked == 0 is {
          // Case: The datum is unlocked (is_locked == 0).
          // Requirements:
          // - Ensure exactly 1 UTxO is produced in the output.
          // - Either the owner or the authority must sign the transaction.
          // - The authority can be updated if required.
          // - The output datum must keep the same lock status as the input.
          True -> and {
              check_output_utxo(utxo_output, 1),
              or {
                owner_sign,
                authority_sign,
              },
              change_authority,
              datum_output.is_locked == datum_input.is_locked,
            }
          // Case: The datum is locked (is_locked != 0).
          // Requirements are the same as the unlocked case,
          // except that the output UTxO must contain 0.
          False -> and {
              check_output_utxo(utxo_output, 0),
              or {
                owner_sign,
                authority_sign,
              },
              change_authority,
              datum_output.is_locked == datum_input.is_locked,
            }
        }
      // Authorize: Only allow execution if the transaction is signed by the owner.
      // This ensures sensitive operations are restricted to the contract owner.
      Authorize -> owner_sign
    }
  }

  else(_) {
    fail
  }
}

// Function: check_output_utxo
// Purpose: Validates the newly created output UTxO when the state is toggled.
// Parameters:
// - output: Output → the UTxO produced by the transaction at the same script address.
// - is_lock: Int → expected lock state (0 = unlocked, 1 = locked).
// Behavior: 
// - Ensures the output contains an InlineDatum of type Datum.
// - Verifies that the is_locked field in the Datum matches the expected state.
// - Validates that the output carries exactly one type of token (excluding lovelace).
// Security: Prevents invalid or malformed UTxOs from being created as replacements.
pub fn check_output_utxo(output: Output, is_lock: Int) -> Bool {
  expect InlineDatum(data) = output.datum
  expect datum: Datum = data
  let output_value =
    output.value
      |> without_lovelace()
      |> flatten()
  and {
    datum.is_locked == is_lock,
    list.length(output_value) == 1,
  }
}
