'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  TruckIcon,
  CalendarIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Navbar'
import { OrderStatus } from '@wine-marketplace/shared'

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
  deliveredAt?: string
  trackingNumber?: string
  seller: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  items: OrderItem[]
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
    case 'DISPUTED':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return <ClockIcon className="h-4 w-4" />
    case 'CONFIRMED':
    case 'PAID':
      return <CheckCircleIcon className="h-4 w-4" />
    case 'PROCESSING':
      return <ClockIcon className="h-4 w-4" />
    case 'SHIPPED':
      return <TruckIcon className="h-4 w-4" />
    case 'DELIVERED':
      return <CheckCircleIcon className="h-4 w-4" />
    case 'CANCELLED':
      return <XCircleIcon className="h-4 w-4" />
    default:
      return <ClockIcon className="h-4 w-4" />
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
    case 'DISPUTED':
      return 'In Disputa'
    default:
      return status
  }
}

const OrderCard = ({ order }: { order: Order }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const mainWine = order.items[0]?.wine
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Order Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ordine #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-600">
                da {order.seller.firstName && order.seller.lastName
                  ? `${order.seller.firstName} ${order.seller.lastName}`
                  : order.seller.username}
              </p>
            </div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{getStatusText(order.status)}</span>
            </div>
          </div>

          {/* Wine Preview */}
          <div className="flex items-center space-x-3 mb-3">
            {mainWine?.imageUrl && (
              <img
                src={mainWine.imageUrl}
                alt={mainWine.title}
                className="h-12 w-12 object-cover rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              {mainWine && (
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mainWine.title} {mainWine.annata}
                </p>
              )}
              <p className="text-sm text-gray-600">
                {totalItems} {totalItems === 1 ? 'articolo' : 'articoli'}
                {order.items.length > 1 && ` (${order.items.length} vini diversi)`}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(order.createdAt)}
            </span>
            {order.trackingNumber && (
              <span className="flex items-center">
                <TruckIcon className="h-4 w-4 mr-1" />
                Tracking: {order.trackingNumber}
              </span>
            )}
          </div>
        </div>

        {/* Right Section - Price and Actions */}
        <div className="lg:text-right">
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(order.totalAmount)}
            </p>
            {order.shippingCost && (
              <p className="text-sm text-gray-600">
                + {formatPrice(order.shippingCost)} spedizione
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Dettagli
            </Link>

            {order.status === 'SHIPPED' && order.trackingNumber && (
              <a
                href={`#`} // TODO: Link to tracking service
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-wine-700 bg-wine-50 hover:bg-wine-100 transition-colors"
              >
                <TruckIcon className="h-4 w-4 mr-2" />
                Traccia
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [error, setError] = useState<string | null>(null)

  const isSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/orders')
      return
    }

    fetchOrders()
  }, [session, status, router])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Errore nel caricamento degli ordini')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.seller.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="cart" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="cart" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSuccess ? (
          // Success Message
          <div className="text-center py-16">
            <CheckCircleSolidIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ordine Confermato!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Il tuo ordine è stato elaborato con successo. Riceverai presto una conferma via email
              con i dettagli di spedizione per ogni venditore.
            </p>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Cosa succede ora?</h3>
              <div className="space-y-3 text-sm text-gray-600 text-left">
                <div className="flex items-start space-x-3">
                  <CreditCardIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>I pagamenti sono stati elaborati</span>
                </div>
                <div className="flex items-start space-x-3">
                  <TruckIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Ogni venditore preparerà la spedizione</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Riceverai i codici di tracking separatamente</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Continua a Comprare
              </Link>
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Vedi i Miei Ordini
              </button>
            </div>
          </div>
        ) : (
          // Orders List
          <div>
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-wine-600" />
                <h1 className="text-3xl font-bold text-gray-900">I Miei Ordini</h1>
              </div>
              <p className="text-gray-600">
                Visualizza e gestisci tutti i tuoi ordini
              </p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cerca per numero ordine o venditore..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="lg:w-48">
                  <div className="relative">
                    <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500 appearance-none"
                    >
                      <option value="ALL">Tutti gli Stati</option>
                      <option value="PENDING">In Attesa</option>
                      <option value="CONFIRMED">Confermato</option>
                      <option value="PAID">Pagato</option>
                      <option value="PROCESSING">In Preparazione</option>
                      <option value="SHIPPED">Spedito</option>
                      <option value="DELIVERED">Consegnato</option>
                      <option value="CANCELLED">Cancellato</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'ordine trovato' : 'ordini trovati'}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={fetchOrders}
                      className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
                    >
                      Riprova
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders List */}
            {filteredOrders.length === 0 && !error ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery || statusFilter !== 'ALL' ? 'Nessun ordine trovato' : 'Nessun ordine ancora'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || statusFilter !== 'ALL'
                      ? 'Prova a modificare i filtri di ricerca.'
                      : 'Quando effettuerai il tuo primo acquisto, lo vedrai qui.'
                    }
                  </p>
                  {!searchQuery && statusFilter === 'ALL' && (
                    <Link
                      href="/browse"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                    >
                      <ShoppingBagIcon className="h-5 w-5 mr-2" />
                      Sfoglia i Vini
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}