"use client"

import { AnimatePresence } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import lockApiRequest from "../api/lock.api"
import { ActionButtons } from "../components/action-buttons"
import { Alert } from "../components/alert"
import { AuthorizePopup } from "../components/authorize-popup"
import HistoryPopup from "../components/history-popup"
import { LockButton } from "../components/lock-button"
import RevokePopup from "../components/revoke-popup"
import { useCurrentWallet } from "../contexts/wallet-context"

// Define types for our state objects
type LockState = {
  isLocked: boolean
  isHolding: boolean
  isLoading: boolean
  progress: number
}

type PopupState = {
  type: "none" | "history" | "removeAuthorize" | "authorize"
  actionType?: "lock" | "unlock"
}

type AlertState = {
  type: "none" | "success" | "error"
  message: string
}


export default function LockApp() {
  const { currentWallet } = useCurrentWallet();
  const [lockState, setLockState] = useState<LockState>({
    isLocked: true,
    isHolding: false,
    isLoading: false,
    progress: 0,
  })
  const [popupState, setPopupState] = useState<PopupState>({ type: "none" })
  const [alertState, setAlertState] = useState<AlertState>({ type: "none", message: "" })
  const [newWalletAddress, setNewWalletAddress] = useState("")

  // Destructure state for easier access
  const { isLocked, isLoading } = lockState

  // Helper function to update lock state
  const updateLockState = (updates: Partial<LockState>) => {
    setLockState((prev) => ({ ...prev, ...updates }))
  }

  // Helper function to show alerts
  const showAlert = (type: "success" | "error", message: string, duration = 2000) => {
    setAlertState({ type, message })
    setTimeout(() => setAlertState({ type: "none", message: "" }), duration)
  }

  const processLockAction = (action: "lock" | "unlock", animate = true) => {
    updateLockState({ isLoading: true })
    const newLockState = action === "lock"
    updateLockState({ isLocked: newLockState, isLoading: false })
    // Show success alert
    if (animate) showAlert("success", newLockState ? "Lock secured successfully!" : "Unlocked successfully!")

  }


  //get lock status
  useEffect(() => {
    handleGetLockStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //lock
  const handleUnlockRequest = async () => {
    if (isLoading) return
    try {
      updateLockState({ isLoading: true })
      if (isLocked) {
        const unlockData = {
          is_unlock: true,
          unlocker_addr: currentWallet.address ?? ""
        }
        const unsignedTx = await lockApiRequest.requestUpdateStatusDevice(unlockData);
        if (currentWallet.browserWallet && unsignedTx.data) {
          const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
          const submitTx = await lockApiRequest.submitTransaction({
            signedTx: signedTx,
            user_addr: currentWallet.address ?? "",
            data: unlockData
          })
          //const txhash = await currentWallet.browserWallet.submitTx(signedTx);
          if (submitTx.status && submitTx.data?.tx_hash) processLockAction("unlock")
          else throw new Error()
        }
      }
    }
    catch { showAlert("error", "Action has been canceled") }
    finally { updateLockState({ isLoading: false }) }
  }

  //unlock
  const handleHoldComplete = async () => {
    if (isLoading) return
    try {
      updateLockState({ isLoading: true })
      if (!isLocked) {
        const lockData = {
          is_unlock: false,
          unlocker_addr: currentWallet.address ?? ""
        }
        const unsignedTx = await lockApiRequest.requestUpdateStatusDevice(lockData);
        if (currentWallet.browserWallet && unsignedTx.data) {
          const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
          const submitTx = await lockApiRequest.submitTransaction({
            signedTx: signedTx,
            user_addr: currentWallet.address ?? "",
            data: lockData
          })
          //const txhash = await currentWallet.browserWallet.submitTx(signedTx);
          if (submitTx.status && submitTx.data?.tx_hash) processLockAction("lock")
          else throw new Error()
        }
      }
    }
    catch { showAlert("error", "Action has been canceled") }
    finally { updateLockState({ isLoading: false }) }
  }

  // add authorize
  const handleAddAuthorize = async () => {
    if (newWalletAddress.trim()) {
      setPopupState({ type: "none" })
      if (isLoading) return
      try {
        updateLockState({ isLoading: true })
        const authorizeModel = {
          is_remove_authorize: false,
          authorizer_addr: currentWallet.address ?? "",
          licensee_addr: newWalletAddress,
          time: new Date()
        }
        const unsignedTx = await lockApiRequest.requestAuthorize(authorizeModel);
        if (currentWallet.browserWallet && unsignedTx.data) {
          const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
          const submitTx = await lockApiRequest.submitTransaction({
            signedTx: signedTx,
            user_addr: currentWallet.address ?? "",
            data: authorizeModel
          })
          //const txhash = await currentWallet.browserWallet.submitTx(signedTx);
          if (submitTx.status && submitTx.data?.tx_hash) showAlert("success", "Authorize successfully!")
          else throw new Error()
        }
      }
      catch { showAlert("error", "Action has been canceled") }
      finally { updateLockState({ isLoading: false }) }
    }

  }

  // remove authorize
  const handleRemoveAuthorize = async () => {
    try {
      setPopupState({ type: "none" });
      updateLockState({ isLoading: true })
      const authorizeModel = {
        is_remove_authorize: true,
        authorizer_addr: currentWallet.address ?? "",
        licensee_addr: "",
        time: new Date()
      }
      const unsignedTx = await lockApiRequest.requestAuthorize(authorizeModel);
      if (currentWallet.browserWallet && unsignedTx.data) {
        const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
        const submitTx = await lockApiRequest.submitTransaction({
          signedTx: signedTx,
          user_addr: currentWallet.address ?? "",
          data: authorizeModel
        })
        //const txhash = await currentWallet.browserWallet.submitTx(signedTx);
        if (submitTx.status && submitTx.data?.tx_hash) showAlert("success", "Remove all authorizors successfully!")
        else throw new Error()
      }
    }
    catch { showAlert("error", "Action has been canceled") }
    finally { updateLockState({ isLoading: false }) }

  }


  //sync
  const handleGetLockStatus = async () => {
    try {
      updateLockState({ isLoading: true })
      const lockStatus = await lockApiRequest.getLockStatus();
      if (lockStatus.status == true) {
        if (lockStatus.data?.lock_status == true) {
          processLockAction("lock", false)
        }
        else if (lockStatus.data?.lock_status == false) {
          processLockAction("unlock", false)
        }
      }
    } catch { showAlert("error", "Error: Cannot get lock status") }
    finally { updateLockState({ isLoading: false }) }
  }

  // Derived instruction text
  const instructionText = useMemo(() => {
    if (isLoading) return "processing..."
    return isLocked ? "touch to unlock" : "hold to lock"
  }, [isLocked, isLoading])

  return (
    <div className="flex flex-col h-screen bg-gray-100 items-center justify-center py-10">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
        {/* Device Info */}
        <div className="flex justify-center items-center w-full mb-8">
          <h2 className="text-xl text-gray-700">KDLY02_5696e7</h2>
        </div>

        {/* Lock Button */}
        <LockButton
          isLocked={isLocked}
          isLoading={isLoading}
          onHoldComplete={handleHoldComplete}
          onUnlockRequest={handleUnlockRequest}
        />

        {/* Instruction text */}
        <p className="text-gray-400 text-lg mb-4">{instructionText}</p>

        {/* Action Buttons */}
        <ActionButtons
          onRevokeClick={() => setPopupState({ type: "removeAuthorize" })}
          onAuthorizeClick={() => setPopupState({ type: "authorize" })}
          onHistoryClick={() => setPopupState({ type: "history" })}
          onSyncClick={handleGetLockStatus}
          is_owner={currentWallet.is_owner}
        />

        {/* Alert */}
        <Alert type={alertState.type} message={alertState.message} isLocked={isLocked} />

        {/*Remove Popup */}
        <AnimatePresence>
          {popupState.type === "removeAuthorize" && (
            <RevokePopup
              onSave={handleRemoveAuthorize}
              onCancel={() => setPopupState({ type: "none" })} />
          )}
        </AnimatePresence>

        {/* Authorize Popup */}
        <AnimatePresence>
          {popupState.type === "authorize" && (
            <AuthorizePopup
              walletAddress={newWalletAddress}
              onWalletAddressChange={setNewWalletAddress}
              onSave={handleAddAuthorize}
              onCancel={() => setPopupState({ type: "none" })}
            />
          )}
        </AnimatePresence>

        {/*History Popup */}
        <AnimatePresence>
          <HistoryPopup
            onCancel={() => setPopupState({ type: "none" })}
            open={popupState.type === "history"}
          />
        </AnimatePresence>
      </main>
    </div>
  )
}

