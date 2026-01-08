import { NextRequest, NextResponse } from 'next/server';
import { stringToHex } from '@meshsdk/core';
import { blockfrostApi } from '@/lib/blockfrost';
import { ServerLockerContract } from '@/lib/server-locker-contract';
import { withErrorHandling, corsHeaders } from '@/lib/api-handler';

const LOCK_TITLE = process.env.NEXT_PUBLIC_LOCK_TITLE || '17112003';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const ownerAddress = searchParams.get('owner');
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!ownerAddress) {
    return NextResponse.json(
      { error: 'Owner address required' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const contract = new ServerLockerContract({
    ownerAddress,
    lockTitle: LOCK_TITLE,
  });

  const assetUnit = contract.policyId + stringToHex(LOCK_TITLE);

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

  return NextResponse.json(
    {
      transactions,
      policyId: contract.policyId,
      assetUnit,
      count: transactions.length,
    },
    {
      headers: {
        ...corsHeaders(),
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=5',
      },
    }
  );
});
