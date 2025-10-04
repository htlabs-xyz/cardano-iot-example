import {
  applyParamsToScript,
  deserializeAddress,
  deserializeDatum,
  IFetcher,
  MeshTxBuilder,
  MeshWallet,
  PlutusScript,
  pubKeyAddress,
  resolveScriptHash,
  serializeAddressObj,
  serializePlutusScript,
  UTxO,
} from '@meshsdk/core';
import blueprint from '../plutus.json';
import { blockfrostProvider, title } from './common';
import { Plutus } from './type';

/**
 * MeshAdapter class
 *
 * This class acts as a base adapter for interacting with the Cardano blockchain
 * using the Mesh SDK. It sets up scripts, addresses, and utility methods that
 * can be reused by higher-level smart contract managers (e.g., StatusManagement).
 *
 * Main responsibilities:
 * - Initialize and configure Plutus scripts (minting & spending).
 * - Derive script addresses and policy IDs.
 * - Provide helper methods to retrieve wallet UTxOs, collateral, and script UTxOs.
 * - Parse and convert Plutus datum into a more developer-friendly format.
 *
 * Key Properties:
 * - `policyId`: The unique identifier for the minting policy script.
 * - `meshWallet`: The connected Mesh wallet instance.
 * - `meshTxBuilder`: The transaction builder used to construct unsigned transactions.
 * - `confirmStatusAddress`: Address of the Plutus spending script.
 * - `mintScript`: Plutus minting script details (V3).
 * - `confirmStatusScript`: Plutus spending script details (V3).
 *
 * Notes:
 * - This adapter is network-agnostic but relies on Blockfrost provider
 *   (`blockfrostProvider`) for fetch and evaluation.
 * - Scripts are read from the compiled `plutus.json` blueprint and parameterized
 *   with the OWNER's public key hash.
 */
export class MeshAdapter {
  public policyId: string;
  protected fetcher: IFetcher;
  protected pubKeyOwner: string;
  protected meshWallet: MeshWallet;
  protected mintCompileCode: string;
  protected mintScriptCbor: string;
  protected mintScript: PlutusScript;
  protected meshTxBuilder: MeshTxBuilder;
  protected confirmStatusAddress: string;
  protected confirmStatusScript: PlutusScript;
  protected confirmStatusScriptCbor: string;
  protected confirmStatusCompileCode: string;

  /**
   * Create a new MeshAdapter instance.
   *
   * This constructor initializes the adapter with a Mesh wallet, fetcher,
   * and transaction builder. It also loads and applies parameters to
   * Plutus scripts from the compiled blueprint, derives script addresses,
   * and resolves the minting policy ID.
   *
   * @param {Object} params - Constructor parameters.
   * @param {MeshWallet} [params.meshWallet] - The Mesh wallet instance used
   * for building and signing transactions.
   *
   * Properties initialized:
   * - `meshWallet`: Connected Mesh wallet instance.
   * - `fetcher`: Blockfrost provider used for querying blockchain data.
   * - `meshTxBuilder`: Transaction builder bound to fetcher and evaluator.
   * - `mintScript`, `confirmStatusScript`: Plutus V3 scripts for minting and spending.
   * - `mintScriptCbor`, `confirmStatusScriptCbor`: Serialized CBOR code for scripts.
   * - `confirmStatusAddress`: Derived script address for the spending contract.
   * - `policyId`: Unique identifier for the minting policy.
   *
   * @throws Error if the required validator is not found in the blueprint.
   */
  constructor({
    meshWallet = null!,
    ownerAddress,
  }: {
    meshWallet?: MeshWallet;
    ownerAddress?: string;
  }) {
    this.meshWallet = meshWallet;
    this.fetcher = blockfrostProvider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: blockfrostProvider,
    });
    this.confirmStatusCompileCode = this.readValidator(
      blueprint as Plutus,
      title.spend,
    );

    this.mintCompileCode = this.readValidator(blueprint as Plutus, title.mint);
    this.pubKeyOwner = deserializeAddress(
      ownerAddress ? ownerAddress : this.meshWallet.getChangeAddress(),
    ).pubKeyHash;
    this.confirmStatusScriptCbor = applyParamsToScript(
      this.confirmStatusCompileCode,
      [this.pubKeyOwner],
    );

    this.confirmStatusScript = {
      code: this.confirmStatusScriptCbor,
      version: 'V3',
    };

    this.mintScriptCbor = applyParamsToScript(this.mintCompileCode, [
      this.pubKeyOwner,
    ]);

    this.confirmStatusAddress = serializePlutusScript(
      this.confirmStatusScript,
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
    const utxos = await this.meshWallet.getUtxos();
    const collaterals = await this.meshWallet.getCollateral();
    const walletAddress = this.meshWallet.getChangeAddress();
    if (!walletAddress)
      throw new Error('No wallet address found in getWalletForTx method.');

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
