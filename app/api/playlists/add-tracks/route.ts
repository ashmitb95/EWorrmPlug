import { NextRequest, NextResponse } from 'next/server'
import { addTracksToPlaylist } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, playlistId, trackUris } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    if (!playlistId) {
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 }
      )
    }

    if (!trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
      return NextResponse.json(
        { error: 'Track URIs array is required' },
        { status: 400 }
      )
    }

    const results = await addTracksToPlaylist(accessToken, playlistId, trackUris)

    return NextResponse.json({
      success: true,
      snapshotIds: results.map((r: any) => r.snapshot_id),
    })
  } catch (error: any) {
    console.error('Error adding tracks to playlist:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add tracks to playlist',
        details: error?.body?.error_description || error?.message
      },
      { status: 500 }
    )
  }
}

