"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle } from "lucide-react"

type AlertProps = {
    type: "none" | "success" | "error"
    message: string
    isLocked: boolean
}

export function Alert({ type, message, isLocked }: AlertProps) {
    if (type === "none") return null

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed top-20 left-1/2 transform -translate-x-1/2 ${type === "success" ? (isLocked ? "bg-blue-500" : "bg-green-500") : "bg-red-500"
                    } text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50`}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {type === "success" ? <CheckCircle className="mr-2 h-5 w-5" /> : <AlertCircle className="mr-2 h-5 w-5" />}
                <span>{message}</span>
            </motion.div>
        </AnimatePresence>
    )
}

