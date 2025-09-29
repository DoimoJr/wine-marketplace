'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // Extract payment details from URL parameters (from Nexi redirect)
    const params = Object.fromEntries(searchParams.entries())
    console.log('Payment success page parameters:', params)

    // Simulate order lookup (in real implementation, would fetch order details)
    setTimeout(() => {
      setOrderDetails({
        orderId: params.codTrans || 'N/A',
        amount: params.importo ? (parseInt(params.importo) / 100) : 0,
        status: 'PAID'
      })
      setLoading(false)
    }, 1000)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="checkout" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="orders" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento Completato!
          </h1>

          <p className="text-gray-600 mb-8">
            Il tuo ordine è stato elaborato con successo. Riceverai una email di conferma a breve.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dettagli Ordine</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Transazione:</span>
                  <span className="font-mono text-sm">{orderDetails.orderId}</span>
                </div>
                {orderDetails.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Importo:</span>
                    <span className="font-semibold">€{orderDetails.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Stato:</span>
                  <span className="text-green-600 font-semibold">Pagato</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/orders"
              className="w-full bg-wine-600 text-white px-6 py-3 rounded-md font-medium hover:bg-wine-700 transition-colors inline-block"
            >
              Visualizza i tuoi ordini
            </Link>

            <Link
              href="/browse"
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Continua a navigare
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}