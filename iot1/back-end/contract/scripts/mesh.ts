import {
  applyParamsToScript,
  BrowserWallet,
  IFetcher,
  MeshTxBuilder,
  MeshWallet,
  PlutusScript,
  serializePlutusScript,
  UTxO,
} from '@meshsdk/core';
import blueprint from '../plutus.json';
import { blockfrostProvider, convertInlineDatum } from './common';
import { Plutus } from './type';

export class MeshAdapter {
  protected fetcher: IFetcher;
  protected wallet: MeshWallet;
  protected meshTxBuilder: MeshTxBuilder;
  protected confirmStatusAddress: string;
  protected confirmStatusScript: PlutusScript;
  protected confirmStatusScriptCbor: string;
  protected confirmStatusCompileCode: string;

  constructor({ wallet = null! }: { wallet?: MeshWallet }) {
    this.wallet = wallet;
    this.fetcher = blockfrostProvider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: blockfrostProvider,
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

  protected getWalletForTx = async (): Promise<{
    utxos: UTxO[];
    collateral: UTxO;
    walletAddress: string;
  }> => {
    const utxos = await this.wallet.getUtxos();
    const collaterals = await this.wallet.getCollateral();
    const walletAddress = await this.wallet.getChangeAddress();
    //console.log('utxos:', utxos);
    if (!utxos || utxos.length === 0)
      throw new Error('No UTXOs found in getWalletForTx method.');

    if (!collaterals || collaterals.length === 0)
      throw new Error('No collateral found in getWalletForTx method.');

    if (!walletAddress)
      throw new Error('No wallet address found in getWalletForTx method.');

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

  protected readPlutusData = async ({ plutusData }: { plutusData: string }) => {
    const datum = await convertInlineDatum({ inlineDatum: plutusData });
    return {
      policyId: datum?.fields[0].bytes,
      assetName: datum?.fields[1].bytes,
      seller: datum?.fields[2].bytes,
      price: datum?.fields[3].int,
    };
  };

  protected getAddressUTXOAsset = async (address: string, unit: string) => {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };

  protected getAddressUTXOAssets = async (address: string, unit: string) => {
    return await this.fetcher.fetchAddressUTxOs(address, unit);
  };
}
