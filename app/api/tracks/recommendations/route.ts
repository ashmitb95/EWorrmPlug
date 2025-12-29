import { NextRequest, NextResponse } from 'next/server'
import { getRecommendations, transformTrack } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessToken = searchParams.get('accessToken')
    const seedTracks = searchParams.get('seedTracks')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    if (!seedTracks) {
      return NextResponse.json(
        { error: 'Seed tracks are required' },
        { status: 400 }
      )
    }

    const trackIds = seedTracks.split(',').filter(Boolean)
    const tracks = await getRecommendations(accessToken, trackIds, 20)
    const transformedTracks = tracks.map(transformTrack)

    return NextResponse.json(transformedTracks)
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

