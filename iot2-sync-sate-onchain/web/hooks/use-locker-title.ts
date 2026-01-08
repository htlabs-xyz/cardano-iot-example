'use client';

import { createContext, useContext } from 'react';

export const LockerTitleContext = createContext<string | null>(null);

export function useLockerTitle() {
  const title = useContext(LockerTitleContext);
  if (!title) {
    throw new Error('useLockerTitle must be used within LockerTitleProvider');
  }
  return title;
}
