import { NextRequest, NextResponse } from 'next/server';
import { deserializeDatum, serializeAddressObj, pubKeyAddress } from '@meshsdk/core';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export const GET = (async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unit = searchParams.get('unit');

    if (!unit) {
      throw new Error('unit is required')
    }

    const blockfrostApi = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY || '',
    });
    // Get the latest transaction to find current UTxO
    const txs = await blockfrostApi.assetsTransactions(unit, { order: 'desc', count: 1 });
    if (!txs || txs.length === 0) {
      throw new Error('this locker not init')
    }
    // Get UTxO from latest tx
    const utxo = await blockfrostApi.txsUtxos(txs[0].tx_hash);
    const datum = deserializeDatum(utxo.outputs[0].inline_datum || "")
    const authority = serializeAddressObj(
      pubKeyAddress(
        datum.fields[0].fields[0].bytes,
        datum.fields[0].fields[1].bytes,
        false,
      ),
      0,
    );
    const isLocked = datum.fields[1].int === 1;

    return NextResponse.json(
      {
        exists: true,
        isLocked,
        authority,
        unit,
      },
    );
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
});
