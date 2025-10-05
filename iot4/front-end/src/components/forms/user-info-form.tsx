"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { newUserId } from "@/lib/utils"
import type { UserInfoRequest } from "@/types/user.type"
import { Calendar, Globe, Nfc, User, Users } from "lucide-react"
import { toast } from "sonner"

interface UserInfoFormProps {
  formData: UserInfoRequest
  onInputChange: (field: keyof UserInfoRequest, value: string | Date) => void
  onWriteToNFC: () => void
}

export function UserInfoForm({ formData, onInputChange, onWriteToNFC }: UserInfoFormProps) {
  const validateForm = () => {
    const requiredFields = [
      { field: "user_id", label: "User ID", value: formData.user_id.trim() },
      { field: "user_fullname", label: "Full Name", value: formData.user_fullname.trim() },
      { field: "user_birthday", label: "Date of Birth", value: formData.user_birthday ? "filled" : "" },
      { field: "user_gender", label: "Gender", value: formData.user_gender.trim() },
      { field: "user_country", label: "Country", value: formData.user_country.trim() },
    ]

    const emptyFields = requiredFields.filter(({ value }) => !value)

    if (emptyFields.length > 0) {
      toast.error(`Please fill in: ${emptyFields.map((f) => f.label).join(", ")}`)
      return false
    }

    return true
  }

  const handleClearForm = () => {
    onInputChange("user_id", newUserId())
    onInputChange("user_fullname", "")
    onInputChange("user_birthday", new Date())
    onInputChange("user_gender", "")
    onInputChange("user_country", "")
  }

  const handleWriteClick = () => {
    if (validateForm()) {
      onWriteToNFC()
    }
  }

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  const handleDateChange = (dateString: string) => {
    const date = new Date(dateString)
    onInputChange("user_birthday", date)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* User ID */}
        <div className="space-y-2 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="user_id" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User ID *
          </Label>
          <Input
            id="user_id"
            placeholder="Enter user ID"
            value={formData.user_id}
            onChange={(e) => onInputChange("user_id", e.target.value)}
          />
        </div>

        {/* Full Name */}
        <div className="space-y-2 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="user_fullname" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="user_fullname"
            placeholder="Enter full name"
            value={formData.user_fullname}
            onChange={(e) => onInputChange("user_fullname", e.target.value)}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="user_birthday" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date of Birth *
          </Label>
          <Input
            id="user_birthday"
            type="date"
            className="block"
            value={formatDateForInput(formData.user_birthday)}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className="min-w-0 space-y-2 sm:col-span-1 lg:col-span-1">
          <Label htmlFor="user_gender">Gender *</Label>
          <Select value={formData.user_gender} onValueChange={(value) => onInputChange("user_gender", value)}>
            <SelectTrigger id="user_gender" className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="min-w-0 space-y-2 sm:col-span-1 lg:col-span-1">
          <Label htmlFor="user_country" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Country *
          </Label>
          <Select value={formData.user_country} onValueChange={(value) => onInputChange("user_country", value)}>
            <SelectTrigger id="user_country" className="w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vietnam">Vietnam</SelectItem>
              <SelectItem value="usa">United States</SelectItem>
              <SelectItem value="japan">Japan</SelectItem>
              <SelectItem value="korea">South Korea</SelectItem>
              <SelectItem value="china">China</SelectItem>
              <SelectItem value="singapore">Singapore</SelectItem>
              <SelectItem value="thailand">Thailand</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClearForm} className="flex-1 bg-transparent">
          Clear
        </Button>
        <Button onClick={handleWriteClick} className="flex-1 bg-indigo-600 hover:bg-indigo-700" size="lg">
          <Nfc className="mr-2 h-5 w-5" />
          Write to NFC Card
        </Button>
      </div>
    </div>
  )
}
