'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTxHistory } from '@/hooks/use-tx-history';
import { useWallet } from '@meshsdk/react';
import { ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function truncateHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function TxHistory() {
  const { connected } = useWallet();
  const { history, isLoading, error } = useTxHistory(10);

  if (!connected) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Silently fail for history
  }

  if (!history.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.map((tx) => (
            <a
              key={tx.txHash}
              href={tx.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono">
                  {truncateHash(tx.txHash)}
                </code>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(tx.blockTime * 1000, { addSuffix: true })}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
