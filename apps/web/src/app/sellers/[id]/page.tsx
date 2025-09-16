'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ShieldCheckIcon,
  HeartIcon,
  EyeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, UserIcon as UserSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../../components/Navbar'

interface Seller {
  id: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location?: string
  verified: boolean
  createdAt: string
  totalSales: number
  totalPurchases: number
  averageRating: number
  totalReviews: number
  _count: {
    wines: number
    orders: number
    purchases: number
    reviewsReceived: number
  }
}

interface Wine {
  id: string
  title: string
  description: string
  price: number
  annata?: number
  region?: string
  country?: string
  producer?: string
  wineType: string
  condition: string
  quantity: number
  images: string[]
  createdAt: string
}

interface WinesResponse {
  wines: Wine[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function SellerProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [wines, setWines] = useState<WinesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [winesLoading, setWinesLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSellerProfile(params.id as string)
      fetchSellerWines(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (seller?.id && session?.user) {
      checkFollowStatus(seller.id)
    } else {
      setIsFollowing(false)
    }
  }, [seller?.id, session?.user])

  const fetchSellerProfile = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Venditore non trovato')
        } else {
          setError('Errore nel caricamento del profilo')
        }
        return
      }

      const data = await response.json()
      setSeller(data)
    } catch (error) {
      console.error('Error fetching seller profile:', error)
      setError('Errore nel caricamento del profilo')
    } finally {
      setLoading(false)
    }
  }

  const fetchSellerWines = async (id: string) => {
    try {
      setWinesLoading(true)
      const response = await fetch(`/api/users/${id}/wines?limit=12`)

      if (response.ok) {
        const data = await response.json()
        setWines(data)
      }
    } catch (error) {
      console.error('Error fetching seller wines:', error)
    } finally {
      setWinesLoading(false)
    }
  }

  const checkFollowStatus = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/favorite-sellers/check/${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFavorite)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!session?.user) {
      // Redirect to login or show message
      return
    }

    if (!seller) return

    try {
      setFollowLoading(true)

      if (isFollowing) {
        const response = await fetch(`/api/favorite-sellers/${seller.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setIsFollowing(false)
        }
      } else {
        const response = await fetch('/api/favorite-sellers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sellerId: seller.id })
        })

        if (response.ok) {
          setIsFollowing(true)
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="browse" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="browse" />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <Link href="/browse" className="text-wine-600 hover:text-wine-700 font-medium">
              Torna ai vini
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="browse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-wine-50 to-wine-100 px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                {seller.avatar ? (
                  <Image
                    src={seller.avatar}
                    alt={seller.username}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-30 h-30 bg-wine-200 rounded-full flex items-center justify-center">
                    <UserSolidIcon className="w-16 h-16 text-wine-600" />
                  </div>
                )}
                {seller.verified && (
                  <CheckBadgeIcon className="absolute -bottom-2 -right-2 w-8 h-8 text-blue-500 bg-white rounded-full" />
                )}
              </div>

              {/* Seller Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {seller.firstName} {seller.lastName}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">@{seller.username}</p>
                    {seller.location && (
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {seller.location}
                      </div>
                    )}
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      followLoading
                        ? 'opacity-50 cursor-wait bg-gray-100 text-gray-700'
                        : isFollowing
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-wine-600 text-white hover:bg-wine-700'
                    }`}
                  >
                    {followLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : isFollowing ? (
                      <HeartSolidIcon className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                    <span>
                      {followLoading ? 'Caricamento...' : isFollowing ? 'Seguito' : 'Segui'}
                    </span>
                  </button>
                </div>

                {seller.bio && (
                  <p className="text-gray-700 mb-4 text-center sm:text-left">{seller.bio}</p>
                )}

                <div className="text-sm text-gray-500 mb-4 text-center sm:text-left">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Su Wine Marketplace dal {new Date(seller.createdAt).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{seller._count.wines}</div>
                <div className="text-sm text-gray-600">Vini in vendita</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{seller.totalSales}</div>
                <div className="text-sm text-gray-600">Vendite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{seller.totalReviews}</div>
                <div className="text-sm text-gray-600">Recensioni</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  {renderStars(seller.averageRating)}
                </div>
                <div className="text-sm text-gray-600">
                  {seller.averageRating > 0 ? seller.averageRating.toFixed(1) : 'Nessuna'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wines Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Vini in vendita ({wines?.total || 0})
            </h2>
          </div>

          <div className="p-6">
            {winesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine-600 mx-auto"></div>
              </div>
            ) : !wines || wines.wines.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Nessun vino in vendita al momento</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wines.wines.map((wine) => (
                  <div key={wine.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Wine Image */}
                    <div className="aspect-square bg-gray-100 relative">
                      {wine.images && wine.images.length > 0 ? (
                        <Image
                          src={wine.images[0]}
                          alt={wine.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Wine Details */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                        {wine.title}
                      </h3>

                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getWineTypeColor(wine.wineType)}`}>
                          {formatWineType(wine.wineType)}
                        </span>
                        {wine.annata && (
                          <span className="text-xs text-gray-500">{wine.annata}</span>
                        )}
                      </div>

                      {wine.region && (
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {wine.region}{wine.country && `, ${wine.country}`}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-wine-600">
                          {formatPrice(wine.price)}
                        </div>
                        <Link
                          href={`/wines/${wine.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Vedi
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {wines && wines.totalPages > 1 && (
              <div className="mt-8 text-center">
                <Link
                  href={`/browse?seller=${seller.id}`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-wine-600 bg-wine-50 hover:bg-wine-100"
                >
                  Vedi tutti i vini
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}