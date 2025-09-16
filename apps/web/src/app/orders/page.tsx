'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  TruckIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Navbar'

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  const isSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/orders')
      return
    }

    // Per ora impostiamo loading a false dato che non abbiamo ancora l'API completa
    setLoading(false)
  }, [session, status, router])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="cart" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSuccess ? (
          // Success Message
          <div className="text-center py-16">
            <CheckCircleSolidIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ordine Confermato!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Il tuo ordine è stato elaborato con successo. Riceverai presto una conferma via email
              con i dettagli di spedizione per ogni venditore.
            </p>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Cosa succede ora?</h3>
              <div className="space-y-3 text-sm text-gray-600 text-left">
                <div className="flex items-start space-x-3">
                  <CreditCardIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>I pagamenti sono stati elaborati</span>
                </div>
                <div className="flex items-start space-x-3">
                  <TruckIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Ogni venditore preparerà la spedizione</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Riceverai i codici di tracking separatamente</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Continua a Comprare
              </Link>
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Vedi i Miei Ordini
              </button>
            </div>
          </div>
        ) : (
          // Orders List (Coming Soon)
          <div>
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-wine-600" />
                <h1 className="text-3xl font-bold text-gray-900">I Miei Ordini</h1>
              </div>
              <p className="text-gray-600">
                Visualizza e gestisci tutti i tuoi ordini
              </p>
            </div>

            {/* Coming Soon Message */}
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Gestione Ordini in Arrivo
                </h2>
                <p className="text-gray-600 mb-6">
                  La sezione per visualizzare e gestire i tuoi ordini sarà disponibile a breve.
                  Nel frattempo, riceverai aggiornamenti via email.
                </p>
                <Link
                  href="/browse"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Sfoglia i Vini
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}