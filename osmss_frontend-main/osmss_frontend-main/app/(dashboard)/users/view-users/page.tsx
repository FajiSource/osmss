"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UpdateUserDialog } from "@/components/update-user-dialog"
import { Loader2, Search } from "lucide-react"
import { getUsers } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import apiService from "@/components/services/apiService"

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

export default function ViewUsersPage() {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const get_users = async () => {
        try{
          const res = await apiService.get('/users');
          if(res.status != 200){
            return { success: false, error: "An unexpected error occurred" }
          }
          console.log("Users loaded successfully:", res.data.users);
          return res.data.users;
        }catch(error){
          console.log("Error getting users:", error);
          return { success: false, error: "An unexpected error occurred" }
        }
      }
      const loadedUsers = await get_users();

      // Format users to ensure consistent property names
      const formattedUsers = loadedUsers.map((user) => ({
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        username: user.username,
        roles: user.roles || [],
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
      }))

      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
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

  useEffect(() => {
    loadUsers()
  }, [toast])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">USER LIST</h2>
        </div>

        <div className="bg-white mt-4 p-4">
          <div className="flex mb-4">
            <div className="relative flex-grow max-w-md">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border border-black">
                    <th className="border border-black p-3 text-left">#</th>
                    <th className="border border-black p-3 text-left">FIRST NAME</th>
                    <th className="border border-black p-3 text-left">LAST NAME</th>
                    <th className="border border-black p-3 text-left">USERNAME</th>
                    <th className="border border-black p-3 text-left">CREATED AT</th>
                    <th className="border border-black p-3 text-left">UPDATED AT</th>
                    <th className="border border-black p-3 text-left">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers?.map((user) => (
                      <tr key={user.id} className="border border-black">
                        <td className="border border-black p-3">user {user.id}</td>
                        <td className="border border-black p-3">{user.firstName}</td>
                        <td className="border border-black p-3">{user.lastName}</td>
                        <td className="border border-black p-3">{user.username}</td>
                        <td className="border border-black p-3">{user.createdAt}</td>
                        <td className="border border-black p-3">{user.updatedAt}</td>
                        <td className="border border-black p-3">
                          <Button
                            className="bg-[#b12025] hover:bg-[#b12025]/90 text-white text-xs rounded-none px-4 py-1 h-auto"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsUpdateOpen(true)
                            }}
                          >
                            UPDATE
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="border border-black p-4 text-center">
                        {searchTerm ? "No users found matching your search" : "No users available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UpdateUserDialog
          open={isUpdateOpen}
          onOpenChange={setIsUpdateOpen}
          user={selectedUser}
          onSuccess={loadUsers}
        />
      )}
    </div>
  )
}

