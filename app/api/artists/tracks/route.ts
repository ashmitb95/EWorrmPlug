import { NextRequest, NextResponse } from 'next/server'
import { getArtistTopTracks, transformTrack } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessToken = searchParams.get('accessToken')
    const artistId = searchParams.get('artistId')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    if (!artistId) {
      return NextResponse.json(
        { error: 'Artist ID is required' },
        { status: 400 }
      )
    }

    const tracks = await getArtistTopTracks(accessToken, artistId)
    const transformedTracks = tracks.map(transformTrack)

    return NextResponse.json(transformedTracks)
  } catch (error: any) {
    console.error('Error fetching artist tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist tracks' },
      { status: 500 }
    )
  }
}

