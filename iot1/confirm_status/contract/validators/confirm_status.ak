use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}
use cardano/tx

pub type Datum {
  owner: VerificationKeyHash,
  value: Int,
}

pub type Redeemer =
  Void

validator confirm_status {
  spend(
    datum_otp: Option<Datum>,
    _redeemer: Redeemer,
    _output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum) = datum_otp
    let Transaction { extra_signatories, .. } = transaction

    tx.verify_signature(extra_signatories, datum.owner)
  }

  else(_) {
    fail
  }
}
