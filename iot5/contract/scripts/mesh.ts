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
} from "@meshsdk/core";
import { Plutus } from "./type";

import plutus from "../plutus.json";
import { blockfrostProvider } from "./common";

export class MeshAdapter {
  protected meshTxBuilder: MeshTxBuilder;
  protected wallet: MeshWallet| BrowserWallet;
  protected fetcher: IFetcher;
  protected pubKeyExchange: string;
  protected pubKeyIssuer: string;
  protected mintCompileCode: string;
  protected storeCompileCode: string;
  protected storeScriptCbor: string;
  protected storeScript: PlutusScript;
  public storeAddress: string;
  protected storeScriptHash: string;
  protected mintScriptCbor: string;
  protected mintScript: PlutusScript;

  public policyId: string;

  constructor({ wallet = null! }: { wallet?: MeshWallet }) {
    this.wallet = wallet;
    this.fetcher = blockfrostProvider;
    this.meshTxBuilder = new MeshTxBuilder({
      fetcher: this.fetcher,
      evaluator: blockfrostProvider,
    });
    this.initialize();
  }

    private async initialize() {
    this.pubKeyIssuer = deserializeAddress(await this.wallet.getChangeAddress()).pubKeyHash;
    this.pubKeyExchange = deserializeAddress("addr_test1qptfdrrlhjx5j3v9779q5gh9svzw40nzl74u0q4npxvjrxde20fdxw39qjk6nususjj4m5j9n8xdlptqqk3rlp69qv4q8v6ahk").pubKeyHash;
    this.mintCompileCode = this.readValidator(plutus as Plutus, "mint.mint.mint");
    this.storeCompileCode = this.readValidator(plutus as Plutus, "store.store.spend");

    this.storeScriptCbor = applyParamsToScript(this.storeCompileCode, [this.pubKeyExchange, BigInt(1), this.pubKeyIssuer]);

    this.storeScript = {
      code: this.storeScriptCbor,
      version: "V3",
    };

    this.storeAddress = serializeAddressObj(
      scriptAddress(
        deserializeAddress(serializePlutusScript(this.storeScript, undefined, 0, false).address).scriptHash,
        deserializeAddress("addr_test1qptfdrrlhjx5j3v9779q5gh9svzw40nzl74u0q4npxvjrxde20fdxw39qjk6nususjj4m5j9n8xdlptqqk3rlp69qv4q8v6ahk").stakeCredentialHash,
        false,
      ),
      0,
    );

    this.storeScriptHash = deserializeAddress(this.storeAddress).scriptHash;
    this.mintScriptCbor = applyParamsToScript(this.mintCompileCode, [
      this.pubKeyExchange,
      BigInt(1),
      this.storeScriptHash,
      deserializeAddress("addr_test1qptfdrrlhjx5j3v9779q5gh9svzw40nzl74u0q4npxvjrxde20fdxw39qjk6nususjj4m5j9n8xdlptqqk3rlp69qv4q8v6ahk").stakeCredentialHash,
      this.pubKeyIssuer,
    ]);
    this.mintScript = {
      code: this.mintScriptCbor,
      version: "V3",
    };
    this.policyId = resolveScriptHash(this.mintScriptCbor, "V3");
  }

  protected getWalletForTx = async (): Promise<{
    utxos: UTxO[];
    collateral: UTxO;
    walletAddress: string;
  }> => {
    const utxos = await this.wallet.getUtxos();
    const collaterals = await this.wallet.getCollateral();
    const walletAddress = await this.wallet.getChangeAddress();
    if (!utxos || utxos.length === 0) throw new Error("No UTXOs found in getWalletForTx method.");

    if (!collaterals || collaterals.length === 0) throw new Error("No collateral found in getWalletForTx method.");

    if (!walletAddress) throw new Error("No wallet address found in getWalletForTx method.");

    return { utxos, collateral: collaterals[0], walletAddress };
  };

  protected getUtxoForTx = async (address: string, txHash?: string): Promise<UTxO> => {
    const utxos: UTxO[] = await this.fetcher.fetchAddressUTxOs(address);
    const utxo = utxos.find(function (utxo: UTxO) {
      return utxo.input.txHash === txHash;
    });

    if (!utxo) throw new Error("No UTXOs found in getUtxoForTx method.");
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

  protected getAddressUTXOAsset = async (address: string, unit: string): Promise<UTxO> => {
    const utxos = await this.fetcher.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };

  protected getAddressUTXOAssets = async (address: string, unit: string): Promise<UTxO[]> => {
    return await this.fetcher.fetchAddressUTxOs(address, unit);
  };
}