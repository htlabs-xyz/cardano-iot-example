use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use contract/types.{Burn, Create, Mint, Remove, Store, Update}
use types/cip68.{CIP68}

validator mint {
  mint(redeemer: Mint, policy_id: PolicyId, transaction: Transaction) {
    when redeemer is {
      Create -> True
      Burn -> True
    }
  }

  else(_) {
    fail
  }
}

validator store {
  spend(
    datum_option: Option<CIP68>,
    redeemer: Store,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    when redeemer is {
      Update -> True
      Remove -> True
    }
  }

  else(_) {
    fail
  }
}
