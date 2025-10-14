import {
    applyParamsToScript,
    BlockfrostProvider,
    BrowserWallet,
    IEvaluator,
    IFetcher,
    ISubmitter,
    MeshTxBuilder,
    MeshWallet,
    PlutusScript,
    serializePlutusScript,
    UTxO,
} from '@meshsdk/core';
import blueprint from '../plutus.json';
import { BLOCKFROST_API_KEY } from './common';
import { Plutus } from './type';

/**
 * @class MeshAdapter
 * @description
 * Base adapter class that encapsulates core Mesh SDK utilities for interacting with the Cardano blockchain.
 * Provides functionality for fetching UTXOs, reading validator scripts, and constructing transactions
 * using a given wallet and Blockfrost provider.
 *
 * This class can be extended to implement specific smart contract operations.
 */
export class MeshAdapter {
    protected fetcher: IFetcher;
    protected summitter: ISubmitter;
    protected evaluator: IEvaluator;
    protected wallet: MeshWallet;
    protected meshTxBuilder: MeshTxBuilder;
    protected confirmStatusAddress: string;
    protected confirmStatusScript: PlutusScript;
    protected confirmStatusScriptCbor: string;
    protected confirmStatusCompileCode: string;

    /**
     * @constructor
     * @param {Object} param0 - Object containing an optional MeshWallet instance.
     * @param {MeshWallet} [param0.wallet] - The Mesh wallet instance used for signing transactions.
     *
     * @description
     * Initializes the MeshAdapter with a BlockfrostProvider, MeshTxBuilder, and loads
     * the ConfirmStatus Plutus validator from the blueprint.
     */
    constructor({ wallet = null! }: { wallet?: MeshWallet }) {
        this.wallet = wallet;
        this.fetcher = new BlockfrostProvider(BLOCKFROST_API_KEY);
        this.summitter;
        this.meshTxBuilder = new MeshTxBuilder({
            fetcher: this.fetcher,
            evaluator: this.evaluator,
            submitter: this.summitter,
        });
        this.confirmStatusCompileCode = this.readValidator(
            blueprint as Plutus,
            'confirm_status.confirm_status.spend',
        );

        this.confirmStatusScriptCbor = applyParamsToScript(
            this.confirmStatusCompileCode,
            [],
        );

        this.confirmStatusScript = {
            code: this.confirmStatusScriptCbor,
            version: 'V3',
        };

        this.confirmStatusAddress = serializePlutusScript(
            this.confirmStatusScript,
            undefined,
            0,
            false,
        ).address;
    }

    /**
     * @method getWalletForTx
     * @async
     * @returns {Promise<{utxos: UTxO[], collateral: UTxO, walletAddress: string}>}
     *
     * @description
     * Fetches UTXOs, collateral, and change address from the connected wallet.
     * Ensures all required data is available before returning.
     *
     * @throws {Error} If no UTXOs, collateral, or wallet address are found.
     */
    protected getWalletForTx = async (): Promise<{
        utxos: UTxO[];
        collateral: UTxO;
        walletAddress: string;
    }> => {
        const utxos = await this.wallet.getUtxos();
        const collaterals = await this.wallet.getCollateral();
        const walletAddress = await this.wallet.getChangeAddress();
        if (!utxos || utxos.length === 0)
            throw new Error('No UTXOs found in getWalletForTx method.');

        if (!collaterals || collaterals.length === 0)
            throw new Error('No collateral found in getWalletForTx method.');

        if (!walletAddress)
            throw new Error(
                'No wallet address found in getWalletForTx method.',
            );

        return { utxos, collateral: collaterals[0], walletAddress };
    };

    /**
     * @method getUtxoForTx
     * @async
     * @param {string} address - The address to fetch UTXOs from.
     * @param {string} txHash - The transaction hash to search for.
     * @returns {Promise<UTxO>} - The matching UTXO.
     *
     * @description
     * Retrieves all UTXOs at a given address, then filters to find the UTXO matching
     * the provided transaction hash.
     *
     * @throws {Error} If the UTXO with the given transaction hash is not found.
     */
    protected getUtxoForTx = async (address: string, txHash: string) => {
        const utxos: UTxO[] = await this.fetcher.fetchAddressUTxOs(address);
        const utxo = utxos.find(function (utxo: UTxO) {
            return utxo.input.txHash === txHash;
        });

        if (!utxo) throw new Error('No UTXOs found in getUtxoForTx method.');
        return utxo;
    };

    /**
     * @method readValidator
     * @param {Plutus} plutus - The compiled Plutus blueprint JSON.
     * @param {string} title - The validator title within the blueprint.
     * @returns {string} - The compiled validator code in hexadecimal format.
     *
     * @description
     * Searches the Plutus blueprint for a validator by title and returns
     * its compiled Plutus code. Throws an error if the validator is not found.
     */
    protected readValidator = function (plutus: Plutus, title: string): string {
        const validator = plutus.validators.find(function (validator) {
            return validator.title === title;
        });

        if (!validator) {
            throw new Error(`${title} validator not found.`);
        }

        return validator.compiledCode;
    };

    /**
     * @method getAddressUTXOAsset
     * @async
     * @param {string} address - The address to fetch UTXOs from.
     * @param {string} unit - The asset unit (policyId + assetName) to filter by.
     * @returns {Promise<UTxO>} - The most recent UTXO containing the specified asset.
     *
     * @description
     * Fetches all UTXOs for the given address that contain a specific asset,
     * and returns the last UTXO from the list (usually the most recent one).
     */
    protected getAddressUTXOAsset = async (address: string, unit: string) => {
        const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
        return utxos[utxos.length - 1];
    };

    /**
     * @method getAddressUTXOAssets
     * @async
     * @param {string} address - The address to fetch UTXOs from.
     * @param {string} unit - The asset unit to filter by.
     * @returns {Promise<UTxO[]>} - List of all UTXOs containing the asset.
     *
     * @description
     * Retrieves all UTXOs associated with the given address and asset unit.
     * Unlike getAddressUTXOAsset, this returns the full array of results.
     */
    protected getAddressUTXOAssets = async (address: string, unit: string) => {
        return await this.fetcher.fetchAddressUTxOs(address, unit);
    };
}
