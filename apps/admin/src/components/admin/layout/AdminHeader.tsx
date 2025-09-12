'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface AdminHeaderProps {
  user: any
  onLogout: () => void
}

interface HeaderStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingRefunds: number
}

export default function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [stats, setStats] = useState<HeaderStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRefunds: 0
  })
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return
      
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
          totalOrders: data.totalOrders || 0,
          totalRevenue: parseFloat(data.totalRevenue) || 0,
          pendingRefunds: data.pendingRefunds || 0
        })
      }
    } catch (error) {
      console.error('Error fetching header stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get page title from pathname
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return 'Dashboard'
    
    const pageMap: Record<string, string> = {
      users: 'User Management',
      wines: 'Wine Catalog',
      orders: 'Order Management', 
      support: 'Customer Support',
      finance: 'Financial Management',
      marketing: 'Marketing Tools',
      analytics: 'Analytics & Reports',
      logs: 'System Logs',
      settings: 'Settings'
    }
    
    return pageMap[pathSegments[0]] || pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
  }

  // Get breadcrumb items
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Dashboard', href: '/' }]
    
    let currentPath = ''
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`
      breadcrumbs.push({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath
      })
    })
    
    return breadcrumbs
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Breadcrumb and Title */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              {getBreadcrumbs().map((item, index) => (
                <div key={item.href} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <span className={index === getBreadcrumbs().length - 1 ? 'text-gray-900 font-medium' : ''}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>


          {/* Right side - Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : stats.totalOrders.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {loading ? '...' : `€${(stats.totalRevenue / 1000).toFixed(1)}k`}
                </div>
                <div className="text-xs text-gray-500">Revenue</div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-6 w-6" />
              {stats.pendingRefunds > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.pendingRefunds > 99 ? '99+' : stats.pendingRefunds}
                </span>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">Super Admin</div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                      <div className="text-xs text-gray-500">Administrator</div>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <UserCircleIcon className="h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100">
                      <button 
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}