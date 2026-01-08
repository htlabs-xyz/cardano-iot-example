'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLockStatus } from '@/hooks/use-lock-status';
import { useWallet } from '@meshsdk/react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

function truncateAddress(address: string, chars = 8) {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function LockStatus() {
  const { connected } = useWallet();
  const { status, isLoading, error } = useLockStatus();

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Connect wallet to view lock status
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lock Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to fetch status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status?.exists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lock Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-sm">
            Not Initialized
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the Init button to create the lock
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Lock Status</CardTitle>
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

        {/* Asset Info */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Lock ID</p>
          <code className="text-xs text-muted-foreground">
            {status.lockTitle}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
