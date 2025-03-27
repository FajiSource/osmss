"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, FileText, PieChart, Users } from "lucide-react"
// import { getItems, getItemHistory } from "@/lib/actions"
import { mockUsers } from "@/lib/mock-data"
import apiService from "@/components/services/apiService"

export default function DashboardPage() {
 

  const [stats, setStats] = useState({
    itemCount: 0,
    historyCount: 0,
    reportCount: 2, // Always 2 reports
    userCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
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
  useEffect(() => {
    const loadStats = async () => {
      try {
        const items = await getItems()
        const history = await getItemHistory()
        const users = await get_users();
        setStats({
          itemCount: items.length,
          historyCount: history.length,
          reportCount: 2, // Always 2 reports
          userCount: users.length,
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="h-full flex flex-col p-6">
      <div className="bg-[#d5d3b8] border border-gray-400 p-4 mb-6">
        <h2 className="font-medium text-lg">DASHBOARD</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Inventory"
          value={isLoading ? "..." : stats.itemCount.toString()}
          link="/inventory/view-items"
          icon={<Package size={36} />}
        />
        <DashboardCard
          title="Item History"
          value={isLoading ? "..." : stats.historyCount.toString()}
          link="/item-history"
          icon={<FileText size={36} />}
        />
        <DashboardCard
          title="Reports"
          value={stats.reportCount.toString()}
          link="/reports/low-stock"
          icon={<PieChart size={36} />}
        />
        <DashboardCard
          title="Users"
          value={isLoading ? "..." : stats.userCount.toString()}
          link="/users/view-users"
          icon={<Users size={36} />}
        />
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string
  link: string
  icon: React.ReactNode
}

function DashboardCard({ title, value, link, icon }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-md shadow-sm p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="text-gray-700">{icon}</div>
      </div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <Link href={link} className="text-blue-600 hover:underline">
        View details
      </Link>
    </div>
  )
}

