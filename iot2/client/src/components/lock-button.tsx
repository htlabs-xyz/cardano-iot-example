"use client"

import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion"
import { Loader2, Lock, Unlock } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type LockButtonProps = {
    isLocked: boolean
    isLoading: boolean
    onHoldComplete: () => void
    onUnlockRequest: () => void
}

export function LockButton({ isLocked, isLoading, onHoldComplete, onUnlockRequest }: LockButtonProps) {
    // Internal state for the hold action
    const [isHolding, setIsHolding] = useState(false)
    const [progress, setProgress] = useState(0)
    const holdTimer = useRef<NodeJS.Timeout | null>(null)
    const progressControls = useAnimation()
    const loadingControls = useAnimation()
    const buttonControls = useAnimation()
    const holdDuration = 2000 // 2 seconds to complete the hold action

    // For the circular progress
    const progressValue = useMotionValue(0)
    const progressOpacity = useTransform(progressValue, [0, 100], [0, 1])

    // Handle button click
    const handleButtonClick = () => {
        if (isLoading) return // Prevent actions while loading

        if (isLocked) {
            // Request unlock from parent
            onUnlockRequest()
        } else {
            // Start hold to lock process
            handleHoldStart()
        }
    }

    // Handle touch/click start (hold to lock)
    const handleHoldStart = () => {
        if (isLoading) return // Prevent actions while loading

        if (!isLocked) {
            setIsHolding(true)
            setProgress(0)
            progressValue.set(0)

            // Start the progress animation
            progressControls.start({
                pathLength: 1,
                transition: { duration: holdDuration / 1000, ease: "linear" },
            })

            // Start the timer to track progress
            const startTime = Date.now()
            holdTimer.current = setInterval(async () => {
                const elapsed = Date.now() - startTime
                const newProgress = Math.min(100, (elapsed / holdDuration) * 100)
                setProgress(newProgress)
                progressValue.set(newProgress)

                if (newProgress >= 100) {
                    // When hold completes, notify parent
                    clearInterval(holdTimer.current as NodeJS.Timeout)
                    holdTimer.current = null
                    setIsHolding(false)
                    setProgress(0)
                    progressValue.set(0)
                    progressControls.start({ pathLength: 0, transition: { duration: 0.3 } })

                    await onHoldComplete()
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
                setIsHolding(false)
                setProgress(0)
                progressValue.set(0)
            }
        }
    }

    // Start loading animation when isLoading changes
    useEffect(() => {
        if (isLoading) {
            loadingControls.start({
                rotate: 360,
                transition: {
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                },
            })
        }
    }, [isLoading, loadingControls])

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (holdTimer.current) {
                clearInterval(holdTimer.current)
            }
        }
    }, [])

    return (
        <div className="relative flex-1 flex items-center justify-center">
            <motion.div
                className={`relative w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                onMouseDown={!isLoading ? handleButtonClick : undefined}
                onMouseUp={!isLoading ? handleHoldEnd : undefined}
                onMouseLeave={!isLoading ? handleHoldEnd : undefined}
                onTouchStart={!isLoading ? handleButtonClick : undefined}
                onTouchEnd={!isLoading ? handleHoldEnd : undefined}
                whileTap={!isLoading ? { scale: 0.95 } : undefined}
                animate={buttonControls}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                {/* Outer circle - only visible when not loading */}
                {!isLoading && <div className="absolute inset-0 rounded-full border-8 border-blue-100" />}

                {/* Progress indicator for hold action */}
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
                    {isLoading ? (
                        <Loader2 className="h-16 w-16 text-white animate-spin" />
                    ) : (
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
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}

