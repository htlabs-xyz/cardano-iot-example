'use client';

import { useWallet } from '@/components/common/cardano-wallet/use-wallets';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type TxAction = 'init' | 'lock' | 'unlock' | 'authority';

interface UseTxOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function useWalletTx(options: UseTxOptions = {}) {
  const { browserWallet, walletName, address } = useWallet();
  const connected = walletName !== null;
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<TxAction | null>(null);

  const executeTx = useCallback(
    async (action: TxAction, extraParams?: Record<string, any>) => {
      if (!browserWallet || !connected || !address) {
        toast.error('Wallet not connected', {
          description: 'Please connect your wallet first',
        });
        return null;
      }

      setIsLoading(true);
      setCurrentAction(action);

      try {
        // 1. Get wallet address (already stored in Zustand)
        const walletAddress = address;

        // 2. Build unsigned TX via API (server fetches UTXOs)
        const response = await fetch(`/api/tx/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            ...extraParams,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to build transaction');
        }

        // 3. Sign with wallet
        toast.info('Please sign the transaction', {
          description: 'Check your wallet for the signing prompt',
        });

        const signedTx = await browserWallet.signTx(data.unsignedTx, true);

        // 4. Submit transaction
        const txHash = await browserWallet.submitTx(signedTx);

        toast.success('Transaction submitted!', {
          description: `TX: ${txHash.slice(0, 16)}...`,
        });

        options.onSuccess?.(txHash);
        return txHash;
      } catch (error: any) {
        const message = error?.message || 'Transaction failed';

        // Handle user rejection
        if (message.includes('User') || message.includes('reject') || message.includes('cancel')) {
          toast.warning('Transaction cancelled', {
            description: 'You cancelled the transaction',
          });
        } else {
          toast.error('Transaction failed', {
            description: message,
          });
        }

        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
        setCurrentAction(null);
      }
    },
    [browserWallet, connected, address, options]
  );

  return {
    executeTx,
    isLoading,
    currentAction,
    connected,
  };
}
