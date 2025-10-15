"use client"

import userIdentityApiRequest from "@/api/user-identity.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserVerifyRequest, UserVerifyResponse } from "@/types/user.type"
import { CheckCircle, CreditCard, Nfc, User, AlertCircle, Calendar, Globe, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { NFCReadDialog } from "../dialogs/nfc-read-dialog"
import { formatDate } from "@/lib/utils"


type VerificationResult = {
  status: "success" | "error" | null
  message?: string
  userData?: UserVerifyResponse
}

export function VerifyTab() {
  const [isNfcReadDialogOpen, setIsNfcReadDialogOpen] = useState(false)
  const [verifyFormData, setVerifyFormData] = useState<UserVerifyRequest>({
    user_id: "",
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({ status: null })

  const handleFormVerify = async (verifyData: UserVerifyRequest) => {
    setIsVerifying(true)
    setVerificationResult({ status: null })
    toast.loading("Verifying user identity...", {
      id: "form-verify",
    })

    try {
      const response = await userIdentityApiRequest.verifyUserInfo(verifyData)
      if (response.status === false) {
        throw new Error('Verification failed');
      }
      setVerificationResult({ status: "success", userData: response.data })
      toast.success("User identity verified successfully!", {
        id: "form-verify",
        description: `User (ID: ${verifyData.user_id}) is verified`,
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch {
      setVerificationResult({ status: "error", message: "User verification failed" })
      toast.error("User verification failed", {
        id: "form-verify",
        description: "User not found or information mismatch",
      })
    } finally {
      toast.dismiss("form-verify")
      setIsVerifying(false)
    }
  }

  const handleNFCRead = async () => {
    setIsNfcReadDialogOpen(true)
    toast.loading("Reading data from NFC card...", {
      id: "nfc-read",
    })

    // Simulate NFC read process
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Simulate reading user data
      const mockUserData: UserVerifyRequest = {
        user_id: "20251006012248",
      }
      setVerifyFormData(mockUserData)
      await handleFormVerify(mockUserData);
      
    } catch {
      toast.error("Failed to read data from NFC card", {
        id: "nfc-read",
      })
    } finally {
      toast.dismiss("nfc-read")
      setIsNfcReadDialogOpen(false)
    }

  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Nfc className="h-5 w-5 text-green-600" />
              Scan NFC Card
            </CardTitle>
            <CardDescription>Place NFC card near device to read information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNFCRead} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <CreditCard className="mr-2 h-5 w-5" />
              Start NFC Scan
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Quick Verify
            </CardTitle>
            <CardDescription>Verify user with ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-user-id">User ID</Label>
              <Input
                id="verify-user-id"
                placeholder="Enter user ID"
                value={verifyFormData.user_id}
                onChange={(e) => setVerifyFormData((prev) => ({ ...prev, user_id: e.target.value }))}
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!verifyFormData.user_id.trim() || isVerifying}
              onClick={() => handleFormVerify(verifyFormData)}
            >
              {isVerifying ? "Verifying..." : "Verify User"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {verificationResult.status && (
        <Card className={verificationResult.status === "error" ? "border-destructive" : "border-green-600"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.status === "error" ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-500">Verification Failed</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Verification Successful</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationResult.status === "error" ? (
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{verificationResult.message}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-base font-semibold">{verificationResult.userData?.user_fullname}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Birthday</p>
                      <p className="text-base font-semibold">
                        {verificationResult.userData?.user_birthday && formatDate(verificationResult.userData?.user_birthday)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="text-base font-semibold">{verificationResult.userData?.user_gender}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Country</p>
                      <p className="text-base font-semibold">{verificationResult.userData?.user_country}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <NFCReadDialog isOpen={isNfcReadDialogOpen} onOpenChange={setIsNfcReadDialogOpen} />
    </div>
  )
}
