"use server";

import { blockfrostFetcher } from "@/lib/cardano";
import { AssetDetails, SpecialTransaction, TransactionAsset, TransactionHistory } from "@/types";
import { datumToJson } from "@/utils";
import { isNil } from "lodash";

export async function getTracking({ unit }: { unit: string }) {
    const assetDetails: AssetDetails = await blockfrostFetcher.fetchSpecificAsset(unit);
    const userAssetsDetails = await blockfrostFetcher.fetchSpecificAsset(unit.replace("000643b0", "000de140"));
    if (isNil(assetDetails)) {
        throw new Error("Asset not found");
    }

    assetDetails.quantity = userAssetsDetails.quantity;

    if (isNil(assetDetails)) {
        throw new Error("Asset not found");
    }
    const assetTxs: TransactionAsset[] = await blockfrostFetcher.fetchAssetTransactions(unit);
    const transaction = await blockfrostFetcher.fetchTransactionsUTxO(assetTxs[0].tx_hash);

    const assetOutput = transaction.outputs.find(function (output) {
        const asset = output.amount.find(function (amt) {
            return amt.unit === unit;
        });
        return asset !== undefined;
    });

    const metadata = assetOutput?.inline_datum
        ? ((await datumToJson(assetOutput.inline_datum, {
              contain_pk: true,
          })) as Record<string, string>)
        : {};
    const assetTransactions: TransactionHistory[] = await blockfrostFetcher.fetchAssetTransactions(unit);

    const transaction_history = await Promise.all(
        assetTransactions.map(async function ({ tx_hash }) {
            const specialTransaction: SpecialTransaction = await blockfrostFetcher.fetchSpecialTransaction(tx_hash);
            const transaction = await blockfrostFetcher.fetchTransactionsUTxO(tx_hash);

            const assetInput = transaction.inputs.find(function (input) {
                const asset = input.amount.find(function (amt) {
                    return amt.unit === unit;
                });
                return asset !== undefined;
            });

            const assetOutput = transaction.outputs.find(function (output) {
                const asset = output.amount.find(function (amt) {
                    return amt.unit === unit;
                });
                return asset !== undefined;
            });

            if (!assetInput && assetOutput) {
                return {
                    metadata: assetOutput.inline_datum ? await datumToJson(assetOutput.inline_datum) : {},
                    txHash: tx_hash,
                    datetime: specialTransaction.block_time,
                    fee: specialTransaction.fees,
                    status: "Completed",
                    action: "Mint",
                };
            }

            if (!assetOutput && assetInput) {
                return {
                    metadata: assetInput.inline_datum ? await datumToJson(assetInput.inline_datum) : {},
                    txHash: tx_hash,
                    datetime: specialTransaction.block_time,
                    fee: specialTransaction.fees,
                    status: "Completed",
                    action: "Burn",
                };
            }

            if (assetInput && assetOutput) {
                return {
                    metadata: assetOutput.inline_datum ? await datumToJson(assetOutput.inline_datum) : {},
                    txHash: tx_hash,
                    datetime: specialTransaction.block_time,
                    fee: specialTransaction.fees,
                    status: "Completed",
                    action: "Update",
                };
            }
        }),
    );

    const data = {
        ...assetDetails,
        metadata: metadata,
        transaction_history: transaction_history.reverse(),
    };

    return data;
}
