import { BlockfrostProvider } from '@meshsdk/core';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY;

if (!BLOCKFROST_API_KEY) {
  console.warn('BLOCKFROST_API_KEY not set - API routes will fail');
}

// MeshSDK provider (for TX building and UTxO fetching)
export const meshProvider = new BlockfrostProvider(BLOCKFROST_API_KEY || '');

// Blockfrost-js API (for asset queries)
export const blockfrostApi = new BlockFrostAPI({
  projectId: BLOCKFROST_API_KEY || '',
});
