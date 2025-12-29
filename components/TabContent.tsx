'use client'

import TrackCollection from './TrackCollection'
import type { Track } from '@/types/spotify'

interface ContentItem {
  label: string
  tracks: Track[]
}

interface TabContentProps {
  title: string
  contentList: ContentItem[]
  onSelectTrack: (track: Track) => void
  onPlayCollection?: (tracks: Track[]) => void
}

export default function TabContent({
  title,
  contentList,
  onSelectTrack,
  onPlayCollection,
}: TabContentProps) {
  return (
    <div className="min-h-[90vh] pb-24">
      <h1 className="mb-8 text-4xl font-bold text-white">{title}</h1>
      {contentList.map((item, index) => (
        <TrackCollection
          key={index}
          title={item.label}
          tracks={item.tracks}
          onSelectTrack={onSelectTrack}
          onPlayCollection={onPlayCollection}
        />
      ))}
    </div>
  )
}

