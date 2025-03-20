import { Injectable } from '@nestjs/common';
import { Data, deserializeDatum, MeshTxBuilder, MeshWallet, UTxO } from '@meshsdk/core';
import { blockfrostProvider } from '../contract/scripts/common';
import { ConfirmStatusContract } from '../contract/scripts';
import { DeviceResultResponseModel, TemperatureRequestModel, TemperatureResponseModel } from './models/temperature.model';
import { Datum } from '../contract/scripts/type';
import SensorDeviceModel from './models/sensor-device.model';
import * as device_data from '../data/device.json'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
@Injectable()
export class AppService {
  private wallet: MeshWallet;
  private txHashTemp: string;
  private API: BlockFrostAPI;


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
    this.API = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? "",
    });
  }

  async updateBaseTemperature(temperature: TemperatureRequestModel) {
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

    var temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.value = temperature.value;
    temperatureResponseModel.time = new Date();
    temperatureResponseModel.tx_ref = 'https://preprod.cexplorer.io/tx/' + txHash
    return temperatureResponseModel;

  }

  async submitTemperature(temperature: TemperatureRequestModel) {
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

    var temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.value = temperature.value;
    temperatureResponseModel.time = new Date();
    temperatureResponseModel.tx_ref = 'https://preprod.cexplorer.io/tx/' + txHash
    return temperatureResponseModel;
  }

  async getAllTemperature(walletAddress: string) {
    if (walletAddress == "") walletAddress = await this.wallet.getChangeAddress();
    var listTemperature: TemperatureResponseModel[] = [];
    const utxos: UTxO[] = await blockfrostProvider.fetchAddressUTxOs(walletAddress);
    for (const utxo of utxos) {
      if (utxo.output.plutusData) {
        const txInfor = await blockfrostProvider.fetchTxInfo(utxo.input.txHash);
        const blockInfo = await blockfrostProvider.fetchBlockInfo(txInfor.block)
        var temperature = new TemperatureResponseModel();
        temperature.value = deserializeDatum(utxo.output.plutusData)?.fields?.[1]?.int ?? -1000;
        temperature.tx_ref = "https://preprod.cexplorer.io/tx/" + utxo.input.txHash;
        temperature.time = new Date(blockInfo.time * 1000);
        if (temperature.value != -1000) listTemperature.push(temperature);
      }
    };
    var allDeviceInfo = await this.getListDeviceInfo();

    var deviceResult = new DeviceResultResponseModel();
    deviceResult.device_info = allDeviceInfo.find(x => x.device_address == walletAddress) ?? null;
    deviceResult.temperatures = listTemperature;
    return deviceResult;
  }

  async getBaseTemperature() {
    //thời gian ghi nhận là thời gian giao dịch được phực hiện hay thời gian gửi về từ thiết bị
    const utxosContract: UTxO[] = await blockfrostProvider.fetchAddressUTxOs("addr_test1wpnkw36hcprr9qglskxx025y2n43lyk5tk9peke6q9057tgu3j9sd");
    const txInfor = await blockfrostProvider.fetchTxInfo(utxosContract[0].input.txHash);
    const blockInfo = await blockfrostProvider.fetchBlockInfo(txInfor.block)
    const temperature = deserializeDatum(utxosContract[0].output.plutusData ?? "")?.fields?.[1]?.int;
    var temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.value = temperature;
    temperatureResponseModel.time = new Date(blockInfo.time * 1000);
    temperatureResponseModel.tx_ref = "https://preprod.cexplorer.io/tx/" + utxosContract[0].input.txHash;
    return temperatureResponseModel;
  }

  async getAllTemperature2() {
    const policyIdAndHexEncoded = "a48dfba612b9f49bded45de5fb348b3c22aa7c65383217d1d9574a5b" + "54656d7065726174757265";
    const transaction = await this.API.assetsTransactions(policyIdAndHexEncoded);
    console.log("transaction:", transaction)
  }

  async getListDeviceInfo(): Promise<SensorDeviceModel[]> {
    // console.log("device_data:", device_data)
    const parsedData: SensorDeviceModel[] = JSON.parse(JSON.stringify(device_data)).devices;
    return parsedData;
  }
}
