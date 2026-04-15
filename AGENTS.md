<!-- BEGIN:nextjs-agent-rules -->
# Next.js: ALWAYS read docs before coding
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated — the docs are the source of truth.
<!-- END:nextjs-agent-rules -->

# Project: Plant Watering Tracker

A personal plant care app. Users manage their plant collection and track
watering and feeding schedules. MVP is single-user but architecture must
support multiple users from day one.

## Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **API layer:** Next.js Route Handlers (`/app/api/...`)
- **Data:** In-memory mock store (`/lib/db/`) — swap for Supabase later
- **Auth:** Mock only — `isAuthenticated` flag in localStorage. Real JWT/Supabase Auth later.
- **Deployment:** Vercel

## Architecture
```
/app
  /login              → Login page (sets isAuthenticated)
  /page.tsx           → Redirects to /today if authenticated
  /today/page.tsx     → Plants due/overdue for watering or feeding
  /plants/page.tsx    → Full plant list
  /plants/new/page.tsx → Add plant form
  /plants/[id]/page.tsx → Edit plant form
  /api/plants/route.ts         → GET all, POST new
  /api/plants/[id]/route.ts    → GET one, PUT, DELETE
  /api/plants/[id]/water/route.ts → POST mark watered
  /api/plants/[id]/feed/route.ts  → POST mark fed
/components/ui        → shadcn/ui primitives
/components           → Feature components (PlantCard, PlantForm, etc.)
/lib
  /db/plants.ts       → In-memory mock — ALL db logic lives here
  /auth.ts            → isAuthenticated helper
  /utils.ts           → Date helpers, overdue calculations
/types/index.ts       → Shared TypeScript types
```

## Data Model
```typescript
type Plant = {
  id: string
  userId: string          // always set, even in mock — ready for multi-user
  name: string
  emoji: string           // no photo uploads in MVP, use emoji instead
  wateringIntervalDays: number
  feedingIntervalDays: number
  lastWateredAt: string | null   // ISO date string
  lastFedAt: string | null       // ISO date string
  createdAt: string
}
```

## Mock DB pattern
All data access goes through `/lib/db/plants.ts`. Nothing else imports
raw data — this is the only file to change when wiring up a real DB.

```typescript
// lib/db/plants.ts
const plants: Plant[] = []  // in-memory, resets on cold start — intentional for MVP

export async function getPlants(userId: string): Promise<Plant[]> {}
export async function getPlant(id: string, userId: string): Promise<Plant | null> {}
export async function createPlant(data: Omit<Plant, 'id' | 'createdAt'>): Promise<Plant> {}
export async function updatePlant(id: string, data: Partial<Plant>): Promise<Plant> {}
export async function deletePlant(id: string): Promise<void> {}
```

## Auth (mock)
- Login screen accepts any email + password, sets `isAuthenticated: true`
  and a hardcoded `userId: "user_1"` in localStorage
- A middleware or layout check redirects unauthenticated users to `/login`
- Do NOT implement real JWT or sessions — leave a clear TODO comment for later

## Code Style
- TypeScript strict mode — no `any`
- Named exports only — no default exports
- Tailwind utility classes — no custom CSS files
- Server Components by default — add `"use client"` only when needed
- Zod for all input validation in route handlers

## shadcn/ui components to install
Button, Input, Card, Badge, Dialog, Select, Label, Separator

## Commands
```bash
npm run dev     # Start dev server (port 3000)
npm run build   # Production build
npm run lint    # ESLint
```

## Rules
- NEVER commit `.env` files
- NEVER use `any` type
- NEVER bypass the `/lib/db/plants.ts` abstraction for data access
- Every plant MUST have a `userId` — even in the mock
- Keep overdue/due-soon logic in `/lib/utils.ts`, not in components

## Out of scope for MVP
- Push notifications
- Photo uploads (use emoji)
- Password reset / email verification
- Real authentication
- Real database
- Tests