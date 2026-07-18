import { GameQuestion } from '@/types/game'
import { MinecraftBlock, TriviaHook } from '@/types/block'
import { getCorpusBlocks } from '@/data/loaders'
import { shuffleArray, getRandomElements, getRandomElement } from './answerShuffler'

interface BlockWithHook {
  block: MinecraftBlock
  hook: TriviaHook
}

export function generateGameQuestions(count: number = 5): GameQuestion[] {
  const blocks = getCorpusBlocks()
  const selectedBlocksWithHooks = selectRandomBlocksWithHooks(blocks, count)

  return selectedBlocksWithHooks.map((item, index) => {
    const { block, hook } = item
    const correctAnswer = hook.answer

    const incorrectAnswers = generateIncorrectAnswers(
      blocks,
      block.id,
      hook.category,
      correctAnswer,
      4
    )

    const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers])
    const correctAnswerIndex = allOptions.indexOf(correctAnswer)

    const explanation = generateExplanation(block, hook)

    return {
      id: `${block.id}_${hook.category}_${index}`,
      blockId: block.id,
      blockName: block.name,
      question: hook.questionSeed,
      correctAnswer,
      allOptions,
      correctAnswerIndex,
      imageUrl: block.textureUrl,
      category: hook.category,
      difficulty: hook.difficulty,
      explanation,
    }
  })
}

function selectRandomBlocksWithHooks(
  blocks: MinecraftBlock[],
  count: number
): BlockWithHook[] {
  const result: BlockWithHook[] = []
  const usedBlockIds = new Set<string>()

  while (result.length < count && usedBlockIds.size < blocks.length) {
    const randomBlock = getRandomElement(blocks)

    if (!usedBlockIds.has(randomBlock.id)) {
      usedBlockIds.add(randomBlock.id)
      const randomHook = getRandomElement(randomBlock.trivia_hooks)
      result.push({ block: randomBlock, hook: randomHook })
    }
  }

  // If we couldn't get enough unique blocks, allow duplicate blocks with different hooks
  while (result.length < count) {
    const randomBlock = getRandomElement(blocks)
    const unusedHooks = randomBlock.trivia_hooks.filter(
      (hook) =>
        !result.some(
          (item) =>
            item.block.id === randomBlock.id && item.hook === hook
        )
    )

    if (unusedHooks.length > 0) {
      const hook = getRandomElement(unusedHooks)
      result.push({ block: randomBlock, hook })
    } else {
      // Fallback: allow same hook
      const hook = getRandomElement(randomBlock.trivia_hooks)
      result.push({ block: randomBlock, hook })
    }
  }

  return result
}

export function generateIncorrectAnswers(
  allBlocks: MinecraftBlock[],
  currentBlockId: string,
  questionCategory: string,
  correctAnswer: string,
  count: number
): string[] {
  const otherBlocks = allBlocks.filter((b) => b.id !== currentBlockId)

  if (otherBlocks.length === 0) {
    return generatePlaceholderAnswers(correctAnswer, count)
  }

  const candidates: string[] = []

  // Strategy 1: Extract property values from other blocks
  candidates.push(...extractPropertyValues(otherBlocks, questionCategory))

  // Strategy 2: Extract tool names and tier names
  candidates.push(...extractToolValues(otherBlocks))

  // Strategy 3: Extract Y-level values
  candidates.push(...extractYLevelValues(otherBlocks))

  // Strategy 4: Extract block names
  candidates.push(...otherBlocks.map((b) => b.name))

  // Filter and deduplicate
  const filteredCandidates = Array.from(new Set(candidates))
    .filter((ans) => ans !== correctAnswer && ans.length > 0)
    .filter((ans) => !isTooSimilar(ans, correctAnswer))

  if (filteredCandidates.length < count) {
    filteredCandidates.push(...generatePlaceholderAnswers(correctAnswer, count))
  }

  return getRandomElements(filteredCandidates, count)
}

function extractPropertyValues(
  blocks: MinecraftBlock[],
  category: string
): string[] {
  const values: string[] = []

  blocks.forEach((block) => {
    const { properties } = block

    if (category === 'mechanical') {
      values.push(properties.mechanical.toolRequired)
      values.push(properties.mechanical.minToolTier)
      values.push(properties.mechanical.maxStackSize.toString())
      values.push(`Hardness: ${properties.mechanical.hardness}`)
    }

    if (category === 'generation') {
      if (properties.generation.peakYLevel !== null) {
        values.push(`Y: ${properties.generation.peakYLevel}`)
      }
      if (properties.generation.yLevelMin !== null && properties.generation.yLevelMax !== null) {
        values.push(`Y: ${properties.generation.yLevelMin} to ${properties.generation.yLevelMax}`)
      }
      values.push(properties.generation.rarity)
      values.push(properties.generation.spawnRate)
      values.push(...properties.generation.biomes)
    }

    if (category === 'crafting') {
      properties.crafting.recipes.forEach((recipe) => {
        values.push(recipe.output)
        if (typeof recipe.experience === 'string') {
          values.push(recipe.experience)
        }
      })
      if (properties.crafting.fortuneMaxDrop) {
        values.push(`${properties.crafting.fortuneMaxDrop} items`)
        values.push(
          `Fortune ${properties.crafting.fortuneLevelForMax || 3}`
        )
      }
    }

    if (category === 'special') {
      if (properties.special.luminous && properties.special.lightLevel) {
        values.push(`Light level ${properties.special.lightLevel}`)
      }
    }
  })

  return values.filter((v) => v.length > 0)
}

function extractToolValues(blocks: MinecraftBlock[]): string[] {
  const tools = new Set<string>()
  blocks.forEach((block) => {
    tools.add(block.properties.mechanical.toolRequired)
    tools.add(block.properties.mechanical.minToolTier)
  })
  return Array.from(tools)
}

function extractYLevelValues(blocks: MinecraftBlock[]): string[] {
  const yLevels: string[] = []
  blocks.forEach((block) => {
    if (block.properties.generation.peakYLevel !== null) {
      yLevels.push(`Y: ${block.properties.generation.peakYLevel}`)
    }
  })
  return yLevels
}

function generatePlaceholderAnswers(
  correctAnswer: string,
  count: number
): string[] {
  const answers: string[] = []
  const numbers = [1, 2, 3, 4, 5, 10, 15, 20, 50, 100]

  for (let i = 0; i < count; i++) {
    answers.push(`Option ${i + 1}`)
  }

  return answers
}

function isTooSimilar(str1: string, str2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim()
  const s1 = normalize(str1)
  const s2 = normalize(str2)

  if (s1 === s2) return true

  // Check if one is a substring of the other (loose matching)
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.abs(s1.length - s2.length) < 5
  }

  return false
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
