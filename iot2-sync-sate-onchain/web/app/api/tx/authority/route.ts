import { NextRequest, NextResponse } from 'next/server';
import { validateAuthorityRequest } from '@/lib/validation';
import { hexToString, MeshWallet, parseAssetUnit } from '@meshsdk/core';
import { blockfrostProvider } from '@/lib/blockfrost';
import { LockerContract } from '@/contract/offchain';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { walletAddress, unit, newAuthority } = validateAuthorityRequest(body);
    const wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'address',
        address: walletAddress,
      },
    });

    const lockerContract = new LockerContract({
      wallet: wallet,
      provider: blockfrostProvider,
    });
    await lockerContract.ensureInitialized();

    const { assetName } = parseAssetUnit(unit);
    const unsignedTx = await lockerContract.authorize({
      title: hexToString(assetName),
      authority: newAuthority,
    });

    return NextResponse.json({
      success: true,
      unsignedTx,
    });
  } catch (e) {
    console.error(e);
    return Response.json(
      { data: null, message: e instanceof Error ? e.message : JSON.stringify(e) },
      { status: 500 }
    );
  }
};
