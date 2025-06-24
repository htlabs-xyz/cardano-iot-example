import { MeshWallet } from '@meshsdk/core';
import { Injectable } from '@nestjs/common';
import { SupplyChainManagementContract } from 'contract/scripts';
import { blockfrostProvider } from 'contract/scripts/common';
import {
  UserInfoRequestModel,
  UserVerifyRequestModel,
} from './models/userinfo.model';

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
        words: process.env.APP_WALLET?.split(' ') || [],
      },
    });
  }

  async writeUserIdentityData(user: UserInfoRequestModel) {
    const confirmStatusContract: SupplyChainManagementContract =
      new SupplyChainManagementContract({
        wallet: this.wallet,
      });
    const unsignedTx: string = await confirmStatusContract.write({
      assetName: user.user_fullname,
      metadata: {
        name: user.user_fullname,
      },
    });

    const signedTx = this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    this.txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });

    return 'https://preprod.cexplorer.io/tx/' + txHash;
  }

  async verifyUserIdentity(userVerifyModel: UserVerifyRequestModel) {
    const confirmStatusContract: SupplyChainManagementContract =
      new SupplyChainManagementContract({
        wallet: this.wallet,
      });
    const metadata = await confirmStatusContract.read({
      assetName: userVerifyModel.user_fullname,
    });
    if (!metadata) {
      throw new Error('User not found');
    }
    return metadata;
  }
}
