'use client';

import useSWR from 'swr';
import type { TxHistoryResponse } from '@/lib/types';
import { useWallet } from '@/components/common/cardano-wallet/use-wallets';
import { useLockerTitle } from '@/hooks/use-locker-title';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTxHistory(limit = 10) {
  const { browserWallet: wallet, address } = useWallet();
  const title = useLockerTitle();

  const { data, error, isLoading, mutate } = useSWR<TxHistoryResponse>(
    address && title
      ? `/api/history?owner=${address}&title=${encodeURIComponent(title)}&limit=${limit}`
      : null,
    fetcher,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      dedupingInterval: 10000,
    }
  );

  return {
    history: data?.transactions || [],
    error,
    isLoading: isLoading || (wallet && !address),
    refresh: mutate,
  };
}
