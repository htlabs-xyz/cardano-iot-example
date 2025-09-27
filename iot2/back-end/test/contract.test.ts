/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { deserializeAddress, MeshWallet } from '@meshsdk/core';
import { config } from 'dotenv';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
config();
describe('Marketplace', function () {
  let txHashTemp: string;
  let meshWallet: MeshWallet;
  beforeEach(async function () {
    meshWallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.OWNER?.split(" ") || [],
        // words: process.env.AUTHORIZOR?.split(' ') || [],
      },
    });
  });
  jest.setTimeout(60000);

  test('Lock', async function () {
    // return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      meshWallet: meshWallet,
    });
    
    const unsignedTx: string = await confirmStatusContract.lock({
      title: process.env.LOCK_NAME ?? '',
      isLock: 1,
    });

    console.log(unsignedTx)

    const signedTx = await meshWallet.signTx(unsignedTx, true);
    const txHash = await meshWallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  test('Un Lock', async function () {
    return;
    // const confirmStatusContract: StatusManagement = new StatusManagement({
    //   meshWallet: meshWallet,
    // });
   
    // const unsignedTx: string = await confirmStatusContract.unLock({
    //   title: process.env.LOCK_NAME ?? '',
    //   authorityPaymentKeyHash,
    //   isLock: 0,
    // });

    // const signedTx = await meshWallet.signTx(unsignedTx, true);
    // const txHash = await meshWallet.submitTx(signedTx);
    // console.log('https://preprod.cexplorer.io/tx/' + txHash);
    // txHashTemp = txHash;
    // blockfrostProvider.onTxConfirmed(txHash, () => {
    //   expect(txHash.length).toBe(64);
    // });
  });

  test('Authority', async function () {
    // return;
    // const confirmStatusContract: StatusManagement = new StatusManagement({
    //   meshWallet: meshWallet,
    // });

    // const unsignedTx: string = await confirmStatusContract.authorize({
    //   title: process.env.LOCK_NAME ?? '',
    // });
    // const signedTx = await wallet.signTx(unsignedTx, true);
    // const txHash = await wallet.submitTx(signedTx);
    // console.log('https://preprod.cexplorer.io/tx/' + txHash);
    // txHashTemp = txHash;
    // blockfrostProvider.onTxConfirmed(txHash, () => {
    //   expect(txHash.length).toBe(64);
    // });
  });
});
