'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { playGameOverSound } from '@/utils/sounds'

interface GameOverScreenProps {
  score: number
  totalQuestions: number
  onShowLeaderboard: () => void
}

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  rotate: number
}

const CONFETTI_COLORS = ['#facc15', '#d4d4d8', '#d97757', '#5b8a3a', '#f3e6c8']

export function GameOverScreen({ score, totalQuestions, onShowLeaderboard }: GameOverScreenProps) {
  const resetGame = useGameStore((state) => state.resetGame)
  const answers = useGameStore((state) => state.answers)
  const leaderboardRank = useGameStore((state) => state.leaderboardRank)

  const isTop10 = leaderboardRank !== null && leaderboardRank <= 10
  const isTop3 = leaderboardRank !== null && leaderboardRank <= 3

  // Play game over sound when component mounts
  useEffect(() => {
    playGameOverSound()
  }, [])

  // Random positions only need to be generated once -- a lazy useState
  // initializer runs exactly one time (on mount), unlike a render-phase
  // Math.random() call, which React's purity rule (correctly) rejects.
  // Whether they're shown at all is gated on isTop3 below, at render time.
  const [confettiPieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 1.4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
    }))
  )

  const correctCount = answers.filter((a) => a.isCorrect).length
  const incorrectCount = answers.length - correctCount
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const performanceMessage =
    percentage === 100
      ? '🎉 Perfect! You are a Minecraft master!'
      : percentage >= 80
        ? '🎮 Great job! You know your blocks!'
        : percentage >= 60
          ? '👍 Good effort! Keep playing!'
          : '📚 Try again to improve your knowledge!'

  return (
    <div
      className="flex flex-col items-center justify-start sm:justify-center min-h-dvh overflow-x-hidden p-4 py-6"
      style={{
        background: 'repeating-linear-gradient(90deg, #b98a52, #b98a52 38px, #a97b45 38px, #a97b45 40px)',
        position: 'relative',
      }}
    >
      {isTop3 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="animate-confetti"
              style={{
                position: 'absolute',
                left: `${piece.left}%`,
                top: '-20px',
                width: '10px',
                height: '10px',
                background: piece.color,
                transform: `rotate(${piece.rotate}deg)`,
                animationDuration: `${piece.duration}s`,
                animationDelay: `${piece.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full text-center max-w-md animate-slide-up">
        <h1
          className="animate-bounce-sm"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 'clamp(20px, 7vw, 28px)',
            color: 'white',
            margin: '0 0 16px',
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          }}
        >
          GAME OVER
        </h1>

        {isTop10 && (
          <div
            className="animate-badge-pop"
            style={{
              display: 'inline-block',
              background: isTop3 ? '#facc15' : '#f3e6c8',
              color: '#3d2b1c',
              border: '3px solid #6b4a2b',
              padding: '10px 16px',
              marginBottom: '16px',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: isTop3 ? '13px' : '11px',
              lineHeight: 1.6,
            }}
          >
            {isTop3 ? `🎉 #${leaderboardRank} ON THE LEADERBOARD!` : `🏆 TOP 10 SCORE! (#${leaderboardRank})`}
          </div>
        )}

        <div className="my-4">
          <p
            className="animate-pulse-sm"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: 'clamp(34px, 12vw, 52px)',
              color: '#facc15',
              margin: '0 0 8px',
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            }}
          >
            {score}
          </p>
          <p
            className="animate-fade-in"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '14px',
              color: 'white',
              margin: '0 0 12px',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
            }}
          >
            TOTAL SCORE
          </p>
          <p className="animate-fade-in" style={{ fontSize: '15px', color: 'white', margin: '0 0 16px' }}>
            {performanceMessage}
          </p>
        </div>

        <div
          className="relative w-full max-w-md aspect-video mb-4 animate-fade-in"
          style={{ border: '3px solid #6b4a2b' }}
        >
          <Image
            src="/gameover-hero.png"
            alt="Game Over Hero"
            fill
            className="object-cover"
            priority
          />
        </div>

        <button
          onClick={resetGame}
          className="w-full font-bold py-3 px-6 transition duration-200 text-lg mb-4"
          style={{
            background: '#5b8a3a',
            color: 'white',
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          PLAY AGAIN
        </button>

        {isTop10 && (
          <p
            className="animate-fade-in"
            style={{
              color: '#facc15',
              fontSize: '13px',
              margin: '0 0 8px',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
            }}
          >
            👉 See where you rank!
          </p>
        )}

        <button
          onClick={onShowLeaderboard}
          className={`w-full font-bold ${isTop10 ? 'animate-glow' : ''}`}
          style={{
            padding: '12px 24px',
            fontSize: '11px',
            marginBottom: '14px',
            background: 'transparent',
            color: '#facc15',
            fontFamily: "'Press Start 2P', cursive",
            border: '2px solid #facc15',
            cursor: 'pointer',
          }}
        >
          🏆 TOP 10 LEADERBOARD
        </button>

        <div
          className="p-4 animate-fade-in"
          style={{ background: '#f3e6c8', border: '3px solid #6b4a2b' }}
        >
          <h3
            className="mb-2"
            style={{
              color: '#3d2b1c',
              fontWeight: 'bold',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '12px',
            }}
          >
            YOUR PERFORMANCE
          </h3>
          <div className="text-left space-y-1" style={{ color: '#3d2b1c', fontSize: '13px' }}>
            <p className="font-semibold">✓ Correct: {correctCount}</p>
            <p className="font-semibold">✗ Incorrect: {incorrectCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
