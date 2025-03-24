import {
    deserializeAddress,
    ForgeScript,
    mConStr0,
    mConStr1,
    resolveScriptHash, stringToHex
} from "@meshsdk/core";
import { MeshAdapter } from "./mesh";

export class StatusManagement extends MeshAdapter {
    lock = async ({ title, authority, isLock, }: { title: string, authority: string, isLock: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
        const authorityPaymentKeyHash = deserializeAddress(authority || walletAddress).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        //const policyId = resolveScriptHash(forgingScript);
        const policyId = "a48dfba612b9f49bded45de5fb348b3c22aa7c65383217d1d9574a5b"
        const utxo = await this.getAddressUTXOAsset(this.confirmStatusAddress, policyId + stringToHex(title));
        const unsignedTx = this.meshTxBuilder
        if (!utxo) {
            unsignedTx
                .mint("1", policyId, stringToHex(title))
                .mintingScript(forgingScript)
                .txOut(this.confirmStatusAddress, [{
                    unit: policyId + stringToHex(title),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, authorityPaymentKeyHash, isLock]));
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(this.confirmStatusAddress, [{
                    unit: policyId + stringToHex(title),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, authorityPaymentKeyHash, isLock]))
        }

        unsignedTx
            .changeAddress(walletAddress)
            .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(
                collateral.input.txHash,
                collateral.input.outputIndex,
                collateral.output.amount,
                collateral.output.address,
            )
            .setNetwork("preprod");
        return await unsignedTx.complete();
    }

    unLock = async ({ title, authority, isLock, }: { title: string, authority: string, isLock: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(authority).pubKeyHash;
        const authorityPaymentKeyHash = deserializeAddress(authority || walletAddress).pubKeyHash;
        //const forgingScript = ForgeScript.withOneSignature(authority);
        // const policyId = resolveScriptHash(forgingScript);
        const policyId = "a48dfba612b9f49bded45de5fb348b3c22aa7c65383217d1d9574a5b"
        const utxo = await this.getAddressUTXOAsset(this.confirmStatusAddress, policyId + stringToHex(title));
        const unsignedTx = this.meshTxBuilder
        if (!utxo) {
            throw new Error("No UTXOs found in getUtxoForTx method.");
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(this.confirmStatusAddress, [{
                    unit: policyId + stringToHex(title),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, authorityPaymentKeyHash, isLock]))
        }

        unsignedTx
            .changeAddress(walletAddress)
            .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(
                collateral.input.txHash,
                collateral.input.outputIndex,
                collateral.output.amount,
                collateral.output.address,
            )
            .setNetwork("preprod");
        return await unsignedTx.complete();
    }

    authorize = async ({ title, authority, isLock, }: { title: string, authority: string, isLock: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
        const authorityPaymentKeyHash = deserializeAddress(authority).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        const policyId = resolveScriptHash(forgingScript);
        const utxo = await this.getAddressUTXOAsset(this.confirmStatusAddress, policyId + stringToHex(title));
        const unsignedTx = this.meshTxBuilder
        if (!utxo) {
            throw new Error("No UTXOs found in getUtxoForTx method.");
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr1([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(this.confirmStatusAddress, [{
                    unit: policyId + stringToHex(title),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, authorityPaymentKeyHash, isLock]))
        }

        unsignedTx
            .changeAddress(walletAddress)
            .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(
                collateral.input.txHash,
                collateral.input.outputIndex,
                collateral.output.amount,
                collateral.output.address,
            )
            .setNetwork("preprod");
        return await unsignedTx.complete();
    }


}
