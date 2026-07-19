# Graph Report - minecraft-trivia  (2026-07-19)

## Corpus Check
- 43 files · ~199,816 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 235 nodes · 354 edges · 19 communities (11 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `844de0bf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Project Docs & Data Pipeline
- Game UI Screens & Audio
- Runtime Package Dependencies
- Question Generation Pipeline
- Dev Tooling & Type Dependencies
- TypeScript Compiler Config
- Database & API Layer
- Crafting Game Mechanics
- TS Ambient Type References
- Root Layout & Fonts
- Data Design Rationale
- ESLint Config
- PostCSS Config
- Agent Instructions
- Unused Icon: file.svg
- Unused Icon: globe.svg
- Unused Icon: next.svg
- Unused Icon: vercel.svg
- Unused Icon: window.svg

## God Nodes (most connected - your core abstractions)
1. `prd.md — Minecraft Block Trivia Technical PRD` - 44 edges
2. `compilerOptions` - 16 edges
3. `GitHub Issue Workflow` - 16 edges
4. `CLAUDE.md — Minecraft Block Trivia Development Guide` - 16 edges
5. `useGameStore` - 9 edges
6. `scripts` - 8 edges
7. `include` - 7 edges
8. `GameRules.md — Minecraft Block Trivia Game Rules` - 7 edges
9. `GameQuestion` - 6 edges
10. `getAudioContext()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Rationale: Per-Block Texture Resolution via Wiki File: Namespace` --semantically_similar_to--> `Rationale: answerType-Based Distractor Sampling`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `build-output.txt — Next.js Build Log (failed build)` --conceptually_related_to--> `Warning: This Next.js Version Has Breaking Changes vs Training Data`  [AMBIGUOUS]
  build-output.txt → AGENTS.md
- `build-output.txt — Next.js Build Log (failed build)` --conceptually_related_to--> `prd.md — Minecraft Block Trivia Technical PRD`  [INFERRED]
  build-output.txt → prd.md
- `CLAUDE.md — Minecraft Block Trivia Development Guide` --references--> `GameRules.md — Minecraft Block Trivia Game Rules`  [EXTRACTED]
  CLAUDE.md → GameRules.md
- `CLAUDE.md — Minecraft Block Trivia Development Guide` --references--> `Zustand`  [EXTRACTED]
  CLAUDE.md → prd.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Offline Question Precompute Pipeline (Corpus JSON -> Seed -> Precompute -> API)** — scripts_seed, scripts_precompute_questions, src_data_minecraft_block_trivia_corpus_100, app_api_questions_route, src_db_schema [EXTRACTED 1.00]
- **Pre-Merge Documentation Governance Flow** — claude, prd, gamerules, claude_pre_merge_documentation_check, claude_github_issue_workflow_ref [EXTRACTED 1.00]

## Communities (19 total, 8 thin omitted)

### Community 0 - "Project Docs & Data Pipeline"
Cohesion: 0.08
Nodes (28): Warning: This Next.js Version Has Breaking Changes vs Training Data, ArivMinecraftTrivia/pipeline/fetch_minecraft_data.py, ArivMinecraftTrivia/pipeline/merge.py, ArivMinecraftTrivia/pipeline/select_blocks.py, ArivMinecraftTrivia/pipeline/texture_resolver.py, ArivMinecraftTrivia/pipeline/wiki_scraper.py, build-output.txt — Next.js Build Log (failed build), CLAUDE.md — Minecraft Block Trivia Development Guide (+20 more)

### Community 1 - "Game UI Screens & Audio"
Cohesion: 0.12
Nodes (25): GameRules.md — Minecraft Block Trivia Game Rules, 8-Slot Crafting Table Win Condition, Rules.md (superseded prototype spec: fixed 5-question quiz, no penalties, 25-block corpus), Streak-Weighted Scoring System, Web Audio API, Game Over Hero Image (gameover-hero.png), Minecraft Hero Image (Surfing Character Scene), AnswerOptions() (+17 more)

### Community 2 - "Runtime Package Dependencies"
Cohesion: 0.08
Nodes (24): drizzle-orm, @neondatabase/serverless, next, dependencies, drizzle-orm, @neondatabase/serverless, next, react (+16 more)

### Community 3 - "Question Generation Pipeline"
Cohesion: 0.14
Nodes (20): main(), AnswerType, BlockProperties, CorpusFile, CorpusMetadata, CraftingProperties, CraftingRecipe, GenerationProperties (+12 more)

### Community 4 - "Dev Tooling & Type Dependencies"
Cohesion: 0.10
Nodes (21): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, tailwindcss (+13 more)

### Community 5 - "TypeScript Compiler Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "Database & API Layer"
Cohesion: 0.16
Nodes (13): GET(), QuestionRow, Batch Question Fetching (batches of 5, silent background refill), DB-Backed Scaling Architecture (Phase A, completed), Rationale: Offline-Precomputed Questions over Runtime Generation, Release 2 Roadmap: Scaling to 10,000 Records (Blocks+Mobs+Structures), CorpusBlock, db (+5 more)

### Community 7 - "Crafting Game Mechanics"
Cohesion: 0.25
Nodes (8): CraftingGrid(), CraftingGridProps, QuestionCard(), QuestionCardProps, FilledSlot, GameQuestion, GameState, PlayerAnswer

### Community 8 - "TS Ambient Type References"
Cohesion: 0.12
Nodes (16): 10. Documentation & tooling refresh — before merge, 11. Merge — always ask first, 12. Confirm prod deploy, 13. Close the issue, 14. Cleanup, 1. Trigger, 2. Fetch the issue, 3. Clone into a fresh per-issue subfolder (+8 more)

### Community 9 - "Root Layout & Fonts"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 10 - "Data Design Rationale"
Cohesion: 0.50
Nodes (4): Rationale: Per-Block Texture Resolution via Wiki File: Namespace, answerType Taxonomy (toolTier/blastResistance/yLevelRange/lightLevel/boolean), Trivia Hook Categories (mechanical/generation/crafting/special/variants), Rationale: answerType-Based Distractor Sampling

## Ambiguous Edges - Review These
- `build-output.txt — Next.js Build Log (failed build)` → `Warning: This Next.js Version Has Breaking Changes vs Training Data`  [AMBIGUOUS]
  build-output.txt · relation: conceptually_related_to

## Knowledge Gaps
- **109 isolated node(s):** `QuestionRow`, `geistSans`, `geistMono`, `metadata`, `eslintConfig` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `build-output.txt — Next.js Build Log (failed build)` and `Warning: This Next.js Version Has Breaking Changes vs Training Data`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `prd.md — Minecraft Block Trivia Technical PRD` connect `Project Docs & Data Pipeline` to `Game UI Screens & Audio`, `Question Generation Pipeline`, `Database & API Layer`, `Crafting Game Mechanics`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling & Type Dependencies` to `Runtime Package Dependencies`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `CLAUDE.md — Minecraft Block Trivia Development Guide` connect `Project Docs & Data Pipeline` to `Game UI Screens & Audio`, `Question Generation Pipeline`, `Database & API Layer`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `QuestionRow`, `geistSans`, `geistMono` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Docs & Data Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.08377896613190731 - nodes in this community are weakly interconnected._
- **Should `Game UI Screens & Audio` be split into smaller, more focused modules?**
  _Cohesion score 0.12063492063492064 - nodes in this community are weakly interconnected._