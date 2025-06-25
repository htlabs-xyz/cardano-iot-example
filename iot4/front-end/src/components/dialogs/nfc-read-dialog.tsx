"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"

interface NFCReadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function NFCReadDialog({ isOpen, onOpenChange }: NFCReadDialogProps) {
  const handleStartRead = () => {
    toast.loading("Reading data from NFC card...", {
      id: "nfc-read",
    })

    // Simulate NFC read process
    setTimeout(() => {
      onOpenChange(false)

      // Simulate reading user data
      const mockUserData = {
        user_id: "USR001",
        user_fullname: "John Doe",
        user_birthday: new Date("1990-01-15"),
        user_gender: "male",
        user_country: "usa",
      }

      toast.success("Data successfully read from NFC card!", {
        id: "nfc-read",
        description: `User: ${mockUserData.user_fullname} (ID: ${mockUserData.user_id})`,
      })
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            Read Data from NFC Card
          </DialogTitle>
          <DialogDescription>Please place the NFC card near the device to read identity information</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
              <CreditCard className="h-12 w-12 text-green-600 animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-green-200 animate-ping"></div>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Scanning NFC card...</p>
            <p className="text-sm text-gray-500 mt-1">Keep NFC card near the device</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartRead} className="bg-green-600 hover:bg-green-700">
              Start Scanning
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
