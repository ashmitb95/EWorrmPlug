import { NextRequest, NextResponse } from 'next/server'
import { getRecommendations, transformTrack, type RecommendationOptions } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accessToken = searchParams.get('accessToken')
    
    // Support both old format (seedTracks) and new format (seedTracks, seedArtists, seedGenres)
    const seedTracks = searchParams.get('seedTracks')
    const seedArtists = searchParams.get('seedArtists')
    const seedGenres = searchParams.get('seedGenres')
    
    // Audio feature parameters
    const targetEnergy = searchParams.get('targetEnergy')
    const targetDanceability = searchParams.get('targetDanceability')
    const targetValence = searchParams.get('targetValence')
    const targetAcousticness = searchParams.get('targetAcousticness')
    const minEnergy = searchParams.get('minEnergy')
    const maxEnergy = searchParams.get('maxEnergy')
    const minDanceability = searchParams.get('minDanceability')
    const maxDanceability = searchParams.get('maxDanceability')
    const limit = searchParams.get('limit')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      )
    }

    // Build recommendation options
    const options: RecommendationOptions = {
      limit: limit ? parseInt(limit) : 20,
    }

    // Parse seed tracks (backward compatible)
    if (seedTracks) {
      options.seedTracks = seedTracks.split(',').filter(Boolean)
    }
    
    // Parse seed artists
    if (seedArtists) {
      options.seedArtists = seedArtists.split(',').filter(Boolean)
    }
    
    // Parse seed genres
    if (seedGenres) {
      options.seedGenres = seedGenres.split(',').filter(Boolean)
    }

    // Parse audio feature targets
    if (targetEnergy) options.targetEnergy = parseFloat(targetEnergy)
    if (targetDanceability) options.targetDanceability = parseFloat(targetDanceability)
    if (targetValence) options.targetValence = parseFloat(targetValence)
    if (targetAcousticness) options.targetAcousticness = parseFloat(targetAcousticness)
    if (minEnergy) options.minEnergy = parseFloat(minEnergy)
    if (maxEnergy) options.maxEnergy = parseFloat(maxEnergy)
    if (minDanceability) options.minDanceability = parseFloat(minDanceability)
    if (maxDanceability) options.maxDanceability = parseFloat(maxDanceability)

    // At least one seed type is required
    if (!options.seedTracks?.length && !options.seedArtists?.length && !options.seedGenres?.length) {
      return NextResponse.json(
        { error: 'At least one seed (tracks, artists, or genres) is required' },
        { status: 400 }
      )
    }

    const tracks = await getRecommendations(accessToken, options)
    const transformedTracks = tracks.map(transformTrack)

    return NextResponse.json(transformedTracks)
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendations',
        details: error?.body?.error_description || error?.message
      },
      { status: 500 }
    )
  }
}

