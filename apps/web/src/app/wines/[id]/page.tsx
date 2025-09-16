'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  ShareIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../../components/Navbar'

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
    avatar?: string
    verified: boolean
    bio?: string
    location?: string
    createdAt: string
  }
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
  createdAt: string
  updatedAt: string
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewer: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  createdAt: string
}

export default function WinePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [wine, setWine] = useState<Wine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSellerFavorite, setIsSellerFavorite] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [sellerFavoriteLoading, setSellerFavoriteLoading] = useState(false)
  const [cartQuantity, setCartQuantity] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchWine(params.id as string)
      if (session?.user) {
        fetchCartQuantity(params.id as string)
      }
    }
  }, [params.id, session?.user])

  useEffect(() => {
    if (params.id && session?.user) {
      // Solo quando la sessione è completamente caricata con user data
      checkWishlistStatus(params.id as string)
    } else {
      // Se non autenticato, il cuore dovrebbe essere vuoto e cliccabile
      setIsFavorite(false)
    }
  }, [params.id, session?.user])

  useEffect(() => {
    if (wine?.seller?.id && session?.user) {
      checkSellerFavoriteStatus(wine.seller.id)
    } else {
      setIsSellerFavorite(false)
    }
  }, [wine?.seller?.id, session?.user])

  // Reset quantità se supera quelle disponibili (ad es. dopo acquisto di qualcun altro)
  useEffect(() => {
    if (wine && quantity > wine.quantity) {
      setQuantity(Math.max(1, Math.min(wine.quantity, 1)))
    }
  }, [wine?.quantity, quantity])

  const fetchWine = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/wines/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Vino non trovato')
        } else {
          setError('Errore nel caricamento del vino')
        }
        return
      }

      const data = await response.json()
      setWine(data)
    } catch (error) {
      console.error('Error fetching wine:', error)
      setError('Errore nel caricamento del vino')
    } finally {
      setLoading(false)
    }
  }

  const fetchCartQuantity = async (wineId: string) => {
    try {
      if (!session?.user) {
        setCartQuantity(0)
        return
      }

      console.log('🛒 Fetching cart quantity for wine:', wineId)
      const response = await fetch('/api/cart')

      if (!response.ok) {
        console.log('❌ Cart not found or error, assuming 0 quantity')
        setCartQuantity(0)
        return
      }

      const cartData = await response.json()
      console.log('📦 Cart data received:', cartData)

      // Trova la quantità di questo specifico vino nel carrello
      let totalQuantityInCart = 0

      if (cartData.sellers && Array.isArray(cartData.sellers)) {
        cartData.sellers.forEach((seller: any) => {
          if (seller.items && Array.isArray(seller.items)) {
            seller.items.forEach((item: any) => {
              if (item.wine && item.wine.id === wineId) {
                totalQuantityInCart += item.quantity
              }
            })
          }
        })
      }

      console.log(`🔢 Total quantity of wine ${wineId} in cart: ${totalQuantityInCart}`)
      setCartQuantity(totalQuantityInCart)
    } catch (error) {
      console.error('❌ Error fetching cart quantity:', error)
      setCartQuantity(0)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'MINT': return 'text-green-600 bg-green-50 border-green-200'
      case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200'
      case 'VERY_GOOD': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'GOOD': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'FAIR': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'POOR': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatCondition = (condition: string) => {
    const conditionMap: Record<string, string> = {
      'MINT': 'Perfetto',
      'EXCELLENT': 'Eccellente',
      'VERY_GOOD': 'Molto Buono',
      'GOOD': 'Buono',
      'FAIR': 'Discreto',
      'POOR': 'Scadente'
    }
    return conditionMap[condition] || condition
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

  const checkWishlistStatus = async (wineId: string, retryCount = 0) => {
    if (!session?.user) return
    
    try {
      const response = await fetch(`/api/wishlist/check/${wineId}`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isInWishlist)
        console.log('✅ Wishlist status loaded:', data.isInWishlist)
      } else if (response.status === 401 && retryCount < 2) {
        // Retry on 401 (unauthorized) up to 2 times with delay
        console.log(`🔄 Retrying wishlist check (attempt ${retryCount + 1})`)
        setTimeout(() => {
          checkWishlistStatus(wineId, retryCount + 1)
        }, 1000) // Wait 1 second before retry
      } else {
        console.warn('⚠️ Failed to check wishlist status:', response.status)
        setIsFavorite(false) // Default to false when API fails
      }
    } catch (error) {
      console.error('❌ Error checking wishlist status:', error)
      // Set to false as fallback when unable to check status
      setIsFavorite(false)
    }
  }

  const handleWishlistToggle = async () => {
    console.log('❤️ Heart button clicked!', { 
      session: !!session, 
      wine: !!wine, 
      wishlistLoading,
      currentState: isFavorite ? 'favorited' : 'not favorited'
    })
    
    if (!session?.user) {
      console.log('🔐 No session or user data, redirecting to login')
      router.push('/login')
      return
    }

    if (!wine) {
      console.log('⚠️ No wine data available')
      return
    }

    if (wishlistLoading) {
      console.log('⏳ Already processing wishlist request')
      return
    }

    try {
      setWishlistLoading(true)
      
      if (isFavorite) {
        // Remove from wishlist
        console.log('🗑️ Removing from wishlist:', wine.id)
        const response = await fetch(`/api/wishlist/${wine.id}`, {
          method: 'DELETE',
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          setIsFavorite(false)
          console.log('✅ Successfully removed from wishlist')
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to remove from wishlist:', response.status, errorText)
          if (response.status === 401) {
            console.log('🔐 Session expired, redirecting to login')
            router.push('/login')
          } else {
            alert('Errore durante la rimozione dalla wishlist. Riprova.')
          }
        }
      } else {
        // Add to wishlist
        console.log('➕ Adding to wishlist:', wine.id)
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wineId: wine.id }),
          signal: AbortSignal.timeout(10000)
        })
        
        if (response.ok) {
          setIsFavorite(true)
          console.log('✅ Successfully added to wishlist')
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to add to wishlist:', response.status, errorText)
          if (response.status === 401) {
            console.log('🔐 Session expired, redirecting to login')
            router.push('/login')
          } else {
            alert('Errore durante l\'aggiunta alla wishlist. Riprova.')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error)
      alert('Errore di connessione. Verifica la tua connessione e riprova.')
    } finally {
      setWishlistLoading(false)
      console.log('🔄 Wishlist loading state reset')
    }
  }

  const checkSellerFavoriteStatus = async (sellerId: string, retryCount = 0) => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/favorite-sellers/check/${sellerId}`, {
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        const data = await response.json()
        setIsSellerFavorite(data.isFavorite)
        console.log('✅ Seller favorite status loaded:', data.isFavorite)
      } else if (response.status === 401 && retryCount < 2) {
        console.log(`🔄 Retrying seller favorite check (attempt ${retryCount + 1})`)
        setTimeout(() => {
          checkSellerFavoriteStatus(sellerId, retryCount + 1)
        }, 1000)
      } else {
        console.warn('⚠️ Failed to check seller favorite status:', response.status)
        setIsSellerFavorite(false)
      }
    } catch (error) {
      console.error('❌ Error checking seller favorite status:', error)
      setIsSellerFavorite(false)
    }
  }

  const handleSellerFavoriteToggle = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (!wine?.seller) {
      return
    }

    if (sellerFavoriteLoading) {
      return
    }

    try {
      setSellerFavoriteLoading(true)

      if (isSellerFavorite) {
        const response = await fetch(`/api/favorite-sellers/${wine.seller.id}`, {
          method: 'DELETE',
          signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
          setIsSellerFavorite(false)
          console.log('✅ Successfully removed seller from favorites')
        } else {
          console.error('❌ Failed to remove seller from favorites:', response.status)
          if (response.status === 401) {
            router.push('/login')
          } else {
            alert('Errore durante la rimozione dai preferiti. Riprova.')
          }
        }
      } else {
        const response = await fetch('/api/favorite-sellers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sellerId: wine.seller.id }),
          signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
          setIsSellerFavorite(true)
          console.log('✅ Successfully added seller to favorites')
        } else {
          console.error('❌ Failed to add seller to favorites:', response.status)
          if (response.status === 401) {
            router.push('/login')
          } else {
            alert('Errore durante l\'aggiunta ai preferiti. Riprova.')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error toggling seller favorite:', error)
      alert('Errore di connessione. Verifica la tua connessione e riprova.')
    } finally {
      setSellerFavoriteLoading(false)
    }
  }

  const handleAddToCart = async () => {
    console.log('🛒 Add to cart clicked!', {
      session: !!session,
      sessionUser: !!session?.user,
      sessionAccessToken: !!session?.accessToken,
      wine: !!wine,
      wineId: wine?.id,
      quantity,
      addingToCart,
      wineQuantity: wine?.quantity
    })

    if (!session?.user) {
      console.log('🔐 No session or user data, redirecting to login')
      router.push('/login')
      return
    }

    if (!wine) {
      console.log('⚠️ No wine data available')
      return
    }

    const availableToAdd = wine.quantity - cartQuantity

    // Controllo di sicurezza: non fare chiamata API se non ci sono unità disponibili da aggiungere
    if (availableToAdd <= 0) {
      console.log('🚫 No more units can be added to cart, preventing API call')
      return
    }

    // Controllo di sicurezza: quantità richiesta non può superare quella disponibile da aggiungere
    if (quantity > availableToAdd) {
      console.log(`🚫 Requested quantity ${quantity} exceeds available to add ${availableToAdd}`)
      console.log(`🔍 Frontend state - quantity: ${quantity}, wine.quantity: ${wine.quantity}, cartQuantity: ${cartQuantity}`)
      alert(`Errore: puoi aggiungere massimo ${availableToAdd} unità. La quantità è stata corretta.`)
      setQuantity(Math.min(1, availableToAdd))
      return
    }

    if (addingToCart) {
      console.log('⏳ Already processing add to cart request')
      return
    }

    try {
      setAddingToCart(true)

      // Forza la quantità corretta (non può superare quella disponibile da aggiungere)
      const safeQuantity = Math.min(quantity, availableToAdd)
      console.log(`📦 Starting add to cart request with safe quantity: ${safeQuantity} (requested: ${quantity}, available to add: ${availableToAdd})`)

      const response = await fetch(`/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wineId: wine.id,
          quantity: safeQuantity
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      console.log('📡 Cart API response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Successfully added to cart:', responseData)
        alert(`✅ "${wine.title}" aggiunto al carrello!`)

        // Refresh cart quantity after successful addition
        await fetchCartQuantity(wine.id)

        // Optional: redirect to cart page
        // router.push('/cart')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to add to cart:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })

        if (response.status === 401) {
          console.log('🔐 Session expired, redirecting to login')
          alert('Sessione scaduta. Effettua nuovamente il login.')
          router.push('/login')
        } else if (response.status === 400) {
          alert(`Errore: ${errorData.error || 'Impossibile aggiungere al carrello'}`)
        } else {
          alert('Errore durante l\'aggiunta al carrello. Riprova.')
        }
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('Richiesta timeout. Verifica la connessione e riprova.')
        } else {
          alert('Errore di connessione. Verifica la tua connessione e riprova.')
        }
      } else {
        alert('Errore imprevisto. Riprova.')
      }
    } finally {
      setAddingToCart(false)
      console.log('🔄 Add to cart loading state reset')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
      </div>
    )
  }

  if (error || !wine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Vino non trovato'}</h1>
          <Link 
            href="/browse" 
            className="text-wine-600 hover:text-wine-700 font-medium"
          >
            Torna alla ricerca vini
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="browse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li>
              <Link href="/browse" className="text-gray-500 hover:text-gray-700">
                Vini
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li className="text-gray-900 font-medium truncate">
              {wine.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              {wine.images && wine.images.length > 0 ? (
                <Image
                  src={wine.images[selectedImageIndex] || wine.images[0]}
                  alt={wine.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {wine.images && wine.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {wine.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-wine-600 ring-2 ring-wine-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${wine.title} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wine Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{wine.title}</h1>
                  {wine.producer && (
                    <p className="text-lg text-gray-600 mb-2">{wine.producer}</p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`p-2 rounded-full border border-gray-300 transition-all duration-200 ${
                      wishlistLoading 
                        ? 'opacity-50 cursor-wait' 
                        : 'hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                    } ${!session ? 'hover:bg-red-50 hover:border-red-300' : ''}`}
                    title={!session ? 'Accedi per aggiungere alla wishlist' : isFavorite ? 'Rimuovi dalla wishlist' : 'Aggiungi alla wishlist'}
                  >
                    {wishlistLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    ) : isFavorite ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500 transition-all duration-200" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-400 transition-all duration-200" />
                    )}
                  </button>
                  <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                    <ShareIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              {wine.averageRating != null && wine.totalReviews != null && wine.totalReviews > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {renderStars(Math.round(wine.averageRating))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {wine.averageRating.toFixed(1)} ({wine.totalReviews} recensioni)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="text-4xl font-bold text-wine-600 mb-6">
                {formatPrice(wine.price)}
              </div>
            </div>

            {/* Wine Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getWineTypeColor(wine.wineType)}`}>
                    {formatWineType(wine.wineType)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConditionColor(wine.condition)}`}>
                    {formatCondition(wine.condition)}
                  </span>
                </div>

                {wine.annata && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Annata:</span>
                    <span className="ml-2 text-sm text-gray-900">{wine.annata}</span>
                  </div>
                )}

                {wine.grapeVariety && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Vitigno:</span>
                    <span className="ml-2 text-sm text-gray-900">{wine.grapeVariety}</span>
                  </div>
                )}

                {wine.region && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {wine.region}{wine.country && `, ${wine.country}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {wine.alcoholContent && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Gradazione:</span>
                    <span className="ml-2 text-sm text-gray-900">{wine.alcoholContent}%</span>
                  </div>
                )}

                {wine.volume && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Volume:</span>
                    <span className="ml-2 text-sm text-gray-900">{wine.volume}ml</span>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700">Quantità disponibile:</span>
                  <span className={`ml-2 text-sm font-semibold ${
                    wine.quantity === 0
                      ? 'text-red-600'
                      : wine.quantity <= 3
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    {wine.quantity === 0
                      ? 'Esaurito'
                      : wine.quantity <= 3
                      ? `Solo ${wine.quantity} rimaste`
                      : wine.quantity
                    }
                  </span>
                </div>

                {cartQuantity > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Già nel carrello:</span>
                    <span className="ml-2 text-sm font-semibold text-blue-600">
                      {cartQuantity} {cartQuantity === 1 ? 'unità' : 'unità'}
                    </span>
                  </div>
                )}

                {cartQuantity > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Puoi aggiungerne ancora:</span>
                    <span className={`ml-2 text-sm font-semibold ${
                      wine.quantity - cartQuantity === 0
                        ? 'text-red-600'
                        : wine.quantity - cartQuantity <= 2
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {wine.quantity - cartQuantity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantità:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-wine-500 focus:border-wine-500"
                  >
                    {Array.from({ length: Math.min(wine.quantity - cartQuantity, 10) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {session?.user?.id === wine.seller.id ? (
                <div className="w-full py-3 px-6 rounded-lg bg-gray-100 text-gray-600 text-center font-medium">
                  <UserIcon className="h-5 w-5 inline mr-2" />
                  Questo è il tuo vino
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || wine.quantity - cartQuantity <= 0}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    wine.quantity - cartQuantity <= 0
                      ? 'bg-red-100 text-red-600 cursor-not-allowed border-2 border-red-200'
                      : addingToCart
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-75'
                      : 'bg-wine-600 text-white hover:bg-wine-700 cursor-pointer'
                  }`}
                >
                  {wine.quantity - cartQuantity <= 0 ? (
                    <ExclamationTriangleIcon className="h-5 w-5" />
                  ) : (
                    <ShoppingCartIcon className="h-5 w-5" />
                  )}
                  <span>
                    {addingToCart
                      ? 'Aggiungendo...'
                      : wine.quantity - cartQuantity <= 0
                      ? cartQuantity >= wine.quantity ? 'Già tutto nel carrello' : 'Esaurito'
                      : 'Aggiungi al carrello'
                    }
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description and Seller Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descrizione</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {wine.description}
              </p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Venditore</h2>
            
            <div className="flex items-center space-x-3 mb-4">
              {wine.seller.avatar ? (
                <Image
                  src={wine.seller.avatar}
                  alt={wine.seller.username}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">
                    {wine.seller.firstName} {wine.seller.lastName}
                  </h3>
                  {wine.seller.verified && (
                    <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">@{wine.seller.username}</p>
              </div>
            </div>

            {wine.seller.location && (
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {wine.seller.location}
              </div>
            )}

            {wine.seller.bio && (
              <p className="text-sm text-gray-700 mb-4">{wine.seller.bio}</p>
            )}

            <div className="text-xs text-gray-500 mb-4">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Su Wine Marketplace dal {new Date(wine.seller.createdAt).toLocaleDateString('it-IT')}
            </div>

            <div className="space-y-2">
              {session?.user?.id !== wine.seller.id && (
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Contatta il venditore
                </button>
              )}
              {session?.user?.id !== wine.seller.id && (
                <button
                  onClick={handleSellerFavoriteToggle}
                  disabled={sellerFavoriteLoading}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    sellerFavoriteLoading
                      ? 'opacity-50 cursor-wait bg-gray-100 text-gray-700'
                      : isSellerFavorite
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-wine-50 text-wine-700 border border-wine-200 hover:bg-wine-100'
                  } ${!session ? 'hover:bg-wine-100 hover:border-wine-300' : ''}`}
                  title={!session ? 'Accedi per seguire il venditore' : isSellerFavorite ? 'Smetti di seguire' : 'Segui venditore'}
                >
                  {sellerFavoriteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <UserIcon className={`h-4 w-4 ${isSellerFavorite ? 'text-red-600' : 'text-wine-600'}`} />
                  )}
                  <span>
                    {sellerFavoriteLoading
                      ? 'Caricamento...'
                      : isSellerFavorite
                      ? 'Smetti di seguire'
                      : 'Segui venditore'
                    }
                  </span>
                </button>
              )}
              <Link
                href={session?.user?.id === wine.seller.id ? '/profile' : `/sellers/${wine.seller.id}`}
                className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {session?.user?.id === wine.seller.id ? 'Il mio profilo' : 'Vedi altri vini'}
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {wine.reviews && wine.reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recensioni</h2>
            
            <div className="space-y-6">
              {wine.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    {review.reviewer.avatar ? (
                      <Image
                        src={review.reviewer.avatar}
                        alt={review.reviewer.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </h4>
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}