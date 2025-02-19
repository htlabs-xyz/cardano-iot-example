

validator decentralize_identity {
  spend(
    datum: Option<CIP68>,
    redeemer: Void,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    todo
  }

  else(_) {
    fail
  }
}
