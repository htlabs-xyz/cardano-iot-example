import { WalletConnect } from '@/components/wallet-connect';
import { InitPanel } from '@/components/init-panel';
import { use } from 'react';

export default function InitPage({ params }: { params: Promise<{ title: string }> }) {
  const { title } = use(params);
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b py-4 px-4">
        <h1 className="text-xl font-bold text-center">Create New Locker</h1>
        <p className="text-sm text-muted-foreground text-center">
          Initialize locker: <code className="bg-muted px-1 rounded">{title}</code>
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        <WalletConnect />
        <InitPanel title={title} />
      </div>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Network: Preprod Testnet
      </footer>
    </main>
  );
}
