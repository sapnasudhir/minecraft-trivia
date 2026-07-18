# Minecraft Block Trivia

A Next.js web game that quizzes players on Minecraft block knowledge — 5 random multiple-choice questions per game, drawn from a corpus of blocks stored in Neon Postgres.

**Live**: https://minecraft-trivia.vercel.app

## Getting Started

Requires a Neon Postgres database (or any Postgres instance) with the schema in `src/db/schema.ts` migrated in, and a `DATABASE_URL` in `.env.local`.

```bash
npm install

# Apply migrations, seed the corpus, and precompute questions
node --env-file=.env.local node_modules/drizzle-kit/bin.cjs migrate
node --env-file=.env.local -r tsx/cjs scripts/seed.ts
node --env-file=.env.local -r tsx/cjs scripts/precompute_questions.ts

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## How it's built

- **Corpus**: Neon Postgres — `entities`, `trivia_hooks`, `question_bank` tables (see `src/db/schema.ts`)
- **Data pipeline**: Python ETL in the sibling `ArivMinecraftTrivia/pipeline/` folder — pulls mechanical properties from [PrismarineJS/minecraft-data](https://github.com/PrismarineJS/minecraft-data), generation fields (Y-level, rarity) from minecraft.wiki, and resolves images via the wiki's File: namespace
- **Questions**: precomputed offline (`scripts/precompute_questions.ts`) with distractors drawn only from same-type values, so every option is contextually consistent — served via `GET /api/questions`, nothing bundled into the client
- **Game UI**: Zustand for state, Tailwind for styling, Web Audio API for sound (no audio files)

See `CLAUDE.md` for a fuller developer guide and `prd.md` for the product/architecture spec.

## Deployment

Auto-deploys to Vercel on push to `master`. Environment variables (`DATABASE_URL` etc.) must be configured in the Vercel project's Environment Variables settings for each environment (Production/Preview/Development) you use.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon](https://neon.tech/)
