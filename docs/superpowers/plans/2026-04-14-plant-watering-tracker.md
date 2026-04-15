# Plant Watering Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first plant care MVP with 5 screens (Login, Today, All Plants, Add Plant, Edit Plant) backed by an in-memory mock store and Next.js Route Handlers.

**Architecture:** RSC pages read data directly from `/lib/db/plants.ts` at render time (no HTTP for reads). Client islands (buttons, forms) POST/PUT/DELETE to Route Handlers, then call `router.refresh()` to trigger an RSC re-render. Middleware reads an `isAuthenticated` cookie to protect all routes.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Zod · In-memory mock DB

---

## File Map

| File | Role |
|------|------|
| `types/index.ts` | `Plant` type — shared across the whole app |
| `lib/db/plants.ts` | In-memory store + all CRUD functions + seed data |
| `lib/utils.ts` | `cn` (shadcn) + `daysUntilDue`, `isDueForWatering`, `isDueForFeeding` |
| `lib/auth.ts` | `MOCK_USER_ID` constant + TODO comment for real auth |
| `middleware.ts` | Cookie-based auth redirect |
| `app/layout.tsx` | Root layout — Geist font, `bg-slate-50`, "PlantCare" title |
| `app/page.tsx` | Redirect to `/today` |
| `app/login/page.tsx` | Login form — sets cookies + localStorage, redirects to `/today` |
| `app/today/page.tsx` | RSC — Today screen, reads DB directly |
| `app/plants/page.tsx` | RSC — All Plants screen, reads DB directly |
| `app/plants/new/page.tsx` | RSC shell — renders `PlantForm` with no initial data |
| `app/plants/[id]/page.tsx` | RSC — fetches plant, renders `PlantForm` with data |
| `app/api/plants/route.ts` | GET all, POST new |
| `app/api/plants/[id]/route.ts` | GET one, PUT, DELETE |
| `app/api/plants/[id]/water/route.ts` | POST mark watered |
| `app/api/plants/[id]/feed/route.ts` | POST mark fed |
| `components/BottomTabBar.tsx` | `"use client"` — tab bar with `usePathname` for active state |
| `components/ActionButton.tsx` | `"use client"` — Water/Feed button, POSTs then calls `router.refresh()` |
| `components/DueCard.tsx` | RSC — single plant action card for Today screen |
| `components/PlantCard.tsx` | RSC — plant row for All Plants screen with status badge |
| `components/PlantForm.tsx` | `"use client"` — shared Add/Edit form |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm install)
- Create: `components.json` (shadcn config)
- Create: `components/ui/` (shadcn primitives)
- Modify: `app/globals.css` (shadcn CSS variables added)
- Create: `lib/utils.ts` (shadcn creates this with `cn`)

- [ ] **Step 1: Install Zod**

```bash
npm install zod
```

Expected: `node_modules/zod` created, `package.json` updated.

- [ ] **Step 2: Initialise shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted, use these answers:
- Style → **Default**
- Base color → **Slate**
- CSS variables → **Yes**

shadcn will detect Tailwind v4 (no `tailwind.config.js`) and configure itself via CSS. It creates `components/ui/`, `lib/utils.ts` (with the `cn` helper), and adds CSS variables to `app/globals.css`.

- [ ] **Step 3: Add shadcn components**

```bash
npx shadcn@latest add button input card badge label separator
```

Expected: files created under `components/ui/button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`, `label.tsx`, `separator.tsx`.

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000`. You should see the default Next.js scaffold page without errors. Stop the server (`Ctrl+C`).

---

## Task 2: Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create the Plant type**

```typescript
// types/index.ts
export type Plant = {
  id: string
  userId: string
  name: string
  emoji: string
  wateringIntervalDays: number
  feedingIntervalDays: number
  lastWateredAt: string | null  // ISO date string, e.g. "2026-04-14"
  lastFedAt: string | null      // ISO date string
  createdAt: string             // ISO date string
}
```

- [ ] **Step 2: Verify TypeScript accepts the file**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Mock DB

**Files:**
- Create: `lib/db/plants.ts`

- [ ] **Step 1: Write the mock DB module**

```typescript
// lib/db/plants.ts
import { Plant } from '@/types'

// In-memory store — intentionally resets on cold start for MVP
// TODO: Replace with Supabase client when ready
const store: Plant[] = [
  {
    id: 'seed-1',
    userId: 'user_1',
    name: 'Monstera',
    emoji: '🌿',
    wateringIntervalDays: 7,
    feedingIntervalDays: 30,
    lastWateredAt: '2026-04-04',  // 10 days ago → 3d overdue (interval 7d)
    lastFedAt: '2026-03-01',      // 44 days ago → 14d overdue (interval 30d)
    createdAt: '2026-01-01',
  },
  {
    id: 'seed-2',
    userId: 'user_1',
    name: 'Orchid',
    emoji: '🌸',
    wateringIntervalDays: 5,
    feedingIntervalDays: 14,
    lastWateredAt: '2026-04-05',  // 9 days ago → 4d overdue (interval 5d)
    lastFedAt: '2026-04-07',      // 7 days ago → 7d remaining (interval 14d)
    createdAt: '2026-01-15',
  },
  {
    id: 'seed-3',
    userId: 'user_1',
    name: 'Pothos',
    emoji: '🪴',
    wateringIntervalDays: 3,
    feedingIntervalDays: 14,
    lastWateredAt: '2026-04-11',  // 3 days ago → due today (interval 3d)
    lastFedAt: '2026-03-31',      // 14 days ago → due today (interval 14d)
    createdAt: '2026-02-01',
  },
  {
    id: 'seed-4',
    userId: 'user_1',
    name: 'Cactus',
    emoji: '🌵',
    wateringIntervalDays: 14,
    feedingIntervalDays: 60,
    lastWateredAt: '2026-04-09',  // 5 days ago → 9d remaining (interval 14d)
    lastFedAt: '2026-03-01',      // 44 days ago → 16d remaining (interval 60d)
    createdAt: '2026-02-15',
  },
]

export async function getPlants(userId: string): Promise<Plant[]> {
  return store.filter(p => p.userId === userId)
}

export async function getPlant(id: string, userId: string): Promise<Plant | null> {
  return store.find(p => p.id === id && p.userId === userId) ?? null
}

export async function createPlant(
  data: Omit<Plant, 'id' | 'createdAt'>
): Promise<Plant> {
  const plant: Plant = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  store.push(plant)
  return plant
}

export async function updatePlant(
  id: string,
  data: Partial<Plant>
): Promise<Plant> {
  const idx = store.findIndex(p => p.id === id)
  if (idx === -1) throw new Error(`Plant ${id} not found`)
  store[idx] = { ...store[idx], ...data }
  return store[idx]
}

export async function deletePlant(id: string): Promise<void> {
  const idx = store.findIndex(p => p.id === id)
  if (idx !== -1) store.splice(idx, 1)
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: Utilities

**Files:**
- Modify: `lib/utils.ts` (add plant utilities below the shadcn `cn` export)

`lib/utils.ts` already exists from shadcn init. It contains the `cn` helper. Open it and append the plant utilities below the existing content.

- [ ] **Step 1: Read the current lib/utils.ts to see what shadcn generated**

Open `lib/utils.ts`. It will look like:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Append plant utilities to lib/utils.ts**

Add the following below the existing `cn` export:

```typescript
import { Plant } from '@/types'

/**
 * Returns how many days until an action is due.
 * Negative = overdue by N days, 0 = due today, positive = days remaining.
 * If lastActionAt is null, treats the plant as maximally overdue.
 */
export function daysUntilDue(
  lastActionAt: string | null,
  intervalDays: number,
  today: Date
): number {
  if (!lastActionAt) return -intervalDays
  const last = new Date(lastActionAt)
  // Compare dates at UTC midnight to avoid timezone drift
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const lastMs = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())
  const daysSince = Math.floor((todayMs - lastMs) / 86_400_000)
  return intervalDays - daysSince
}

/** True if plant needs watering today or is overdue. */
export function isDueForWatering(plant: Plant, today: Date): boolean {
  return daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today) <= 0
}

/** True if plant needs feeding today or is overdue. */
export function isDueForFeeding(plant: Plant, today: Date): boolean {
  return daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today) <= 0
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 5: Route Handlers

**Files:**
- Create: `app/api/plants/route.ts`
- Create: `app/api/plants/[id]/route.ts`
- Create: `app/api/plants/[id]/water/route.ts`
- Create: `app/api/plants/[id]/feed/route.ts`

- [ ] **Step 1: Create GET all / POST new handler**

```typescript
// app/api/plants/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPlants, createPlant } from '@/lib/db/plants'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().min(1).max(4),
  wateringIntervalDays: z.number().int().min(1).max(365),
  feedingIntervalDays: z.number().int().min(1).max(365),
  lastWateredAt: z.string().nullable(),
  lastFedAt: z.string().nullable(),
})

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plants = await getPlants(userId)
  return Response.json(plants)
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const body: unknown = await request.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 })
  }
  const plant = await createPlant({ ...result.data, userId })
  return Response.json(plant, { status: 201 })
}
```

- [ ] **Step 2: Create GET one / PUT / DELETE handler**

```typescript
// app/api/plants/[id]/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPlant, updatePlant, deletePlant } from '@/lib/db/plants'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  emoji: z.string().min(1).max(4).optional(),
  wateringIntervalDays: z.number().int().min(1).max(365).optional(),
  feedingIntervalDays: z.number().int().min(1).max(365).optional(),
  lastWateredAt: z.string().nullable().optional(),
  lastFedAt: z.string().nullable().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plant = await getPlant(id, userId)
  if (!plant) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(plant)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const existing = await getPlant(id, userId)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const body: unknown = await request.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 })
  }
  const updated = await updatePlant(id, result.data)
  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const existing = await getPlant(id, userId)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  await deletePlant(id)
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 3: Create mark-watered handler**

```typescript
// app/api/plants/[id]/water/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getPlant, updatePlant } from '@/lib/db/plants'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plant = await getPlant(id, userId)
  if (!plant) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await updatePlant(id, { lastWateredAt: new Date().toISOString() })
  return Response.json(updated)
}
```

- [ ] **Step 4: Create mark-fed handler**

```typescript
// app/api/plants/[id]/feed/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getPlant, updatePlant } from '@/lib/db/plants'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plant = await getPlant(id, userId)
  if (!plant) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await updatePlant(id, { lastFedAt: new Date().toISOString() })
  return Response.json(updated)
}
```

- [ ] **Step 5: Smoke-test the API**

Start the dev server (`npm run dev`), then in a second terminal:

```bash
curl http://localhost:3000/api/plants
```

Expected: JSON array with 4 seed plants. Stop the server.

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: no errors. Fix any before continuing.

---

## Task 6: Auth — middleware + login page

**Files:**
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create auth constants**

```typescript
// lib/auth.ts
// TODO: Replace MOCK_USER_ID with real JWT / Supabase Auth session
export const MOCK_USER_ID = 'user_1'
```

- [ ] **Step 2: Create middleware**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated =
    request.cookies.get('isAuthenticated')?.value === 'true'

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Protect all routes except /login and Next.js internals
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 3: Update root layout**

Replace the entire contents of `app/layout.tsx`:

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlantCare',
  description: 'Track your plant watering and feeding schedule',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Update root page to redirect**

Replace the entire contents of `app/page.tsx`:

```typescript
// app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/today')
}
```

- [ ] **Step 5: Create login page**

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Replace with real JWT / Supabase Auth — any credentials are accepted
    document.cookie = 'isAuthenticated=true; path=/; samesite=lax'
    document.cookie = 'userId=user_1; path=/; samesite=lax'
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userId', 'user_1')
    router.push('/today')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl">🌿</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">PlantCare</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your plants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 active:bg-green-800"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Any email + password works
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Test auth flow**

```bash
npm run dev
```

1. Open `http://localhost:3000`. Should redirect to `/login`.
2. Enter any email + password, click Sign in.
3. Should redirect to `/today` (page will error — that's OK, it's not built yet).
4. Refresh `/login` when already authenticated — should redirect to `/today`.

Stop the server.

- [ ] **Step 7: Run lint**

```bash
npm run lint
```

Expected: no errors. Fix any before continuing.

---

## Task 7: Bottom tab bar + shared layout wrapper

**Files:**
- Create: `components/BottomTabBar.tsx`

- [ ] **Step 1: Create the bottom tab bar**

```typescript
// components/BottomTabBar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/today', label: 'Today', emoji: '💧' },
  { href: '/plants', label: 'Plants', emoji: '🌱' },
  { href: '/plants/new', label: 'Add', emoji: '➕' },
] as const

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-white">
      {TABS.map(tab => {
        const isActive =
          tab.href === '/plants'
            ? pathname.startsWith('/plants/') && pathname !== '/plants/new'
            : pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              'flex flex-1 flex-col items-center pb-3 pt-2 text-xs font-medium border-t-2',
              isActive
                ? 'border-green-600 text-green-600'
                : 'border-slate-200 text-slate-400',
            ].join(' ')}
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className="mt-1">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

---

## Task 8: Today screen

**Files:**
- Create: `components/ActionButton.tsx`
- Create: `components/DueCard.tsx`
- Create: `app/today/page.tsx`

- [ ] **Step 1: Create ActionButton client component**

```typescript
// components/ActionButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  plantId: string
  action: 'water' | 'feed'
}

export function ActionButton({ plantId, action }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await fetch(`/api/plants/${plantId}/${action}`, { method: 'POST' })
    router.refresh()
    // setLoading(false) is intentionally omitted — the RSC refresh
    // will unmount this component once the card disappears
  }

  const isWater = action === 'water'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={[
        'rounded-lg px-4 py-2 text-sm font-semibold text-white',
        'disabled:opacity-50 transition-opacity',
        isWater
          ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          : 'bg-yellow-700 hover:bg-yellow-800 active:bg-yellow-900',
      ].join(' ')}
    >
      {loading ? '…' : isWater ? 'Water' : 'Feed'}
    </button>
  )
}
```

- [ ] **Step 2: Create DueCard server component**

```typescript
// components/DueCard.tsx
import { Plant } from '@/types'
import { ActionButton } from '@/components/ActionButton'

type Props = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number  // negative = overdue, 0 = due today
}

export function DueCard({ plant, action, daysUntil }: Props) {
  const isOverdue = daysUntil < 0
  const overdueDays = Math.abs(daysUntil)

  const actionLabel =
    action === 'water'
      ? isOverdue
        ? `💧 Water — ${overdueDays}d overdue`
        : '💧 Water due today'
      : isOverdue
        ? `🌿 Feed — ${overdueDays}d overdue`
        : '🌿 Feed due today'

  return (
    <div
      className={[
        'flex items-center gap-4 rounded-xl border bg-white p-4',
        isOverdue ? 'border-red-200' : 'border-slate-200',
      ].join(' ')}
    >
      <span className="text-3xl leading-none">{plant.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{plant.name}</p>
        <p
          className={[
            'mt-0.5 text-sm',
            isOverdue ? 'text-red-500' : 'text-green-600',
          ].join(' ')}
        >
          {actionLabel}
        </p>
      </div>
      <ActionButton plantId={plant.id} action={action} />
    </div>
  )
}
```

- [ ] **Step 3: Create Today page**

```typescript
// app/today/page.tsx
import { cookies } from 'next/headers'
import { getPlants } from '@/lib/db/plants'
import { isDueForWatering, isDueForFeeding, daysUntilDue } from '@/lib/utils'
import { BottomTabBar } from '@/components/BottomTabBar'
import { DueCard } from '@/components/DueCard'
import { Plant } from '@/types'

type DueItem = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number
}

export default async function TodayPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plants = await getPlants(userId)
  const today = new Date()

  const dueItems: DueItem[] = []
  for (const plant of plants) {
    if (isDueForWatering(plant, today)) {
      dueItems.push({
        plant,
        action: 'water',
        daysUntil: daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today),
      })
    }
    if (isDueForFeeding(plant, today)) {
      dueItems.push({
        plant,
        action: 'feed',
        daysUntil: daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today),
      })
    }
  }

  const overdue = dueItems.filter(item => item.daysUntil < 0)
  const dueToday = dueItems.filter(item => item.daysUntil === 0)

  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <p className="text-sm text-slate-400">{dateStr}</p>
        <h1 className="mt-0.5 text-2xl font-bold">Today's care</h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-28">
        {dueItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl">🌿</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">All caught up!</p>
            <p className="mt-1 text-sm text-slate-400">
              Your plants are all taken care of.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-red-500">
                  Overdue
                </h2>
                <div className="space-y-3">
                  {overdue.map(item => (
                    <DueCard
                      key={`${item.plant.id}-${item.action}`}
                      plant={item.plant}
                      action={item.action}
                      daysUntil={item.daysUntil}
                    />
                  ))}
                </div>
              </section>
            )}
            {dueToday.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-600">
                  Due Today
                </h2>
                <div className="space-y-3">
                  {dueToday.map(item => (
                    <DueCard
                      key={`${item.plant.id}-${item.action}`}
                      plant={item.plant}
                      action={item.action}
                      daysUntil={item.daysUntil}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 4: Manually test Today screen**

```bash
npm run dev
```

1. Go to `http://localhost:3000/login`, sign in.
2. Should land on `/today`.
3. Verify you see "Overdue" section with Monstera (water + feed) and Orchid (water).
4. Verify "Due Today" section with Pothos (water + feed).
5. Click a Water button — card should disappear after a moment.
6. Tab bar should show Today as active.

Stop the server.

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: no errors. Fix any before continuing.

---

## Task 9: All Plants screen

**Files:**
- Create: `components/PlantCard.tsx`
- Create: `app/plants/page.tsx`

- [ ] **Step 1: Create PlantCard component**

```typescript
// components/PlantCard.tsx
import Link from 'next/link'
import { Plant } from '@/types'
import { daysUntilDue } from '@/lib/utils'

type Props = {
  plant: Plant
  today: Date
}

type Status = 'overdue' | 'due-today' | 'ok'

function getWorstStatus(plant: Plant, today: Date): Status {
  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const worst = Math.min(waterDays, feedDays)
  if (worst < 0) return 'overdue'
  if (worst === 0) return 'due-today'
  return 'ok'
}

const BADGE: Record<Status, { classes: string; label: (days: number) => string }> = {
  overdue: {
    classes: 'bg-red-100 text-red-500',
    label: () => 'Overdue',
  },
  'due-today': {
    classes: 'bg-yellow-50 text-yellow-600',
    label: () => 'Due today',
  },
  ok: {
    classes: 'bg-green-50 text-green-600',
    label: days => `OK — ${days}d`,
  },
}

export function PlantCard({ plant, today }: Props) {
  const status = getWorstStatus(plant, today)
  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const bestDays = Math.min(waterDays, feedDays)
  const badge = BADGE[status]

  return (
    <Link href={`/plants/${plant.id}`} className="block">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50">
        <span className="text-3xl leading-none">{plant.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{plant.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Water every {plant.wateringIntervalDays}d · Feed every {plant.feedingIntervalDays}d
          </p>
        </div>
        <span
          className={[
            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
            badge.classes,
          ].join(' ')}
        >
          {badge.label(bestDays)}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create All Plants page**

```typescript
// app/plants/page.tsx
import { cookies } from 'next/headers'
import { getPlants } from '@/lib/db/plants'
import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantCard } from '@/components/PlantCard'

export default async function PlantsPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plants = await getPlants(userId)
  const today = new Date()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <h1 className="text-2xl font-bold">My Plants</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {plants.length} plant{plants.length !== 1 ? 's' : ''}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 pb-28 space-y-3">
        {plants.length === 0 ? (
          <p className="py-16 text-center text-slate-400">
            No plants yet — add your first one!
          </p>
        ) : (
          plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} today={today} />
          ))
        )}
      </main>

      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 3: Manually test All Plants screen**

```bash
npm run dev
```

1. Go to `/plants`.
2. Verify all 4 seed plants are listed with correct status badges:
   - Monstera → Overdue
   - Orchid → Overdue
   - Pothos → Due today
   - Cactus → OK — 9d
3. Tap a plant card — should navigate to `/plants/[id]` (will 404 for now — that's OK).
4. Plants tab should be active in the tab bar.

Stop the server.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors. Fix any before continuing.

---

## Task 10: Add/Edit Plant form

**Files:**
- Create: `components/PlantForm.tsx`
- Create: `app/plants/new/page.tsx`
- Create: `app/plants/[id]/page.tsx`

- [ ] **Step 1: Create PlantForm client component**

```typescript
// components/PlantForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plant } from '@/types'

type Props = {
  plant?: Plant
}

export function PlantForm({ plant }: Props) {
  const router = useRouter()
  const [emoji, setEmoji] = useState(plant?.emoji ?? '🌿')
  const [name, setName] = useState(plant?.name ?? '')
  const [waterDays, setWaterDays] = useState(
    String(plant?.wateringIntervalDays ?? 7)
  )
  const [feedDays, setFeedDays] = useState(
    String(plant?.feedingIntervalDays ?? 30)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = {
      emoji,
      name,
      wateringIntervalDays: parseInt(waterDays, 10),
      feedingIntervalDays: parseInt(feedDays, 10),
      lastWateredAt: plant?.lastWateredAt ?? null,
      lastFedAt: plant?.lastFedAt ?? null,
    }

    const res = await fetch(
      plant ? `/api/plants/${plant.id}` : '/api/plants',
      {
        method: plant ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    setLoading(false)

    if (res.ok) {
      router.push('/plants')
      router.refresh()
    } else {
      setError('Failed to save. Please try again.')
    }
  }

  async function handleDelete() {
    if (!plant) return
    setLoading(true)
    await fetch(`/api/plants/${plant.id}`, { method: 'DELETE' })
    router.push('/plants')
    router.refresh()
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 ' +
    'placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="emoji" className="block text-sm font-medium text-slate-700">
          Emoji
        </label>
        <input
          id="emoji"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          required
          maxLength={4}
          className="mt-1 w-16 rounded-lg border border-slate-200 px-3 py-3 text-center text-2xl focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Plant name
        </label>
        <input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
          placeholder="e.g. Monstera"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="waterDays"
          className="block text-sm font-medium text-slate-700"
        >
          Water every (days)
        </label>
        <input
          id="waterDays"
          type="number"
          value={waterDays}
          onChange={e => setWaterDays(e.target.value)}
          required
          min={1}
          max={365}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="feedDays"
          className="block text-sm font-medium text-slate-700"
        >
          Feed every (days)
        </label>
        <input
          id="feedDays"
          type="number"
          value={feedDays}
          onChange={e => setFeedDays(e.target.value)}
          required
          min={1}
          max={365}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-600 py-4 text-base font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50"
      >
        {loading ? 'Saving…' : plant ? 'Save Changes' : 'Save Plant'}
      </button>

      {plant && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="w-full rounded-lg border border-red-300 py-3 text-base font-semibold text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
        >
          Delete Plant
        </button>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Create Add Plant page**

```typescript
// app/plants/new/page.tsx
import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantForm } from '@/components/PlantForm'

export default function NewPlantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <h1 className="text-2xl font-bold">Add Plant</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28">
        <PlantForm />
      </main>
      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 3: Create Edit Plant page**

```typescript
// app/plants/[id]/page.tsx
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPlant } from '@/lib/db/plants'
import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantForm } from '@/components/PlantForm'

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? 'user_1'
  const plant = await getPlant(id, userId)

  if (!plant) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <h1 className="text-2xl font-bold">Edit Plant</h1>
      </header>
      <main className="flex-1 px-4 py-6 pb-28">
        <PlantForm plant={plant} />
      </main>
      <BottomTabBar />
    </div>
  )
}
```

- [ ] **Step 4: Manually test Add Plant**

```bash
npm run dev
```

1. Go to `/plants/new` (tap Add tab).
2. Fill in emoji, name, water days, feed days. Submit.
3. Should redirect to `/plants` and new plant appears in list.

- [ ] **Step 5: Manually test Edit Plant**

1. On `/plants`, tap any plant card.
2. Should navigate to `/plants/[id]` with form pre-filled.
3. Change the name, Save Changes. Should redirect to `/plants` with updated name.
4. Tap a plant card again, click Delete Plant. Should redirect to `/plants` with plant gone.

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 7: Final smoke test — full golden path**

1. Clear cookies (DevTools → Application → Cookies → Delete all).
2. Go to `http://localhost:3000`. Should redirect to `/login`.
3. Sign in → lands on `/today`.
4. Water a plant → card disappears.
5. Go to Plants tab → all plants listed with correct badges.
6. Tap Cactus → edit page with pre-filled values.
7. Change water interval → save → back on Plants, interval updated.
8. Tap Add tab → add a new plant → appears in All Plants.
9. Tap the new plant → Delete → gone from list.
10. Go to Today → empty state if nothing left due.

- [ ] **Step 8: Final lint**

```bash
npm run lint
```

Expected: no errors. MVP complete.

---

## Self-review notes

**Spec coverage check:**
- ✅ `/types/index.ts` — Task 2
- ✅ `/lib/db/plants.ts` with seed data — Task 3
- ✅ `/lib/utils.ts` with all 3 functions — Task 4
- ✅ All 4 Route Handler files — Task 5
- ✅ Auth (login page + middleware) — Task 6
- ✅ Today screen with overdue/due-today sections + empty state — Task 8
- ✅ All Plants screen with status badges + count — Task 9
- ✅ Add Plant form + Edit Plant form with delete — Task 10
- ✅ Bottom tab bar — Task 7
- ✅ `router.refresh()` after every mutation — ActionButton, PlantForm
- ✅ Badge priority (overdue > due-today > ok) — PlantCard `getWorstStatus`
- ✅ Water/Feed as separate DueCard rows — Today page `dueItems` loop
- ✅ Zod validation on all POST/PUT route handlers — Task 5
- ✅ `userId` read from cookie in all Route Handlers — Task 5
- ✅ Middleware protects all routes except `/login` — Task 6

**Type consistency:**
- `Plant` defined in `types/index.ts`, imported everywhere
- `daysUntilDue(lastActionAt, intervalDays, today)` — same signature throughout
- `params` awaited as `Promise<{ id: string }>` in all `[id]` route handlers and `[id]` page
- `cookies()` awaited with `await cookies()` throughout
