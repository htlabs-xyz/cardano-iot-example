use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{
  InlineDatum, Output, OutputReference, Transaction, find_input,
}
use types/cip68.{CIP68}

pub type StoreRedeemer {
  Update
  Remove
}

validator store(
  platform: VerificationKeyHash,
  platform_fee: Int,
  issuer: VerificationKeyHash,
) {
  spend(
    datum: Option<CIP68>,
    redeemer: StoreRedeemer,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum_input) = datum
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
