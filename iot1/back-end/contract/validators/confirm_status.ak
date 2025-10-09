use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{InlineDatum, OutputReference, Transaction, find_input}
use cardano/tx

// Define a custom data type `Datum` that holds the current environmental data.
// Each datum includes:
// - temperator (Int): The recorded temperature.
// - huminity (Int): The recorded humidity.
// - owner (VerificationKeyHash): The public key hash of the authorized owner who can update or withdraw data.
pub type Datum {
  temperator: Int,
  huminity: Int,
  owner: VerificationKeyHash,
}

// Define a custom `Redeemer` type, which represents the action the user wants to perform.
// Two possible actions:
// - Update: Allows updating the temperature and humidity values.
// - Withdraw: Allows withdrawal of data only under certain conditions.
pub type Redeemer {
  Update
  Withdraw
}

validator confirm_status {
  // The `spend` entry point is called when an input using this validator is being spent.
  // Parameters:
  // - datum_option: The optional datum attached to the input being validated.
  // - redeemer: The action requested (Update or Withdraw).
  // - output_reference: The reference to the specific input UTxO being validated.
  // - transaction: The full transaction attempting to spend this UTxO.
  spend(
    datum_option: Option<Datum>,
    redeemer: Redeemer,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum_input) = datum_option
    let Transaction { inputs, extra_signatories, .. } = transaction
    expect Some(input) = find_input(inputs, output_reference)
    expect InlineDatum(datum_output_inline) = input.output.datum

    expect datum_output: Datum = datum_output_inline

    when tx.verify_signature(extra_signatories, datum_input.owner) is {
      True ->
        when redeemer is {
          // Case 1: Update
          // Allow the transaction if it's just an update (no further checks needed).
          Update -> True

          // Case 2: Withdraw
          // Allow withdrawal only if both the new temperature and humidity
          // are greater than or equal to the previous recorded values.
          Withdraw -> and {
              datum_output.temperator >= datum_input.temperator,
              datum_output.huminity >= datum_input.huminity,
            }
        }

      False -> False
    }
  }

  else(_) {
    fail
  }
}
