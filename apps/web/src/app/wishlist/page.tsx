'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  HeartIcon,
  TrashIcon,
  ShoppingCartIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface WishlistItem {
  id: string
  userId: string
  wineId: string
  createdAt: string
  wine: {
    id: string
    title: string
    description: string
    price: number
    annata?: number
    region?: string
    country?: string
    producer?: string
    grapeVariety?: string
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
      avatar?: string
      verified: boolean
    }
  }
}

interface WishlistResponse {
  wishlistItems: WishlistItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchWishlist()
  }, [session, status, router])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wishlist?limit=50')
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }

      const data = await response.json()
      setWishlist(data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setError('Errore nel caricamento della lista desideri')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (wineId: string) => {
    try {
      setRemovingItems(prev => new Set(prev).add(wineId))
      
      const response = await fetch(`/api/wishlist/${wineId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove item from local state
        setWishlist(prev => {
          if (!prev) return null
          return {
            ...prev,
            wishlistItems: prev.wishlistItems.filter(item => item.wine.id !== wineId),
            total: prev.total - 1
          }
        })
      } else {
        console.error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(wineId)
        return newSet
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatWineType = (type: string) => {
    const typeMap: Record<string, string> = {
      'RED': 'Rosso',
      'WHITE': 'Bianco',
      'ROSE': 'Rosato',
      'SPARKLING': 'Spumante',
      'DESSERT': 'Dessert',
      'FORTIFIED': 'Liquoroso'
    }
    return typeMap[type] || type
  }

  const getWineTypeColor = (type: string) => {
    switch (type) {
      case 'RED': return 'bg-red-100 text-red-800 border-red-200'
      case 'WHITE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ROSE': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'SPARKLING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DESSERT': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'FORTIFIED': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <button 
            onClick={fetchWishlist}
            className="text-wine-600 hover:text-wine-700 font-medium"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HeartSolidIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">La Mia Lista Desideri</h1>
          </div>
          {wishlist && wishlist.total > 0 && (
            <p className="text-gray-600">
              {wishlist.total} {wishlist.total === 1 ? 'vino salvato' : 'vini salvati'}
            </p>
          )}
        </div>

        {/* Wishlist Content */}
        {!wishlist || wishlist.wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              La tua lista desideri è vuota
            </h2>
            <p className="text-gray-600 mb-8">
              Inizia ad aggiungere vini che ti interessano per non perderli di vista!
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700"
            >
              Sfoglia i Vini
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Wine Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {item.wine.images && item.wine.images.length > 0 ? (
                    <Image
                      src={item.wine.images[0]}
                      alt={item.wine.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleRemoveFromWishlist(item.wine.id)}
                      disabled={removingItems.has(item.wine.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      {removingItems.has(item.wine.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Wine Details */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {item.wine.title}
                    </h3>
                    {item.wine.producer && (
                      <p className="text-sm text-gray-600">{item.wine.producer}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getWineTypeColor(item.wine.wineType)}`}>
                      {formatWineType(item.wine.wineType)}
                    </span>
                    {item.wine.annata && (
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {item.wine.annata}
                      </div>
                    )}
                  </div>

                  {item.wine.region && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {item.wine.region}{item.wine.country && `, ${item.wine.country}`}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-wine-600">
                      {formatPrice(item.wine.price)}
                    </div>
                    <Link
                      href={`/wines/${item.wine.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Vedi
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}