"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"
// import { getItemHistory } from "@/lib/actions"
import type { ItemHistory } from "@/lib/mock-store"
import { useToast } from "@/components/ui/use-toast"
import apiService from "@/components/services/apiService"

export default function ItemHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockInFilter, setStockInFilter] = useState(false)
  const [stockOutFilter, setStockOutFilter] = useState(false)
  const [historyData, setHistoryData] = useState<ItemHistory[]>([])
  const [filteredData, setFilteredData] = useState<ItemHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const getItemHistory = async () =>  {
    try{
      const res = await apiService.get('/supply-histories');

      if(res.status != 200){
        return { success: false, error: "An unexpected error occurred" }
      }
     
      return res.data.supplyHistories;
    }catch(error){
      console.log("Error getting Supply Histories:", error);
      return { success: false, error: "An unexpected error occurred" }
    }
  }


  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true)
        const data = await getItemHistory();
        console.log("Supply Histories loaded successfully:", data);
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to load history:", error)
        toast({
          title: "Error loading history",
          description: "There was a problem loading the item history. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [toast])

  useEffect(() => {
    const filtered = historyData.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const actionMatch =
        (!stockInFilter && !stockOutFilter) ||
        (stockInFilter && item.action === "Stock In") ||
        (stockOutFilter && item.action === "Stock Out")
      return nameMatch && actionMatch
    })
    setFilteredData(filtered)
  }, [searchTerm, stockInFilter, stockOutFilter, historyData])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">ITEM HISTORY</h2>
        </div>

        <div className="bg-white mt-4 p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stock-in"
                  checked={stockInFilter}
                  onCheckedChange={(checked) => setStockInFilter(checked as boolean)}
                />
                <Label htmlFor="stock-in">Stock In</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stock-out"
                  checked={stockOutFilter}
                  onCheckedChange={(checked) => setStockOutFilter(checked as boolean)}
                />
                <Label htmlFor="stock-out">Stock Out</Label>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#b12025]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[5%]">#</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[20%]">ITEM NAME</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[10%]">QUANTITY</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[15%]">NAME OF THE RELEASER</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[15%]">DATE</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[25%]">REASON</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold w-[10%]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <tr key={record.id} className={record.action === "Stock Out" ? "bg-yellow-100" : "bg-green-100"}>
                        <td className="border border-gray-300 p-2">{record.id}</td>
                        <td className="border border-gray-300 p-2">{record.name}</td>
                        <td className="border border-gray-300 p-2">
                          {record.action === "Stock Out" ? `(${record.pieces})` : record.pieces}
                        </td>
                        <td className="border border-gray-300 p-2">{record.releaser}</td>
                        <td className="border border-gray-300 p-2">{new Date(record.created_at).toLocaleString()}</td>
                        <td className="border border-gray-300 p-2 whitespace-pre-line text-xs leading-tight">
                          {record.reason || ""}
                        </td>
                        <td className="border border-gray-300 p-2">{record.action}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="border border-gray-300 p-4 text-center">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

