import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { deserializeAddress, deserializeDatum } from '@meshsdk/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StatusManagement } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
import { AppGateway } from './app.gateway';
import { ContractHelper } from './common/contract-helper';
import {
  AccessRole,
  LoginRequestModel,
  LoginResponseModel,
  RegisterNewLockRequestModel,
} from './models/auth.model';
import { DatumModel } from './models/datum.model';
import {
  AuthorizeRequestModel,
  LockInfoRequestModel,
  LockRequestModel,
  LockStatus,
  LockStatusResponseModel,
  parseLockStatus,
  SubmitTxModel,
} from './models/lock.model';
@Injectable()
export class AppService {
  private blockFrostAPI: BlockFrostAPI;
  constructor(private readonly appGateway: AppGateway) {
    this.blockFrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
  }

  async login(loginModel: LoginRequestModel) {
    const utxos = await ContractHelper.GetContractUTXO(
      loginModel.owner_addr,
      loginModel.lock_name,
    );
    if (!utxos || utxos.length === 0) {
      throw new Error('Lock not found, please register the lock first');
    }
    const datum = deserializeDatum<DatumModel>(
      utxos[utxos.length - 1].output.plutusData!,
    );
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
    const utxos = await ContractHelper.GetContractUTXO(
      registerModel.owner_addr,
      registerModel.lock_name,
    );
    if (utxos && utxos.length > 0) {
      throw new Error(
        'The lock already exists, please choose another lock name',
      );
    }
    const contractService = new StatusManagement({
      meshWallet: ContractHelper.GetWalletClient(registerModel.owner_addr),
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
    let unsignedTx: string = '';

    const currentUserWallet = ContractHelper.GetWalletClient(
      lockRequestModel.unlocker_addr,
    );
    const confirmStatusContract = new StatusManagement({
      meshWallet: currentUserWallet,
      ownerAddress: lockRequestModel.owner_addr,
    });
    if (lockRequestModel.lock_status == LockStatus.OPEN) {
      unsignedTx = await confirmStatusContract.unLock({
        title: lockRequestModel.lock_name,
      });
    } else if (lockRequestModel.lock_status == LockStatus.CLOSE) {
      unsignedTx = await confirmStatusContract.lock({
        title: lockRequestModel.lock_name,
      });
    }
    return unsignedTx;
  }

  async requestAuthorize(authorizeRequestModel: AuthorizeRequestModel) {
    const confirmStatusContract = new StatusManagement({
      meshWallet: ContractHelper.GetWalletClient(
        authorizeRequestModel.owner_addr,
      ),
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
    const currentUserWallet = ContractHelper.GetWalletClient(
      submitModel.user_addr,
    );
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
    const utxos = await ContractHelper.GetContractUTXO(
      lockInfoModel.owner_addr,
      lockInfoModel.lock_name,
    );
    if (!utxos || utxos.length === 0) {
      throw new Error('Lock not found, please register the lock first');
    }
    const datum = deserializeDatum<DatumModel>(
      utxos[utxos.length - 1].output.plutusData!,
    );
    const lockStatus: LockStatusResponseModel = {
      lock_status: parseLockStatus(datum.fields[1].int),
      time: new Date(),
      tx_ref:
        'https://preprod.cexplorer.io/tx/' +
        utxos[utxos.length - 1].input.txHash,
    };
    return lockStatus;
  }

  async getAllLockHistory(lockInfoModel: LockInfoRequestModel) {
    const encodedAssetName = ContractHelper.GetAssetName(
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

        const model = new LockStatusResponseModel();
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
        (r): r is PromiseFulfilledResult<LockStatusResponseModel | null> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value)
      .filter((x): x is LockStatusResponseModel => x != null);

    listLockStatus.sort((a, b) => b.time.getTime() - a.time.getTime());
    return listLockStatus;
  }
}
