"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2, RefreshCw, Download } from "lucide-react"
import { QRCode } from "@/components/qr-code"
import { getUsers, regenerateUserQRCode } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  first_name: string
  last_name: string
  username: string
  qr_token: string
}

export default function ManageQRCodesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [regeneratingQR, setRegeneratingQR] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load users
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const loadedUsers = await getUsers()
        setUsers(loadedUsers as User[])
      } catch (error) {
        console.error("Error loading users:", error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [toast])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const handleRegenerateQR = async (userId: string) => {
    setRegeneratingQR(userId)

    try {
      const result = await regenerateUserQRCode(userId)

      if (result.success) {
        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                qr_token: result.qrToken || user.qr_token,
              }
            }
            return user
          }),
        )

        toast({
          title: "Success",
          description: "QR code regenerated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to regenerate QR code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error regenerating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate QR code",
        variant: "destructive",
      })
    } finally {
      setRegeneratingQR(null)
    }
  }

  const handleDownloadQR = (user: User) => {
    // Create a canvas element
    const canvas = document.createElement("canvas")
    const qrCodeSvg = document.getElementById(`qr-code-${user.id}`)?.querySelector("svg")

    if (!qrCodeSvg) {
      toast({
        title: "Error",
        description: "Could not find QR code to download",
        variant: "destructive",
      })
      return
    }

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(qrCodeSvg)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    // Create download link
    const link = document.createElement("a")
    link.href = url
    link.download = `qr-code-${user.username}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">MANAGE USER QR CODES</h2>
        </div>

        <div className="bg-white mt-4 p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#b12025]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 flex flex-col items-center">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-gray-500">{user.username}</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <div id={`qr-code-${user.id}`}>
                      <QRCode value={user.qr_token} size={180} />
                    </div>
                  </div>

                  <div className="w-full">
                    <Label className="text-xs text-gray-500 mb-1 block">QR Token</Label>
                    <div className="flex">
                      <Input value={user.qr_token} readOnly className="text-xs bg-gray-50" />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleRegenerateQR(user.id)}
                        disabled={regeneratingQR === user.id}
                      >
                        {regeneratingQR === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="icon" className="ml-2" onClick={() => handleDownloadQR(user)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="col-span-full text-center p-8 text-gray-500">
                  No users found matching your search criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

