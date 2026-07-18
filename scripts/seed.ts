/**
 * One-time seed script: loads the 100-block corpus JSON into the
 * entities + trivia_hooks tables. Run with:
 *   node --env-file=.env.local -r tsx/cjs scripts/seed.ts
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { eq } from 'drizzle-orm'
import { db } from '../src/db'
import { entities, triviaHooks } from '../src/db/schema'

interface CorpusBlock {
  id: string
  name: string
  category: string
  textureUrl: string
  properties: Record<string, unknown>
  trivia_hooks: Array<{
    category: string
    difficulty: string
    questionSeed: string
    answer: string
    answerType: string
  }>
  sourceVersion?: string
}

async function seed() {
  const corpusPath = join(process.cwd(), 'src/data/minecraft_block_trivia_corpus_100.json')
  const raw = JSON.parse(readFileSync(corpusPath, 'utf-8'))
  const blocks: CorpusBlock[] = raw.corpus.blocks

  console.log(`Seeding ${blocks.length} blocks...`)

  for (const block of blocks) {
    // Cascade-deletes any existing trivia_hooks for this entity too, so
    // re-running the seed doesn't accumulate duplicate hooks.
    await db.delete(entities).where(eq(entities.id, block.id))

    await db.insert(entities).values({
      id: block.id,
      type: 'block',
      name: block.name,
      category: block.category,
      imageUrl: block.textureUrl,
      properties: block.properties,
      sourceVersion: block.sourceVersion ?? null,
    })

    for (const hook of block.trivia_hooks) {
      await db.insert(triviaHooks).values({
        entityId: block.id,
        category: hook.category,
        difficulty: hook.difficulty,
        questionSeed: hook.questionSeed,
        answer: hook.answer,
        answerType: hook.answerType,
      })
    }
  }

  console.log('Seed complete.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
