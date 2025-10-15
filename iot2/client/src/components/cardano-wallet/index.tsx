import { useEffect, useState } from "react";

import { BrowserWallet, Wallet } from "@meshsdk/core";
import { useCurrentWallet } from "../../contexts/app-context";
import ButtonDropdown from "./button-dropdown";
import { MenuItem } from "./menu-item";
import { WalletBalance } from "./wallet-balance";

interface ButtonProps {
  label?: string;
  onConnected?: (wallet: Wallet) => void;
  persist?: boolean;
  isDark?: boolean;
  extensions?: number[];
  isLoading?: boolean;
}

export const CardanoWallet = ({
  label = "Connect Wallet",
  onConnected = () => {},
  isDark = false,
  isLoading = false
}: ButtonProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hideMenuList, setHideMenuList] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const { currentWallet } = useCurrentWallet();
  useEffect(() => {
    async function get() {
      setWallets(await BrowserWallet.getAvailableWallets());
    }
    get();
  }, []);

  useEffect(() => {
    setIsDarkMode(isDark);
  }, [isDark]);

  return (
    <div onMouseEnter={() => setHideMenuList(false)} onMouseLeave={() => setHideMenuList(true)} style={{ width: "min-content", zIndex: 50 }}>
      <ButtonDropdown isDarkMode={isDarkMode} hideMenuList={hideMenuList} setHideMenuList={setHideMenuList}>
        <WalletBalance connected={currentWallet.walletName != null} connecting={isLoading} label={label} wallet={wallets.find((wallet) => wallet.id === currentWallet.walletName)} />
      </ButtonDropdown>
      <div
        className={`mr-menu-list absolute w-60 rounded-b-md border text-center shadow-sm backdrop-blur ${hideMenuList && "hidden"} ${isDarkMode ? `bg-neutral-950	text-neutral-50` : `bg-neutral-50	text-neutral-950`}`}
        style={{ zIndex: 50 }}
      >
        {currentWallet.walletName == null && wallets.length > 0 ? (
          <>
            {wallets.map((wallet, index) => (
              <MenuItem
                key={index}
                icon={wallet.icon}
                label={wallet.name}
                action={() => {
                  onConnected(wallet);
                  setHideMenuList(!hideMenuList);
                }}
                active={currentWallet.walletName === wallet.id}
              />
            ))}
          </>
        ) : wallets.length === 0 ? (
          <span>No Wallet Found</span>
        ) : (
          <>
            <MenuItem active={false} label="disconnect" action={currentWallet.disconnectWallet} icon={undefined} />
          </>
        )}
      </div>
    </div>
  );
};
