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

export interface RecommendationParams {
  seedTracks?: string[]
  seedArtists?: string[]
  seedGenres?: string[]
  targetEnergy?: number
  targetDanceability?: number
  targetValence?: number
  limit?: number
}

async function fetchRecommendations(
  accessToken: string,
  params: RecommendationParams
): Promise<Track[]> {
  const searchParams = new URLSearchParams({
    accessToken,
  })
  
  if (params.seedTracks?.length) {
    searchParams.set('seedTracks', params.seedTracks.join(','))
  }
  if (params.seedArtists?.length) {
    searchParams.set('seedArtists', params.seedArtists.join(','))
  }
  if (params.seedGenres?.length) {
    searchParams.set('seedGenres', params.seedGenres.join(','))
  }
  if (params.targetEnergy !== undefined) {
    searchParams.set('targetEnergy', params.targetEnergy.toString())
  }
  if (params.targetDanceability !== undefined) {
    searchParams.set('targetDanceability', params.targetDanceability.toString())
  }
  if (params.targetValence !== undefined) {
    searchParams.set('targetValence', params.targetValence.toString())
  }
  if (params.limit) {
    searchParams.set('limit', params.limit.toString())
  }
  
  const response = await fetch(
    `/api/tracks/recommendations?${searchParams.toString()}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations')
  }
  return response.json()
}

// Backward compatible hook - accepts seedTracks array
export function useRecommendations(
  accessToken: string | null, 
  seedTracks: string[],
  options?: Omit<RecommendationParams, 'seedTracks'>
) {
  return useQuery({
    queryKey: ['tracks', 'recommendations', accessToken, seedTracks, options],
    queryFn: () => fetchRecommendations(accessToken!, { 
      seedTracks, 
      ...options 
    }),
    enabled: !!accessToken && (seedTracks.length > 0 || options?.seedArtists?.length || options?.seedGenres?.length),
    staleTime: 5 * 60 * 1000, // 5 minutes - recommendations can be cached
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// New hook for advanced recommendations
export function useAdvancedRecommendations(
  accessToken: string | null,
  params: RecommendationParams
) {
  return useQuery({
    queryKey: ['tracks', 'recommendations', 'advanced', accessToken, params],
    queryFn: () => fetchRecommendations(accessToken!, params),
    enabled: !!accessToken && (
      (params.seedTracks?.length || 0) > 0 || 
      (params.seedArtists?.length || 0) > 0 || 
      (params.seedGenres?.length || 0) > 0
    ),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

