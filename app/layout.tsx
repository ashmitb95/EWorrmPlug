import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/components/QueryProvider'

export const metadata: Metadata = {
  title: 'Spotify Playlist Curator',
  description: 'Curate and discover your favorite Spotify playlists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}

