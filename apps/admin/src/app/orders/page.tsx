'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import OrderEditModal from '@/components/admin/modals/OrderEditModal'
import { useToast } from '@/components/admin/common/Toast'
import { 
  ShoppingBagIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BanknotesIcon
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
  items?: OrderItem[]
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
  _count?: {
    items: number
    messages: number
  }
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { user } = useAuth()
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
    if (!searchTerm) {
      fetchFilterCounts()
    }
  }, [pagination.page, searchTerm, filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('adminToken')
      if (!token) {
        console.error('No admin token found')
        return
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filter !== 'all' && { status: filter.toUpperCase() })
      })
      
      const response = await fetch(`http://localhost:3010/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }))
      } else {
        // Fallback to mock data if API fails
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            status: 'PENDING',
            totalAmount: 249.99,
            shippingFee: 15.00,
            paymentMethod: 'PayPal',
            trackingNumber: undefined,
            shippingAddress: {
              street: '123 Main St',
              city: 'Paris',
              postalCode: '75001',
              country: 'France'
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            buyer: {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phone: '+33 1 23 45 67 89'
            },
            seller: {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              phone: '+33 1 98 76 54 32'
            },
            items: [
              {
                id: '1',
                quantity: 1,
                price: 234.99,
                wine: {
                  id: '1',
                  title: 'Château Margaux',
                  annata: 2015,
                  region: 'Bordeaux',
                  images: ['https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=300&h=300&fit=crop']
                }
              }
            ],
            _count: { items: 1, messages: 2 },
            messages: [
              {
                id: '1',
                content: 'Order confirmed. Processing payment.',
                sender: 'System',
                createdAt: '2024-01-15T10:35:00Z'
              }
            ]
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            status: 'SHIPPED',
            totalAmount: 89.50,
            shippingFee: 12.00,
            paymentMethod: 'Credit Card',
            trackingNumber: 'TRK123456789',
            shippingAddress: {
              street: '456 Oak Ave',
              city: 'Lyon',
              postalCode: '69001',
              country: 'France'
            },
            createdAt: '2024-01-14T14:15:00Z',
            updatedAt: '2024-01-16T09:20:00Z',
            buyer: {
              id: '3',
              firstName: 'Alice',
              lastName: 'Johnson',
              email: 'alice.johnson@example.com'
            },
            seller: {
              id: '4',
              firstName: 'Bob',
              lastName: 'Wilson',
              email: 'bob.wilson@example.com'
            },
            items: [
              {
                id: '2',
                quantity: 2,
                price: 38.75,
                wine: {
                  id: '2',
                  title: 'Chianti Classico',
                  annata: 2020,
                  region: 'Tuscany',
                  images: ['https://images.unsplash.com/photo-1551524164-687a55dd1126?w=300&h=300&fit=crop']
                }
              }
            ],
            _count: { items: 1, messages: 0 }
          }
        ]
        setOrders(mockOrders)
        setPagination(prev => ({ ...prev, total: mockOrders.length, totalPages: 1 }))
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders', 'Please check your connection and try again')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterCounts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      const response = await fetch('http://localhost:3010/api/admin/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFilterCounts({
          all: data.total || 0,
          pending: data.pending || 0,
          shipped: data.shipped || 0,
          delivered: data.delivered || 0,
          cancelled: data.cancelled || 0
        })
      }
    } catch (error) {
      console.error('Error fetching filter counts:', error)
    }
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setSelectedOrder(null)
    setIsEditModalOpen(false)
  }

  const handleOrderUpdated = () => {
    fetchOrders()
    fetchFilterCounts()
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getFilteredOrders = () => {
    if (filter === 'all') return orders
    if (filter === 'pending') return orders.filter(o => o.status === 'PENDING')
    if (filter === 'shipped') return orders.filter(o => o.status === 'SHIPPED')
    if (filter === 'delivered') return orders.filter(o => o.status === 'DELIVERED')
    if (filter === 'cancelled') return orders.filter(o => o.status === 'CANCELLED')
    return orders
  }

  const getStatusBadgeColor = (status: string) => {
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
    return <IconComponent className="h-4 w-4" />
  }

  const getRefundBadgeColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      DENIED: 'bg-red-100 text-red-800 border-red-200',
      PROCESSED: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return colors[status as keyof typeof colors] || colors.PENDING
  }

  const hasRefunds = (order: Order) => {
    return order.refundRequests && order.refundRequests.length > 0
  }

  const getRefundStatus = (order: Order) => {
    if (!hasRefunds(order)) return null
    const latestRefund = order.refundRequests![0] // Assuming refundRequests are ordered by latest first
    return latestRefund
  }

  const filteredOrders = getFilteredOrders()

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Ordini</h1>
              <p className="text-gray-600">Monitora e gestisci tutti gli ordini del marketplace</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca ordini..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'Tutti gli Ordini', count: filterCounts.all },
                { key: 'pending', label: 'In Attesa', count: filterCounts.pending },
                { key: 'shipped', label: 'Spediti', count: filterCounts.shipped },
                { key: 'delivered', label: 'Consegnati', count: filterCounts.delivered },
                { key: 'cancelled', label: 'Annullati', count: filterCounts.cancelled }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Caricamento ordini...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun ordine trovato</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Prova a modificare i termini di ricerca' : 'Nessun ordine corrisponde al filtro selezionato'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Articoli
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((orderData) => (
                      <tr key={orderData.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                              <ShoppingBagIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {orderData.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {orderData.trackingNumber ? `Codice: ${orderData.trackingNumber}` : 'Nessun codice'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {orderData.buyer.firstName} {orderData.buyer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{orderData.buyer.email}</div>
                          <div className="text-xs text-gray-400">
                            Venditore: {orderData.seller.firstName} {orderData.seller.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {orderData.items && orderData.items.length > 0 ? (
                              orderData.items.map((item, index) => (
                                <div key={item.id} className="flex items-center space-x-2 mb-1">
                                  <span>{item.wine.title} ({item.wine.annata})</span>
                                  <span className="text-gray-500">×{item.quantity}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-500">Nessun articolo</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {orderData._count?.items || 0} articol{(orderData._count?.items || 0) !== 1 ? 'i' : 'o'}
                            </span>
                            {(orderData._count?.messages || 0) > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {orderData._count?.messages || 0} messaggio{(orderData._count?.messages || 0) !== 1 ? 'i' : ''}
                              </span>
                            )}
                            {hasRefunds(orderData) && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRefundBadgeColor(getRefundStatus(orderData)!.status)}`}>
                                <BanknotesIcon className="h-3 w-3 mr-1" />
                                Rimborso {getRefundStatus(orderData)!.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            €{(Number(orderData.totalAmount) || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            +€{(Number(orderData.shippingFee) || 0).toFixed(2)} spedizione
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(orderData.status)}`}>
                            {getStatusIcon(orderData.status)}
                            <span className="ml-1">{orderData.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(orderData.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditOrder(orderData)}
                              className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Modifica ordine"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/orders/${orderData.id}`)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Vedi dettagli"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Pagina {pagination.page} di {pagination.totalPages} ({pagination.total} ordini totali)
                  </div>
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Precedente
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNumber = i + 1
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pagination.page === pageNumber
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Successiva
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Edit Modal */}
        <OrderEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      </AdminLayout>
    </ProtectedRoute>
  )
}