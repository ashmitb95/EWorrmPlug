import { NextRequest, NextResponse } from 'next/server'
import { createSpotifyApi } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const spotifyApi = createSpotifyApi()
    spotifyApi.setRefreshToken(refreshToken)

    const data = await spotifyApi.refreshAccessToken()
    const { access_token, expires_in } = data.body

    return NextResponse.json({
      accessToken: access_token,
      expiresIn: expires_in,
    })
  } catch (error: any) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 400 }
    )
  }
}

