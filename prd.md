# prd.md - Minecraft Block Trivia Technical Product Requirements

## Executive Summary
Minecraft Block Trivia is a web-based React/Next.js game that delivers randomized Minecraft block knowledge quizzes to players. The MVP supports 25 blocks with dynamic question generation, real-time scoring, and responsive mobile/desktop UI.

**Live**: https://minecraft-trivia.vercel.app
**Repository**: https://github.com/sapnasudhir/minecraft-trivia

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
| **Database** | None (MVP) | Game state lives in browser; no persistence required |

### Project Structure
`
minecraft-trivia/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Entry point (renders GameContainer)
│   │   └── globals.css         # Global styles + animations
│   │
│   ├── components/Game/
│   │   ├── GameContainer.tsx   # Routes between screens based on game status
│   │   ├── StartScreen.tsx     # Landing: title, hero image, features, START button
│   │   ├── GameScreen.tsx      # Main game loop: question, answers, score
│   │   ├── QuestionCard.tsx    # Question display with block image
│   │   ├── AnswerOptions.tsx   # 5 clickable answer buttons
│   │   ├── FeedbackPanel.tsx   # Correct/incorrect feedback + explanation
│   │   ├── ScoreBoard.tsx      # Live score + accuracy display
│   │   └── GameOverScreen.tsx  # Final score, performance message, play again
│   │
│   ├── data/
│   │   ├── minecraft_block_trivia_corpus.json  # 25 blocks with all properties
│   │   └── loaders.ts          # Corpus loading + validation
│   │
│   ├── store/
│   │   └── gameStore.ts        # Zustand store (game state + actions)
│   │
│   ├── types/
│   │   ├── block.ts            # Block, TriviaHook, Properties interfaces
│   │   └── game.ts             # GameQuestion, GameState, PlayerAnswer
│   │
│   └── utils/
│       ├── questionGenerator.ts # Core: transforms hooks → 5-option MC questions
│       ├── answerShuffler.ts   # Fisher-Yates shuffle algorithm
│       └── sounds.ts           # Web Audio API sound synthesis
│
├── public/
│   ├── minecraft-hero.png      # StartScreen hero image
│   └── gameover-hero.png       # GameOverScreen hero image
│
├── next.config.ts             # Image domain config (minecraft.wiki)
├── tailwind.config.ts         # Tailwind customization (animations, fonts)
├── tsconfig.json              # TypeScript path aliases (@/...)
└── package.json               # Dependencies: Next.js, React, Tailwind, Zustand
`

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
      "answer": "Iron Pickaxe (or better)"
    },
    ...
  ]
}
`

**Key Constraints**:
- 25 blocks in MVP (expandable to 300+ in Phase 2)
- 3-5 trivia hooks per block = 75-125 potential questions
- All texture URLs must use BlockSprite_block-name.png format
- Corpus file size: ~1.5 MB (gzips to ~200 KB)

### Game State (Zustand Store)
`	ypescript
interface GameState {
  gameStatus: 'idle' | 'playing' | 'feedback' | 'finished'
  currentQuestionIndex: number
  questions: GameQuestion[]
  selectedAnswerIndex: number | null
  score: number
  answers: PlayerAnswer[]
  totalQuestionsPerGame: number

  // Actions
  startGame: () => void
  selectAnswer: (index: number) => void
  showFeedback: () => void
  nextQuestion: () => void
  endGame: () => void
  resetGame: () => void
}
`

**State Transitions**:
- idle → playing: user clicks START GAME
- playing → feedback: user selects answer + clicks SUBMIT
- feedback → playing: user clicks NEXT QUESTION (Q1-Q4)
- feedback → finished: user clicks NEXT QUESTION after Q5
- finished → idle: user clicks PLAY AGAIN

## Question Generation Algorithm

### Overview
Transform trivia hooks into 5-option multiple-choice questions with plausible distractors.

### Process
1. **Block Selection**: Randomly pick 5 blocks from corpus
2. **Hook Selection**: Pick 1 random hook from each block
3. **Incorrect Answers**: For each question, generate 4 distractors:
   - Extract property values from OTHER blocks (mining tools, Y-levels, block names, crafting yields)
   - Filter to avoid obvious duplicates or semantically identical answers
   - Return up to 4 plausible alternatives
4. **Shuffle**: Randomize the position of correct answer among 5 options using Fisher-Yates
5. **Output**: Return GameQuestion with correct position recorded

### Distractor Strategy
**Goal**: Answers should be plausible but wrong—hard enough to require block knowledge.

**Sources of Distractors**:
- Tool names from other blocks' minToolTier
- Y-level ranges from other blocks' generation data
- Block names (players might confuse similar blocks)
- Crafting yield amounts or stack sizes

**Filtering**:
- Remove exact duplicates
- Avoid answers that are substrings of the correct answer
- Prefer answers from different property categories

**Example**:
`
Question: "What is the minimum tool tier to mine Diamond Ore?"
Correct: "Iron Pickaxe (or better)"

Distractor Sources:
- "Wooden Pickaxe" ← from Amethyst Block minToolTier
- "Stone Pickaxe" ← from Stone minToolTier
- "Shovel" ← from Sand minToolTier
- "No tool required" ← placeholder when insufficient alternatives
`

## Performance & Scaling

### MVP Performance (25 blocks)
- **Question Generation**: < 100ms client-side
- **Page Load**: First paint < 1s on 4G
- **Bundle Size**: ~280 KB (gzipped)
- **Database**: None (corpus bundled in client)
- **Concurrent Users**: Unlimited (static site, CDN-served)

### Scaling to 300+ blocks (Phase 2)
Current architecture will struggle at 300+ blocks:
- Corpus JSON: ~18 MB → 2.2 MB gzipped (still large for client)
- Question generation: O(n) scans per question (1000 blocks × 5 options × 5 questions = 25K property lookups)
- Better approach: **server-side generation + API caching**

**Recommended Phase 2 Architecture**:
- Move corpus to Postgres (Neon)
- Generate questions server-side at request time
- Cache question bank in Redis or Neon (pre-generated × difficulty)
- API endpoint: /api/questions returns 5 random questions
- Client calls API on game start, not bundled JSON

### Database Schema (Future)
`sql
CREATE TABLE entities (
  id TEXT PRIMARY KEY,          -- "diamond_ore"
  type TEXT NOT NULL,           -- "block" | "mob" | "structure"
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  properties JSONB NOT NULL,    -- Mechanical, generation, etc.
  image_url TEXT,
  source_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE question_bank (
  id SERIAL PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id),
  category TEXT NOT NULL,       -- "mechanical", "generation", etc.
  difficulty TEXT NOT NULL,     -- "easy", "medium", "hard"
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB NOT NULL,       -- 5-element shuffled array
  correct_index SMALLINT NOT NULL,
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

### Monitoring & Alerts
- Vercel Analytics: Page load time, Core Web Vitals
- Error tracking: Via Vercel deployment logs
- User feedback: None built-in (future: Sentry integration)

## API Endpoints (Current)
None—the game is a static SPA. All data is bundled and processed client-side.

**Future Endpoints** (Phase 2):
- GET /api/questions?difficulty=easy&category=mechanical → 5 questions
- POST /api/scores → Save game result (requires auth)
- GET /api/leaderboard → Top scores

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

### Unit Tests
- questionGenerator.test.ts: Verify 5 options generated, shuffling works
- nswerShuffler.test.ts: Fisher-Yates randomness
- Corpus validation: All blocks load, no missing properties

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

### MVP Limitations
- No persistent high scores (game state resets on page reload)
- No user accounts or authentication
- No difficulty selector (all questions mixed)
- No category filter (random across all blocks)
- Question generation is O(n) per game (scales poorly to 1000+ blocks)
- Images must be manually committed to /public

### Known Bugs
- None currently (deployed & tested)

## Future Roadmap

### Phase 2: Scaling to 300+ Blocks (Q4 2026)
- [ ] Migrate corpus to Postgres + Drizzle ORM
- [ ] Implement server-side question generation
- [ ] Add difficulty selector (easy/medium/hard games)
- [ ] Add category filter (ores-only game, building-only game, etc.)
- [ ] Expand corpus to all ~300 Minecraft blocks
- [ ] Add mob trivia (health, attack, AI behavior)

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
- **MVP**: Game playable, all 25 blocks covered, no errors
- **Phase 2**: 300+ blocks, < 200ms question generation, < 50ms API response
- **Phase 3**: 1000+ DAU, 50+ top leaderboard churn, 20% daily return rate
- **Phase 4**: 5000+ DAU, avg playtime > 10 minutes, community-driven content

## References
- Corpus data source: https://minecraft.wiki/w/Block
- Texture source: https://minecraft.wiki/images/ (BlockSprite_*.png)
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs
- Zustand docs: https://github.com/pmndrs/zustand
