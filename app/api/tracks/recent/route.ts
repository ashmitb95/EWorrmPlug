import { NextRequest, NextResponse } from 'next/server'
import { getTopTracks, transformTrack } from '@/lib/spotify'
import type { TimeRange } from '@/types/spotify'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessToken = searchParams.get('accessToken')
    const timeRange = (searchParams.get('timeRange') || 'short_term') as TimeRange

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    const tracks = await getTopTracks(accessToken, timeRange, 20)
    const transformedTracks = tracks.map(transformTrack)

    return NextResponse.json(transformedTracks)
  } catch (error: any) {
    console.error('Error fetching recent tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent tracks' },
      { status: 500 }
    )
  }
}

