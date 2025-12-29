'use client'

import TrackCard from './TrackCard'
import type { Track } from '@/types/spotify'
import { usePlayerStore } from '@/store/playerStore'

interface TrackCollectionProps {
  title: string
  tracks: Track[]
  onSelectTrack: (track: Track) => void
  onPlayCollection?: (tracks: Track[]) => void
}

export default function TrackCollection({
  title,
  tracks,
  onSelectTrack,
  onPlayCollection,
}: TrackCollectionProps) {
  const { currentTrack } = usePlayerStore()

  if (!tracks || tracks.length === 0) {
    return null
  }

  const handlePlayAll = () => {
    if (onPlayCollection) {
      onPlayCollection(tracks)
    }
  }

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {tracks.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="rounded-full bg-spotify-green px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-500"
          >
            Play All
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onSelect={onSelectTrack}
            isPlaying={currentTrack?.id === track.id}
          />
        ))}
      </div>
    </div>
  )
}

