"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin } from '@react-oauth/google';
// import { signIn } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import apiService from "@/components/services/apiService"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const signIn = async (formData: FormData) => {
    try {
      // console.log("user:: ");
      const username = formData.get("username") as string
      const password = formData.get("password") as string

      const res = await apiService.post('/login', {
        username: username,
        password: password
      });

      if (res.status != 200) {
        return { success: false, error: res.data.message };
      }
      // Find user by username and password
      const user = res.data.user;
      const token = res.data.token;

      if (!user) {
        return { success: false, error: "Invalid username or password" }
      }
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      return {
        success: true,
        user,
      }
    } catch (error) {
      console.error("Error during sign in:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  };
  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      alert("submitting");
      const result = await signIn(formData)
      console.log("result:: ", result);
      if (!result.success) {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleLoginSuccess = async (response: any) => {
    const { code } = response;


    try {
      const result = await fetch('http://your-laravel-app.com/api/google/callback', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await result.json();
      console.log('Login successful:', data);
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleLoginFailure = (error: any) => {
    console.error('Login Failed:', error);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <form action={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <div className="mb-4">
            <Label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </Label>
            <Input
              type="text"
              id="username"
              name="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Username"
              required
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="******************"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="bg-[#b12025] hover:bg-[#b12025]/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          
          </div>
        </form>
      </div>
    </div>
  )
}

