import {
    applyParamsToScript,
    BlockfrostProvider,
    deserializeAddress,
    MeshWallet,
    PlutusScript,
    resolveScriptHash,
    serializePlutusScript,
    stringToHex,
} from '@meshsdk/core';
import { BLOCKFROST_API_KEY, title } from '../../contract/scripts/common';
import blueprint from '../../contract/plutus.json';
export class ContractHelper {
    private static blockfrostProvider: BlockfrostProvider;
    private static readonly plutusVersion: 'V3' | 'V2' = 'V3';
    private static readonly networkId: 0 | 1 = 0;
    constructor() {
        ContractHelper.blockfrostProvider = new BlockfrostProvider(
            BLOCKFROST_API_KEY,
        );
    }

    static GetWalletClient(walletAddress: string) {
        return new MeshWallet({
            networkId: this.networkId,
            fetcher: this.blockfrostProvider,
            submitter: this.blockfrostProvider,
            key: { type: 'address', address: walletAddress },
        });
    }

    static GetAssetName(ownerAddress: string, lockName: string): string {
        const pkh = deserializeAddress(ownerAddress).pubKeyHash;
        const mintCbor = this.paramed(title.mint, pkh);
        return (
            resolveScriptHash(mintCbor, this.plutusVersion) +
            stringToHex(lockName)
        );
    }

    static async GetContractUTXO(ownerAddress: string, lockName: string) {
        const pkh = deserializeAddress(ownerAddress).pubKeyHash;
        const spendCbor = this.paramed(title.spend, pkh);

        const confirmStatusAddress = serializePlutusScript(
            { code: spendCbor, version: this.plutusVersion } as PlutusScript,
            undefined,
            0,
            false,
        ).address;
        ContractHelper.blockfrostProvider = new BlockfrostProvider(
            BLOCKFROST_API_KEY,
        );
        return ContractHelper.blockfrostProvider.fetchAddressUTxOs(
            confirmStatusAddress,
            this.GetAssetName(ownerAddress, lockName),
        );
    }

    private static code(title: string): string {
        const v = blueprint.validators.find((v) => v.title === title);
        if (!v) throw new Error(`${title} validator not found.`);
        return v.compiledCode;
    }

    private static paramed(title: string, pkh: string) {
        return applyParamsToScript(this.code(title), [pkh]);
    }
}
