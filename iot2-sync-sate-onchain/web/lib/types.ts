import type { UTxO } from '@meshsdk/core';

export interface TxBuildRequest {
  walletAddress: string;
}

export interface AuthorityRequest extends TxBuildRequest {
  newAuthority: string;
}

export interface TxBuildResponse {
  success: boolean;
  unsignedTx: string;
  policyId: string;
  lockerAddress: string;
}

export interface LockStatus {
  exists: boolean;
  isLocked: boolean;
  authority: string;
  policyId: string;
  assetUnit: string;
  lockerAddress: string;
  lockTitle: string;
}

export interface TxHistoryItem {
  txHash: string;
  blockHeight: number;
  blockTime: number;
  explorerUrl: string;
}

export interface TxHistoryResponse {
  transactions: TxHistoryItem[];
  policyId: string;
  assetUnit: string;
  count: number;
}
