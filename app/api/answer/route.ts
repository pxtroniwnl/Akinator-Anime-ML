import { NextResponse } from 'next/server'
import { AkinatorEngine } from '@/lib/engine'

export async function POST(request: Request) {
  try {
    const { question, answer, gameState } = await request.json()

    if (!question || answer === undefined || !gameState) {
      return NextResponse.json(
        { error: 'Missing required fields: question, answer, gameState' },
        { status: 400 }
      )
    }

    // Restaurar el engine desde el estado guardado
    const engine = AkinatorEngine.fromJSON(gameState)
    
    // Actualizar con la respuesta
    engine.updateData(question, answer)

    // Verificar si ya tenemos ganador
    if (engine.getRemainingCount() <= 1) {
      const winner = engine.getResult()
      return NextResponse.json({
        status: 'finished',
        winner,
      })
    }

    // Obtener siguiente pregunta
    const nextQuestion = engine.getBestQuestion()

    if (!nextQuestion) {
      // No hay más preguntas que hagan diferencia, devolver el más probable
      const winner = engine.getResult()
      return NextResponse.json({
        status: 'finished',
        winner,
      })
    }

    return NextResponse.json({
      question: nextQuestion,
      status: 'playing',
      remaining: engine.getRemainingCount(),
      gameState: engine.toJSON(),
    })
  } catch (error) {
    console.error('Error processing answer:', error)
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    )
  }
}
