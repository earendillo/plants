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

## Strict Database Migration Workflow
This project is in rapid development. The database schema changes frequently. 
Whenever you create a migration, modify a table, add an RPC, or change RLS policies, you MUST execute the following loop:

1. **Sync DB Types:** Run `npm run update-types` to overwrite `types/supabase.ts` with the new schema. After running npm run update-types, refresh your context by re-reading types/supabase.ts to sync your knowledge with the latest database schema.
2. **Review Changes:** Inspect the diff in `types/supabase.ts` to see what actually changed in the `snake_case` definitions.
3. **Update Frontend Types:** If the schema change introduces new columns or modifies existing ones, update the corresponding `camelCase` models in `types/index.ts`.
4. **Fix Mappers:** Update the mapping functions inside `/lib/db/` to correctly translate the new `snake_case` DB fields to the updated `camelCase` Frontend types.
5. **Verify:** Run `npx tsc --noEmit` to guarantee the translation layer is intact and no UI components are broken.