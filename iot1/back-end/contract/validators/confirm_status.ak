use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{InlineDatum, OutputReference, Transaction, find_input}
use cardano/tx

pub type Datum {
  temperator: Int,
  huminity: Int,
  owner: VerificationKeyHash,
}

pub type Redeemer {
  Update
  Withdraw
}

validator confirm_status {
  spend(
    datum_otp: Option<Datum>,
    redeemer: Redeemer,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum_input) = datum_otp
    let Transaction { inputs, extra_signatories, .. } = transaction
    expect Some(input) = find_input(inputs, output_reference)
    expect InlineDatum(datum_output_inline) = input.output.datum
    expect datum_output: Datum = datum_output_inline
    when tx.verify_signature(extra_signatories, datum_input.owner) is {
      True ->
        when redeemer is {
          Update -> True
          Withdraw -> and {
              datum_output.temperator >= datum_input.temperator,
              datum_output.huminity >= datum_input.huminity,
            }
        }

      False -> False
    }
  }

  else(_) {
    fail
  }
}
