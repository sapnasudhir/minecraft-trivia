'use client'

import { playClickSound } from '@/utils/sounds'

interface AnswerOptionsProps {
  options: string[]
  selectedIndex: number | null
  correctIndex: number
  isShowingFeedback: boolean
  onSelectAnswer: (index: number) => void
  disabled: boolean
}

export function AnswerOptions({
  options,
  selectedIndex,
  correctIndex,
  isShowingFeedback,
  onSelectAnswer,
  disabled,
}: AnswerOptionsProps) {
  const handleSelectAnswer = (index: number) => {
    if (!disabled) {
      playClickSound()
      onSelectAnswer(index)
    }
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index
        const isCorrect = index === correctIndex
        const showCorrect = isShowingFeedback && isCorrect
        const showIncorrect = isShowingFeedback && isSelected && !isCorrect

        let buttonClass = 'bg-white border-2 border-gray-300 text-gray-800'
        let animationClass = 'animate-fade-in'

        if (showCorrect) {
          buttonClass = 'bg-green-100 border-2 border-green-500 text-green-900'
          animationClass = 'answer-button correct'
        } else if (showIncorrect) {
          buttonClass = 'bg-red-100 border-2 border-red-500 text-red-900'
          animationClass = 'answer-button incorrect'
        } else if (isSelected && !isShowingFeedback) {
          buttonClass = 'bg-blue-100 border-2 border-blue-500 text-blue-900'
          animationClass = 'answer-button selected'
        } else {
          animationClass = 'answer-button'
        }

        return (
          <button
            key={index}
            onClick={() => handleSelectAnswer(index)}
            disabled={disabled}
            className={`w-full p-4 rounded-lg font-semibold transition-all duration-200 text-left ${buttonClass} ${animationClass} ${
              !disabled ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'
            }`}
            style={{
              animationDelay: `${index * 0.08}s`,
            }}
          >
            <span className="inline-block mr-3 font-bold">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
            {showCorrect && (
              <span className="float-right text-lg">✓</span>
            )}
            {showIncorrect && (
              <span className="float-right text-lg">✗</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
