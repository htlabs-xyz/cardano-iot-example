/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable  @typescript-eslint/await-thenable */
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  deserializeDatum,
  ForgeScript,
  MeshWallet,
  resolveScriptHash,
  stringToHex,
} from '@meshsdk/core';
import { Injectable } from '@nestjs/common';
import { ConfirmStatusContract } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
import * as device_data from '../data/device.json';
import { AppGateway } from './app.gateway';
import { MemoryCacheService } from './memoryCache.service';
import SensorDeviceModel from './models/sensor-device.model';
import {
  DeviceResultResponseModel,
  TemperatureRequestModel,
  TemperatureResponseModel,
  TemperatureUnit,
} from './models/temperature.model';

@Injectable()
export class AppService {
  private wallet: MeshWallet;
  private API: BlockFrostAPI;
  private readonly CACHE_KEY = process.env.APP_CACHE_KEY || 'temperature_cache';
  private readonly ALLOWED_TIME_OFFSET = parseInt(
    process.env.ALLOWED_TIME_OFFSET || '3000',
    10,
  );

  constructor(
    private readonly appGateway: AppGateway,
    private readonly memoryCacheService: MemoryCacheService,
  ) {
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

  async updateTemperature() {
    const existingTemperatures =
      (await this.memoryCacheService.get<TemperatureRequestModel[]>(
        this.CACHE_KEY,
      )) || [];
    if (existingTemperatures.length == 0) {
      return;
    }
    await this.memoryCacheService.clear();
    const temperatureMap = new Map<string, TemperatureRequestModel>();
    for (const t of existingTemperatures) {
      const cur = temperatureMap.get(t.device_address);
      if (!cur || new Date(t.time).getTime() > new Date(cur.time).getTime()) {
        temperatureMap.set(t.device_address, t);
      }
    }

    const latestList = [...temperatureMap.values()];
    const maxObj = latestList.reduce((max, cur) =>
      new Date(cur.time).getTime() > new Date(max.time).getTime() ? cur : max,
    );

    const maxMs = new Date(maxObj.time).getTime();
    let sum = 0;
    let count = 0;
    for (const [, temp] of temperatureMap) {
      const tMs = new Date(temp.time).getTime();
      if (maxMs - tMs <= this.ALLOWED_TIME_OFFSET) {
        sum += temp.value;
        count++;
      }
    }

    const average = count ? sum / count : null;

    if (average === null) return;
    await this.submitTemperature({
      device_address: maxObj.device_address,
      time: maxObj.time,
      value: average,
      unit: TemperatureUnit.CELSIUS,
    });
  }

  async submitTemperature(temperature: TemperatureRequestModel) {
    const existingTemperatures =
      (await this.memoryCacheService.get<TemperatureRequestModel[]>(
        this.CACHE_KEY,
      )) || [];
    const updateTemperatures = [...existingTemperatures, temperature];
    await this.memoryCacheService.set(this.CACHE_KEY, updateTemperatures);
    return 'Ok';
  }

  async saveTemperature(temperature: TemperatureRequestModel) {
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
    const encodedAssetName = this.getAssetEncoded(walletAddress);
    const transactions = await this.API.assetsTransactions(encodedAssetName);
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
    deviceResult.temperatures = listTemperature.reverse();
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

  getAssetEncoded(walletAddress: string) {
    const forgingScript = ForgeScript.withOneSignature(walletAddress);
    const policyId = resolveScriptHash(forgingScript);
    return policyId + stringToHex('Temperature');
  }
}
