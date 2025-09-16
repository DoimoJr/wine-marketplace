import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 User Stats API: GET request received')

    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id
    })

    if (!session?.accessToken) {
      console.log('❌ User Stats API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('📡 Fetching user stats from backend')
    const response = await fetch(`${API_BASE_URL}/users/me/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend stats response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend stats error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch user stats' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ User Stats API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ User Stats API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching stats' },
      { status: 500 }
    )
  }
}