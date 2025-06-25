/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';

import { SupplyChainManagementContract } from 'contract/scripts';

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
        words: process.env.APP_WALLET?.split(' ') || [],
      },
    });
  });

  test('Write', async function () {
    const confirmStatusContract: SupplyChainManagementContract =
      new SupplyChainManagementContract({
        wallet: wallet,
      });
    const unsignedTx: string = await confirmStatusContract.write({
      assetName: 'Nguyễn Duy Khánh',
      metadata: {
        name: 'Nguyễn Duy Khánh',
      },
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  test('Read', async function () {
    const confirmStatusContract: SupplyChainManagementContract =
      new SupplyChainManagementContract({
        wallet: wallet,
      });
    const metadata = await confirmStatusContract.read({
      assetName: 'Nguyễn Duy Khánh',
    });

    console.log(metadata);
  });
});
