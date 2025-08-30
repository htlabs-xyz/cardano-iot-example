/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { MeshWallet } from '@meshsdk/core';
import { config } from 'dotenv';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
config();
describe('Marketplace', function () {
  let txHashTemp: string;
  let wallet: MeshWallet;
  beforeEach(async function () {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        // words: process.env.OWNER?.split(" ") || [],
        words: process.env.AUTHORIZOR?.split(' ') || [],
      },
    });
  });
  jest.setTimeout(60000);

  test('Lock', async function () {
    // return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: wallet,
    });
    const unsignedTx: string = await confirmStatusContract.lock({
      title: 'The Tidvn',
      authority: 'addr_test1qrv637xpe50vza430d0wa9gvff7d0sh6m5plwqhg6v7fjarqt7gag4c7fepupml5eu9z054z5ystx5uz8f4kahlcpmwqhhvq5e',
      isLock: 1,
    });
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  test('Un Lock', async function () {
    return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: wallet,
    });

    const unsignedTx: string = await confirmStatusContract.unLock({
      title: 'The Tidvn',
      authority:'',
      isLock: 0,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  test('Authority', async function () {
    return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: wallet,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: 'The Tidvn',
      authority:
        'addr_test1qrv637xpe50vza430d0wa9gvff7d0sh6m5plwqhg6v7fjarqt7gag4c7fepupml5eu9z054z5ystx5uz8f4kahlcpmwqhhvq5e',
      isLock: 1,
    });
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });
});
