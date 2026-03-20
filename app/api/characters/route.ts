import { NextResponse } from 'next/server'
import { getCharacters } from '@/lib/engine'

export async function GET() {
  try {
    const characters = getCharacters()
    
    // Solo devolver los campos necesarios para la galería
    const simplified = characters.map(c => ({
      name: c.name,
      image_url: c.image_url,
      favorites: c.favorites,
      about: c.about,
    }))

    return NextResponse.json({
      characters: simplified,
      total: simplified.length,
    })
  } catch (error) {
    console.error('Error loading characters:', error)
    return NextResponse.json(
      { error: 'Failed to load characters' },
      { status: 500 }
    )
  }
}
