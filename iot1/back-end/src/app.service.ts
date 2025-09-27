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
import { MeshAdapter } from 'contract/scripts/mesh';
import { ConfirmStatusContract } from '../contract/scripts';
import { blockfrostProvider } from '../contract/scripts/common';
import { MemoryCacheService } from './memoryCache.service';
import {
  TemperatureRequestModel,
  TemperatureResponseModel,
} from './models/temperature.model';

@Injectable()
export class AppService extends MeshAdapter {
  private blockFrostAPI: BlockFrostAPI;
  private policyId: string;
  private SENSOR_NAME = process.env.SENSOR_NAME || 'Sensor 1';
  private readonly CACHE_KEY = process.env.APP_CACHE_KEY || 'temperature_cache';
  private readonly ALLOWED_TIME_OFFSET = parseInt(
    process.env.ALLOWED_TIME_OFFSET || '3000',
    10,
  );

  constructor(private readonly memoryCacheService: MemoryCacheService) {
    super({ wallet: undefined });
    this.wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.APP_WALLET?.split(' ') || [],
      },
    });
    this.blockFrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
    const forgingScript = ForgeScript.withOneSignature(
      this.wallet.getChangeAddress(),
    );
    this.policyId = resolveScriptHash(forgingScript);
  }

  async getAllTemperature() {
    const encodedAssetName = this.policyId + stringToHex(this.SENSOR_NAME);
    const transactions =
      await this.blockFrostAPI.assetsTransactions(encodedAssetName);
    const listTemperature: TemperatureResponseModel[] = [];
    for (const tx of transactions) {
      const utxo = await this.blockFrostAPI.txsUtxos(tx.tx_hash);
      const datum_hash = utxo.outputs[0].inline_datum;
      if (datum_hash != null && datum_hash != undefined) {
        const datum_deserialize = deserializeDatum(datum_hash);
        if (
          datum_deserialize &&
          datum_deserialize.fields &&
          datum_deserialize.fields[0].int &&
          datum_deserialize.fields[1].int
        ) {
          const temperature = new TemperatureResponseModel();
          temperature.time = new Date(tx.block_time * 1000);
          temperature.temperature = datum_deserialize.fields[0].int;
          temperature.humidity = datum_deserialize.fields[1].int;
          temperature.tx_ref =
            'https://preprod.cexplorer.io/tx/' + utxo.inputs[0].tx_hash;
          listTemperature.push(temperature);
        }
      }
    }
    return listTemperature;
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
      const cur = temperatureMap.get(t.device_id);
      if (!cur || new Date(t.time).getTime() > new Date(cur.time).getTime()) {
        temperatureMap.set(t.device_id, t);
      }
    }

    const latestList = [...temperatureMap.values()];
    const maxObj = latestList.reduce((max, cur) =>
      new Date(cur.time).getTime() > new Date(max.time).getTime() ? cur : max,
    );

    const maxMs = new Date(maxObj.time).getTime();
    let sumTemperature = 0;
    let sumHumidity = 0;
    let count = 0;
    for (const [, temp] of temperatureMap) {
      const tMs = new Date(temp.time).getTime();
      if (maxMs - tMs <= this.ALLOWED_TIME_OFFSET) {
        sumTemperature += temp.temperature;
        sumHumidity += temp.humidity;
        count++;
      }
    }

    const averageTemperature = count ? sumTemperature / count : null;
    const averageHumidity = count ? sumHumidity / count : null;

    if (averageTemperature === null || averageHumidity === null) return;
    await this.saveTemperature({
      device_id: maxObj.device_id,
      time: maxObj.time,
      temperature: averageTemperature,
      humidity: averageHumidity,
    });
  }

  async saveTemperature(req: TemperatureRequestModel) {
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: this.wallet,
      });
    const unsignedTx: string = await confirmStatusContract.confirm({
      sensor: this.SENSOR_NAME,
      temperator: req.temperature,
      huminity: req.humidity,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });

    const temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.temperature = req.temperature;
    temperatureResponseModel.humidity = req.humidity;
    temperatureResponseModel.time = new Date();
    temperatureResponseModel.tx_ref =
      'https://preprod.cexplorer.io/tx/' + txHash;
    return temperatureResponseModel;
  }

  async widthdrawTemperature(req: TemperatureRequestModel) {
    const confirmStatusContract: ConfirmStatusContract =
      new ConfirmStatusContract({
        wallet: this.wallet,
      });
    const unsignedTx: string = await confirmStatusContract.withdraw({
      title: this.SENSOR_NAME,
      value: req.temperature,
    });

    const signedTx = await this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    console.log('https://preprod.cexplorer.io/tx/' + txHash);
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });

    const temperatureResponseModel = new TemperatureResponseModel();
    temperatureResponseModel.temperature = req.temperature;
    temperatureResponseModel.humidity = req.humidity;
    temperatureResponseModel.time = new Date();
    temperatureResponseModel.tx_ref =
      'https://preprod.cexplorer.io/tx/' + txHash;
    return temperatureResponseModel;
  }
}
