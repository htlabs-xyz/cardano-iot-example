import {
    deserializeAddress,
    ForgeScript,
    mConStr0,
    mConStr1,
    resolveScriptHash,
    stringToHex,
} from "@meshsdk/core";
import { MeshAdapter } from "./mesh";

export class ConfirmStatusContract extends MeshAdapter {
    confirm = async ({ sensor, temperator, huminity }: { sensor: string,temperator: number, huminity: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        const policyId = resolveScriptHash(forgingScript);
        const utxo = await this.getAddressUTXOAsset(this.confirmStatusAddress, policyId + stringToHex(sensor));
        const unsignedTx = this.meshTxBuilder
        if (!utxo) {
            unsignedTx
                .mint("1", policyId, stringToHex(sensor))
                .mintingScript(forgingScript)
                .txOut(this.confirmStatusAddress, [{
                    unit: policyId + stringToHex(sensor),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ temperator, huminity,ownerPaymentKeyHash]));
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(this.confirmStatusAddress, [{
                    unit: policyId + stringToHex(sensor),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ temperator, huminity,ownerPaymentKeyHash]))
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

    withdraw = async ({ title, value }: { title: string, value: number }) => {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
        const ownerPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        const policyId = resolveScriptHash(forgingScript);
        const utxo = await this.getAddressUTXOAsset(this.confirmStatusAddress, policyId + stringToHex(title));
        const unsignedTx = this.meshTxBuilder
        if (!utxo) {
            throw new Error("UTxO not found");
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr1([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(walletAddress, [{
                    unit: policyId + stringToHex(title),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, value]))
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
