import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  deserializeAddress,
  deserializeDatum,
  ForgeScript,
  MeshWallet,
  pubKeyAddress,
  resolveScriptHash,
  serializeAddressObj,
  stringToHex,
} from '@meshsdk/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
import { AppGateway } from './app.gateway';
import AuthorizeRequestModel from './models/authorize-request.model';
import LockRequestModel, {
  LockStatusModel,
  SubmitTxModel,
} from './models/lock-request.model';
import { MeshAdapter } from 'contract/scripts/mesh';

@Injectable()
export class AppService extends MeshAdapter {
  protected wallet: MeshWallet;
  private txHashTemp: string;
  private blockFrostAPI: BlockFrostAPI;
  private policyId: string;
  private lockName: string;
  private confirmStatusContract: StatusManagement;
  private ownerWallet: MeshWallet;
  constructor(private readonly appGateway: AppGateway) {
    super({ wallet: undefined });
    this.blockFrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
    const forgingScript = ForgeScript.withOneSignature(
      process.env.WALLET_ADDRESS_OWNER ?? '',
    );
    this.policyId = resolveScriptHash(forgingScript);
    this.lockName = process.env.LOCK_NAME ?? '';
    this.ownerWallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.OWNER?.split(' ') || [],
      },
    });
    this.confirmStatusContract = new StatusManagement({
      wallet: this.ownerWallet,
    });
  }

  async getAccessLock(walletAddress: string) {
    const userPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
    // const utxos = await blockfrostProvider.fetchAddressUTxOs(
    //   this.confirmStatusAddress,
    // );
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress,
      this.policyId + stringToHex(this.lockName),
    );

    // If new lock name
    if (
      (!utxo || utxo == null) &&
      walletAddress == process.env.WALLET_ADDRESS_OWNER
    ) {
      const unsignedTx = await this.confirmStatusContract.lock({
        title: this.lockName,
        authority: '',
        isLock: 1,
      });
      const signedTx = await this.ownerWallet.signTx(unsignedTx, true);
      const txHash = await this.ownerWallet.submitTx(signedTx);
      await new Promise<void>((resolve, reject) => {
        blockfrostProvider.onTxConfirmed(txHash, () => {
          if (txHash.length === 64) {
            resolve();
          } else {
            reject(new Error('Invalid transaction hash length'));
          }
        });
      });
      return 0;
    }

    const datum = deserializeDatum(utxo.output.plutusData ?? '');
    if (userPaymentKeyHash == datum.fields[0].bytes) return 0;
    else if (userPaymentKeyHash == datum.fields[1].bytes) return 1;
    else return -1;
  }

  async updateStatusDevice(lockRequestModel: LockRequestModel) {
    if (lockRequestModel.unlocker_addr.trim() == '')
      throw new HttpException(
        'The address wallet of unlocker must be not null',
        HttpStatus.BAD_REQUEST,
      );
    this.wallet = this.getWalletClient(lockRequestModel.unlocker_addr);
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress,
      this.policyId + stringToHex(this.lockName),
    );
    const datum = deserializeDatum(utxo.output.plutusData ?? '');
    let unsignedTx: string;
    // nếu owner kí:
    // + authorize rỗng: chưa ủy quyền cho ai -> truyền authorize rỗng
    // + authorize có giá trị:  -> phải truyền đúng giá trị của authorize hiện tại ->
    // nếu người được ủy quyền kí
    // + truyền đúng authorize

    //if owner
    console.log(`datum: ${JSON.stringify(datum)}`);
    let serializedAddress = '';
    if (datum.fields[1].bytes.length !== 0) {
      serializedAddress = serializeAddressObj(
        pubKeyAddress(datum.fields[1].bytes as string),
        0,
      );
    }
    console.log(`serializedAddress: ${serializedAddress}`);
    if (lockRequestModel.is_unlock) {
      unsignedTx = await this.confirmStatusContract.unLock({
        title: this.lockName,
        authority: serializedAddress,
        isLock: 0,
      });
    } else {
      unsignedTx = await this.confirmStatusContract.lock({
        title: this.lockName,
        authority: serializedAddress,
        isLock: 1,
      });
    }
    return unsignedTx;
  }

  async requestAuthorize(authorizeRequestModel: AuthorizeRequestModel) {
    this.wallet = this.getWalletClient(authorizeRequestModel.authorizer_addr);

    if (authorizeRequestModel.is_remove_authorize) {
      authorizeRequestModel.licensee_addr =
        authorizeRequestModel.authorizer_addr;
    }
    const unsignedTx: string = await this.confirmStatusContract.authorize({
      title: this.lockName,
      authority: authorizeRequestModel.licensee_addr,
      isLock: 1,
    });

    return unsignedTx;
  }

  async submitTransaction(submitModel: SubmitTxModel) {
    this.wallet = this.getWalletClient(submitModel.user_addr);
    const txHash = await this.wallet.submitTx(submitModel.signedTx);
    //console.log('https://preprod.cexplorer.io/tx/' + txHash);
    this.txHashTemp = txHash;

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
      tx_hash: this.txHashTemp,
      tx_ref: 'https://preprod.cexplorer.io/tx/' + txHash,
    };
  }

  async getLockStatus() {
    const utxo = await this.getAddressUTXOAsset(
      this.confirmStatusAddress,
      this.policyId + stringToHex(this.lockName),
    );
    // const utxos = await blockfrostProvider.fetchAddressUTxOs(contractAddr);
    const transactionUtxos = await this.blockFrostAPI.txsUtxos(
      utxo.input.txHash,
    );
    const datum = deserializeDatum(utxo.output.plutusData ?? '');
    console.log(datum);
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

  async authorize(authorizeRequestModel: AuthorizeRequestModel) {
    if (authorizeRequestModel.is_remove_authorize)
      authorizeRequestModel.licensee_addr = '';
    this.wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.OWNER?.split(' ') || [],
      },
    });
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: this.wallet,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: this.lockName,
      authority: authorizeRequestModel.licensee_addr,
      isLock: 1,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    //console.log('https://preprod.cexplorer.io/tx/' + txHash);
    this.txHashTemp = txHash;

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

    return {
      tx_hash: this.txHashTemp,
      tx_ref: 'https://preprod.cexplorer.io/tx/' + txHash,
    };
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
    const forgingScript = ForgeScript.withOneSignature(
      process.env.WALLET_ADDRESS_OWNER ?? '',
    );
    const policyId = resolveScriptHash(forgingScript);
    return policyId + stringToHex(this.lockName);
  }
}
