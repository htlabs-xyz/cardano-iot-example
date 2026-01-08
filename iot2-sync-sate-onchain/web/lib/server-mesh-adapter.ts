import {
  applyParamsToScript,
  deserializeAddress,
  deserializeDatum,
  type IFetcher,
  MeshTxBuilder,
  type PlutusScript,
  pubKeyAddress,
  resolveScriptHash,
  serializeAddressObj,
  serializePlutusScript,
  stringToHex,
  type UTxO,
} from '@meshsdk/core';
import blueprint from '../plutus.json';
import { meshProvider } from './blockfrost';

/**
 * ServerMeshAdapter
 *
 * Server-side adapter for building unsigned transactions.
 * Unlike the original MeshAdapter, this does NOT require a wallet instance.
 * Owner's pubKeyHash is derived from the provided ownerAddress.
 * Server fetches UTXOs from Blockfrost instead of receiving from client.
 */
export class ServerMeshAdapter {
  public policyId: string;
  protected fetcher: IFetcher;
  protected mintCompileCode: string;
  protected mintScriptCbor: string;
  protected mintScript: PlutusScript;
  protected meshTxBuilder: MeshTxBuilder;
  protected lockerAddress: string;
  protected lockerScript: PlutusScript;
  protected lockerScriptCbor: string;
  protected lockerCompileCode: string;

  /**
   * Constructor - synchronous initialization
   * @param ownerAddress - Bech32 address of the owner (for script parameterization)
   */
  constructor({ ownerAddress }: { ownerAddress: string }) {
    this.fetcher = meshProvider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: meshProvider,
    });

    // Read validator bytecode from blueprint
    this.lockerCompileCode = this.readValidator(
      blueprint,
      'contract.locker.spend'
    );
    this.mintCompileCode = this.readValidator(
      blueprint,
      'contract.locker.mint'
    );

    // Derive pubKeyHash from owner address
    const pubKeyOwner = deserializeAddress(ownerAddress).pubKeyHash;

    // Parameterize locker script
    this.lockerScriptCbor = applyParamsToScript(this.lockerCompileCode, [
      pubKeyOwner,
    ]);
    this.lockerScript = {
      code: this.lockerScriptCbor,
      version: 'V3',
    };

    // Parameterize mint script
    this.mintScriptCbor = applyParamsToScript(this.mintCompileCode, [
      pubKeyOwner,
    ]);
    this.mintScript = {
      code: this.mintScriptCbor,
      version: 'V3',
    };

    // Derive locker address from script
    this.lockerAddress = serializePlutusScript(
      this.lockerScript,
      undefined,
      0,
      false
    ).address;

    // Derive policy ID
    this.policyId = resolveScriptHash(this.mintScriptCbor, 'V3');
  }

  /**
   * Read validator bytecode from Plutus blueprint
   */
  protected readValidator(plutus: any, title: string): string {
    const validator = plutus.validators.find((v: any) => v.title === title);
    if (!validator) {
      throw new Error(`${title} validator not found.`);
    }
    return validator.compiledCode;
  }

  /**
   * Fetch UTxOs for wallet address from Blockfrost
   */
  protected async fetchWalletUtxos(walletAddress: string): Promise<UTxO[]> {
    const utxos = await this.fetcher.fetchAddressUTxOs(walletAddress);
    if (!utxos || utxos.length === 0) {
      throw new Error('No UTXOs found for wallet address');
    }
    return utxos;
  }

  /**
   * Find a suitable collateral UTxO (pure ADA, >= 5 ADA)
   */
  protected findCollateral(utxos: UTxO[]): UTxO {
    const collateral = utxos.find((utxo) => {
      const hasOnlyLovelace =
        utxo.output.amount.length === 1 &&
        utxo.output.amount[0].unit === 'lovelace';
      const hasEnoughAda =
        hasOnlyLovelace &&
        parseInt(utxo.output.amount[0].quantity) >= 5_000_000;
      return hasEnoughAda;
    });

    if (!collateral) {
      throw new Error(
        'No suitable collateral found. Need a UTxO with >= 5 ADA and no other tokens.'
      );
    }
    return collateral;
  }

  /**
   * Fetch UTxO at locker address containing specific asset
   */
  protected async getAddressUTXOAsset(
    address: string,
    unit: string
  ): Promise<UTxO | undefined> {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  }

  /**
   * Convert Plutus datum to readable format
   */
  protected convertDatum(plutusData: string): {
    authorized: string;
    isLock: number;
  } {
    const datum = deserializeDatum(plutusData);
    const authority = serializeAddressObj(
      pubKeyAddress(
        datum.fields[0].fields[0].bytes,
        datum.fields[0].fields[1].bytes,
        false
      ),
      0
    );
    const isLocked = datum.fields[1].int;

    return {
      authorized: authority,
      isLock: isLocked,
    };
  }

  /**
   * Get locker address (for querying status)
   */
  public getLockerAddress(): string {
    return this.lockerAddress;
  }

  /**
   * Get asset unit for the lock token
   */
  public getAssetUnit(title: string): string {
    return this.policyId + stringToHex(title);
  }
}
