'use client'

import Image from 'next/image'
import type { Track } from '@/types/spotify'

interface TrackCardProps {
  track: Track
  onSelect: (track: Track) => void
  isPlaying?: boolean
}

export default function TrackCard({ track, onSelect, isPlaying = false }: TrackCardProps) {
  return (
    <div
      onClick={() => onSelect(track)}
      className={`group cursor-pointer rounded-lg bg-spotify-dark p-4 transition-all hover:bg-gray-800 hover:scale-105 ${
        isPlaying ? 'ring-2 ring-spotify-green' : ''
      }`}
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg">
        {track.albumUrl ? (
          <Image
            src={track.albumUrl}
            alt={track.title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-700">
            <span className="text-4xl">🎵</span>
          </div>
        )}
      </div>
      <h3 className="truncate font-semibold text-white">{track.title}</h3>
      <p className="truncate text-sm text-gray-400">{track.artist}</p>
    </div>
  )
}

