import {
    deserializeAddress,
    ForgeScript,
    mConStr0,
    mConStr1,
    resolveScriptHash,
    stringToHex,
} from '@meshsdk/core';
import { MeshAdapter } from './mesh';

/**
 * ConfirmStatusContract
 *
 * This class handles all interactions with the on-chain Confirm Status Plutus contract.
 * It supports two main operations:
 *  - confirm():  Minting or updating a sensor NFT with temperature and humidity data.
 *  - withdraw(): Reclaiming the sensor NFT from the script address back to the owner.
 *
 * The class extends MeshAdapter to utilize common transaction-building utilities.
 */
export class ConfirmStatusContract extends MeshAdapter {
    /**
     * confirm()
     *
     * Creates or updates a sensor NFT representing the device’s environmental status.
     *
     * If the NFT for the given sensor does not exist, this method:
     *  - Mints a new NFT using a simple forging policy.
     *  - Stores an inline datum containing temperature, humidity, and the owner key hash.
     *
     * If the NFT already exists, this method:
     *  - Spends the current UTxO locked by the ConfirmStatus Plutus script.
     *  - Updates the inline datum with new temperature and humidity readings.
     *
     * @param {object} params                  - Function parameters.
     * @param {string} params.sensor           - The sensor’s unique identifier (token name).
     * @param {number} params.temperator       - The current temperature reading.
     * @param {number} params.huminity         - The current humidity reading.
     * @returns {Promise<any>}                 - The completed unsigned transaction ready for signing.
     */
    public confirm = async ({
        sensor,
        temperator,
        huminity,
    }: {
        sensor: string;
        temperator: number;
        huminity: number;
    }) => {
        const { utxos, collateral, walletAddress } =
            await this.getWalletForTx();
        const ownerPaymentKeyHash =
            deserializeAddress(walletAddress).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        const policyId = resolveScriptHash(forgingScript);
        const utxo = await this.getAddressUTXOAsset(
            this.confirmStatusAddress,
            policyId + stringToHex(sensor),
        );
        const unsignedTx = this.meshTxBuilder;
        if (!utxo) {
            unsignedTx
                .mint('1', policyId, stringToHex(sensor))
                .mintingScript(forgingScript)
                .txOut(this.confirmStatusAddress, [
                    {
                        unit: policyId + stringToHex(sensor),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(
                    mConStr0([temperator, huminity, ownerPaymentKeyHash]),
                );
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(this.confirmStatusAddress, [
                    {
                        unit: policyId + stringToHex(sensor),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(
                    mConStr0([temperator, huminity, ownerPaymentKeyHash]),
                );
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
            .setNetwork('preprod');
        return await unsignedTx.complete();
    };

    /**
     * withdraw()
     *
     * Withdraws (or reclaims) a sensor NFT from the Plutus script back to the owner’s wallet.
     *
     * This function:
     *  - Looks for the UTxO holding the NFT at the ConfirmStatus script address.
     *  - Uses a Redeemer (constructor 1) to unlock the UTxO.
     *  - Sends the NFT back to the wallet address of the owner.
     *
     * @param {object} params                  - Function parameters.
     * @param {string} params.title            - The token name (sensor ID) to withdraw.
     * @param {number} params.value            - An associated integer value for the new inline datum.
     * @returns {Promise<any>}                 - The completed unsigned transaction ready for signing.
     */
    public withdraw = async ({
        title,
        value,
    }: {
        title: string;
        value: number;
    }) => {
        const { utxos, collateral, walletAddress } =
            await this.getWalletForTx();
        const ownerPaymentKeyHash =
            deserializeAddress(walletAddress).pubKeyHash;
        const forgingScript = ForgeScript.withOneSignature(walletAddress);
        const policyId = resolveScriptHash(forgingScript);
        const utxo = await this.getAddressUTXOAsset(
            this.confirmStatusAddress,
            policyId + stringToHex(title),
        );
        const unsignedTx = this.meshTxBuilder;
        if (!utxo) {
            throw new Error('UTxO not found');
        } else {
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr1([]))
                .txInScript(this.confirmStatusScriptCbor)
                .txOut(walletAddress, [
                    {
                        unit: policyId + stringToHex(title),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(mConStr0([ownerPaymentKeyHash, value]));
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
            .setNetwork('preprod');
        return await unsignedTx.complete();
    };
}
