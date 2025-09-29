import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📍 Update Shipping Address API: PATCH request received for ID:', params.id)

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Update Shipping Address API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Update shipping address request body:', body)

    console.log('📡 Updating shipping address in backend')
    const response = await fetch(`${API_BASE_URL}/users/me/shipping-addresses/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 Backend update address response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend update address error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to update shipping address' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Update Shipping Address API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Update Shipping Address API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating shipping address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📍 Delete Shipping Address API: DELETE request received for ID:', params.id)

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Delete Shipping Address API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    console.log('📡 Deleting shipping address in backend')
    const response = await fetch(`${API_BASE_URL}/users/me/shipping-addresses/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Backend delete address response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend delete address error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to delete shipping address' },
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

    console.log('✅ Delete Shipping Address API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Delete Shipping Address API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while deleting shipping address' },
      { status: 500 }
    )
  }
}