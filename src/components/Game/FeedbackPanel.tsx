'use client'

import { useEffect } from 'react'
import { playCorrectSound, playIncorrectSound } from '@/utils/sounds'

interface FeedbackPanelProps {
  isCorrect: boolean
  correctAnswer: string
  selectedAnswer: string
  explanation?: string
  pointsEarned: number
  onNext: () => void | Promise<void>
}

export function FeedbackPanel({
  isCorrect,
  correctAnswer,
  selectedAnswer,
  explanation,
  pointsEarned,
  onNext,
}: FeedbackPanelProps) {
  // Play sound when feedback panel appears
  useEffect(() => {
    if (isCorrect) {
      playCorrectSound()
    } else {
      playIncorrectSound()
    }
  }, [isCorrect])

  const pointsDisplay = isCorrect ? `+${pointsEarned}` : `${pointsEarned}`

  return (
    <div
      className="rounded-none p-3.5 mb-4"
      style={{
        background: '#fff8e7',
        border: `2px solid ${isCorrect ? '#16a34a' : '#dc2626'}`,
      }}
    >
      {/* Feedback header with points */}
      <div className="mb-2">
        {isCorrect ? (
          <div style={{ color: '#16a34a', fontWeight: 'bold' }}>
            Correct! — {correctAnswer}
          </div>
        ) : (
          <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
            Incorrect — {correctAnswer}
          </div>
        )}
      </div>

      {/* Points display */}
      <div
        className="text-lg font-bold mb-2"
        style={{
          color: isCorrect ? '#16a34a' : '#dc2626',
        }}
      >
        Points: {pointsDisplay}
      </div>

      {/* Explanation */}
      {explanation && (
        <p
          style={{
            fontSize: '13px',
            color: '#5a3d1e',
          }}
        >
          {explanation}
        </p>
      )}
    </div>
  )
}
