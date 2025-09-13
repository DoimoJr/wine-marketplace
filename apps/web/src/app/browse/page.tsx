'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import WineCard from '../../components/WineCard'

interface Wine {
  id: string
  title: string
  description: string
  price: number
  imageUrl?: string
  vintage?: number
  producer?: string
  region?: string
  country?: string
  wineType: string
  condition: string
  createdAt: string
}

export default function BrowsePage() {
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    country: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    vintage: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchWines()
  }, [currentPage, filters])

  const fetchWines = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(filters.type && { type: filters.type }),
        ...(filters.country && { country: filters.country }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.vintage && { vintage: filters.vintage })
      })

      const response = await fetch(`/api/wines?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setWines(data.wines || [])
        setTotalPages(Math.ceil(data.total / 12))
      } else {
        console.error('Failed to fetch wines')
        setWines([])
      }
    } catch (error) {
      console.error('Error fetching wines:', error)
      setWines([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchWines()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="browse" />

      {/* Header */}
      <div className="bg-gradient-to-r from-wine-50 to-gold-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Premium Wines
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our curated collection of exceptional wines from around the world
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-500"
              >
                <option value="">All Types</option>
                <option value="RED">Red Wine</option>
                <option value="WHITE">White Wine</option>
                <option value="ROSE">Rosé</option>
                <option value="SPARKLING">Sparkling</option>
                <option value="DESSERT">Dessert Wine</option>
                <option value="FORTIFIED">Fortified</option>
              </select>

              <select 
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-500"
              >
                <option value="">All Countries</option>
                <option value="Italy">Italy</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Germany">Germany</option>
                <option value="Portugal">Portugal</option>
                <option value="USA">USA</option>
                <option value="Australia">Australia</option>
                <option value="Chile">Chile</option>
                <option value="Argentina">Argentina</option>
              </select>

              <input 
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-500"
              />

              <input 
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-500"
              />

              <input 
                type="number"
                placeholder="Vintage Year"
                value={filters.vintage}
                onChange={(e) => handleFilterChange('vintage', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-500"
              />

              <input 
                type="text" 
                placeholder="Search wines..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-500"
              />
            </div>
            
            <div className="flex justify-center">
              <button 
                type="submit"
                className="bg-wine-600 text-white px-8 py-2 rounded-lg hover:bg-wine-700 transition-colors font-medium"
              >
                Search Wines
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading wines...' : `${wines.length} wines found`}
          </p>
          <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
            <option>Sort by: Most Recent</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Vintage: Newest First</option>
            <option>Vintage: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Wine Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wines.length > 0 ? (
              wines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No wines found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => {
                    setFilters({
                      type: '',
                      country: '',
                      search: '',
                      minPrice: '',
                      maxPrice: '',
                      vintage: ''
                    })
                    setCurrentPage(1)
                  }}
                  className="text-wine-600 hover:text-wine-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page
                      ? 'bg-wine-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            {totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-gray-500">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-wine-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}