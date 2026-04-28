# Plant Watering Tracker — Current State

> AI-readable snapshot of the project as of 2026-04-28.

## Overview

Personal plant care web app for tracking watering and feeding schedules. Started as a single-user MVP with mock data, now runs on real Supabase (auth + PostgreSQL) with multi-user garden sharing.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (base-ui) |
| Database | Supabase PostgreSQL with Row Level Security |
| Auth | Supabase Auth (email/password, Google OAuth) |
| Validation | Zod 4 |
| i18n | next-intl 4 |
| Icons | lucide-react, @heroicons/react |
| Deployment target | Vercel |

## Data Model

### Tables

**plants** — id, user_id, garden_id, name, emoji, watering_interval_days, feeding_interval_days, last_watered_at (timestamptz), last_fed_at (timestamptz), created_at

**gardens** — id, name, owner_id (FK to auth.users), created_at. UNIQUE(owner_id, name).

**garden_members** — garden_id, user_id, role (`owner` | `limited_editor`), created_at

**garden_share_links** — id, garden_id, token (UUID), role, created_by, created_at, revoked_at, expires_at

### TypeScript Types (`/types/index.ts`)

- `Plant` — camelCase mirror of plants table
- `Garden` — id, name, userId (mapped from owner_id), createdAt, role (derived from membership)

## Auth

Real Supabase Auth, not mock. Supports:
- Email/password sign-up and sign-in
- Google OAuth
- Password reset via email (`/forgot-password` → `/auth/set-password`)
- Session managed via JWT cookies (SSR-compatible with `@supabase/ssr`)

Auth callback route: `/auth/callback` (exchanges code for session).

## Middleware (`middleware.ts`)

- Runs on all non-static requests
- Unauthenticated users → redirect to `/login?next=<original-path>`
- Authenticated users hitting `/login` → redirect to `/today`
- Public paths: `/login`, `/forgot-password`, `/auth/*`, `/_next/*`, `/share/*`
- Refreshes session cookies on every request

## Pages

| Route | Purpose | Auth required |
|-------|---------|--------------|
| `/` | Redirects to `/today` | yes |
| `/login` | Sign in / sign up (email + Google) | no |
| `/forgot-password` | Request password reset email | no |
| `/auth/set-password` | Set new password after reset | no |
| `/auth/callback` | OAuth/magic-link code exchange | no |
| `/today` | Dashboard: plants due/overdue for watering or feeding | yes |
| `/plants` | Full plant list for active garden | yes |
| `/plants/new` | Create plant form (garden owners only) | yes |
| `/plants/[id]` | Edit plant form (garden owners only) | yes |
| `/share/[token]` | Accept garden share invitation | yes |

## API Routes

### Plants

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/plants?gardenId=<id>` | owner or member | List plants in garden |
| POST | `/api/plants` | garden owner | Create plant (Zod-validated) |
| GET | `/api/plants/[id]` | owner or member | Get single plant |
| PUT | `/api/plants/[id]` | garden owner | Update plant |
| DELETE | `/api/plants/[id]` | garden owner | Delete plant |
| POST | `/api/plants/[id]/water` | owner or member | Mark watered (RPC `water_plant`) |
| POST | `/api/plants/[id]/feed` | owner or member | Mark fed (RPC `feed_plant`) |

### Gardens

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/gardens` | authenticated | List owned + shared gardens |
| POST | `/api/gardens` | authenticated | Create garden |
| PATCH | `/api/gardens/[id]` | garden owner | Rename garden |
| DELETE | `/api/gardens/[id]` | garden owner | Delete garden (must be empty, can't delete last) |
| GET | `/api/gardens/[id]/share-link` | garden owner | Get active share URL |
| POST | `/api/gardens/[id]/share-link` | garden owner | Create or rotate share link |
| DELETE | `/api/gardens/[id]/share-link` | garden owner | Revoke all share links |
| DELETE | `/api/gardens/[id]/membership` | non-owner member | Leave shared garden |

### Share

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/share/[token]/accept` | authenticated | Accept share link → become garden member |

## Garden Sharing & Roles

Two roles enforced at both RLS and application level:

- **Owner** — full CRUD on plants, manage share links, rename/delete garden
- **Limited Editor** — view plants, mark watered/fed only. Cannot create/edit/delete plants or manage garden settings. Can leave the garden.

Share flow: owner generates link → recipient visits `/share/[token]` → POST to accept → RPC `accept_garden_share_link(token)` creates membership row.

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PlantCard` | `/components/PlantCard.tsx` | Plant list item with status badge, emoji, schedule. `canEdit` prop gates click-to-edit. |
| `PlantForm` | `/components/PlantForm.tsx` | Create/edit form with garden selector |
| `PlantFormFields` | `/components/PlantFormFields.tsx` | Reusable form fields (name, emoji, intervals, garden dropdown) |
| `DueCard` | `/components/DueCard.tsx` | Action card for today screen (water/feed buttons) |
| `ActionButton` | `/components/ActionButton.tsx` | Client component for water/feed quick actions |
| `GardenHeader` | `/components/GardenHeader.tsx` | Garden title + role-specific actions (rename/delete/share for owners, leave for members) |
| `GardenTabs` | `/components/GardenTabs.tsx` | Horizontal garden switcher + create button |
| `CreateGardenButton` | `/components/CreateGardenButton.tsx` | Dialog for creating new garden |
| `BottomTabBar` | `/components/BottomTabBar.tsx` | Mobile bottom navigation (Today, Plants, Add, Sign Out) |
| `LanguageSelector` | `/components/LanguageSelector.tsx` | i18n language switcher |

## Utility Functions (`/lib/utils.ts`)

- `daysUntilDue(lastActionAt, intervalDays, today?)` — returns days until action due (negative = overdue)
- `isDueForWatering(plant, today?)` — boolean
- `isDueForFeeding(plant, today?)` — boolean

## Database Access Pattern

- All DB access through `/lib/db/` modules (server-side only)
- Direct Supabase client calls; RLS enforces row-level permissions
- Helper: `resolveActiveGarden()` in `/lib/gardens.ts` picks active garden from URL param or defaults to first
- Helper: `getAuthenticatedUser()` in `/lib/auth.ts` extracts user from Supabase session

## Database Migrations (`/supabase/migrations/`)

1. `20260417000000_add_gardens.sql` — gardens table, owner FK
2. `20260419000000_share_gardens_rls.sql` — Full sharing infra: garden_members, garden_share_links, RLS policies, RPC functions (`accept_garden_share_link`, `water_plant`, `feed_plant`)
3. `20260419001000_plants_last_actions_timestamptz.sql` — Convert timestamp columns to timestamptz
4. `20260419002000_fix_rpc_row_security.sql` — Security fixes for RPC functions

## i18n

Supported via `next-intl`. Translation files in `/messages/` directory. `LanguageSelector` component allows runtime switching.

## Project Directory Layout

```
/app
  /login, /forgot-password, /auth/callback, /auth/set-password
  /today/page.tsx, /plants/page.tsx, /plants/new/page.tsx, /plants/[id]/page.tsx
  /share/[token]/page.tsx
  /api/plants/..., /api/gardens/..., /api/share/...
  layout.tsx, middleware.ts
/components          — Feature components listed above
/components/ui       — shadcn/ui primitives (Button, Input, Dialog, Badge, etc.)
/lib
  /db/plants.ts      — Plant CRUD via Supabase
  /db/gardens.ts     — Garden CRUD + membership queries
  /auth.ts           — getAuthenticatedUser helper
  /utils.ts          — Date/due-date calculations
  /gardens.ts        — resolveActiveGarden helper
  /supabase/         — Supabase client factories (server, middleware)
/types/index.ts      — Plant, Garden types
/supabase/migrations — SQL migration files
/messages            — i18n translation files
/i18n                — next-intl config
```

## What Has Changed From Original CLAUDE.md Spec

The CLAUDE.md describes an MVP with mock DB and mock auth. The actual project has evolved past that:

- **Auth**: Real Supabase Auth (email/password + Google OAuth + password reset) replaces the localStorage mock
- **Database**: Real Supabase PostgreSQL with RLS replaces the in-memory mock store
- **Gardens**: Multi-garden support added (not in original spec)
- **Sharing**: Full garden sharing with roles (owner/limited_editor) and share links
- **i18n**: Internationalization added (not in original spec)
- **Membership**: Users can leave shared gardens
