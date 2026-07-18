'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { playGameOverSound } from '@/utils/sounds'

interface GameOverScreenProps {
  score: number
  totalQuestions: number
}

export function GameOverScreen({ score, totalQuestions }: GameOverScreenProps) {
  const resetGame = useGameStore((state) => state.resetGame)

  // Play game over sound when component mounts
  useEffect(() => {
    playGameOverSound()
  }, [])

  const percentage = Math.round((score / totalQuestions) * 100)
  const performanceMessage =
    percentage === 100
      ? '🎉 Perfect! You are a Minecraft master!'
      : percentage >= 80
        ? '🎮 Great job! You know your blocks!'
        : percentage >= 60
          ? '👍 Good effort! Keep playing!'
          : '📚 Try again to improve your knowledge!'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 p-4">
      <div className="text-center max-w-md animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 pixel-font animate-bounce-sm">
          GAME OVER
        </h1>

        <div className="my-8">
          <p className="text-6xl font-bold text-yellow-300 mb-2 animate-pulse-sm">{percentage}%</p>
          <p className="text-2xl font-semibold text-white mb-4 animate-fade-in">
            {score} out of {totalQuestions}
          </p>
          <p className="text-xl text-white mb-8 animate-fade-in">{performanceMessage}</p>
        </div>

        <div className="relative w-full max-w-md aspect-video mb-8 animate-fade-in">
          <Image
            src="/gameover-hero.png"
            alt="Game Over Hero"
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-lg pixel-font mb-6"
        >
          PLAY AGAIN
        </button>

        <div className="bg-yellow-400 rounded-lg p-6 animate-fade-in">
          <h3 className="text-gray-900 font-bold mb-3">Your Performance</h3>
          <div className="text-gray-900 text-left space-y-2">
            <p className="font-semibold">✓ Correct: {score}</p>
            <p className="font-semibold">✗ Incorrect: {totalQuestions - score}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
