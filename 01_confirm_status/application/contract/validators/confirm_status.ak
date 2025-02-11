use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  owner: VerificationKeyHash,
  value: Int,
}

pub type Redeemer =
  Void

validator confirm_status {
  spend(
    _datum_otp: Option<Datum>,
    _redeemer: Redeemer,
    _output_reference: OutputReference,
    _transaction: Transaction,
  ) {
    True
  }

  else(_) {
    fail
  }
}

