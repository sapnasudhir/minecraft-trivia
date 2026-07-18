'use client'

import { useGameStore } from '@/store/gameStore'
import { StartScreen } from './StartScreen'
import { GameScreen } from './GameScreen'
import { GameOverScreen } from './GameOverScreen'

export function GameContainer() {
  const gameStatus = useGameStore((state) => state.gameStatus)
  const score = useGameStore((state) => state.score)
  const answers = useGameStore((state) => state.answers)
  const startGame = useGameStore((state) => state.startGame)
  const resetGame = useGameStore((state) => state.resetGame)

  if (gameStatus === 'idle') {
    return <StartScreen />
  }

  if (gameStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 p-4">
        <div className="text-white text-xl font-semibold animate-pulse-sm">
          Loading questions...
        </div>
      </div>
    )
  }

  if (gameStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-600 to-red-800 p-4">
        <div className="text-white text-xl font-semibold mb-6">
          Couldn&apos;t load questions. Please try again.
        </div>
        <button
          onClick={() => {
            resetGame()
            void startGame()
          }}
          className="bg-white text-red-700 font-bold py-3 px-6 rounded-lg"
        >
          Retry
        </button>
      </div>
    )
  }

  if (gameStatus === 'playing' || gameStatus === 'feedback') {
    return <GameScreen />
  }

  if (gameStatus === 'finished') {
    return (
      <GameOverScreen
        score={score}
        totalQuestions={answers.length}
      />
    )
  }

  return null
}
