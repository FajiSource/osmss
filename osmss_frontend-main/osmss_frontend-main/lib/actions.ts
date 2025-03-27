"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { mockItems, mockItemHistory, mockUsers } from "./mock-data"
import apiService from "@/components/services/apiService"

// MOCK DATA STORE
// This will simulate a database in memory during the session
const items = [...mockItems]
const itemHistory = [...mockItemHistory]
const users = [...mockUsers]

// INVENTORY ACTIONS
export async function getItems() {
  return items;
}

export async function getItem(id: number) {
  return items.find((item) => item.id === id) || null
}

export async function addItem(formData: FormData) {
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

    // Create new item
    const newItem = {
      id: items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1,
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
    items.push(newItem)

    revalidatePath("/inventory/view-items")
    return { success: true, item: newItem }
  } catch (error) {
    console.error("Error adding item:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateItemStock(formData: FormData) {
  try {
    const itemId = Number.parseInt(formData.get("itemId") as string)
    const addBulk = Number.parseInt(formData.get("addBulk") as string) || 0
    const addPieces = Number.parseInt(formData.get("addPieces") as string) || 0
    const releaseBulk = Number.parseInt(formData.get("releaseBulk") as string) || 0
    const releasePieces = Number.parseInt(formData.get("releasePieces") as string) || 0
    const stockInReason = formData.get("stockInReason") as string
    const stockOutReason = formData.get("stockOutReason") as string
    const userId = (formData.get("userId") as string) || null

    const res = await apiService.put(`update-item/${formData.get("id")}`, {
      pieces:formData.get("pieces"),
      action:formData.get("action"),
      reason:formData.get("reason"),
      releaser:formData.get("releaser"),
    });
    
    // Get the current item
    const itemIndex = items.findIndex((item) => item.id === itemId)
    if (itemIndex === -1) {
      return { success: false, error: "Item not found" }
    }

    const item = items[itemIndex]

    // Calculate new quantities
    let newBulkQuantity = item.bulk_quantity
    let newPiecesQuantity = item.pieces_quantity
    let updated = false

    // Process stock in
    if (addBulk > 0 || addPieces > 0) {
      newBulkQuantity += addBulk
      newPiecesQuantity += addPieces
      updated = true

      // Add history record for stock in
      const historyEntry = {
        id: itemHistory.length > 0 ? Math.max(...itemHistory.map((h) => h.id)) + 1 : 1,
        item_id: itemId,
        quantity: addBulk > 0 ? addBulk : addPieces,
        is_bulk: addBulk > 0,
        action: "Stock In",
        reason: stockInReason,
        user_id: userId,
        created_at: new Date().toISOString(),
        item_name: item.name,
        releaser_name: userId
          ? users.find((u) => u.id === userId)?.first_name + " " + users.find((u) => u.id === userId)?.last_name
          : null,
      }

     // itemHistory.push(historyEntry)
    }

    // Process stock out
    if (releaseBulk > 0 || releasePieces > 0) {
      // Check if we have enough stock
      if (releaseBulk > item.bulk_quantity || releasePieces > item.pieces_quantity) {
        return { success: false, error: "Not enough stock available" }
      }

      newBulkQuantity -= releaseBulk
      newPiecesQuantity -= releasePieces
      updated = true

      // Add history record for stock out
      const historyEntry = {
        id: itemHistory.length > 0 ? Math.max(...itemHistory.map((h) => h.id)) + 1 : 1,
        item_id: itemId,
        quantity: releaseBulk > 0 ? releaseBulk : releasePieces,
        is_bulk: releaseBulk > 0,
        action: "Stock Out",
        reason: stockOutReason,
        user_id: userId,
        created_at: new Date().toISOString(),
        item_name: item.name,
        releaser_name: userId
          ? users.find((u) => u.id === userId)?.first_name + " " + users.find((u) => u.id === userId)?.last_name
          : null,
      }

     // itemHistory.push(historyEntry)
    }

    if (!updated) {
      return { success: false, error: "No changes made" }
    }

    // Determine new stock status
    let newStockStatus = "Moderate"
    if (newBulkQuantity <= item.low_threshold_bulk || newPiecesQuantity <= item.low_threshold_pcs) {
      newStockStatus = "Low"
    } else if (newBulkQuantity >= item.high_threshold_bulk || newPiecesQuantity >= item.high_threshold_pcs) {
      newStockStatus = "High"
    }

    // Update the item
    const updatedItem = {
      ...item,
      bulk_quantity: newBulkQuantity,
      pieces_quantity: newPiecesQuantity,
      stock_status: newStockStatus,
      updated_at: new Date().toISOString(),
    }

    items[itemIndex] = updatedItem

    revalidatePath("/inventory/view-items")
    revalidatePath("/item-history")
    return { success: true, item: updatedItem }
  } catch (error) {
    console.error("Error updating item stock:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// ITEM HISTORY ACTIONS
export async function getItemHistory() {
  return itemHistory
}

// USER ACTIONS
export async function getUsers() {
  try{
    console.log("apiService");
    const res = await apiService.get('/users');
    if(res.status != 200){
      return { success: false, error: "An unexpected error occurred" }
    }
    return res.data.users;
  }catch(error){
    console.log("Error getting users:", error);
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function addUser(formData: FormData) {
  try {
    alert("hahahaha");
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const roles = formData.getAll("roles") as string[]
    console.log(firstName, lastName, username, password, roles);
    const res = await apiService.post('/add-user', {
      firstName,
      lastName,
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
      first_name: firstName,
      last_name: lastName,
      username: username,
      password: userData.password, // In a real app, this would be hashed
      roles: roles,
      qr_token: qrToken,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to mock store
    users.push(newUser)

    revalidatePath("/users/view-users")
    return { success: true, user: newUser }
  } catch (error) {
    console.log("Error creating user:", error)
    return { success: false, error: error.error }
  }
}

export async function updateUser(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const username = formData.get("username") as string
    const roles = formData.getAll("roles") as string[]

    // Check if username already exists for a different user
    if (users.some((user) => user.username === username && user.id !== userId)) {
      return { success: false, error: "Username already exists" }
    }

    // Find user
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex === -1) {
      return { success: false, error: "User not found" }
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      first_name: firstName,
      last_name: lastName,
      username: username,
      roles: roles,
      updated_at: new Date().toISOString(),
    }

    users[userIndex] = updatedUser

    revalidatePath("/users/view-users")
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// AUTH ACTIONS
export async function signIn(formData: FormData) {
  try {
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    // Find user by username and password
    const user = users.find((u) => u.username === username && u.password === password)

    if (!user) {
      return { success: false, error: "Invalid username or password" }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Error during sign in:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signInWithQR(qrToken: string) {
  try {
    // Find user by QR token
    const user = users.find((u) => u.qr_token === qrToken)

    if (!user) {
      return { success: false, error: "Invalid QR code" }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Error during QR sign in:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signOut() {
  // In a real app, this would invalidate the session
  return { success: true }
}

// Generate a new QR code for a user
export async function regenerateUserQRCode(userId: string) {
  try {
    // Find user
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex === -1) {
      return { success: false, error: "User not found" }
    }

    // Generate new QR token
    const qrToken = `qr-token-${users[userIndex].username}-${uuidv4().substring(0, 6)}`

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      qr_token: qrToken,
      updated_at: new Date().toISOString(),
    }

    revalidatePath("/users/manage-qr-codes")
    return { success: true, qrToken }
  } catch (error) {
    console.error("Error regenerating QR code:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

