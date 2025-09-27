import {
  deserializeAddress,
  mConStr0,
  mConStr1,
  stringToHex,
} from '@meshsdk/core';
import { MeshAdapter } from './mesh';

export class StatusManagement extends MeshAdapter {
  lock = async ({ title }: { title: string }) => {
    const { utxos, collateral, walletAddress } = await this.getWalletForTx();

    console.log(walletAddress);
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress as string,
      this.policyId + stringToHex(title),
    );

    const unsignedTx = this.meshTxBuilder;
    if (!utxo) {
      unsignedTx
        .mintPlutusScriptV3()
        .mint('1', this.policyId, stringToHex(title))
        .mintingScript(this.mintScriptCbor)
        .mintRedeemerValue(mConStr0([]))

        .txOut(this.confirmStatusAddress as string, [
          {
            unit: this.policyId + stringToHex(title),
            quantity: String(1),
          },
        ])
        .txOutInlineDatumValue(
          mConStr0([
            mConStr0([
              deserializeAddress(walletAddress).pubKeyHash,
              deserializeAddress(walletAddress).stakeCredentialHash,
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
        .txInScript(this.confirmStatusScriptCbor)
        .txOut(this.confirmStatusAddress as string, [
          {
            unit: this.policyId + stringToHex(title),
            quantity: String(1),
          },
        ])
        .txOutInlineDatumValue(
          mConStr0([
            mConStr0([
              deserializeAddress(datum.authorized).pubKeyHash,
              deserializeAddress(datum.authorized).stakeCredentialHash,
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
      .setNetwork('preprod');
    return await unsignedTx.complete();
  };

  unLock = async ({ title }: { title: string }) => {
    const { utxos, collateral, walletAddress } = await this.getWalletForTx();

    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress as string,
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
        .txInScript(this.confirmStatusScriptCbor)
        .txOut(this.confirmStatusAddress as string, [
          {
            unit: this.policyId + stringToHex(title),
            quantity: String(1),
          },
        ])
        .txOutInlineDatumValue(
          mConStr0([
            mConStr0([
              deserializeAddress(datum.authorized).pubKeyHash,
              deserializeAddress(datum.authorized).stakeCredentialHash,
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
      .setNetwork('preprod');
    return await unsignedTx.complete();
  };

  authorize = async ({
    title,
    authority,
  }: {
    title: string;
    authority: string;
  }) => {
    const { utxos, collateral, walletAddress } = await this.getWalletForTx();
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress as string,
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
        .txInScript(this.confirmStatusScriptCbor)
        .txOut(this.confirmStatusAddress as string, [
          {
            unit: this.policyId + stringToHex(title),
            quantity: String(1),
          },
        ])
        .txOutInlineDatumValue(
          mConStr0([
            mConStr0([
              deserializeAddress(authority ? authority : datum.authorized)
                .pubKeyHash,
              deserializeAddress(authority ? authority : datum.authorized)
                .stakeCredentialHash,
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
      .setNetwork('preprod');
    return await unsignedTx.complete();
  };
}
