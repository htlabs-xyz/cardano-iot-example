import {
    conStr0,
    deserializeAddress,
    mConStr0,
    mConStr1,
    stringToHex,
} from '@meshsdk/core';
import { MeshAdapter } from './mesh';

/**
 * LockerContract class
 *
 * This class provides methods to manage a status token lifecycle
 * on the Cardano blockchain using Mesh SDK and Plutus V3 scripts.
 *
 * Main responsibilities:
 * - Lock: Mint or update a status token and mark it as locked.
 * - UnLock: Update an existing status token to mark it as unlocked.
 * - Authorize: Change or assign a new authorized address to a status token.
 *
 * Each method constructs an unsigned transaction that must be signed
 * and submitted by the wallet. The class extends MeshAdapter to
 * reuse wallet and transaction builder utilities.
 *
 * Usage:
 *   const manager = new LockerContract({ meshWallet });
 *   const tx = await manager.lock({ title: "My Status" });
 *   const signedTx = await meshWallet.signTx(tx, true);
 *   const txHash = await meshWallet.submitTx(signedTx);
 *
 * Network: Currently set to "preprod" (testnet).
 */
export class LockerContract extends MeshAdapter {
    public init = async ({ title }: { title: string }): Promise<string> => {
        const { utxos, collateral, walletAddress } =
            await this.getWalletForTx();
        const utxo = await this.getAddressUTXOAsset(
            this.lockerAddress as string,
            this.policyId + stringToHex(title),
        );
        if (utxo) {
            throw new Error("this locker has been ininitization")
        }

        const unsignedTx = this.meshTxBuilder
            .mintPlutusScriptV3()
            .mint('1', this.policyId, stringToHex(title))
            .mintingScript(this.mintScriptCbor)
            .mintRedeemerValue(mConStr0([]))
            .txOut(this.lockerAddress as string, [
                {
                    unit: this.policyId + stringToHex(title),
                    quantity: "1",
                },
            ])
            .txOutInlineDatumValue(
                mConStr0([
                    mConStr0([
                        deserializeAddress(walletAddress).pubKeyHash,
                        deserializeAddress(walletAddress).stakeCredentialHash
                    ]),
                    1
                ]), 
            )
            .changeAddress(walletAddress)
            .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
            .selectUtxosFrom(utxos)
            .txInCollateral(
                collateral.input.txHash,
                collateral.input.outputIndex,
                collateral.output.amount,
                collateral.output.address,
            ).setNetwork("preprod")
        return await unsignedTx.complete();
    };




    /**
     * Lock a given status token by minting it or updating its datum if it already exists.
     *
     * Workflow:
     * - If the token does not exist at the lockerAddress:
     *   - Mint a new token with quantity 1.
     *   - Attach inline datum with the authorized wallet address and lock state = 1.
     * - If the token already exists:
     *   - Spend the existing UTXO.
     *   - Recreate the token with updated inline datum (still locked).
     *
     * @param {Object} params
     * @param {string} params.title - The identifier of the status token.
     * @returns {Promise<string>} The unsigned transaction ready to be signed and submitted.
     */
    public lock = async ({ title }: { title: string }): Promise<string> => {
        const { utxos, collateral, walletAddress } =
            await this.getWalletForTx();
        const utxo = await this.getAddressUTXOAsset(
            this.lockerAddress as string,
            this.policyId + stringToHex(title),
        );

        const unsignedTx = this.meshTxBuilder;
        if (!utxo) {
            unsignedTx
                .mintPlutusScriptV3()
                .mint('1', this.policyId, stringToHex(title))
                .mintingScript(this.mintScriptCbor)
                .mintRedeemerValue(mConStr0([]))

                .txOut(this.lockerAddress as string, [
                    {
                        unit: this.policyId + stringToHex(title),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(
                    mConStr0([
                        mConStr0([
                            deserializeAddress(walletAddress).pubKeyHash,
                            deserializeAddress(walletAddress)
                                .stakeCredentialHash,
                        ]),
                        1,
                    ]),
                );
        } else {
            const datum = this.convertDatum({
                plutusData: utxo.output.plutusData as string,
            });
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.lockerScriptCbor)
                .txOut(this.lockerAddress as string, [
                    {
                        unit: this.policyId + stringToHex(title),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(
                    mConStr0([
                        mConStr0([
                            deserializeAddress(datum.authorized).pubKeyHash,
                            deserializeAddress(datum.authorized)
                                .stakeCredentialHash,
                        ]),
                        1,
                    ]),
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
            .setNetwork("preprod");
        return await unsignedTx.complete();
    };

    /**
     * Unlock a given status token by updating its datum value to unlocked state.
     *
     * Workflow:
     * - Find the UTXO containing the token at lockerAddress.
     * - Spend it using the Plutus script.
     * - Recreate the token with updated inline datum where lock state = 0.
     *
     * @param {Object} params
     * @param {string} params.title - The identifier of the status token.
     * @returns {Promise<string>} The unsigned transaction ready to be signed and submitted.
     * @throws {Error} If no UTXOs are found for the provided token.
     */
    public unLock = async ({ title }: { title: string }): Promise<string> => {
        const { utxos, collateral, walletAddress } =
            await this.getWalletForTx();

        const utxo = await this.getAddressUTXOAsset(
            this.lockerAddress as string,
            this.policyId + stringToHex(title),
        );

        const unsignedTx = this.meshTxBuilder;
        if (!utxo) {
            throw new Error('No UTXOs found in getUtxoForTx method.');
        } else {
            const datum = this.convertDatum({
                plutusData: utxo.output.plutusData as string,
            });
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr0([]))
                .txInScript(this.lockerScriptCbor)


                .txOut(this.lockerAddress as string, [
                    {
                        unit: this.policyId + stringToHex(title),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(
                    mConStr0([
                        mConStr0([
                            deserializeAddress(datum.authorized).pubKeyHash,
                            deserializeAddress(datum.authorized)
                                .stakeCredentialHash,
                        ]),
                        0,
                    ]),
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
            .setNetwork("preprod");
        return await unsignedTx.complete();
    }

    /**
     * Authorize a new address as the controller of the status token.
     *
     * Workflow:
     * - Find the UTXO containing the token.
     * - Spend it using the Plutus script with a different redeemer (mConStr1).
     * - Recreate the token with inline datum updated to the new authorized address.
     *
     * @param {Object} params
     * @param {string} params.title - The identifier of the status token.
     * @param {string} params.authority - The new authorized address. If not provided, keep existing one.
     * @returns {Promise<any>} The unsigned transaction ready to be signed and submitted.
     * @throws {Error} If no UTXOs are found for the provided token.
     */
    public authorize = async ({
        title,
        authority,
    }: {
        title: string;
        authority: string;
    }) => {
        const { utxos, collateral, walletAddress } =
            await this.getWalletForTx();
        const utxo = await this.getAddressUTXOAsset(
            this.lockerAddress as string,
            this.policyId + stringToHex(title),
        );
        const unsignedTx = this.meshTxBuilder;
        if (!utxo) {
            throw new Error('No UTXOs found in getUtxoForTx method.');
        } else {
            const datum = this.convertDatum({
                plutusData: utxo.output.plutusData as string,
            });
            unsignedTx
                .spendingPlutusScriptV3()
                .txIn(utxo.input.txHash, utxo.input.outputIndex)
                .txInInlineDatumPresent()
                .txInRedeemerValue(mConStr1([]))
                .txInScript(this.lockerScriptCbor)
                .txOut(this.lockerAddress as string, [
                    {
                        unit: this.policyId + stringToHex(title),
                        quantity: String(1),
                    },
                ])
                .txOutInlineDatumValue(
                    mConStr0([
                        mConStr0([
                            deserializeAddress(
                                authority ? authority : datum.authorized,
                            ).pubKeyHash,
                            deserializeAddress(
                                authority ? authority : datum.authorized,
                            ).stakeCredentialHash,
                        ]),
                        datum.isLock,
                    ]),
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
            .setNetwork("preprod");
        return await unsignedTx.complete();
    };
}