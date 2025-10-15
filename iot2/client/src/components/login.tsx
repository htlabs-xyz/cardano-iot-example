"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentWallet } from "@/contexts/app-context"
import { AccessRole, RegisterNewLockRequest } from "@/types/auth.type"
import { BrowserWallet, Wallet } from "@meshsdk/core"
import { useState } from "react"
import { CardanoWallet } from "./cardano-wallet"
import lockApiRequest from "../api/lock.api"

export default function Login() {
    const [userType, setUserType] = useState<AccessRole>(AccessRole.OWNER)
    const [ownerAddress, setOwnerAddress] = useState("")
    const [lockName, setLockName] = useState("")
    const [registerLockName, setRegisterLockName] = useState("")
    const { currentWallet, setCurrentWallet, isLoadingConnection, setLoadingConnection } = useCurrentWallet();
    const isFormComplete =
        lockName.trim() !== "" && (userType === AccessRole.OWNER || (userType === AccessRole.AUTHORITY && ownerAddress.trim() !== ""))

    const handleRegister = async (wallet: Wallet) => {
        if (isLoadingConnection) return
        try {
            setLoadingConnection?.(true);
            const browserWallet = await BrowserWallet.enable(wallet.id);
            const registerRequest: RegisterNewLockRequest = {
                lock_name: registerLockName,
                owner_addr: await browserWallet.getChangeAddress(),
            }
            const unsignedTx = await lockApiRequest.register(registerRequest);
            console.log("unsignedTx:", unsignedTx);
            if (browserWallet && unsignedTx.data) {
                const signedTx = await browserWallet.signTx(unsignedTx.data, true);
                const submitTx = await lockApiRequest.submitTransaction({
                    signedTx: signedTx,
                    user_addr: registerRequest.owner_addr ?? "",
                    data: registerRequest
                })
                if (submitTx.status && submitTx.data?.tx_hash) {
                    setCurrentWallet(prev => ({
                        ...prev,
                        walletName: wallet.id,
                        currentUserAddress: registerRequest.owner_addr,
                        browserWallet: browserWallet,
                        accessRole: AccessRole.OWNER,
                        lockName: registerRequest.lock_name,
                        ownerAddress: registerRequest.owner_addr,
                    }));
                }
                else throw new Error()
            }
        }
        catch (e: any) { console.log("Action has been canceled", e) }
        finally { setLoadingConnection?.(false); }
    }

    const handleLogin = async (wallet: Wallet) => {
        await currentWallet.connectWallet(wallet.id, lockName, userType, ownerAddress)
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-8">
                <header>
                    <title>IOT 02 - The locker</title>
                    <meta name="description" content="Open electric lock with blockchain" />
                </header>
                <h1 className="text-3xl font-bold text-gray-800 text-center tracking-tight">Welcome to The locker</h1>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4 mt-6">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-gray-700">
                                Select Access Type
                            </Label>

                            <RadioGroup
                                disabled={isLoadingConnection}
                                value={String(userType)}
                                onValueChange={(v) => setUserType(Number(v) as AccessRole)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={String(AccessRole.OWNER)} id="owner" />
                                    <Label htmlFor="owner" className="font-normal cursor-pointer">
                                        Owner
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={String(AccessRole.AUTHORITY)} id="authority" />
                                    <Label htmlFor="authority" className="font-normal cursor-pointer">
                                        Licensee
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {userType === AccessRole.AUTHORITY && (
                            <div className="space-y-2">
                                <Label htmlFor="ownerAddress" className="text-base font-semibold text-gray-700">
                                    Owner Address
                                </Label>
                                <Input
                                    id="ownerAddress"
                                    type="text"
                                    disabled={isLoadingConnection}
                                    placeholder="Enter owner address"
                                    value={ownerAddress}
                                    onChange={(e) => setOwnerAddress(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="lockName" className="text-base font-semibold text-gray-700">
                                Lock Name
                            </Label>
                            <Input
                                id="lockName"
                                type="text"
                                disabled={isLoadingConnection}
                                placeholder="Enter lock name"
                                value={lockName}
                                onChange={(e) => setLockName(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {isFormComplete ? (
                            <>
                                <p className="text-center text-gray-600 text-lg font-medium">Connect your wallet to login</p>
                                <div className="flex justify-center">
                                    <CardanoWallet
                                        label="Select a wallet to login"
                                        isLoading={isLoadingConnection}
                                        persist={true}
                                        onConnected={handleLogin} />
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 text-sm italic">
                                Please complete all fields to connect your wallet
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4 mt-6">
                        <div className="space-y-2">
                            <Label htmlFor="registerLockName" className="text-base font-semibold text-gray-700">
                                Lock Name
                            </Label>
                            <Input
                                id="registerLockName"
                                type="text"
                                placeholder="Enter new lock name first"
                                value={registerLockName}
                                onChange={(e) => setRegisterLockName(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        {!(registerLockName.trim() === "") ? (
                            <>
                                <p className="text-center text-gray-600 text-lg font-medium">Connect your wallet to register as owner</p>
                                <div className="flex justify-center">
                                    <CardanoWallet
                                        label="Select a wallet to register"
                                        isLoading={isLoadingConnection}
                                        persist={true}
                                        onConnected={handleRegister} />
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 text-sm italic">
                                Please complete all fields to connect your wallet
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
