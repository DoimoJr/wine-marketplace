import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Orders API: GET request received')

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Orders API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    console.log('📡 Fetching orders from backend with params:', queryString)
    const response = await fetch(`${API_BASE_URL}/orders?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend orders response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend orders error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch orders' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Orders API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Orders API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching orders' },
      { status: 500 }
    )
  }
}