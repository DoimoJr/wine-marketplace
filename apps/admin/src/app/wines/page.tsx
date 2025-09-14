'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import WineEditModal from '@/components/admin/modals/WineEditModal'
import { useToast } from '@/components/admin/common/Toast'
import { 
  PencilIcon, 
  EyeIcon, 
  PhotoIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface Wine {
  id: string
  title: string
  description: string
  price: number
  annata?: number
  region?: string
  country?: string
  producer?: string
  grapeVariety?: string
  alcoholContent?: number
  volume?: number
  wineType: string
  condition: string
  quantity: number
  status: string
  images: string[]
  seller: {
    id: string
    username: string
    firstName: string
    lastName: string
    verified: boolean
  }
  createdAt: string
}

export default function WinesManagement() {
  const [wines, setWines] = useState<Wine[]>([])
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
    active: 0,
    rejected: 0
  })
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    fetchWines()
    if (!searchTerm) {
      fetchFilterCounts()
    }
  }, [pagination.page, searchTerm, filter])

  const fetchWines = async () => {
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
      
      const response = await fetch(`http://localhost:3010/api/admin/wines?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setWines(data.wines || [])
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }))
      } else {
        // Fallback to mock data if API fails
        const mockWines: Wine[] = [
          {
            id: '1',
            title: 'Château Margaux 2015',
            description: 'Exceptional annata from one of Bordeaux\'s most prestigious estates',
            price: 899.99,
            annata: 2015,
            region: 'Margaux',
            country: 'France',
            producer: 'Château Margaux',
            grapeVariety: 'Cabernet Sauvignon, Merlot',
            alcoholContent: 13.5,
            volume: 750,
            wineType: 'RED',
            condition: 'EXCELLENT',
            quantity: 1,
            status: 'ACTIVE',
            images: [
              'https://images.unsplash.com/photo-1558346648-9757f2fa4c24?w=400&h=600',
              'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=400&h=600'
            ],
            seller: {
              id: 'seller1',
              username: 'winecollector',
              firstName: 'John',
              lastName: 'Doe',
              verified: true
            },
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            title: 'Dom Pérignon 2012',
            description: 'Legendary champagne with exceptional aging potential',
            price: 199.99,
            annata: 2012,
            region: 'Champagne',
            country: 'France',
            producer: 'Moët & Chandon',
            grapeVariety: 'Chardonnay, Pinot Noir',
            alcoholContent: 12.5,
            volume: 750,
            wineType: 'SPARKLING',
            condition: 'VERY_GOOD',
            quantity: 2,
            status: 'ACTIVE',
            images: [
              'https://images.unsplash.com/photo-1551024739-9563696665db?w=400&h=600'
            ],
            seller: {
              id: 'seller2',
              username: 'champagnelover',
              firstName: 'Marie',
              lastName: 'Dubois',
              verified: true
            },
            createdAt: '2024-01-10T14:20:00Z'
          },
          {
            id: '3',
            title: 'Fake Wine Listing',
            description: 'Suspicious wine with unclear provenance',
            price: 50.00,
            annata: 1900,
            region: 'Unknown',
            country: 'Unknown',
            producer: 'Fake Producer',
            grapeVariety: 'Unknown',
            alcoholContent: 15.0,
            volume: 750,
            wineType: 'RED',
            condition: 'FAIR',
            quantity: 100,
            status: 'INACTIVE',
            images: [],
            seller: {
              id: 'seller3',
              username: 'suspicious',
              firstName: 'Fake',
              lastName: 'Seller',
              verified: false
            },
            createdAt: '2024-01-20T09:15:00Z'
          }
        ]
        setWines(mockWines)
        setPagination(prev => ({ ...prev, total: mockWines.length, totalPages: 1 }))
      }
    } catch (error) {
      console.error('Error fetching wines:', error)
      toast.error('Failed to fetch wines', 'Please check your connection and try again')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterCounts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return

      // Fetch counts for each status
      const [allResponse, soldResponse, activeResponse, inactiveResponse] = await Promise.all([
        fetch('http://localhost:3010/api/admin/wines?page=1&limit=1', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:3010/api/admin/wines?page=1&limit=1&status=SOLD', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:3010/api/admin/wines?page=1&limit=1&status=ACTIVE', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch('http://localhost:3010/api/admin/wines?page=1&limit=1&status=INACTIVE', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ])

      const [allData, soldData, activeData, inactiveData] = await Promise.all([
        allResponse.ok ? allResponse.json() : { total: 0 },
        soldResponse.ok ? soldResponse.json() : { total: 0 },
        activeResponse.ok ? activeResponse.json() : { total: 0 },
        inactiveResponse.ok ? inactiveResponse.json() : { total: 0 }
      ])

      setFilterCounts({
        all: allData.total || 0,
        pending: soldData.total || 0,
        active: activeData.total || 0,
        rejected: inactiveData.total || 0
      })
    } catch (error) {
      console.error('Error fetching filter counts:', error)
    }
  }

  const handleEditWine = (wine: Wine) => {
    setSelectedWine(wine)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setSelectedWine(null)
    setIsEditModalOpen(false)
  }

  const handleWineUpdated = () => {
    fetchWines()
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

  const getFilteredWines = () => {
    if (filter === 'all') return wines
    return wines.filter(wine => wine.status.toLowerCase() === filter.toLowerCase())
  }

  const getStatusColor = (status: string) => {
    const colors = {
      SOLD: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      RESERVED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.ACTIVE
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      SOLD: ClockIcon,
      ACTIVE: CheckCircleIcon,
      INACTIVE: XCircleIcon,
      RESERVED: TagIcon
    }
    const Icon = icons[status as keyof typeof icons] || ClockIcon
    return <Icon className="h-3 w-3 mr-1" />
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      EXCELLENT: 'bg-green-100 text-green-800',
      VERY_GOOD: 'bg-blue-100 text-blue-800',
      GOOD: 'bg-yellow-100 text-yellow-800',
      FAIR: 'bg-orange-100 text-orange-800'
    }
    return colors[condition as keyof typeof colors] || colors.GOOD
  }

  const filteredWines = getFilteredWines()

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Catalogo Vini</h1>
              <p className="text-gray-600">Rivedi, approva e gestisci le inserzioni di vini</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca vini..."
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
                { key: 'all', label: 'Tutti i Vini', count: filterCounts.all },
                { key: 'pending', label: 'In Revisione', count: filterCounts.pending },
                { key: 'active', label: 'Attivi', count: filterCounts.active },
                { key: 'rejected', label: 'Rifiutati', count: filterCounts.rejected }
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

          {/* Wines Grid */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Caricamento vini...</p>
              </div>
            ) : filteredWines.length === 0 ? (
              <div className="p-12 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun vino trovato</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Prova a modificare i termini di ricerca' : 'Nessun vino corrisponde al filtro selezionato'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredWines.map((wine) => (
                  <div key={wine.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Wine Image */}
                    <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                      {wine.images && wine.images.length > 0 ? (
                        <img
                          src={wine.images[0]}
                          alt={wine.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Wine Info */}
                    <div className="p-4">
                      {/* Header with status */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate" title={wine.title}>
                            {wine.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {wine.producer} • {wine.annata}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(wine.status)}`}>
                          {getStatusIcon(wine.status)}
                          {wine.status}
                        </span>
                      </div>

                      {/* Price and Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-lg font-bold text-green-600">
                          <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                          {wine.price.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {wine.region}, {wine.country}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(wine.condition)}`}>
                            {wine.condition}
                          </span>
                          <span className="text-xs text-gray-500">
                            Qty: {wine.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="border-t pt-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Venditore: @{wine.seller.username}</span>
                          {wine.seller.verified && (
                            <CheckCircleIcon className="h-4 w-4 ml-1 text-green-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Listed {new Date(wine.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditWine(wine)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Modifica
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total wines)
                  </div>
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
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
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wine Edit Modal */}
        <WineEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          wine={selectedWine}
          onWineUpdated={handleWineUpdated}
        />
      </AdminLayout>
    </ProtectedRoute>
  )
}