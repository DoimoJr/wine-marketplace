'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extract error details from URL parameters
    const params = Object.fromEntries(searchParams.entries())
    console.log('Payment error page parameters:', params)

    setErrorDetails({
      orderId: params.codTrans || 'N/A',
      errorCode: params.error || 'UNKNOWN',
      errorMessage: getErrorMessage(params.error),
      amount: params.importo ? (parseInt(params.importo) / 100) : 0,
    })
    setLoading(false)
  }, [searchParams])

  const getErrorMessage = (errorCode?: string): string => {
    switch (errorCode) {
      case 'CARD_DECLINED':
        return 'Carta di credito rifiutata. Verifica i dati inseriti o prova con un altro metodo di pagamento.'
      case 'INSUFFICIENT_FUNDS':
        return 'Fondi insufficienti sulla carta di credito.'
      case 'EXPIRED_CARD':
        return 'Carta di credito scaduta. Controlla la data di scadenza.'
      case 'INVALID_CARD':
        return 'Dati della carta non validi. Verifica numero, CVV e data di scadenza.'
      case 'TIMEOUT':
        return 'Timeout della transazione. Riprova tra qualche minuto.'
      case 'BANK_ERROR':
        return 'Errore della banca. Contatta la tua banca per maggiori informazioni.'
      default:
        return 'Si è verificato un errore durante il pagamento. Ti invitiamo a riprovare.'
    }
  }

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
      <Navbar currentPage="checkout" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento Non Riuscito
          </h1>

          <p className="text-gray-600 mb-8">
            {errorDetails?.errorMessage}
          </p>

          {errorDetails && (
            <div className="bg-red-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Dettagli Errore</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-700">ID Transazione:</span>
                  <span className="font-mono text-sm text-red-600">{errorDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Codice Errore:</span>
                  <span className="font-semibold text-red-600">{errorDetails.errorCode}</span>
                </div>
                {errorDetails.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-700">Importo:</span>
                    <span className="font-semibold text-red-600">€{errorDetails.amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/checkout"
              className="w-full bg-wine-600 text-white px-6 py-3 rounded-md font-medium hover:bg-wine-700 transition-colors inline-block"
            >
              Riprova il pagamento
            </Link>

            <Link
              href="/cart"
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Torna al carrello
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Hai bisogno di aiuto?</strong> Contatta il nostro supporto clienti per assistenza con il pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}