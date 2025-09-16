'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Navbar'

interface CartItem {
  id: string
  quantity: number
  price: number
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
  }
}

interface SellerCart {
  seller: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    verified?: boolean
  }
  orderId: string
  items: CartItem[]
  subtotal: number
  shippingCost: number
  total: number
}

interface CartResponse {
  sellers: SellerCart[]
  grandTotal: number
  totalItems: number
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchCart()
  }, [session, status, router])

  const fetchCart = async () => {
    try {
      console.log('🛒 CartPage: Starting to fetch cart data...')
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cart')

      console.log('📡 CartPage: API response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ CartPage: Failed to fetch cart:', errorData)
        throw new Error(errorData.error || 'Failed to fetch cart')
      }

      const data = await response.json()
      console.log('✅ CartPage: Cart data received:', {
        sellersCount: data.sellers?.length || 0,
        totalItems: data.totalItems || 0,
        grandTotal: data.grandTotal || 0,
        fullData: data
      })
      setCart(data)
    } catch (error) {
      console.error('❌ CartPage: Error fetching cart:', error)
      setError('Errore nel caricamento del carrello')
    } finally {
      setLoading(false)
      console.log('🔄 CartPage: Loading state reset')
    }
  }

  const handleUpdateQuantity = async (wineId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdatingItems(prev => new Set(prev).add(wineId))
      
      const response = await fetch(`/api/cart/items/${wineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      
      if (response.ok) {
        // Re-fetch cart to get updated multi-seller structure
        await fetchCart()
      } else {
        console.error('Failed to update cart item')
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(wineId)
        return newSet
      })
    }
  }

  const handleRemoveFromCart = async (wineId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(wineId))
      
      const response = await fetch(`/api/cart/items/${wineId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Re-fetch cart to get updated multi-seller structure
        await fetchCart()
      } else {
        console.error('Failed to remove from cart')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(wineId)
        return newSet
      })
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Sei sicuro di voler svuotare il carrello?')) return

    try {
      setLoading(true)
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setCart({ sellers: [], grandTotal: 0, totalItems: 0 })
      } else {
        console.error('Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    } finally {
      setLoading(false)
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
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <button 
            onClick={fetchCart}
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
      <Navbar currentPage="cart" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <ShoppingCartSolidIcon className="h-8 w-8 text-wine-600" />
              <h1 className="text-3xl font-bold text-gray-900">Il Mio Carrello</h1>
            </div>
            {cart && cart.sellers && cart.sellers.length > 0 && (
              <button
                onClick={handleClearCart}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Svuota Carrello
              </button>
            )}
          </div>
          {cart && cart.sellers && cart.sellers.length > 0 && (
            <p className="text-gray-600">
              {cart.totalItems} {cart.totalItems === 1 ? 'articolo' : 'articoli'} nel carrello da {cart.sellers?.length || 0} {cart.sellers?.length === 1 ? 'venditore' : 'venditori'}
            </p>
          )}
        </div>

        {/* Cart Content */}
        {!cart || !cart.sellers || cart.sellers.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Il tuo carrello è vuoto
            </h2>
            <p className="text-gray-600 mb-8">
              Aggiungi alcuni vini al carrello per iniziare lo shopping!
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700"
            >
              Sfoglia i Vini
            </Link>
          </div>
) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3 space-y-8">
              {cart.sellers?.map((sellerCart) => (
                <div key={sellerCart.orderId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Seller Header */}
                  <div className="bg-gray-50 border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-wine-100 rounded-full flex items-center justify-center">
                          <span className="text-wine-600 font-semibold text-sm">
                            {sellerCart.seller.firstName?.[0] || sellerCart.seller.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {sellerCart.seller.firstName && sellerCart.seller.lastName 
                              ? `${sellerCart.seller.firstName} ${sellerCart.seller.lastName}`
                              : sellerCart.seller.username}
                          </h3>
                          <p className="text-sm text-gray-600">{sellerCart.items.length} {sellerCart.items.length === 1 ? 'articolo' : 'articoli'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Spedizione: {formatPrice(sellerCart.shippingCost)}</p>
                        <p className="text-lg font-semibold text-wine-600">Totale: {formatPrice(sellerCart.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller Items */}
                  <div className="divide-y divide-gray-200">
                    {sellerCart.items.map((item) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Wine Image */}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative">
                            {item.wine.images && item.wine.images.length > 0 ? (
                              <Image
                                src={item.wine.images[0]}
                                alt={item.wine.title}
                                fill
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Wine Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-md font-semibold text-gray-900 line-clamp-2">
                                  {item.wine.title}
                                </h4>
                                {item.wine.producer && (
                                  <p className="text-sm text-gray-600 mt-1">{item.wine.producer}</p>
                                )}
                                
                                <div className="flex items-center space-x-2 mt-2">
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
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPinIcon className="h-3 w-3 mr-1" />
                                    {item.wine.region}{item.wine.country && `, ${item.wine.country}`}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemoveFromCart(item.wine.id)}
                                disabled={updatingItems.has(item.wine.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                {updatingItems.has(item.wine.id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                ) : (
                                  <TrashIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>

                            {/* Quantity and Price */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.wine.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updatingItems.has(item.wine.id)}
                                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <MinusIcon className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.wine.id, item.quantity + 1)}
                                  disabled={updatingItems.has(item.wine.id)}
                                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <PlusIcon className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="flex items-center space-x-3">
                                <Link
                                  href={`/wines/${item.wine.id}`}
                                  className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <EyeIcon className="h-3 w-3 mr-1" />
                                  Vedi
                                </Link>
                                <div className="text-md font-bold text-wine-600">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Ordine</h3>
                
                <div className="space-y-3 mb-4">
                  {cart.sellers?.map((sellerCart, index) => (
                    <div key={sellerCart.orderId}>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="font-medium">
                          {sellerCart.seller.firstName && sellerCart.seller.lastName 
                            ? `${sellerCart.seller.firstName} ${sellerCart.seller.lastName}`
                            : sellerCart.seller.username}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pl-2">
                        <span>Subtotale</span>
                        <span>{formatPrice(sellerCart.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm pl-2">
                        <span>Spedizione</span>
                        <span>{formatPrice(sellerCart.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pl-2">
                        <span>Totale venditore</span>
                        <span className="text-wine-600">{formatPrice(sellerCart.total)}</span>
                      </div>
                      {index < (cart.sellers?.length || 0) - 1 && <hr className="my-2" />}
                    </div>
                  ))}
                  
                  <hr className="my-3 border-gray-300" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Totale Generale</span>
                    <span className="text-wine-600">{formatPrice(cart.grandTotal)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {cart.totalItems} {cart.totalItems === 1 ? 'articolo' : 'articoli'} da {cart.sellers?.length || 0} {cart.sellers?.length === 1 ? 'venditore' : 'venditori'}
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-wine-600 text-white py-3 px-4 rounded-md font-medium hover:bg-wine-700 transition-colors flex items-center justify-center"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Procedi al Checkout
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Verranno creati ordini separati per ogni venditore
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}