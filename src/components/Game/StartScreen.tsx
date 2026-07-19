'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { fetchLeaderboard } from '@/utils/leaderboard'

interface StartScreenProps {
  onShowLeaderboard: () => void
}

export function StartScreen({ onShowLeaderboard }: StartScreenProps) {
  const startGame = useGameStore((state) => state.startGame)
  const playerName = useGameStore((state) => state.playerName)
  const setPlayerName = useGameStore((state) => state.setPlayerName)

  const [knownNames, setKnownNames] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
      .then((rows) => {
        setKnownNames([...new Set(rows.map((r) => r.playerName))])
      })
      .catch((err) => {
        console.error('Failed to load player names:', err)
      })
  }, [])

  const canStart = playerName.trim() !== ''

  const handleStartClick = () => {
    if (!canStart) return
    startGame()
  }

  const query = playerName.trim().toLowerCase()
  const filteredNames = (query
    ? knownNames.filter((n) => n.toLowerCase().includes(query))
    : knownNames
  ).slice(0, 6)

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 py-8"
      style={{
        background: 'repeating-linear-gradient(90deg, #b98a52, #b98a52 38px, #a97b45 38px, #a97b45 40px)',
      }}
    >
      <div className="text-center max-w-md animate-slide-up">
        <h1
          className="text-5xl md:text-6xl font-bold text-white mb-2 animate-bounce-sm"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          }}
        >
          MINECRAFT
        </h1>
        <h2
          className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            color: '#facc15',
            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
          }}
        >
          BLOCK TRIVIA
        </h2>

        <div className="text-left mb-4" style={{ position: 'relative' }}>
          <label
            className="block mb-2"
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '10px',
              color: 'white',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
            }}
          >
            PLAYER NAME
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 150)
            }}
            placeholder="Enter your name..."
            className="w-full box-border"
            style={{
              padding: '12px',
              fontSize: '14px',
              fontFamily: 'sans-serif',
              background: '#f3e6c8',
              border: '3px solid #6b4a2b',
              color: '#3d2b1c',
              outline: 'none',
            }}
          />
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#f3e6c8',
                border: '3px solid #6b4a2b',
                borderTop: 'none',
                zIndex: 10,
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {filteredNames.map((name) => (
                <div
                  key={name}
                  onMouseDown={() => {
                    setPlayerName(name)
                    setShowDropdown(false)
                  }}
                  className="cursor-pointer"
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#3d2b1c',
                    borderBottom: '1px solid rgba(107,74,43,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#facc15'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {name}
                </div>
              ))}
              {filteredNames.length === 0 && (
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#7a5a35',
                    fontStyle: 'italic',
                  }}
                >
                  New player — press Start to join the board
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative w-full max-w-md aspect-video mb-8 animate-fade-in rounded-none">
          <Image
            src="/minecraft-hero.png"
            alt="Minecraft Hero"
            fill
            className="object-cover"
            priority
          />
        </div>

        <button
          onClick={handleStartClick}
          disabled={!canStart}
          className="w-full text-white font-bold py-4 px-6 transition duration-200 text-lg mb-6"
          style={{
            background: '#6b4a2b',
            fontFamily: "'Press Start 2P', cursive",
            border: 'none',
            cursor: canStart ? 'pointer' : 'not-allowed',
            opacity: canStart ? 1 : 0.5,
          }}
        >
          START GAME
        </button>

        <button
          onClick={onShowLeaderboard}
          className="w-full font-bold"
          style={{
            padding: '12px 24px',
            fontSize: '11px',
            marginBottom: '20px',
            background: 'transparent',
            color: '#facc15',
            fontFamily: "'Press Start 2P', cursive",
            border: '2px solid #facc15',
            cursor: 'pointer',
          }}
        >
          🏆 TOP 10 LEADERBOARD
        </button>

        <div
          className="p-6 animate-fade-in rounded-none"
          style={{
            background: '#facc15',
            border: '3px solid #6b4a2b',
          }}
        >
          <h3
            className="font-bold mb-4 text-center"
            style={{
              color: '#3d2b1c',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '12px',
            }}
          >
            FILL THE CRAFTING TABLE TO WIN!
          </h3>
          <ul
            className="text-left space-y-2"
            style={{
              color: '#3d2b1c',
              fontSize: '12px',
            }}
          >
            <li className="flex items-start">
              <span className="mr-3 font-bold">✓</span>
              <span className="font-semibold">Answer trivia to fill grid slots</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold">✓</span>
              <span className="font-semibold">Earn points for correct answers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold">✓</span>
              <span className="font-semibold">Complete the table to finish!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
