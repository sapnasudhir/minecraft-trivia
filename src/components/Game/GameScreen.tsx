'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { QuestionCard } from './QuestionCard'
import { AnswerOptions } from './AnswerOptions'
import { FeedbackPanel } from './FeedbackPanel'
import { CraftingGrid } from './CraftingGrid'
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
    filledSlots,
    answers,
    endGame,
  } = useGameStore()

  const currentQuestion = questions[currentQuestionIndex]
  const isShowingFeedback = gameStatus === 'feedback'
  const isBoardComplete = filledSlots.every(Boolean)

  // Handle Enter key to advance
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isShowingFeedback && e.key === 'Enter') {
        void nextQuestion()
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

  const filledCount = filledSlots.filter(Boolean).length

  const handleTerminate = () => {
    if (window.confirm('End the game now? Your progress will be saved as-is.')) {
      endGame()
    }
  }

  return (
    <div
      className="min-h-screen p-4 py-8"
      style={{
        background: 'repeating-linear-gradient(90deg, #b98a52, #b98a52 38px, #a97b45 38px, #a97b45 40px)',
      }}
    >
      <div className="max-w-md mx-auto">
        {/* Parchment panel container */}
        <div
          className="rounded-none p-7"
          style={{
            background: '#f3e6c8',
            border: '3px solid #6b4a2b',
          }}
        >
          {/* Win banner */}
          {isBoardComplete && (
            <div
              className="w-full text-center mb-4 font-bold"
              style={{
                background: '#facc15',
                color: '#3d2b1c',
                border: '2px solid #6b4a2b',
                padding: '10px',
                fontFamily: "'Press Start 2P', cursive",
                fontSize: '10px',
              }}
            >
              TABLE COMPLETE — ALL BOXES FILLED!
            </div>
          )}

          {/* Header: Recipe number, Score, and Table progress */}
          <div
            className="flex justify-between items-center mb-4"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '9px',
              color: '#5a3d1e',
            }}
          >
            <span>RECIPE {currentQuestionIndex + 1}</span>
            <span style={{ fontSize: '11px' }}>SCORE: {score}</span>
            <span>TABLE {filledCount}/8 · {currentQuestion.difficulty}</span>
          </div>

          {/* Question Card (simplified for crafting table theme) */}
          <div className="mb-5 text-center">
            <h3
              className="font-bold mb-3"
              style={{
                fontSize: '16px',
                color: '#3d2b1c',
              }}
            >
              {currentQuestion.question}
            </h3>
          </div>

          {/* Crafting Grid */}
          <CraftingGrid
            filledSlots={filledSlots}
            currentBlockImageUrl={currentQuestion.imageUrl}
            currentBlockGradient="linear-gradient(135deg, #7dd3fc, #0ea5e9)"
            isShowingOutput={isShowingFeedback}
            isOutputCorrect={
              selectedAnswerIndex === currentQuestion.correctAnswerIndex
            }
          />

          {isShowingFeedback ? (
            <div>
              <FeedbackPanel
                isCorrect={
                  selectedAnswerIndex === currentQuestion.correctAnswerIndex
                }
                correctAnswer={currentQuestion.correctAnswer}
                selectedAnswer={
                  currentQuestion.allOptions[selectedAnswerIndex ?? 0] ?? ''
                }
                explanation={currentQuestion.explanation}
                pointsEarned={answers[answers.length - 1]?.pointsEarned ?? 0}
                onNext={() => void nextQuestion()}
              />

              {/* Next Recipe button */}
              <button
                onClick={() => void nextQuestion()}
                className="w-full font-bold py-3 px-6 transition duration-200 text-white"
                style={{
                  background: '#5b8a3a',
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                NEXT RECIPE
              </button>
            </div>
          ) : (
            <div>
              {/* Answer Options */}
              <AnswerOptions
                options={currentQuestion.allOptions}
                selectedIndex={selectedAnswerIndex}
                correctIndex={currentQuestion.correctAnswerIndex}
                isShowingFeedback={isShowingFeedback}
                onSelectAnswer={selectAnswer}
                disabled={false}
              />

              {/* Craft It button */}
              {selectedAnswerIndex !== null && (
                <button
                  onClick={showFeedback}
                  className="w-full font-bold py-3 px-6 mt-4 transition duration-200 text-white"
                  style={{
                    background: '#6b4a2b',
                    color: '#f3e6c8',
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  CRAFT IT
                </button>
              )}
            </div>
          )}

          {/* Terminate button */}
          <button
            onClick={handleTerminate}
            className="w-full font-bold py-3 px-6 mt-4 transition duration-200"
            style={{
              background: 'transparent',
              color: '#8a3a3a',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '9px',
              border: '2px solid #8a3a3a',
              cursor: 'pointer',
            }}
          >
            TERMINATE GAME
          </button>
        </div>
      </div>
    </div>
  )
}
