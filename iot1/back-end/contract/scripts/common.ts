import { Network } from '@meshsdk/core';
import { config } from 'dotenv';
config();

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';
const KOIOS_TOKEN = process.env.KOIOS_TOKEN || '';
const NETWORK: Network =
    (process.env.NETWORK?.toLowerCase() as Network) || 'preview';
const NETWORK_ID = NETWORK === 'mainnet' ? 1 : 0;
const MNEMONIC = process.env.MNEMONIC || '';
const APP_CACHE_KEY = process.env.APP_CACHE_KEY || 'temperature_cache';
const ALLOWED_TIME_OFFSET = parseInt(
    process.env.ALLOWED_TIME_OFFSET || '3000',
    10,
);
const SENSOR_NAME = process.env.SENSOR_NAME || 'Sensor 1';

export {
    NETWORK,
    NETWORK_ID,
    BLOCKFROST_API_KEY,
    KOIOS_TOKEN,
    MNEMONIC,
    APP_CACHE_KEY,
    ALLOWED_TIME_OFFSET,
    SENSOR_NAME,
};
