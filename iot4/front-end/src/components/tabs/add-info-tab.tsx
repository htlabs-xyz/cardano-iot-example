"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { UserInfoRequest } from "@/types/user.type"
import { UserInfoForm } from "../forms/user-info-form"

interface AddInfoTabProps {
  formData: UserInfoRequest
  onInputChange: (field: keyof UserInfoRequest, value: string | Date) => void
  onWriteToNFC: () => void
}

export function AddInfoTab({ formData, onInputChange, onWriteToNFC }: AddInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          User Information
        </CardTitle>
        <CardDescription>Fill in complete information to write to NFC card</CardDescription>
      </CardHeader>
      <CardContent>
        <UserInfoForm formData={formData} onInputChange={onInputChange} onWriteToNFC={onWriteToNFC} />
      </CardContent>
    </Card>
  )
}
