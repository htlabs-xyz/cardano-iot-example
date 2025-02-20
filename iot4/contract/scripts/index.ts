import {
  CIP68_100,
  CIP68_222,
  conStr0,
  deserializeAddress,
  ForgeScript,
  mConStr0,
  mConStr1,
  metadataToCip68,
  resolveScriptHash,
  scriptAddress,
  serializeAddressObj,
  stringToHex,
} from '@meshsdk/core';
import { MeshAdapter } from './mesh';
import { isEmpty, isNil } from 'lodash';
import { getPkHash, datumToJson } from './common';

export class SupplyChainManagementContract extends MeshAdapter {
  read = async ({ policyId,assetName }: {policyId: string, assetName: string }) => {
    const utxo = await this.getAddressUTXOAsset(
      this.decentralizeIdentityAddress,
      policyId + stringToHex(assetName),
    );

    const metadata = await datumToJson(utxo?.output?.plutusData || "");
    return metadata;
  };

  write = async ({
    assetName,
    metadata,
  }: {
    assetName: string;
    metadata: any;
  }) => {
    const { utxos, collateral, walletAddress } = await this.getWalletForTx();

    const forgingScript = ForgeScript.withOneSignature(walletAddress);
    const policyId = resolveScriptHash(forgingScript);

    const utxo = await this.getAddressUTXOAsset(
      this.decentralizeIdentityAddress,
      policyId + stringToHex(assetName),
    );

    const unsignedTx = this.meshTxBuilder;
    if (!utxo) {
      unsignedTx
        .mint('1', policyId, stringToHex(assetName))
        .mintingScript(forgingScript)
        .txOut(this.decentralizeIdentityAddress, [
          { unit: policyId + stringToHex(assetName), quantity: String(1) },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
    } else {
      unsignedTx
        .spendingPlutusScriptV3()
        .txIn(utxo.input.txHash, utxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(conStr0([]))
        .txInScript(this.decentralizeIdentityScriptCbor)
        .txOut(this.decentralizeIdentityAddress, [
          {
            unit: policyId + stringToHex(assetName),
            quantity: String('1'),
          },
        ])
        .txOutInlineDatumValue(metadataToCip68(metadata));
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
