'use client';

import useSWR from 'swr';
import { useWallet } from '@/components/common/cardano-wallet/use-wallets';
import { useLockerTitle } from '@/hooks/use-locker-title';
import type { LockStatus } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLockStatus() {
  const { walletName, address } = useWallet();
  const title = useLockerTitle();
  const connected = walletName !== null;

  const { data, error, isLoading, mutate } = useSWR<LockStatus>(
    address && title ? `/api/status?owner=${address}&title=${encodeURIComponent(title)}` : null,
    fetcher,
    {
      refreshInterval: 15000, // Poll every 15 seconds
      dedupingInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    status: data,
    error,
    isLoading: isLoading || (connected && !address),
    refresh: mutate,
  };
}
