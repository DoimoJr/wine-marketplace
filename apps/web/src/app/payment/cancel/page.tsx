'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extract details from URL parameters
    const params = Object.fromEntries(searchParams.entries())
    console.log('Payment cancel page parameters:', params)

    setOrderDetails({
      orderId: params.codTrans || 'N/A',
      amount: params.importo ? (parseInt(params.importo) / 100) : 0,
    })
    setLoading(false)
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
      <Navbar currentPage="cart" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.662-.833-2.432 0L5.732 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento Annullato
          </h1>

          <p className="text-gray-600 mb-8">
            Il pagamento è stato annullato. L'ordine non è stato completato e nessun addebito è stato effettuato sulla tua carta.
          </p>

          {orderDetails && orderDetails.orderId !== 'N/A' && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-yellow-900 mb-4">Dettagli Transazione</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-700">ID Transazione:</span>
                  <span className="font-mono text-sm text-yellow-600">{orderDetails.orderId}</span>
                </div>
                {orderDetails.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Importo:</span>
                    <span className="font-semibold text-yellow-600">€{orderDetails.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-yellow-700">Stato:</span>
                  <span className="text-yellow-600 font-semibold">Annullato</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/checkout"
              className="w-full bg-wine-600 text-white px-6 py-3 rounded-md font-medium hover:bg-wine-700 transition-colors inline-block"
            >
              Completa l'ordine
            </Link>

            <Link
              href="/cart"
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Torna al carrello
            </Link>

            <Link
              href="/browse"
              className="w-full text-wine-600 px-6 py-3 font-medium hover:text-wine-700 transition-colors inline-block"
            >
              Continua a navigare
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> I tuoi articoli sono ancora nel carrello e puoi completare l'ordine quando sei pronto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}