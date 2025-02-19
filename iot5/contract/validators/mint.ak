use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/assets.{PolicyId, without_lovelace}
use cardano/transaction.{Transaction}

pub type MintRedeemer {
  Mint
  Burn
}

validator mint(
  platform: VerificationKeyHash,
  platform_fee: Int,
  store_payment_credential: ScriptHash,
  store_stake_credential: VerificationKeyHash,
  issuer: VerificationKeyHash,
) {
  mint(redeemer: MintRedeemer, policy_id: PolicyId, transaction: Transaction) {
    when redeemer is {
      Mint -> True
      Burn -> True
    }
  }

  else(_) {
    fail
  }
}
