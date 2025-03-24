import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  deserializeAddress,
  deserializeDatum,
  ForgeScript,
  MeshWallet,
  resolveScriptHash,
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

const CONTRACT_ADDRESS =
  'addr_test1wp62wqa9kg3v23ulndcl7940d8lgq2k3qc9gpj9f77mzz4qgj350f';
const WALLET_ADDRESS =
  'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh';
@Injectable()
export class AppService {
  private wallet: MeshWallet;
  private txHashTemp: string;
  private blockFrostAPI: BlockFrostAPI;
  constructor(private readonly appGateway: AppGateway) {
    this.blockFrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
  }

  async getAccessLock(walletAddress: string) {
    const userPaymentKeyHash = deserializeAddress(walletAddress).pubKeyHash;
    const contractAddr = CONTRACT_ADDRESS;
    const utxos = await blockfrostProvider.fetchAddressUTxOs(contractAddr);
    const datum = deserializeDatum(utxos[0].output.plutusData ?? '');
    if (userPaymentKeyHash == datum.fields[0].bytes) return 0;
    else if (userPaymentKeyHash == datum.fields[1].bytes) return 1;
    else return -1;
  }

  async updateStatusDevice(lockRequestModel: LockRequestModel) {
    this.wallet = this.getWalletClient(lockRequestModel.unlocker_addr);

    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: this.wallet,
    });

    let unsignedTx: string;
    if (lockRequestModel.is_unlock) {
      if (lockRequestModel.unlocker_addr.trim() == '')
        throw new HttpException(
          'The address wallet of unlocker must be not null',
          HttpStatus.BAD_REQUEST,
        );
      unsignedTx = await confirmStatusContract.unLock({
        title: 'The Safe',
        authority: lockRequestModel.unlocker_addr,
        isLock: 0,
      });
    } else {
      unsignedTx = await confirmStatusContract.lock({
        title: 'The Safe',
        authority: '',
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
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: this.wallet,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: 'The Safe',
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
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
    this.appGateway.server.emit('onUpdatedLockStatus', submitModel.data);
    return {
      tx_hash: this.txHashTemp,
      tx_ref: 'https://preprod.cexplorer.io/tx/' + txHash,
    };
  }

  async getLockStatus() {
    const contractAddr = CONTRACT_ADDRESS;
    const utxos = await blockfrostProvider.fetchAddressUTxOs(contractAddr);
    const transactionUtxos = await this.blockFrostAPI.txsUtxos(
      utxos[0].input.txHash,
    );
    const datum = deserializeDatum(utxos[0].output.plutusData ?? '');
    const lockStatus: LockStatusModel = {
      lock_status: datum.fields[2].int == 1,
      user_addr: transactionUtxos.outputs[1].address,
      time: new Date(),
      tx_ref: 'https://preprod.cexplorer.io/tx/' + utxos[0].input.txHash,
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
        words: process.env.SELLER?.split(' ') || [],
      },
    });
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: this.wallet,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: 'The Safe',
      authority: authorizeRequestModel.licensee_addr,
      isLock: 1,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    //console.log('https://preprod.cexplorer.io/tx/' + txHash);
    this.txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
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
    const forgingScript = ForgeScript.withOneSignature(WALLET_ADDRESS);
    const policyId = resolveScriptHash(forgingScript);
    return policyId + stringToHex('The Safe');
  }
}
