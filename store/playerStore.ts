import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '@/types/spotify'

interface PlayerState {
  // Current playback state
  currentTrack: Track | null
  isPlaying: boolean
  position: number
  duration: number
  volume: number
  
  // Queue management
  queue: Track[]
  currentIndex: number
  history: Track[]
  
  // Playback modes
  repeatMode: 'off' | 'track' | 'context'
  shuffle: boolean
  
  // Actions
  setCurrentTrack: (track: Track | null) => void
  playTrack: (track: Track, queue?: Track[]) => void
  playNext: () => void
  playPrevious: () => void
  togglePlay: () => void
  setIsPlaying: (isPlaying: boolean) => void
  setPosition: (position: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  addToQueue: (tracks: Track[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setRepeatMode: (mode: 'off' | 'track' | 'context') => void
  toggleShuffle: () => void
  skipToIndex: (index: number) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      volume: 0.5,
      queue: [],
      currentIndex: -1,
      history: [],
      repeatMode: 'off',
      shuffle: false,

      // Actions
      setCurrentTrack: (track) => set({ currentTrack: track }),

      playTrack: (track, queue = []) => {
        const currentQueue = queue.length > 0 ? queue : get().queue
        const currentIndex = currentQueue.findIndex((t) => t.id === track.id)
        
        set({
          currentTrack: track,
          queue: currentQueue,
          currentIndex: currentIndex >= 0 ? currentIndex : currentQueue.length,
          isPlaying: true,
          position: 0,
        })

        // Add to history if not already there
        const history = get().history
        if (!history.find((t) => t.id === track.id)) {
          set({ history: [track, ...history.slice(0, 49)] }) // Keep last 50 tracks
        }
      },

      playNext: () => {
        const { queue, currentIndex, shuffle, repeatMode, currentTrack } = get()
        
        if (repeatMode === 'track' && currentTrack) {
          set({ position: 0, isPlaying: true })
          return
        }

        if (queue.length === 0) return

        let nextIndex: number
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length)
        } else {
          nextIndex = currentIndex + 1
          if (nextIndex >= queue.length) {
            if (repeatMode === 'context') {
              nextIndex = 0
            } else {
              return // End of queue
            }
          }
        }

        const nextTrack = queue[nextIndex]
        if (nextTrack) {
          set({
            currentTrack: nextTrack,
            currentIndex: nextIndex,
            isPlaying: true,
            position: 0,
          })
        }
      },

      playPrevious: () => {
        const { queue, currentIndex, history, repeatMode } = get()
        
        if (repeatMode === 'track' && get().currentTrack) {
          set({ position: 0, isPlaying: true })
          return
        }

        // If we're at the start, go to history
        if (currentIndex <= 0) {
          if (history.length > 0) {
            const prevTrack = history[0]
            set({
              currentTrack: prevTrack,
              currentIndex: -1,
              isPlaying: true,
              position: 0,
              history: history.slice(1),
            })
          }
          return
        }

        const prevIndex = currentIndex - 1
        const prevTrack = queue[prevIndex]
        if (prevTrack) {
          set({
            currentTrack: prevTrack,
            currentIndex: prevIndex,
            isPlaying: true,
            position: 0,
          })
        }
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setPosition: (position) => set({ position }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),

      addToQueue: (tracks) =>
        set((state) => ({
          queue: [...state.queue, ...tracks],
        })),

      removeFromQueue: (index) =>
        set((state) => {
          const newQueue = [...state.queue]
          newQueue.splice(index, 1)
          let newIndex = state.currentIndex
          if (index < state.currentIndex) {
            newIndex = state.currentIndex - 1
          } else if (index === state.currentIndex && newQueue.length > 0) {
            // If removing current track, play next
            newIndex = Math.min(index, newQueue.length - 1)
          }
          return {
            queue: newQueue,
            currentIndex: newIndex,
          }
        }),

      clearQueue: () => set({ queue: [], currentIndex: -1 }),

      setRepeatMode: (mode) => {
        const modes: Array<'off' | 'track' | 'context'> = ['off', 'track', 'context']
        const currentMode = get().repeatMode
        const currentIndex = modes.indexOf(currentMode)
        const nextIndex = (currentIndex + 1) % modes.length
        set({ repeatMode: modes[nextIndex] })
      },

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

      skipToIndex: (index) => {
        const { queue } = get()
        if (index >= 0 && index < queue.length) {
          set({
            currentTrack: queue[index],
            currentIndex: index,
            isPlaying: true,
            position: 0,
          })
        }
      },
    }),
    {
      name: 'spotify-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
        queue: state.queue,
        history: state.history,
      }),
    }
  )
)

