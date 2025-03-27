"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { updateUser } from "@/lib/actions"
import { Loader2 } from "lucide-react"

interface User {
  id: string | number
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  username: string
  password?: string
  roles: string[]
  createdAt?: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

interface UpdateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSuccess?: () => void
}

export function UpdateUserDialog({ open, onOpenChange, user, onSuccess }: UpdateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName || user.first_name || "",
    lastName: user.lastName || user.last_name || "",
    username: user.username || "",
  })
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(user.roles || []))
  const { toast } = useToast()

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      firstName: user.firstName || user.first_name || "",
      lastName: user.lastName || user.last_name || "",
      username: user.username || "",
    })
    setSelectedRoles(new Set(user.roles || []))
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleToggle = (roleId: string) => {
    const newRoles = new Set(selectedRoles)
    if (newRoles.has(roleId)) {
      newRoles.delete(roleId)
    } else {
      newRoles.add(roleId)
    }
    setSelectedRoles(newRoles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = new FormData()
      form.append("userId", user.id.toString())

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })

      // Add selected roles
      selectedRoles.forEach((role) => {
        form.append("roles", role)
      })

      const result = await updateUser(form)

      if (result.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error("Error updating user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="bg-[#b12025] text-white p-4">
          <DialogTitle className="text-center text-xl font-bold">UPDATE USER</DialogTitle>
        </DialogHeader>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">FIRST NAME</Label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">LAST NAME</Label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} className="bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">USERNAME</Label>
              <Input name="username" value={formData.username} onChange={handleChange} className="bg-white" />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold">ROLES</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-black">
                  <div className="p-3 font-semibold bg-gray-100 border-b">INVENTORY</div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="add-product"
                        checked={selectedRoles.has("add-product")}
                        onCheckedChange={() => handleRoleToggle("add-product")}
                      />
                      <label htmlFor="add-product">Add Product</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-stock"
                        checked={selectedRoles.has("edit-stock")}
                        onCheckedChange={() => handleRoleToggle("edit-stock")}
                      />
                      <label htmlFor="edit-stock">Edit stock</label>
                    </div>
                  </div>
                </div>

                <div className="border border-black">
                  <div className="p-3 font-semibold bg-gray-100 border-b">REPORTS</div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export"
                        checked={selectedRoles.has("export")}
                        onCheckedChange={() => handleRoleToggle("export")}
                      />
                      <label htmlFor="export">Export</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#b12025] hover:bg-[#b12025]/90 px-6" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

