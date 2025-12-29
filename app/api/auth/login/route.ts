import { NextRequest, NextResponse } from 'next/server'
import { createSpotifyApi } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  // Get redirect URI early so it's available in catch block
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) {
      console.error('NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set')
      return NextResponse.json(
        { error: 'Server configuration error: NEXT_PUBLIC_SPOTIFY_CLIENT_ID is missing' },
        { status: 500 }
      )
    }

    if (!process.env.SPOTIFY_CLIENT_SECRET) {
      console.error('SPOTIFY_CLIENT_SECRET is not set')
      return NextResponse.json(
        { error: 'Server configuration error: SPOTIFY_CLIENT_SECRET is missing' },
        { status: 500 }
      )
    }

    if (!redirectUri) {
      console.error('SPOTIFY_REDIRECT_URI is not set')
      return NextResponse.json(
        { error: 'Server configuration error: SPOTIFY_REDIRECT_URI is missing' },
        { status: 500 }
      )
    }

    const spotifyApi = createSpotifyApi()

    // Log the redirect URI being used (for debugging)
    console.log('Exchanging code with redirect URI:', redirectUri)

    const data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token, expires_in } = data.body

    return NextResponse.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    })
  } catch (error: any) {
    console.error('Login error:', {
      message: error?.message,
      body: error?.body,
      statusCode: error?.statusCode,
      stack: error?.stack
    })
    
    // Return more detailed error information for debugging
    const errorMessage = error?.body?.error_description || 
                        error?.body?.error || 
                        error?.message || 
                        'Failed to authenticate'
    
    // Always include debug info in the response to help diagnose issues
    return NextResponse.json(
      { 
        error: 'Failed to authenticate',
        details: errorMessage,
        spotifyError: error?.body?.error,
        spotifyErrorDescription: error?.body?.error_description,
        debug: {
          hasClientId: !!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
          hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
          redirectUri: redirectUri,
          statusCode: error?.statusCode
        }
      },
      { status: 400 }
    )
  }
}

