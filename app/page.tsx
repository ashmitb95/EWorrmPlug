'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
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
            setAccessToken(data.accessToken)
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('expiresAt', String(Date.now() + data.expiresIn * 1000))
            // Remove code from URL
            router.push('/')
          }
        })
        .catch((err) => {
          console.error('Auth error:', err)
          localStorage.clear()
          router.push('/')
        })
    } else {
      // Check for existing token
      const storedToken = localStorage.getItem('accessToken')
      const expiresAt = localStorage.getItem('expiresAt')
      
      if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
        setAccessToken(storedToken)
      } else if (storedToken) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.accessToken) {
                setAccessToken(data.accessToken)
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('expiresAt', String(Date.now() + data.expiresIn * 1000))
              } else {
                localStorage.clear()
              }
            })
            .catch(() => {
              localStorage.clear()
            })
        } else {
          localStorage.clear()
        }
      }
    }
  }, [code, router])

  return accessToken ? <Dashboard accessToken={accessToken} /> : <Login />
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-spotify-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

