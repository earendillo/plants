@AGENTS.md

# Context
- Memory: `current-state.json` (Primary source of truth for app state/arch). Referece it before any task.

## Rules
- **Exports:** No default exports. Use named exports only.
- **Complexity:** Max 150 lines per component. Split if exceeded.
- **Workflow:** One screen at a time. Run `npm run lint` & fix after each step.
- **Minimalism:** No real auth (localStorage mock), no real DB (in-memory mock).
- **Communication:** No fluff. Code-first responses.

## Tech Stack
- Next.js 16 (App Router), TS Strict, Tailwind 4, shadcn/ui.
- Mock DB: `/lib/db/plants.ts`.

## Build Order (Update as you go)
- [x] 1. Types — `/types/index.ts`
- [ ] 2. Mock DB & Seed (3-4 plants: overdue, due today, future)
- [ ] 3. Utils (isDueForWatering, etc.)
- [ ] 4. Route handlers (/api/plants)
- [ ] 5. Auth Mock
- [ ] 6. Today screen
- [ ] 7. All Plants screen
- [ ] 8. Add/Edit form

## Finalizing Features
- When a feature is 100% complete:
  1. Update `current-state.json` with new paths/logic.
  2. Check off the item in this list.