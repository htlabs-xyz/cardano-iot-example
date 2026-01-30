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
    // Construct address object from datum fields (pubKeyHash, stakeCredentialHash)
    const authority = serializeAddressObj(
        pubKeyAddress(
            datum.fields[0].fields[0].bytes,
            datum.fields[0].fields[1].bytes,
            false,
        ),
        0,
    );
    const status = datum.fields[1].int == 1
    console.log("status", {
        authority: authority,
        isLocked: status
    })
}