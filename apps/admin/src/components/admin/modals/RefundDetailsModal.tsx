'use client'

import { useState } from 'react'
import Modal from './Modal'
import { 
  CurrencyDollarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

interface RefundRequest {
  id: string
  reason: 'DAMAGED_ITEM' | 'ITEM_NOT_RECEIVED' | 'ITEM_NOT_AS_DESCRIBED' | 'CHANGED_MIND' | 'SELLER_CANCELLED' | 'OTHER'
  details?: string
  amount: number | string
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'PROCESSED' | 'COMPLETED'
  adminNotes?: string
  processedAt?: string
  createdAt: string
  updatedAt: string
  order: {
    id: string
    orderNumber: string
    totalAmount: number | string
    buyer: {
      id: string
      username: string
      email: string
    }
    seller: {
      id: string
      username: string
      email: string
    }
    items: Array<{
      wine: {
        title: string
        annata?: number
        region?: string
      }
      quantity: number
      price: number | string
    }>
  }
  user: {
    id: string
    username: string
    email: string
  }
}

interface RefundDetailsModalProps {
  refund: RefundRequest
  onClose: () => void
  onApprove: (adminNotes?: string) => void
  onDeny: (adminNotes?: string) => void
}

const reasonLabels = {
  'DAMAGED_ITEM': 'Damaged Item',
  'ITEM_NOT_RECEIVED': 'Item Not Received',
  'ITEM_NOT_AS_DESCRIBED': 'Not As Described',
  'CHANGED_MIND': 'Changed Mind',
  'SELLER_CANCELLED': 'Seller Cancelled',
  'OTHER': 'Other'
}

const statusLabels = {
  'PENDING': 'Pending Review',
  'APPROVED': 'Approved',
  'DENIED': 'Denied',
  'PROCESSED': 'Processed',
  'COMPLETED': 'Completed'
}

const statusColors = {
  'PENDING': 'text-yellow-600 bg-yellow-100',
  'APPROVED': 'text-green-600 bg-green-100',
  'DENIED': 'text-red-600 bg-red-100',
  'PROCESSED': 'text-blue-600 bg-blue-100',
  'COMPLETED': 'text-purple-600 bg-purple-100'
}

const statusIcons = {
  'PENDING': ClockIcon,
  'APPROVED': CheckCircleIcon,
  'DENIED': XCircleIcon,
  'PROCESSED': CurrencyDollarIcon,
  'COMPLETED': CheckCircleIcon
}

export default function RefundDetailsModal({ 
  refund, 
  onClose, 
  onApprove, 
  onDeny 
}: RefundDetailsModalProps) {
  const [adminNotes, setAdminNotes] = useState(refund.adminNotes || '')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove(adminNotes)
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    try {
      await onDeny(adminNotes)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `€${numAmount.toFixed(2)}`
  }

  const StatusIcon = statusIcons[refund.status]

  const footer = refund.status === 'PENDING' ? (
    <>
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleDeny}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Deny Refund'}
      </button>
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Approve Refund'}
      </button>
    </>
  ) : (
    <button
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Close
    </button>
  )

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={`Refund Request REF-${refund.id.slice(-8)}`}
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Status & Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[refund.status]}`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusLabels[refund.status]}
              </div>
              <div className="text-sm text-gray-500">
                Requested on {formatDate(refund.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(refund.amount)}
              </div>
              <div className="text-sm text-gray-500">
                of {formatCurrency(refund.order.totalAmount)} total
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="border rounded-lg p-4">
          <h4 className="flex items-center text-lg font-medium text-gray-900 mb-3">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Order Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Number</dt>
              <dd className="text-sm text-gray-900">{refund.order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Total</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(refund.order.totalAmount)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Buyer</dt>
              <dd className="text-sm text-gray-900">{refund.order.buyer.username}</dd>
              <dd className="text-xs text-gray-500">{refund.order.buyer.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Seller</dt>
              <dd className="text-sm text-gray-900">{refund.order.seller.username}</dd>
              <dd className="text-xs text-gray-500">{refund.order.seller.email}</dd>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-4">
            <dt className="text-sm font-medium text-gray-500 mb-2">Order Items</dt>
            <div className="space-y-2">
              {refund.order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.wine.title} {item.wine.annata && `(${item.wine.annata})`}
                    </div>
                    {item.wine.region && (
                      <div className="text-gray-500">{item.wine.region}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.price)}</div>
                    <div className="text-gray-500">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refund Request Details */}
        <div className="border rounded-lg p-4">
          <h4 className="flex items-center text-lg font-medium text-gray-900 mb-3">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Refund Request Details
          </h4>
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Reason</dt>
              <dd className="text-sm text-gray-900">{reasonLabels[refund.reason]}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Requested Amount</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(refund.amount)}</dd>
            </div>
            {refund.details && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer Details</dt>
                <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {refund.details}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Requested By</dt>
              <dd className="text-sm text-gray-900">
                {refund.user.username} ({refund.user.email})
              </dd>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="border rounded-lg p-4">
          <h4 className="flex items-center text-lg font-medium text-gray-900 mb-3">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Admin Notes
          </h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
                Notes (visible to customer if refund is processed)
              </label>
              <textarea
                id="adminNotes"
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={refund.status !== 'PENDING'}
                placeholder="Add notes about your decision..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {refund.adminNotes && refund.status !== 'PENDING' && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm font-medium text-blue-900">Previous Admin Decision:</div>
                <div className="text-sm text-blue-800 mt-1">{refund.adminNotes}</div>
                {refund.processedAt && (
                  <div className="text-xs text-blue-600 mt-1">
                    Processed on {formatDate(refund.processedAt)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warning for pending refunds */}
        {refund.status === 'PENDING' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Review Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This refund request requires your review. Please examine the details carefully 
                    and add any relevant notes before approving or denying the request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}