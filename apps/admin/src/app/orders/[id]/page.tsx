'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface OrderDetail {
  id: string
  totalAmount: number
  status: string
  paymentStatus: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  buyer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    verified: boolean
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    wine: {
      id: string
      title: string
      annata: number
      producer: string
      region: string
      country: string
      price: number
      images: string[]
      condition: string
      seller: {
        id: string
        firstName: string
        lastName: string
        email: string
        phone?: string
        verified: boolean
      }
    }
  }>
  shippingAddress: {
    id: string
    fullName: string
    streetAddress: string
    city: string
    postalCode: string
    country: string
  }
  refundRequests?: Array<{
    id: string
    amount: number
    reason: string
    status: string
    details?: string
    createdAt: string
    updatedAt: string
    processedAt?: string
    adminNotes?: string
  }>
}

const getStatusColor = (status: string) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status as keyof typeof colors] || colors.PENDING
}

const getRefundStatusColor = (status: string) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    DENIED: 'bg-red-100 text-red-800 border-red-200',
    PROCESSED: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return colors[status as keyof typeof colors] || colors.PENDING
}

const getRefundReasonText = (reason: string) => {
  const reasons = {
    DAMAGED_ITEM: 'Articolo danneggiato',
    ITEM_NOT_RECEIVED: 'Articolo non ricevuto',
    ITEM_NOT_AS_DESCRIBED: 'Articolo non come descritto',
    CHANGED_MIND: 'Cambio di idea',
    SELLER_CANCELLED: 'Annullato dal venditore',
    OTHER: 'Altro',
  }
  return reasons[reason as keyof typeof reasons] || reason
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    case 'CANCELLED':
      return <XCircleIcon className="h-5 w-5 text-red-500" />
    case 'SHIPPED':
      return <TruckIcon className="h-5 w-5 text-purple-500" />
    default:
      return <ClockIcon className="h-5 w-5 text-yellow-500" />
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id as string

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch order details')
        }

        const orderData = await response.json()
        setOrder(orderData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="flex items-center text-red-600 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex-shrink-0">
                        <img
                          src={item.wine.images[0] || '/placeholder-wine.jpg'}
                          alt={item.wine.title}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{item.wine.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.wine.annata} • {item.wine.producer} • {item.wine.region}, {item.wine.country}
                        </p>
                        <p className="text-sm text-gray-600">Condition: {item.wine.condition}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="text-lg font-semibold text-gray-900">€{typeof item.price === 'number' ? item.price.toFixed(2) : Number(item.price || 0).toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Seller: {item.wine.seller.firstName} {item.wine.seller.lastName}
                            {item.wine.seller.verified && (
                              <CheckCircleIcon className="inline-block h-4 w-4 text-green-500 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total Amount</span>
                    <span>€{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Requests */}
            {order.refundRequests && order.refundRequests.length > 0 && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Refund Requests</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.refundRequests.map((refund) => (
                      <div key={refund.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">€{typeof refund.amount === 'number' ? refund.amount.toFixed(2) : Number(refund.amount || 0).toFixed(2)}</span>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRefundStatusColor(refund.status)}`}>
                            {refund.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Reason:</span>
                            <span className="ml-2 text-gray-900">{getRefundReasonText(refund.reason)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(refund.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {refund.details && (
                          <div className="mt-3">
                            <span className="text-gray-600 text-sm">Details:</span>
                            <p className="text-gray-900 text-sm mt-1">{refund.details}</p>
                          </div>
                        )}
                        {refund.adminNotes && (
                          <div className="mt-3">
                            <span className="text-gray-600 text-sm">Admin Notes:</span>
                            <p className="text-gray-900 text-sm mt-1">{refund.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Customer
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <div className="flex items-center">
                      <span className="text-gray-900">{order.buyer.firstName} {order.buyer.lastName}</span>
                      {order.buyer.verified && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{order.buyer.email}</span>
                  </div>
                  {order.buyer.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-900">{order.buyer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Shipping
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Delivery Address:</span>
                    <div className="mt-1 text-gray-900">
                      {order.shippingAddress ? (
                        <>
                          <div className="font-medium">{order.shippingAddress.fullName}</div>
                          <div className="text-sm">
                            {order.shippingAddress.streetAddress}<br/>
                            {order.shippingAddress.city} {order.shippingAddress.postalCode}<br/>
                            {order.shippingAddress.country}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No shipping address provided</div>
                      )}
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="text-gray-900 font-mono text-sm">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated:</span>
                      <span className="text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="text-gray-900">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Payment
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-gray-900 font-semibold">€{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}