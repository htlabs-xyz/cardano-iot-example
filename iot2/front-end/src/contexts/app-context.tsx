"use client";
import { BrowserWallet } from '@meshsdk/core';
import React, { createContext, useContext, useState } from 'react';
import lockApiRequest from '../api/lock.api';
import { Alert } from "../components/alert";
import Login from '../components/login';
import { AccessRole, LoginRequest } from '@/types/auth.type';

export interface AppStoreType {
    walletName: string | null;
    ownerAddress: string | null;
    currentUserAddress: string | null;
    lockName: string | null;
    browserWallet: BrowserWallet | null;
    accessRole: AccessRole | null;
    connectWallet: (walletName: string, lockName: string, accessRole: AccessRole, ownerAddress: string) => Promise<void>;
    disconnectWallet: () => Promise<void>;
}

type AlertState = {
    type: "none" | "success" | "error"
    message: string
}

// Define the context type
interface AppContextType {
    currentWallet: AppStoreType;
    setCurrentWallet: React.Dispatch<React.SetStateAction<AppStoreType>>;
    isLoadingConnection: boolean;
    setLoadingConnection?: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultWalletStore: AppStoreType = {
    walletName: null,
    currentUserAddress: null,
    ownerAddress: null,
    lockName: null,
    browserWallet: null,
    accessRole: null,
    connectWallet: async () => {
        throw new Error("AppProvider not initialized");
    },
    disconnectWallet: async () => {
        throw new Error("AppProvider not initialized");
    },
};

const defaultAppContext: AppContextType = {
    currentWallet: defaultWalletStore,
    setCurrentWallet: () => {
        throw new Error("AppProvider not initialized");
    },
    isLoadingConnection: false,
    setLoadingConnection: () => {
        throw new Error("AppProvider not initialized");
    },
};

// Create context with initial undefined value
export const AppContext = createContext<AppContextType>(defaultAppContext);

// Custom hook to use wallet context
export const useCurrentWallet = () => useContext(AppContext);

// Wallet Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setLoading] = useState(false);
    const [alertState, setAlertState] = useState<AlertState>({ type: "none", message: "" })
    // Initial wallet state
    const [currentWallet, setCurrentWallet] = useState<AppStoreType>({
        walletName: null,
        currentUserAddress: null,
        ownerAddress: null,
        lockName: null,
        browserWallet: null,
        accessRole: null,
        connectWallet: async (walletName: string, lockName: string, accessRole: AccessRole, ownerAddress: string) => {
            try {
                setLoading(true);
                const wallet = await BrowserWallet.enable(walletName);
                const userAddress = await wallet.getChangeAddress();
                const loginModel: LoginRequest = {
                    user_addr: userAddress,
                    owner_addr: accessRole == AccessRole.OWNER ? userAddress : ownerAddress,
                    lock_name: lockName,
                    access_role: accessRole
                }
                console.log("Login model:", loginModel);
                const loginResult = await lockApiRequest.login(loginModel);
                if (loginResult.status == true && loginResult.data) {
                    //setAlertState({ type: 'success', message: 'Connect to lock successfully' })
                    setCurrentWallet(prev => ({
                        ...prev,
                        walletName,
                        currentUserAddress: loginModel.user_addr,
                        browserWallet: wallet,
                        accessRole: loginResult.data!.access_role,
                        lockName: loginModel.lock_name,
                        ownerAddress: loginModel.owner_addr,
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
        disconnectWallet: async () => {
            setCurrentWallet({
                walletName: null,
                currentUserAddress: null,
                ownerAddress: null,
                lockName: null,
                browserWallet: null,
                accessRole: null,
                connectWallet: currentWallet.connectWallet,
                disconnectWallet: currentWallet.disconnectWallet
            });
        }
    });

    return (
        <AppContext.Provider value={{ currentWallet, setCurrentWallet, isLoadingConnection: isLoading, setLoadingConnection: setLoading }}>
            {(currentWallet.currentUserAddress == null || currentWallet.browserWallet == null) ?
                <div>
                    <Login />
                    <Alert type={alertState.type} message={alertState.message} isLocked={true} />
                </div> :
                children
            }
        </AppContext.Provider>
    );
};