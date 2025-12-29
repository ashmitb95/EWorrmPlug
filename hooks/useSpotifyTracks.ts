import { useQuery } from '@tanstack/react-query'
import type { Track, TimeRange } from '@/types/spotify'

async function fetchRecentTracks(
  accessToken: string,
  timeRange: TimeRange = 'short_term'
): Promise<Track[]> {
  const response = await fetch(
    `/api/tracks/recent?accessToken=${accessToken}&timeRange=${timeRange}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch recent tracks')
  }
  return response.json()
}

export function useRecentTracks(accessToken: string | null, timeRange: TimeRange = 'short_term') {
  return useQuery({
    queryKey: ['tracks', 'recent', accessToken, timeRange],
    queryFn: () => fetchRecentTracks(accessToken!, timeRange),
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes - top tracks don't change often
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
  })
}

async function fetchRecommendations(
  accessToken: string,
  seedTracks: string[]
): Promise<Track[]> {
  const trackIds = seedTracks.join(',')
  const response = await fetch(
    `/api/tracks/recommendations?accessToken=${accessToken}&seedTracks=${trackIds}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations')
  }
  return response.json()
}

export function useRecommendations(accessToken: string | null, seedTracks: string[]) {
  return useQuery({
    queryKey: ['tracks', 'recommendations', accessToken, seedTracks],
    queryFn: () => fetchRecommendations(accessToken!, seedTracks),
    enabled: !!accessToken && seedTracks.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - recommendations can be cached
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

