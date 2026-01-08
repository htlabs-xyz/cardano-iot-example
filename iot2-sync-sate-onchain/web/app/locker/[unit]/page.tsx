import { WalletConnect } from '@/components/wallet-connect';
import { LockerPanel } from '@/components/locker-panel';
import { use } from 'react';

export default function LockerPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = use(params);
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b py-4 px-4">
        <h1 className="text-xl font-bold text-center">IoT Lock Control</h1>
        <p className="text-sm text-muted-foreground text-center">
          Manage locker state
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        <WalletConnect />
        <LockerPanel unit={unit} />
      </div>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Network: Preprod Testnet
      </footer>
    </main>
  );
}
