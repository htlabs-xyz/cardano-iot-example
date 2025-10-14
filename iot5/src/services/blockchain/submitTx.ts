"use server";

import { blockfrostProvider } from "@/lib/cardano";
import { parseError } from "@/utils/error/parse-error";
import { reject } from "lodash";

export async function submitTx(tx: string): Promise<{
    data: string | null;
    result: boolean;
    message: string;
}> {
    try {
        const txHash = await blockfrostProvider.submitTx(tx);

        await new Promise<void>((resolve, reject) => {
            blockfrostProvider.onTxConfirmed(txHash, () => {
                resolve()
            })
        })
        return {
            data: txHash,
            result: true,
            message: "Transaction submitted successfully",
        };
    } catch (e) {
        return {
            data: null,
            result: false,
            message: parseError(e),
        };
    }
}
