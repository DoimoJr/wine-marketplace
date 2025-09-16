import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      accessTokenLength: session?.accessToken ? session.accessToken.length : 0,
      sessionKeys: session ? Object.keys(session) : [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get session info', details: error },
      { status: 500 }
    )
  }
}