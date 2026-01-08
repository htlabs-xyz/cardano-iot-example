import type { UTxO } from '@meshsdk/core';

// Init uses title (creates new locker)
export interface InitRequest {
  walletAddress: string;
  title: string;
}

// Lock/Unlock uses unit (operates on existing locker)
export interface UnitTxRequest {
  walletAddress: string;
  unit: string;
}

export interface AuthorityRequest extends UnitTxRequest {
  newAuthority: string;
}

// Legacy - for backward compatibility
export interface TxBuildRequest {
  walletAddress: string;
  title: string;
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
