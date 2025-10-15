use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, find_input,
}
use types/cip68.{CIP68}

validator decentralize_identity {
  spend(
    datum: Option<CIP68>,
    redeemer: Void,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    True
  }

  else(_) {
    fail
  }
}
