import {
    deserializeAddress,
    ForgeScript,
    mConStr0,
    mConStr1,
    resolveScriptHash,
    scriptAddress,
    serializeAddressObj,
    stringToHex,
} from "@meshsdk/core";
import { MeshAdapter } from "./mesh";

export class ConfirmStatusContract extends MeshAdapter {
    confirmStatus = async({title, value}: {title: string, value: string})=> {
        const { utxos, collateral, walletAddress } = await this.getWalletForTx();
         const ownerPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        const policyId = resolveScriptHash(forgingScript);
        const utxo = await this.getAddressUTXOAsset(this.confirmStatusAddress, policyId + stringToHex(title));
        const unsignedTx =  this.meshTxBuilder
        if (!utxo) {
            unsignedTx
                .mint("1", policyId, stringToHex(title))
                .mintingScript(forgingScript)
                .txOut(this.confirmStatusAddress,  [{
                    unit: policyId + stringToHex(title),
                    quantity: String(1),
                }])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, value]));
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(this.confirmStatusAddress,  [{
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
