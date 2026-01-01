

import { BlockfrostProvider, MeshWallet } from "@meshsdk/core";
import { SensorContract } from "../scripts";
import * as dotenv from "dotenv";
dotenv.config();

let provider: BlockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");
let wallet = new MeshWallet({
    networkId: 0,
    fetcher: provider,
    submitter: provider,
    key: {
        type: 'mnemonic',
        words: process.env.MNEMONIC?.split(' ') || [],
    },
});

export const claim = async () => {
    const sensorContract = new SensorContract({
        wallet: wallet,
        provider: provider,
    });
    const unsignedTx: string = await sensorContract.withdraw({
        title: 'dht22_sensor_01',
        value: 40000000,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    await new Promise<void>(function () {
        provider.onTxConfirmed(txHash, () => {
            console.log('https://preprod.cexplorer.io/tx/' + txHash);
        });
    });
    return txHash
}
