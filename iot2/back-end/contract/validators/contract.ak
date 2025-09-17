use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{flatten, without_lovelace}
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, find_input,
}
use cardano/tx
use validation/find.{output_by_addr_value}

pub type Datum {
  authority: VerificationKeyHash,
  is_locked: Int,
}

pub type Redeemer {
  Status
  Authorize
}

validator status_management(owner: VerificationKeyHash) {
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
      tx.verify_signature(extra_signatories, datum_input.authority)
    let change_authority = datum_input.authority == datum_output.authority
    let utxo_output = output_by_addr_value(outputs, script_address, token)
    when redeemer is {
      Status ->
        when datum_input.is_locked == 0 is {
          True -> and {
              check_output_utxo(utxo_output, 1),
              or {
                owner_sign,
                authority_sign,
              },
              change_authority,
              datum_output.is_locked == datum_input.is_locked,
            }
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
      Authorize -> owner_sign
    }
  }

  else(_) {
    fail
  }
}

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
