'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { QuestionCard } from './QuestionCard'
import { AnswerOptions } from './AnswerOptions'
import { FeedbackPanel } from './FeedbackPanel'
import { ScoreBoard } from './ScoreBoard'
import { playNextQuestionSound } from '@/utils/sounds'

export function GameScreen() {
  const {
    gameStatus,
    currentQuestionIndex,
    questions,
    selectedAnswerIndex,
    score,
    selectAnswer,
    showFeedback,
    nextQuestion,
    totalQuestionsPerGame,
  } = useGameStore()

  const currentQuestion = questions[currentQuestionIndex]
  const isShowingFeedback = gameStatus === 'feedback'

  // Handle Enter key to advance
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isShowingFeedback && e.key === 'Enter') {
        nextQuestion()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isShowingFeedback, nextQuestion])

  // Play sound when question loads
  useEffect(() => {
    if (gameStatus === 'playing' && currentQuestion) {
      playNextQuestionSound()
    }
  }, [currentQuestionIndex, gameStatus])

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <ScoreBoard score={score} totalQuestions={totalQuestionsPerGame} />

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestionsPerGame}
        />

        {isShowingFeedback ? (
          <FeedbackPanel
            isCorrect={
              selectedAnswerIndex === currentQuestion.correctAnswerIndex
            }
            correctAnswer={currentQuestion.correctAnswer}
            selectedAnswer={
              currentQuestion.allOptions[selectedAnswerIndex ?? 0] ?? ''
            }
            explanation={currentQuestion.explanation}
            onNext={nextQuestion}
          />
        ) : (
          <div>
            <AnswerOptions
              options={currentQuestion.allOptions}
              selectedIndex={selectedAnswerIndex}
              correctIndex={currentQuestion.correctAnswerIndex}
              isShowingFeedback={isShowingFeedback}
              onSelectAnswer={selectAnswer}
              disabled={false}
            />

            {selectedAnswerIndex !== null && (
              <button
                onClick={showFeedback}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Submit Answer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
