"use client"

import type React from "react"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { addUser } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import apiService from "@/components/services/apiService"

interface RoleGroup {
  name: string
  roles: {
    id: string
    label: string
  }[]
}

const roleGroups: RoleGroup[] = [
  {
    name: "INVENTORY",
    roles: [
      { id: "add-product", label: "Add Product" },
      { id: "edit-stock", label: "Edit stock" },
    ],
  },
  {
    name: "REPORTS",
    roles: [{ id: "export", label: "Export" }],
  },
]

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  })
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleToggle = (roleId: string) => {
    const newSelectedRoles = new Set(selectedRoles)
    if (newSelectedRoles.has(roleId)) {
      newSelectedRoles.delete(roleId)
    } else {
      newSelectedRoles.add(roleId)
    }
    setSelectedRoles(newSelectedRoles)
  }


  const addUser =  async (formData: FormData) => {
    try {
      const firstname = formData.get("firstname") as string
      alert(firstname)
      const lastname = formData.get("lastname") as string
      const username = formData.get("username") as string
      const password = formData.get("password") as string
      const roles = formData.getAll("roles") as string[]
      console.log(firstname, lastname, username, password, roles);
      const res = await apiService.post('/add-user', {
        firstname,
        lastname,
        username,
        password,
        role:JSON.stringify(roles)
      });
      if(res.status != 200){
        return { success: false, error: "An unexpected errsor occurred" }
      }
      const userData = res.data.user;
      // // Check if username already exists
      // if (users.some((user) => user.username === username)) {
      //   return { success: false, error: "Username already exists" }
      // }
  
      // Create new user
      const qrToken = `qr-token-${username}-${uuidv4().substring(0, 6)}`
      
      const newUser = {
        id: userData.id,
        first_name: firstname,
        last_name: lastname,
        username: username,
        password: userData.password, // In a real app, this would be hashed
        roles: roles,
        qr_token: qrToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
  
      // // Add to mock store
      // users.push(newUser)
  
      revalidatePath("/users/view-users")
      return { success: true, user: newUser }
    } catch (error) {
      console.log("Error creating user:", error)
      return { success: false, error: error.error }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = new FormData()
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
        // console.log("key", key);
      })

      // Add selected roles
      selectedRoles.forEach((role) => {
        form.append("roles", role)
      })
      // console.log("form", form.firstname);
      const result = await addUser(form);

      if (result.success) {
        toast({
          title: "Success",
          description: "User added successfully",
        })
        router.push("/users/view-users")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error("Error creating user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      password: "",
    })
    setSelectedRoles(new Set())
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">ADD USER</h2>
        </div>

        <div className="bg-white mt-4 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    FIRST NAME <span className="text-[#b12025]">*</span>
                  </Label>
                  <Input
                    required
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="Enter First Name"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    LAST NAME <span className="text-[#b12025]">*</span>
                  </Label>
                  <Input
                    required
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Enter Last Name"
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    USERNAME <span className="text-[#b12025]">*</span>
                  </Label>
                  <Input
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter Username"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    DEFAULT PASSWORD <span className="text-[#b12025]">*</span>
                  </Label>
                  <Input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Default Password"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Roles Section */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">
                SELECT ROLES <span className="text-[#b12025]">*</span>
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roleGroups.map((group) => (
                  <div key={group.name} className="border border-black">
                    <div className="p-3 font-semibold bg-gray-100 border-b">{group.name}</div>
                    <div className="p-4 space-y-3">
                      {group.roles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={role.id}
                            checked={selectedRoles.has(role.id)}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                          />
                          <label
                            htmlFor={role.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleReset} className="px-6" disabled={isSubmitting}>
                Reset
              </Button>
              <Button type="submit" className="bg-[#b12025] hover:bg-[#b12025]/90 px-6" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

