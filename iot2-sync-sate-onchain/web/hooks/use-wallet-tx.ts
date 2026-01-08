'use client';

import { useWallet } from '@/components/common/cardano-wallet/use-wallets';
import { useLockerTitle } from '@/hooks/use-locker-title';
import { useLockStatus } from '@/hooks/use-lock-status';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type TxAction = 'init' | 'lock' | 'unlock' | 'authority';

interface UseTxOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function useWalletTx(options: UseTxOptions = {}) {
  const { browserWallet, walletName, address } = useWallet();
  const title = useLockerTitle();
  const { status } = useLockStatus();
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
        const walletAddress = address;

        // Build request body based on action type
        let body: Record<string, any>;
        if (action === 'init') {
          // Init uses title
          body = { walletAddress, title, ...extraParams };
        } else {
          // Lock/Unlock/Authority uses unit and lockerAddress
          if (!status?.assetUnit || !status?.lockerAddress) {
            throw new Error('Locker status not available');
          }
          body = {
            walletAddress,
            unit: status.assetUnit,
            lockerAddress: status.lockerAddress,
            ...extraParams,
          };
        }

        // Build unsigned TX via API
        const response = await fetch(`/api/tx/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to build transaction');
        }

        // Sign with wallet
        toast.info('Please sign the transaction', {
          description: 'Check your wallet for the signing prompt',
        });

        const signedTx = await browserWallet.signTx(data.unsignedTx, true);

        // Submit transaction
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
    [browserWallet, connected, address, title, status, options]
  );

  return {
    executeTx,
    isLoading,
    currentAction,
    connected,
  };
}
