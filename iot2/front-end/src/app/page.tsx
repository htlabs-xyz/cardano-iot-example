"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { Lock, CheckCircle, Unlock, Users, ShieldCheck, X, Trash2, Edit } from "lucide-react"

export default function TTLockApp() {
  const [isLocked, setIsLocked] = useState(true)
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const progressControls = useAnimation()
  const holdDuration = 2000 // 2 seconds to complete the hold action
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showOwnerList, setShowOwnerList] = useState(false)
  const [showAuthorize, setShowAuthorize] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState("")

  // Sample wallet data
  const [wallets, setWallets] = useState([
    { id: 1, address: "0x1234...5678" },
    { id: 2, address: "0x8765...4321" },
    { id: 3, address: "0xabcd...efgh" },
  ])

  // For the circular progress
  const progressValue = useMotionValue(0)
  const progressOpacity = useTransform(progressValue, [0, 100], [0, 1])

  // Handle touch/click start (hold to lock)
  const handleHoldStart = () => {
    if (!isLocked) {
      setIsHolding(true)
      progressValue.set(0)

      // Start the progress animation
      progressControls.start({
        pathLength: 1,
        transition: { duration: holdDuration / 1000, ease: "linear" },
      })

      // Start the timer to track progress
      const startTime = Date.now()
      holdTimer.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min(100, (elapsed / holdDuration) * 100)
        setProgress(newProgress)
        progressValue.set(newProgress)

        if (newProgress >= 100) {
          handleLockComplete()
        }
      }, 50)
    }
  }

  // Handle touch/click end (release)
  const handleHoldEnd = () => {
    if (isHolding) {
      if (holdTimer.current) {
        clearInterval(holdTimer.current)
        holdTimer.current = null
      }

      // If progress is less than 100%, reset the progress
      if (progress < 100) {
        progressControls.start({ pathLength: 0, transition: { duration: 0.3 } })
        setProgress(0)
        progressValue.set(0)
      }

      setIsHolding(false)
    }
  }

  // Handle lock complete
  const handleLockComplete = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current)
      holdTimer.current = null
    }

    setIsLocked(true)
    setIsHolding(false)
    setProgress(0)
    progressValue.set(0)

    // Show success alert
    setShowSuccessAlert(true)

    // Hide the alert after 2 seconds
    setTimeout(() => {
      setShowSuccessAlert(false)
    }, 2000)
  }

  // Handle unlock (touch to unlock)
  const handleUnlock = () => {
    if (isLocked && !isHolding) {
      setIsLocked(false)

      // Show success alert for unlock too
      setShowSuccessAlert(true)
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 2000)
    }
  }

  // Handle save new wallet
  const handleSaveWallet = () => {
    if (newWalletAddress.trim()) {
      setWallets([...wallets, { id: wallets.length + 1, address: newWalletAddress }])
      setNewWalletAddress("")
      setShowAuthorize(false)

      // Show success alert
      setShowSuccessAlert(true)
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 2000)
    }
  }

  // Handle delete wallet
  const handleDeleteWallet = (id: number) => {
    setWallets(wallets.filter((wallet) => wallet.id !== id))
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimer.current) {
        clearInterval(holdTimer.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-100 items-center justify-center my-6">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
        {/* Device Info */}
        <div className="flex justify-center items-center w-full mb-8">
          <h2 className="text-xl text-gray-700">KDLY02_5696e7</h2>
        </div>

        {/* Lock Button */}
        <div className="relative flex-1 flex items-center justify-center">
          <motion.div
            className="relative w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
            onMouseDown={isLocked ? handleUnlock : handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={isLocked ? handleUnlock : handleHoldStart}
            onTouchEnd={handleHoldEnd}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Outer circle */}
            <div className="absolute inset-0 rounded-full border-8 border-blue-100" />

            {/* Progress indicator */}
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray="289.027"
                strokeDashoffset="289.027"
                initial={{ pathLength: 0 }}
                animate={progressControls}
                style={{ opacity: progressOpacity }}
              />
            </svg>

            {/* Lock icon */}
            <motion.div
              className={`rounded-full w-32 h-32 flex items-center justify-center ${isLocked ? "bg-blue-500" : "bg-green-500"}`}
              animate={{
                backgroundColor: isLocked ? "#3b82f6" : "#10b981",
                rotate: isLocked ? 0 : 180,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: [0.8, 1.1, 1],
                  rotate: isLocked ? 0 : 180,
                }}
                transition={{
                  duration: 0.4,
                  times: [0, 0.6, 1],
                }}
              >
                {isLocked ? <Lock className="h-16 w-16 text-white" /> : <Unlock className="h-16 w-16 text-white" />}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Instruction text - Moved above the buttons */}
        <p className="text-gray-400 text-lg mt-6 mb-4">{isLocked ? "touch to unlock" : "hold to lock"}</p>

        {/* Icon Buttons */}
        <div className="flex justify-center space-x-16 mb-8">
          <motion.button
            className="flex flex-col items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOwnerList(true)}
          >
            <div className="bg-blue-500 text-white p-4 rounded-full mb-2">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-sm text-gray-600">List Owner</span>
          </motion.button>

          <motion.button
            className="flex flex-col items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAuthorize(true)}
          >
            <div className="bg-blue-500 text-white p-4 rounded-full mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-sm text-gray-600">Authorize</span>
          </motion.button>
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {showSuccessAlert && (
            <motion.div
              className={`fixed top-20 left-1/2 transform -translate-x-1/2 ${isLocked ? "bg-blue-500" : "bg-green-500"} text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50`}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              <span>{isLocked ? "Lock secured successfully!" : "Unlocked successfully!"}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List Owner Popup */}
        <AnimatePresence>
          {showOwnerList && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOwnerList(false)}
            >
              <motion.div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">List Owner</h2>
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowOwnerList(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wallets.map((wallet) => (
                        <tr key={wallet.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wallet.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wallet.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button className="text-blue-500 hover:text-blue-700">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteWallet(wallet.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authorize Popup */}
        <AnimatePresence>
          {showAuthorize && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthorize(false)}
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
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAuthorize(false)}>
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
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowAuthorize(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleSaveWallet}
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

