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
    // Increase limit to get more results (Spotify typically has playlists for multiple years)
    const playlists = await searchPlaylists(accessToken, 'your top songs', 50)
    
    // Filter for Spotify's "Your Top Songs" playlists
    // Match the old implementation: check name includes "your top songs" and owner is Spotify
    const filteredTopPlaylists = playlists.filter(
      (playlist: any) =>
        playlist.name.toLowerCase()?.includes('your top songs') &&
        playlist.owner.display_name === 'Spotify'
    )

    // Get tracks for each playlist - matching old implementation structure
    const playlistTracks = await Promise.all(
      filteredTopPlaylists.map(async (currentPlaylist: any) => {
        const { id: playlistID, name } = currentPlaylist
        try {
          const tracks = await getPlaylistTracks(accessToken, playlistID)
          // Match old implementation: return { name, tracks }
          // tracks are already mapped to track.track in getPlaylistTracks
          return {
            name: name,
            tracks: tracks.filter((track: any) => track !== null),
          }
        } catch (error) {
          console.error(`Error fetching tracks for playlist ${playlistID}:`, error)
          return {
            name: name,
            tracks: [],
          }
        }
      })
    )

    // Return the playlist tracks (matching old implementation)
    return NextResponse.json(playlistTracks)
  } catch (error: any) {
    console.error('Error fetching forgotten playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forgotten playlists' },
      { status: 500 }
    )
  }
}

