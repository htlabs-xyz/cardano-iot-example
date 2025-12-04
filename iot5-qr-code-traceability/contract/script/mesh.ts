import {
    applyParamsToScript,
    BlockfrostProvider,
    deserializeAddress,
    deserializeDatum,
    type IFetcher,
    MeshTxBuilder,
    MeshWallet,
    type PlutusScript,
    pubKeyAddress,
    resolveScriptHash,
    serializeAddressObj,
    serializePlutusScript,
    type UTxO,
} from '@meshsdk/core';
import blueprint from '../plutus.json';

/**
 * Class: MeshAdapter
 *
 * Acts as a foundational adapter for interacting with the Cardano blockchain
 * via the Mesh SDK. This class encapsulates setup, configuration, and utility
 * functions that enable higher-level contract managers (e.g. ContractContract)
 * to interact with Plutus scripts seamlessly.
 *
 * ## Primary Responsibilities:
 * - Initialize and parameterize Plutus V3 scripts (minting and spending).
 * - Derive script addresses and resolve minting policy IDs.
 * - Expose helper utilities to:
 *   - Fetch UTxOs, collateral, and script-related outputs.
 *   - Deserialize and interpret Plutus datum structures.
 *
 * ## Key Properties:
 * - `policyId`: Unique identifier (hash) for the minting policy.
 * - `wallet`: Active Mesh wallet instance connected to the adapter.
 * - `meshTxBuilder`: Transaction builder for constructing unsigned transactions.
 * - `contractAddress`: Script address derived from the spending validator.
 * - `mintScript` / `contractScript`: Fully parameterized Plutus V3 scripts.
 *
 * ## Notes:
 * - Network-agnostic: Uses the Blockfrost API for evaluation and data fetch.
 * - Reads validator bytecode from a compiled `plutus.json` blueprint.
 * - Applies runtime parameters (OWNER's pubKeyHash) to the scripts dynamically.
 *
 * @example
 * ```ts
 * const adapter = new MeshAdapter({ wallet, ownerAddress });
 * const { utxos, collateral } = await adapter.getWalletForTx();
 * ```
 */
export class MeshAdapter {
    // ---------------------------------------------
    // Properties
    // ---------------------------------------------
    public policyId!: string;
    protected wallet: MeshWallet
    protected fetcher: IFetcher;
    protected mintCompileCode: string;
    protected mintScriptCbor!: string;
    protected mintScript!: PlutusScript;
    protected meshTxBuilder: MeshTxBuilder;
    protected contractAddress!: string;
    protected contractScript!: PlutusScript;
    protected contractScriptCbor!: string;
    protected contractCompileCode: string;

    /**
     * Constructor
     *
     * Initializes the adapter by binding the wallet, Blockfrost provider,
     * and transaction builder. Loads, parameterizes, and serializes
     * both minting and spending Plutus scripts.
     *
     * @param {Object} params - Configuration object.
     * @param {wallet} [params.wallet] - The Mesh wallet used for signing and UTxO management.
     * @param {string} [params.ownerAddress] - Optional bech32 address to derive the owner’s pubKeyHash.
     *
     * @throws {Error} If the specified validator cannot be found in the blueprint.
     */
    constructor({
        wallet = null!,
        provider = null!,

    }: {
        wallet?: MeshWallet
        provider?: BlockfrostProvider;
    }) {
        this.wallet = wallet;
        this.fetcher = provider
        this.meshTxBuilder = new MeshTxBuilder({
            fetcher: provider
        });
        this.contractCompileCode = this.readValidator(
            blueprint,
            "contract.contract.spend",
        );

        this.mintCompileCode = this.readValidator(
            blueprint,
            "contract.contract.mint",
        );

        this.initialize();
    }

    private async initialize() {
        const changeAddress = await this.wallet.getChangeAddress();
        const pubKeyOwner = deserializeAddress(changeAddress).pubKeyHash

        this.contractScriptCbor = applyParamsToScript(
            this.contractCompileCode,
            [pubKeyOwner],
        );
        this.contractScript = {
            code: this.contractScriptCbor,
            version: 'V3',
        };

        this.mintScriptCbor = applyParamsToScript(
            this.mintCompileCode,
            [pubKeyOwner],
        );

        this.contractAddress = serializePlutusScript(
            this.contractScript,
            undefined,
            0,
            false,
        ).address;

        this.mintScript = {
            code: this.mintScriptCbor,
            version: 'V3',
        };

        this.policyId = resolveScriptHash(this.mintScriptCbor, 'V3');
    }

    /**
     * Retrieve wallet information required to build a transaction.
     *
     * @returns {Promise<{ utxos: UTxO[]; collateral: UTxO; walletAddress: string }>}
     * - `utxos`: List of available UTxOs from the connected wallet.
     * - `collateral`: A valid collateral UTxO required for Plutus script execution.
     * - `walletAddress`: The change address of the connected wallet.
     *
     * @throws Error if wallet address, UTxOs, or collateral are missing.
     */
    protected getWalletForTx = async (): Promise<{
        utxos: UTxO[];
        collateral: UTxO;
        walletAddress: string;
    }> => {
        const utxos = await this.wallet.getUtxos();
        const collaterals = await this.wallet.getCollateral();
        const walletAddress = await this.wallet.getChangeAddress();
        if (!walletAddress)
            throw new Error(
                'No wallet address found in getWalletForTx method.',
            );

        if (!utxos || utxos.length === 0)
            throw new Error('No UTXOs found in getWalletForTx method.');

        if (!collaterals || collaterals.length === 0)
            throw new Error('No collateral found in getWalletForTx method.');

        return { utxos, collateral: collaterals[0], walletAddress };
    };

    /**
     * Fetch a specific UTxO from an address by its transaction hash.
     *
     * @param {string} address - The address where UTxOs will be searched.
     * @param {string} txHash - The transaction hash of the desired UTxO.
     * @returns {Promise<UTxO>} The UTxO that matches the provided transaction hash.
     *
     * @throws Error if no matching UTxO is found.
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
     * Read and return the compiled Plutus validator code by title.
     *
     * @param {Plutus} plutus - The Plutus JSON blueprint object.
     * @param {string} title - The validator title to look up.
     * @returns {string} The compiled validator code.
     *
     * @throws Error if the validator with the given title is not found.
     */
    protected readValidator = function (plutus: any, title: string): string {
        const validator = plutus.validators.find(function (validator: any) {
            return validator.title === title;
        });

        if (!validator) {
            throw new Error(`${title} validator not found.`);
        }

        return validator.compiledCode;
    };

    /**
     * Fetch the most recent UTxO at a given address containing a specific asset unit.
     *
     * @param {string} address - The blockchain address to query.
     * @param {string} unit - The asset unit (policyId + assetName).
     * @returns {Promise<UTxO | undefined>} The latest matching UTxO, or undefined if none exist.
     */
    protected getAddressUTXOAsset = async (address: string, unit: string) => {
        const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
        return utxos[utxos.length - 1];
    };

    /**
     * Fetch all UTxOs at a given address containing a specific asset unit.
     *
     * @param {string} address - The blockchain address to query.
     * @param {string} unit - The asset unit (policyId + assetName).
     * @returns {Promise<UTxO[]>} List of all matching UTxOs.
     */
    protected getAddressUTXOAssets = async (address: string, unit: string) => {
        return await this.fetcher.fetchAddressUTxOs(address, unit);
    };

    /**
     * Convert a serialized Plutus datum into a developer-friendly format.
     *
     * @param {Object} params
     * @param {string} params.plutusData - Serialized Plutus datum in CBOR format.
     * @returns {{ authorized: string; isLock: number }}
     * - `authorized`: Bech32 address derived from datum's pubKeyHash and stakeCredentialHash.
     * - `isLock`: Integer flag indicating locked (1) or unlocked (0) status.
     */
    protected convertDatum = ({
        plutusData,
    }: {
        plutusData: string;
    }): {
        authorized: string;
        isLock: number;
    } => {
        const datum = deserializeDatum(plutusData);
        const authority = serializeAddressObj(
            pubKeyAddress(
                datum.fields[0].fields[0].bytes,
                datum.fields[0].fields[1].bytes,
                false,
            ),
            0,
        );
        const isLocked = datum.fields[1].int;

        return {
            authorized: authority,
            isLock: isLocked,
        };
    };
}