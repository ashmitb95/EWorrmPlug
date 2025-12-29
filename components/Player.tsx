'use client'

import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'

interface PlayerProps {
  accessToken: string
}

interface SpotifyPlayerState {
  position: number
  duration: number
  paused: boolean
  track_window: {
    current_track: {
      id: string
      name: string
      artists: Array<{ name: string }>
      album: {
        name: string
        images: Array<{ url: string }>
      }
      uri: string
    }
  }
  device_id?: string
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => SpotifyPlayer
    }
    onSpotifyWebPlaybackSDKReady: () => void
  }

  interface SpotifyPlayer {
    connect: () => Promise<boolean>
    disconnect: () => void
    addListener: (event: string, callback: (state: any) => void) => void
    removeListener: (event: string, callback: (state: any) => void) => void
    getCurrentState: () => Promise<SpotifyPlayerState | null>
    setName: (name: string) => Promise<void>
    getVolume: () => Promise<number>
    setVolume: (volume: number) => Promise<void>
    pause: () => Promise<void>
    resume: () => Promise<void>
    togglePlay: () => Promise<void>
    seek: (positionMs: number) => Promise<void>
    previousTrack: () => Promise<void>
    nextTrack: () => Promise<void>
    activateElement: () => Promise<void>
  }
}

export default function Player({ accessToken }: PlayerProps) {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    repeatMode,
    shuffle,
    queue,
    currentIndex,
    togglePlay: storeTogglePlay,
    setIsPlaying,
    setPosition,
    setDuration,
    setVolume,
    setRepeatMode,
    toggleShuffle,
    playNext,
    playPrevious,
  } = usePlayerStore()

  const [player, setPlayer] = useState<SpotifyPlayer | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const playerRef = useRef<SpotifyPlayer | null>(null)
  const scriptLoadedRef = useRef(false)

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (scriptLoadedRef.current) return
    scriptLoadedRef.current = true

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Spotify Playlist Curator',
        getOAuthToken: (cb) => {
          cb(accessToken)
        },
        volume: volume,
      })

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id)
        setPlayer(spotifyPlayer)
        setDeviceId(device_id)
        playerRef.current = spotifyPlayer
      })

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id)
      })

      spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
        if (!state) {
          return
        }

        setIsPlaying(!state.paused)
        setPosition(state.position)
        setDuration(state.duration)
      })

      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!')
        }
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect()
      }
    }
  }, [accessToken, volume, setIsPlaying, setPosition, setDuration])

  // Sync volume with player
  useEffect(() => {
    if (!player) return
    player.setVolume(volume)
  }, [player, volume])

  // Play track when currentTrack changes
  useEffect(() => {
    if (!currentTrack?.uri || !deviceId || !accessToken) return

    const playTrack = async () => {
      try {
        // First, transfer playback to our device
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [deviceId],
          }),
        })

        // Build the queue: current track + remaining tracks in queue
        const queueUris = queue.length > 0 && currentIndex >= 0
          ? queue.slice(currentIndex).map(t => t.uri)
          : [currentTrack.uri]

        // Play the track with queue
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: queueUris,
          }),
        })
      } catch (error) {
        console.error('Error playing track:', error)
      }
    }

    playTrack()
  }, [currentTrack?.uri, deviceId, accessToken, queue, currentIndex])

  // Sync play/pause state
  useEffect(() => {
    if (!player) return

    if (isPlaying) {
      player.resume()
    } else {
      player.pause()
    }
  }, [isPlaying, player])

  const handleTogglePlay = async () => {
    if (!player) return
    await player.togglePlay()
    storeTogglePlay()
  }

  const handlePrevious = async () => {
    if (!player) return
    playPrevious()
  }

  const handleNext = async () => {
    if (!player) return
    playNext()
  }

  const handleSeek = async (positionMs: number) => {
    if (!player) return
    try {
      await player.seek(positionMs)
      setPosition(positionMs)
    } catch (error) {
      console.error('Error seeking:', error)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (player) {
      player.setVolume(newVolume)
    }
  }

  const handleRepeatToggle = () => {
    // The store's setRepeatMode cycles through modes, so we just call it
    setRepeatMode(repeatMode)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getRepeatIcon = () => {
    if (repeatMode === 'track') {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
          <circle cx="10" cy="10" r="1" />
        </svg>
      )
    }
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  if (!accessToken || !player) return null

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-spotify-dark">
      {/* Progress Bar */}
      {currentTrack && duration > 0 && (
        <div className="h-1 w-full bg-gray-800 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const percentage = x / rect.width
          const newPosition = percentage * duration
          handleSeek(newPosition)
        }}>
          <div
            className="h-full bg-spotify-green transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        {currentTrack && (
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0 flex-1">
              {currentTrack.albumUrl ? (
                <img
                  src={currentTrack.albumUrl}
                  alt={currentTrack.title}
                  className="h-14 w-14 rounded object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-700">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white text-sm">{currentTrack.title}</p>
                <p className="truncate text-xs text-gray-400">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 justify-center flex-1">
              <button
                onClick={handleRepeatToggle}
                className={`rounded-full p-2 transition-colors ${
                  repeatMode !== 'off'
                    ? 'text-spotify-green hover:text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={`Repeat: ${repeatMode}`}
                title={`Repeat: ${repeatMode}`}
              >
                {getRepeatIcon()}
              </button>
              <button
                onClick={handlePrevious}
                className="rounded-full p-2 text-gray-400 transition-colors hover:text-white"
                aria-label="Previous track"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>
              <button
                onClick={handleTogglePlay}
                className="rounded-full bg-spotify-green p-3 text-white transition-all hover:bg-green-500 hover:scale-105"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                className="rounded-full p-2 text-gray-400 transition-colors hover:text-white"
                aria-label="Next track"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 9.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v4.798l-5.445-3.63z" />
                </svg>
              </button>
              <button
                onClick={toggleShuffle}
                className={`rounded-full p-2 transition-colors ${
                  shuffle
                    ? 'text-spotify-green hover:text-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
                title={shuffle ? 'Shuffle on' : 'Shuffle off'}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 00-2 2v6H2a2 2 0 100 4h2v2a2 2 0 002 2h6a2 2 0 002-2v-2h2a2 2 0 100-4h-2V6a2 2 0 00-2-2H5zm9 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V9h-1a1 1 0 110-2h1V7a1 1 0 011-1z" />
                </svg>
              </button>
            </div>

            {/* Volume and Time */}
            <div className="flex items-center gap-4 flex-shrink-0 flex-1 justify-end">
              {duration > 0 && (
                <div className="text-xs text-gray-400 hidden sm:block">
                  {formatTime(position)} / {formatTime(duration)}
                </div>
              )}
              <div className="flex items-center gap-2 min-w-[120px]">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-spotify-green"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        )}
        {!currentTrack && (
          <div className="flex items-center justify-center py-4">
            <p className="text-gray-400">No track selected</p>
          </div>
        )}
      </div>
    </div>
  )
}
