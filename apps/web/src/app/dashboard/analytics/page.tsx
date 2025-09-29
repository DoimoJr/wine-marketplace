'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  EuroIcon,
  ShoppingBagIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import Navbar from '../../../components/Navbar'
import { OrderStatus } from '@wine-marketplace/shared'

interface MonthlyStats {
  month: string
  orders: number
  revenue: number
  averageOrderValue: number
}

interface WinePerformance {
  wine: {
    id: string
    title: string
    annata: number
    imageUrl?: string
  }
  totalSold: number
  totalRevenue: number
  averagePrice: number
}

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  monthlyStats: MonthlyStats[]
  topWines: WinePerformance[]
  recentActivity: {
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
  }
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/dashboard/analytics')
      return
    }

    fetchAnalytics()
  }, [session, status, router, timeframe])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all seller orders for analytics
      const ordersResponse = await fetch(`/api/orders?sellerId=${session?.user?.id}&limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders data')
      }

      const ordersData = await ordersResponse.json()
      const orders = ordersData.orders || []

      // Calculate analytics from orders data
      const analyticsData = calculateAnalytics(orders, timeframe)
      setAnalytics(analyticsData)

    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Errore nel caricamento dei dati analytics')
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (orders: any[], timeframe: string): AnalyticsData => {
    const now = new Date()
    const timeframeDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365

    // Filter orders by timeframe
    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000)
    const filteredOrders = orders.filter((order: any) => new Date(order.createdAt) >= cutoffDate)

    // Calculate basic metrics
    const totalRevenue = filteredOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    const totalOrders = filteredOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth (compare with previous period)
    const previousCutoffDate = new Date(cutoffDate.getTime() - timeframeDays * 24 * 60 * 60 * 1000)
    const previousOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= previousCutoffDate && orderDate < cutoffDate
    })

    const previousRevenue = previousOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    const previousOrderCount = previousOrders.length

    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const ordersGrowth = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0

    // Calculate monthly stats for the chart
    const monthlyStats: MonthlyStats[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= monthStart && orderDate <= monthEnd
      })

      const monthRevenue = monthOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
      const monthOrderCount = monthOrders.length

      monthlyStats.push({
        month: monthStart.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
        orders: monthOrderCount,
        revenue: monthRevenue,
        averageOrderValue: monthOrderCount > 0 ? monthRevenue / monthOrderCount : 0
      })
    }

    // Calculate wine performance
    const wineStats = new Map()
    filteredOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const wineId = item.wine.id
        if (!wineStats.has(wineId)) {
          wineStats.set(wineId, {
            wine: item.wine,
            totalSold: 0,
            totalRevenue: 0,
            orders: []
          })
        }
        const wine = wineStats.get(wineId)
        wine.totalSold += item.quantity
        wine.totalRevenue += item.price
      })
    })

    const topWines: WinePerformance[] = Array.from(wineStats.values())
      .map((wine: any) => ({
        wine: wine.wine,
        totalSold: wine.totalSold,
        totalRevenue: wine.totalRevenue,
        averagePrice: wine.totalSold > 0 ? wine.totalRevenue / wine.totalSold : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    // Calculate recent activity
    const completedOrders = filteredOrders.filter((order: any) =>
      ['DELIVERED'].includes(order.status)
    ).length

    const pendingOrders = filteredOrders.filter((order: any) =>
      ['PENDING', 'CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)
    ).length

    const cancelledOrders = filteredOrders.filter((order: any) =>
      ['CANCELLED'].includes(order.status)
    ).length

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
      monthlyStats,
      topWines,
      recentActivity: {
        completedOrders,
        pendingOrders,
        cancelledOrders
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getTimeframeName = (tf: string) => {
    switch (tf) {
      case '7d': return 'Ultimi 7 giorni'
      case '30d': return 'Ultimi 30 giorni'
      case '90d': return 'Ultimi 90 giorni'
      case '1y': return 'Ultimo anno'
      default: return 'Periodo'
    }
  }

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
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-wine-600 hover:text-wine-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Torna alla Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-8 w-8 text-wine-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics e Report</h1>
                <p className="text-gray-600">
                  Monitora le performance delle tue vendite
                </p>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === tf
                      ? 'bg-wine-600 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tf === '7d' ? '7G' : tf === '30d' ? '30G' : tf === '90d' ? '90G' : '1A'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Dati per: {getTimeframeName(timeframe)}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ricavi Totali</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(analytics.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <EuroIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {analytics.revenueGrowth >= 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(analytics.revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs periodo precedente</span>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ordini Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {analytics.ordersGrowth >= 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(analytics.ordersGrowth).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs periodo precedente</span>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valore Medio Ordine</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(analytics.averageOrderValue)}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasso Completamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.totalOrders > 0
                        ? ((analytics.recentActivity.completedOrders / analytics.totalOrders) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-2 bg-wine-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-wine-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Monthly Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Trend Mensile
                  </h2>

                  {/* Simple bar chart using CSS */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
                      <span>Mese</span>
                      <span>Ordini</span>
                      <span>Ricavi</span>
                    </div>

                    {analytics.monthlyStats.map((stat, index) => {
                      const maxRevenue = Math.max(...analytics.monthlyStats.map(s => s.revenue))
                      const barWidth = maxRevenue > 0 ? (stat.revenue / maxRevenue) * 100 : 0

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-900 w-16">{stat.month}</span>
                            <span className="text-gray-600 w-12 text-center">{stat.orders}</span>
                            <span className="text-gray-900 font-medium w-20 text-right">
                              {formatPrice(stat.revenue)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-wine-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Top Wines & Recent Activity */}
              <div className="space-y-6">
                {/* Top Performing Wines */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Top Vini per Ricavi
                  </h2>

                  <div className="space-y-4">
                    {analytics.topWines.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nessun dato disponibile</p>
                    ) : (
                      analytics.topWines.map((wine, index) => (
                        <div key={wine.wine.id} className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-wine-100 text-wine-600 text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          {wine.wine.imageUrl && (
                            <img
                              src={wine.wine.imageUrl}
                              alt={wine.wine.title}
                              className="h-10 w-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {wine.wine.title} {wine.wine.annata}
                            </p>
                            <p className="text-xs text-gray-600">
                              {wine.totalSold} venduti • {formatPrice(wine.totalRevenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Stato Ordini
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completati</span>
                      <span className="text-sm font-medium text-green-600">
                        {analytics.recentActivity.completedOrders}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In corso</span>
                      <span className="text-sm font-medium text-blue-600">
                        {analytics.recentActivity.pendingOrders}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cancellati</span>
                      <span className="text-sm font-medium text-red-600">
                        {analytics.recentActivity.cancelledOrders}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Totale</span>
                        <span className="text-sm font-bold text-gray-900">
                          {analytics.totalOrders}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}