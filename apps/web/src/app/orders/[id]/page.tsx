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
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../../components/Navbar'
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
    avatar?: string
    phone?: string
    email?: string
  }
  buyer: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  shippingAddress?: ShippingAddress
  items: OrderItem[]
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'PAID':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'DISPUTED':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return <ClockIcon className="h-5 w-5" />
    case 'CONFIRMED':
    case 'PAID':
      return <CheckCircleIcon className="h-5 w-5" />
    case 'PROCESSING':
      return <ClockIcon className="h-5 w-5" />
    case 'SHIPPED':
      return <TruckIcon className="h-5 w-5" />
    case 'DELIVERED':
      return <CheckCircleSolidIcon className="h-5 w-5" />
    case 'CANCELLED':
      return <XCircleIcon className="h-5 w-5" />
    case 'DISPUTED':
      return <ExclamationTriangleIcon className="h-5 w-5" />
    default:
      return <ClockIcon className="h-5 w-5" />
  }
}

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'In Attesa di Pagamento'
    case 'CONFIRMED':
      return 'Confermato'
    case 'PAID':
      return 'Pagamento Completato'
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

const getPaymentProviderText = (provider?: PaymentProvider) => {
  switch (provider) {
    case 'PAYPAL':
      return 'PayPal'
    case 'STRIPE':
      return 'Carta di Credito'
    case 'ESCROW':
      return 'Pagamento Protetto'
    default:
      return 'N/A'
  }
}

const OrderTimeline = ({ order }: { order: Order }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Define the order progression steps
  const steps = [
    {
      id: 'PENDING',
      name: 'Ordine Creato',
      description: 'Il tuo ordine è stato ricevuto',
      icon: ClockIcon,
      date: order.createdAt,
    },
    {
      id: 'CONFIRMED',
      name: 'Confermato',
      description: 'Il venditore ha confermato l\'ordine',
      icon: CheckCircleIcon,
      date: order.status === 'CONFIRMED' || order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null,
    },
    {
      id: 'PAID',
      name: 'Pagamento Completato',
      description: 'Il pagamento è stato elaborato con successo',
      icon: CreditCardIcon,
      date: order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null,
    },
    {
      id: 'PROCESSING',
      name: 'In Preparazione',
      description: 'Il venditore sta preparando la spedizione',
      icon: ClockIcon,
      date: order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null,
    },
    {
      id: 'SHIPPED',
      name: 'Spedito',
      description: order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Il pacco è in viaggio',
      icon: TruckIcon,
      date: order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null,
    },
    {
      id: 'DELIVERED',
      name: 'Consegnato',
      description: 'Il pacco è stato consegnato',
      icon: CheckCircleSolidIcon,
      date: order.deliveredAt,
    },
  ]

  // Filter out steps that don't apply to this order
  let relevantSteps = steps

  // Handle cancelled orders
  if (order.status === 'CANCELLED') {
    relevantSteps = [
      steps[0], // PENDING
      {
        id: 'CANCELLED',
        name: 'Cancellato',
        description: 'L\'ordine è stato cancellato',
        icon: XCircleIcon,
        date: order.updatedAt,
      }
    ]
  }

  // Handle disputed orders
  if (order.status === 'DISPUTED') {
    relevantSteps = steps.slice(0, 4).concat([
      {
        id: 'DISPUTED',
        name: 'In Disputa',
        description: 'È stata aperta una disputa per questo ordine',
        icon: ExclamationTriangleIcon,
        date: order.updatedAt,
      }
    ])
  }

  // Determine which steps are completed
  const getStepStatus = (stepId: string, stepDate: string | null) => {
    if (order.status === 'CANCELLED') {
      return stepId === 'PENDING' || stepId === 'CANCELLED' ? 'completed' : 'upcoming'
    }

    if (order.status === 'DISPUTED') {
      const completedSteps = ['PENDING', 'CONFIRMED', 'PAID', 'PROCESSING', 'DISPUTED']
      return completedSteps.includes(stepId) ? 'completed' : 'upcoming'
    }

    // Normal flow
    const statusOrder = ['PENDING', 'CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(order.status)
    const stepIndex = statusOrder.indexOf(stepId)

    if (stepIndex <= currentIndex) {
      return 'completed'
    } else if (stepIndex === currentIndex + 1) {
      return 'current'
    } else {
      return 'upcoming'
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-300'
      case 'current':
        return 'bg-wine-100 text-wine-600 border-wine-300'
      case 'upcoming':
        return 'bg-gray-100 text-gray-400 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-400 border-gray-300'
    }
  }

  const getLineColor = (status: string) => {
    return status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {relevantSteps.map((step, stepIdx) => {
          const status = getStepStatus(step.id, step.date)
          const Icon = step.icon

          return (
            <li key={step.id}>
              <div className="relative pb-8">
                {stepIdx !== relevantSteps.length - 1 ? (
                  <span
                    className={`absolute left-5 top-5 -ml-px h-full w-0.5 ${getLineColor(status)}`}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div
                      className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${getStepColor(status)}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="text-sm">
                        <span className={`font-medium ${
                          status === 'completed' ? 'text-green-900' :
                          status === 'current' ? 'text-wine-900' :
                          'text-gray-500'
                        }`}>
                          {step.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                    {step.date && (
                      <div className="mt-2 text-sm text-gray-500">
                        <time>{formatDate(step.date)}</time>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id as string

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/orders')
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
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dell\'ordine')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="orders" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="orders" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Ordine non trovato'}
            </h1>
            <p className="text-gray-600 mb-6">
              L'ordine che stai cercando non esiste o non hai i permessi per visualizzarlo.
            </p>
            <Link
              href="/orders"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="orders" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/orders"
              className="inline-flex items-center text-wine-600 hover:text-wine-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Torna agli ordini
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ordine #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Ordinato il {formatDate(order.createdAt)}
              </p>
            </div>

            <div className={`inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusText(order.status)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Articoli Ordinati ({totalItems} {totalItems === 1 ? 'articolo' : 'articoli'})
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {item.wine.imageUrl && (
                      <img
                        src={item.wine.imageUrl}
                        alt={item.wine.title}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.wine.title} {item.wine.annata}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.wine.producer} • {item.wine.region}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantità: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price / item.quantity)} cad.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-6 w-6 mr-2 text-wine-600" />
                  Indirizzo di Spedizione
                </h2>

                <div className="text-gray-900">
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
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CalendarIcon className="h-6 w-6 mr-2 text-wine-600" />
                Stato dell'Ordine
              </h2>

              <OrderTimeline order={order} />
            </div>

            {/* Tracking Information */}
            {(order.trackingNumber || order.estimatedDelivery) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TruckIcon className="h-6 w-6 mr-2 text-wine-600" />
                  Informazioni di Spedizione
                </h2>

                <div className="space-y-3">
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Numero di Tracking</p>
                      <p className="text-lg font-mono text-gray-900">{order.trackingNumber}</p>
                      <button className="mt-2 text-wine-600 hover:text-wine-700 text-sm font-medium">
                        Traccia Spedizione →
                      </button>
                    </div>
                  )}

                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Consegna Stimata</p>
                      <p className="text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  )}

                  {order.deliveredAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Consegnato il</p>
                      <p className="text-gray-900 flex items-center">
                        <CheckCircleSolidIcon className="h-5 w-5 text-green-500 mr-2" />
                        {formatDate(order.deliveredAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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

              {/* Payment Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Informazioni Pagamento
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metodo</span>
                    <span className="text-gray-900">{getPaymentProviderText(order.paymentProvider)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stato</span>
                    <span className={`font-medium ${
                      order.paymentStatus === 'COMPLETED' ? 'text-green-600' :
                      order.paymentStatus === 'FAILED' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {order.paymentStatus === 'COMPLETED' ? 'Completato' :
                       order.paymentStatus === 'FAILED' ? 'Fallito' :
                       order.paymentStatus === 'REFUNDED' ? 'Rimborsato' :
                       'In Attesa'}
                    </span>
                  </div>
                  {order.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transazione</span>
                      <span className="text-gray-900 font-mono text-xs">{order.paymentId.slice(-8)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informazioni Venditore
              </h2>

              <div className="flex items-center space-x-3 mb-4">
                {order.seller.avatar && (
                  <img
                    src={order.seller.avatar}
                    alt={order.seller.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {order.seller.firstName && order.seller.lastName
                      ? `${order.seller.firstName} ${order.seller.lastName}`
                      : order.seller.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{order.seller.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Invia Messaggio
                </button>

                {order.seller.phone && (
                  <a
                    href={`tel:${order.seller.phone}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Chiama
                  </a>
                )}

                {order.seller.email && (
                  <a
                    href={`mailto:${order.seller.email}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Azioni
              </h2>

              <div className="space-y-3">
                {order.status === 'DELIVERED' && (
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors">
                    Lascia una Recensione
                  </button>
                )}

                {['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status) && (
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    Richiedi Rimborso
                  </button>
                )}

                {order.status === 'PENDING' && (
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors">
                    Cancella Ordine
                  </button>
                )}

                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Segnala un Problema
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}