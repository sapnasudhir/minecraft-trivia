import { NextRequest, NextResponse } from 'next/server'
import { desc, notInArray } from 'drizzle-orm'
import { db } from '@/db'
import { leaderboard } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await db
    .select()
    .from(leaderboard)
    .orderBy(desc(leaderboard.score))
    .limit(10)

  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : ''
  const score = typeof body.score === 'number' ? body.score : NaN

  if (!playerName || playerName.length > 50 || !Number.isFinite(score)) {
    return NextResponse.json({ error: 'Invalid playerName or score' }, { status: 400 })
  }

  const [inserted] = await db
    .insert(leaderboard)
    .values({ playerName, score })
    .returning({ id: leaderboard.id })

  // Prune the table back down to the top 10 by score.
  const top10 = await db
    .select({ id: leaderboard.id })
    .from(leaderboard)
    .orderBy(desc(leaderboard.score))
    .limit(10)

  if (top10.length === 10) {
    await db.delete(leaderboard).where(
      notInArray(
        leaderboard.id,
        top10.map((row) => row.id)
      )
    )
  }

  const rows = await db
    .select()
    .from(leaderboard)
    .orderBy(desc(leaderboard.score))
    .limit(10)

  const rankIndex = rows.findIndex((row) => row.id === inserted.id)
  const rank = rankIndex === -1 ? null : rankIndex + 1

  return NextResponse.json({ rows, rank })
}
