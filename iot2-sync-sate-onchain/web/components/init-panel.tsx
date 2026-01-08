'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/components/common/cardano-wallet/use-wallets';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Loader2, PlusCircle, CheckCircle, ExternalLink, Info } from 'lucide-react';

interface InitPanelProps {
  title: string;
}

interface StatusResponse {
  exists: boolean;
  assetUnit?: string;
  lockerAddress?: string;
  isLocked?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InitPanel({ title }: InitPanelProps) {
  const { browserWallet, walletName, address } = useWallet();
  const connected = walletName !== null;
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    txHash?: string;
    unit?: string;
    lockerAddress?: string;
  } | null>(null);

  // Check if locker already exists
  const { data: status, isLoading: statusLoading } = useSWR<StatusResponse>(
    address ? `/api/status?owner=${address}&title=${encodeURIComponent(title)}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const handleInit = async () => {
    if (!browserWallet || !address) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    try {
      // Build unsigned TX
      const response = await fetch('/api/tx/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, title }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to build transaction');
      }

      // Sign
      toast.info('Please sign the transaction');
      const signedTx = await browserWallet.signTx(data.unsignedTx, true);

      // Submit
      const txHash = await browserWallet.submitTx(signedTx);
      toast.success('Locker created!', { description: `TX: ${txHash.slice(0, 16)}...` });

      // Get the unit from status API for redirect info
      const statusRes = await fetch(`/api/status?owner=${address}&title=${encodeURIComponent(title)}`);
      const statusData = await statusRes.json();

      setResult({
        success: true,
        txHash,
        unit: statusData.assetUnit,
        lockerAddress: statusData.lockerAddress,
      });
    } catch (error: any) {
      const message = error?.message || 'Transaction failed';
      if (message.includes('User') || message.includes('reject') || message.includes('cancel')) {
        toast.warning('Transaction cancelled');
      } else {
        toast.error('Failed', { description: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Connect wallet to initialize locker
          </p>
        </CardContent>
      </Card>
    );
  }

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checking Status...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // Already initialized - show redirect to locker page
  if (status?.exists) {
    return (
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Locker Already Exists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This locker has already been initialized. You can manage it on the locker page.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Asset Unit</p>
            <code className="block text-xs bg-muted p-2 rounded break-all">
              {status.assetUnit}
            </code>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full">
              <a href={`/locker/${status.assetUnit}`}>
                Go to Lock/Unlock Page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result?.success) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Locker Created
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Transaction Hash</p>
            <a
              href={`https://preprod.cexplorer.io/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
            >
              {result.txHash?.slice(0, 20)}...
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {result.unit && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Asset Unit</p>
              <code className="block text-xs bg-muted p-2 rounded break-all">
                {result.unit}
              </code>
            </div>
          )}

          <div className="pt-4">
            <Button asChild className="w-full">
              <a href={`/locker/${result.unit}`}>
                Go to Lock/Unlock Page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Initialize Locker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Locker Title</p>
          <code className="block bg-muted px-3 py-2 rounded text-sm">{title}</code>
        </div>

        <p className="text-sm text-muted-foreground">
          This will create a new locker on-chain with the given title.
          After initialization, you'll get a unique unit ID to manage lock/unlock.
        </p>

        <Button
          onClick={handleInit}
          disabled={isLoading}
          className="w-full h-12"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Locker
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
