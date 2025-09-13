'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  TruckIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: number
  children?: SidebarItem[]
}


interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Wines', href: '/wines', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/orders', icon: TruckIcon },
  { name: 'Refunds', href: '/refunds', icon: CurrencyDollarIcon },
  { 
    name: 'Customer Service', 
    href: '/support', 
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: 'Messages', href: '/support/messages', icon: ChatBubbleLeftRightIcon },
      { name: 'Reviews', href: '/support/reviews', icon: DocumentTextIcon },
      { name: 'Disputes', href: '/support/disputes', icon: ExclamationTriangleIcon }
    ]
  },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'System Logs', href: '/logs', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon }
]

export default function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.href)

    return (
      <div key={item.name}>
        {hasChildren ? (
          <button
            onClick={() => !collapsed && toggleExpanded(item.name)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              active
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } ${level > 0 ? 'ml-4' : ''}`}
          >
            <item.icon className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} mr-3 flex-shrink-0`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRightIcon 
                  className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              active
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } ${level > 0 ? 'ml-4' : ''}`}
          >
            <item.icon className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} mr-3 flex-shrink-0`} />
            {!collapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )}

        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WM</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-gray-900">Wine Marketplace</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">System Status: Online</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}