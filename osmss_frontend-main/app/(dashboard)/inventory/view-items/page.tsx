"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UpdateItemDialog } from "@/components/update-item-dialog"
// import { getItems } from "@/lib/actions"
import type { Item } from "@/lib/mock-store"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import apiService from "@/components/services/apiService"

export default function ViewItemsPage() {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState(0);
  const [searchTerm, setSearchTerm] = useState("")
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        const roles = JSON.parse(user.role);
        console.log(roles.length)
        if(roles.length === 2){
          setUserRole(3)
         
        }else if(roles[0] === "add-product"){
          setUserRole(1)
         
        }else if(roles[0] === "edit-stock"){
          setUserRole(2)
         
        }else{
          setUserRole(0)
          
        }

       
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
    }
  }, [])
  const getItems = async function () {
    try{
      const res = await apiService.get('/items');
      if(res.status != 200){
        return { success: false, error: "An unexpected error occurred" }
      }
      return res.data.supplies;
    }catch(error){
      console.log("Error getting items:", error);
      return { success: false, error: "An unexpected error occurred" }
    }
  }
  const loadItems = async () => {
    try {
      setIsLoading(true)
      const data = await getItems()
      setItems(data)
      setFilteredItems(data)
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    // Filter items based on search term
    const filtered = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredItems(filtered)
  }, [items, searchTerm])

  // Helper function to get the item name regardless of the column name used
  const getItemName = (item: Item): string => {
    return item.name || "Unnamed Item"
  }

  // Helper function to format unit type for display
  const formatUnitType = (unitType: string): string => {
    return unitType.charAt(0).toUpperCase() + unitType.slice(1)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">OFFICE SUPPLIES LIST</h2>
        </div>

        <div className="bg-white mt-4 p-4">
          <div className="flex mb-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium mb-2">Item Status Information</h3>
            <p className="text-sm text-gray-700">All items use fixed thresholds:</p>
            <ul className="list-disc ml-5 mt-1 text-sm text-gray-700">
              <li>
                <span className="inline-block px-2 py-0.5 bg-red-500 text-white rounded text-xs">Low</span>: ≤ 2 bulk or
                ≤ 24 pieces
              </li>
              <li>
                <span className="inline-block px-2 py-0.5 bg-yellow-500 text-white rounded text-xs">Moderate</span>: 3-9
                bulk or 25-119 pieces
              </li>
              <li>
                <span className="inline-block px-2 py-0.5 bg-green-500 text-white rounded text-xs">High</span>: ≥ 10
                bulk or ≥ 120 pieces
              </li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#b12025]" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-semibold w-[5%]">#</th>
                    <th className="p-3 text-left font-semibold w-[20%]">Items</th>
                    <th className="p-3 text-left font-semibold w-[10%]">Unit Type</th>
                    <th className="p-3 text-left font-semibold w-[10%]">Bulk</th>
                    <th className="p-3 text-left font-semibold w-[10%]">Pieces</th>
                    <th className="p-3 text-left font-semibold w-[15%]">Updated at</th>
                    <th className="p-3 text-left font-semibold w-[15%]">Stock Status</th>
                    <th className="p-3 text-left font-semibold w-[15%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-3">{item.id}</td>
                        <td className="p-3">{getItemName(item)}</td>
                        <td className="p-3">{formatUnitType(item.unit_type || "box")}</td>
                        <td className="p-3">{(item.pieces / 12)}</td>
                        <td className="p-3">{item.pieces}</td>
                        <td className="p-3">{new Date(item.updated_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-white ${
                              item.status === "Low"
                                ? "bg-red-500"
                                : item.status === "Moderate"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button
                            disabled={userRole != 0 && userRole != 3 && userRole != 2}
                            className="bg-[#b12025] hover:bg-[#b12025]/90 text-white text-xs rounded-none px-4 py-1 h-auto"
                            onClick={() => {
                              setSelectedItem(item)
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
                      <td colSpan={8} className="p-4 text-center">
                        {searchTerm ? "No items found matching your search" : "No items available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedItem && (
        <UpdateItemDialog
          open={isUpdateOpen}
          onOpenChange={setIsUpdateOpen}
          item={selectedItem}
          onSuccess={loadItems}
        />
      )}
    </div>
  )
}

