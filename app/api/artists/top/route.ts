import { NextRequest, NextResponse } from 'next/server'
import { getTopArtists } from '@/lib/spotify'
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

    const artists = await getTopArtists(accessToken, timeRange, 20)

    return NextResponse.json(artists)
  } catch (error: any) {
    console.error('Error fetching top artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top artists' },
      { status: 500 }
    )
  }
}

