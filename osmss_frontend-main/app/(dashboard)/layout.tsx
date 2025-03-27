"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import DashboardSidebar from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

        if (!isLoggedIn) {
          router.push("/")
          return
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        // For the preview, we'll simulate a quick loading state
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#d5d3b8]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#4c4a4a]" />
          <p className="text-[#4c4a4a] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-[#d5d3b8] ml-[318px]">{children}</main>
    </div>
  )
}

