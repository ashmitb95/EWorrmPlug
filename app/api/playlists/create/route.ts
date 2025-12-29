import { NextRequest, NextResponse } from 'next/server'
import { createPlaylist, addTracksToPlaylist } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, name, description, isPublic, trackUris } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      )
    }

    // Create the playlist
    const playlist = await createPlaylist(
      accessToken,
      name,
      description,
      isPublic ?? false
    )

    // Add tracks if provided
    if (trackUris && trackUris.length > 0) {
      await addTracksToPlaylist(accessToken, playlist.id, trackUris)
    }

    return NextResponse.json({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      external_urls: playlist.external_urls,
      uri: playlist.uri,
    })
  } catch (error: any) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create playlist',
        details: error?.body?.error_description || error?.message
      },
      { status: 500 }
    )
  }
}

