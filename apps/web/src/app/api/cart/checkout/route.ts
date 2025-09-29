import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Checkout API: POST request received')

    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id
    })

    if (!session?.accessToken) {
      console.log('❌ Checkout API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Checkout API: Request body:', body)

    // Trasforma i dati dal frontend al formato atteso dal backend
    const backendPayload = {
      shippingAddress: {
        firstName: body.shippingAddress.firstName,
        lastName: body.shippingAddress.lastName,
        address1: body.shippingAddress.address,
        city: body.shippingAddress.city,
        zipCode: body.shippingAddress.postalCode,
        state: body.shippingAddress.province,
        country: body.shippingAddress.country,
        phone: body.shippingAddress.phone
      },
      paymentProvider: getPaymentProvider(body.paymentMethod)
    }

    console.log('📡 Transformed payload for backend:', backendPayload)

    const response = await fetch(`${API_BASE_URL}/orders/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(backendPayload),
    })

    console.log('📡 Backend checkout response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend checkout error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to process checkout' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Checkout API: Success:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Checkout API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error during checkout' },
      { status: 500 }
    )
  }
}

// Funzione helper per convertire il tipo di pagamento del frontend al backend
function getPaymentProvider(paymentMethod: string): string {
  const paymentMap: Record<string, string> = {
    'paypal': 'PAYPAL',
    'nexi_pay': 'NEXI_PAY'
  }

  return paymentMap[paymentMethod] || 'PAYPAL'
}