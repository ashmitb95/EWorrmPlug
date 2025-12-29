'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      // Handle error from Spotify
      console.error('Spotify auth error:', error)
      localStorage.clear()
      router.push('/?error=' + encodeURIComponent(error))
      return
    }

    if (code) {
      // Exchange code for access token
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('expiresAt', String(Date.now() + data.expiresIn * 1000))
            // Redirect to home page
            router.push('/')
          } else {
            console.error('No access token received:', data)
            localStorage.clear()
            router.push('/?error=auth_failed')
          }
        })
        .catch((err) => {
          console.error('Auth error:', err)
          localStorage.clear()
          router.push('/?error=auth_failed')
        })
    } else {
      // No code, redirect to home
      router.push('/')
    }
  }, [code, error, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-spotify-black">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent mx-auto"></div>
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-spotify-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}

