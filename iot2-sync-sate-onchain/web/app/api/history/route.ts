import { NextRequest, NextResponse } from 'next/server';
import {
  applyParamsToScript,
  deserializeAddress,
  resolveScriptHash,
  stringToHex,
} from '@meshsdk/core';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import blueprint from '@/contract/plutus.json';

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerAddress = searchParams.get('owner');
    const title = searchParams.get('title');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!ownerAddress || !title) {
      return NextResponse.json(
        { error: 'Owner address and title required' },
        { status: 400 }
      );
    }

    // Compute policyId from owner address
    const pubKeyOwner = deserializeAddress(ownerAddress).pubKeyHash;
    const mintCompileCode = blueprint.validators.find(
      (v: any) => v.title === 'contract.locker.mint'
    )?.compiledCode;
    if (!mintCompileCode) {
      throw new Error('Mint validator not found');
    }
    const mintScriptCbor = applyParamsToScript(mintCompileCode, [pubKeyOwner]);
    const policyId = resolveScriptHash(mintScriptCbor, 'V3');

    const assetUnit = policyId + stringToHex(title);

    const blockfrostApi = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY || '',
    });

    let transactions: any[] = [];
    try {
      const txs = await blockfrostApi.assetsTransactions(assetUnit, {
        count: Math.min(limit, 50),
        order: 'desc',
      });

      transactions = txs.map((tx) => ({
        txHash: tx.tx_hash,
        blockHeight: tx.block_height,
        blockTime: tx.block_time,
        explorerUrl: `https://preprod.cexplorer.io/tx/${tx.tx_hash}`,
      }));
    } catch (error: any) {
      // Asset might not exist yet (404 from Blockfrost)
      if (error?.status_code !== 404) {
        throw error;
      }
    }

    return NextResponse.json({
      transactions,
      policyId,
      assetUnit,
      count: transactions.length,
    });
  } catch (e) {
    console.error(e);
    return Response.json(
      { data: null, message: e instanceof Error ? e.message : JSON.stringify(e) },
      { status: 500 }
    );
  }
};
