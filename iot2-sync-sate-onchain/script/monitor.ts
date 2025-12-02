import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { deserializeDatum, pubKeyAddress, serializeAddressObj } from "@meshsdk/core";
import * as dotenv from "dotenv";
dotenv.config();

const blockFrostAPI = new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_API_KEY || "",
});

export const monitor = async (unit: string) => {
    const txs = await blockFrostAPI.assetsTransactions(unit)
    const utxo = await blockFrostAPI.txsUtxos(txs.slice(-1)[0].tx_hash);
    const datum = deserializeDatum(utxo.outputs[0].inline_datum || "")
    const authority = serializeAddressObj(datum.fields[0], 0);
    const status = datum.fields[1].int == 1
    console.log("status", {
        authority: authority,
        isLocked: status
    })
}