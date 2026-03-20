import { NextResponse } from 'next/server'
import { AkinatorEngine } from '@/lib/engine'

export async function GET() {
  try {
    const engine = new AkinatorEngine()
    const question = engine.getBestQuestion()

    if (!question) {
      return NextResponse.json(
        { error: 'No questions available' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      question,
      status: 'playing',
      remaining: engine.getRemainingCount(),
      gameState: engine.toJSON(),
    })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    )
  }
}
