# Agent Rules: Plant Watering Tracker

## Sources of Truth
1. **State:** Always read `current-state.json` for progress/arch map.
2. **Types:** Read `/types/index.ts` before implementing logic.
3. **Next.js:** If unsure about App Router patterns, check `node_modules/next/dist/docs/`.

## Coding Standards
- **Strict TS:** Named exports only. No `any`. 
- **Validation:** Use Zod for all API route inputs.
- **Data Access:** ONLY via `/lib/db/` abstraction.
- **Auth:** Mock mode. Use `localStorage` + `userId: "user_1"`.

## Communication
- Be concise. Code over explanations.
- If a file exceeds 150 lines, suggest a split.