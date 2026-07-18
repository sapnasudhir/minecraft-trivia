/**
 * One-time batch script: for every trivia_hook in the DB, precomputes a
 * full 5-option multiple-choice question (reusing the existing
 * generateIncorrectAnswers/generateExplanation logic) and writes it to
 * question_bank. Run after seed.ts, and again after any corpus re-ingest.
 *
 *   node --env-file=.env.local -r tsx/cjs scripts/precompute_questions.ts
 */
import { db } from '../src/db'
import { entities, triviaHooks, questionBank } from '../src/db/schema'
import { generateIncorrectAnswers, generateExplanation } from '../src/utils/questionGenerator'
import { shuffleArray } from '../src/utils/answerShuffler'
import { MinecraftBlock, TriviaHook } from '../src/types/block'

async function main() {
  console.log('Loading entities and trivia hooks...')
  const allEntities = await db.select().from(entities)
  const allHooks = await db.select().from(triviaHooks)

  const blocks: MinecraftBlock[] = allEntities.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    textureUrl: e.imageUrl ?? '',
    properties: e.properties as MinecraftBlock['properties'],
    trivia_hooks: [] as TriviaHook[],
  }))

  console.log(`Clearing existing question_bank rows...`)
  await db.delete(questionBank)

  console.log(`Generating questions for ${allHooks.length} trivia hooks...`)
  let count = 0
  for (const hook of allHooks) {
    const block = blocks.find((b) => b.id === hook.entityId)
    if (!block) continue

    const correctAnswer = hook.answer
    const incorrectAnswers = generateIncorrectAnswers(
      blocks,
      block.id,
      hook.category,
      correctAnswer,
      4
    )
    const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers])
    const correctIndex = allOptions.indexOf(correctAnswer)

    const explanation = generateExplanation(block, {
      category: hook.category as TriviaHook['category'],
      difficulty: hook.difficulty as TriviaHook['difficulty'],
      questionSeed: hook.questionSeed,
      answer: hook.answer,
    })

    await db.insert(questionBank).values({
      entityId: block.id,
      entityType: 'block',
      category: hook.category,
      difficulty: hook.difficulty,
      questionText: hook.questionSeed,
      correctAnswer,
      options: allOptions,
      correctIndex,
      explanation,
    })

    count++
    if (count % 50 === 0) console.log(`  ${count}/${allHooks.length}...`)
  }

  console.log(`Done. Precomputed ${count} questions.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
