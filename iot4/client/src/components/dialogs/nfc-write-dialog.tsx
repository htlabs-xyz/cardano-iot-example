"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserInfoRequest } from "@/types/user.type"
import { Nfc } from "lucide-react"
interface NFCWriteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userData: UserInfoRequest,
  onWriteToNFC?: () => void,
  isLoading?: boolean
}

export function NFCWriteDialog({ isOpen, onOpenChange, userData, onWriteToNFC, isLoading }: NFCWriteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Nfc className="h-6 w-6 text-indigo-600" />
            Write Data to NFC Card
          </DialogTitle>
          <DialogDescription>Please place the NFC card near the device to start the writing process</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
              <Nfc className="h-12 w-12 text-indigo-600 animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-indigo-200 animate-ping"></div>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Waiting for NFC card...</p>
            <p className="text-sm text-gray-500 mt-1">Place NFC card in the designated position</p>
            {userData.user_fullname && (
              <p className="text-xs text-gray-400 mt-2">Writing data for: {userData.user_fullname}</p>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            {!isLoading && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            <Button onClick={onWriteToNFC} className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Writing..." : "Start Writing"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
