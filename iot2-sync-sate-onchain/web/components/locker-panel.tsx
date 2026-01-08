'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/components/common/cardano-wallet/use-wallets';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Loader2, Lock, Unlock, UserCog, AlertCircle } from 'lucide-react';
import { AuthorityModal } from './authority-modal';

interface LockerPanelProps {
  unit: string;
}

interface LockerStatus {
  exists: boolean;
  isLocked: boolean;
  authority: string;
  lockerAddress: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function truncateAddress(address: string, chars = 8) {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function LockerPanel({ unit }: LockerPanelProps) {
  const { browserWallet, walletName, address } = useWallet();
  const connected = walletName !== null;
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);

  // Fetch status by unit
  const { data: status, error, isLoading: statusLoading, mutate } = useSWR<LockerStatus>(
    unit ? `/api/status/unit?unit=${unit}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  const executeTx = async (action: 'lock' | 'unlock' | 'authority', extraParams?: Record<string, any>) => {
    console.log(!browserWallet || !address)
    if (!browserWallet || !address) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setCurrentAction(action);

    try {
      const response = await fetch(`/api/tx/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          unit,
          ...extraParams,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to build transaction');
      }

      toast.info('Please sign the transaction');
      const signedTx = await browserWallet.signTx(data.unsignedTx, true);
      const txHash = await browserWallet.submitTx(signedTx);

      toast.success('Transaction submitted!', { description: `TX: ${txHash.slice(0, 16)}...` });

      // Refresh status after 5s
      setTimeout(() => mutate(), 5000);
    } catch (error: any) {
      const message = error?.message || 'Transaction failed';
      if (message.includes('User') || message.includes('reject') || message.includes('cancel')) {
        toast.warning('Transaction cancelled');
      } else {
        toast.error('Failed', { description: message });
      }
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Connect wallet to manage locker
          </p>
        </CardContent>
      </Card>
    );
  }

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Locker Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !status?.exists) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive justify-center">
            <AlertCircle className="h-5 w-5" />
            <span>Locker not found</span>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            This unit does not exist or has not been initialized.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Locker Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-center py-4">
            {status.isLocked ? (
              <Badge
                variant="destructive"
                className="flex items-center gap-2 px-4 py-2 text-lg"
              >
                <Lock className="h-5 w-5" />
                LOCKED
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="flex items-center gap-2 px-4 py-2 text-lg bg-green-600"
              >
                <Unlock className="h-5 w-5" />
                UNLOCKED
              </Badge>
            )}
          </div>

          {/* Authority Info */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Authority</p>
            <code className="block rounded bg-muted px-2 py-1 text-xs break-all">
              {truncateAddress(status.authority, 12)}
            </code>
          </div>

          {/* Unit Info */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Unit</p>
            <code className="block rounded bg-muted px-2 py-1 text-xs break-all">
              {truncateAddress(unit, 16)}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {/* Lock Button */}
            <Button
              onClick={() => executeTx('lock')}
              disabled={isLoading || status.isLocked}
              variant="outline"
              className="h-14 flex flex-col gap-1"
            >
              {currentAction === 'lock' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
              <span className="text-xs">Lock</span>
            </Button>

            {/* Unlock Button */}
            <Button
              onClick={() => executeTx('unlock')}
              disabled={isLoading || !status.isLocked}
              variant="outline"
              className="h-14 flex flex-col gap-1"
            >
              {currentAction === 'unlock' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Unlock className="h-5 w-5" />
              )}
              <span className="text-xs">Unlock</span>
            </Button>

            {/* Authority Button */}
            <Button
              onClick={() => setShowAuthorityModal(true)}
              disabled={isLoading}
              variant="outline"
              className="h-14 flex flex-col gap-1 col-span-2"
            >
              {currentAction === 'authority' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserCog className="h-5 w-5" />
              )}
              <span className="text-xs">Transfer Authority</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AuthorityModal
        open={showAuthorityModal}
        onClose={() => setShowAuthorityModal(false)}
        onSubmit={(newAuthority) => {
          setShowAuthorityModal(false);
          executeTx('authority', { newAuthority });
        }}
        currentAuthority={status.authority}
        isLoading={isLoading && currentAction === 'authority'}
      />
    </>
  );
}
