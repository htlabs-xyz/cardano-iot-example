import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  deserializeAddress,
  deserializeDatum,
  MeshWallet,
  stringToHex
} from '@meshsdk/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MeshAdapter } from 'contract/scripts/mesh';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
import { AppGateway } from './app.gateway';
import AuthorizeRequestModel from './models/authorize-request.model';
import { DatumModel } from './models/datum.model';
import LockRequestModel, {
  AccessLockResponseModel,
  AccessRole,
  LockStatusModel,
  SubmitTxModel,
} from './models/lock-request.model';
@Injectable()
export class AppService extends MeshAdapter {
  private blockFrostAPI: BlockFrostAPI;
  private LOCK_NAME: string;
  constructor(private readonly appGateway: AppGateway) {
    super({ meshWallet: undefined });
    this.blockFrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
    this.LOCK_NAME = process.env.LOCK_NAME ?? '';
  }

  async getAccessLock(walletAddress: string) {
    this.meshWallet = this.getWalletClient(walletAddress);
    const userPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress,
      this.getAssetEncoded(),
    );
    console.log(`userPaymentKeyHash: ${userPaymentKeyHash}`);
    return;
    // If new lock name
    if (!utxo || utxo == null) {
      const confirmStatusContract = new StatusManagement({
        meshWallet: this.meshWallet,
      });
      const unsignedTx = await confirmStatusContract.lock({
        title: this.LOCK_NAME,
      });
      return {
        access_role: AccessRole.NEW_USER,
        new_user_unsigned_tx: unsignedTx,
        lock_status: true,
      } satisfies AccessLockResponseModel;
    }

    const datum = deserializeDatum<DatumModel>(utxo.output.plutusData ?? '');
    console.log('datum:', JSON.stringify(datum));
    
    const ownerBytes = datum.fields[0].fields[0].bytes;
    const authorityBytes = datum.fields[0].fields[1].bytes;
    const isLocked = datum.fields[1].int === 1;

    const access_role =
      userPaymentKeyHash === ownerBytes
        ? AccessRole.OWNER
        : userPaymentKeyHash === authorityBytes
          ? AccessRole.AUTHORITY
          : AccessRole.UNKNOWN;

    return {
      access_role,
      lock_status: access_role === AccessRole.UNKNOWN ? false : isLocked,
    } satisfies AccessLockResponseModel;
  }

  async updateStatusDevice(lockRequestModel: LockRequestModel) {
    if (lockRequestModel.unlocker_addr.trim() == '')
      throw new HttpException(
        'The address wallet of unlocker must be not null',
        HttpStatus.BAD_REQUEST,
      );
    let unsignedTx: string;

    const currentUserWallet = this.getWalletClient(
      lockRequestModel.unlocker_addr,
    );
    const confirmStatusContract = new StatusManagement({
      meshWallet: currentUserWallet,
    });
    if (lockRequestModel.is_unlock) {
      unsignedTx = await confirmStatusContract.unLock({
        title: this.LOCK_NAME,
      });
    } else {
      unsignedTx = await confirmStatusContract.lock({
        title: this.LOCK_NAME,
      });
    }
    console.log(unsignedTx);
    return unsignedTx;
  }

  async requestAuthorize(authorizeRequestModel: AuthorizeRequestModel) {
    let authorityPaymentKeyHash: string = '';
    if (!authorizeRequestModel.is_remove_authorize) {
      authorityPaymentKeyHash = deserializeAddress(
        authorizeRequestModel.licensee_addr,
      ).pubKeyHash;
    }
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress,
      this.policyId + stringToHex(this.LOCK_NAME),
    );
    const datum = deserializeDatum(utxo.output.plutusData ?? '');
    console.log('datum:');
    console.log(datum);
    console.log(`authorityPublicKeyHash: ${authorityPaymentKeyHash}`);
    const confirmStatusContract = new StatusManagement({
      meshWallet: this.meshWallet,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: this.LOCK_NAME,
      authority: authorityPaymentKeyHash,
    });
    console.log(unsignedTx);
    return unsignedTx;
  }

  async submitTransaction(submitModel: SubmitTxModel) {
    console.log(
      `Submitting transaction for user: ${JSON.stringify(submitModel)}`,
    );
    const currentUserWallet = this.getWalletClient(submitModel.user_addr);
    const txHash = await currentUserWallet.submitTx(submitModel.signedTx);
    //console.log('https://preprod.cexplorer.io/tx/' + txHash);
    // Wait for transaction confirmation
    await new Promise<void>((resolve, reject) => {
      blockfrostProvider.onTxConfirmed(txHash, () => {
        if (txHash.length === 64) {
          resolve();
        } else {
          reject(new Error('Invalid transaction hash length'));
        }
      });
    });

    this.appGateway.server.emit('onUpdatedLockStatus', submitModel.data);
    return {
      tx_hash: txHash,
      tx_ref: 'https://preprod.cexplorer.io/tx/' + txHash,
    };
  }

  async getLockStatus() {
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress,
      this.policyId + stringToHex(this.LOCK_NAME),
    );
    // const utxos = await blockfrostProvider.fetchAddressUTxOs(contractAddr);
    const transactionUtxos = await this.blockFrostAPI.txsUtxos(
      utxo.input.txHash,
    );
    const datum = deserializeDatum(utxo.output.plutusData ?? '');
    const lockStatus: LockStatusModel = {
      lock_status: datum.fields[2].int == 1,
      user_addr: transactionUtxos.outputs[1].address,
      time: new Date(),
      tx_ref: 'https://preprod.cexplorer.io/tx/' + utxo.input.txHash,
    };
    return lockStatus;
  }

  async getAllLockHistory() {
    const encodedAssetName = this.getAssetEncoded();
    const transactions =
      await this.blockFrostAPI.assetsTransactions(encodedAssetName);
    const listLockStatus: LockStatusModel[] = [];
    for (const tx of transactions) {
      const utxo = await this.blockFrostAPI.txsUtxos(tx.tx_hash);
      const datum_hash = utxo.outputs[0].inline_datum;
      if (datum_hash != null && datum_hash != undefined) {
        const datum_deserialize = deserializeDatum(datum_hash);
        if (
          datum_deserialize &&
          datum_deserialize.fields &&
          datum_deserialize.fields[2].int != undefined
        ) {
          const LockModel = new LockStatusModel();
          LockModel.time = new Date(tx.block_time * 1000);
          LockModel.lock_status = datum_deserialize.fields[2].int == 1;
          LockModel.tx_ref =
            'https://preprod.cexplorer.io/tx/' + utxo.inputs[0].tx_hash;
          listLockStatus.push(LockModel);
        }
      }
    }
    return listLockStatus;
  }

  getWalletClient(walletAddress: string) {
    return new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'address',
        address: walletAddress,
      },
    });
  }

  getAssetEncoded() {
    return this.policyId + stringToHex(this.LOCK_NAME);
  }
}
