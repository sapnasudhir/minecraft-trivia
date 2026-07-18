'use client'

interface ScoreBoardProps {
  score: number
  totalQuestions: number
}

export function ScoreBoard({ score, totalQuestions }: ScoreBoardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-4 mb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Current Score</p>
          <p className="text-3xl font-bold score-update">
            {score} <span className="text-lg opacity-90">/ {totalQuestions}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">
            {Math.round((score / totalQuestions) * 100)}%
          </p>
          <p className="text-sm opacity-90">Accuracy</p>
        </div>
      </div>
    </div>
  )
}
