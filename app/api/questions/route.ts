import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { GameQuestion } from '@/types/game'

export const dynamic = 'force-dynamic'

interface QuestionRow extends Record<string, unknown> {
  id: number
  entity_id: string
  category: string
  difficulty: string
  question_text: string
  correct_answer: string
  options: string[]
  correct_index: number
  explanation: string | null
  entity_name: string
  image_url: string | null
}

export async function GET(request: NextRequest) {
  const countParam = request.nextUrl.searchParams.get('count')
  const count = Math.min(Math.max(parseInt(countParam ?? '5', 10) || 5, 1), 25)

  // One random question per entity, then sample `count` of those, so a
  // single game never asks two questions about the same block.
  const result = await db.execute<QuestionRow>(sql`
    SELECT * FROM (
      SELECT DISTINCT ON (qb.entity_id)
        qb.id, qb.entity_id, qb.category, qb.difficulty,
        qb.question_text, qb.correct_answer, qb.options,
        qb.correct_index, qb.explanation,
        e.name AS entity_name, e.image_url
      FROM question_bank qb
      JOIN entities e ON e.id = qb.entity_id
      ORDER BY qb.entity_id, RANDOM()
    ) sub
    ORDER BY RANDOM()
    LIMIT ${count}
  `)

  const questions: GameQuestion[] = result.rows.map((row) => ({
    id: `${row.entity_id}_${row.category}_${row.id}`,
    blockId: row.entity_id,
    blockName: row.entity_name,
    question: row.question_text,
    correctAnswer: row.correct_answer,
    allOptions: row.options,
    correctAnswerIndex: row.correct_index,
    imageUrl: row.image_url ?? '',
    category: row.category as GameQuestion['category'],
    difficulty: row.difficulty as GameQuestion['difficulty'],
    explanation: row.explanation ?? undefined,
  }))

  return NextResponse.json(questions)
}
