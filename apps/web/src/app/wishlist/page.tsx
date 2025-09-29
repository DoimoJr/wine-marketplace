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
  CalendarIcon,
  UserIcon,
  StarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, UserIcon as UserSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Navbar'

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

interface FavoriteSellerItem {
  id: string
  userId: string
  sellerId: string
  createdAt: string
  seller: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    verified: boolean
    bio?: string
    location?: string
    createdAt: string
    _count: {
      wines: number
      reviews: number
    }
  }
}

interface FavoriteSellersResponse {
  favoriteItems: FavoriteSellerItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null)
  const [favoriteSellers, setFavoriteSellers] = useState<FavoriteSellersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [removingSellers, setRemovingSellers] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'wines' | 'sellers'>('wines')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch both wishlist and favorite sellers in parallel
      const [wishlistResponse, favoriteSellersResponse] = await Promise.all([
        fetch('/api/wishlist?limit=50'),
        fetch('/api/favorite-sellers?limit=50')
      ])

      if (!wishlistResponse.ok) {
        throw new Error('Failed to fetch wishlist')
      }

      if (!favoriteSellersResponse.ok) {
        throw new Error('Failed to fetch favorite sellers')
      }

      const [wishlistData, favoriteSellersData] = await Promise.all([
        wishlistResponse.json(),
        favoriteSellersResponse.json()
      ])

      setWishlist(wishlistData)
      setFavoriteSellers(favoriteSellersData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Errore nel caricamento dei preferiti')
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = fetchData // Keep for compatibility

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

  const handleRemoveFromFavorites = async (sellerId: string) => {
    try {
      setRemovingSellers(prev => new Set(prev).add(sellerId))

      const response = await fetch(`/api/favorite-sellers/${sellerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove seller from local state
        setFavoriteSellers(prev => {
          if (!prev) return null
          return {
            ...prev,
            favoriteItems: prev.favoriteItems.filter(item => item.seller.id !== sellerId),
            total: prev.total - 1
          }
        })
      } else {
        console.error('Failed to remove from favorites')
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
    } finally {
      setRemovingSellers(prev => {
        const newSet = new Set(prev)
        newSet.delete(sellerId)
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
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="wishlist" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="wishlist" />
        <div className="flex items-center justify-center py-16">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="wishlist" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <HeartSolidIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">I Miei Preferiti</h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('wines')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'wines'
                    ? 'border-wine-500 text-wine-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HeartIcon className="h-4 w-4" />
                  <span>Vini</span>
                  {wishlist && wishlist.total > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {wishlist.total}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sellers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sellers'
                    ? 'border-wine-500 text-wine-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Venditori</span>
                  {favoriteSellers && favoriteSellers.total > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {favoriteSellers.total}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'wines' ? (
          // Wines Section
          !wishlist || wishlist.wishlistItems.length === 0 ? (
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
          )
        ) : (
          // Sellers Section
          !favoriteSellers || favoriteSellers.favoriteItems.length === 0 ? (
            <div className="text-center py-16">
              <UserIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Nessun venditore preferito
              </h2>
              <p className="text-gray-600 mb-8">
                Inizia a seguire i venditori che ti interessano per vedere le loro nuove offerte!
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700"
              >
                Trova Venditori
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSellers.favoriteItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Seller Header */}
                  <div className="bg-gradient-to-r from-wine-50 to-wine-100 p-6 relative">
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveFromFavorites(item.seller.id)}
                      disabled={removingSellers.has(item.seller.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      {removingSellers.has(item.seller.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </button>

                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative">
                        {item.seller.avatar ? (
                          <Image
                            src={item.seller.avatar}
                            alt={item.seller.username}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-wine-200 rounded-full flex items-center justify-center">
                            <UserSolidIcon className="w-8 h-8 text-wine-600" />
                          </div>
                        )}
                        {item.seller.verified && (
                          <CheckBadgeIcon className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Seller Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.seller.firstName} {item.seller.lastName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">@{item.seller.username}</p>
                        {item.seller.location && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {item.seller.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seller Stats */}
                  <div className="p-4">
                    {item.seller.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {item.seller.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span>{item.seller._count.wines} vini</span>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 mr-1" />
                          <span>{item.seller._count.reviews} recensioni</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Membro dal {new Date(item.seller.createdAt).toLocaleDateString('it-IT', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <Link
                        href={`/sellers/${item.seller.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Vedi Profilo
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}