import {
    deserializeAddress,
    ForgeScript,
    mConStr0,
    mConStr1,
    resolveScriptHash, stringToHex
} from "@meshsdk/core";
import { MeshAdapter } from "./mesh";
import { convertInlineDatum } from "./common";

export class StatusManagement extends MeshAdapter {
    lock = async ({ title, isLock }: { title: string, isLock: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
   
        const forgingScript = ForgeScript.withOneSignature(this.confirmStatusAddress as string);
        const policyId = resolveScriptHash(forgingScript);
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
                .txOutInlineDatumValue(mConStr0([mConStr0([]), isLock]));
        } else {
            const datum = convertInlineDatum({inlineDatum: utxo.output.plutusData as string})
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
                .txOutInlineDatumValue(mConStr0([mConStr0([]), isLock]))
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

    unLock = async ({ title, authorityPaymentKeyHash, isLock, }: { title: string, authorityPaymentKeyHash: string, isLock: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(process.env.WALLET_ADDRESS_OWNER as string).pubKeyHash;
        // const authorityPaymentKeyHash = authority ? deserializeAddress(authority).pubKeyHash : "";
        const forgingScript = ForgeScript.withOneSignature(process.env.WALLET_ADDRESS_OWNER as string);
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

    authorize = async ({ title, authorityPaymentKeyHash, isLock, }: { title: string, authorityPaymentKeyHash: string, isLock: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
        // const authorityPaymentKeyHash = deserializeAddress(authority).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(process.env.WALLET_ADDRESS_OWNER as string);
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