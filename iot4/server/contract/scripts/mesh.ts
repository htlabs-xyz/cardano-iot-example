import {
  applyParamsToScript,
  BrowserWallet,
  deserializeAddress,
  IFetcher,
  MeshTxBuilder,
  MeshWallet,
  PlutusScript,
  resolveScriptHash,
  scriptAddress,
  serializeAddressObj,
  serializePlutusScript,
  UTxO,
} from '@meshsdk/core';
import { Plutus } from './type';

import plutus from '../plutus.json';
import { blockfrostProvider } from './common';

export class MeshAdapter {
  protected fetcher: IFetcher;
  protected meshTxBuilder: MeshTxBuilder;
  protected wallet: MeshWallet | BrowserWallet;
  protected decentralizeIdentityCompileCode: string;
  protected decentralizeIdentityScriptCbor: string;
  protected decentralizeIdentityScript: PlutusScript;
  protected decentralizeIdentityAddress: string;
  protected decentralizeIdentityScriptHash: string;

  constructor({ wallet = null! }: { wallet?: MeshWallet }) {
    this.wallet = wallet;
    this.fetcher = blockfrostProvider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: blockfrostProvider,
    });
    this.decentralizeIdentityCompileCode = this.readValidator(
      plutus as Plutus,
      'decentralize_identity.decentralize_identity.spend'
    );

    this.decentralizeIdentityScriptCbor = applyParamsToScript(
      this.decentralizeIdentityCompileCode,
      [],
    );
    this.decentralizeIdentityScript = {
      code: this.decentralizeIdentityScriptCbor,
      version: 'V3',
    };

    this.decentralizeIdentityAddress = serializeAddressObj(
      scriptAddress(
        deserializeAddress(
          serializePlutusScript(
            this.decentralizeIdentityScript,
            undefined,
            0,
            false,
          ).address,
        ).scriptHash,
      ),
      0,
    );

    this.decentralizeIdentityScriptHash = deserializeAddress(
      this.decentralizeIdentityAddress,
    ).scriptHash;
  }

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
      throw new Error('No wallet address found in getWalletForTx method.');

    return { utxos, collateral: collaterals[0], walletAddress };
  };

  protected getUtxoForTx = async (
    address: string,
    txHash?: string,
  ): Promise<UTxO> => {
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

  protected getAddressUTXOAsset = async (
    address: string,
    unit: string,
  ): Promise<UTxO> => {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };

  protected getAddressUTXOAssets = async (
    address: string,
    unit: string,
  ): Promise<UTxO[]> => {
    return await this.fetcher.fetchAddressUTxOs(address, unit);
  };
}
