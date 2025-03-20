/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';
import { StatusManagement } from '../contract/scripts';
import { config } from 'dotenv';
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
        words: process.env.SELLER?.split(' ') || [],
        // words: process.env.BUYER?.split(" ") || [],
      },
    });
  });
  jest.setTimeout(60000);

  test('Lock', async function () {
    return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: wallet,
    });
    const unsignedTx: string = await confirmStatusContract.lock({
      title: 'The Safe',
      authority: '',
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
    //return;
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: wallet,
    });
    console.log(wallet.getChangeAddress());
    const unsignedTx: string = await confirmStatusContract.unLock({
      title: 'The Safe',
      authority:
        'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
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
      title: 'The Safe',
      authority:
        'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
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
