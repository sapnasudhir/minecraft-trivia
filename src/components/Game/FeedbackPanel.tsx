'use client'

import { useEffect } from 'react'
import { playCorrectSound, playIncorrectSound } from '@/utils/sounds'

interface FeedbackPanelProps {
  isCorrect: boolean
  correctAnswer: string
  selectedAnswer: string
  explanation?: string
  onNext: () => void
}

export function FeedbackPanel({
  isCorrect,
  correctAnswer,
  selectedAnswer,
  explanation,
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 feedback-panel">
      {/* Feedback header */}
      <div className="mb-4">
        {isCorrect ? (
          <div className={`flex items-center text-green-600 text-xl font-bold animate-bounce-sm`}>
            <span className="text-3xl mr-3 animate-pulse-sm">✓</span>
            Correct!
          </div>
        ) : (
          <div className={`flex items-center text-red-600 text-xl font-bold`}>
            <span className="text-3xl mr-3">✗</span>
            Incorrect
          </div>
        )}
      </div>

      {/* Answer summary */}
      <div className="space-y-3 mb-4">
        {!isCorrect && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Your answer:</p>
            <p className="text-red-700 font-semibold">{selectedAnswer}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-600 mb-1">Correct answer:</p>
          <p className="text-green-700 font-semibold">{correctAnswer}</p>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="bg-gray-50 rounded p-3 mb-4">
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
      >
        Next Question
      </button>
    </div>
  )
}
