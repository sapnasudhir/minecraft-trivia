'use client'

import { create } from 'zustand'
import { GameState, GameQuestion, PlayerAnswer } from '@/types/game'
import { generateGameQuestions } from '@/utils/questionGenerator'

const INITIAL_BATCH_SIZE = 5
const REFETCH_THRESHOLD = 2 // Fetch more when we have 2 or fewer questions left

// Tool tier colors for crafting grid
const TOOL_TIER_COLORS: Record<string, string> = {
  'wooden': '#a97c50',
  'wood': '#a97c50',
  'stone': '#9ca3af',
  'iron': '#d1d5db',
  'gold': '#facc15',
  'diamond': '#67e8f9',
  'netherite': '#1f2937',
}

// Extract tool tier from answer text (e.g., "Iron Pickaxe" -> "iron")
function extractToolTier(answer: string): string {
  const lower = answer.toLowerCase()
  if (lower.includes('iron')) return 'iron'
  if (lower.includes('diamond')) return 'diamond'
  if (lower.includes('netherite')) return 'netherite'
  if (lower.includes('gold') || lower.includes('golden')) return 'gold'
  if (lower.includes('stone')) return 'stone'
  if (lower.includes('wood') || lower.includes('wooden')) return 'wood'
  return 'stone' // default fallback
}

export const useGameStore = create<GameState>((set, get) => ({
  gameStatus: 'idle',
  currentQuestionIndex: 0,
  questions: [],
  selectedAnswerIndex: null,
  score: 0,
  answers: [],
  totalQuestionsPerGame: 0, // Dynamic - no fixed limit
  filledSlots: Array(8).fill(null),
  consecutiveCount: 0,
  lastResultWasCorrect: undefined,

  setQuestions: (questions: GameQuestion[]) => {
    set({ questions })
  },

  startGame: async () => {
    set({ gameStatus: 'loading' })
    try {
      const questions = await generateGameQuestions(INITIAL_BATCH_SIZE)
      set({
        gameStatus: 'playing',
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        selectedAnswerIndex: null,
        filledSlots: Array(8).fill(null),
        consecutiveCount: 0,
        lastResultWasCorrect: undefined,
        totalQuestionsPerGame: 0, // Will track actual questions answered
      })
    } catch {
      set({ gameStatus: 'error' })
    }
  },

  selectAnswer: (index: number) => {
    set({ selectedAnswerIndex: index })
  },

  showFeedback: () => {
    const { selectedAnswerIndex, questions, currentQuestionIndex, answers, consecutiveCount, lastResultWasCorrect, filledSlots } = get()

    if (selectedAnswerIndex === null) return

    const currentQuestion = questions[currentQuestionIndex]
    const selectedAnswer = currentQuestion.allOptions[selectedAnswerIndex]
    const correctAnswer = currentQuestion.correctAnswer
    const isCorrect = selectedAnswer === correctAnswer

    // Calculate streak-based points
    let streakBonus = 0
    let newConsecutiveCount = 1
    if (lastResultWasCorrect === isCorrect) {
      // Same result type - increment streak
      newConsecutiveCount = consecutiveCount + 1
      streakBonus = newConsecutiveCount - 1
    } else {
      // Different result type - reset to 1
      newConsecutiveCount = 1
      streakBonus = 0
    }

    // Calculate points: +10 base for correct, -5 for incorrect, +/- streak bonus
    let pointsEarned = 0
    if (isCorrect) {
      pointsEarned = 10 + streakBonus
    } else {
      pointsEarned = -5 - streakBonus
    }

    const newAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: correctAnswer,
      isCorrect,
      pointsEarned,
    }

    // Fill crafting grid slots on correct answer
    let newFilledSlots = [...filledSlots]
    if (isCorrect) {
      // Find first empty slot
      const emptyIdx = newFilledSlots.findIndex(slot => slot === null)
      if (emptyIdx !== -1) {
        // Add block fill
        newFilledSlots[emptyIdx] = {
          type: 'block',
          imageUrl: currentQuestion.imageUrl,
          grad: 'linear-gradient(135deg, #7dd3fc, #0ea5e9)', // fallback gradient
        }
      }
    }

    set({
      gameStatus: 'feedback',
      answers: [...answers, newAnswer],
      score: get().score + pointsEarned,
      consecutiveCount: newConsecutiveCount,
      lastResultWasCorrect: isCorrect,
      filledSlots: newFilledSlots,
    })
  },

  nextQuestion: async () => {
    const { currentQuestionIndex, questions, filledSlots } = get()
    const nextIndex = currentQuestionIndex + 1
    const isBoardComplete = filledSlots.every(Boolean)

    if (isBoardComplete) {
      set({ gameStatus: 'finished' })
      return
    }

    // Check if we need to fetch more questions
    const remainingQuestions = questions.length - nextIndex
    if (remainingQuestions <= REFETCH_THRESHOLD) {
      try {
        const newQuestions = await generateGameQuestions(INITIAL_BATCH_SIZE)
        const allQuestions = [...questions, ...newQuestions]
        set({
          questions: allQuestions,
          gameStatus: 'playing',
          currentQuestionIndex: nextIndex,
          selectedAnswerIndex: null,
        })
        return
      } catch (error) {
        console.error('Failed to fetch more questions:', error)
        // Continue anyway with existing questions
      }
    }

    set({
      gameStatus: 'playing',
      currentQuestionIndex: nextIndex,
      selectedAnswerIndex: null,
    })
  },

  endGame: () => {
    set({
      gameStatus: 'finished',
    })
  },

  resetGame: () => {
    set({
      gameStatus: 'idle',
      currentQuestionIndex: 0,
      questions: [],
      selectedAnswerIndex: null,
      score: 0,
      answers: [],
      filledSlots: Array(8).fill(null),
      consecutiveCount: 0,
      lastResultWasCorrect: undefined,
    })
  },
}))
