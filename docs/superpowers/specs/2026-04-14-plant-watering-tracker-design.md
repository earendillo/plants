# Plant Watering Tracker — MVP Design Spec

**Date:** 2026-04-14  
**Status:** Approved

---

## 1. Overview

A personal plant care app. Users manage their plant collection and track watering and feeding schedules. MVP is single-user in practice but the data model carries `userId` from day one to support multi-user later without a migration.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript — strict mode, no `any` |
| Styling | Tailwind CSS v4 + shadcn/ui |
| API layer | Next.js Route Handlers (`/app/api/...`) |
| Data | In-memory mock store (`/lib/db/plants.ts`) |
| Auth | Mock only — `isAuthenticated` cookie + localStorage flag |
| Deployment | Vercel |

---

## 3. Visual Design

### Palette
- **Background:** `slate-50` (`#f8fafc`)
- **Cards/surfaces:** `white` with `slate-200` borders
- **Header bar:** `slate-900` (`#0f172a`) with `slate-50` text
- **Primary accent:** `green-600` (`#16a34a`) — buttons, active tab indicator, "Water" actions
- **Feed accent:** `yellow-700` (`#a16207`) — "Feed" actions
- **Status badges:**
  - Overdue: `red-100` bg / `red-500` text
  - Due today: `yellow-50` bg / `yellow-600` text
  - OK: `green-50` bg / `green-600` text

### Navigation
**Bottom tab bar** with three tabs: Today | Plants | Add.  
Active tab indicated by `green-600` top border + bold label.  
Tab bar: white background, `slate-200` top border.

### Typography
Geist Sans (already in scaffold). Slate-900 headings, slate-600 secondary text.

### Target viewport
Mobile-first, designed at iPhone 16 Pro width (393pt / ~475px CSS). Max-width `lg` for desktop.

---

## 4. Screens

### 4.1 Login (`/login`)
- Centered layout, large plant emoji + "PlantCare" wordmark
- Email + password inputs (any values accepted — mock auth)
- "Sign in" button (green-600)
- On submit: sets `isAuthenticated=true` in both `localStorage` and as a same-site cookie, sets `userId=user_1` in localStorage, redirects to `/today`
- Helper text: "Any email + password works"

### 4.2 Today (`/today`)
- Slate-900 header: date + "Today's care"
- Two sections: **Overdue** (red label) and **Due Today** (yellow label)
- Only plants that are overdue or due today appear here; plants due in future are not shown
- Each plant card: emoji, name, action label (e.g. "💧 Water — 3 days overdue"), action button
- A plant can have both a Water row and a Feed row — they appear as two separate action rows within the same card (or as two cards if only one action is due)
- On action button tap: POST to Route Handler → `router.refresh()` → card disappears
- Empty state: "All caught up! 🌿" message

### 4.3 All Plants (`/plants`)
- Slate-900 header: "My Plants" + count
- Full list of all plants regardless of status
- Each card: emoji, name, schedule summary ("Water every 7d · Feed every 30d"), status badge
- Badge shows the worst status across both watering and feeding (priority: Overdue > Due today > OK)
- Tapping a card navigates to `/plants/[id]` (Edit screen)

### 4.4 Add Plant (`/plants/new`)
- Form fields: Emoji (text input, single character), Name, Water every (days), Feed every (days)
- All fields required; Zod validation in the Route Handler
- "Save Plant" button (green-600) — POST `/api/plants` → redirect to `/plants`

### 4.5 Edit Plant (`/plants/[id]`)
- Same form as Add, pre-populated with existing values
- "Delete" button (red outline) in header — DELETE `/api/plants/[id]` → redirect to `/plants`
- "Save Changes" button — PUT `/api/plants/[id]` → redirect to `/plants`

---

## 5. Architecture & Data Flow

### Rendering strategy
- **Pages:** React Server Components by default. They fetch from `/lib/db/plants.ts` directly (server-side import — no HTTP round trip for reads).
- **Client islands:** Only the interactive leaf nodes use `"use client"`: water/feed action buttons, the plant form, delete button.
- **Mutations:** All writes go through Route Handlers. Client components `fetch()` the Route Handler, then call `router.refresh()` to trigger RSC re-render.

```
Initial page load:
  RSC page → imports /lib/db/plants.ts → renders HTML with data

User action (water / feed / add / edit / delete):
  Client component → fetch() Route Handler → /lib/db/plants.ts → 200
  → router.refresh() → RSC re-renders → UI updates
```

### Auth flow
- Login page writes `isAuthenticated=true` as a **same-site cookie** (readable by middleware) AND to `localStorage` (for client-side checks).
- `middleware.ts` runs on all routes except `/login`. Reads the cookie. If missing → redirect to `/login`.
- `userId` is hardcoded as `"user_1"` — Route Handlers read it from the `userId` cookie (set alongside `isAuthenticated` on login).
- TODO: Replace with real JWT / Supabase Auth session.

---

## 6. File Structure

```
/app
  /login/page.tsx               → Login form (client component)
  /page.tsx                     → Redirects to /today
  /today/page.tsx               → Today RSC + WaterFeedButtons client island
  /plants/page.tsx              → All Plants RSC
  /plants/new/page.tsx          → Add Plant form (client component)
  /plants/[id]/page.tsx         → Edit Plant form (client component)
  /api/plants/route.ts          → GET all, POST new
  /api/plants/[id]/route.ts     → GET one, PUT, DELETE
  /api/plants/[id]/water/route.ts  → POST mark watered
  /api/plants/[id]/feed/route.ts   → POST mark fed
/components
  /PlantCard.tsx                → Shared card used in Today + All Plants
  /PlantForm.tsx                → Shared form used in Add + Edit
  /BottomTabBar.tsx             → Tab bar client component
  /ActionButton.tsx             → Water/Feed button (client, calls Route Handler)
/components/ui                  → shadcn/ui primitives
/lib
  /db/plants.ts                 → In-memory mock — ALL db logic here
  /auth.ts                      → getUserId helper (reads cookie/header)
  /utils.ts                     → isDueForWatering, isDueForFeeding, daysUntilDue
/types/index.ts                 → Plant type
/middleware.ts                  → Auth redirect
```

---

## 7. Data Model

```typescript
type Plant = {
  id: string
  userId: string
  name: string
  emoji: string
  wateringIntervalDays: number
  feedingIntervalDays: number
  lastWateredAt: string | null   // ISO date string
  lastFedAt: string | null       // ISO date string
  createdAt: string
}
```

---

## 8. Mock DB

`/lib/db/plants.ts` is the single source of truth. No other file touches raw data.

```typescript
export async function getPlants(userId: string): Promise<Plant[]>
export async function getPlant(id: string, userId: string): Promise<Plant | null>
export async function createPlant(data: Omit<Plant, 'id' | 'createdAt'>): Promise<Plant>
export async function updatePlant(id: string, data: Partial<Plant>): Promise<Plant>
export async function deletePlant(id: string): Promise<void>
```

### Seed data (today = 2026-04-14)
| Plant | Emoji | Water interval | Last watered | Status |
|---|---|---|---|---|
| Monstera | 🌿 | 7d | 2026-04-07 | Overdue (7d ago) |
| Orchid | 🌸 | 5d | 2026-04-09 | Overdue (5d ago) |
| Pothos | 🪴 | 3d | 2026-04-14 | Due today |
| Cactus | 🌵 | 14d | 2026-04-09 | OK (5 days left) |

All seed plants use `userId: "user_1"`.

---

## 9. Utility Functions (`/lib/utils.ts`)

```typescript
// Returns true if plant needs watering today or is overdue
isDueForWatering(plant: Plant, today: Date): boolean

// Returns true if plant needs feeding today or is overdue
isDueForFeeding(plant: Plant, today: Date): boolean

// Negative = overdue by N days, 0 = due today, positive = days until due
daysUntilDue(lastActionAt: string | null, intervalDays: number, today: Date): number
```

Date logic never lives in components — always imported from `utils.ts`.

---

## 10. shadcn/ui Components to Install

Button, Input, Card, Badge, Dialog, Select, Label, Separator

---

## 11. Validation

All Route Handler inputs validated with Zod. Example for POST `/api/plants`:

```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().min(1).max(4),
  wateringIntervalDays: z.number().int().min(1).max(365),
  feedingIntervalDays: z.number().int().min(1).max(365),
  lastWateredAt: z.string().datetime().nullable(),
  lastFedAt: z.string().datetime().nullable(),
})
```

---

## 12. Build Order (from CLAUDE.md)

1. Types — `/types/index.ts`
2. Mock DB — `/lib/db/plants.ts` with seed data
3. Utils — `/lib/utils.ts`
4. Route Handlers — all `/api/plants/...` routes
5. Auth — login page + middleware
6. Today screen
7. All Plants screen
8. Add/Edit Plant form

Each step: build → `npm run lint` → fix errors → confirm before next step.

---

## 13. Out of Scope

- Push notifications
- Photo uploads (emoji only)
- Password reset / email verification
- Real authentication or database
- Tests
- Dark mode
