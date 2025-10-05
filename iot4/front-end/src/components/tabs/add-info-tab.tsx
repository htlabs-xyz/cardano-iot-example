"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { UserInfoRequest } from "@/types/user.type"
import { UserInfoForm } from "../forms/user-info-form"
import { useEffect, useState } from "react"
import { NFCWriteDialog } from "../dialogs/nfc-write-dialog"
import userIdentityApiRequest from "@/api/user-identity.api"
import { toast } from "sonner"
import { newUserId } from "@/lib/utils"

export function AddInfoTab() {
  const [isNfcWriteDialogOpen, setIsNfcWriteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UserInfoRequest>({
    user_id: '',
    user_fullname: "",
    user_birthday: new Date(),
    user_gender: "",
    user_country: "",
  })

  useEffect(() => {
    setFormData((prev) => ({ ...prev, user_id: newUserId() }))
  }, [])

  const handleWriteToNFC = async () => {
    try {
      setIsLoading(true)
      const res = await userIdentityApiRequest.submitUserIdentityInfo(formData)
      if (res.status) {
        // Write user information to NFC card
        toast.success("User information saved to blockchain successfully!")
        toast.loading("Writing data to NFC card...", {
          id: "nfc-write",
        })
        // Simulate NFC write process
        setTimeout(() => {
          setIsNfcWriteDialogOpen(false)
          toast.dismiss("nfc-write")
          toast.success("Data successfully written to NFC card!")
        }, 2000)
      }
    } catch {
      toast.error("Failed to save user information to blockchain or write to NFC card")
    }
    finally {
      setIsNfcWriteDialogOpen(false)
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserInfoRequest, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            User Information
          </CardTitle>
          <CardDescription>Fill in complete information to write to NFC card</CardDescription>
        </CardHeader>
        <CardContent>
          <UserInfoForm formData={formData} onInputChange={handleInputChange} onWriteToNFC={() => setIsNfcWriteDialogOpen(true)} />
        </CardContent>
      </Card>
      <NFCWriteDialog isOpen={isNfcWriteDialogOpen} 
                      onOpenChange={setIsNfcWriteDialogOpen} 
                      userData={formData} 
                      onWriteToNFC={handleWriteToNFC} 
                      isLoading={isLoading} />
    </div>
  )
}
