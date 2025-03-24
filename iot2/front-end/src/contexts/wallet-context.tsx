"use client";
import { BrowserWallet } from '@meshsdk/core';
import React, { createContext, useContext, useState } from 'react';
import lockApiRequest from '../api/lock.api';
import { Alert } from "../components/alert";
import Login from '../components/login';

export interface WalletStoreType {
    walletName: string | null;
    address: string | null;
    browserWallet: BrowserWallet | null;
    is_owner: boolean;
    connect: (walletName: string) => Promise<void>;
    disconnect: () => Promise<void>;
}

type AlertState = {
    type: "none" | "success" | "error"
    message: string
}

// Define the context type
interface WalletContextType {
    currentWallet: WalletStoreType;
    setCurrentWallet: React.Dispatch<React.SetStateAction<WalletStoreType>>;
}

const defaultWalletStore: WalletStoreType = {
    walletName: null,
    address: null,
    browserWallet: null,
    is_owner: false,
    connect: async () => {
        throw new Error("WalletProvider not initialized");
    },
    disconnect: async () => {
        throw new Error("WalletProvider not initialized");
    },
};

const defaultWalletContext: WalletContextType = {
    currentWallet: defaultWalletStore,
    setCurrentWallet: () => {
        throw new Error("WalletProvider not initialized");
    },
};

// Create context with initial undefined value
export const WalletContext = createContext<WalletContextType>(defaultWalletContext);

// Custom hook to use wallet context
export const useCurrentWallet = () => useContext(WalletContext);

// Wallet Provider component
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setLoading] = useState(false);
    const [alertState, setAlertState] = useState<AlertState>({ type: "none", message: "" })
    // Initial wallet state
    const [currentWallet, setCurrentWallet] = useState<WalletStoreType>({
        walletName: null,
        address: null,
        browserWallet: null,
        is_owner: false,
        connect: async (walletName: string) => {
            try {
                setLoading(true);
                const wallet = await BrowserWallet.enable(walletName);
                const address = await wallet.getChangeAddress();
                const accessLock = await lockApiRequest.getAccessLock(address);
                if (accessLock.status == true && accessLock.data != -1) {
                    //setAlertState({ type: 'success', message: 'Connect to lock successfully' })
                    setCurrentWallet(prev => ({
                        ...prev,
                        walletName,
                        address,
                        browserWallet: wallet,
                        is_owner: accessLock.data == 0
                    }));

                }
                else {
                    setAlertState({ type: 'error', message: 'You dont have permission to access this lock' })
                }
            } catch (error) {
                console.error('Wallet connection failed:', error);
                setAlertState({ type: 'error', message: 'Wallet connection failed' })
            } finally {
                setLoading(false);
                setTimeout(() => setAlertState({ type: "none", message: "" }), 2000)
            }
        },
        disconnect: async () => {
            setCurrentWallet({
                walletName: null,
                address: null,
                browserWallet: null,
                is_owner: false,
                connect: currentWallet.connect,
                disconnect: currentWallet.disconnect
            });
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <WalletContext.Provider value={{ currentWallet, setCurrentWallet }}>
            {(currentWallet.address == null || currentWallet.browserWallet == null) ?
                <div>
                    <Login />
                    <Alert type={alertState.type} message={alertState.message} isLocked={true} />
                </div> :
                children
            }
        </WalletContext.Provider>
    );
};