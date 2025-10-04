/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  applyParamsToScript,
  deserializeAddress,
  deserializeDatum,
  MeshWallet,
  resolveScriptHash,
  serializePlutusScript,
  stringToHex,
} from '@meshsdk/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Plutus } from 'contract/scripts/type';
import blueprint from '../contract/plutus.json';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider, title } from '../contract/scripts/common';
import { AppGateway } from './app.gateway';
import LockRequestModel, {
  AccessRole,
  LockInfoRequestModel,
  LockStatusModel,
  LoginRequestModel,
  LoginResponseModel,
  parseLockStatus,
  RegisterNewLockRequestModel,
  SubmitTxModel,
} from './models/lock-request.model';
import { DatumModel } from './models/datum.model';
import AuthorizeRequestModel from './models/authorize-request.model';
@Injectable()
export class AppService {
  private blockFrostAPI: BlockFrostAPI;
  constructor(private readonly appGateway: AppGateway) {
    this.blockFrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
  }

  async login(loginModel: LoginRequestModel) {
    const utxos = await this.getContractUTXO(
      loginModel.owner_addr,
      loginModel.lock_name,
    );
    console.log(utxos);
    if (!utxos || utxos.length === 0) {
      throw new Error('Lock not found, please register the lock first');
    }
    const datum = deserializeDatum<DatumModel>(utxos[0].output.plutusData!);
    console.log('datum:', JSON.stringify(datum));
    if (loginModel.user_addr != loginModel.owner_addr) {
      // User is not the owner, check authority
      const authorityBytes = datum.fields[0].fields[0].bytes;
      const userBytes = deserializeAddress(loginModel.user_addr).pubKeyHash;
      if (authorityBytes !== userBytes) {
        return {
          access_role: AccessRole.UNKNOWN,
        } satisfies LoginResponseModel;
      }
      return {
        access_role: AccessRole.AUTHORITY,
        lock_status: parseLockStatus(datum.fields[1].int),
      } satisfies LoginResponseModel;
    }
    return {
      access_role: AccessRole.OWNER,
      lock_status: parseLockStatus(datum.fields[1].int),
    } satisfies LoginResponseModel;
  }

  async registerNewLock(registerModel: RegisterNewLockRequestModel) {
    const utxos = await this.getContractUTXO(
      registerModel.owner_addr,
      registerModel.lock_name,
    );
    console.log(utxos);
    if (utxos && utxos.length > 0) {
      throw new Error(
        'The lock already exists, please choose another lock name',
      );
    }
    const contractService = new StatusManagement({
      meshWallet: this.getWalletClient(registerModel.owner_addr),
    });

    return await contractService.lock({
      title: registerModel.lock_name,
    });
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
      ownerAddress: lockRequestModel.owner_addr,
    });
    if (lockRequestModel.is_unlock) {
      unsignedTx = await confirmStatusContract.unLock({
        title: lockRequestModel.lock_name,
      });
    } else {
      unsignedTx = await confirmStatusContract.lock({
        title: lockRequestModel.lock_name,
      });
    }
    console.log(unsignedTx);
    return unsignedTx;
  }

  async requestAuthorize(authorizeRequestModel: AuthorizeRequestModel) {
    const confirmStatusContract = new StatusManagement({
      meshWallet: this.getWalletClient(authorizeRequestModel.owner_addr),
      ownerAddress: authorizeRequestModel.owner_addr,
    });
    const unsignedTx: string = await confirmStatusContract.authorize({
      title: authorizeRequestModel.lock_name,
      authority: authorizeRequestModel.licensee_addr,
    });
    return unsignedTx;
  }

  async submitTransaction(submitModel: SubmitTxModel) {
    console.log(
      `Submitting transaction for user: ${JSON.stringify(submitModel)}`,
    );
    const currentUserWallet = this.getWalletClient(submitModel.user_addr);
    const txHash = await currentUserWallet.submitTx(submitModel.signedTx);
    //console.log('https://preprod.cexplorer.io/tx/' + txHash);
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

  async getLockStatus(lockInfoModel: LockInfoRequestModel) {
    const utxos = await this.getContractUTXO(
      lockInfoModel.owner_addr,
      lockInfoModel.lock_name,
    );
    if (!utxos || utxos.length === 0) {
      throw new Error('Lock not found, please register the lock first');
    }
    const datum = deserializeDatum<DatumModel>(utxos[0].output.plutusData!);
    const lockStatus: LockStatusModel = {
      lock_status: parseLockStatus(datum.fields[1].int),
      time: new Date(),
      tx_ref: 'https://preprod.cexplorer.io/tx/' + utxos[0].input.txHash,
    };
    return lockStatus;
  }

  async getAllLockHistory(lockInfoModel: LockInfoRequestModel) {
    const encodedAssetName = this.getAssetName(
      lockInfoModel.owner_addr,
      lockInfoModel.lock_name,
    );

    const transactions =
      await this.blockFrostAPI.assetsTransactions(encodedAssetName);

    const results = await Promise.allSettled(
      transactions.map(async (tx) => {
        const utxo = await this.blockFrostAPI.txsUtxos(tx.tx_hash);

        const outWithDatum = utxo.outputs.find((o) => o.inline_datum != null);
        if (!outWithDatum) return null;

        const datum = deserializeDatum<DatumModel>(outWithDatum.inline_datum!);
        const isValid = datum?.fields && datum.fields[1]?.int !== undefined;
        if (!isValid) return null;

        const model = new LockStatusModel();
        model.time = new Date(tx.block_time * 1000);
        model.lock_status = parseLockStatus(datum.fields[1].int);
        model.user_addr =
          utxo.outputs[1]?.address ?? utxo.outputs[0]?.address ?? '';
        model.tx_ref =
          'https://preprod.cexplorer.io/tx/' +
          (utxo.inputs[0]?.tx_hash ?? tx.tx_hash);
        return model;
      }),
    );

    const listLockStatus = results
      .filter(
        (r): r is PromiseFulfilledResult<LockStatusModel | null> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value)
      .filter((x): x is LockStatusModel => x != null);

    listLockStatus.sort((a, b) => b.time.getTime() - a.time.getTime());
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

  getAssetName(ownerAddress: string, lockName: string): string {
    const pubKeyOwner = deserializeAddress(ownerAddress).pubKeyHash;
    const mintCbor = applyParamsToScript(this.getCode(title.mint), [
      pubKeyOwner,
    ]);
    return resolveScriptHash(mintCbor, 'V3') + stringToHex(lockName);
  }

  async getContractUTXO(ownerAddress: string, lockName: string) {
    const pubKeyOwner = deserializeAddress(ownerAddress).pubKeyHash;

    const spendCbor = applyParamsToScript(this.getCode(title.spend), [
      pubKeyOwner,
    ]);
    const confirmStatusAddress = serializePlutusScript(
      { code: spendCbor, version: 'V3' },
      undefined,
      0,
      false,
    ).address;

    return blockfrostProvider.fetchAddressUTxOs(
      confirmStatusAddress,
      this.getAssetName(ownerAddress, lockName),
    );
  }

  getCode = (t: string) => {
    const v = (blueprint as Plutus).validators.find((v) => v.title === t);
    if (!v) throw new Error(`${t} validator not found.`);
    return v.compiledCode;
  };
}
