import { Injectable } from '@nestjs/common';
import { MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';
import { ConfirmStatusContract } from '../contract/scripts';
import TemperatureModel from './models/temperature.model';

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

  async submitTemperature(temperature: TemperatureModel) {
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: this.wallet,
      });
    const unsignedTx: string = await confirmStatusContract.confirm({
      title: 'Temperature',
      value: temperature.heat,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
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
