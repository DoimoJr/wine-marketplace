'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBagIcon,
  TruckIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'
import Navbar from '../../components/Navbar'
import { OrderStatus } from '@wine-marketplace/shared'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  revenueThisMonth: number
  revenueLastMonth: number
  averageOrderValue: number
  topSellingWine?: {
    id: string
    title: string
    totalSold: number
  }
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  wine: {
    id: string
    title: string
    imageUrl?: string
    annata: number
  }
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  shippingCost?: number
  createdAt: string
  trackingNumber?: string
  buyer: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  items: OrderItem[]
}

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/dashboard')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch seller orders with current user as seller
      const ordersResponse = await fetch(`/api/orders?sellerId=${session?.user?.id}&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders')
      }

      const ordersData = await ordersResponse.json()
      setRecentOrders(ordersData.orders || [])

      // Calculate basic stats from orders data
      const allOrders = ordersData.orders || []
      const pendingCount = allOrders.filter((order: Order) =>
        ['PENDING', 'CONFIRMED', 'PAID'].includes(order.status)
      ).length

      const thisMonth = new Date()
      thisMonth.setDate(1)
      const lastMonth = new Date(thisMonth)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const thisMonthOrders = allOrders.filter((order: Order) =>
        new Date(order.createdAt) >= thisMonth
      )
      const lastMonthOrders = allOrders.filter((order: Order) =>
        new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < thisMonth
      )

      const revenueThisMonth = thisMonthOrders.reduce((sum: number, order: Order) =>
        sum + order.totalAmount, 0
      )
      const revenueLastMonth = lastMonthOrders.reduce((sum: number, order: Order) =>
        sum + order.totalAmount, 0
      )

      const averageOrderValue = allOrders.length > 0
        ? allOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0) / allOrders.length
        : 0

      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pendingCount,
        revenueThisMonth,
        revenueLastMonth,
        averageOrderValue,
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'In Attesa'
      case 'CONFIRMED':
        return 'Confermato'
      case 'PAID':
        return 'Pagato'
      case 'PROCESSING':
        return 'In Preparazione'
      case 'SHIPPED':
        return 'Spedito'
      case 'DELIVERED':
        return 'Consegnato'
      case 'CANCELLED':
        return 'Cancellato'
      default:
        return status
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getRevenueChange = () => {
    if (!stats || stats.revenueLastMonth === 0) return { percentage: 0, isPositive: true }

    const change = ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0
    }
  }

  const revenueChange = getRevenueChange()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="dashboard" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Venditore</h1>
          <p className="text-gray-600">
            Gestisci i tuoi ordini e monitora le performance di vendita
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
                >
                  Riprova
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-wine-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-wine-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ordini Totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Da Elaborare</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </div>

          {/* Revenue This Month */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ricavi Mese</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats?.revenueThisMonth || 0)}
                </p>
                {stats && stats.revenueLastMonth > 0 && (
                  <div className="flex items-center text-sm">
                    {revenueChange.isPositive ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={revenueChange.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {revenueChange.percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-1">vs mese scorso</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valore Medio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats?.averageOrderValue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Ordini Recenti</h2>
                  <Link
                    href="/dashboard/orders"
                    className="text-wine-600 hover:text-wine-700 text-sm font-medium"
                  >
                    Vedi tutti →
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun ordine ancora
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Quando riceverai il tuo primo ordine, lo vedrai qui.
                    </p>
                    <Link
                      href="/sell"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                    >
                      Aggiungi Vino
                    </Link>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              Ordine #{order.orderNumber}
                            </h3>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            da {order.buyer.firstName && order.buyer.lastName
                              ? `${order.buyer.firstName} ${order.buyer.lastName}`
                              : order.buyer.username}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center">
                              <ShoppingBagIcon className="h-4 w-4 mr-1" />
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} articoli
                            </span>
                            {order.trackingNumber && (
                              <span className="flex items-center">
                                <TruckIcon className="h-4 w-4 mr-1" />
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              Dettagli
                            </Link>
                            {['CONFIRMED', 'PAID'].includes(order.status) && (
                              <Link
                                href={`/dashboard/orders/${order.id}/manage`}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Gestisci
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>

              <div className="space-y-3">
                <Link
                  href="/sell"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                >
                  Aggiungi Nuovo Vino
                </Link>

                <Link
                  href="/dashboard/orders?status=PENDING,CONFIRMED,PAID"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Ordini da Elaborare
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Analytics e Report
                </Link>

                <Link
                  href="/profile"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Gestisci Profilo
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stato Rapido</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ordini in attesa</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.pendingOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ricavi mese</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(stats?.revenueThisMonth || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ordini totali</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.totalOrders || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-sm text-gray-600">Valore medio ordine</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(stats?.averageOrderValue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}