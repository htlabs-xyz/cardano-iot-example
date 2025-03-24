/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */

import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { beforeEach, describe, jest, test } from '@jest/globals';
import { deserializeDatum, MeshWallet } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';

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
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
    // console.log('wallet', wallet);
  });
  jest.setTimeout(60000);

  test('GET Temperature', async function () {
    const policyIdAndHexEncoded =
      'a48dfba612b9f49bded45de5fb348b3c22aa7c65383217d1d9574a5b' +
      '54656d7065726174757265';
    const transactions = await API.assetsTransactions(policyIdAndHexEncoded);
    //console.log("transaction:", transaction)
    const utxos = await Promise.all(
      transactions.map(async (x) => await API.txsUtxos(x.tx_hash)),
    );
    console.log('utxos:', utxos);
    const outputs = utxos.map((utxo) => utxo.outputs[0]);
    const datums = outputs.map((output) => output.inline_datum);
    console.log('datums: ', datums);
    const datum_deserialize = datums.map((x) => {
      if (x != null) return deserializeDatum(x ?? '');
    });
    console.log('datum_deserialize:', datum_deserialize);
    console.log(
      'ouput:',
      datum_deserialize.map((x) => {
        if (x != undefined && x.fields[1].int && x.fields[1].int != undefined)
          return x.fields[1].int;
      }),
    );
  });

  test('Temperature', async function () {
    return;
  });

  test('Withdraw', async function () {
    return;
  });
});
