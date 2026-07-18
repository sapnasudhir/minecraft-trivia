export interface GameQuestion {
  id: string
  blockId: string
  blockName: string
  question: string
  correctAnswer: string
  allOptions: string[]
  correctAnswerIndex: number
  imageUrl: string
  category: 'mechanical' | 'generation' | 'crafting' | 'special' | 'variants'
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
}

export interface PlayerAnswer {
  questionId: string
  selected: string
  correct: string
  isCorrect: boolean
}

export interface GameState {
  gameStatus: 'idle' | 'loading' | 'playing' | 'feedback' | 'finished' | 'error'
  currentQuestionIndex: number
  questions: GameQuestion[]
  selectedAnswerIndex: number | null
  score: number
  answers: PlayerAnswer[]
  totalQuestionsPerGame: number

  // Actions
  startGame: () => Promise<void>
  selectAnswer: (index: number) => void
  showFeedback: () => void
  nextQuestion: () => void
  endGame: () => void
  resetGame: () => void
  setQuestions: (questions: GameQuestion[]) => void
}
