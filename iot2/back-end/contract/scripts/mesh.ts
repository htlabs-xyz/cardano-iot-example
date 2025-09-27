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
import { blockfrostProvider, convertInlineDatum } from './common';
import { Plutus } from './type';

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

  constructor({ meshWallet = null! }: { meshWallet?: MeshWallet }) {
    this.meshWallet = meshWallet;
    this.fetcher = blockfrostProvider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: blockfrostProvider,
    });
    this.confirmStatusCompileCode = this.readValidator(
      blueprint as Plutus,
      'contract.status_management.spend',
    );

    this.mintCompileCode = this.readValidator(
      blueprint as Plutus,
      'contract.status_management.mint',
    );
    this.pubKeyOwner = deserializeAddress(
      process.env.OWNER_ADDRESS as string,
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

  protected getUtxoForTx = async (address: string, txHash: string) => {
    const utxos: UTxO[] = await this.fetcher.fetchAddressUTxOs(address);
    const utxo = utxos.find(function (utxo: UTxO) {
      return utxo.input.txHash === txHash;
    });

    if (!utxo) throw new Error('No UTXOs found in getUtxoForTx method.');
    return utxo;
  };

  protected readValidator = function (plutus: Plutus, title: string): string {
    const validator = plutus.validators.find(function (validator) {
      return validator.title === title;
    });

    if (!validator) {
      throw new Error(`${title} validator not found.`);
    }

    return validator.compiledCode;
  };

  protected getAddressUTXOAsset = async (address: string, unit: string) => {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };

  protected getAddressUTXOAssets = async (address: string, unit: string) => {
    return await this.fetcher.fetchAddressUTxOs(address, unit);
  };

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
