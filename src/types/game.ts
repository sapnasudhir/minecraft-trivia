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
  pointsEarned: number
}

export interface FilledSlot {
  type: 'block' | 'tool'
  imageUrl?: string // block texture PNG URL
  grad?: string // block gradient fallback
  toolColor?: string // tool tier color
}

export interface GameState {
  gameStatus: 'idle' | 'loading' | 'playing' | 'feedback' | 'finished' | 'error'
  currentQuestionIndex: number
  questions: GameQuestion[]
  selectedAnswerIndex: number | null
  score: number
  answers: PlayerAnswer[]
  totalQuestionsPerGame: number
  filledSlots: (FilledSlot | null)[] // 8-element array for crafting grid
  consecutiveCount: number // track correct/incorrect streak
  lastResultWasCorrect?: boolean // track if previous answer was correct

  // Actions
  startGame: () => Promise<void>
  selectAnswer: (index: number) => void
  showFeedback: () => void
  nextQuestion: () => void
  endGame: () => void
  resetGame: () => void
  setQuestions: (questions: GameQuestion[]) => void
}
