

import { BlockfrostProvider, MeshWallet, stringToHex } from "@meshsdk/core";
import * as dotenv from "dotenv";
import { LockerContract } from "./offchain";
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

export const init = async (title: string) => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.init({
        title: title,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log(`https://preprod.cexplorer.io/tx/` + txHash);
    await new Promise(() => {
        provider.onTxConfirmed(txHash, () => {
            console.log("transaction confirmed");
        });
    });
}


export const lock = async (title: string) => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.lock({
        title: title,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);

    const txHash = await wallet.submitTx(signedTx);

    console.log(`https://preprod.cexplorer.io/tx/` + txHash);

    await new Promise(() => {
        provider.onTxConfirmed(txHash, () => {
            console.log("transaction confirmed");
        });
    });
}


export const unlock = async (title: string) => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.unLock({
        title: title,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    await new Promise(() => {
        provider.onTxConfirmed(txHash, () => {
            console.log(`https://preprod.cexplorer.io/tx/` + txHash);
        });
    });
}


export const authority = async ({
    title,
    address
}: {
    title: string,
    address: string
}) => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.authorize({
        title: title,
        authority: address,
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    await new Promise(() => {
        provider.onTxConfirmed(txHash, () => {
            console.log(`https://preprod.cexplorer.io/tx/` + txHash);
        });
    });
}