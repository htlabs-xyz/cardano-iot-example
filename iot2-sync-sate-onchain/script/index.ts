

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

export const init = async () => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.init({
        title: 'Locker_12345',
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


export const lock = async () => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.lock({
        title: 'Locker_12345',
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


export const unlock = async () => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.unLock({
        title: 'Locker_12345',
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    await new Promise(() => {
        provider.onTxConfirmed(txHash, () => {
            console.log(`https://preprod.cexplorer.io/tx/` + txHash);
        });
    });
}


export const authority = async () => {
    const lockerContract = new LockerContract({
        wallet: wallet,
        provider: provider,
    });

    const unsignedTx: string = await lockerContract.authorize({
        title: 'Locker_12345',
        authority: 'addr_test1qrv637xpe50vza430d0wa9gvff7d0sh6m5plwqhg6v7fjarqt7gag4c7fepupml5eu9z054z5ystx5uz8f4kahlcpmwqhhvq5e',
    });

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    await new Promise(() => {
        provider.onTxConfirmed(txHash, () => {
            console.log(`https://preprod.cexplorer.io/tx/` + txHash);
        });
    });
}