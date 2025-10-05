"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shield } from "lucide-react"

import { AddInfoTab } from "@/components/tabs/add-info-tab"
import { VerifyTab } from "@/components/tabs/verify-tab"

export default function NFCIdentitySystem() {
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
                <VerifyTab />
              </TabsContent>

              <TabsContent value="add" className="space-y-6">
                <AddInfoTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
