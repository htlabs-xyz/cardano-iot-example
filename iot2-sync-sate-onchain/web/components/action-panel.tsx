'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletTx } from '@/hooks/use-wallet-tx';
import { useLockStatus } from '@/hooks/use-lock-status';
import { useState } from 'react';
import { AuthorityModal } from './authority-modal';
import { Loader2, PlusCircle, Lock, Unlock, UserCog } from 'lucide-react';

export function ActionPanel() {
  const { status, refresh } = useLockStatus();
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);

  const { executeTx, isLoading, currentAction, connected } = useWalletTx({
    onSuccess: () => {
      // Refresh status after successful TX
      setTimeout(() => refresh(), 5000);
    },
  });

  const handleInit = () => executeTx('init');
  const handleLock = () => executeTx('lock');
  const handleUnlock = () => executeTx('unlock');
  const handleAuthority = (newAuthority: string) => {
    setShowAuthorityModal(false);
    executeTx('authority', { newAuthority });
  };

  const isDisabled = !connected || isLoading;
  const lockExists = status?.exists;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {/* Init Button */}
            <Button
              onClick={handleInit}
              disabled={isDisabled || lockExists}
              variant="outline"
              className="h-14 flex flex-col gap-1"
            >
              {currentAction === 'init' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
              <span className="text-xs">Init</span>
            </Button>

            {/* Lock Button */}
            <Button
              onClick={handleLock}
              disabled={isDisabled || !lockExists || status?.isLocked}
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
              onClick={handleUnlock}
              disabled={isDisabled || !lockExists || !status?.isLocked}
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
              disabled={isDisabled || !lockExists}
              variant="outline"
              className="h-14 flex flex-col gap-1"
            >
              {currentAction === 'authority' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserCog className="h-5 w-5" />
              )}
              <span className="text-xs">Authority</span>
            </Button>
          </div>

          {!connected && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Connect wallet to perform actions
            </p>
          )}
        </CardContent>
      </Card>

      <AuthorityModal
        open={showAuthorityModal}
        onClose={() => setShowAuthorityModal(false)}
        onSubmit={handleAuthority}
        currentAuthority={status?.authority}
        isLoading={isLoading && currentAction === 'authority'}
      />
    </>
  );
}
