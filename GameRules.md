# GameRules.md - Minecraft Block Trivia Game Rules

> Reflects the actual current implementation (`src/store/gameStore.ts`, `src/components/Game/*`) as of this writing. Superseded `Rules.md`, which described an earlier prototype (fixed 5-question quiz, no scoring penalties, 25-block corpus) that no longer matches the shipped game.

## Game Objective
Answer Minecraft block trivia questions correctly to fill an 8-slot crafting table. Test your knowledge of block properties, generation, crafting, and special characteristics while racking up points.

## Game Flow

### 1. Start Screen
- **Display**: "MINECRAFT / BLOCK TRIVIA" title (pixel font) with hero image
- **Player name**: a required text field with autocomplete suggestions drawn from the current Top 10 leaderboard's unique names (case-insensitive substring match, max 6 shown). Selecting a suggestion fills the field; typing an unmatched name is fine (new players just aren't on the board yet). "START GAME" is disabled until a name is entered.
- **Callout box**: "FILL THE CRAFTING TABLE TO WIN!"
  - Answer trivia to fill grid slots
  - Earn points for correct answers
  - Complete the table to finish
- **Action**: Click "START GAME" to begin
- **"🏆 TOP 10 LEADERBOARD"** button opens the Leaderboard Screen (see below); Back returns here.

### 2. The Crafting Table (core loop)
The game board is a 3×3 crafting grid, Minecraft-style:
- **Center cell**: always shows the current question's block image (the "input")
- **8 outer cells**: start empty; each correct answer fills the next empty outer slot with that question's block
- **Output slot** (right of the grid, past an arrow): shows pending/✓/✗ once you submit an answer
- **Win condition**: the game ends once all 8 outer slots are filled ("TABLE COMPLETE — ALL BOXES FILLED!") — there is **no fixed question count**. A player who answers correctly every time finishes in exactly 8 questions; missed answers don't fill a slot, so a low-accuracy run takes more questions to complete.
- **Ending early**: a "TERMINATE GAME" button (with a confirm prompt) lets the player end the game before the table is full — progress and score are kept as-is.

### 3. Fetching Questions
- Questions come from a DB-backed API (`GET /api/questions?count=N`), one random precomputed question per unique block (a single game never repeats a block).
- The client fetches in batches of 5. When 2 or fewer unanswered questions remain in the local queue, it silently fetches another batch of 5 in the background — the player never sees a "loading" gap mid-game.

### 4. Answering a Question
Each question screen shows:
- Header: `RECIPE N` (question number this game) · `SCORE: X` · `TABLE {filled}/8 · {difficulty}`
- The question text
- The crafting grid (see above)
- **Answer options** — labeled A, B, C…:
  - **Boolean questions**: 2 options (True / False)
  - **All other questions**: 3 options (1 correct + 2 distractors)
  - Distractors are drawn from *other blocks'* trivia hooks of the same answer type (tool tier, blast resistance, Y-level range, light level), so every option is contextually consistent with the correct answer (numbers vs. numbers, tool names vs. tool names). If too few real distractors exist, additional ones are synthesized by perturbing the correct value in a format-matched way.
- Click an option to select it (highlights), then click **"CRAFT IT"** to submit.

### 5. Feedback
After submitting:
- **Correct**: green panel, "Correct! — {answer}", output slot shows ✓, that block fills the next crafting-grid slot
- **Incorrect**: red panel, "Incorrect — {answer}", output slot shows ✗, shake animation on the wrong option, no slot filled
- Explanation text combining the block name with the relevant property
- Points earned/lost for this answer are shown (see Scoring)
- Sound effects play (click / correct / incorrect)
- **"NEXT RECIPE"** button (or press **Enter**) advances to the next question

## Scoring (point-based, not a fraction)
Scoring is **not** "1 point per correct answer with no penalties" — it's a streak-weighted points system:
- **Correct answer**: `+10` base, **plus a streak bonus** equal to (current correct streak − 1)
- **Incorrect answer**: `−5` base, **minus an equivalent streak penalty** as incorrect answers stack up
- **Streaks**: consecutive answers of the *same* result type (correct-correct-correct, or incorrect-incorrect) increase the streak count and its bonus/penalty. Getting a different result type (switching from correct to incorrect, or vice versa) resets the streak to 1.
- Total score is **cumulative points**, shown live as `SCORE: X` — it is not bounded to a "X / 5" fraction and **can go negative**.

## Game Over Screen
Reached when the crafting table is completed, or the player terminates early.
- **"GAME OVER"** title
- **Total Score**: the cumulative point total (not a percentage)
- **Performance message**, based on % of *answered* questions that were correct (`correctCount / totalAnswered`, where `totalAnswered` is however many questions were actually answered — not a fixed 5):
  - 100%: "🎉 Perfect! You are a Minecraft master!"
  - 80–99%: "🎮 Great job! You know your blocks!"
  - 60–79%: "👍 Good effort! Keep playing!"
  - Below 60%: "📚 Try again to improve your knowledge!"
- **Your Performance** box: ✓ Correct: X, ✗ Incorrect: Y
- **"PLAY AGAIN"** resets to the Start Screen
- **"🏆 TOP 10 LEADERBOARD"** button opens the Leaderboard Screen; Back returns to this Game Over screen
- The current player's score is submitted to the leaderboard automatically when the game ends (whether the table was completed or the player terminated early), including zero/negative scores — no minimum threshold
- **Rank celebration**: if the just-submitted score made the top 10, a badge appears ("🏆 TOP 10 SCORE!") and the leaderboard button pulses/glows with a "See where you rank!" nudge. If it made the **top 3**, the badge becomes more emphatic ("🎉 #N ON THE LEADERBOARD!") and falling confetti animates across the screen.

## Leaderboard

A persistent, shared Top 10 list of the highest scores across all players (Neon Postgres, not per-browser).
- **Duplicates are allowed**: if one player has 3 of the top 10 scores, they appear as 3 separate rows — the list of 10 scores can represent as few as 1 unique name.
- **Pruning**: every finished game submits a `{playerName, score}` row; the leaderboard table is immediately re-sorted and truncated back to the top 10, so a new high score can bump a former top-10 entry off entirely.
- **No identity/ownership check**: player names are free-text. Autocomplete on the Start Screen is a convenience, not an enforced identity — anyone can play under any name.
- **Leaderboard Screen**: ranked list (rank badge, name, score) sorted descending by score, gold/silver/bronze badges for ranks 1–3, "No scores yet — be the first!" shown when the table is empty. Each row shows an abbreviated date/time (e.g. "7/19 6:24 PM") in small muted text under the score, from the row's `created_at`. Reachable from both the Start Screen and the Game Over Screen; Back returns to whichever one opened it.

## Question Generation

### Trivia Hooks
Each block in the corpus has several "trivia hooks" — seed questions tagged by category:
- **Mechanical**: mining times, tool requirements, hardness
- **Generation**: spawn locations, Y-levels, rarity
- **Crafting**: recipes, yield amounts, Fortune compatibility
- **Special**: luminosity, transparency, flammability
- **Variants**: color types, oxidation states, block variations

### Answer Types (drive distractor generation)
Each hook is also tagged with an `answerType`, which determines how distractors are picked: `toolTier`, `blastResistance`, `yLevelRange`, `lightLevel`, or `boolean`.

### Incorrect Answers (Distractors)
For each question:
1. Boolean questions get exactly one distractor: the opposite value (True↔False).
2. Non-boolean questions draw 2 distractors from other blocks' hooks sharing the same `answerType`, excluding the correct answer.
3. If the same-type pool is too thin (e.g. `yLevelRange` currently has few resolved blocks), remaining distractors are synthesized by perturbing the correct answer's numeric/format pattern rather than pulling an unrelated value.
4. Questions that still can't reach the required distractor count are skipped entirely at precompute time rather than shipping with duplicate/degenerate options.

## Block Coverage
- **Current corpus**: 100 blocks (`src/data/minecraft_block_trivia_corpus_100.json`), sourced from PrismarineJS/minecraft-data + minecraft.wiki
- All 100 are currently categorized simply as `"Block"` — mob and structure entity types exist in the schema (`entity_type` enum: block/mob/structure) but aren't populated yet
- Question categories covered: mechanical, generation, crafting, special, variants

## User Experience Details

### Audio (Web Audio API, no external files)
- Click sound on selecting an answer
- Correct answer sound (two ascending tones)
- Incorrect answer sound (descending buzz)
- Next-question sound (quick ascending beep) when a new question loads
- Game Over fanfare (five-tone ascending sequence)

### Keyboard Support
- **Enter** advances past the feedback panel to the next question

### Visual Theme
- Crafting-table / parchment aesthetic (wood-grain background, parchment panel, pixel font) replaces the earlier plain blue-gradient quiz-card look
- Shake animation on incorrect answer selection

## Not Yet Implemented
- Difficulty selection or category filtering in the UI (data supports it — `difficulty`/`category` already exist on `question_bank`)
- Mob and structure questions (schema supports it, corpus doesn't populate it yet)
- User authentication — the Top 10 leaderboard (persisted in Neon Postgres) uses free-text player names with no login/ownership check
- Daily challenges, streak tracking beyond in-session scoring, hint system
