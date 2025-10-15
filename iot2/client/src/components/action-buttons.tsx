"use client"

import { motion } from "framer-motion"
import { History, RefreshCcw, ShieldCheck, UserRound } from "lucide-react"

type ActionButtonsProps = {
    onRevokeClick: () => void
    onAuthorizeClick: () => void
    onHistoryClick: () => void
    onSyncClick: () => void
    is_owner: boolean
}

export function ActionButtons({ onRevokeClick, onAuthorizeClick, onHistoryClick, onSyncClick, is_owner }: ActionButtonsProps) {
    return (
        <div className="flex justify-center space-x-10 mb-8">
            {is_owner && <div className="flex justify-center space-x-10">
                <motion.button
                    className="flex flex-col items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAuthorizeClick}>
                    <div className="bg-green-500 text-white p-4 rounded-full mb-2">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-600">Authorize</span>
                </motion.button>

                <motion.button
                    className="flex flex-col items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRevokeClick}>
                    <div className="bg-red-500 text-white p-4 rounded-full mb-2">
                        <UserRound className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-600">Revoke rights</span>
                </motion.button>

                <motion.button
                    className="flex flex-col items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onHistoryClick}>
                    <div className="bg-gray-500 text-white p-4 rounded-full mb-2">
                        <History className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-600">History</span>
                </motion.button>
            </div>}
            <motion.button
                className="flex flex-col items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSyncClick}>
                <div className="bg-blue-500 text-white p-4 rounded-full mb-2">
                    <RefreshCcw className="h-6 w-6" />
                </div>
                <span className="text-sm text-gray-600">Sync</span>
            </motion.button>
        </div>

    )
}

