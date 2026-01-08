'use client';

import useSWR from 'swr';
import { useWallet } from '@meshsdk/react';
import { useEffect, useState } from 'react';
import type { TxHistoryResponse } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTxHistory(limit = 10) {
  const { wallet, connected } = useWallet();
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);

  // Get owner address when connected
  useEffect(() => {
    async function getAddress() {
      if (connected && wallet) {
        const address = await wallet.getChangeAddress();
        setOwnerAddress(address);
      } else {
        setOwnerAddress(null);
      }
    }
    getAddress();
  }, [connected, wallet]);

  const { data, error, isLoading, mutate } = useSWR<TxHistoryResponse>(
    ownerAddress ? `/api/history?owner=${ownerAddress}&limit=${limit}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      dedupingInterval: 10000,
    }
  );

  return {
    history: data?.transactions || [],
    error,
    isLoading: isLoading || (connected && !ownerAddress),
    refresh: mutate,
  };
}
