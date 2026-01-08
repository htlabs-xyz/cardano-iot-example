import { BrowserWallet } from "@meshsdk/core";
import { create } from "zustand";

interface UseWalletsStore {
  walletName: string | null;
  address: string | null;
  browserWallet: BrowserWallet | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useWallet = create<UseWalletsStore>((set) => ({
  walletName: null,
  address: null,
  browserWallet: null,
  connect: async (walletName: string) => {
    const walletNameLower = walletName.toLowerCase();
    const browserWallet: BrowserWallet = await BrowserWallet.enable(walletNameLower);

    if (!browserWallet) {
      throw new Error("Failed to connect wallet");
    }
    const address = await browserWallet.getChangeAddress();
    if (!address) {
      throw new Error("Failed to get address");
    }
    set({ walletName, address, browserWallet });
  },
  disconnect: async () => {
    set({ walletName: null, address: null, browserWallet: null });
  },
}));