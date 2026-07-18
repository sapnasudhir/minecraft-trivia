'use client'

import Image from 'next/image'
import { FilledSlot } from '@/types/game'

interface CraftingGridProps {
  filledSlots: (FilledSlot | null)[]
  currentBlockImageUrl: string
  currentBlockGradient: string
  isShowingOutput: boolean
  isOutputCorrect?: boolean
}

export function CraftingGrid({
  filledSlots,
  currentBlockImageUrl,
  currentBlockGradient,
  isShowingOutput,
  isOutputCorrect,
}: CraftingGridProps) {
  // Map outer slots: skip center (index 4)
  const outerOrder = [0, 1, 2, 3, 5, 6, 7, 8]

  const renderGridCell = (gridIndex: number) => {
    // Center cell (index 4)
    if (gridIndex === 4) {
      return (
        <div
          key={gridIndex}
          className="relative w-11 h-11 rounded-none"
          style={{
            background: currentBlockGradient,
            border: '2px solid #b8860b',
            backgroundSize: '70%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {currentBlockImageUrl && (
            <Image
              src={currentBlockImageUrl}
              alt="Current block"
              fill
              className="object-cover object-center"
              style={{ opacity: 0.8 }}
            />
          )}
        </div>
      )
    }

    // Outer cells
    const slotNum = outerOrder.indexOf(gridIndex)
    const fill = filledSlots[slotNum]

    if (!fill) {
      return (
        <div
          key={gridIndex}
          className="w-11 h-11 rounded-none"
          style={{
            background: '#d8c8a0',
            boxShadow: 'inset 2px 2px 0 rgba(255,255,255,.5), inset -2px -2px 0 rgba(0,0,0,.15)',
          }}
        />
      )
    }

    if (fill.type === 'block' && fill.imageUrl) {
      return (
        <div
          key={gridIndex}
          className="relative w-11 h-11 rounded-none overflow-hidden"
          style={{
            border: '2px solid #4a7a2e',
          }}
        >
          <Image
            src={fill.imageUrl}
            alt="Block"
            fill
            className="object-cover"
          />
        </div>
      )
    }

    // Tool fill (diagonal sliver)
    if (fill.type === 'tool' && fill.toolColor) {
      return (
        <div
          key={gridIndex}
          className="w-11 h-11 rounded-none"
          style={{
            background: '#d8c8a0',
            border: '2px solid #4a7a2e',
            backgroundImage: `linear-gradient(135deg, transparent 42%, ${fill.toolColor} 42%, ${fill.toolColor} 58%, transparent 58%)`,
          }}
        />
      )
    }

    return (
      <div
        key={gridIndex}
        className="w-11 h-11 rounded-none"
        style={{
          background: '#d8c8a0',
          border: '2px solid #4a7a2e',
        }}
      />
    )
  }

  // Generate grid cells
  const gridCells = Array.from({ length: 9 }, (_, i) => renderGridCell(i))

  // Output slot styling
  const outputBg = isShowingOutput ? (isOutputCorrect ? '#dcf2cd' : '#f2d6d6') : '#d8c8a0'
  const outputBorder = isShowingOutput
    ? `2px solid ${isOutputCorrect ? '#4a7a2e' : '#a33'}`
    : '2px dashed #8a6a3f'

  return (
    <div className="flex items-center justify-center gap-4 mb-5">
      {/* 3x3 Grid */}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: 'repeat(3, 44px)',
          gridTemplateRows: 'repeat(3, 44px)',
        }}
      >
        {gridCells}
      </div>

      {/* Arrow */}
      <div
        className="pixel text-2xl"
        style={{
          color: '#6b4a2b',
          fontFamily: "'Press Start 2P', cursive",
        }}
      >
        →
      </div>

      {/* Output Slot */}
      <div
        className="w-12 h-12 rounded-none"
        style={{
          background: outputBg,
          border: outputBorder,
        }}
      >
        {isShowingOutput && isOutputCorrect && (
          <div className="w-full h-full flex items-center justify-center text-green-600 font-bold text-xl">
            ✓
          </div>
        )}
        {isShowingOutput && !isOutputCorrect && (
          <div className="w-full h-full flex items-center justify-center text-red-600 font-bold text-xl">
            ✗
          </div>
        )}
      </div>
    </div>
  )
}
