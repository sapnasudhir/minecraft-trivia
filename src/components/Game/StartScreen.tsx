'use client'

import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'

export function StartScreen() {
  const startGame = useGameStore((state) => state.startGame)

  const handleStartClick = () => {
    console.log('START GAME clicked')
    startGame()
  }

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
          className="w-full text-white font-bold py-4 px-6 transition duration-200 text-lg mb-6"
          style={{
            background: '#6b4a2b',
            fontFamily: "'Press Start 2P', cursive",
            border: 'none',
            cursor: 'pointer',
          }}
        >
          START GAME
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
