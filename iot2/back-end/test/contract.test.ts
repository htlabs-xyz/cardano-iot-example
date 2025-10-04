/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { MeshWallet } from '@meshsdk/core';
import { config } from 'dotenv';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
config();
describe('Status Management', function () {
  let txHashTemp: string;
  let meshWallet: MeshWallet;

  /**
   * Before each test:
   * - Create a new MeshWallet instance using Blockfrost as fetcher & submitter.
   * - Use mnemonic from environment variables (AUTHORIZOR or OWNER).
   */
  beforeEach(async function () {
    meshWallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.OWNER?.split(' ') || [],
        //words: process.env.AUTHORIZOR?.split(' ') || [],
      },
    });
  });
  jest.setTimeout(60000);

  /**
   * Test Case: Lock
   * Goal: Mint or update the status token with "locked" state.
   * Steps:
   * - Call lock() from StatusManagement.
   * - Sign and submit the transaction using meshWallet.
   * - Wait for confirmation and validate transaction hash length.
   */
  test('Lock', async function () {
    return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      meshWallet: meshWallet,
    });

    const unsignedTx: string = await confirmStatusContract.lock({
      title: 'The Lock',
    });

    const signedTx = await meshWallet.signTx(unsignedTx, true);
    const txHash = await meshWallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  /**
   * Test Case: Un Lock
   * Goal: Update the status token to "unlocked" state.
   * Steps:
   * - Call unLock() from StatusManagement.
   * - Sign and submit the transaction using meshWallet.
   * - Wait for confirmation and validate transaction hash length.
   */
  test('Un Lock', async function () {
    //return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      meshWallet: meshWallet,
    });

    const unsignedTx: string = await confirmStatusContract.unLock({
      title: 'The Lock',
    });

    const signedTx = await meshWallet.signTx(unsignedTx, true);
    const txHash = await meshWallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  /**
   * Test Case: Authority
   * Purpose:
   *   Ensure that the authority (authorized wallet address) of a status token
   *   can be updated.
   *
   * Steps:
   *   1. Initialize StatusManagement with the test wallet.
   *   2. Call `authorize()` with the token title and a new authority address.
   *   3. Sign the unsigned transaction with the MeshWallet.
   *   4. Submit the signed transaction to the blockchain.
   *   5. Wait for Blockfrost confirmation of the transaction.
   *
   * Expected Result:
   *   - The token should be re-minted with the new authority address stored in datum.
   *   - Transaction hash must be 64 characters long (valid Cardano tx hash).
   */
  test('Authority', async function () {
    return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      meshWallet: meshWallet,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: 'The Lock',
      authority:
        'addr_test1qrv637xpe50vza430d0wa9gvff7d0sh6m5plwqhg6v7fjarqt7gag4c7fepupml5eu9z054z5ystx5uz8f4kahlcpmwqhhvq5e',
    });
    const signedTx = await meshWallet.signTx(unsignedTx, true);
    const txHash = await meshWallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });
});
