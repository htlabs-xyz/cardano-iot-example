use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Credential}
use cardano/transaction.{OutputReference, Transaction}

pub type MintRedeemer {
  Mint
  Burn
}

pub type StoreRedeemer {
  Update
  Remove
}

validator contract(_issuer: VerificationKeyHash) {
  spend(
    _datum: Option<Data>,
    redeemer: StoreRedeemer,
    _utxo: OutputReference,
    _self: Transaction,
  ) {
    when redeemer is {
      Update -> True
      Remove -> True
    }
  }

  mint(redeemer: MintRedeemer, _account: Credential, _self: Transaction) {
    when redeemer is {
      Mint -> True
      Burn -> True
    }
  }

  else(_) {
    fail
  }
}
