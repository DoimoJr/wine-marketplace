import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function GET(request: NextRequest) {
  try {
    console.log('📍 Shipping Addresses API: GET request received')

    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id
    })

    if (!session?.accessToken) {
      console.log('❌ Shipping Addresses API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('📡 Fetching shipping addresses from backend')
    const response = await fetch(`${API_BASE_URL}/users/me/shipping-addresses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend shipping addresses response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend shipping addresses error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch shipping addresses' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Shipping Addresses API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Shipping Addresses API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching shipping addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📍 Shipping Addresses API: POST request received')

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Shipping Addresses API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Create shipping address request body:', body)

    console.log('📡 Creating shipping address in backend')
    const response = await fetch(`${API_BASE_URL}/users/me/shipping-addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 Backend create address response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend create address error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to create shipping address' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Create Shipping Address API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Create Shipping Address API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while creating shipping address' },
      { status: 500 }
    )
  }
}