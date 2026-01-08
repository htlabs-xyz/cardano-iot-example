import { NextRequest, NextResponse } from 'next/server';
import { ServerLockerContract } from '@/lib/server-locker-contract';
import { withErrorHandling, corsHeaders } from '@/lib/api-handler';
import { validateTxBuildRequest } from '@/lib/validation';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { walletAddress } = validateTxBuildRequest(body);

  const contract = new ServerLockerContract({
    ownerAddress: walletAddress,
  });

  const unsignedTx = await contract.buildUnlock(walletAddress);

  return NextResponse.json(
    {
      success: true,
      unsignedTx,
      policyId: contract.policyId,
      lockerAddress: contract.getLockerAddress(),
    },
    { headers: corsHeaders() }
  );
});
