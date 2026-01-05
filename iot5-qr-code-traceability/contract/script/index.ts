import { BlockfrostProvider, CIP68_222, MeshWallet, stringToHex } from "@meshsdk/core";
import { Contract } from "./offchain";

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");
const wallet = new MeshWallet({
    networkId: 0,
    fetcher: provider,
    submitter: provider,
    key: {
        type: 'mnemonic',
        words: process.env.MNEMONIC?.split(' ') || [],
    },
});

export const mint = async () => {
    const contract = new Contract({
        wallet: wallet,
        provider: provider,
    });
    const assetName = 'box_dfg'
    const unsignedTx: string = await contract.mint({
        assetName: assetName,
        metadata: {
            name: assetName,
            description: 'Traceability asset for box_dfg',
            image: "",
            
            key2: "value2"
        }
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

export const update = async () => {
    const contract = new Contract({
        wallet: wallet,
        provider: provider,
    });
    const assetName = "box_dfg"
    const unsignedTx: string = await contract.update({
        assetName: assetName,
        newMetadata: {
            name: assetName,
            description: 'Traceability asset for box_dfg',
            locate: "locate 2",
            key1: "value10",
            key2: "value20"
        }
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
export const burn = async () => {
    const contract = new Contract({
        wallet: wallet,
        provider: provider,
    });
    const assetName = "box_dfg"
    const unsignedTx: string = await contract.burn({
        assetName: assetName
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
