use aiken/collection/list
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use cardano/tx.{verify_signature}
use cocktail/vodka_address.{address_pub_key}
use contract/types.{Burn, Create, Mint, Remove, Store, Update}
use types/cip68.{CIP68}

validator mint(owners: Address) {
  mint(redeemer: Mint, policy_id: PolicyId, transaction: Transaction) {
    let Transaction { extra_signatories, .. } = transaction
    when redeemer is {
      Create -> True
      Burn -> True
    }
  }

  else(_) {
    fail
  }
}

validator store(owners: Address) {
  spend(
    datum_option: Option<CIP68>,
    redeemer: Store,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    let Transaction { inputs, outputs, extra_signatories, .. } = transaction
    when redeemer is {
      Update -> True
      Remove -> True
    }
  }

  else(_) {
    fail
  }
}
