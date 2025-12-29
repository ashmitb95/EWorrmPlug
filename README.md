# Spotify Playlist Curator

A modern TypeScript Next.js application for curating and discovering Spotify playlists. Built with production-grade practices and ready to deploy on Vercel.

## Features

- 🎵 View your recent top tracks
- ⭐ See your long-term favorite tracks
- 🎧 Get personalized recommendations based on your listening history
- 🎤 Browse tracks from your favorite artists
- 📜 Discover forgotten playlists (Your Top Songs from past years)
- 🎮 Built-in Spotify Web Playback SDK player

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Spotify API**: spotify-web-api-node
- **Spotify Player**: Official Spotify Web Playback SDK (latest version)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. A Spotify Developer account
2. Node.js 18+ installed
3. npm or yarn

### Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000
   NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000
   ```
   
   **Important Notes**:
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` is prefixed with `NEXT_PUBLIC_` because it's used in client-side code
   - `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` should match exactly what you set in Spotify app settings
   - The client secret should NEVER be exposed to the client
   - For production, use HTTPS URLs (e.g., `https://your-app.vercel.app`)
   
   To get your Spotify credentials:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy the Client ID and Client Secret
   - **Add your redirect URI to the "Redirect URIs" field** - this must match EXACTLY:
     - For local development: `http://localhost:3000`
     - For production: `https://your-app.vercel.app` (or your production URL)
   - **Important**: The redirect URI in your Spotify app settings must match exactly what you use in the environment variables

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**:
   In Vercel project settings, add:
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` (your Spotify Client ID)
   - `SPOTIFY_CLIENT_SECRET` (your Spotify Client Secret)
   - `SPOTIFY_REDIRECT_URI` (your Vercel deployment URL, e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` (same as above, must match exactly)

4. **Update Spotify App Settings**:
   - Go to your Spotify app settings
   - Add your Vercel URL to Redirect URIs (e.g., `https://your-app.vercel.app`)
   - **Critical**: The redirect URI in Spotify must match EXACTLY what you set in `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`
   - Make sure to use HTTPS (not HTTP) for production URLs
   - You can add multiple redirect URIs (one for localhost, one for production)

5. **Deploy**:
   Vercel will automatically deploy your app!

## Project Structure

```
spotify-playlist-curator/
├── app/
│   ├── api/              # API routes (Next.js API routes)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── tracks/       # Track-related endpoints
│   │   ├── artists/      # Artist-related endpoints
│   │   └── playlists/    # Playlist endpoints
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Login.tsx        # Login page
│   ├── Player.tsx       # Spotify player
│   ├── TrackCard.tsx    # Individual track card
│   ├── TrackCollection.tsx  # Collection of tracks
│   └── TabContent.tsx   # Tab content wrapper
├── lib/                 # Utility functions
│   └── spotify.ts       # Spotify API helpers
├── types/               # TypeScript type definitions
│   └── spotify.ts       # Spotify API types
└── package.json
```

## API Routes

- `POST /api/auth/login` - Exchange authorization code for access token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/tracks/recent` - Get user's top tracks
- `GET /api/tracks/recommendations` - Get track recommendations
- `GET /api/artists/top` - Get user's top artists
- `GET /api/artists/tracks` - Get top tracks for an artist
- `GET /api/playlists/forgotten` - Get forgotten playlists

## License

MIT

