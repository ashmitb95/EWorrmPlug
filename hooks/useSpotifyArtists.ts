import { useQuery, useQueries } from '@tanstack/react-query'
import type { ArtistWithTracks, SpotifyArtist } from '@/types/spotify'
import type { TimeRange } from '@/types/spotify'

async function fetchTopArtists(
  accessToken: string,
  timeRange: TimeRange = 'short_term'
): Promise<SpotifyArtist[]> {
  const response = await fetch(
    `/api/artists/top?accessToken=${accessToken}&timeRange=${timeRange}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch top artists')
  }
  return response.json()
}

export function useTopArtists(accessToken: string | null, timeRange: TimeRange = 'short_term') {
  return useQuery({
    queryKey: ['artists', 'top', accessToken, timeRange],
    queryFn: () => fetchTopArtists(accessToken!, timeRange),
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

async function fetchArtistTracks(accessToken: string, artistId: string) {
  const response = await fetch(
    `/api/artists/tracks?accessToken=${accessToken}&artistId=${artistId}`
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch tracks for artist ${artistId}`)
  }
  return response.json()
}

export function useArtistTracks(accessToken: string | null, artistIds: string[]) {
  return useQueries({
    queries: artistIds.map((artistId) => ({
      queryKey: ['artists', 'tracks', accessToken, artistId],
      queryFn: () => fetchArtistTracks(accessToken!, artistId),
      enabled: !!accessToken && !!artistId,
      staleTime: 15 * 60 * 1000, // 15 minutes - artist tracks are fairly static
      gcTime: 60 * 60 * 1000, // 1 hour
    })),
  })
}

export function useArtistsWithTracks(
  accessToken: string | null,
  timeRange: TimeRange = 'short_term'
) {
  const { data: artists, isLoading: artistsLoading } = useTopArtists(accessToken, timeRange)

  const artistIds = artists?.slice(0, 10).map((artist) => artist.id) || []
  const trackQueries = useArtistTracks(accessToken, artistIds)

  const isLoading = artistsLoading || trackQueries.some((query) => query.isLoading)

  const artistsWithTracks: ArtistWithTracks[] =
    artists && artists.length > 0 && trackQueries.length > 0
      ? artists.slice(0, 10).map((artist, index) => ({
          artist: {
            id: artist.id,
            name: artist.name,
            images: artist.images || [],
          },
          tracks: trackQueries[index]?.data || [],
        }))
      : []

  return {
    data: artistsWithTracks,
    isLoading,
    isError: trackQueries.some((query) => query.isError),
  }
}

