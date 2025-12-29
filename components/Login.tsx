'use client'

import { getAuthUrl } from '@/lib/spotify'

export default function Login() {
  const handleLogin = () => {
    const authUrl = getAuthUrl()
    window.location.href = authUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-spotify-black">
      <div className="text-center">
        <h1 className="mb-8 text-5xl font-bold text-white">
          Spotify Playlist Curator
        </h1>
        <p className="mb-8 text-xl text-gray-400">
          Discover and curate your favorite playlists
        </p>
        <button
          onClick={handleLogin}
          className="rounded-full bg-spotify-green px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-green-500 hover:scale-105"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  )
}

