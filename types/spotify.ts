// Spotify API Types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  uri: string;
  duration_ms: number;
  preview_url: string | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: {
    display_name: string;
  };
  tracks: {
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  uri: string;
  albumUrl: string;
  albumName?: string;
  duration?: number;
}

export interface ArtistWithTracks {
  artist: SpotifyArtist;
  tracks: Track[];
}

export interface PlaylistData {
  name: string;
  tracks: SpotifyTrack[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

