import { Network } from '@meshsdk/core';
import { config } from 'dotenv';
config();

export const title = {
    mint: 'contract.status_management.mint',
    spend: 'contract.status_management.spend',
};

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';
const KOIOS_TOKEN = process.env.KOIOS_TOKEN || '';
const NETWORK: Network =
    (process.env.NETWORK?.toLowerCase() as Network) || 'preview';
const NETWORK_ID = NETWORK === 'mainnet' ? 1 : 0;
const MNEMONIC = process.env.MNEMONIC || '';
const OWNER = process.env.OWNER || '';
const OWNER_ADDRESS = process.env.OWNER_ADDRESS || '';
const AUTHORIZOR = process.env.AUTHORIZOR || '';

export {
    NETWORK,
    NETWORK_ID,
    BLOCKFROST_API_KEY,
    KOIOS_TOKEN,
    MNEMONIC,
    OWNER,
    AUTHORIZOR,
    OWNER_ADDRESS,
};
