import { PlayerScore } from '@/types/game'

export interface SubmitScoreResult {
  rows: PlayerScore[]
  rank: number | null // 1-indexed position in the top 10, or null if it didn't make the cut
}

export async function fetchLeaderboard(): Promise<PlayerScore[]> {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) {
    throw new Error(`Failed to load leaderboard: ${res.status}`)
  }
  return res.json()
}

export async function submitScore(playerName: string, score: number): Promise<SubmitScoreResult> {
  const res = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, score }),
  })
  if (!res.ok) {
    throw new Error(`Failed to submit score: ${res.status}`)
  }
  return res.json()
}
