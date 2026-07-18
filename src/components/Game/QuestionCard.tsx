'use client'

import Image from 'next/image'
import { GameQuestion } from '@/types/game'

interface QuestionCardProps {
  question: GameQuestion
  questionNumber: number
  totalQuestions: number
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 question-card">
      {/* Progress and metadata */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              difficultyColor[question.difficulty]
            }`}
          >
            {question.difficulty.charAt(0).toUpperCase() +
              question.difficulty.slice(1)}
          </span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {question.category}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((questionNumber) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Block image and name */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <Image
              src={question.imageUrl}
              alt={question.blockName}
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-center text-sm font-semibold text-gray-700 mt-2">
            {question.blockName}
          </p>
        </div>
      </div>

      {/* Question text */}
      <div className="text-center">
        <p className="text-lg md:text-xl font-semibold text-gray-800">
          {question.question}
        </p>
      </div>
    </div>
  )
}
