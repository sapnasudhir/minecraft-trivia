'use client'

import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'

export function StartScreen() {
  const startGame = useGameStore((state) => state.startGame)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 p-4">
      <div className="text-center max-w-md animate-slide-up">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 pixel-font animate-bounce-sm">
          MINECRAFT
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-6 pixel-font animate-fade-in">
          BLOCK TRIVIA
        </h2>

        <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg overflow-hidden mb-8 animate-fade-in">
          <div className="relative w-full aspect-video">
            <Image
              src="/minecraft-hero.png"
              alt="Minecraft Hero"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-6">
            <p className="text-white text-lg mb-4">
              Test your Minecraft knowledge!
            </p>
            <ul className="text-white text-left space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>5 questions per game</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Multiple choice answers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Test your block knowledge</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-lg pixel-font"
        >
          START GAME
        </button>
      </div>
    </div>
  )
}
