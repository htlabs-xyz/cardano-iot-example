import { NextRequest, NextResponse } from 'next/server';
import {
  MeshWallet,
  stringToHex,
} from '@meshsdk/core';
import { blockfrostProvider } from '@/lib/blockfrost';
import { LockerContract } from '@/contract/offchain';

export const GET = (async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const ownerAddress = searchParams.get('owner');

    if (!title || !ownerAddress) {
      throw new Error('title and owner are required');
    }
    const wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'address',
        address: ownerAddress,
      },
    });

    const lockerContract = new LockerContract({
      wallet: wallet,
      provider: blockfrostProvider,
    });
    await lockerContract.ensureInitialized();
    const policyId = lockerContract.getPolicyId()
    const assetUnit = policyId + stringToHex(title);
    const utxos = await blockfrostProvider.fetchAddressUTxOs(lockerContract.lockerAddress, assetUnit);
    console.log(assetUnit)
    if (!utxos || utxos.length === 0) {
      return NextResponse.json(
        {
          exists: false,
          lockerAddress: lockerContract.lockerAddress,
          lockTitle: title,
        },
      );
    } else {
      return NextResponse.json(
        {
          exists: true,
          assetUnit:assetUnit,
          lockerAddress: lockerContract.lockerAddress,
          lockTitle: title,
        },
      );
    }
  } catch (e) {
    console.error(e);
    return Response.json({ data: null, message: e instanceof Error ? e.message : JSON.stringify(e) }, { status: 500 });
  }
});
