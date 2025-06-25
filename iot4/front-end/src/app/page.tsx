"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Plus } from "lucide-react"

import { toast } from "sonner"
import { VerifyTab } from "@/components/tabs/verify-tab"
import { AddInfoTab } from "@/components/tabs/add-info-tab"
import { NFCWriteDialog } from "@/components/dialogs/nfc-write-dialog"
import { NFCReadDialog } from "@/components/dialogs/nfc-read-dialog"
import { UserInfoRequest } from "@/types/user.type"

export default function NFCIdentitySystem() {
  const [isNfcWriteDialogOpen, setIsNfcWriteDialogOpen] = useState(false)
  const [isNfcReadDialogOpen, setIsNfcReadDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UserInfoRequest>({
    user_id: "",
    user_fullname: "",
    user_birthday: new Date(),
    user_gender: "",
    user_country: "",
  })

  const handleInputChange = (field: keyof UserInfoRequest, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleWriteToNFC = () => {
    // Validate form data
    if (
      !formData.user_id ||
      !formData.user_fullname ||
      !formData.user_birthday ||
      !formData.user_gender ||
      !formData.user_country
    ) {
      toast.error("Please fill in all required information")
      return
    }
    setIsNfcWriteDialogOpen(true)
  }

  const handleNFCRead = () => {
    setIsNfcReadDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Decentralized Identity</h1>
          <p className="text-gray-600">Identity verification system using NFC technology</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              NFC Identity Management
            </CardTitle>
            <CardDescription>Verify or add identity information to NFC cards</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="verify" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="verify" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verify
                </TabsTrigger>
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Information
                </TabsTrigger>
              </TabsList>

              <TabsContent value="verify" className="space-y-6">
                <VerifyTab onNFCRead={handleNFCRead} />
              </TabsContent>

              <TabsContent value="add" className="space-y-6">
                <AddInfoTab formData={formData} onInputChange={handleInputChange} onWriteToNFC={handleWriteToNFC} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <NFCWriteDialog isOpen={isNfcWriteDialogOpen} onOpenChange={setIsNfcWriteDialogOpen} userData={formData} />

        <NFCReadDialog isOpen={isNfcReadDialogOpen} onOpenChange={setIsNfcReadDialogOpen} />
      </div>
    </div>
  )
}
