import { NextRequest, NextResponse } from 'next/server'
import { searchPlaylists, getPlaylistTracks } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessToken = searchParams.get('accessToken')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    // Search for "Your Top Songs" playlists
    const playlists = await searchPlaylists(accessToken, 'your top songs', 10)
    
    // Filter for Spotify's "Your Top Songs" playlists
    const filteredPlaylists = playlists.filter(
      (playlist: any) =>
        playlist.name.toLowerCase().includes('your top songs') &&
        playlist.owner.display_name === 'Spotify'
    )

    // Get tracks for each playlist
    const playlistsWithTracks = await Promise.all(
      filteredPlaylists.map(async (playlist: any) => {
        try {
          const tracks = await getPlaylistTracks(accessToken, playlist.id)
          return {
            id: playlist.id,
            name: playlist.name,
            tracks: tracks.filter((track: any) => track !== null),
          }
        } catch (error) {
          console.error(`Error fetching tracks for playlist ${playlist.id}:`, error)
          return {
            id: playlist.id,
            name: playlist.name,
            tracks: [],
          }
        }
      })
    )

    // Sort by name (year)
    const sortedPlaylists = playlistsWithTracks.sort((a: any, b: any) => 
      a.name.localeCompare(b.name)
    )

    return NextResponse.json(sortedPlaylists)
  } catch (error: any) {
    console.error('Error fetching forgotten playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forgotten playlists' },
      { status: 500 }
    )
  }
}

