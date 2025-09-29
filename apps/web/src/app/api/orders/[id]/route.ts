import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📦 Order Detail API: GET request received for ID:', params.id)

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Order Detail API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('📡 Fetching order detail from backend')
    const response = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend order detail response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend order detail error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch order details' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Order Detail API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Order Detail API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching order details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📦 Update Order API: PATCH request received for ID:', params.id)

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Update Order API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Update order request body:', body)

    console.log('📡 Updating order in backend')
    const response = await fetch(`${API_BASE_URL}/orders/${params.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 Backend update order response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend update order error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to update order' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Update Order API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Update Order API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📦 Cancel Order API: DELETE request received for ID:', params.id)

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Cancel Order API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('📡 Cancelling order in backend')
    const response = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend cancel order response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend cancel order error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to cancel order' },
        { status: response.status }
      )
    }

    // DELETE might return empty response
    let data = {}
    try {
      data = await response.json()
    } catch {
      // Empty response is OK for DELETE
      data = { success: true }
    }

    console.log('✅ Cancel Order API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Cancel Order API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while cancelling order' },
      { status: 500 }
    )
  }
}