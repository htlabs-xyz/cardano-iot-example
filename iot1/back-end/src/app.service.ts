/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable  @typescript-eslint/await-thenable */
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { deserializeDatum, MeshWallet, UTxO } from '@meshsdk/core';
import { Injectable } from '@nestjs/common';
import { ConfirmStatusContract } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
import * as device_data from '../data/device.json';
import { AppGateway } from './app.gateway';
import SensorDeviceModel from './models/sensor-device.model';
import {
  DeviceResultResponseModel,
  TemperatureRequestModel,
  TemperatureResponseModel,
} from './models/temperature.model';
@Injectable()
export class AppService {
  private wallet: MeshWallet;
  private txHashTemp: string;
  private API: BlockFrostAPI;

  constructor(private readonly appGateway: AppGateway) {
    this.wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.APP_WALLET?.split(' ') || [],
      },
    });
    this.API = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
  }

  async submitTemperature(temperature: TemperatureRequestModel) {
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: this.wallet,
      });
    const unsignedTx: string = await confirmStatusContract.confirm({
      title: 'Temperature',
      value: temperature.value,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    this.txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });

    const temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.value = temperature.value;
    temperatureResponseModel.time = new Date();
    temperatureResponseModel.tx_ref =
      'https://preprod.cexplorer.io/tx/' + txHash;
    this.appGateway.server.emit(
      'onUpdatedTemperature',
      temperatureResponseModel,
    );
    return temperatureResponseModel;
  }

  async getAllTemperature(walletAddress: string) {
    const encodedAssetName = `${process.env.NFT_POLICY_ID}${process.env.NFT_NAME_ENCODED}`;
    const transactions = await this.API.assetsTransactions(
      encodedAssetName,
    );
    //console.log("transaction:", transaction)
    const listTemperature: TemperatureResponseModel[] = [];
    for (const tx of transactions) {
      const utxo = await this.API.txsUtxos(tx.tx_hash);
      const datum_hash = utxo.outputs[0].inline_datum;
      if (datum_hash != null && datum_hash != undefined) {
        const datum_deserialize = deserializeDatum(datum_hash);
        if (
          datum_deserialize &&
          datum_deserialize.fields &&
          datum_deserialize.fields[1].int
        ) {
          const temperature = new TemperatureResponseModel();
          temperature.time = new Date(tx.block_time * 1000);
          temperature.value = datum_deserialize.fields[1].int;
          temperature.tx_ref =
            'https://preprod.cexplorer.io/tx/' + utxo.inputs[0].tx_hash;
          listTemperature.push(temperature);
        }
      }
    }
    const allDeviceInfo = await this.getListDeviceInfo();
    const deviceResult = new DeviceResultResponseModel();
    deviceResult.device_info =
      allDeviceInfo.find((x) => x.device_address == walletAddress) ?? null;
    deviceResult.temperatures = listTemperature;
    return deviceResult;
  }

  async getListDeviceInfo(): Promise<SensorDeviceModel[]> {
    // console.log("device_data:", device_data)
    const parsedData: SensorDeviceModel[] = JSON.parse(
      JSON.stringify(device_data),
    ).devices;
    return parsedData;
  }

  async widthdrawTemperature(temperature: TemperatureRequestModel) {
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: this.wallet,
      });
    const unsignedTx: string = await confirmStatusContract.withdraw({
      title: 'Temperature',
      value: temperature.value,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    this.txHashTemp = txHash;
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });

    const temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.value = temperature.value;
    temperatureResponseModel.time = new Date();
    temperatureResponseModel.tx_ref =
      'https://preprod.cexplorer.io/tx/' + txHash;
    return temperatureResponseModel;
  }

  async testSubmitTemperatureSocket() {
    const temperatureResponseModel = {
      value: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
      time: new Date(),
      tx_ref: 'https://preprod.cexplorer.io/tx/' + 'thisisatestnhe',
    };
    this.appGateway.server.emit(
      'onUpdatedTemperature',
      temperatureResponseModel,
    );
    return temperatureResponseModel;
  }

  async getAllTemperatureOLD(walletAddress: string) {
    if (walletAddress == '')
      walletAddress = await this.wallet.getChangeAddress();
    const listTemperature: TemperatureResponseModel[] = [];
    const utxos: UTxO[] =
      await blockfrostProvider.fetchAddressUTxOs(walletAddress);
    for (const utxo of utxos) {
      if (utxo.output.plutusData) {
        const txInfor = await blockfrostProvider.fetchTxInfo(utxo.input.txHash);
        const blockInfo = await blockfrostProvider.fetchBlockInfo(
          txInfor.block,
        );
        const temperature = new TemperatureResponseModel();
        temperature.value =
          deserializeDatum(utxo.output.plutusData)?.fields?.[1]?.int ?? -1000;
        temperature.tx_ref =
          'https://preprod.cexplorer.io/tx/' + utxo.input.txHash;
        temperature.time = new Date(blockInfo.time * 1000);
        if (temperature.value != -1000) listTemperature.push(temperature);
      }
    }
    const allDeviceInfo = await this.getListDeviceInfo();

    const deviceResult = new DeviceResultResponseModel();
    deviceResult.device_info =
      allDeviceInfo.find((x) => x.device_address == walletAddress) ?? null;
    deviceResult.temperatures = listTemperature;
    return deviceResult;
  }
}
