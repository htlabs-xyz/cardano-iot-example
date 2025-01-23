use cardano/transaction.{OutputReference, Transaction}

validator contract {
  spend(
    _datum: Option<Void>,
    _redeemer: Void,
    _output_reference: OutputReference,
    _transaction: Transaction,
  ) {
    True
  }

  else(_) {
    fail
  }
}
