'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/admin/layout/AdminLayout'

interface DashboardStats {
  totalUsers: number
  activeWines: number
  totalOrders: number
  totalRevenue: number
  pendingRefunds: number
  activeDisputes: number
  recentSignups: number
  recentSales: number
  pendingWines: number
  activeUsers: number
}

interface RecentActivity {
  id: string
  type: 'user' | 'wine' | 'order' | 'refund'
  message: string
  timestamp: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeWines: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRefunds: 0,
    activeDisputes: 0,
    recentSignups: 0,
    recentSales: 0,
    pendingWines: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user',
      message: 'New user registered: john.doe@example.com',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'wine',
      message: 'Wine approved: Château Margaux 2015',
      timestamp: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      type: 'order',
      message: 'Order processed: #ORD-2024-001',
      timestamp: '2024-01-15T08:45:00Z'
    }
  ])

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Get auth token
      const token = localStorage.getItem('adminToken')
      if (!token) {
        console.error('No admin token found')
        return
      }
      
      // Fetch real dashboard stats from admin API
      const response = await fetch('http://localhost:3010/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.totalUsers || 0,
          activeWines: data.totalWines || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: parseFloat(data.totalRevenue) || 0,
          pendingRefunds: data.pendingRefunds || 0,
          activeDisputes: data.activeDisputes || 0,
          recentSignups: data.recentSignups || 0,
          recentSales: data.recentSales || 0,
          pendingWines: data.pendingWines || 0,
          activeUsers: data.activeUsers || 0
        })
      } else {
        console.error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      user: '👤',
      wine: '🍷',
      order: '📦',
      refund: '💰'
    }
    return icons[type as keyof typeof icons] || '📋'
  }

  const getActivityColor = (type: string) => {
    const colors = {
      user: 'bg-green-400',
      wine: 'bg-blue-400',
      order: 'bg-yellow-400',
      refund: 'bg-red-400'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-400'
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalUsers.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600">+12% from last month</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">🍷</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Wines</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.activeWines.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600">+8% from last month</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats.totalOrders.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600">+15% from last month</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : `€${stats.totalRevenue.toLocaleString()}`}
                    </dd>
                    <dd className="text-sm text-green-600">+23% from last month</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Full Width */}
        <div className="mb-8">
          <div className="bg-white shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/users"
                  className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200">
                      <span className="text-primary-600 font-semibold">👥</span>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">Manage Users</div>
                      <div className="text-sm text-gray-500">View, edit, and manage user accounts</div>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  href="/wines"
                  className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-green-200 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <span className="text-green-600 font-semibold">🍷</span>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">Review Wines</div>
                      <div className="text-sm text-gray-500">Approve, edit, and manage wine listings</div>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-yellow-200 hover:bg-yellow-50 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200">
                      <span className="text-yellow-600 font-semibold">📦</span>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">Process Orders</div>
                      <div className="text-sm text-gray-500">Manage order status and fulfillment</div>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Dashboard Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* System Health */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Server Status</span>
                  <span className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Database</span>
                  <span className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">API Response</span>
                  <span className="text-sm text-gray-900">~120ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Wine Approvals</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    {loading ? '...' : stats.pendingWines}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Disputes</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {loading ? '...' : stats.activeDisputes}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Refund Requests</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {loading ? '...' : stats.pendingRefunds}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">New Registrations (30d)</span>
                  <span className="font-semibold text-gray-900">
                    {loading ? '...' : stats.recentSignups}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recent Sales (30d)</span>
                  <span className="font-semibold text-gray-900">
                    {loading ? '...' : stats.recentSales}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Users (30d)</span>
                  <span className="font-semibold text-green-600">
                    {loading ? '...' : stats.activeUsers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}