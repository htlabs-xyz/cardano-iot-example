use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{PolicyId, Value, Lovelace, from_asset}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction, TransactionId,
}
use cardano/tx
use sidan-lab-vodka/mocktail.{mock_address, mock_output, mocktail_tx, mock_vkey_hash}
use status_management.{
  Address, Datum, Redeemer, check_output_utxo, status_management,
}
use validation/find.{output_by_addr_value}

// Test suite for status_management validator
test status_management_tests() {
  // Mock data using mocktail
  let owner = mock_vkey_hash("owner1234567890abcdef")
  let authority = mock_address("auth_payment123", "auth_stake123")
  let script_address = mock_address("script_payment456", "script_stake456")
  let token_policy = PolicyId("token_policy789")
  let token_value = from_asset(token_policy, "token_name", 1)
  let input_value = Lovelace(1_000_000) + token_value
  let datum_unlocked = Datum { authority, is_locked: 0 }
  let datum_locked = Datum { authority, is_locked: 1 }
  let output_ref =
    OutputReference { transaction_id: TransactionId("tx123"), index: 0 }

  // Test 1: Mint with owner signature (should succeed)
  {
    let tx = mocktail_tx([], [], [owner])
    let result = status_management(owner).mint(Void, token_policy, tx)
    expect result == True
  }

  // Test 2: Mint without owner signature (should fail)
  {
    {
      let tx = mocktail_tx([], [], [])
      expect
        status_management(owner).mint(Void, token_policy, tx) |> cocktail.fails
    }

    // Test 3: Spend (Status) - Unlocked to Unlocked, owner signs (should succeed)
    {
      {
        let input =
          Input {
            output_reference: output_ref,
            output: mock_output(
              script_address,
              input_value,
              InlineDatum(datum_unlocked),
            ),
          }
        let output =
          mock_output(script_address, input_value, InlineDatum(datum_unlocked))
        let tx = mocktail_tx([input], [output], [owner])
        let result =
          status_management(owner).spend(
            Some(datum_unlocked),
            Status,
            output_ref,
            tx,
          )
        expect result == True
      }

      // Test 4: Spend (Status) - Locked to Locked, authority signs (should succeed)
      {
        {
          let input =
            Input {
              output_reference: output_ref,
              output: mock_output(
                script_address,
                input_value,
                InlineDatum(datum_locked),
              ),
            }
          let output =
            mock_output(script_address, input_value, InlineDatum(datum_locked))
          let tx = mocktail_tx([input], [output], [authority.payment])
          let result =
            status_management(owner).spend(
              Some(datum_locked),
              Status,
              output_ref,
              tx,
            )
          expect result == True
        }

        // Test 5: Spend (Status) - Unlocked, no valid signature (should fail)
        {
          {
            let input =
              Input {
                output_reference: output_ref,
                output: mock_output(
                  script_address,
                  input_value,
                  InlineDatum(datum_unlocked),
                ),
              }
            let output =
              mock_output(
                script_address,
                input_value,
                InlineDatum(datum_unlocked),
              )
            let tx = mocktail_tx([input], [output], [])
            expect
              status_management(owner).spend(
                Some(datum_unlocked),
                Status,
                output_ref,
                tx,
              )
                |> cocktail.fails
          }

          // Test 6: Spend (Status) - Unlocked to Locked (should fail, state mismatch)
          {
            {
              let input =
                Input {
                  output_reference: output_ref,
                  output: mock_output(
                    script_address,
                    input_value,
                    InlineDatum(datum_unlocked),
                  ),
                }
              let output =
                mock_output(
                  script_address,
                  input_value,
                  InlineDatum(datum_locked),
                )
              let tx = mocktail_tx([input], [output], [owner])
              expect
                status_management(owner).spend(
                  Some(datum_unlocked),
                  Status,
                  output_ref,
                  tx,
                )
                  |> cocktail.fails
            }

            // Test 7: Spend (Status) - Change authority (should succeed)
            {
              {
                let new_authority =
                  mock_address("new_auth_payment789", "new_auth_stake789")
                let new_datum = Datum { authority: new_authority, is_locked: 0 }
                let input =
                  Input {
                    output_reference: output_ref,
                    output: mock_output(
                      script_address,
                      input_value,
                      InlineDatum(datum_unlocked),
                    ),
                  }
                let output =
                  mock_output(
                    script_address,
                    input_value,
                    InlineDatum(new_datum),
                  )
                let tx = mocktail_tx([input], [output], [owner])
                let result =
                  status_management(owner).spend(
                    Some(datum_unlocked),
                    Status,
                    output_ref,
                    tx,
                  )
                expect result == True
              }

              // Test 8: Spend (Authorize) - Owner signs (should succeed)
              {
                {
                  let input =
                    Input {
                      output_reference: output_ref,
                      output: mock_output(
                        script_address,
                        input_value,
                        InlineDatum(datum_unlocked),
                      ),
                    }
                  let tx = mocktail_tx([input], [], [owner])
                  let result =
                    status_management(owner).spend(
                      Some(datum_unlocked),
                      Authorize,
                      output_ref,
                      tx,
                    )
                  expect result == True
                }

                // Test 9: Spend (Authorize) - Authority signs, not owner (should fail)
                {
                  {
                    let input =
                      Input {
                        output_reference: output_ref,
                        output: mock_output(
                          script_address,
                          input_value,
                          InlineDatum(datum_unlocked),
                        ),
                      }
                    let tx = mocktail_tx([input], [], [authority.payment])
                    expect
                      status_management(owner).spend(
                        Some(datum_unlocked),
                        Authorize,
                        output_ref,
                        tx,
                      )
                        |> cocktail.fails
                  }

                  // Test 10: check_output_utxo - Valid output (should succeed)
                  {
                    {
                      let output =
                        mock_output(
                          script_address,
                          input_value,
                          InlineDatum(datum_unlocked),
                        )
                      let result = check_output_utxo(output, 0)
                      expect result == True
                    }

                    // Test 11: check_output_utxo - Invalid lock state (should fail)
                    {
                      {
                        let output =
                          mock_output(
                            script_address,
                            input_value,
                            InlineDatum(datum_locked),
                          )
                        expect check_output_utxo(output, 0) |> cocktail.fails
                      }

                      // Test 12: check_output_utxo - Multiple tokens (should fail)
                      {
                        let invalid_value =
                          input_value + from_asset(
                            token_policy,
                            "another_token",
                            1,
                          )
                        let output =
                          mock_output(
                            script_address,
                            invalid_value,
                            InlineDatum(datum_unlocked),
                          )
                        expect check_output_utxo(output, 0) |> cocktail.fails
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
