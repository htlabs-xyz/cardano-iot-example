// app/api/users/route.ts
import { appNetworkId } from "@/constants";
import { Cip68Contract } from "@/contract";
import { blockfrostFetcher, blockfrostProvider } from "@/lib/cardano";
import { AssetDetails, TransactionAsset } from "@/types";
import { datumToJson } from "@/utils";
import { deserializeAddress, MeshWallet } from "@meshsdk/core";
import { isNil } from "lodash";
import { NextResponse, NextRequest } from "next/server";

function getNextLocation(currentLocation: string, waypoints: string, endLocation: string): string {
    if (!waypoints) {
        return endLocation;
    }

    const waypointList = waypoints.split(",").map((wp) => wp.trim());
    const currentIndex = waypointList.indexOf(currentLocation);

    if (currentIndex === -1) {
        return waypointList[0] || endLocation;
    }

    if (currentIndex < waypointList.length - 1) {
        return waypointList[currentIndex + 1];
    }

    return endLocation;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { unit } = body;

        if (!unit || typeof unit !== "string") {
            return NextResponse.json({ error: "Invalid or missing 'unit' in request body" }, { status: 400 });
        }

        const assetDetails: AssetDetails = await blockfrostFetcher.fetchSpecificAsset(unit);
        const userAssetsDetails = await blockfrostFetcher.fetchSpecificAsset(unit.replace("000643b0", "000de140"));

        if (isNil(assetDetails)) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        assetDetails.quantity = userAssetsDetails.quantity;

        if (isNil(assetDetails)) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        const assetTxs: TransactionAsset[] = await blockfrostFetcher.fetchAssetTransactions(unit);
        const transaction = await blockfrostFetcher.fetchTransactionsUTxO(assetTxs[0].tx_hash);

        const assetOutput = transaction.outputs.find((output) => output.amount.some((amt) => amt.unit === unit));

        const metadata = assetOutput?.inline_datum
            ? ((await datumToJson(assetOutput.inline_datum, {
                  contain_pk: true,
              })) as Record<string, string>)
            : {};

        const location = getNextLocation(metadata.location, metadata.waypoints, metadata.endLocation);

        const meshWallet = new MeshWallet({
            networkId: appNetworkId,
            fetcher: blockfrostProvider,
            submitter: blockfrostProvider,
            key: {
                type: "mnemonic",
                words: process.env.APP_MNEMONIC?.split(" ") || [],
            },
        });

        const cip68Contract: Cip68Contract = new Cip68Contract({
            wallet: meshWallet,
        });

        const pubKeyHash = deserializeAddress(meshWallet.getChangeAddress()).pubKeyHash;

        const unsignedTx = await cip68Contract.update([
            {
                assetName: "",
                unit: unit,
                metadata: {
                    ...metadata,
                    location: location,
                },
            },
        ]);

        const signedTx = await meshWallet.signTx(unsignedTx, true);
        const txHash = await meshWallet.submitTx(signedTx);

        // Wait for transaction confirmation
        await new Promise<void>((resolve, reject) => {
            blockfrostProvider.onTxConfirmed(txHash, () => {
                resolve();
            });
        });

        return NextResponse.json({ message: `https://preprod.cexplorer.io/tx/${txHash}` }, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
