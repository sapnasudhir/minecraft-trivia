# Claude.md - Minecraft Block Trivia Development Guide

## Project Overview
This is a Next.js-based web game where players test their Minecraft block knowledge through randomized multiple-choice trivia questions. The corpus (currently 100 blocks, expandable) lives in Neon Postgres; questions are precomputed offline and served via an API route, not bundled into the client.

## Key Technologies
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (type-safe across all files)
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand (lightweight, no Redux complexity)
- **Database**: Neon Postgres + Drizzle ORM (`src/db/`)
- **Data pipeline**: Python ETL (`ArivMinecraftTrivia/pipeline/`) — pulls mechanical/special properties from PrismarineJS/minecraft-data, generation fields from wiki scraping, and resolves images via minecraft.wiki
- **UI Components**: Server-free React components (all 'use client' marked)
- **Audio**: Web Audio API (no external audio files)
- **Deployment**: Vercel (auto-deploys from master branch)

## Important Notes for Claude

### Branch Strategy
- **Production**: master branch is deployed to Vercel automatically
- **Development**: Use phase-a-db-scaling for feature work if needed
- Always ensure changes are on master before deploying

### Image Handling
- Hero/UI images (minecraft-hero.png, gameover-hero.png) go in /public
- Block textures are resolved per-block at pipeline time via minecraft.wiki's File: namespace (MediaWiki imageinfo API) — NOT a fixed URL pattern; many blocks (fences, gates, carpets) don't have a standalone texture and need this resolution rather than a guessed filename. See `ArivMinecraftTrivia/pipeline/texture_resolver.py`.
- Next.js Image component requires the image's hostname to be whitelisted in `next.config.ts` `images.remotePatterns` — currently `minecraft.wiki`
- Use `tools/generate_image_check.py` (in this repo) to regenerate a local HTML page that visually flags any broken image URL across the whole corpus

### Data Structure
- **Corpus**: Neon Postgres, 3 tables — `entities` (block/mob/structure + JSONB properties), `trivia_hooks` (question seeds, tagged with `answerType`), `question_bank` (precomputed ready-to-serve MC questions)
- **DB client/schema**: `src/db/index.ts`, `src/db/schema.ts` (Drizzle)
- **Types**: All TypeScript types in src/types/ (block.ts, game.ts)
- **API**: `app/api/questions/route.ts` — `GET /api/questions?count=5` returns random precomputed questions, one per unique block
- **Question generation**: `src/utils/questionGenerator.ts` — `generateGameQuestions()` fetches from the API (client-side, async); `generateDistractors()`/`generateExplanation()` are the reusable pieces called offline by `scripts/precompute_questions.ts`
- **Corpus JSON**: `src/data/minecraft_block_trivia_corpus_100.json` is the pipeline's output artifact, loaded only by `scripts/seed.ts` — never bundled into the client

### Code Organization
src/
├── app/              # Next.js App Router pages (app/api/questions/route.ts lives at repo root's app/, not src/app/)
├── components/Game/  # Game UI components (StartScreen, GameScreen, GameOverScreen, etc.)
├── data/             # Pipeline output JSON (consumed only by scripts/seed.ts)
├── db/               # Drizzle schema + DB client
├── store/            # Zustand game state store
├── types/            # TypeScript interfaces
└── utils/            # Utilities (sounds, question generation, shuffling)

scripts/              # One-time/re-runnable DB scripts: seed.ts, precompute_questions.ts
tools/                # Dev-only diagnostics (generate_image_check.py), not part of the app
ArivMinecraftTrivia/   # Sibling folder (not this repo) — Python ETL pipeline + raw data artifacts

### Design Consistency
- **StartScreen**: Blue gradient, pixel font title, hero image, green START GAME button, yellow features box
- **GameScreen**: Blue gradient, score board at top, question card with block image, answer options, feedback panel
- **GameOverScreen**: Purple gradient, hero image, score display, PLAY AGAIN button, yellow performance box

### Common Tasks

#### Adding/Updating Block Data
1. Re-run the Python pipeline (`ArivMinecraftTrivia/pipeline/merge.py`) to regenerate the corpus JSON, or hand-edit `src/data/minecraft_block_trivia_corpus_100.json` for small fixes
2. Copy the JSON into `src/data/` if regenerated elsewhere
3. Re-run `node --env-file=.env.local -r tsx/cjs scripts/seed.ts` (clears + reinserts `entities`/`trivia_hooks`)
4. Re-run `node --env-file=.env.local -r tsx/cjs scripts/precompute_questions.ts` (regenerates `question_bank` — required, since the API only ever reads from this table, not from `trivia_hooks` directly)
5. Regenerate `tools/image_check.html` and spot-check for broken images

#### Fixing Images Not Loading
- Check the block's `image_url` in the `entities` table — it should be a `minecraft.wiki/images/...` URL, not a guessed filename
- If broken, re-run `ArivMinecraftTrivia/pipeline/texture_resolver.py`'s resolution logic for that block (it queries the wiki's File: namespace directly)
- Confirm the image's hostname is whitelisted in `next.config.ts`'s `images.remotePatterns`

#### Deploying to Vercel
# Option 1: Automatic (push to master)
git push origin master

# Option 2: Manual redeploy
vercel deploy --prod

#### Testing Locally
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production (verifies no errors)
npm run lint         # TypeScript type checking

### State Management (Zustand Store)
The game state includes:
- gameStatus: 'idle' | 'loading' | 'playing' | 'feedback' | 'finished' | 'error' (`loading`/`error` exist because `startGame()` now awaits a network fetch to `/api/questions`)
- currentQuestionIndex: 0-4 (5 questions per game)
- questions: Generated question array
- selectedAnswerIndex: Player's choice
- score: Cumulative correct answers

Actions: startGame() [async], selectAnswer(), showFeedback(), nextQuestion(), endGame(), resetGame()

## Deployment Checklist
- [ ] All changes committed to master
- [ ] npm run build succeeds locally
- [ ] Image files in /public are committed to git
- [ ] Texture URLs follow BlockSprite_ format
- [ ] Run vercel deploy --prod or push to trigger auto-deploy
- [ ] Test on https://minecraft-trivia.vercel.app after deployment

## Known Limitations & Future Work
- Game is currently limited to 100 blocks (Release 2 target: 10,000 records across Blocks + Mobs + Structures)
- Non-boolean questions show 3 options, boolean (True/False) show 2 — distractors are guaranteed contextually consistent (same answerType as the correct answer) with a numeric-perturbation fallback for thin distractor pools (e.g. Y-level range currently has only 2 resolved blocks)
- No user authentication or score persistence
- No difficulty selection or category filter in the UI (data supports it — `difficulty`/`category` columns already exist on `question_bank`)
- Environment variable env-file quirk: `next dev`/`next build` auto-load `.env.local`, but standalone scripts (`drizzle-kit`, `scripts/*.ts`) need `node --env-file=.env.local ...` explicitly since they don't go through Next.js's own env loading
- See prd.md for technical roadmap
