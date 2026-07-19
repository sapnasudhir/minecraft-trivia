'use client'

import { useEffect, useState } from 'react'
import { PlayerScore } from '@/types/game'
import { fetchLeaderboard } from '@/utils/leaderboard'

interface LeaderboardScreenProps {
  onBack: () => void
}

const RANK_BADGE_COLORS: Record<number, string> = {
  1: '#facc15',
  2: '#d4d4d8',
  3: '#d97757',
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const datePart = date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
  const timePart = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${datePart} ${timePart}`
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [rows, setRows] = useState<PlayerScore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchLeaderboard()
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch((err) => {
        console.error('Failed to load leaderboard:', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className="flex flex-col items-center min-h-dvh overflow-x-hidden p-4 py-6"
      style={{
        background: 'repeating-linear-gradient(90deg, #b98a52, #b98a52 38px, #a97b45 38px, #a97b45 40px)',
      }}
    >
      <div
        className="w-full min-w-0"
        style={{
          maxWidth: '420px',
          background: '#f3e6c8',
          border: '3px solid #6b4a2b',
          padding: '24px 20px',
        }}
      >
        <h1
          className="text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '18px',
            color: '#3d2b1c',
            margin: '0 0 4px',
            textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          TOP 10
        </h1>
        <h2
          className="text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '12px',
            color: '#5a3d1e',
            margin: '0 0 20px',
          }}
        >
          LEADERBOARD
        </h2>

        {isLoading ? (
          <p
            className="text-center"
            style={{ color: '#5a3d1e', fontSize: '13px', padding: '16px 0' }}
          >
            Loading...
          </p>
        ) : rows.length === 0 ? (
          <p
            className="text-center"
            style={{ color: '#5a3d1e', fontSize: '13px', padding: '16px 0' }}
          >
            No scores yet — be the first!
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {rows.map((row, i) => (
              <div
                key={row.id}
                className="flex items-center"
                style={{
                  gap: '12px',
                  padding: '10px 12px',
                  background: i % 2 === 0 ? 'rgba(107,74,43,0.06)' : 'transparent',
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: RANK_BADGE_COLORS[i + 1] ?? '#f3e6c8',
                    border: '2px solid #6b4a2b',
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '11px',
                    color: '#3d2b1c',
                  }}
                >
                  {i + 1}
                </div>
                <div
                  className="flex-1 truncate"
                  style={{
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '11px',
                    color: '#3d2b1c',
                  }}
                >
                  {row.playerName}
                </div>
                <div className="flex flex-col items-end">
                  <div
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#5a3d1e',
                    }}
                  >
                    {row.score}
                  </div>
                  {row.createdAt && (
                    <div
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '9px',
                        color: 'rgba(61,43,28,0.55)',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatTimestamp(row.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full font-bold"
          style={{
            padding: '14px 24px',
            fontSize: '11px',
            marginTop: '20px',
            background: '#6b4a2b',
            color: '#f3e6c8',
            fontFamily: "'Press Start 2P', cursive",
            border: 'none',
            cursor: 'pointer',
          }}
        >
          BACK
        </button>
      </div>
    </div>
  )
}
