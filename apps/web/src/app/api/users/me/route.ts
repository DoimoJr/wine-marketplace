import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function GET(request: NextRequest) {
  try {
    console.log('👤 User Profile API: GET request received')

    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id
    })

    if (!session?.accessToken) {
      console.log('❌ User Profile API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('📡 Fetching user profile from backend')
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend profile response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend profile error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch user profile' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ User Profile API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ User Profile API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('👤 User Profile API: PATCH request received')

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ User Profile API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Update profile request body:', body)

    console.log('📡 Updating user profile in backend')
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 Backend update response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend update error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to update profile' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ User Profile Update API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ User Profile Update API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating profile' },
      { status: 500 }
    )
  }
}