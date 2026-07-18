'use client'

import { create } from 'zustand'
import { GameState, GameQuestion, PlayerAnswer } from '@/types/game'
import { generateGameQuestions } from '@/utils/questionGenerator'

const TOTAL_QUESTIONS_PER_GAME = 5

export const useGameStore = create<GameState>((set, get) => ({
  gameStatus: 'idle',
  currentQuestionIndex: 0,
  questions: [],
  selectedAnswerIndex: null,
  score: 0,
  answers: [],
  totalQuestionsPerGame: TOTAL_QUESTIONS_PER_GAME,

  setQuestions: (questions: GameQuestion[]) => {
    set({ questions })
  },

  startGame: () => {
    const questions = generateGameQuestions(TOTAL_QUESTIONS_PER_GAME)
    set({
      gameStatus: 'playing',
      questions,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      selectedAnswerIndex: null,
    })
  },

  selectAnswer: (index: number) => {
    set({ selectedAnswerIndex: index })
  },

  showFeedback: () => {
    const { selectedAnswerIndex, questions, currentQuestionIndex, answers } = get()

    if (selectedAnswerIndex === null) return

    const currentQuestion = questions[currentQuestionIndex]
    const selectedAnswer = currentQuestion.allOptions[selectedAnswerIndex]
    const correctAnswer = currentQuestion.correctAnswer
    const isCorrect = selectedAnswer === correctAnswer

    const newAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: correctAnswer,
      isCorrect,
    }

    set({
      gameStatus: 'feedback',
      answers: [...answers, newAnswer],
      score: isCorrect ? get().score + 1 : get().score,
    })
  },

  nextQuestion: () => {
    const { currentQuestionIndex, totalQuestionsPerGame } = get()
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= totalQuestionsPerGame) {
      set({ gameStatus: 'finished' })
    } else {
      set({
        gameStatus: 'playing',
        currentQuestionIndex: nextIndex,
        selectedAnswerIndex: null,
      })
    }
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
    })
  },
}))
