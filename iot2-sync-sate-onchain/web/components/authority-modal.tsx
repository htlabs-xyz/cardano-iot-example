'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AuthorityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newAuthority: string) => void;
  currentAuthority?: string;
  isLoading?: boolean;
}

export function AuthorityModal({
  open,
  onClose,
  onSubmit,
  currentAuthority,
  isLoading,
}: AuthorityModalProps) {
  const [newAuthority, setNewAuthority] = useState('');

  const handleSubmit = () => {
    if (newAuthority.trim()) {
      onSubmit(newAuthority.trim());
      setNewAuthority('');
    }
  };

  const handleClose = () => {
    setNewAuthority('');
    onClose();
  };

  const isValidAddress =
    newAuthority.startsWith('addr_test') || newAuthority.startsWith('addr1');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Authority</DialogTitle>
          <DialogDescription>
            Enter the new authority address. This will transfer control of the
            lock.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentAuthority && (
            <div>
              <Label className="text-muted-foreground">Current Authority</Label>
              <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs break-all">
                {currentAuthority}
              </code>
            </div>
          )}

          <div>
            <Label htmlFor="newAuthority">New Authority Address</Label>
            <Input
              id="newAuthority"
              value={newAuthority}
              onChange={(e) => setNewAuthority(e.target.value)}
              placeholder="addr_test1..."
              className="mt-1"
            />
            {newAuthority && !isValidAddress && (
              <p className="mt-1 text-xs text-destructive">
                Address must start with addr_test or addr1
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidAddress || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              'Transfer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
