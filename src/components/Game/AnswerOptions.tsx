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
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index
        const isCorrect = index === correctIndex
        const showCorrect = isShowingFeedback && isCorrect
        const showIncorrect = isShowingFeedback && isSelected && !isCorrect

        let buttonStyle: React.CSSProperties = {
          background: '#fff8e7',
          border: '2px solid #8a6a3f',
          color: '#4a3116',
        }

        if (showCorrect) {
          buttonStyle = {
            background: '#e3f2d8',
            border: '2px solid #4a7a2e',
            color: '#284d16',
          }
        } else if (showIncorrect) {
          buttonStyle = {
            background: '#f6dede',
            border: '2px solid #a33',
            color: '#6b1414',
            animation: 'shakeX 0.4s',
          }
        } else if (isSelected && !isShowingFeedback) {
          buttonStyle = {
            background: '#f0dfae',
            border: '2px solid #b8860b',
            color: '#4a3116',
          }
        }

        return (
          <button
            key={index}
            onClick={() => handleSelectAnswer(index)}
            disabled={disabled}
            className="w-full text-center font-semibold text-sm transition-all duration-200"
            style={{
              ...buttonStyle,
              padding: '12px',
              cursor: !disabled ? 'pointer' : 'not-allowed',
              opacity: disabled && !showCorrect && !showIncorrect ? 0.6 : 1,
            }}
          >
            <span className="mr-2 font-bold">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
            {showCorrect && (
              <span className="ml-2">✓</span>
            )}
            {showIncorrect && (
              <span className="ml-2">✗</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
