"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Nfc, User, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface VerifyTabProps {
  onNFCRead: () => void
}

export function EnhancedVerifyTab({ onNFCRead }: VerifyTabProps) {
  const [manualVerifyData, setManualVerifyData] = useState("")
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

  return (
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
            Manual Input
          </CardTitle>
          <CardDescription>Enter identity information directly</CardDescription>
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
            className="w-full bg-blue-600 hover:bg-blue-700"
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
