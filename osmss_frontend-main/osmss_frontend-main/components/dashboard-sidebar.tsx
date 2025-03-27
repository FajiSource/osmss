"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Package, FileText, PieChart, Users, ChevronDown, Menu, Power } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DashboardSidebar() {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isUsersOpen, setIsUsersOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [username, setUsername] = useState("Admin User")
  const [activeUser, setActiveUser] = useState({});
  const [userRole, setUserRole] = useState(0);
  const [textRole, setTextRole] = useState("Admin")
  const pathname = usePathname()
  const router = useRouter()

  // Get username from localStorage on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        const roles = JSON.parse(user.role);
        console.log(roles.length)
        if (roles.length === 2) {
          setUserRole(3)
          setTextRole("Add Product/Edit Stock")
        } else if (roles[0] === "add-product") {
          setUserRole(1)
          setTextRole("Add Product");
        } else if (roles[0] === "edit-stock") {
          setUserRole(2)
          setTextRole("Edit Stock");
        } else {
          setUserRole(0)
          setTextRole("Admin")
        }

        setUsername(user.username || "Admin User")
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
    }
  }, [])

  // Set initial state based on current path
  useEffect(() => {
    if (pathname?.startsWith("/inventory")) {
      setIsInventoryOpen(true)
    }
    if (pathname?.startsWith("/users")) {
      setIsUsersOpen(true)
    }
    if (pathname?.startsWith("/reports")) {
      setIsReportsOpen(true)
    }
  }, [pathname])

  const isRouteActive = (route: string) => pathname === route
  const isParentRouteActive = (routes: string[]) => routes.some((route) => pathname?.startsWith(route))

  const handleTabClick = (route: string) => {
    if (route === "/inventory") setIsInventoryOpen(!isInventoryOpen)
    if (route === "/users") setIsUsersOpen(!isUsersOpen)
    if (route === "/reports") setIsReportsOpen(!isReportsOpen)
  }

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear authentication data
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("user")

      // Redirect to login page
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      <div className="fixed left-0 top-0 z-40 h-screen w-[318px] bg-[#4c4a4a] text-white flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex h-16 items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-bold text-lg leading-tight">
            OFFICE SUPPLIES
            <br />
            STOCK MONITORING
          </h1>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu size={24} />
          </Button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-8 flex-1 overflow-y-auto sidebar-scrollbar">
          <ul className="space-y-1 px-2">
            {userRole === 0 && (
              <li>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center px-6 py-3",
                    isRouteActive("/dashboard") ? "bg-[#b12025] text-white" : "hover:bg-gray-700",
                  )}
                >
                  <Package size={24} className="mr-4" />
                  <span className="text-lg">DASHBOARD</span>
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={() => handleTabClick("/inventory")}
                className={cn(
                  "flex w-full items-center px-6 py-3 transition-colors",
                  isParentRouteActive(["/inventory", "/inventory/view-items", "/inventory/add-item"])
                    ? "bg-[#b12025] text-white"
                    : "hover:bg-gray-700",
                )}
              >
                <Package size={24} className="mr-4" />
                <span className="flex-1 text-left text-lg">INVENTORY</span>
                <ChevronDown size={18} className={cn("transition-transform", isInventoryOpen && "rotate-180")} />
              </button>
              {isInventoryOpen && (
                <ul className="mt-1 space-y-1 pl-14">
                  <li>
                    <Link
                      href="/inventory/view-items"
                      className={cn(
                        "block py-2 text-sm",
                        isRouteActive("/inventory/view-items") ? "text-[#b12025]" : "hover:text-gray-300",
                      )}
                    >
                      VIEW ITEMS
                    </Link>
                  </li>
                  {
                    (userRole === 1 || userRole === 0 || userRole === 3) && (
                      <li>
                        <Link
                          href="/inventory/add-item"
                          className={cn(
                            "block py-2 text-sm",
                            isRouteActive("/inventory/add-item") ? "text-[#b12025]" : "hover:text-gray-300",
                          )}
                        >
                          ADD ITEM
                        </Link>
                      </li>
                    )
                  }
                </ul>
              )}
            </li>
            <li>
              <Link
                href="/item-history"
                className={cn(
                  "flex items-center px-6 py-3",
                  isRouteActive("/item-history") ? "bg-[#b12025] text-white" : "hover:bg-gray-700",
                )}
              >
                <FileText size={24} className="mr-4" />
                <span className="text-lg">ITEM HISTORY</span>
              </Link>
            </li>
            <li>
              <button
                onClick={() => handleTabClick("/reports")}
                className={cn(
                  "flex w-full items-center px-6 py-3 transition-colors",
                  isParentRouteActive(["/reports", "/reports/low-stock", "/reports/stock-movement"])
                    ? "bg-[#b12025] text-white"
                    : "hover:bg-gray-700",
                )}
              >
                <PieChart size={24} className="mr-4" />
                <span className="flex-1 text-left text-lg">REPORTS</span>
                <ChevronDown size={18} className={cn("transition-transform", isReportsOpen && "rotate-180")} />
              </button>
              {isReportsOpen && (
                <ul className="mt-1 space-y-1 pl-14">
                  <li>
                    <Link
                      href="/reports/low-stock"
                      className={cn(
                        "block py-2 text-sm",
                        isRouteActive("/reports/low-stock") ? "text-[#b12025]" : "hover:text-gray-300",
                      )}
                    >
                      LOW STOCK REPORT
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports/stock-movement"
                      className={cn(
                        "block py-2 text-sm",
                        isRouteActive("/reports/stock-movement") ? "text-[#b12025]" : "hover:text-gray-300",
                      )}
                    >
                      STOCK MOVEMENT REPORT
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            {userRole === 0 && (
              <li>
                <button
                  onClick={() => handleTabClick("/users")}
                  className={cn(
                    "flex w-full items-center px-6 py-3 transition-colors",
                    isParentRouteActive(["/users", "/users/view-users", "/users/add-user"])
                      ? "bg-[#b12025] text-white"
                      : "hover:bg-gray-700",
                  )}
                >
                  <Users size={24} className="mr-4" />
                  <span className="flex-1 text-left text-lg">USERS</span>
                  <ChevronDown size={18} className={cn("transition-transform", isUsersOpen && "rotate-180")} />
                </button>
                {isUsersOpen && (
                  <ul className="mt-1 space-y-1 pl-14">
                    <li>
                      <Link
                        href="/users/view-users"
                        className={cn(
                          "block py-2 text-sm",
                          isRouteActive("/users/view-users") ? "text-[#b12025]" : "hover:text-gray-300",
                        )}
                      >
                        VIEW USERS
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/users/add-user"
                        className={cn(
                          "block py-2 text-sm",
                          isRouteActive("/users/add-user") ? "text-[#b12025]" : "hover:text-gray-300",
                        )}
                      >
                        ADD USER
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/users/manage-qr-codes"
                        className={cn(
                          "block py-2 text-sm",
                          isRouteActive("/users/manage-qr-codes") ? "text-[#b12025]" : "hover:text-gray-300",
                        )}
                      >
                        MANAGE QR CODES
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 bg-gray-500">
              <AvatarFallback className="text-white">{username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{username}</p>
              <p className="text-xs text-gray-400">{textRole}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
              className="text-white hover:bg-gray-700 ml-auto"
            >
              <Power className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>You will be redirected to the login page.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

