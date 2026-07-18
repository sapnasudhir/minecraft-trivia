import { GameQuestion } from '@/types/game'
import { AnswerType, MinecraftBlock, TriviaHook } from '@/types/block'
import { getRandomElements } from './answerShuffler'

/**
 * Fetches a set of ready-to-serve questions from the DB-backed API. Distractor
 * generation happens offline (see scripts/precompute_questions.ts, which
 * reuses generateDistractors/generateExplanation below) -- this function
 * just samples the precomputed question_bank, it doesn't generate anything.
 */
export async function generateGameQuestions(count: number = 5): Promise<GameQuestion[]> {
  const res = await fetch(`/api/questions?count=${count}`)
  if (!res.ok) {
    throw new Error(`Failed to load questions: ${res.status}`)
  }
  return res.json()
}

export interface HookAnswer {
  entityId: string
  answer: string
}

/**
 * Generates distractors for a hook, drawing only from other blocks' hooks of
 * the SAME answerType -- this is what guarantees a distractor is always the
 * same kind of value as the correct answer (numbers with numbers, tool names
 * with tool names), rather than a category-wide grab-bag of unrelated values.
 *
 * `sameTypeAnswers` must already be filtered to hooks sharing `answerType`
 * with the hook being asked about (see scripts/precompute_questions.ts, which
 * groups the full hook set by answerType once up front).
 */
export function generateDistractors(
  currentEntityId: string,
  correctAnswer: string,
  answerType: AnswerType,
  sameTypeAnswers: HookAnswer[],
  count: number
): string[] {
  // Boolean questions get exactly one distractor: the opposite value. There's
  // no "same type pool" concept here -- only two possible values exist.
  if (answerType === 'boolean') {
    return [correctAnswer === 'True' ? 'False' : 'True']
  }

  const candidates = Array.from(
    new Set(
      sameTypeAnswers
        .filter((h) => h.entityId !== currentEntityId)
        .map((h) => h.answer)
        .filter((ans) => ans !== correctAnswer)
    )
  )

  if (candidates.length >= count) {
    return getRandomElements(candidates, count)
  }

  // Thin-pool fallback: some answer types (e.g. yLevelRange, with only a
  // couple of blocks resolved in the current corpus) don't have enough other
  // real blocks to draw from. Rather than fall back to unrelated values or
  // duplicate options, synthesize additional format-matched distractors by
  // perturbing the correct answer -- still the same "kind" of value, just
  // not tied to a specific other block.
  const synthesized = synthesizeDistractors(
    correctAnswer,
    answerType,
    count - candidates.length,
    new Set([correctAnswer, ...candidates])
  )
  return [...candidates, ...synthesized]
}

function synthesizeDistractors(
  correctAnswer: string,
  answerType: AnswerType,
  count: number,
  used: Set<string>
): string[] {
  const results: string[] = []

  if (answerType === 'blastResistance' || answerType === 'lightLevel') {
    const match = correctAnswer.match(/(-?\d+(?:\.\d+)?)/)
    if (!match || match.index === undefined) return results
    const base = parseFloat(match[1])
    const prefix = correctAnswer.slice(0, match.index)
    const suffix = correctAnswer.slice(match.index + match[1].length)

    let attempts = 0
    while (results.length < count && attempts < 20) {
      attempts++
      const magnitude = Math.max(Math.abs(base), 1) * (0.2 + Math.random() * 0.4)
      const offset = Math.random() < 0.5 ? -magnitude : magnitude
      const candidateValue = Math.max(0, Math.round((base + offset) * 10) / 10)
      const candidate = `${prefix}${candidateValue}${suffix}`
      if (!used.has(candidate)) {
        used.add(candidate)
        results.push(candidate)
      }
    }
  } else if (answerType === 'yLevelRange') {
    const match = correctAnswer.match(/Y:\s*(-?\d+)\s*to\s*(-?\d+)/)
    if (!match) return results
    const a = parseInt(match[1], 10)
    const b = parseInt(match[2], 10)

    let attempts = 0
    while (results.length < count && attempts < 20) {
      attempts++
      const shift = Math.round(10 + Math.random() * 40) * (Math.random() < 0.5 ? -1 : 1)
      const candidate = `Y: ${a + shift} to ${b + shift}`
      if (!used.has(candidate)) {
        used.add(candidate)
        results.push(candidate)
      }
    }
  } else if (answerType === 'toolTier') {
    const KNOWN_TOOLS = [
      'Wooden Pickaxe',
      'Stone Pickaxe',
      'Iron Pickaxe',
      'Diamond Pickaxe',
      'Netherite Pickaxe',
      'Copper Pickaxe',
      'None',
    ]
    for (const tool of KNOWN_TOOLS) {
      if (results.length >= count) break
      if (!used.has(tool)) {
        used.add(tool)
        results.push(tool)
      }
    }
  }

  return results
}

export function generateExplanation(
  block: MinecraftBlock,
  hook: TriviaHook
): string {
  const { category } = hook
  const { properties } = block

  let explanation = `${block.name} - `

  switch (category) {
    case 'mechanical':
      explanation += `Tool Required: ${properties.mechanical.toolRequired}, Hardness: ${properties.mechanical.hardness}`
      break
    case 'generation':
      if (properties.generation.peakYLevel !== null) {
        explanation += `Generates at Y: ${properties.generation.peakYLevel}, Rarity: ${properties.generation.rarity}`
      } else {
        explanation += `Rarity: ${properties.generation.rarity}`
      }
      break
    case 'crafting':
      if (properties.crafting.recipes.length > 0) {
        explanation += `Output: ${properties.crafting.recipes[0].output}`
      }
      break
    case 'special':
      if (properties.special.luminous) {
        explanation += `Light Level: ${properties.special.lightLevel}`
      } else {
        explanation += `Luminous: No`
      }
      break
    default:
      explanation += 'Properties vary'
  }

  return explanation
}
