import { NextRequest, NextResponse } from 'next/server'
import { createSpotifyApi } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    const spotifyApi = createSpotifyApi()

    const data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token, expires_in } = data.body

    return NextResponse.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 400 }
    )
  }
}

