'use client'

import { useState } from 'react'
import Player from './Player'
import TabContent from './TabContent'
import { useRecentTracks, useRecommendations } from '@/hooks/useSpotifyTracks'
import { useArtistsWithTracks } from '@/hooks/useSpotifyArtists'
import { useForgottenPlaylists } from '@/hooks/useSpotifyPlaylists'
import { usePlayerStore } from '@/store/playerStore'

interface DashboardProps {
  accessToken: string
}

export default function Dashboard({ accessToken }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('1')
  const { playTrack } = usePlayerStore()

  // Fetch tracks with React Query
  const { data: recentTracks = [], isLoading: recentTracksLoading } = useRecentTracks(
    accessToken,
    'short_term'
  )
  const { data: longTermTracks = [], isLoading: longTermTracksLoading } = useRecentTracks(
    accessToken,
    'long_term'
  )

  // Get seed tracks for recommendations
  const seedTracks = recentTracks.slice(0, 5).map((track) => track.id)
  const { data: recommendedTracks = [], isLoading: recommendationsLoading } =
    useRecommendations(accessToken, seedTracks)

  // Fetch artists with tracks
  const {
    data: artistTracks = [],
    isLoading: artistsLoading,
  } = useArtistsWithTracks(accessToken, 'short_term')

  // Fetch forgotten playlists
  const { data: forgottenPlaylists = [], isLoading: playlistsLoading } =
    useForgottenPlaylists(accessToken)

  const handleSelectTrack = (track: any) => {
    // Play track and optionally add the current collection to queue
    playTrack(track)
  }

  const handlePlayCollection = (tracks: any[]) => {
    if (tracks.length > 0) {
      // Play first track and add rest to queue
      playTrack(tracks[0], tracks)
    }
  }

  const isLoading =
    recentTracksLoading ||
    longTermTracksLoading ||
    recommendationsLoading ||
    artistsLoading ||
    playlistsLoading

  const tabs = [
    {
      key: '1',
      label: 'Top Music',
      content: (
        <TabContent
          title="Top Music"
          contentList={[
            {
              label: 'Some of your Recent Tracks',
              tracks: recentTracks,
            },
            {
              label: 'Your absolute favorites',
              tracks: longTermTracks,
            },
            {
              label: 'Some recommendations based on your recent music',
              tracks: recommendedTracks,
            },
          ]}
          onSelectTrack={handleSelectTrack}
          onPlayCollection={handlePlayCollection}
        />
      ),
    },
    {
      key: '2',
      label: 'Artists',
      content: (
        <TabContent
          title="Binge on some of your favorite artists"
          contentList={artistTracks.map((item) => ({
            label: item.artist.name,
            tracks: item.tracks,
          }))}
          onSelectTrack={handleSelectTrack}
          onPlayCollection={handlePlayCollection}
        />
      ),
    },
    {
      key: '3',
      label: 'Tunes from the past',
      content: (
        <TabContent
          title="Some music you have moved away from"
          contentList={forgottenPlaylists.map((playlist) => ({
            label: playlist.name,
            tracks: playlist.tracks.map((track: any) => ({
              id: track.id,
              title: track.name,
              artist: track.artists[0]?.name || 'Unknown',
              uri: track.uri,
              albumUrl: track.album?.images?.[0]?.url || '',
              albumName: track.album?.name,
            })),
          }))}
          onSelectTrack={handleSelectTrack}
          onPlayCollection={handlePlayCollection}
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-spotify-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading your music...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-spotify-black text-white">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-spotify-dark">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Spotify Playlist Curator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex space-x-1 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-spotify-green text-spotify-green'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>{tabs.find((tab) => tab.key === activeTab)?.content}</div>
      </main>

      <Player accessToken={accessToken} />
    </div>
  )
}
