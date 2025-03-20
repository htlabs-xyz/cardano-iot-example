/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { deserializeDatum, MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';
import { ConfirmStatusContract } from '../contract/scripts';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

describe('Marketplace', function () {
  let txHashTemp: string;
  let wallet: MeshWallet;
  let API: BlockFrostAPI;
  const mnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon beef crack';
  beforeEach(async function () {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: mnemonic?.split(' ') || [],
      },
    });
    API = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? "",
    });
    // console.log('wallet', wallet);
  });
  jest.setTimeout(60000);

  test('GET Temperature', async function () {
    const policyIdAndHexEncoded = "a48dfba612b9f49bded45de5fb348b3c22aa7c65383217d1d9574a5b" + "54656d7065726174757265";
    const transactions = await API.assetsTransactions(policyIdAndHexEncoded);
    //console.log("transaction:", transaction)
    const utxos = await Promise.all(transactions.map(async (x) => await API.txsUtxos(x.tx_hash)));
    console.log("utxos:", utxos)
    const datums = utxos.map(utxo => utxo.outputs.map(x => x.inline_datum ?? deserializeDatum(x.inline_datum ?? "")))
    console.log("datums:", datums)
  });

  test('Temperature', async function () {
    return;

    // wallet = new MeshWallet({
    //   networkId: 0,
    //   fetcher: blockfrostProvider,
    //   submitter: blockfrostProvider,
    //   key: {
    //     type: 'mnemonic',
    //     words: mnemonic?.split(' ') || [],
    //   },
    // });
    // console.log('wallet', wallet);
    var addr = await wallet.getChangeAddress();
    console.log('addr:', addr);
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: wallet,
      });
    const unsignedTx: string = await confirmStatusContract.confirm({
      title: 'Temperature',
      value: 4000000,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  test('Withdraw', async function () {
    return;
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: wallet,
      });
    const unsignedTx: string = await confirmStatusContract.withdraw({
      title: 'Temperature',
      value: 40000000,
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
