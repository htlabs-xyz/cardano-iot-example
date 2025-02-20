import {
  CIP68_100,
  CIP68_222,
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
import { getPkHash } from './common';

export class SupplyChainManagementContract extends MeshAdapter {
  mint = async (
    params: {
      assetName: string;
      metadata: Record<string, string>;
      quantity: string;
      receiver: string;
    }[],
  ) => {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();
    const unsignedTx = this.meshTxBuilder.mintPlutusScriptV3();
    const txOutReceiverMap = new Map<
      string,
      { unit: string; quantity: string }[]
    >();
    await Promise.all(
      params.map(
        async ({ assetName, metadata, quantity = '1', receiver = '' }) => {
          const existUtXOwithUnit = await this.getAddressUTXOAsset(
            this.storeAddress,
            this.policyId + CIP68_100(stringToHex(assetName)),
          );
          if (existUtXOwithUnit?.output?.plutusData) {
            const pk = await getPkHash(
              existUtXOwithUnit?.output?.plutusData as string,
            );
            if (pk !== deserializeAddress(walletAddress).pubKeyHash) {
              throw new Error(`${assetName} has been exist`);
            }
            const receiverKey = !isEmpty(receiver) ? receiver : walletAddress;
            if (txOutReceiverMap.has(receiverKey)) {
              txOutReceiverMap.get(receiverKey)!.push({
                unit: this.policyId + CIP68_222(stringToHex(assetName)),
                quantity: quantity,
              });
            } else {
              txOutReceiverMap.set(receiverKey, [
                {
                  unit: this.policyId + CIP68_222(stringToHex(assetName)),
                  quantity: quantity,
                },
              ]);
            }
            unsignedTx
              .spendingPlutusScriptV3()
              .txIn(
                existUtXOwithUnit.input.txHash,
                existUtXOwithUnit.input.outputIndex,
              )
              .txInInlineDatumPresent()
              .txInRedeemerValue(mConStr0([]))
              .txInScript(this.storeScriptCbor)
              .txOut(this.storeAddress, [
                {
                  unit: this.policyId + CIP68_100(stringToHex(assetName)),
                  quantity: '1',
                },
              ])
              .txOutInlineDatumValue(metadataToCip68(metadata))

              .mintPlutusScriptV3()
              .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
              .mintingScript(this.mintScriptCbor)
              .mintRedeemerValue(mConStr0([]));
          } else {
            const receiverKey = !isEmpty(receiver) ? receiver : walletAddress;
            if (txOutReceiverMap.has(receiverKey)) {
              txOutReceiverMap.get(receiverKey)!.push({
                unit: this.policyId + CIP68_222(stringToHex(assetName)),
                quantity: quantity,
              });
            } else {
              txOutReceiverMap.set(receiverKey, [
                {
                  unit: this.policyId + CIP68_222(stringToHex(assetName)),
                  quantity: quantity,
                },
              ]);
            }

            unsignedTx
              .mintPlutusScriptV3()
              .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
              .mintingScript(this.mintScriptCbor)
              .mintRedeemerValue(mConStr0([]))

              .mintPlutusScriptV3()
              .mint('1', this.policyId, CIP68_100(stringToHex(assetName)))
              .mintingScript(this.mintScriptCbor)
              .mintRedeemerValue(mConStr0([]))
              .txOut(this.storeAddress, [
                {
                  unit: this.policyId + CIP68_100(stringToHex(assetName)),
                  quantity: '1',
                },
              ])
              .txOutInlineDatumValue(metadataToCip68(metadata));
          }
        },
      ),
    );

    txOutReceiverMap.forEach((assets, receiver) => {
      unsignedTx.txOut(receiver, assets);
    });

    unsignedTx

      .txOut(
        'addr_test1qptfdrrlhjx5j3v9779q5gh9svzw40nzl74u0q4npxvjrxde20fdxw39qjk6nususjj4m5j9n8xdlptqqk3rlp69qv4q8v6ahk',
        [
          {
            unit: 'lovelace',
            quantity: '1000000',
          },
        ],
      )
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

  burn = async (
    params: { assetName: string; quantity: string; txHash?: string }[],
  ) => {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();
    const unsignedTx = this.meshTxBuilder;
    await Promise.all(
      params.map(async ({ assetName, quantity, txHash }) => {
        const userUtxos = await this.getAddressUTXOAssets(
          walletAddress,
          this.policyId + CIP68_222(stringToHex(assetName)),
        );
        const amount = userUtxos.reduce((amount, utxos) => {
          return (
            amount +
            utxos.output.amount.reduce((amt, utxo) => {
              if (
                utxo.unit ===
                this.policyId + CIP68_222(stringToHex(assetName))
              ) {
                return amt + Number(utxo.quantity);
              }
              return amt;
            }, 0)
          );
        }, 0);
        const storeUtxo = !isNil(txHash)
          ? await this.getUtxoForTx(this.storeAddress, txHash)
          : await this.getAddressUTXOAsset(
              this.storeAddress,
              this.policyId + CIP68_100(stringToHex(assetName)),
            );
        if (!storeUtxo) throw new Error('Store UTXO not found');

        if (-Number(quantity) === amount) {
          unsignedTx
            .mintPlutusScriptV3()
            .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
            .mintRedeemerValue(mConStr1([]))
            .mintingScript(this.mintScriptCbor)

            .mintPlutusScriptV3()
            .mint('-1', this.policyId, CIP68_100(stringToHex(assetName)))
            .mintRedeemerValue(mConStr1([]))
            .mintingScript(this.mintScriptCbor)

            .spendingPlutusScriptV3()
            .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
            .txInInlineDatumPresent()
            .txInRedeemerValue(mConStr1([]))
            .txInScript(this.storeScriptCbor);
        } else {
          unsignedTx
            .mintPlutusScriptV3()
            .mint(quantity, this.policyId, CIP68_222(stringToHex(assetName)))
            .mintRedeemerValue(mConStr1([]))
            .mintingScript(this.mintScriptCbor)

            .txOut(walletAddress, [
              {
                unit: this.policyId + CIP68_222(stringToHex(assetName)),
                quantity: String(amount + Number(quantity)),
              },
            ]);
        }
      }),
    );

    unsignedTx
      .txOut(
        'addr_test1qptfdrrlhjx5j3v9779q5gh9svzw40nzl74u0q4npxvjrxde20fdxw39qjk6nususjj4m5j9n8xdlptqqk3rlp69qv4q8v6ahk',
        [
          {
            unit: 'lovelace',
            quantity: '1000000',
          },
        ],
      )

      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
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

  update = async (
    params: {
      assetName: string;
      metadata: Record<string, string>;
      txHash?: string;
    }[],
  ) => {
    const { utxos, walletAddress, collateral } = await this.getWalletForTx();
    const unsignedTx = this.meshTxBuilder;
    await Promise.all(
      params.map(async ({ assetName, metadata, txHash }) => {
        const storeUtxo = !isNil(txHash)
          ? await this.getUtxoForTx(this.storeAddress, txHash)
          : await this.getAddressUTXOAsset(
              this.storeAddress,
              this.policyId + CIP68_100(stringToHex(assetName)),
            );
        if (!storeUtxo) throw new Error('Store UTXO not found');
        unsignedTx
          .spendingPlutusScriptV3()
          .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
          .txInInlineDatumPresent() // Lấy datum ở utxo chi tiêu
          // .spendingReferenceTxInInlineDatumPresent() // lấy datum ở utxo reference
          .txInRedeemerValue(mConStr0([]))
          .txInScript(this.storeScriptCbor)
          .txOut(this.storeAddress, [
            {
              unit: this.policyId + CIP68_100(stringToHex(assetName)),
              quantity: '1',
            },
          ])
          .txOutInlineDatumValue(metadataToCip68(metadata));
      }),
    );

    unsignedTx
      .txOut(
        'addr_test1qptfdrrlhjx5j3v9779q5gh9svzw40nzl74u0q4npxvjrxde20fdxw39qjk6nususjj4m5j9n8xdlptqqk3rlp69qv4q8v6ahk',
        [
          {
            unit: 'lovelace',
            quantity: '1000000',
          },
        ],
      )
      .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
      .changeAddress(walletAddress)
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
