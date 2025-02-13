use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{flatten, without_lovelace}
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, find_input,
}
use cardano/tx
use validation/find.{output_by_addr_value}

pub type Datum {
  owner: VerificationKeyHash,
  authority: VerificationKeyHash,
  is_locked: Int,
}

pub type Redeemer {
  Status
  Authorize
}

validator status_management {
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
    let owner_sign = tx.verify_signature(extra_signatories, datum_input.owner)
    let authority_sign =
      tx.verify_signature(extra_signatories, datum_input.authority)
    let change_owner = datum_input.owner == datum_output.owner
    let change_authority = datum_input.authority == datum_output.authority
    let utxo_output = output_by_addr_value(outputs, script_address, token)
    when redeemer is {
      Status ->
        when datum_input.is_locked == 0 is {
          True -> and {
              check_output_utxo(utxo_output),
              or {
                owner_sign,
                authority_sign,
              },
              change_owner,
              change_authority,
              datum_output.is_locked == 1,
            }
          False -> and {
              check_output_utxo(utxo_output),
              or {
                owner_sign,
                authority_sign,
              },
              change_owner,
              change_authority,
              datum_output.is_locked == 0,
            }
        }
      Authorize -> and {
          owner_sign,
          change_owner,
          check_output_utxo(utxo_output),
        }
    }
  }

  else(_) {
    fail
  }
}

// check the output utxos containing the  token
pub fn check_output_utxo(output: Output) -> Bool {
  let output_value =
    output.value
      |> without_lovelace()
      |> flatten()
  list.length(output_value) == 1
}
