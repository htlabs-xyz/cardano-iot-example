import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';
import LockRequestModel from './models/lock-request.model';
import { StatusManagement } from '../contract/scripts';
import AuthorizeRequestModel from './models/authorize-request.model';

@Injectable()
export class AppService {
  private wallet: MeshWallet;
  private txHashTemp: string;
  constructor() {
    this.wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.SELLER?.split(' ') || [],
      },
    });
    console.log("addr: ", this.wallet.getChangeAddress())
  }

  async updateStatusDevice(lockRequestModel: LockRequestModel) {
    const confirmStatusContract: StatusManagement = new StatusManagement({
      wallet: this.wallet,
    });

    var unsignedTx: string;
    if (lockRequestModel.is_unlock) {
      if (lockRequestModel.unlocker_addr.trim() == "") throw new HttpException("The address wallet of unlocker must be not null", HttpStatus.BAD_REQUEST)
      unsignedTx = await confirmStatusContract.unLock({
        title: 'The Safe',
        authority: lockRequestModel.unlocker_addr,
        isLock: 0,
      });

    }
    else {
      unsignedTx = await confirmStatusContract.lock({
        title: 'The Safe',
        authority: '',
        isLock: 1,
      });
    }

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

  async authorize(authorizeRequestModel: AuthorizeRequestModel) {
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


}
