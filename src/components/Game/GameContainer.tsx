'use client'

import { useGameStore } from '@/store/gameStore'
import { StartScreen } from './StartScreen'
import { GameScreen } from './GameScreen'
import { GameOverScreen } from './GameOverScreen'

export function GameContainer() {
  const gameStatus = useGameStore((state) => state.gameStatus)
  const score = useGameStore((state) => state.score)
  const totalQuestionsPerGame = useGameStore(
    (state) => state.totalQuestionsPerGame
  )

  if (gameStatus === 'idle') {
    return <StartScreen />
  }

  if (gameStatus === 'playing' || gameStatus === 'feedback') {
    return <GameScreen />
  }

  if (gameStatus === 'finished') {
    return (
      <GameOverScreen
        score={score}
        totalQuestions={totalQuestionsPerGame}
      />
    )
  }

  return null
}
