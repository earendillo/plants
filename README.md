# LeafMo

Plant watering & feeding tracker with shared gardens. Production: [leafmo.app](https://leafmo.app).

## Features
- Interval-based watering/feeding schedule with a **Today** view of due plants
- Multiple gardens per user, optional plant groups inside a garden
- Garden sharing: member invite links (`owner` / `limited_editor`) and anonymous guest links (guests can water only)
- Activity history per plant (who watered/fed and when)
- Email/password + Google OAuth, password reset, account deletion
- English and Polish UI

## Stack
Next.js 16 (App Router) · TypeScript (strict) · Supabase (Postgres + RLS, Auth, `@supabase/ssr`) · Tailwind CSS 4 + shadcn/ui · next-intl 4 · TanStack React Query 5 · Zod 4

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   | Variable | Purpose |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin operations (account deletion) |
   | `SUPABASE_JWT_SECRET` | Signing guest access tokens |
   | `SUPABASE_PROJECT_ID` | Only for `npm run update-types` |
3. Link the Supabase CLI: `npx supabase login` and `npx supabase link --project-ref <project-ref>`
4. `npm run dev` → http://localhost:3000

## Scripts
| Script | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run update-types` | Regenerate `types/supabase.ts` from the linked project |

## Project layout
- `app/` — routes (`(authenticated)/` pages, `api/` route handlers, auth/guest/share pages)
- `components/` — UI components (`components/ui/` = shadcn primitives)
- `lib/db/` — the only data-access layer; maps snake_case DB rows ↔ camelCase types
- `types/index.ts` — frontend types · `types/supabase.ts` — generated DB types
- `supabase/migrations/` — SQL migrations
- `messages/{en,pl}.json` — translations
- `docs/superpowers/` — design specs and implementation plans

## Contributing / agents
Read `AGENTS.md` (rules, DB migration workflow) and `current-state.json` (architecture map) before making changes.
