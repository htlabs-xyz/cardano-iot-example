"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

type AuthorizePopupProps = {
    walletAddress: string
    onWalletAddressChange: (value: string) => void
    onSave: () => void
    onCancel: () => void
}

export function AuthorizePopup({ walletAddress, onWalletAddressChange, onSave, onCancel }: AuthorizePopupProps) {
    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
        >
            <motion.div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Authorize New Wallet</h2>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onCancel}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700 mb-1">
                        Wallet Address
                    </label>
                    <input
                        type="text"
                        id="wallet-address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter wallet address"
                        value={walletAddress}
                        onChange={(e) => onWalletAddressChange(e.target.value)}
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onSave}
                    >
                        Save
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

