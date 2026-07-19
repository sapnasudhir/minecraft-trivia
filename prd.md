# prd.md - Minecraft Block Trivia Technical Product Requirements

## Executive Summary
Minecraft Block Trivia is a web-based React/Next.js game that delivers randomized Minecraft block knowledge quizzes to players. The corpus (100 blocks, DB-backed) lives in Neon Postgres; questions are precomputed offline and served via an API route. Non-boolean questions show 3 options, True/False questions show 2 — distractors are guaranteed contextually consistent with the correct answer's type.

**Live**: https://minecraft-trivia.vercel.app
**Repository**: https://github.com/sapnasudhir/minecraft-trivia

**Status**: The "Phase 2: Scaling" architecture originally described later in this doc as a future plan has been implemented (Postgres + Drizzle, server-side question generation, `/api/questions`). See "Completed" under Future Roadmap for what shipped and what's still ahead.

## Architecture Overview

### Technology Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG, optimized builds, Vercel integration |
| **Language** | TypeScript | Type safety, better IDE support, fewer runtime errors |
| **Styling** | Tailwind CSS | Rapid iteration, mobile-first, consistent design system |
| **State** | Zustand | Lightweight (8KB), no boilerplate vs Redux, perfect for single-game state |
| **Audio** | Web Audio API | No external files needed, low latency, built into browser |
| **Images** | Next.js Image + WebP | Auto-optimization, lazy loading, responsive srcset |
| **Deployment** | Vercel | Free tier, auto-scaling, GitHub integration, edge caching |
| **Database** | Neon Postgres + Drizzle ORM | Serverless, scales to zero, JSONB for flexible per-entity-type properties |
| **Data pipeline** | Python (requests, wikitextparser) | ETL: PrismarineJS/minecraft-data for mechanical properties, wiki scraping for generation fields, wiki File: namespace for images |

### Project Structure
`
minecraft-trivia/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Entry point (renders GameContainer)
│   ├── globals.css             # Global styles + animations
│   └── api/questions/route.ts  # GET /api/questions?count=5 -- serves precomputed questions
│
├── src/
│   ├── components/Game/
│   │   ├── GameContainer.tsx   # Routes between screens based on game status (incl. loading/error)
│   │   ├── StartScreen.tsx     # Landing: title, hero image, features, START button
│   │   ├── GameScreen.tsx      # Main game loop: question, answers, score
│   │   ├── QuestionCard.tsx    # Question display with block image
│   │   ├── AnswerOptions.tsx   # 3 (or 2 for True/False) clickable answer buttons
│   │   ├── FeedbackPanel.tsx   # Correct/incorrect feedback + explanation
│   │   ├── ScoreBoard.tsx      # Live score + accuracy display
│   │   └── GameOverScreen.tsx  # Final score, performance message, play again
│   │
│   ├── data/
│   │   └── minecraft_block_trivia_corpus_100.json  # Pipeline output; read only by scripts/seed.ts
│   │
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema: entities, trivia_hooks, question_bank
│   │   └── index.ts            # Neon serverless DB client
│   │
│   ├── store/
│   │   └── gameStore.ts        # Zustand store (game state + actions; startGame() is async)
│   │
│   ├── types/
│   │   ├── block.ts            # Block, TriviaHook (incl. answerType), Properties interfaces
│   │   └── game.ts             # GameQuestion, GameState (incl. loading/error), PlayerAnswer
│   │
│   └── utils/
│       ├── questionGenerator.ts # generateGameQuestions() fetches from API; generateDistractors()/generateExplanation() are the offline-reusable pieces
│       ├── answerShuffler.ts   # Fisher-Yates shuffle algorithm
│       └── sounds.ts           # Web Audio API sound synthesis
│
├── scripts/
│   ├── seed.ts                  # Loads corpus JSON into entities/trivia_hooks
│   └── precompute_questions.ts  # Generates all question_bank rows offline (same-answerType distractors)
│
├── tools/
│   ├── generate_image_check.py  # Regenerates image_check.html from the current corpus
│   └── image_check.html         # Dev-only diagnostic page -- not part of the app
│
├── drizzle/                    # Generated SQL migrations + snapshots
│
├── public/
│   ├── minecraft-hero.png      # StartScreen hero image
│   └── gameover-hero.png       # GameOverScreen hero image
│
├── next.config.ts             # Image domain config (minecraft.wiki)
├── drizzle.config.ts          # Drizzle Kit config (points at DATABASE_URL)
├── tailwind.config.ts         # Tailwind customization (animations, fonts)
├── tsconfig.json              # TypeScript path aliases (@/...)
└── package.json               # Dependencies: Next.js, React, Tailwind, Zustand, Drizzle, Neon
`

**Sibling folder (separate from this repo, not committed here)**: `ArivMinecraftTrivia/pipeline/` — the Python ETL pipeline (`fetch_minecraft_data.py`, `wiki_scraper.py`, `texture_resolver.py`, `merge.py`, `select_blocks.py`) that produces the corpus JSON consumed by `scripts/seed.ts`.

## Data Model

### Block Corpus Structure
Each block entry contains:
`json
{
  "id": "diamond_ore",
  "name": "Diamond Ore",
  "category": "Ores",
  "textureUrl": "https://minecraft.wiki/images/BlockSprite_diamond-ore.png",
  "properties": {
    "mechanical": {
      "hardness": 3.0,
      "blastResistance": 3.0,
      "miningTime": { "hand": null, "wooden": 15.0, ... },
      "toolRequired": "Iron Pickaxe or better",
      "stackable": true,
      "maxStackSize": 64
    },
    "generation": {
      "renewable": false,
      "rarity": "Rare",
      "yLevelMin": -63,
      "yLevelMax": 16,
      "biomes": ["All Overworld biomes"],
      "spawnRate": "Very Low"
    },
    "variants": { "hasVariants": true, "types": [...] },
    "crafting": { "recipes": [...], "fortuneCompatible": true },
    "special": { "luminous": false, "lightLevel": 0, ... }
  },
  "trivia_hooks": [
    {
      "category": "mechanical",
      "difficulty": "easy",
      "questionSeed": "What is the minimum tool tier required to mine Diamond Ore?",
      "answer": "Iron Pickaxe (or better)",
      "answerType": "toolTier"
    },
    ...
  ]
}
`

This JSON is the pipeline's *output artifact* — the app itself never reads it at runtime. `scripts/seed.ts` loads it once into Postgres (`entities` + `trivia_hooks` tables); the game only ever talks to the DB via `/api/questions`.

**`answerType`** (added post-launch) tags each hook with what *kind* of value its answer is — `toolTier` | `blastResistance` | `yLevelRange` | `lightLevel` | `boolean`. This is what makes distractor generation contextually consistent: a distractor for a `blastResistance` question is only ever sampled from other blocks' `blastResistance` answers, never from an unrelated field.

**Key Constraints**:
- 100 blocks currently (Release 2 target: 10,000 records across Blocks + Mobs + Structures)
- 2-5 trivia hooks per block (266 total hooks → 266 precomputed questions)
- Non-boolean questions: 3 total options. Boolean (`answerType: 'boolean'`) questions: 2 total options
- Texture URLs are resolved per-block via the wiki's File: namespace, not a fixed filename pattern (see `pipeline/texture_resolver.py`)
- Thin-pool answerTypes (e.g. `yLevelRange` has only 2 real blocks currently) fall back to a numeric-perturbation synthesis rather than reusing unrelated values

### Game State (Zustand Store)
`	ypescript
interface GameState {
  gameStatus: 'idle' | 'loading' | 'playing' | 'feedback' | 'finished' | 'error'
  currentQuestionIndex: number
  questions: GameQuestion[]
  selectedAnswerIndex: number | null
  score: number
  answers: PlayerAnswer[]
  totalQuestionsPerGame: number

  // Actions
  startGame: () => Promise<void>
  selectAnswer: (index: number) => void
  showFeedback: () => void
  nextQuestion: () => void
  endGame: () => void
  resetGame: () => void
}
`

**State Transitions**:
- idle → loading: user clicks START GAME (`startGame()` fetches `/api/questions`)
- loading → playing: fetch succeeds
- loading → error: fetch fails (e.g. DB unreachable) — GameContainer shows a Retry button
- playing → feedback: user selects answer + clicks SUBMIT
- feedback → playing: user clicks NEXT QUESTION (Q1-Q4)
- feedback → finished: user clicks NEXT QUESTION after Q5
- finished → idle: user clicks PLAY AGAIN

## Question Generation Algorithm

### Overview
Questions are generated **offline** (`scripts/precompute_questions.ts`), not per-request. The runtime API just samples the precomputed `question_bank` table — this was a deliberate switch away from the original "generate on every game start" design, since Minecraft block facts don't change between deploys and there's no benefit to runtime regeneration, only cost.

### Process (offline, run after any corpus change)
1. Load every `trivia_hooks` row, grouped by `answerType` (toolTier / blastResistance / yLevelRange / lightLevel / boolean)
2. For each hook:
   - **Boolean** (`answerType: 'boolean'`): the single distractor is just the opposite value (True↔False). No sampling needed — 2 total options.
   - **Everything else**: sample 2 distractors from *other blocks' hooks sharing the exact same `answerType`* — this is what guarantees every option is the same kind of value as the correct answer. 3 total options.
   - **Thin-pool fallback**: if fewer than 2 same-type candidates exist (e.g. `yLevelRange` currently has only 2 resolved blocks total), synthesize additional distractors by perturbing the correct value in the same format (e.g. `Y: -63 to 16` → `Y: -40 to 30`) rather than falling back to an unrelated value or a duplicate option
   - If even that can't produce enough valid distractors, the hook is skipped (no question generated for it) rather than shipping a broken one
3. Shuffle final options (Fisher-Yates), record the correct index
4. Insert into `question_bank` with the question text, options, correct index, and a short explanation

### Runtime (`GET /api/questions?count=5`)
1. `SELECT DISTINCT ON (entity_id) ... ORDER BY entity_id, RANDOM()` — one random question per block
2. `ORDER BY RANDOM() LIMIT 5` on that set — samples 5 of those, so no single game repeats a block
3. Maps DB rows to the `GameQuestion` shape and returns JSON — no distractor logic runs at request time at all

### Why answerType-based distractors
An earlier version pulled distractors from a category-wide grab-bag (all "mechanical" property values mixed together), which produced nonsense like a blast-resistance number question showing a tool name or a stray `"Hardness: 2"` string as an option. Tagging each hook with its specific answer shape at generation time and sampling only within that shape eliminates that failure mode by construction.

**Example**:
`
Question: "What is the blast resistance of Diamond Ore?"
Correct: "3.0"
Options (all blastResistance-typed): ["3.0", "6.0", "1200.0"]

Question: "True or False: Diamond Ore is renewable."
Correct: "False"
Options (boolean, always exactly these 2): ["False", "True"]
`

## Performance & Scaling

### Current Performance (100 blocks, DB-backed)
- **Question Generation**: 0ms at request time — precomputed offline, runtime is a `SELECT ... ORDER BY RANDOM() LIMIT 5`
- **API Response**: sub-100ms typical (Neon serverless, single query with a join)
- **Bundle Size**: no corpus data in the client bundle at all (verified via build output inspection) — only the game UI code
- **Database**: Neon Postgres, 100 entities / 266 trivia_hooks / 266 question_bank rows
- **Concurrent Users**: scales with Neon's serverless connection pooling; no app-level bottleneck at this data size

### Scaling to 10,000 records (Release 2: Blocks + Mobs + Structures)
The DB-backed architecture (this section used to describe a future plan; it's now implemented) handles 100 → 10,000 rows the same way — `ORDER BY RANDOM() LIMIT n` stays sub-50ms up to roughly 100k rows on Neon. What actually needs to grow for Release 2:
- Python pipeline needs mob (`minecraft-data` entities.json) and structure (wiki-only, no structured dataset found) extractor modules, sharing the same checkpoint/merge/writer infrastructure
- `question_bank`/`trivia_hooks` need mob-specific (health, attack, AI behavior) and structure-specific (loot table, biome, size) answerTypes and hook templates
- `/api/questions` needs optional `type`/`category` query params for "blocks only" vs "mixed" game modes — response shape stays identical, so no component changes needed
- No caching layer (Redis/Vercel KV) needed yet — would conflict with "fresh random questions every game" and isn't justified until measured latency requires it

### Database Schema (Current)
`sql
CREATE TYPE entity_type AS ENUM ('block', 'mob', 'structure');

CREATE TABLE entities (
  id TEXT PRIMARY KEY,          -- "diamond_ore"
  type entity_type NOT NULL,    -- 'block' today; 'mob'/'structure' in Release 2
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  properties JSONB NOT NULL,    -- Mechanical, generation, etc.
  source_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE trivia_hooks (
  id SERIAL PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  category TEXT NOT NULL,       -- "mechanical", "generation", etc.
  difficulty TEXT NOT NULL,     -- "easy", "medium", "hard"
  question_seed TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_type TEXT NOT NULL     -- "toolTier" | "blastResistance" | "yLevelRange" | "lightLevel" | "boolean"
);

CREATE TABLE question_bank (
  id SERIAL PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  entity_type entity_type NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB NOT NULL,       -- 2-element (boolean) or 3-element (everything else) shuffled array
  correct_index SMALLINT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
`

## UI/UX Specifications

### Screens & Layouts

#### StartScreen
- Full-screen blue gradient (from-blue-600 to-blue-800)
- Centered content container (max-w-md)
- Hero image: aspect-video (16:9), rounded corners
- Yellow feature box: high-contrast dark text on yellow background
- Green START GAME button: full-width, pixel font

#### GameScreen
- Blue gradient background
- 3-column grid on desktop, stacked on mobile
  - Left: Score board (sticky header)
  - Center: Question card + answer options
  - Right: Feedback panel (conditional)
- Progress bar under question number

#### GameOverScreen
- Purple gradient (from-purple-600 to-purple-800)
- Centered content
- Large percentage display (text-6xl)
- Hero image: aspect-video
- Yellow performance box: same contrast design as StartScreen

### Typography
- **Pixel Font** (Press Start 2P): Titles only ("MINECRAFT BLOCK TRIVIA")
- **Sans-serif** (system-ui): Body text, features, rules
- **Monospace** (optional): Scores, stats

### Color Palette
- **Primary**: Blue (#0062cc)
- **Secondary**: Green (#16a34a) - action buttons
- **Accent**: Yellow (#fcd34d) - feature/info boxes, success
- **Neutral**: White (#ffffff) text, gray (#6b7280) muted
- **Error**: Red (#dc2626) - incorrect answers
- **Success**: Green - correct answers

### Animation Principles
- Fade-in (350ms): Non-critical elements (images, text)
- Slide-up (400ms): Primary containers
- Bounce-sm (600ms): Titles (subtle, not overdone)
- Pulse-sm (2000ms): Score updates
- No animation on reduced-motion devices

## Deployment & DevOps

### Vercel Configuration
- **Production Branch**: master
- **Build Command**: 
pm run build
- **Framework Preset**: Next.js (auto-detected)
- **Domains**: minecraft-trivia.vercel.app
- **Environment**: None required (no secrets in MVP)

### CI/CD Pipeline
1. Developer pushes to master
2. Vercel webhook triggered
3. Build runs: npm run build (TypeScript + Next.js compile)
4. Artifacts deployed to edge network
5. Live within 1-2 minutes

### Pre-Merge Documentation Check
Since merging to master triggers an immediate production deploy, every PR/issue must pass a documentation gate before merge (enforced as step 10 of `.claude/Agents/github-issue-workflow.md`):
- Update `prd.md`, `GameRules.md`, and `CLAUDE.md` so they match the shipped change.
- Review `.claude/Agents/` and `.claude/Skills/` for staleness, and propose a new skill/agent if the issue revealed a repeatable pattern worth codifying (to reduce token use / turnaround time on similar future issues).
- Confirm `graphify-out/` is current. A git post-commit hook (`graphify hook install`) rebuilds `graphify-out/graph.json` and `GRAPH_REPORT.md` automatically after every commit (step 6 of the same workflow doc), so this is normally just a `git status` check, not manual work.

### Monitoring & Alerts
- Vercel Analytics: Page load time, Core Web Vitals
- Error tracking: Via Vercel deployment logs
- User feedback: None built-in (future: Sentry integration)

## API Endpoints (Current)
- `GET /api/questions?count=5` → returns `count` random precomputed questions (one per unique block), `force-dynamic` (never cached — must stay random every call)

**Future Endpoints**:
- `GET /api/questions?difficulty=easy&category=mechanical&type=mob` → filtered game modes (Release 2)
- `POST /api/scores` → Save game result (requires auth)
- `GET /api/leaderboard` → Top scores

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+
- Mobile: iOS 15+, Android 12+

## Accessibility Compliance
- WCAG 2.1 AA target (not yet formally audited)
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: Tab through buttons, Enter to submit
- Reduced motion: Respected via prefers-reduced-motion media query
- Alt text: All images have descriptive alt text
- Semantic HTML: Proper button, form, heading elements

## Testing Strategy

No automated test suite exists yet (aspirational, not yet built):

### Unit Tests (planned)
- questionGenerator.test.ts: verify 3 options (2 for boolean) generated, options are same-answerType, shuffling works
- answerShuffler.test.ts: Fisher-Yates randomness
- Corpus/DB validation: all entities load, no missing properties, every trivia_hook has a valid answerType

### Manual verification (what is actually done today)
- After any pipeline/schema change: query question_bank directly to confirm option counts and that every option matches the correct answer's shape
- tools/generate_image_check.py -- regenerate and visually scan for broken images

### Integration Tests
- Game flow: Start → Q1 → ... → Q5 → Game Over → Play Again
- State transitions: Verify game status changes correctly
- Score calculation: 0-5 points earned and displayed correctly

### Manual Testing
- Mobile (375px), Tablet (768px), Desktop (1280px)
- Chrome DevTools throttling (Slow 4G, Fast 3G)
- Keyboard navigation (Tab, Enter)
- Reduced motion toggle
- Real Minecraft player feedback (does the trivia make sense?)

## Known Issues & Limitations

### Current Limitations
- No persistent high scores (game state resets on page reload)
- No user accounts or authentication
- No difficulty selector in the UI (all questions mixed) — data already supports it, `question_bank.difficulty` is populated
- No category filter in the UI — same, `question_bank.category` already exists
- Only 100 of ~1,200+ blocks covered; Mobs/Structures not started
- `yLevelRange` answerType has only 2 real blocks resolved (Lava, Nether Gold Ore) — most Y-level questions for other blocks rely on the numeric-perturbation fallback rather than a second real block

### Known Bugs
- None currently (deployed & tested)

## Future Roadmap

### Completed (Phase A — DB-backed scaling)
- [x] Migrate corpus to Postgres + Drizzle ORM
- [x] Implement server-side (precomputed offline) question generation
- [x] `GET /api/questions` endpoint, no corpus data bundled to client
- [x] Reduce to 3 options (2 for True/False) with contextually-consistent (same-answerType) distractors
- [x] Expand corpus from 25 → 100 blocks via automated Python ETL pipeline (minecraft-data + wiki)
- [x] Fix broken block images via wiki-based texture resolution (54/100 were broken before the fix)

### Phase 2: Scaling to 10,000 Records (Release 2)
- [ ] Add difficulty selector (easy/medium/hard games)
- [ ] Add category filter (ores-only game, building-only game, etc.)
- [ ] Expand corpus to all ~1,200+ Minecraft blocks
- [ ] Add mob trivia (health, attack, AI behavior) — minecraft-data's entities.json + minecraft-assets skins
- [ ] Add structure trivia (loot tables, generation biome, size) — wiki-only, no structured dataset available

### Phase 3: User Engagement (Q1 2027)
- [ ] User authentication (OAuth via Discord/Microsoft)
- [ ] Score persistence (Postgres + JWT)
- [ ] Leaderboard (global + weekly)
- [ ] Daily challenge (same 5 questions for all players)
- [ ] Streak tracking (consecutive correct answers)
- [ ] Hint system (reveal one incorrect answer)
- [ ] Difficulty badges (earned for 100% on hard)

### Phase 4: Content & Community (Q2 2027)
- [ ] Mob trivia expansion (Enderman, Creeper, etc.)
- [ ] Structure trivia (Pyramids, Mansions, etc.)
- [ ] Custom game sharing (encode game seed in URL)
- [ ] Speedrun mode (timed 5-question game)
- [ ] Screenshot & share results feature
- [ ] Twitch extension (play live on stream)

## Success Metrics
- **MVP**: Game playable, all 25 blocks covered, no errors — ✅ achieved
- **Phase A (DB scaling)**: 100 blocks, DB-backed, precomputed questions — ✅ achieved
- **Phase 2 (Release 2)**: 1,200+ blocks + Mobs + Structures (10,000 records), < 50ms API response — target
- **Phase 3**: 1000+ DAU, 50+ top leaderboard churn, 20% daily return rate
- **Phase 4**: 5000+ DAU, avg playtime > 10 minutes, community-driven content

## References
- Mechanical/special properties: https://github.com/PrismarineJS/minecraft-data
- Textures (blocks + mobs): https://github.com/PrismarineJS/minecraft-assets
- Generation fields (Y-level, rarity) + image fallback: https://minecraft.wiki/ (scraped via MediaWiki API; no Cargo/Semantic MediaWiki available — confirmed live)
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs
- Zustand docs: https://github.com/pmndrs/zustand
- Drizzle ORM docs: https://orm.drizzle.team/
- Neon docs: https://neon.tech/docs
