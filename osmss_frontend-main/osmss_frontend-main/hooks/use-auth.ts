"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { mockUsers } from "@/lib/mock-data"
import apiService from "@/components/services/apiService"

interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  roles: string[]
  [key: string]: any
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication status on mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check localStorage for cached user
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      const userStr = localStorage.getItem("user")

      if (isLoggedIn && userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      // Find user by username and password directly from mock data
      const res = await apiService.post('/login',{
        username:username,
        password:password
      });

      if(res.status != 200){
        return { success: false, error: res.data.message };
      }
      // Find user by username and password
      const user = res.data.user;
      const token = res.data.token;

      if (!user) {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        })
        return { success: false, error: "Invalid username or password" }
      }

      // Create a copy of the user without the password
      const { password: _, ...userData } = user

      // Store login state
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", token);

      // Update state
      setUser(userData as User)
      setIsAuthenticated(true)

      // Show success message
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return { success: false, error: "Unexpected error" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear authentication data
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")

      // Update state
      setUser(null)
      setIsAuthenticated(false)

      // Show success message
      toast({
        title: "Logged out successfully",
        description: "Redirecting to login page...",
      })

      // Redirect to login page
      router.push("/")

      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout error",
        description: "An error occurred during logout",
        variant: "destructive",
      })
      return { success: false, error: "Logout failed" }
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
}

