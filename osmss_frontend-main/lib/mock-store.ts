import { mockItems, mockItemHistory, mockUsers } from "./mock-data"
import { v4 as uuidv4 } from "uuid"

// Fixed threshold values
const FIXED_THRESHOLDS = {
  LOW_BULK: 2,
  LOW_PCS: 24,
  MODERATE_BULK: 5,
  MODERATE_PCS: 60,
  HIGH_BULK: 10,
  HIGH_PCS: 120,
}

// Types
export interface Item {
  id: number
  name: string
  unit_type: string // Added unit type field
  bulk_quantity: number
  pieces_quantity: number
  created_at: string
  updated_at: string
  low_threshold_bulk: number
  low_threshold_pcs: number
  moderate_threshold_bulk: number
  moderate_threshold_pcs: number
  high_threshold_bulk: number
  high_threshold_pcs: number
  stock_status: string
}

export interface ItemHistory {
  id: number
  item_id: number
  quantity: number
  is_bulk: boolean
  action: "Stock In" | "Stock Out"
  reason: string
  user_id: string
  created_at: string
  item_name?: string
  releaser_name?: string
}

export interface User {
  id: string
  first_name: string
  last_name: string
  username: string
  created_at: string
  updated_at: string
  roles: string[]
  qr_token: string
}

// In-memory store
class MockStore {
  private items: Item[] = []
  private itemHistory: ItemHistory[] = []
  private users: User[] = []
  private nextItemId = 1
  private nextHistoryId = 1

  constructor() {
    // Initialize with mock data
    this.items = JSON.parse(JSON.stringify(mockItems))

    // Add unit_type to existing items if it doesn't exist
    this.items = this.items.map((item) => ({
      ...item,
      unit_type: item.unit_type || "box", // Default to "box" for existing items
    }))

    this.itemHistory = JSON.parse(JSON.stringify(mockItemHistory))
    this.users = JSON.parse(JSON.stringify(mockUsers))

    // Set next IDs
    this.nextItemId = Math.max(...this.items.map((item) => item.id), 0) + 1
    this.nextHistoryId = Math.max(...this.itemHistory.map((history) => history.id), 0) + 1
  }

  // Item methods
  getItems(): Item[] {
    return this.items
  }

  getItem(id: number): Item | undefined {
    return this.items.find((item) => item.id === id)
  }

  addItem(item: Omit<Item, "id" | "created_at" | "updated_at">): Item {
    const now = new Date().toISOString()
    const newItem: Item = {
      id: this.nextItemId++,
      created_at: now,
      updated_at: now,
      ...item,
    }

    this.items.push(newItem)
    return newItem
  }

  updateItem(id: number, updates: Partial<Item>): Item | null {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) return null

    const updatedItem = {
      ...this.items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.items[index] = updatedItem
    return updatedItem
  }

  deleteItem(id: number): boolean {
    const initialLength = this.items.length
    this.items = this.items.filter((item) => item.id !== id)
    return this.items.length !== initialLength
  }

  // Update item stock and record history
  updateItemStock(
    itemId: number,
    addBulk = 0,
    addPieces = 0,
    releaseBulk = 0,
    releasePieces = 0,
    stockInReason = "",
    stockOutReason = "",
    userId = "user1",
  ): { success: boolean; item?: Item; error?: string } {
    const item = this.getItem(itemId)
    if (!item) return { success: false, error: "Item not found" }

    const now = new Date().toISOString()
    let updated = false

    // Process stock in
    if (addBulk > 0 || addPieces > 0) {
      const newBulk = item.bulk_quantity + addBulk
      const newPieces = item.pieces_quantity + addPieces

      // Add history record
      this.addItemHistory({
        item_id: itemId,
        quantity: addBulk > 0 ? addBulk : addPieces,
        is_bulk: addBulk > 0,
        action: "Stock In",
        reason: stockInReason,
        user_id: userId,
        item_name: item.name,
        releaser_name:
          this.users.find((u) => u.id === userId)?.first_name +
          " " +
          this.users.find((u) => u.id === userId)?.last_name,
      })

      // Update item
      item.bulk_quantity = newBulk
      item.pieces_quantity = newPieces
      updated = true
    }

    // Process stock out
    if (releaseBulk > 0 || releasePieces > 0) {
      // Check if we have enough stock
      if (releaseBulk > item.bulk_quantity || releasePieces > item.pieces_quantity) {
        return { success: false, error: "Not enough stock available" }
      }

      const newBulk = item.bulk_quantity - releaseBulk
      const newPieces = item.pieces_quantity - releasePieces

      // Add history record
      this.addItemHistory({
        item_id: itemId,
        quantity: releaseBulk > 0 ? releaseBulk : releasePieces,
        is_bulk: releaseBulk > 0,
        action: "Stock Out",
        reason: stockOutReason,
        user_id: userId,
        item_name: item.name,
        releaser_name:
          this.users.find((u) => u.id === userId)?.first_name +
          " " +
          this.users.find((u) => u.id === userId)?.last_name,
      })

      // Update item
      item.bulk_quantity = newBulk
      item.pieces_quantity = newPieces
      updated = true
    }

    if (updated) {
      // Update stock status using fixed thresholds
      if (item.bulk_quantity <= FIXED_THRESHOLDS.LOW_BULK || item.pieces_quantity <= FIXED_THRESHOLDS.LOW_PCS) {
        item.stock_status = "Low"
      } else if (
        item.bulk_quantity >= FIXED_THRESHOLDS.HIGH_BULK ||
        item.pieces_quantity >= FIXED_THRESHOLDS.HIGH_PCS
      ) {
        item.stock_status = "High"
      } else {
        item.stock_status = "Moderate"
      }

      item.updated_at = now
      return { success: true, item }
    }

    return { success: false, error: "No changes made" }
  }

  // Item history methods
  getItemHistory(): ItemHistory[] {
    return this.itemHistory
  }

  addItemHistory(history: Omit<ItemHistory, "id" | "created_at">): ItemHistory {
    const newHistory: ItemHistory = {
      id: this.nextHistoryId++,
      created_at: new Date().toISOString(),
      ...history,
    }

    this.itemHistory.push(newHistory)
    return newHistory
  }

  // User methods
  getUsers(): User[] {
    return this.users
  }

  getUser(id: string): User | undefined {
    return this.users.find((user) => user.id === id)
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find((user) => user.username === username)
  }

  getUserByQRToken(token: string): User | undefined {
    return this.users.find((user) => user.qr_token === token)
  }

  addUser(user: Omit<User, "id" | "created_at" | "updated_at" | "qr_token">): User {
    const now = new Date().toISOString()
    const newUser: User = {
      id: `user${this.users.length + 1}`,
      created_at: now,
      updated_at: now,
      qr_token: `qr-token-${user.username}-${uuidv4().substring(0, 6)}`,
      ...user,
    }

    this.users.push(newUser)
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex((user) => user.id === id)
    if (index === -1) return null

    const updatedUser = {
      ...this.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.users[index] = updatedUser
    return updatedUser
  }

  regenerateQRToken(userId: string): User | null {
    const user = this.getUser(userId)
    if (!user) return null

    user.qr_token = `qr-token-${user.username}-${uuidv4().substring(0, 6)}`
    user.updated_at = new Date().toISOString()

    return user
  }

  // Authentication methods
  authenticateUser(username: string, password: string): { success: boolean; user?: User; error?: string } {
    // For testing, accept any password for existing users
    const user = this.getUserByUsername(username)
    if (user) {
      return { success: true, user }
    }

    return { success: false, error: "Invalid username or password" }
  }

  authenticateWithQRToken(token: string): { success: boolean; user?: User; error?: string } {
    const user = this.getUserByQRToken(token)
    if (user) {
      return { success: true, user }
    }

    return { success: false, error: "Invalid QR code" }
  }
}

// Create a singleton instance
export const mockStore = new MockStore()

