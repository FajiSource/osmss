"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// import { updateItemStock } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import type { Item } from "@/lib/mock-store"
import { Loader2 } from "lucide-react"
import apiService from "./services/apiService"
import { revalidatePath } from "next/cache"

interface UpdateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Item
  onSuccess?: () => void
}

export function UpdateItemDialog({ open, onOpenChange, item, onSuccess }: UpdateItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    addBulk: "",
    addPieces: "",
    releaseBulk: "",
    releasePieces: "",
    stockInReason: "",
    stockOutReason: "",
  })
  const { toast } = useToast()
  useEffect(() => {
    console.log("Item:", item);
   },[]);
  // Helper function to get the item name regardless of the column name used
  const getItemName = (item: Item): string => {
    return item.name || "Unnamed Item"
  }

  // Helper function to format unit type for display
  const formatUnitType = (unitType: string): string => {
    return unitType.charAt(0).toUpperCase() + unitType.slice(1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setFormData({
      addBulk: "",
      addPieces: "",
      releaseBulk: "",
      releasePieces: "",
      stockInReason: "",
      stockOutReason: "",
    })
  }
  const updateItemStock = async (formDatas: FormData) => {
    try{
     // console.log("Item datas:", formDatas);
      const itemId = Number.parseInt(formDatas.get("itemId") as string)
      const addBulk = Number.parseInt(formDatas.get("addBulk") as string) || 0
      const addPieces = Number.parseInt(formDatas.get("addPieces") as string) || 0
      const releaseBulk = Number.parseInt(formDatas.get("releaseBulk") as string) || 0
      const releasePieces = Number.parseInt(formDatas.get("releasePieces") as string) || 0
      const stockInReason = formDatas.get("stockInReason") as string
      const stockOutReason = formDatas.get("stockOutReason") as string
      const userId = (formDatas.get("userId") as string) || null
      console.log("Item datas:", itemId, addBulk, addPieces, releaseBulk, releasePieces, stockInReason, stockOutReason, userId);
      
      const newStock = item.pieces + addPieces - releasePieces;
      const  action = (addBulk > 0 || addPieces > 0) ? "Stock In" : "Stock Out";
      let newStockStatus = "Moderate"
      if (newStock <= 24) {
        newStockStatus = "Low"
      } else if (newStock >= 120) {
        newStockStatus = "High"
      }
      //const newBulk = item.bulk + addBulk - releaseBulk;
      const box = newStock/12;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await apiService.put(`update-item/${itemId}`, {
        pieces:newStock,
        action:action,
        status: newStockStatus,
        reason: action === "Stock In" ? stockInReason : stockOutReason,
        box: box,
        userID: user.id
      });

      if(res.status != 200){
        return { success: false, error: "An unexpected error occurred" }
      }
      // revalidatePath("/inventory/view-items");
      // revalidatePath("/item-history");

      return { success: true }
    }catch(error){
      console.log("Error updating item stock:", error);
      return { success: false, error: "An unexpected error occurred" }
    }
  };
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
    //  console.log("form data:: ",formData);
      const form = new FormData()
      form.append("itemId", item.id.toString())

      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })

      // Get current user ID from localStorage
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user.id) {
            form.append("userId", user.id)
          }
        }
      } catch (error) {
        console.error("Error getting user from localStorage:", error)
      }

      const result = await updateItemStock(form);

      if (result.success) {
        toast({
          title: "Success",
          description: "Item stock updated successfully",
        })
        handleReset()
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update item stock",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="bg-[#b12025] text-white p-4">
          <DialogTitle className="text-center text-xl font-bold">UPDATE ITEM</DialogTitle>
        </DialogHeader>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">ITEM NAME</Label>
                <span className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                  {getItemName(item)}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">UNIT TYPE</Label>
                <span className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                  {formatUnitType(item.unit || "box")}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">STOCK STATUS</Label>
              <Input value={item.status} readOnly className="bg-gray-100 text-gray-700 cursor-not-allowed" />
              <p className="text-xs text-gray-500 mt-1">
                Status is automatically calculated based on fixed thresholds:
                <span className="block mt-1">
                  <span className="inline-block px-1.5 py-0.5 bg-red-500 text-white rounded text-xs mr-1">Low</span> ≤ 2
                  bulk/24 pcs,
                  <span className="inline-block px-1.5 py-0.5 bg-yellow-500 text-white rounded text-xs mx-1">
                    Moderate
                  </span>{" "}
                  3-9 bulk/25-119 pcs,
                  <span className="inline-block px-1.5 py-0.5 bg-green-500 text-white rounded text-xs ml-1">High</span>{" "}
                  ≥ 10 bulk/120 pcs
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">QUANTITY TO BE ADDED</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    name="addBulk"
                    value={formData.addBulk}
                    onChange={handleChange}
                    className="bg-white"
                    placeholder={`No. in ${formatUnitType(item.unit || "box")}`}
                  />
                  <Input
                    type="number"
                    name="addPieces"
                    value={formData.addPieces}
                    onChange={handleChange}
                    className="bg-white"
                    placeholder="No. in pcs."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">QUANTITY TO BE RELEASED</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    name="releaseBulk"
                    value={formData.releaseBulk}
                    onChange={handleChange}
                    className="bg-white"
                    placeholder={`No. in ${formatUnitType(item.unit || "box")}`}
                  />
                  <Input
                    type="number"
                    name="releasePieces"
                    value={formData.releasePieces}
                    onChange={handleChange}
                    className="bg-white"
                    placeholder="No. in pcs."
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="grid grid-cols-[140px_1fr]">
                <div className="flex items-center bg-gray-50 border-b">
                  <Label className="p-3 font-semibold">STOCK IN</Label>
                </div>
                <div className="p-3 border-b">
                  <Input
                    name="stockInReason"
                    value={formData.stockInReason}
                    onChange={handleChange}
                    placeholder="STATE REASON"
                    className="border-0 px-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <div className="flex items-center bg-gray-50">
                  <Label className="p-3 font-semibold">STOCK OUT</Label>
                </div>
                <div className="p-3">
                  <Input
                    name="stockOutReason"
                    value={formData.stockOutReason}
                    onChange={handleChange}
                    placeholder="STATE REASON"
                    className="border-0 px-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleReset()
                  onOpenChange(false)
                }}
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
                  "OK"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

