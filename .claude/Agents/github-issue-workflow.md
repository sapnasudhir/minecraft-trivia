# GitHub Issue Workflow

Standing process for **all** changes to this repo. Every change must originate from a GitHub Issue — no ad hoc edits.

## 1. Trigger
Only start this flow when explicitly asked to work a specific GitHub Issue (e.g. "work on issue #8" or a pasted issue URL). If asked to "just fix X" without an issue reference, first check whether a matching open issue exists (`list_issues`/`search_issues`); if not, ask whether to create one before proceeding.

## 2. Fetch the issue
- `issue_read` (method `get`) for title/body/acceptance criteria; `get_comments` if there's prior discussion.
- Confirm scope with the user only if the issue is ambiguous — otherwise proceed.

## 3. Work directly in the existing checked-out repo
- The project root (`C:\Users\sapna\OneDrive\Documents\Claude\.claude\Projects\minecraft-trivia\`) is itself the checked-out clone of `sapnasudhir/minecraft-trivia` — `src\` inside it is the app's real source folder, not a place to nest per-issue clones.
- No separate clone step needed: `git fetch origin` and `git checkout master && git pull` to sync, then branch (step 4) directly here.
- (A prior version of this doc said to clone into `src\issue-<N>-<short-slug>\`; that collided with the real `src\` and was never actually how issues #3+ were branched — corrected per issue #8.)

## 4. Branch
- From the repo's default branch (`master` for minecraft-trivia — confirm via `list_branches` rather than assuming for other repos).
- Branch name: `issue-<N>-<short-slug>`.

## 5. Make the changes
- Reuse existing patterns/components found in the repo rather than introducing new ones.
- Run the repo's own lint/typecheck/build commands locally before pushing (`npm run lint`, `npm run build`).
- If local verification needs a dev server and the repo depends on an external service unreachable from the sandbox (e.g. Neon Postgres with no local creds), it's fine to temporarily stub that one integration point for local testing — but always revert the stub and confirm `git status` shows only the intended files before committing.

## 6. Commit & push
- Commit message: concise summary + `Closes #<N>` in the body, so the PR auto-closes the issue on merge.
- Push the branch to `origin`.
- **Post-commit hook**: every `git commit` automatically triggers graphify's post-commit hook (`graphify hook install`, run once per clone), which rebuilds `graphify-out/graph.json` and `GRAPH_REPORT.md` from the changed files. If the rebuild leaves `graphify-out/` modified (`git status`), fold those changes into the same commit series (amend, or a small follow-up "update graphify-out" commit) before pushing — don't push code with a stale graph.

## 7. Open the PR
- `create_pull_request`: head = issue branch, base = `master`, body includes Summary, Test plan checklist, and `Closes #<N>`.
- Check for a PR template (`pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE/`) and use it if present.

## 8. QA on the Vercel preview
- Opening the PR triggers a Vercel Preview deployment automatically.
- Poll the PR's commit status (`gh api repos/sapnasudhir/minecraft-trivia/commits/<sha>/status`) until the `Vercel` check reports `success` for Preview.
- Open the preview URL in the Browser pane and manually exercise the changed flow — read_console_messages, read_network_requests, click through the actual feature. Not just "it built."

## 9. Structured PR QA (self-review, before merge)
Post a checklist before asking to merge:
- [ ] Diff matches the issue's acceptance criteria — nothing more, nothing less
- [ ] No regressions in adjacent functionality touched by the same files (spot-check via preview)
- [ ] Lint/build clean (or only pre-existing failures, explicitly called out)
- [ ] Preview-verified evidence (screenshot, console/network check) summarized to the user
- [ ] No stray debug code, temporary stubs, or unrelated file changes in the diff

## 10. Documentation & tooling refresh — before merge
Required gate, before step 11. Review whether this issue's change makes any project documentation stale, and update whatever applies:
- `prd.md` — architecture, data model, roadmap, known limitations
- `GameRules.md` — gameplay/UX behavior, scoring, question generation
- `CLAUDE.md` — dev guide, code organization, common tasks
- `.claude/Agents/` and `.claude/Skills/` — does this change affect how future issues should be worked? Update any agent/skill whose steps, paths, or assumptions this issue invalidated.
- `graphify-out/` — confirm it reflects the final diff. The post-commit hook (step 6) keeps it current automatically; `git status` should show no pending `graphify-out/` changes by this point. If it does, the hook didn't run or wasn't installed (`graphify hook status`) — rebuild manually (`/graphify --update`) rather than merging with a stale graph.
- Consider whether a new skill or agent would have made this issue faster or cheaper to work (a repeated multi-step process worth codifying, a lookup worth caching, etc.). If a clear pattern emerged, propose adding one — the goal is that the *next* similar issue costs less in tokens/time than this one did.

Note in the PR description (or as a comment) what was checked/updated, even if the answer is "nothing needed changing."

## 11. Merge — always ask first
Merging to `master` auto-deploys to Vercel production. This is high blast-radius:
- Present the QA checklist results (step 9) and the documentation refresh (step 10), and ask for explicit go-ahead before calling `merge_pull_request` (squash merge).
- Never merge automatically, even if every QA box is checked.

## 12. Confirm prod deploy
- After merge, check the merge commit's status for the `Vercel` context reaching `success` on Production.
- Spot-check the live prod URL in the browser if the change is user-visible.

## 13. Close the issue
- GitHub auto-closes issues referenced via `Closes #N` in the merged PR — verify via `issue_read` (`state: closed`, `state_reason: completed`).
- If auto-close didn't fire, manually close via `issue_write` (`state: closed`, `state_reason: completed`).

## 14. Cleanup
- After merge, switch back to `master` and `git pull`; delete the local issue branch (`git branch -d issue-<N>-<short-slug>`) only after confirming it merged and `git status` shows nothing uncommitted on it.
- The remote branch is deleted automatically if "Delete branch" is used on the merged PR (GitHub's default prompt) — otherwise delete it explicitly (`git push origin --delete issue-<N>-<short-slug>`).

## Why this exists
Issues #4 and #5 were shipped with ad hoc local-repo handling: two different clone locations got created in one session, one accumulated uncommitted work, and cleanup needed manual intervention. This workflow fixes that — one fixed working copy (this checked-out repo), fixed branch naming, an explicit Vercel preview QA gate before merge, and merge always requires explicit confirmation since it deploys straight to prod. (Step 3 originally called for a per-issue clone under `src\`; that was corrected during issue #8 once it turned out to collide with the real source folder and didn't match how issues were actually branched.)
