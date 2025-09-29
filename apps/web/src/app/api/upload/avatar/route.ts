import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Avatar Upload API: POST request received')

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      console.log('❌ Avatar Upload API: No access token found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const avatar = formData.get('avatar') as File

    if (!avatar) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      )
    }

    console.log('📦 Avatar upload file:', {
      name: avatar.name,
      size: avatar.size,
      type: avatar.type
    })

    const uploadFormData = new FormData()
    uploadFormData.append('avatar', avatar)

    console.log('📡 Uploading avatar to backend')
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: uploadFormData,
    })

    console.log('📡 Backend avatar upload response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Backend avatar upload error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to upload avatar' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Avatar Upload API: Success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Avatar Upload API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error while uploading avatar' },
      { status: 500 }
    )
  }
}