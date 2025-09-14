'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import RefundDetailsModal from '@/components/admin/modals/RefundDetailsModal'
import { useToast } from '@/components/admin/common/Toast'
import { 
  CurrencyDollarIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
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
    totalAmount: number
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
    }>
  }
  user: {
    id: string
    username: string
    email: string
  }
}

interface FilterCounts {
  total: number
  pending: number
  approved: number
  denied: number
  processed: number
  completed: number
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
  'PENDING': 'Pending',
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

export default function RefundsPage() {
  const { user } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    processed: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRefunds = async (page: number = 1, search: string = '', status?: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      if (!token) {
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      // TODO: Add search support to API
      // if (search) params.append('search', search)
      if (status && status !== 'all') params.append('status', status)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/refunds?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch refunds')
      }

      const data = await response.json()
      setRefunds(data.refunds || [])
      setCurrentPage(data.page || 1)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching refunds:', error)
      showError('Error fetching refunds')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterCounts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/refunds/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch filter counts')

      const data = await response.json()
      
      setFilterCounts({
        total: data.total || 0,
        pending: data.pending || 0,
        approved: data.approved || 0,
        denied: data.denied || 0,
        processed: data.processed || 0,
        completed: data.completed || 0
      })
    } catch (error) {
      console.error('Error fetching filter counts:', error)
    }
  }

  useEffect(() => {
    fetchRefunds(currentPage, searchTerm, activeFilter)
    fetchFilterCounts()
  }, [currentPage, activeFilter])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    fetchRefunds(1, term, activeFilter)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleRefundAction = async (refundId: string, action: 'APPROVED' | 'DENIED', adminNotes?: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/refunds/${refundId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          adminNotes
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action.toLowerCase()} refund`)
      }

      showSuccess(`Refund ${action.toLowerCase()} successfully`)
      fetchRefunds(currentPage, searchTerm, activeFilter)
      fetchFilterCounts()
      setSelectedRefund(null)
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} refund:`, error)
      showError(`Error ${action.toLowerCase()} refund`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `€${numAmount.toFixed(2)}`
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and manage refund requests from customers
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search refunds..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => handleFilterChange('all')}
              className={`${
                activeFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-md px-3 py-2 text-sm font-medium`}
            >
              All Refunds ({filterCounts.total})
            </button>
            <button
              onClick={() => handleFilterChange('PENDING')}
              className={`${
                activeFilter === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-md px-3 py-2 text-sm font-medium`}
            >
              Pending ({filterCounts.pending})
            </button>
            <button
              onClick={() => handleFilterChange('APPROVED')}
              className={`${
                activeFilter === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-md px-3 py-2 text-sm font-medium`}
            >
              Approved ({filterCounts.approved})
            </button>
            <button
              onClick={() => handleFilterChange('DENIED')}
              className={`${
                activeFilter === 'DENIED'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-md px-3 py-2 text-sm font-medium`}
            >
              Denied ({filterCounts.denied})
            </button>
            <button
              onClick={() => handleFilterChange('PROCESSED')}
              className={`${
                activeFilter === 'PROCESSED'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } rounded-md px-3 py-2 text-sm font-medium`}
            >
              Processed ({filterCounts.processed})
            </button>
          </nav>

          {/* Refunds Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refund Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order & Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Loading refunds...
                      </td>
                    </tr>
                  ) : refunds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No refund requests found
                      </td>
                    </tr>
                  ) : (
                    refunds.map((refund) => {
                      const StatusIcon = statusIcons[refund.status]
                      return (
                        <tr key={refund.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-10 w-10 text-gray-400" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  REF-{refund.id.slice(-8)}
                                </div>
                                {refund.details && (
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {refund.details}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{refund.order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{refund.user.username}</div>
                            {refund.order.items[0] && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {refund.order.items[0].wine.title}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reasonLabels[refund.reason]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(refund.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              of {formatCurrency(refund.order.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[refund.status]}`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {statusLabels[refund.status]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(refund.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedRefund(refund)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {refund.status === 'PENDING' && (
                                <button
                                  onClick={() => setSelectedRefund(refund)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refund Details Modal */}
        {selectedRefund && (
          <RefundDetailsModal
            refund={selectedRefund}
            onClose={() => setSelectedRefund(null)}
            onApprove={(adminNotes) => handleRefundAction(selectedRefund.id, 'APPROVED', adminNotes)}
            onDeny={(adminNotes) => handleRefundAction(selectedRefund.id, 'DENIED', adminNotes)}
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  )
}