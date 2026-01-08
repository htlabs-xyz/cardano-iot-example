"use client";
import { useEffect, useState } from "react";
import ButtonDropdown from "./button-dropdown";
import { WalletBalance } from "./wallet-balance";
import { MenuItem } from "./menu-item";
import { useRouter } from "next/navigation";
import { BrowserWallet, Wallet } from "@meshsdk/core";
import { useWallet } from "./use-wallets";

interface ButtonProps {
    label?: string;
    onConnected?: () => void;
    persist?: boolean;
    isDark?: boolean;
    extensions?: number[];
}

export const CardanoWallet = ({ label = "Connect Wallet", isDark = false }: ButtonProps) => {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hideMenuList, setHideMenuList] = useState(true);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const { walletName, connect, disconnect } = useWallet();

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
                <WalletBalance connected={walletName != null} connecting={false} label={label} wallet={wallets.find((wallet) => wallet.id === walletName)} />
            </ButtonDropdown>
            <div
                className={`mr-menu-list absolute w-60 rounded-b-md border text-center shadow-sm backdrop-blur ${hideMenuList && "hidden"} ${isDarkMode ? `bg-neutral-950	text-neutral-50` : `bg-neutral-50	text-neutral-950`}`}
                style={{ zIndex: 50 }}
            >
                {walletName == null && wallets.length > 0 ? (
                    <>
                        {wallets.map((wallet, index) => (
                            <MenuItem
                                key={index}
                                icon={wallet.icon}
                                label={wallet.name}
                                action={() => {
                                    connect(wallet.id);
                                    setHideMenuList(!hideMenuList);
                                }}
                                active={walletName === wallet.id}
                            />
                        ))}
                    </>
                ) : wallets.length === 0 ? (
                    <span>No Wallet Found</span>
                ) : (
                    <>
                        <MenuItem active={false} label="Go Profile" action={() => router.push("/profile")} icon={undefined} />
                        <MenuItem active={false} label="disconnect" action={disconnect} icon={undefined} />
                    </>
                )}
            </div>
        </div>
    );
};