// @ts-ignore - spotify-web-api-node doesn't have types
import SpotifyWebApi from 'spotify-web-api-node';
import type { TimeRange, Track } from '@/types/spotify';

export const PERMISSION_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-currently-playing',
];

export function getAuthUrl(): string {
  // Client-side: use NEXT_PUBLIC_ prefix for environment variables
  const clientId = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID 
    : process.env.SPOTIFY_CLIENT_ID;
  
  // Get redirect URI - use env var exactly as provided, or default
  let redirectUri: string;
  if (typeof window !== 'undefined') {
    // Client-side: use env var if set, otherwise use current origin + /callback
    redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;
  } else {
    // Server-side: use env var or default to localhost/callback
    redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';
  }
  
  if (!clientId) {
    const envHint = typeof window !== 'undefined' 
      ? 'NEXT_PUBLIC_SPOTIFY_CLIENT_ID'
      : 'SPOTIFY_CLIENT_ID';
    throw new Error(
      `SPOTIFY_CLIENT_ID is not set. Make sure to set ${envHint} in your environment variables. ` +
      `For Vercel: Add it in Project Settings > Environment Variables for all environments (Production, Preview, Development).`
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: PERMISSION_SCOPES.join(' '),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function createSpotifyApi(accessToken?: string): SpotifyWebApi {
  // Use env var exactly as provided, or default to localhost/callback
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 
                      process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
                      'http://localhost:3000/callback';
  
  // Use SPOTIFY_CLIENT_ID if available, otherwise fall back to NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  // (NEXT_PUBLIC_* vars are available on server, but we check both for safety)
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  
  const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: redirectUri,
  });

  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }

  return spotifyApi;
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange = 'short_term',
  limit: number = 20
) {
  const spotifyApi = createSpotifyApi(accessToken);
  const response = await spotifyApi.getMyTopTracks({
    time_range: timeRange,
    limit,
  });
  return response.body.items;
}

export async function getTopArtists(
  accessToken: string,
  timeRange: TimeRange = 'short_term',
  limit: number = 20
) {
  const spotifyApi = createSpotifyApi(accessToken);
  const response = await spotifyApi.getMyTopArtists({
    time_range: timeRange,
    limit,
  });
  return response.body.items;
}

export async function getArtistTopTracks(
  accessToken: string,
  artistId: string,
  market: string = 'US'
) {
  const spotifyApi = createSpotifyApi(accessToken);
  const response = await spotifyApi.getArtistTopTracks(artistId, market);
  return response.body.tracks;
}

export interface RecommendationOptions {
  seedTracks?: string[];
  seedArtists?: string[];
  seedGenres?: string[];
  limit?: number;
  // Audio feature targets (0.0 to 1.0)
  targetEnergy?: number;
  targetDanceability?: number;
  targetValence?: number;
  targetAcousticness?: number;
  targetInstrumentalness?: number;
  minEnergy?: number;
  maxEnergy?: number;
  minDanceability?: number;
  maxDanceability?: number;
}

export async function getRecommendations(
  accessToken: string,
  options: RecommendationOptions = {}
) {
  const spotifyApi = createSpotifyApi(accessToken);
  
  // Spotify API allows up to 5 total seeds (tracks + artists + genres combined)
  const seedTracks = (options.seedTracks || []).slice(0, 5);
  const seedArtists = (options.seedArtists || []).slice(0, 5 - seedTracks.length);
  const seedGenres = (options.seedGenres || []).slice(0, 5 - seedTracks.length - seedArtists.length);
  
  // Build recommendation parameters
  const params: any = {
    limit: options.limit || 20,
  };
  
  if (seedTracks.length > 0) {
    params.seed_tracks = seedTracks;
  }
  if (seedArtists.length > 0) {
    params.seed_artists = seedArtists;
  }
  if (seedGenres.length > 0) {
    params.seed_genres = seedGenres;
  }
  
  // Add audio feature targets if provided
  if (options.targetEnergy !== undefined) params.target_energy = options.targetEnergy;
  if (options.targetDanceability !== undefined) params.target_danceability = options.targetDanceability;
  if (options.targetValence !== undefined) params.target_valence = options.targetValence;
  if (options.targetAcousticness !== undefined) params.target_acousticness = options.targetAcousticness;
  if (options.targetInstrumentalness !== undefined) params.target_instrumentalness = options.targetInstrumentalness;
  
  // Add min/max ranges if provided
  if (options.minEnergy !== undefined) params.min_energy = options.minEnergy;
  if (options.maxEnergy !== undefined) params.max_energy = options.maxEnergy;
  if (options.minDanceability !== undefined) params.min_danceability = options.minDanceability;
  if (options.maxDanceability !== undefined) params.max_danceability = options.maxDanceability;
  
  const response = await spotifyApi.getRecommendations(params);
  return response.body.tracks;
}

export async function createPlaylist(
  accessToken: string,
  name: string,
  description?: string,
  isPublic: boolean = false
) {
  const spotifyApi = createSpotifyApi(accessToken);
  
  // Get current user ID first
  const me = await spotifyApi.getMe();
  const userId = me.body.id;
  
  const response = await spotifyApi.createPlaylist(userId, {
    name,
    description: description || `Created by Spotify Playlist Curator`,
    public: isPublic,
  });
  
  return response.body;
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
) {
  const spotifyApi = createSpotifyApi(accessToken);
  
  // Spotify API allows max 100 tracks per request
  const chunks = [];
  for (let i = 0; i < trackUris.length; i += 100) {
    chunks.push(trackUris.slice(i, i + 100));
  }
  
  // Add tracks in chunks
  const results = [];
  for (const chunk of chunks) {
    const response = await spotifyApi.addTracksToPlaylist(playlistId, chunk);
    results.push(response.body);
  }
  
  return results;
}

export async function getUserPlaylists(
  accessToken: string,
  limit: number = 50
) {
  const spotifyApi = createSpotifyApi(accessToken);
  const response = await spotifyApi.getUserPlaylists({ limit });
  return response.body.items;
}

export async function searchPlaylists(
  accessToken: string,
  query: string,
  limit: number = 10
) {
  const spotifyApi = createSpotifyApi(accessToken);
  const response = await spotifyApi.searchPlaylists(query, { limit });
  return response.body.playlists?.items || [];
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string
) {
  const spotifyApi = createSpotifyApi(accessToken);
  const response = await spotifyApi.getPlaylistTracks(playlistId);
  return response.body.items.map((item: any) => item.track);
}

export function transformTrack(spotifyTrack: any): Track {
  // Select the largest available image for better quality
  // Spotify provides images in different sizes: typically 64x64, 300x300, 640x640
  const largestAlbumImage = spotifyTrack.album.images.reduce(
    (largest: any, image: any) => {
      if (!largest) return image;
      if (image.height > largest.height) return image;
      return largest;
    },
    spotifyTrack.album.images[0]
  );

  return {
    id: spotifyTrack.id,
    title: spotifyTrack.name,
    artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
    artistId: spotifyTrack.artists[0]?.id,
    uri: spotifyTrack.uri,
    albumUrl: largestAlbumImage?.url || '',
    albumName: spotifyTrack.album.name,
    duration: spotifyTrack.duration_ms,
  };
}

