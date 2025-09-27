import { BlockfrostProvider } from '@meshsdk/core';

export const title = {
  mint: 'contract.status_management.mint',
  spend: 'contract.status_management.spend',
};

export const blockfrostProvider = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY || '',
);
