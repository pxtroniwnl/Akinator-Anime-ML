'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, RefreshCw, User, Heart, Users, ArrowLeft, Search, X } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type GameStatus = 'welcome' | 'browse' | 'playing' | 'loading' | 'finished' | 'error'

interface Character {
  name: string
  image_url: string
  about: string
  favorites: number
}

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

function WelcomeScreen({ 
  onStart, 
  onBrowse, 
  isLoading,
  totalCharacters 
}: { 
  onStart: () => void
  onBrowse: () => void
  isLoading: boolean
  totalCharacters: number
}) {
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
        {totalCharacters > 0 && (
          <p className="text-sm text-violet-light mt-2">
            {totalCharacters} characters available
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          onClick={onStart}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-violet to-violet-light rounded-xl font-semibold text-lg
                     shadow-lg shadow-violet/30 hover:shadow-violet/50 transition-shadow
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

        <motion.button
          onClick={onBrowse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-deep-indigo/80 border border-violet/30 rounded-xl font-semibold text-lg
                     hover:bg-deep-indigo hover:border-violet/50 transition-all flex items-center justify-center gap-3"
        >
          <Users className="w-5 h-5" />
          View Characters
        </motion.button>
      </div>
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

function CharacterCard({ character, index }: { character: Character; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-deep-indigo/50 backdrop-blur-md rounded-xl border border-violet/20 overflow-hidden 
                   hover:border-violet/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-violet/10"
      >
        <div className="aspect-[3/4] relative overflow-hidden">
          {character.image_url ? (
            <img
              src={character.image_url}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-deep-indigo flex items-center justify-center">
              <User className="w-12 h-12 text-violet-light/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-indigo via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white truncate">{character.name}</h3>
            <div className="flex items-center gap-1 text-rose-400 text-xs">
              <Heart className="w-3 h-3 fill-current" />
              <span>{character.favorites?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-deep-indigo/90 backdrop-blur-md rounded-2xl border border-violet/30 overflow-hidden max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="relative">
                {character.image_url ? (
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-deep-indigo flex items-center justify-center">
                    <User className="w-24 h-24 text-violet-light/50" />
                  </div>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-light to-emerald-400 bg-clip-text text-transparent">
                  {character.name}
                </h2>
                <div className="flex items-center gap-1 text-rose-400 mb-4">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm">{character.favorites?.toLocaleString() || 0} favorites</span>
                </div>
                {character.about && (
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {character.about.slice(0, 500)}
                    {character.about.length > 500 ? '...' : ''}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CharacterGallery({ 
  characters, 
  onBack,
  onStartGame,
  isLoading 
}: { 
  characters: Character[]
  onBack: () => void
  onStartGame: () => void
  isLoading: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-deep-indigo/80 border border-violet/30 rounded-xl hover:border-violet/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-light to-emerald-400 bg-clip-text text-transparent">
              Character Gallery
            </h2>
            <p className="text-sm text-gray-400">
              {filteredCharacters.length} of {characters.length} characters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-deep-indigo/80 border border-violet/30 rounded-xl 
                         text-white placeholder-gray-500 focus:outline-none focus:border-violet/50 transition-colors"
            />
          </div>
          <motion.button
            onClick={onStartGame}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-violet to-violet-light rounded-xl font-semibold
                       shadow-lg shadow-violet/30 hover:shadow-violet/50 transition-shadow whitespace-nowrap
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Play Now
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredCharacters.map((character, index) => (
          <CharacterCard key={character.name} character={character} index={index} />
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No characters found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
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
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false)

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const response = await fetch(`${API_URL}/characters`)
        if (response.ok) {
          const data = await response.json()
          setCharacters(data.characters || [])
        }
      } catch {
        // Silently fail - characters will just show 0
      }
    }
    fetchCharacters()
  }, [])

  const browseCharacters = useCallback(async () => {
    if (characters.length > 0) {
      setGameState((prev) => ({ ...prev, status: 'browse' }))
      return
    }

    setIsLoadingCharacters(true)
    try {
      const response = await fetch(`${API_URL}/characters`)
      if (response.ok) {
        const data = await response.json()
        setCharacters(data.characters || [])
        setGameState((prev) => ({ ...prev, status: 'browse' }))
      }
    } catch {
      // Stay on welcome screen if fetch fails
    } finally {
      setIsLoadingCharacters(false)
    }
  }, [characters.length])

  const startGame = useCallback(async () => {
    setGameState((prev) => ({ ...prev, status: 'loading' }))

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
    } catch (error) {
      setGameState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to connect to server',
      }))
    }
  }, [])

  const handleAnswer = useCallback(async (answer: number) => {
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
    } catch (error) {
      setGameState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to submit answer',
      }))
    }
  }, [gameState.question])

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
    <main className="min-h-screen bg-gradient-to-br from-deep-indigo via-violet/20 to-deep-indigo flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <AnimatePresence mode="wait">
          {gameState.status === 'welcome' && (
            <WelcomeScreen 
              key="welcome" 
              onStart={startGame} 
              onBrowse={browseCharacters}
              isLoading={isLoadingCharacters} 
              totalCharacters={characters.length}
            />
          )}

          {gameState.status === 'loading' && gameState.questionCount === 0 && (
            <WelcomeScreen 
              key="welcome-loading" 
              onStart={startGame} 
              onBrowse={browseCharacters}
              isLoading={true} 
              totalCharacters={characters.length}
            />
          )}

          {gameState.status === 'browse' && (
            <CharacterGallery
              key="browse"
              characters={characters}
              onBack={() => setGameState((prev) => ({ ...prev, status: 'welcome' }))}
              onStartGame={startGame}
              isLoading={gameState.status === 'loading'}
            />
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
            <CharacterReveal
              key="reveal"
              winner={gameState.winner}
              onPlayAgain={resetGame}
            />
          )}

          {gameState.status === 'error' && (
            <ErrorScreen
              key="error"
              error={gameState.error || 'An unknown error occurred'}
              onRetry={startGame}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
