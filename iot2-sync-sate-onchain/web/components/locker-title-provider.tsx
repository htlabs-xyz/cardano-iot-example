'use client';

import { LockerTitleContext } from '@/hooks/use-locker-title';
import type { ReactNode } from 'react';

interface LockerTitleProviderProps {
  title: string;
  children: ReactNode;
}

export function LockerTitleProvider({ title, children }: LockerTitleProviderProps) {
  return (
    <LockerTitleContext.Provider value={title}>
      {children}
    </LockerTitleContext.Provider>
  );
}
