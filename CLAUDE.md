@AGENTS.md

# Context
- Product: **LeafMo** — production at https://leafmo.app.
- Memory: `current-state.json` (Primary source of truth for app state/arch). Reference it before any task.

## Rules
- **Exports:** No default exports. Use named exports only. (Exception: Next.js App Router pages/layouts require `export default`.)
- **Complexity:** Max 150 lines per component. Split if exceeded. (Exception: `app/design-system/` showcase page.)
- **Workflow:** One screen at a time. Run `npm run lint` & fix after each step.
- **Communication:** No fluff. Code-first responses.

## Tech Stack
- Next.js 16 (App Router), TS Strict, Tailwind 4, shadcn/ui.
- Supabase (Postgres + RLS, Auth). Data access only via `/lib/db/`.
- next-intl (en, pl), React Query, Zod.

## Backlog
Tracked as GitHub issues/milestones in `earendillo/plants`. Notable open items:
- [ ] Shared garden indicator & Add tab guard — `docs/superpowers/specs/2026-05-07-shared-garden-indicator-design.md`
- [ ] Split files over 150 lines (milestone "Phase 5 — 150-line file splits")

## Finalizing Features
- After every significant change (new features, architectural changes, DB adjustments) make sure `current-state.json` is updated and represents real current state of the app
- When a feature is 100% complete:
  1. Update `current-state.json` with new paths/logic.
  2. Check off the item in the Backlog above (and close its GitHub issue).
