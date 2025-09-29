'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../../../../components/Navbar'
import { OrderStatus, PaymentProvider, PaymentStatus } from '@wine-marketplace/shared'

interface OrderItem {
  id: string
  quantity: number
  price: number
  wine: {
    id: string
    title: string
    imageUrl?: string
    annata: number
    producer: string
    region: string
  }
}

interface ShippingAddress {
  id: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state?: string
  zipCode: string
  country: string
  phone?: string
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  shippingCost?: number
  paymentId?: string
  paymentProvider?: PaymentProvider
  paymentStatus: PaymentStatus
  trackingNumber?: string
  shippingLabelUrl?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  seller: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  buyer: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    avatar?: string
    phone?: string
    email?: string
  }
  shippingAddress?: ShippingAddress
  items: OrderItem[]
}

export default function ManageOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Form states
  const [newStatus, setNewStatus] = useState<OrderStatus>('PROCESSING')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [shippingNotes, setShippingNotes] = useState('')

  const orderId = params.id as string

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/dashboard/orders')
      return
    }

    if (orderId) {
      fetchOrder()
    }
  }, [session, status, router, orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ordine non trovato')
        }
        throw new Error('Errore nel caricamento dell\'ordine')
      }

      const data = await response.json()
      setOrder(data)

      // Pre-fill form with existing data
      if (data.trackingNumber) {
        setTrackingNumber(data.trackingNumber)
      }
      if (data.estimatedDelivery) {
        setEstimatedDelivery(data.estimatedDelivery.split('T')[0]) // Format for date input
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dell\'ordine')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order) return

    try {
      setUpdating(true)
      setError(null)

      const updateData: any = {
        status: newStatus,
      }

      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber
      }

      if (estimatedDelivery) {
        updateData.estimatedDelivery = new Date(estimatedDelivery).toISOString()
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dell\'ordine')
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder)

      // Redirect back to orders list
      router.push('/dashboard/orders?updated=true')
    } catch (error) {
      console.error('Error updating order:', error)
      setError(error instanceof Error ? error.message : 'Errore nell\'aggiornamento dell\'ordine')
    } finally {
      setUpdating(false)
    }
  }

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

  const getNextPossibleStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED']
      case 'PAID':
        return ['PROCESSING', 'CANCELLED']
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED']
      case 'SHIPPED':
        return ['DELIVERED']
      default:
        return []
    }
  }

  const getStatusActionText = (status: OrderStatus) => {
    switch (status) {
      case 'PROCESSING':
        return 'Inizia Preparazione'
      case 'SHIPPED':
        return 'Marca come Spedito'
      case 'DELIVERED':
        return 'Marca come Consegnato'
      case 'CANCELLED':
        return 'Cancella Ordine'
      default:
        return 'Aggiorna Stato'
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PROCESSING':
        return 'bg-purple-600 hover:bg-purple-700'
      case 'SHIPPED':
        return 'bg-indigo-600 hover:bg-indigo-700'
      case 'DELIVERED':
        return 'bg-green-600 hover:bg-green-700'
      case 'CANCELLED':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return 'bg-wine-600 hover:bg-wine-700'
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="dashboard" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Ordine non trovato'}
            </h1>
            <p className="text-gray-600 mb-6">
              L'ordine che stai cercando non esiste o non hai i permessi per gestirlo.
            </p>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Torna agli Ordini
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if user can manage this order (must be the seller)
  if (order.seller.id !== session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="dashboard" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Non autorizzato
            </h1>
            <p className="text-gray-600 mb-6">
              Non hai i permessi per gestire questo ordine.
            </p>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Torna agli Ordini
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const possibleStatuses = getNextPossibleStatuses(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center text-wine-600 hover:text-wine-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Torna agli ordini
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestisci Ordine #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Aggiorna stato, tracking e gestisci la spedizione
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Vedi Dettagli
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Stato Corrente
              </h2>

              <div className="flex items-center space-x-3 mb-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-lg border text-lg font-medium ${
                  order.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-300' :
                  order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                  order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                  'bg-gray-100 text-gray-800 border-gray-300'
                }`}>
                  {order.status === 'PAID' && <CreditCardIcon className="h-5 w-5 mr-2" />}
                  {order.status === 'PROCESSING' && <ClockIcon className="h-5 w-5 mr-2" />}
                  {order.status === 'SHIPPED' && <TruckIcon className="h-5 w-5 mr-2" />}
                  {order.status === 'DELIVERED' && <CheckCircleSolidIcon className="h-5 w-5 mr-2" />}
                  {order.status === 'PAID' ? 'Pagamento Completato' :
                   order.status === 'PROCESSING' ? 'In Preparazione' :
                   order.status === 'SHIPPED' ? 'Spedito' :
                   order.status === 'DELIVERED' ? 'Consegnato' :
                   order.status}
                </div>
                <span className="text-sm text-gray-600">
                  Aggiornato il {formatDate(order.updatedAt)}
                </span>
              </div>

              {order.status === 'PAID' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Azione Richiesta
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Il pagamento è stato completato. Inizia la preparazione dell'ordine per spedire il prima possibile.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Update Form */}
            {possibleStatuses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Aggiorna Stato Ordine
                </h2>

                <div className="space-y-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nuovo Stato
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                    >
                      {possibleStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status === 'PROCESSING' ? 'In Preparazione' :
                           status === 'SHIPPED' ? 'Spedito' :
                           status === 'DELIVERED' ? 'Consegnato' :
                           status === 'CANCELLED' ? 'Cancellato' :
                           status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tracking Number (for shipped status) */}
                  {(newStatus === 'SHIPPED' || order.status === 'SHIPPED') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numero di Tracking
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="es. TN123456789IT"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      />
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  {(newStatus === 'SHIPPED' || order.status === 'SHIPPED') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consegna Stimata
                      </label>
                      <input
                        type="date"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      onClick={updateOrderStatus}
                      disabled={updating}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors ${getStatusColor(newStatus)} ${
                        updating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        newStatus === 'SHIPPED' ? <TruckIcon className="h-5 w-5 mr-2" /> :
                        newStatus === 'DELIVERED' ? <CheckCircleSolidIcon className="h-5 w-5 mr-2" /> :
                        newStatus === 'PROCESSING' ? <ClockIcon className="h-5 w-5 mr-2" /> :
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                      )}
                      {updating ? 'Aggiornamento...' : getStatusActionText(newStatus)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Articoli da Spedire ({totalItems} {totalItems === 1 ? 'articolo' : 'articoli'})
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {item.wine.imageUrl && (
                      <img
                        src={item.wine.imageUrl}
                        alt={item.wine.title}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.wine.title} {item.wine.annata}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.wine.producer} • {item.wine.region}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Quantità: {item.quantity} • {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Riepilogo Ordine
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotale</span>
                  <span className="text-gray-900">
                    {formatPrice(order.totalAmount - (order.shippingCost || 0))}
                  </span>
                </div>

                {order.shippingCost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spedizione</span>
                    <span className="text-gray-900">{formatPrice(order.shippingCost)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Totale</span>
                    <span className="text-gray-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Ordine #{order.orderNumber}<br />
                  Creato il {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informazioni Acquirente
              </h2>

              <div className="flex items-center space-x-3 mb-4">
                {order.buyer.avatar && (
                  <img
                    src={order.buyer.avatar}
                    alt={order.buyer.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {order.buyer.firstName && order.buyer.lastName
                      ? `${order.buyer.firstName} ${order.buyer.lastName}`
                      : order.buyer.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{order.buyer.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Invia Messaggio
                </button>

                {order.buyer.phone && (
                  <a
                    href={`tel:${order.buyer.phone}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Chiama
                  </a>
                )}

                {order.buyer.email && (
                  <a
                    href={`mailto:${order.buyer.email}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email
                  </a>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-6 w-6 mr-2 text-wine-600" />
                  Indirizzo di Spedizione
                </h2>

                <div className="text-gray-900 text-sm space-y-1">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p>{order.shippingAddress.company}</p>
                  )}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                    {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-2">
                      <PhoneIcon className="h-4 w-4 inline mr-1" />
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </div>

                <button className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Stampa Etichetta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}