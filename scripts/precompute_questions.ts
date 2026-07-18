/**
 * One-time batch script: for every trivia_hook in the DB, precomputes a
 * ready-to-serve multiple-choice question (reusing generateDistractors/
 * generateExplanation from questionGenerator.ts) and writes it to
 * question_bank. Run after seed.ts, and again after any corpus re-ingest.
 *
 * Distractors are drawn only from other blocks' hooks sharing the exact same
 * answerType, so every option is contextually consistent with the correct
 * answer (numbers with numbers, tool names with tool names, etc.). Boolean
 * questions get 2 total options; everything else gets 3.
 *
 *   node --env-file=.env.local -r tsx/cjs scripts/precompute_questions.ts
 */
import { db } from '../src/db'
import { entities, triviaHooks, questionBank } from '../src/db/schema'
import { generateDistractors, generateExplanation, HookAnswer } from '../src/utils/questionGenerator'
import { shuffleArray } from '../src/utils/answerShuffler'
import { AnswerType, MinecraftBlock, TriviaHook } from '../src/types/block'

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
  const blockById = new Map(blocks.map((b) => [b.id, b]))

  // Group all hooks by answerType up front, so distractor sampling for any
  // given hook only ever draws from other blocks' hooks of the same type.
  const hooksByAnswerType = new Map<AnswerType, HookAnswer[]>()
  for (const hook of allHooks) {
    const answerType = hook.answerType as AnswerType
    const list = hooksByAnswerType.get(answerType) ?? []
    list.push({ entityId: hook.entityId, answer: hook.answer })
    hooksByAnswerType.set(answerType, list)
  }

  console.log(`Clearing existing question_bank rows...`)
  await db.delete(questionBank)

  console.log(`Generating questions for ${allHooks.length} trivia hooks...`)
  let count = 0
  let skipped = 0
  for (const hook of allHooks) {
    const block = blockById.get(hook.entityId)
    if (!block) continue

    const answerType = hook.answerType as AnswerType
    const correctAnswer = hook.answer
    const sameTypeAnswers = hooksByAnswerType.get(answerType) ?? []
    const distractorCount = answerType === 'boolean' ? 1 : 2

    const incorrectAnswers = generateDistractors(
      block.id,
      correctAnswer,
      answerType,
      sameTypeAnswers,
      distractorCount
    )

    if (incorrectAnswers.length < distractorCount) {
      // Couldn't find enough contextually-consistent distractors (and
      // synthesis didn't cover the gap either) -- skip rather than ship a
      // question with duplicate or degenerate options.
      skipped++
      continue
    }

    const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers])
    const correctIndex = allOptions.indexOf(correctAnswer)

    const explanation = generateExplanation(block, {
      category: hook.category as TriviaHook['category'],
      difficulty: hook.difficulty as TriviaHook['difficulty'],
      questionSeed: hook.questionSeed,
      answer: hook.answer,
      answerType,
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

  console.log(`Done. Precomputed ${count} questions (${skipped} skipped -- insufficient distractor pool).`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
