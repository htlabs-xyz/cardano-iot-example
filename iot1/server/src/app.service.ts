/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable  @typescript-eslint/await-thenable */
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
    BlockfrostProvider,
    deserializeDatum,
    ForgeScript,
    MeshWallet,
    resolveScriptHash,
    stringToHex,
} from '@meshsdk/core';
import { Injectable } from '@nestjs/common';
import { MeshAdapter } from '../contract/scripts/mesh';
import { ConfirmStatusContract } from '../contract/scripts';
import {
    ALLOWED_TIME_OFFSET,
    APP_CACHE_KEY,
    BLOCKFROST_API_KEY,
    MNEMONIC,
    SENSOR_NAME,
} from '../contract/scripts/common';
import { MemoryCacheService } from './memoryCache.service';
import {
    TemperatureRequestModel,
    TemperatureResponseModel,
} from './models/temperature.model';

/**
 * @description AppService — orchestrates IoT temperature data lifecycle on Cardano blockchain.
 *
 * Responsibilities:
 * - Store and retrieve temperature readings from IoT devices
 * - Aggregate and process temperature data using in-memory cache
 * - Interact with Cardano smart contracts for data persistence and asset minting
 * - Manage blockchain transactions and asset policies
 *
 * Notes:
 * - Depends on MeshWallet, BlockFrostAPI, and MemoryCacheService
 */
@Injectable()
export class AppService extends MeshAdapter {
    private blockFrostAPI: BlockFrostAPI;
    private blockfrostProvider: BlockfrostProvider;
    private policyId: string;

    /**
     * @constructor
     * @description Initializes a new instance of AppService.
     *
     * @param {MemoryCacheService} memoryCacheService - Provides in-memory caching for temperature data aggregation and batching.
     *
     * @example
     * const service = new AppService(memoryCacheService);
     */
    constructor(private readonly memoryCacheService: MemoryCacheService) {
        super({ wallet: undefined });
        this.blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
        this.wallet = new MeshWallet({
            networkId: 0,
            fetcher: this.blockfrostProvider,
            submitter: this.blockfrostProvider,
            key: {
                type: 'mnemonic',
                words: MNEMONIC?.split(' ') || [],
            },
        });
        this.blockFrostAPI = new BlockFrostAPI({
            projectId: BLOCKFROST_API_KEY ?? '',
        });
        const forgingScript = ForgeScript.withOneSignature(
            this.wallet.getChangeAddress(),
        );
        this.policyId = resolveScriptHash(forgingScript);
    }

    /**
     * @description Fetches all historical temperature readings from Cardano blockchain for the configured sensor.
     *
     * Details:
     * 1. Queries asset transactions using the sensor's policy ID
     * 2. Deserializes datum to extract temperature and humidity values
     * 3. Returns readings with timestamps and transaction references
     *
     * @returns {Promise<TemperatureResponseModel[]>} Array of temperature readings with blockchain transaction references
     */
    async getAll() {
        const encodedAssetName = this.policyId + stringToHex(SENSOR_NAME);
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
                        'https://preprod.cexplorer.io/tx/' +
                        utxo.inputs[0].tx_hash;
                    listTemperature.push(temperature);
                }
            }
        }
        return listTemperature;
    }

    /**
     * @description Stores a new temperature reading in the in-memory cache for later batch processing.
     *
     * @param {TemperatureRequestModel} temperature - Contains device ID, timestamp, temperature, and humidity values.
     * @returns {Promise<string>} Confirmation message on successful cache storage.
     */
    async submit(temperature: TemperatureRequestModel) {
        const existingTemperatures =
            (await this.memoryCacheService.get<TemperatureRequestModel[]>(
                APP_CACHE_KEY,
            )) || [];
        const updateTemperatures = [...existingTemperatures, temperature];
        await this.memoryCacheService.set(APP_CACHE_KEY, updateTemperatures);
        return 'Ok';
    }

    /**
     * @description Aggregates cached temperature readings and persists summary data to the blockchain.
     *
     * Details:
     * 1. Retrieves cached readings
     * 2. Groups by device and selects latest per device
     * 3. Calculates averages within allowed time offset
     * 4. Saves aggregated data via smart contract
     *
     * @returns {Promise<void>} Resolves when aggregation and persistence are complete, or if no data exists.
     */
    async update() {
        const existingTemperatures =
            (await this.memoryCacheService.get<TemperatureRequestModel[]>(
                APP_CACHE_KEY,
            )) || [];
        if (existingTemperatures.length == 0) {
            return;
        }
        await this.memoryCacheService.clear();
        const temperatureMap = new Map<string, TemperatureRequestModel>();
        for (const t of existingTemperatures) {
            const cur = temperatureMap.get(t.device_id);
            if (
                !cur ||
                new Date(t.time).getTime() > new Date(cur.time).getTime()
            ) {
                temperatureMap.set(t.device_id, t);
            }
        }

        const latestList = [...temperatureMap.values()];
        const maxObj = latestList.reduce((max, cur) =>
            new Date(cur.time).getTime() > new Date(max.time).getTime()
                ? cur
                : max,
        );

        const maxMs = new Date(maxObj.time).getTime();
        let sumTemperature = 0;
        let sumHumidity = 0;
        let count = 0;
        for (const [, temp] of temperatureMap) {
            const tMs = new Date(temp.time).getTime();
            if (maxMs - tMs <= ALLOWED_TIME_OFFSET) {
                sumTemperature += temp.temperature;
                sumHumidity += temp.humidity;
                count++;
            }
        }

        const averageTemperature = count ? sumTemperature / count : null;
        const averageHumidity = count ? sumHumidity / count : null;

        if (averageTemperature === null || averageHumidity === null) return;
        await this.confirm({
            device_id: maxObj.device_id,
            time: maxObj.time,
            temperature: averageTemperature,
            humidity: averageHumidity,
        });
    }

    /**
     * @description Persists temperature and humidity data to Cardano blockchain using a smart contract.
     *
     * Details:
     * 1. Creates and submits a transaction with temperature and humidity values
     * 2. Waits for transaction confirmation
     * 3. Returns response with saved data and transaction reference
     *
     * @param {TemperatureRequestModel} req - Contains device ID, timestamp, temperature, and humidity.
     * @returns {Promise<TemperatureResponseModel>} Response with saved data and blockchain transaction reference.
     *
     * @throws {Error} If transaction signing or submission fails.
     */
    async confirm(req: TemperatureRequestModel) {
        const confirmStatusContract: ConfirmStatusContract =
            new ConfirmStatusContract({
                wallet: this.wallet,
            });
        const unsignedTx: string = await confirmStatusContract.confirm({
            sensor: SENSOR_NAME,
            temperator: req.temperature,
            huminity: req.humidity,
        });

        const signedTx = await this.wallet.signTx(unsignedTx, true);
        const txHash = await this.wallet.submitTx(signedTx);
        await new Promise<void>((resolve) => {
            this.blockfrostProvider.onTxConfirmed(txHash, () => {
                resolve();
            });
        });

        const temperatureResponseModel = new TemperatureResponseModel();
        temperatureResponseModel.temperature = req.temperature;
        temperatureResponseModel.humidity = req.humidity;
        temperatureResponseModel.time = new Date();
        temperatureResponseModel.tx_ref =
            'https://preprod.cexplorer.io/tx/' + txHash;
        return temperatureResponseModel;
    }

    /**
     * @description Withdraws temperature data from Cardano blockchain using a smart contract transaction.
     *
     * Details:
     * 1. Creates and submits a withdrawal transaction referencing stored temperature data
     * 2. Waits for transaction confirmation
     * 3. Returns response with withdrawal confirmation and transaction reference
     *
     * @param {TemperatureRequestModel} req - Contains device ID, timestamp, temperature, and humidity to withdraw.
     * @returns {Promise<TemperatureResponseModel>} Response with withdrawal confirmation and transaction reference.
     *
     * @throws {Error} If transaction signing or submission fails.
     */
    async widthdraw(req: TemperatureRequestModel) {
        const confirmStatusContract: ConfirmStatusContract =
            new ConfirmStatusContract({
                wallet: this.wallet,
            });
        const unsignedTx: string = await confirmStatusContract.withdraw({
            title: SENSOR_NAME,
            value: req.temperature,
        });

        const signedTx = await this.wallet.signTx(unsignedTx, true);
        const txHash = await this.wallet.submitTx(signedTx);
        await new Promise<void>((resolve) => {
            this.blockfrostProvider.onTxConfirmed(txHash, () => {
                resolve();
            });
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
