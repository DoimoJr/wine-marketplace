import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function GET(request: NextRequest) {
  try {
    console.log('🍷 My Wines API: GET request received')

    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id
    })

    if (!session?.accessToken) {
      console.log('❌ My Wines API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    const status = searchParams.get('status') || ''

    // Build query string for backend
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status })
    })

    console.log('📡 Fetching user wines from backend with params:', queryParams.toString())
    const response = await fetch(`${API_BASE_URL}/wines/user/${session.user.id}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend wines response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend wines error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch user wines' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ My Wines API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ My Wines API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching wines' },
      { status: 500 }
    )
  }
}