import { NextRequest, NextResponse } from 'next/server';
import { stringToHex } from '@meshsdk/core';
import { ServerLockerContract } from '@/lib/server-locker-contract';
import { withErrorHandling, corsHeaders } from '@/lib/api-handler';

const LOCK_TITLE = process.env.NEXT_PUBLIC_LOCK_TITLE || '17112003';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const ownerAddress = searchParams.get('owner');

  if (!ownerAddress) {
    return NextResponse.json(
      { error: 'Owner address required. Pass ?owner=addr_xxx' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const contract = new ServerLockerContract({
    ownerAddress,
    lockTitle: LOCK_TITLE,
  });

  const status = await contract.getStatus();

  return NextResponse.json(
    {
      ...status,
      policyId: contract.policyId,
      assetUnit: contract.policyId + stringToHex(LOCK_TITLE),
      lockerAddress: contract.getLockerAddress(),
      lockTitle: LOCK_TITLE,
    },
    {
      headers: {
        ...corsHeaders(),
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
      },
    }
  );
});
