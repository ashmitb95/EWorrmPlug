import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlaylistData } from '@/types/spotify'

export interface CreatePlaylistParams {
  name: string
  description?: string
  isPublic?: boolean
  trackUris?: string[]
}

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

async function createPlaylist(
  accessToken: string,
  params: CreatePlaylistParams
) {
  const response = await fetch('/api/playlists/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken,
      ...params,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || error.error || 'Failed to create playlist')
  }

  return response.json()
}

async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
) {
  const response = await fetch('/api/playlists/add-tracks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken,
      playlistId,
      trackUris,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || error.error || 'Failed to add tracks')
  }

  return response.json()
}

export function useCreatePlaylist(accessToken: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreatePlaylistParams) => {
      if (!accessToken) throw new Error('Access token required')
      return createPlaylist(accessToken, params)
    },
    onSuccess: () => {
      // Invalidate playlists query to refetch
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    },
  })
}

export function useAddTracksToPlaylist(accessToken: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ playlistId, trackUris }: { playlistId: string; trackUris: string[] }) => {
      if (!accessToken) throw new Error('Access token required')
      return addTracksToPlaylist(accessToken, playlistId, trackUris)
    },
    onSuccess: () => {
      // Invalidate playlists query to refetch
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    },
  })
}
