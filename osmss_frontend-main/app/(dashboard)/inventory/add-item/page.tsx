"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
// import { addItem } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import apiService from "@/components/services/apiService"
import { stat } from "fs"
import { revalidatePath } from "next/cache"

// Define unit types
const unitTypes = [
  { value: "box", label: "Box" },
  { value: "ream", label: "Ream" },
  { value: "pack", label: "Pack" },
  { value: "bulk", label: "Bulk" },
  { value: "unit", label: "Unit" },
]

export default function AddItemPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "",
    unitType: "box", // Default unit type
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUnitTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, unitType: value }))
  }

  const handleReset = () => {
    setFormData({
      itemName: "",
      quantity: "",
      unitType: "box",
    })
  }
// api ****************************************************************************************** 
const  addItem = async (formData: FormData) =>  {
  try {
    const name = formData.get("itemName") as string
    const quantity = Number.parseInt(formData.get("quantity") as string) || 0
    const unitType = (formData.get("unitType") as string) || "box"

    // Calculate bulk and pieces based on quantity
    const bulkQuantity = Math.floor(quantity / 12) || 0
    const piecesQuantity = quantity || 0
    // Fixed thresholds
    const LOW_BULK = 2
    const LOW_PCS = 24
    const MODERATE_BULK = 5
    const MODERATE_PCS = 60
    const HIGH_BULK = 10
    const HIGH_PCS = 120

    // Determine stock status using fixed thresholds
    let stockStatus = "Moderate"
    if (bulkQuantity <= LOW_BULK || piecesQuantity <= LOW_PCS) {
      stockStatus = "Low"
    } else if (bulkQuantity >= HIGH_BULK || piecesQuantity >= HIGH_PCS) {
      stockStatus = "High"
    }
    const res = await apiService.post('create-item', {
      name:name,
      pieces:quantity,
      unit:unitType,
      status:stockStatus
    });
    // console.log(res.status);
    if(res.status != 200){
      return { success: false, error: "An unexpected erroaaar occurred" }
    };
    const itemData = res.data.item;
    // Create new item
    const newItem = {
      id: itemData.id,
      name,
      unit_type: unitType,
      bulk_quantity: bulkQuantity,
      pieces_quantity: piecesQuantity,
      low_threshold_bulk: LOW_BULK,
      low_threshold_pcs: LOW_PCS,
      moderate_threshold_bulk: MODERATE_BULK,
      moderate_threshold_pcs: MODERATE_PCS,
      high_threshold_bulk: HIGH_BULK,
      high_threshold_pcs: HIGH_PCS,
      stock_status: stockStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to mock store
    // items.push(newItem)

    // revalidatePath("/inventory/view-items")
    return { success: true, item: newItem }
  } catch (error) {
    console.error("Error adding item:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ******************************************************************************************
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })

      const result = await addItem(form)

      if (result.success) {
        toast({
          title: "Success",
          description: "Item added successfully",
        })
        router.push("/inventory/view-items")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add item",
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
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="bg-title-bg p-3">
          <h2 className="font-medium">ADD ITEM</h2>
        </div>

        <div className="bg-white mt-4 p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            <div className="space-y-1.5">
              <Label htmlFor="itemName" className="text-sm font-semibold">
                ITEM NAME <span className="text-[#b12025]">*</span>
              </Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
                placeholder="REQUIRED FIELD"
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-sm font-semibold">
                  QUANTITY <span className="text-[#b12025]">*</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  type="number"
                  required
                  placeholder="Enter quantity"
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unitType" className="text-sm font-semibold">
                  UNIT TYPE <span className="text-[#b12025]">*</span>
                </Label>
                <Select value={formData.unitType} onValueChange={handleUnitTypeChange}>
                  <SelectTrigger id="unitType" className="bg-white">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium mb-2">Item Status Information</h3>
              <p className="text-sm text-gray-700">Items are automatically assigned a status based on quantity:</p>
              <ul className="list-disc ml-5 mt-1 text-sm text-gray-700">
                <li>
                  <span className="font-medium text-red-500">Low</span>: ≤ 2 bulk or ≤ 24 pieces
                </li>
                <li>
                  <span className="font-medium text-yellow-500">Moderate</span>: 3-9 bulk or 25-119 pieces
                </li>
                <li>
                  <span className="font-medium text-green-500">High</span>: ≥ 10 bulk or ≥ 120 pieces
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" className="px-6" onClick={handleReset} disabled={isSubmitting}>
                RESET
              </Button>
              <Button type="submit" className="bg-[#b12025] hover:bg-[#b12025]/90 px-6" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ADDING...
                  </>
                ) : (
                  "ADD ITEM"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

