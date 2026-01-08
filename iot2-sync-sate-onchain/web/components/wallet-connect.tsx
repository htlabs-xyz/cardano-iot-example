'use client';

import { CardanoWallet } from '@/components/common/cardano-wallet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/components/common/cardano-wallet/use-wallets';

export function WalletConnect() {
  const { walletName, address } = useWallet();
  const connected = walletName !== null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center gap-3">
          <CardanoWallet label="Connect Wallet" />

          {connected && address && (
            <Badge variant="outline" className="text-xs">
              {address.slice(0, 12)}...{address.slice(-8)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
