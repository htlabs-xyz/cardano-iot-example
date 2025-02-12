use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}
use cardano/tx

pub type Datum {
  owner: VerificationKeyHash,
  value: Int,
}

pub type Redeemer {
  Update
  Withdraw
}

validator confirm_status(value: Int) {
  spend(
    datum_otp: Option<Datum>,
    redeemer: Redeemer,
    _output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum) = datum_otp
    let Transaction { extra_signatories, .. } = transaction

    when tx.verify_signature(extra_signatories, datum.owner) is {
      True ->
        when redeemer is {
          Update -> True
          Withdraw -> value >= datum.value
        }

      False -> False
    }
  }

  else(_) {
    fail
  }
}
