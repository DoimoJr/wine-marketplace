'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '../common/Toast'
import Modal from './Modal'
import { 
  ShoppingBagIcon,
  UserIcon,
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface OrderItem {
  id: string
  quantity: number
  price: number
  wine: {
    id: string
    title: string
    annata: number
    region: string
    images?: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  totalAmount: number
  shippingFee: number
  paymentMethod: string
  trackingNumber?: string
  shippingAddress?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
  buyer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  seller: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  items: OrderItem[]
  refundRequests?: {
    id: string
    reason: string
    amount: number
    status: string
    createdAt: string
  }[]
  messages?: {
    id: string
    content: string
    sender: string
    createdAt: string
  }[]
}

interface OrderEditModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onOrderUpdated: () => void
}

export default function OrderEditModal({ isOpen, onClose, order, onOrderUpdated }: OrderEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [formData, setFormData] = useState({
    status: 'PENDING' as Order['status'],
    trackingNumber: '',
    adminNotes: '',
    refundAmount: 0,
    refundReason: ''
  })
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  const { user: currentAdmin } = useAuth()
  const toast = useToast()

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        trackingNumber: order.trackingNumber || '',
        adminNotes: '',
        refundAmount: 0,
        refundReason: ''
      })
    }
  }, [order])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStatusUpdate = async () => {
    if (!order || !currentAdmin) return

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`http://localhost:3010/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          trackingNumber: formData.trackingNumber,
          adminNotes: formData.adminNotes
        })
      })

      if (response.ok) {
        toast.success('Order updated successfully', 'Status and details have been saved')
        onOrderUpdated()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order', error instanceof Error ? error.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    if (!order || !currentAdmin || !formData.refundAmount) return

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${order.id}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.refundAmount,
          reason: formData.refundReason
        })
      })

      if (response.ok) {
        toast.success('Refund processed successfully', `€${formData.refundAmount} has been refunded`)
        onOrderUpdated()
        setFormData(prev => ({ ...prev, refundAmount: 0, refundReason: '' }))
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process refund')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund', error instanceof Error ? error.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!order || !currentAdmin || !newMessage.trim()) return

    setSendingMessage(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`http://localhost:3010/api/admin/orders/${order.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          recipient: 'BOTH' // Send to both buyer and seller
        })
      })

      if (response.ok) {
        toast.success('Message sent successfully', 'Both buyer and seller have been notified')
        setNewMessage('')
        onOrderUpdated()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message', error instanceof Error ? error.message : 'Please try again')
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status as keyof typeof colors] || colors.PENDING
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: ClockIcon,
      CONFIRMED: CheckCircleIcon,
      PAID: CreditCardIcon,
      PROCESSING: ClockIcon,
      SHIPPED: TruckIcon,
      DELIVERED: CheckCircleIcon,
      CANCELLED: ExclamationTriangleIcon,
      REFUNDED: CreditCardIcon
    }
    const IconComponent = icons[status as keyof typeof icons] || ClockIcon
    return <IconComponent className="h-5 w-5" />
  }

  if (!order) return null

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ShoppingBagIcon },
    { id: 'items', name: 'Items', icon: PhotoIcon },
    { id: 'shipping', name: 'Shipping', icon: TruckIcon },
    { id: 'communication', name: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'refunds', name: 'Refunds', icon: CreditCardIcon }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      size="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{order.status}</span>
            </span>
            <span className="text-sm text-gray-500">
              Order Total: <span className="font-medium text-gray-900">€{(Number(order.totalAmount) || 0).toFixed(2)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Order Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm text-gray-900">{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">€{((Number(order.totalAmount) || 0) - (Number(order.shippingFee) || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping:</span>
                  <span className="text-sm text-gray-900">€{(Number(order.shippingFee) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-gray-900">Total:</span>
                  <span className="text-sm font-medium text-gray-900">€{(Number(order.totalAmount) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Buyer & Seller Info */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Buyer Information
                </h4>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">
                    {order.buyer.firstName} {order.buyer.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{order.buyer.email}</div>
                  {order.buyer.phone && (
                    <div className="text-sm text-gray-600">{order.buyer.phone}</div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Seller Information
                </h4>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">
                    {order.seller.firstName} {order.seller.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{order.seller.email}</div>
                  {order.seller.phone && (
                    <div className="text-sm text-gray-600">{order.seller.phone}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Order Items</h4>
            {order.items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  {item.wine.images?.[0] ? (
                    <img src={item.wine.images[0]} alt={item.wine.title} className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.wine.title}</div>
                  <div className="text-sm text-gray-600">
                    {item.wine.annata} • {item.wine.region}
                  </div>
                  <div className="text-sm text-gray-600">
                    Quantity: {item.quantity} • €{(Number(item.price) || 0).toFixed(2)} each
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    €{((Number(item.quantity) || 0) * (Number(item.price) || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Shipping Information
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                      placeholder="Enter tracking number..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Shipping Address
                </h4>
                {order.shippingAddress ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-1 text-sm">
                      <div>{order.shippingAddress.street}</div>
                      <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                      <div>{order.shippingAddress.country}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                    No shipping address provided
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                placeholder="Add notes about this order..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Messages</h4>
            </div>
            
            {/* Message List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {order.messages?.length ? (
                order.messages.map((message) => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                      <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">{message.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No messages yet
                </div>
              )}
            </div>

            {/* Send Message */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Message to Buyer & Seller
              </label>
              <div className="flex space-x-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Refund Management</h4>
            
            {/* Refund Requests */}
            {order.refundRequests?.length ? (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Existing Refund Requests</h5>
                {order.refundRequests.map((refund) => (
                  <div key={refund.id} className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">€{(Number(refund.amount) || 0).toFixed(2)}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        refund.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {refund.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">{refund.reason}</div>
                    <div className="text-xs text-gray-500">{new Date(refund.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Process New Refund */}
            <div className="border-t pt-6">
              <h5 className="font-medium text-gray-900 mb-4">Process Refund</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={order.totalAmount}
                    value={formData.refundAmount}
                    onChange={(e) => handleInputChange('refundAmount', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Maximum: €{(Number(order.totalAmount) || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Reason
                  </label>
                  <input
                    type="text"
                    value={formData.refundReason}
                    onChange={(e) => handleInputChange('refundReason', e.target.value)}
                    placeholder="Reason for refund..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleRefund}
                  disabled={loading || !formData.refundAmount || !formData.refundReason}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}