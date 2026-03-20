'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, RefreshCw, User, Heart } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type GameStatus = 'welcome' | 'playing' | 'loading' | 'finished' | 'error'

interface Winner {
  name: string
  image_url: string
  about: string
  favorites: number
}

interface GameState {
  status: GameStatus
  question: string
  winner: Winner | null
  questionCount: number
  error: string | null
}

function formatQuestion(question: string): string {
  return question
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/^/, 'Is this character ')
    .concat('?')
}

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#10b981', '#f43f5e', '#7c3aed', '#fbbf24', '#3b82f6']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomX = Math.random() * 100
  const randomRotation = Math.random() * 360

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: randomColor, left: `${randomX}%` }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        opacity: [1, 1, 0],
        rotate: randomRotation + 720,
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
      }}
      transition={{
        duration: 3,
        delay,
        ease: 'easeOut',
      }}
    />
  )
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle key={i} delay={i * 0.05} />
      ))}
    </div>
  )
}

function ProgressBar({ questionCount }: { questionCount: number }) {
  const certainty = Math.min(95, 30 + questionCount * 8)

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-violet-light font-medium">Model Certainty</span>
        <span className="text-sm text-emerald-400 font-mono">{certainty}%</span>
      </div>
      <div className="h-2 bg-deep-indigo rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet to-emerald-500"
          initial={{ width: '30%' }}
          animate={{ width: `${certainty}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function ThinkingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Brain className="w-16 h-16 text-violet-light" />
        <motion.div
          className="absolute inset-0 rounded-full bg-violet/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      <p className="text-violet-light text-lg">Analyzing your answer...</p>
    </div>
  )
}

function WelcomeScreen({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center gap-8 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Brain className="w-24 h-24 text-violet-light" />
      </motion.div>

      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-light to-emerald-400 bg-clip-text text-transparent">
          Anime Akinator
        </h1>
        <p className="text-lg text-gray-400 max-w-md">
          Think of an anime character and I will try to guess who it is using machine learning!
        </p>
      </div>

      <motion.button
        onClick={onStart}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 bg-gradient-to-r from-violet to-violet-light rounded-xl font-semibold text-lg
                   shadow-lg shadow-violet/30 hover:shadow-violet/50 transition-shadow
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Start Game
          </>
        )}
      </motion.button>
    </motion.div>
  )
}

function QuestionCard({
  question,
  questionCount,
  onAnswer,
  isLoading,
}: {
  question: string
  questionCount: number
  onAnswer: (answer: number) => void
  isLoading: boolean
}) {
  return (
    <motion.div
      key={question}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-lg"
    >
      <ProgressBar questionCount={questionCount} />

      <div className="bg-deep-indigo/50 backdrop-blur-md rounded-2xl p-8 border border-violet/30 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 bg-violet/30 rounded-full text-sm text-violet-light font-mono">
            Question #{questionCount}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold mb-8 leading-relaxed">
          {formatQuestion(question)}
        </h2>

        <div className="flex gap-4">
          <motion.button
            onClick={() => onAnswer(1)}
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-lg
                       shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yes
          </motion.button>

          <motion.button
            onClick={() => onAnswer(0)}
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold text-lg
                       shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function CharacterReveal({ winner, onPlayAgain }: { winner: Winner; onPlayAgain: () => void }) {
  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-lg"
      >
        <div className="bg-deep-indigo/50 backdrop-blur-md rounded-2xl p-8 border border-violet/30 shadow-xl overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet/20 to-emerald-500/20"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Character Found!</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>

            <div className="flex flex-col items-center gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative"
              >
                {winner.image_url ? (
                  <img
                    src={winner.image_url}
                    alt={winner.name}
                    className="w-48 h-64 object-cover rounded-xl border-4 border-violet-light shadow-2xl"
                  />
                ) : (
                  <div className="w-48 h-64 bg-deep-indigo rounded-xl border-4 border-violet-light flex items-center justify-center">
                    <User className="w-16 h-16 text-violet-light" />
                  </div>
                )}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-violet to-emerald-500 rounded-xl -z-10 blur-md"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-light to-emerald-400 bg-clip-text text-transparent">
                  {winner.name}
                </h2>

                <div className="flex items-center justify-center gap-1 text-rose-400 mb-4">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-mono">{winner.favorites?.toLocaleString() || 0} favorites</span>
                </div>

                {winner.about && (
                  <p className="text-gray-400 text-sm leading-relaxed max-h-32 overflow-y-auto px-2">
                    {winner.about.slice(0, 300)}
                    {winner.about.length > 300 ? '...' : ''}
                  </p>
                )}
              </div>
            </div>

            <motion.button
              onClick={onPlayAgain}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-8 py-4 bg-gradient-to-r from-violet to-violet-light rounded-xl font-semibold text-lg
                         shadow-lg shadow-violet/30 hover:shadow-violet/50 transition-shadow flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-deep-indigo/50 backdrop-blur-md rounded-2xl p-8 border border-rose-500/30 shadow-xl max-w-md text-center"
    >
      <div className="text-rose-400 text-6xl mb-4">!</div>
      <h2 className="text-2xl font-bold mb-2 text-rose-400">Connection Error</h2>
      <p className="text-gray-400 mb-6">{error}</p>
      <motion.button
        onClick={onRetry}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold transition-colors"
      >
        Try Again
      </motion.button>
    </motion.div>
  )
}

export default function AnimeAkinator() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'welcome',
    question: '',
    winner: null,
    questionCount: 0,
    error: null,
  })

  const startGame = useCallback(async () => {
    setGameState((prev) => ({ ...prev, status: 'loading', error: null }))

    try {
      const response = await fetch(`${API_URL}/start`)
      if (!response.ok) throw new Error('Failed to start game')

      const data = await response.json()
      setGameState({
        status: 'playing',
        question: data.question,
        winner: null,
        questionCount: 1,
        error: null,
      })
    } catch (err) {
      setGameState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unable to connect to the game server. Make sure the API is running.',
      }))
    }
  }, [])

  const handleAnswer = useCallback(
    async (answer: number) => {
      setGameState((prev) => ({ ...prev, status: 'loading' }))

      try {
        const response = await fetch(
          `${API_URL}/answer?question=${encodeURIComponent(gameState.question)}&ans=${answer}`,
          { method: 'POST' }
        )
        if (!response.ok) throw new Error('Failed to submit answer')

        const data = await response.json()

        if (data.status === 'finished') {
          setGameState((prev) => ({
            ...prev,
            status: 'finished',
            winner: data.winner,
          }))
        } else {
          setGameState((prev) => ({
            ...prev,
            status: 'playing',
            question: data.question,
            questionCount: prev.questionCount + 1,
          }))
        }
      } catch (err) {
        setGameState((prev) => ({
          ...prev,
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to process your answer. Please try again.',
        }))
      }
    },
    [gameState.question]
  )

  const resetGame = useCallback(() => {
    setGameState({
      status: 'welcome',
      question: '',
      winner: null,
      questionCount: 0,
      error: null,
    })
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState.status === 'welcome' && (
            <WelcomeScreen key="welcome" onStart={startGame} isLoading={false} />
          )}

          {gameState.status === 'loading' && gameState.questionCount === 0 && (
            <WelcomeScreen key="welcome-loading" onStart={startGame} isLoading={true} />
          )}

          {gameState.status === 'loading' && gameState.questionCount > 0 && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThinkingAnimation />
            </motion.div>
          )}

          {gameState.status === 'playing' && (
            <QuestionCard
              key={`question-${gameState.questionCount}`}
              question={gameState.question}
              questionCount={gameState.questionCount}
              onAnswer={handleAnswer}
              isLoading={false}
            />
          )}

          {gameState.status === 'finished' && gameState.winner && (
            <CharacterReveal key="reveal" winner={gameState.winner} onPlayAgain={resetGame} />
          )}

          {gameState.status === 'error' && (
            <ErrorScreen
              key="error"
              error={gameState.error || 'An unexpected error occurred'}
              onRetry={gameState.questionCount > 0 ? () => setGameState((prev) => ({ ...prev, status: 'playing' })) : startGame}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
