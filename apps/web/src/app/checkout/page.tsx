'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  CreditCardIcon,
  ShoppingCartIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
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

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  province: string
  country: string
  phone?: string
  notes?: string
}

interface PaymentMethod {
  type: 'paypal' | 'nexi_pay'
  label: string
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State management
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingOrder, setProcessingOrder] = useState(false)

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Italy'
  })
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>({
    type: 'paypal',
    label: 'PayPal'
  })

  const paymentMethods: PaymentMethod[] = [
    { type: 'paypal', label: 'PayPal' },
    { type: 'nexi_pay', label: 'Carta di credito (Nexi Pay)' }
  ]

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/checkout')
      return
    }

    fetchCart()
  }, [session, status, router])

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cart')

      if (!response.ok) {
        throw new Error('Failed to fetch cart')
      }

      const data = await response.json()

      // Se il carrello è vuoto, redirect alla pagina carrello
      if (!data.sellers || data.sellers.length === 0) {
        router.push('/cart')
        return
      }

      setCart(data)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setError('Errore nel caricamento del carrello')
    } finally {
      setLoading(false)
    }
  }

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  const validateShippingAddress = (): boolean => {
    const required = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'province']
    return required.every(field => shippingAddress[field as keyof ShippingAddress]?.trim().length > 0)
  }

  const validateField = (field: keyof ShippingAddress): boolean => {
    const value = shippingAddress[field]
    if (!value || value.toString().trim().length === 0) return false

    // Validazioni specifiche
    if (field === 'postalCode') {
      const postalCode = value.toString().trim()
      return /^\d{5}$/.test(postalCode) // CAP italiano
    }

    if (field === 'province') {
      const province = value.toString().trim()
      return province.length >= 2 && province.length <= 3 // Sigla provincia
    }

    return true
  }

  const getFieldError = (field: keyof ShippingAddress): string | null => {
    if (!shippingAddress[field] || shippingAddress[field]?.toString().trim().length === 0) {
      return 'Campo obbligatorio'
    }

    if (field === 'postalCode' && !validateField(field)) {
      return 'Inserisci un CAP valido (es. 20121)'
    }

    if (field === 'province' && !validateField(field)) {
      return 'Inserisci una provincia valida (es. MI)'
    }

    return null
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !validateShippingAddress()) {
      alert('Compila tutti i campi obbligatori dell\'indirizzo di spedizione')
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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

  const handlePlaceOrder = async () => {
    if (!cart || !validateShippingAddress()) {
      alert('Verifica i dati inseriti')
      return
    }

    try {
      setProcessingOrder(true)

      // Prepara i dati per il checkout
      const checkoutData = {
        shippingAddress,
        paymentMethod: selectedPayment.type,
        notes: shippingAddress.notes || ''
      }

      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore durante l\'elaborazione dell\'ordine')
      }

      const result = await response.json()

      // Check if payment requires redirect (Nexi Pay)
      if (result.requiresRedirect && result.redirectUrl) {
        console.log('🔀 Redirecting to payment provider:', result.redirectUrl)
        // Redirect to Nexi Pay payment page
        window.location.href = result.redirectUrl
        return
      }

      // For PayPal or other direct payments, redirect to success page
      router.push('/orders?success=true')

    } catch (error) {
      console.error('Error placing order:', error)
      alert(error instanceof Error ? error.message : 'Errore durante l\'elaborazione dell\'ordine')
    } finally {
      setProcessingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="cart" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="cart" />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <Link
              href="/cart"
              className="text-wine-600 hover:text-wine-700 font-medium"
            >
              Torna al carrello
            </Link>
          </div>
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
          <div className="flex items-center space-x-3 mb-4">
            <CreditCardIcon className="h-8 w-8 text-wine-600" />
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            {[
              { number: 1, title: 'Spedizione', icon: MapPinIcon },
              { number: 2, title: 'Pagamento', icon: CreditCardIcon },
              { number: 3, title: 'Conferma', icon: CheckCircleIcon }
            ].map((step) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-wine-600 border-wine-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircleSolidIcon className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-wine-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {step.number < 3 && (
                  <div className={`w-12 h-px mx-4 ${
                    currentStep > step.number ? 'bg-wine-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Indirizzo di Spedizione</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-wine-500 focus:border-wine-500 ${
                        getFieldError('firstName') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mario"
                    />
                    {getFieldError('firstName') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('firstName')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cognome *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleShippingChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="Rossi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indirizzo *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="Via Roma, 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Città *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="Milano"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CAP *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="20121"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.province}
                      onChange={(e) => handleShippingChange('province', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="MI"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paese *
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => handleShippingChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                    >
                      <option value="Italy">Italia</option>
                      <option value="France">Francia</option>
                      <option value="Germany">Germania</option>
                      <option value="Spain">Spagna</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone || ''}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="+39 123 456 7890"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note per la consegna
                    </label>
                    <textarea
                      value={shippingAddress.notes || ''}
                      onChange={(e) => handleShippingChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wine-500 focus:border-wine-500"
                      placeholder="Istruzioni speciali per la consegna..."
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNextStep}
                    className="bg-wine-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-wine-700 transition-colors"
                  >
                    Continua
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Metodo di Pagamento</h2>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.type}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPayment.type === method.type
                          ? 'border-wine-600 bg-wine-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.type}
                        checked={selectedPayment.type === method.type}
                        onChange={() => setSelectedPayment(method)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedPayment.type === method.type
                          ? 'border-wine-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedPayment.type === method.type && (
                          <div className="w-2 h-2 rounded-full bg-wine-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-wine-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-wine-700 transition-colors"
                  >
                    Continua
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Conferma Ordine</h2>

                {/* Shipping Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Indirizzo di Spedizione</h3>
                  <p className="text-sm text-gray-600">
                    {shippingAddress.firstName} {shippingAddress.lastName}<br />
                    {shippingAddress.address}<br />
                    {shippingAddress.postalCode} {shippingAddress.city} ({shippingAddress.province})<br />
                    {shippingAddress.country}
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Metodo di Pagamento</h3>
                  <p className="text-sm text-gray-600">{selectedPayment.label}</p>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processingOrder}
                    className="bg-wine-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-wine-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {processingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Elaborazione...</span>
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-5 w-5" />
                        <span>Conferma Ordine</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Ordine</h3>

              {cart && cart.sellers && cart.sellers.map((sellerCart) => (
                <div key={sellerCart.orderId} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-wine-100 rounded-full flex items-center justify-center">
                      <span className="text-wine-600 font-semibold text-xs">
                        {sellerCart.seller.firstName?.[0] || sellerCart.seller.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {sellerCart.seller.firstName && sellerCart.seller.lastName
                          ? `${sellerCart.seller.firstName} ${sellerCart.seller.lastName}`
                          : sellerCart.seller.username}
                      </p>
                    </div>
                  </div>

                  {sellerCart.items.map((item) => (
                    <div key={item.id} className="flex space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 relative">
                        {item.wine.images && item.wine.images.length > 0 ? (
                          <Image
                            src={item.wine.images[0]}
                            alt={item.wine.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.wine.title}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getWineTypeColor(item.wine.wineType)}`}>
                            {formatWineType(item.wine.wineType)}
                          </span>
                          {item.wine.annata && (
                            <span className="text-xs text-gray-500">
                              {item.wine.annata}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">Qtà: {item.quantity}</span>
                          <span className="text-sm font-semibold text-wine-600">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotale</span>
                      <span>{formatPrice(sellerCart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spedizione</span>
                      <span>{formatPrice(sellerCart.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-wine-600">
                      <span>Totale venditore</span>
                      <span>{formatPrice(sellerCart.total)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-300">
                <div className="flex justify-between font-bold text-lg">
                  <span>Totale Generale</span>
                  <span className="text-wine-600">{formatPrice(cart?.grandTotal || 0)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {cart?.totalItems} {cart?.totalItems === 1 ? 'articolo' : 'articoli'} da {cart?.sellers?.length || 0} {cart?.sellers?.length === 1 ? 'venditore' : 'venditori'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}