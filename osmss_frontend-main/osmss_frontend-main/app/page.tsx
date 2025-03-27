"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { GoogleLogin } from '@react-oauth/google';
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRScanner } from "@/components/qr-scanner"
import { useAuth } from "@/hooks/use-auth"
import { mockUsers } from "@/lib/mock-data"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ username: "", password: "" })
  const [activeTab, setActiveTab] = useState("credentials")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const qrScannerKey = useRef(0)
  const router = useRouter()
  const { toast } = useToast()
  const { login, isAuthenticated } = useAuth()
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // Handle tab change with a clean approach
  useEffect(() => {
    // When switching to QR tab, wait a bit before showing scanner
    if (activeTab === "qrcode") {
      // First hide any existing scanner
      setShowQRScanner(false)

      // Increment the key to force a complete remount
      qrScannerKey.current += 1

      // Then after a delay, show a fresh scanner
      const timer = setTimeout(() => {
        setShowQRScanner(true)
      }, 500) // Increased delay to ensure cleanup

      return () => clearTimeout(timer)
    } else {
      // Immediately hide scanner when switching away
      setShowQRScanner(false)
    }
  }, [activeTab])

  const validateForm = () => {
    const newErrors = { username: "", password: "" }
    let isValid = true

    if (!username.trim()) {
      newErrors.username = "Username is required"
      isValid = false
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await login(username, password)

      if (result.success) {
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid username or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQRCodeScan = async (data: string) => {
    setIsLoading(true)

    try {
      // Find user by QR token directly from mock data
      const user = mockUsers.find((u) => u.qr_token === data)

      if (!user) {
        toast({
          title: "QR Login failed",
          description: "Invalid QR code",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create a copy of the user without the password
      const { password: _, ...userData } = user

      // Store login state in localStorage for persistence
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "QR Login successful",
        description: "Redirecting to dashboard...",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error("QR Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }
//   const handleLoginSuccess = async (response) => {
//     const { code } = response;
//     try {
//         const result = await fetch('http://127.0.0.1:8000/api/api/callback', {
//             method: 'POST',
//             body: JSON.stringify({ code }),
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         const data = await result.json();
//         console.log('Login successful:', data);
//     } catch (error) {
//         console.error('Error during Google login:', error);
//     }
// };

// const handleLoginFailure = (error) => {
//     console.error('Login Failed:', error);
// };
  return (
    <div
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{
        backgroundColor: "#e0dbc7", // Matching the beige background from the image
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[#e0dbc7] opacity-80"></div>

      {/* Content */}
      <div className="z-10 w-full max-w-7xl px-4 py-8 flex justify-between">
        {/* Left logo */}
        <div className="w-24 h-24 relative">
          <img
            src="/images/college-science-emblem.png"
            alt="College of Science Emblem"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right logo */}
        <div className="w-24 h-24 relative">
          <img
            src="/images/university-seal.png"
            alt="University of Santo Tomas Seal"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="z-10 flex-grow flex flex-col items-center justify-center w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-16 text-center">
          OFFICE SUPPLIES STOCK MONITORING
        </h1>

        <div className="w-full max-w-md bg-[#4c4a4a] rounded-lg p-8 text-white">
          <Tabs defaultValue="credentials" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials">
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label htmlFor="username" className="block text-xl font-medium mb-2">
                    USERNAME<span className="text-white">*</span>
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="REQUIRED FIELD"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white text-black h-12"
                    aria-invalid={!!errors.username}
                    data-testid="username-input"
                    disabled={isLoading}
                  />
                  {errors.username && <p className="mt-1 text-sm text-yellow-300">{errors.username}</p>}
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-xl font-medium mb-2">
                    PASSWORD<span className="text-white">*</span>
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="REQUIRED FIELD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white text-black h-12"
                    aria-invalid={!!errors.password}
                    data-testid="password-input"
                    disabled={isLoading}
                  />
                  {errors.password && <p className="mt-1 text-sm text-yellow-300">{errors.password}</p>}
                </div>

                <div className="text-center mb-6">
                  <a href="#" className="text-white hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#b12025] hover:bg-[#8a1a1f] text-white border-2 border-[#8a1a1f]"
                  disabled={isLoading}
                  data-testid="login-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      LOGGING IN...
                    </>
                  ) : (
                    "LOG IN"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="qrcode">
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-medium mb-2">Scan Your QR Code</h3>
                  <p className="text-sm text-gray-300">Position your QR code in front of the camera to log in</p>
                </div>

                {/* Only render QR scanner when showQRScanner is true */}
                {showQRScanner && (
                  <div key={qrScannerKey.current}>
                    <QRScanner onScan={handleQRCodeScan} />
                  </div>
                )}

                {isLoading && (
                  <div className="mt-4 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Authenticating...</span>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          {/* <div>
              <h2>Google Login</h2>
              <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFailure} />
            </div> */}
          {/* Testing helper - visible in all environments for the preview
          <div className="mt-8 p-4 border border-dashed border-white rounded">
            <h3 className="text-sm font-bold mb-2">Test Credentials:</h3>
            <ul className="text-xs space-y-1">
              <li>Username: johndoe | Password: password</li>
              <li>Username: janesmith | Password: password</li>
              <li>QR Code Token: qr-token-johndoe-123456</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  )
}

