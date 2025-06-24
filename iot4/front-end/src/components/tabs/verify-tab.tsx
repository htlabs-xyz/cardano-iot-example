"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Nfc, User, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { UserVerifyRequest } from "@/types/user.type"

interface VerifyTabProps {
  onNFCRead: () => void
}

export function VerifyTab({ onNFCRead }: VerifyTabProps) {
  const [manualVerifyData, setManualVerifyData] = useState("")
  const [verifyFormData, setVerifyFormData] = useState<UserVerifyRequest>({
    user_id: "",
    user_fullname: "",
  })
  const [isVerifying, setIsVerifying] = useState(false)

  const handleManualVerify = async () => {
    if (!manualVerifyData.trim()) {
      toast.error("Please enter identity information to verify")
      return
    }

    setIsVerifying(true)
    toast.loading("Verifying identity information...", {
      id: "manual-verify",
    })

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false)
      const isValid = Math.random() > 0.3 // 70% success rate for demo

      if (isValid) {
        toast.success("Identity verified successfully!", {
          id: "manual-verify",
          description: "The provided information is valid",
          icon: <CheckCircle className="h-4 w-4" />,
        })
      } else {
        toast.error("Identity verification failed", {
          id: "manual-verify",
          description: "The provided information could not be verified",
        })
      }
    }, 2000)
  }

  const handleFormVerify = async () => {
    if (!verifyFormData.user_id.trim() || !verifyFormData.user_fullname.trim()) {
      toast.error("Please fill in both User ID and Full Name")
      return
    }

    setIsVerifying(true)
    toast.loading("Verifying user identity...", {
      id: "form-verify",
    })

    // Simulate API call to verify user
    setTimeout(() => {
      setIsVerifying(false)
      const isValid = Math.random() > 0.2 // 80% success rate for demo

      if (isValid) {
        toast.success("User identity verified successfully!", {
          id: "form-verify",
          description: `${verifyFormData.user_fullname} (ID: ${verifyFormData.user_id}) is verified`,
          icon: <CheckCircle className="h-4 w-4" />,
        })
      } else {
        toast.error("User verification failed", {
          id: "form-verify",
          description: "User not found or information mismatch",
        })
      }
    }, 2000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Nfc className="h-5 w-5 text-green-600" />
            Scan NFC Card
          </CardTitle>
          <CardDescription>Place NFC card near device to read information</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onNFCRead} className="w-full bg-green-600 hover:bg-green-700" size="lg">
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
          <CardDescription>Verify user with ID and name</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="verify-fullname">Full Name</Label>
            <Input
              id="verify-fullname"
              placeholder="Enter full name"
              value={verifyFormData.user_fullname}
              onChange={(e) => setVerifyFormData((prev) => ({ ...prev, user_fullname: e.target.value }))}
            />
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!verifyFormData.user_id.trim() || !verifyFormData.user_fullname.trim() || isVerifying}
            onClick={handleFormVerify}
          >
            {isVerifying ? "Verifying..." : "Verify User"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-purple-600" />
            Manual Input
          </CardTitle>
          <CardDescription>Enter raw identity data to verify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="manual-verify">Identity information</Label>
            <Textarea
              id="manual-verify"
              placeholder="Enter identity information to verify..."
              value={manualVerifyData}
              onChange={(e) => setManualVerifyData(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!manualVerifyData.trim() || isVerifying}
            onClick={handleManualVerify}
          >
            {isVerifying ? "Verifying..." : "Verify Information"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
