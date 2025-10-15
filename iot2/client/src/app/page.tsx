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
import { useCurrentWallet } from "../contexts/app-context"
import { AuthorizeRequest, LockInfoRequest, LockRequest, LockStatus } from "@/types/lock.type"
import { AccessRole } from "@/types/auth.type"

// Define types for our state objects
type LockState = {
  lockStatus: LockStatus
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
    lockStatus: LockStatus.CLOSE,
    isHolding: false,
    isLoading: false,
    progress: 0,
  })
  const [popupState, setPopupState] = useState<PopupState>({ type: "none" })
  const [alertState, setAlertState] = useState<AlertState>({ type: "none", message: "" })
  const [newWalletAddress, setNewWalletAddress] = useState("")

  // Destructure state for easier access
  const { lockStatus, isLoading } = lockState

  // Helper function to update lock state
  const updateLockState = (updates: Partial<LockState>) => {
    setLockState((prev) => ({ ...prev, ...updates }))
  }

  // Helper function to show alerts
  const showAlert = (type: "success" | "error", message: string, duration = 2000) => {
    setAlertState({ type, message })
    setTimeout(() => setAlertState({ type: "none", message: "" }), duration)
  }

  const processLockAction = (lockStatus: LockStatus, animate = true) => {
    updateLockState({ lockStatus, isLoading: false })
    if (animate) showAlert("success", lockStatus === LockStatus.CLOSE ? "Lock secured successfully!" : "Unlocked successfully!")
  }

  //get lock status
  useEffect(() => {
    handleGetLockStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //lock & unlock
  const handleUpdateLockStatus = async (newLockStatus: LockStatus) => {
    if (isLoading) return
    try {
      updateLockState({ isLoading: true })
      if (lockStatus != newLockStatus) {
        const updateLockRequest: LockRequest = {
          lock_status: newLockStatus,
          unlocker_addr: currentWallet.currentUserAddress ?? "",
          lock_name: currentWallet.lockName ?? "",
          owner_addr: currentWallet.ownerAddress ?? "",
          time: new Date()
        }
        const unsignedTx = await lockApiRequest.requestUpdateStatusDevice(updateLockRequest);
        if (currentWallet.browserWallet && unsignedTx.data) {
          const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
          const submitTx = await lockApiRequest.submitTransaction({
            signedTx: signedTx,
            user_addr: currentWallet.currentUserAddress ?? "",
            data: updateLockRequest
          })
          //const txhash = await currentWallet.browserWallet.submitTx(signedTx);
          if (submitTx.status && submitTx.data?.tx_hash){
            console.log('https://preprod.cexplorer.io/tx/' + submitTx.data.tx_hash);
            processLockAction(newLockStatus)
          }
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
        const authorizeModel: AuthorizeRequest = {
          is_remove_authorize: false,
          lock_name: currentWallet.lockName ?? "",
          owner_addr: currentWallet.ownerAddress ?? "",
          licensee_addr: newWalletAddress,
          time: new Date()
        }
        const unsignedTx = await lockApiRequest.requestAuthorize(authorizeModel);
        if (currentWallet.browserWallet && unsignedTx.data) {
          const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
          const submitTx = await lockApiRequest.submitTransaction({
            signedTx: signedTx,
            user_addr: currentWallet.currentUserAddress ?? "",
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
      const authorizeModel: AuthorizeRequest = {
        is_remove_authorize: true,
        owner_addr: currentWallet.ownerAddress ?? "",
        licensee_addr: "",
        lock_name: currentWallet.lockName ?? "",
        time: new Date()
      }
      const unsignedTx = await lockApiRequest.requestAuthorize(authorizeModel);
      if (currentWallet.browserWallet && unsignedTx.data) {
        const signedTx = await currentWallet.browserWallet.signTx(unsignedTx.data, true);
        const submitTx = await lockApiRequest.submitTransaction({
          signedTx: signedTx,
          user_addr: currentWallet.currentUserAddress ?? "",
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
      const query: LockInfoRequest = {
        lock_name: currentWallet.lockName ?? "",
        owner_addr: currentWallet.ownerAddress ?? "",
      }
      const lockStatus = await lockApiRequest.getLockStatus(query);
      if (lockStatus.status == true) {
        if (lockStatus.data?.lock_status !== undefined) {
          processLockAction(lockStatus.data.lock_status, false)
        }
      }
    } catch { showAlert("error", "Error: Cannot get lock status") }
    finally { updateLockState({ isLoading: false }) }
  }

  // Derived instruction text
  const instructionText = useMemo(() => {
    if (isLoading) return "processing..."
    return lockStatus == LockStatus.CLOSE ? "touch to unlock" : "hold to lock"
  }, [lockStatus, isLoading])

  return (
    <div className="flex flex-col h-screen bg-gray-100 items-center justify-center py-10">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
        {/* Device Info */}
        <div className="flex justify-center items-center w-full mb-8">
          <h2 className="text-xl text-gray-700">{currentWallet.lockName}</h2>
        </div>

        {/* Lock Button */}
        <LockButton
          isLocked={lockStatus == LockStatus.CLOSE}
          isLoading={isLoading}
          onHoldComplete={() => handleUpdateLockStatus(LockStatus.CLOSE)}
          onUnlockRequest={() => handleUpdateLockStatus(LockStatus.OPEN)}
        />

        {/* Instruction text */}
        <p className="text-gray-400 text-lg mb-4">{instructionText}</p>

        {/* Action Buttons */}
        <ActionButtons
          onRevokeClick={() => setPopupState({ type: "removeAuthorize" })}
          onAuthorizeClick={() => setPopupState({ type: "authorize" })}
          onHistoryClick={() => setPopupState({ type: "history" })}
          onSyncClick={handleGetLockStatus}
          is_owner={currentWallet.accessRole == AccessRole.OWNER}
        />

        {/* Alert */}
        <Alert type={alertState.type} message={alertState.message} isLocked={lockStatus == LockStatus.CLOSE} />

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

