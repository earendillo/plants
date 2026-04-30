@AGENTS.md

# Claude-specific notes
- current-state.json is the memory file for AI agents for quick refreshing the knowledge about the current state of the project

## Workflow
- Build one screen at a time, confirm before moving to the next
- After each screen is done, run `npm run lint` and fix any errors before continuing
- Ask before installing any package not already in the stack
- Keep components small — if a file exceeds 150 lines, split it
- When the feature is complete, update current-state.md and current-state.json files.

## Current MVP build order
Work through these in sequence. Check off as you go.

- [ ] 1. Types — `/types/index.ts` with `Plant` type
- [ ] 2. Mock DB — `/lib/db/plants.ts` with all CRUD functions + seed data (3-4 sample plants)
- [ ] 3. Utils — `/lib/utils.ts` with `isDueForWatering`, `isDueForFeeding`, `daysUntilDue`
- [ ] 4. Route handlers — all `/api/plants/...` routes wired to mock DB
- [ ] 5. Auth — login page + localStorage flag + middleware redirect
- [ ] 6. Today screen — overdue/due plants with mark-as-done buttons
- [ ] 7. All Plants screen — full list with status badges
- [ ] 8. Add/Edit plant form

## Seed data
Include 3-4 hardcoded plants in the mock DB so the app is immediately usable:
- A plant overdue for watering
- A plant due today
- A plant not due for a few days
This makes every screen testable from the first run.

## What NOT to do
- Don't implement real auth — just the localStorage flag with a TODO comment
- Don't add a database — mock only
- Don't add pages or features not listed above
- Don't use default exports
- Don't generate placeholder lorem ipsum — leave a TODO if copy is needed