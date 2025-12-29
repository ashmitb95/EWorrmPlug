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
  'user-read-currently-playing',
];

export function getAuthUrl(): string {
  // Client-side: use NEXT_PUBLIC_ prefix for environment variables
  const clientId = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID 
    : process.env.SPOTIFY_CLIENT_ID;
  
  // Get redirect URI - prioritize env var, then use window location
  let redirectUri: string;
  if (typeof window !== 'undefined') {
    // Client-side: use env var if set, otherwise use current origin
    redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || window.location.origin;
  } else {
    // Server-side: use env var or default to localhost
    redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000';
  }
  
  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID is not set. Make sure to set NEXT_PUBLIC_SPOTIFY_CLIENT_ID in your .env.local file.');
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
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 
                     process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
                     'http://localhost:3000';
  
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
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

export async function getRecommendations(
  accessToken: string,
  seedTracks: string[],
  limit: number = 20
) {
  const spotifyApi = createSpotifyApi(accessToken);
  // Limit to 5 seed tracks as per Spotify API
  const seeds = seedTracks.slice(0, 5);
  const response = await spotifyApi.getRecommendations({
    seed_tracks: seeds,
    limit,
  });
  return response.body.tracks;
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
  const smallestAlbumImage = spotifyTrack.album.images.reduce(
    (smallest: any, image: any) => {
      if (image.height < smallest.height) return image;
      return smallest;
    },
    spotifyTrack.album.images[0]
  );

  return {
    id: spotifyTrack.id,
    title: spotifyTrack.name,
    artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
    artistId: spotifyTrack.artists[0]?.id,
    uri: spotifyTrack.uri,
    albumUrl: smallestAlbumImage?.url || '',
    albumName: spotifyTrack.album.name,
    duration: spotifyTrack.duration_ms,
  };
}

