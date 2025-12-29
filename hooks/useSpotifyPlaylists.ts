import { useQuery } from '@tanstack/react-query'
import type { PlaylistData } from '@/types/spotify'

async function fetchForgottenPlaylists(accessToken: string): Promise<PlaylistData[]> {
  const response = await fetch(
    `/api/playlists/forgotten?accessToken=${accessToken}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch forgotten playlists')
  }
  return response.json()
}

export function useForgottenPlaylists(accessToken: string | null) {
  return useQuery({
    queryKey: ['playlists', 'forgotten', accessToken],
    queryFn: () => fetchForgottenPlaylists(accessToken!),
    enabled: !!accessToken,
    staleTime: 30 * 60 * 1000, // 30 minutes - playlists don't change often
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

