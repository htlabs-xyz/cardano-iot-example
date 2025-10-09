import { Network } from '@meshsdk/core';
import { config } from 'dotenv';
config();

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';
const KOIOS_TOKEN = process.env.KOIOS_TOKEN || '';
const NETWORK: Network =
    (process.env.NETWORK?.toLowerCase() as Network) || 'preview';
const NETWORK_ID = NETWORK === 'mainnet' ? 1 : 0;
const MNEMONIC = process.env.MNEMONIC || '';

export { NETWORK, NETWORK_ID, BLOCKFROST_API_KEY, KOIOS_TOKEN, MNEMONIC };
