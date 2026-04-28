# Guest Garden Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow anonymous users to access a garden and perform water/feed actions via a signed, time-limited share link — no login required.

**Architecture:** Guest JWT signed with `SUPABASE_JWT_SECRET` issued by a Next.js API route; stored as httpOnly cookie; PostgREST verifies the JWT and makes `auth.jwt()` available to RLS and RPCs; all guest mutations go through new SECURITY DEFINER RPCs (`water_plant_guest`, `feed_plant_guest`); the guest `/guest` page is a Server Component that reads Supabase directly using the guest JWT client; Water/Feed buttons are Client Components that call dedicated `/api/guest/plants/[id]/water|feed` routes.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgREST + RLS + PL/pgSQL RPCs), jose (JWT signing), TypeScript strict, Tailwind + shadcn/ui

**Spec:** `docs/superpowers/specs/2026-04-29-guest-garden-access-spec.md`

---

## File Map

### Created
| File | Purpose |
|------|---------|
| `supabase/migrations/20260429000000_guest_garden_access.sql` | Schema + RLS + RPC changes |
| `lib/guest-jwt.ts` | Sign and decode guest JWTs |
| `lib/supabase/guest.ts` | Supabase client with guest JWT as Authorization header |
| `lib/db/anonymous-links.ts` | DB helpers for anonymous share links |
| `app/api/guest/token/route.ts` | Issue guest JWT, set httpOnly cookie |
| `app/api/guest/plants/[id]/water/route.ts` | Guest water action |
| `app/api/guest/plants/[id]/feed/route.ts` | Guest feed action |
| `app/api/gardens/[id]/anonymous-share-link/route.ts` | Owner CRUD for anonymous links |
| `app/guest/[token]/page.tsx` | Shell page that renders GuestTokenValidator |
| `components/GuestTokenValidator.tsx` | Client Component: calls /api/guest/token, sets cookie, redirects |
| `app/guest/page.tsx` | Guest main page (Server Component) |
| `components/GuestPlantList.tsx` | Plant list with Water/Feed buttons (Client Component) |

### Modified
| File | Change |
|------|--------|
| `middleware.ts` | Early-return for `/guest/*` and `/api/guest/*` paths |
| `lib/db/plants.ts` | Export `DbPlant` type and `toPlant` function |
| `lib/db/gardens.ts` | Fix `createOrRotateShareLink`: scope to `allow_anonymous = false` links, always set `expires_at` |
| `components/GardenHeader.tsx` | Add anonymous link section to share dialog |

---

## Task 1: Install jose + configure environment

**Files:**
- Modify: `package.json` (via npm)
- Modify: `.env.local` (not committed)

- [ ] **Step 1: Install jose**

```bash
npm install jose
```

Expected: `jose` added to `package.json` dependencies.

- [ ] **Step 2: Add env var**

Open `.env.local` and add:
```
SUPABASE_JWT_SECRET=<your-jwt-secret>
```

Find the value in Supabase dashboard → Project Settings → API → JWT Secret.

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install jose for guest JWT signing"
```

---

## Task 2: Database migration

**Files:**
- Create: `supabase/migrations/20260429000000_guest_garden_access.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260429000000_guest_garden_access.sql
-- Guest garden access: schema changes, RLS updates, new RPCs

-- ============================================================
-- 1. Schema changes to garden_share_links
-- ============================================================

ALTER TABLE garden_share_links
  ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS label TEXT NULL,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 7;

-- Set a safe default so existing inserts without expires_at don't break
ALTER TABLE garden_share_links
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '6 months');

-- Backfill existing rows that have expires_at null
UPDATE garden_share_links
  SET expires_at = now() + interval '6 months'
  WHERE expires_at IS NULL;

-- Now enforce NOT NULL
ALTER TABLE garden_share_links
  ALTER COLUMN expires_at SET NOT NULL;

-- Performance indexes for guest token lookups
CREATE INDEX IF NOT EXISTS idx_garden_share_links_token
  ON garden_share_links (token);

CREATE INDEX IF NOT EXISTS idx_garden_share_links_garden_token
  ON garden_share_links (garden_id, token);

-- ============================================================
-- 2. Update gardens SELECT policy — add guest branch
-- ============================================================

DROP POLICY IF EXISTS "Gardens readable by owner or members" ON gardens;

CREATE POLICY "Gardens readable by owner or members or guests"
ON gardens FOR SELECT
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM garden_members gm
    WHERE gm.garden_id = gardens.id
      AND gm.user_id = auth.uid()
  )
  OR (
    auth.jwt()->>'guest_token' IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM garden_share_links gsl
      WHERE gsl.token = (auth.jwt()->>'guest_token')
        AND gsl.allow_anonymous = true
        AND gsl.revoked_at IS NULL
        AND gsl.expires_at > now()
        AND gsl.garden_id = gardens.id
    )
  )
);

-- ============================================================
-- 3. Update plants SELECT policy — add guest branch
-- ============================================================

DROP POLICY IF EXISTS "Plants readable by garden owner or members" ON plants;

CREATE POLICY "Plants readable by garden owner or members or guests"
ON plants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gardens g
    WHERE g.id = plants.garden_id
      AND (
        g.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM garden_members gm
          WHERE gm.garden_id = g.id
            AND gm.user_id = auth.uid()
        )
      )
  )
  OR (
    auth.jwt()->>'guest_token' IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM garden_share_links gsl
      WHERE gsl.token = (auth.jwt()->>'guest_token')
        AND gsl.allow_anonymous = true
        AND gsl.revoked_at IS NULL
        AND gsl.expires_at > now()
        AND gsl.garden_id = plants.garden_id
    )
  )
);

-- ============================================================
-- 4. Validation RPC (used by /api/guest/token — no auth needed)
-- ============================================================

CREATE OR REPLACE FUNCTION validate_anonymous_share_link(p_token text)
RETURNS TABLE (garden_id uuid, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN QUERY
  SELECT gsl.garden_id, gsl.expires_at
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = true
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_anonymous_share_link(text) TO anon;

-- ============================================================
-- 5. Guest water RPC
-- ============================================================

CREATE OR REPLACE FUNCTION water_plant_guest(p_plant_id uuid, p_token text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_garden_id uuid;
  v_rows_updated integer;
BEGIN
  -- Resolve share link once; all six conditions checked here
  SELECT gsl.garden_id INTO v_garden_id
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = true
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;

  IF v_garden_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Update only if: plant belongs to the resolved garden AND is due
  UPDATE plants p
  SET last_watered_at = now()
  WHERE p.id = p_plant_id
    AND p.garden_id = v_garden_id   -- explicit defense-in-depth, not relying on RLS
    AND (
      p.last_watered_at IS NULL
      OR p.last_watered_at + (p.watering_interval_days * interval '1 day') <= now()
    );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION water_plant_guest(uuid, text) TO anon;

-- ============================================================
-- 6. Guest feed RPC
-- ============================================================

CREATE OR REPLACE FUNCTION feed_plant_guest(p_plant_id uuid, p_token text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_garden_id uuid;
  v_rows_updated integer;
BEGIN
  -- Resolve share link once; all six conditions checked here
  SELECT gsl.garden_id INTO v_garden_id
  FROM garden_share_links gsl
  WHERE gsl.token = p_token
    AND gsl.allow_anonymous = true
    AND gsl.revoked_at IS NULL
    AND gsl.expires_at > now()
  LIMIT 1;

  IF v_garden_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Update only if: plant belongs to the resolved garden AND is due
  UPDATE plants p
  SET last_fed_at = now()
  WHERE p.id = p_plant_id
    AND p.garden_id = v_garden_id   -- explicit defense-in-depth, not relying on RLS
    AND (
      p.last_fed_at IS NULL
      OR p.last_fed_at + (p.feeding_interval_days * interval '1 day') <= now()
    );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION feed_plant_guest(uuid, text) TO anon;
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected output: migration applied without errors.

- [ ] **Step 3: Verify in Supabase dashboard**

Open Supabase dashboard → Table Editor → `garden_share_links`. Confirm columns `allow_anonymous`, `label`, `duration_days`, and non-null `expires_at` are present.

Open Database → Functions. Confirm `validate_anonymous_share_link`, `water_plant_guest`, `feed_plant_guest` exist.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260429000000_guest_garden_access.sql
git commit -m "feat: add guest garden access migration (schema, RLS, RPCs)"
```

---

## Task 3: Export DbPlant and toPlant from lib/db/plants.ts

**Files:**
- Modify: `lib/db/plants.ts`

- [ ] **Step 1: Export the type and function**

In `lib/db/plants.ts`, change the `type DbPlant` declaration and `function toPlant` from unexported to exported:

```typescript
// Change:
type DbPlant = {
// To:
export type DbPlant = {
```

```typescript
// Change:
function toPlant(row: DbPlant): Plant {
// To:
export function toPlant(row: DbPlant): Plant {
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/plants.ts
git commit -m "refactor: export DbPlant and toPlant for guest page reuse"
```

---

## Task 4: Fix createOrRotateShareLink in lib/db/gardens.ts

**Files:**
- Modify: `lib/db/gardens.ts`

Two bugs to fix: (a) it revokes ALL active links including anonymous links — it should only revoke member-invite links (`allow_anonymous = false`); (b) it doesn't set `expires_at`, which will now fail the NOT NULL constraint.

- [ ] **Step 1: Update createOrRotateShareLink**

Replace the `createOrRotateShareLink` function body:

```typescript
export async function createOrRotateShareLink(gardenId: string): Promise<string> {
  const supabase = await createClient()
  // Revoke active member-invite links only (not anonymous links)
  await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', false)
    .is('revoked_at', null)

  const token = randomUUID()
  const { data: { user } } = await supabase.auth.getUser()
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 6)
  const { error } = await supabase
    .from('garden_share_links')
    .insert({
      garden_id: gardenId,
      token,
      role: 'limited_editor',
      created_by: user!.id,
      allow_anonymous: false,
      expires_at: expiresAt.toISOString(),
    })
  if (error) throw new Error(error.message)
  return token
}
```

Also update `getActiveShareLinkToken` to only return member-invite links (not anonymous):

```typescript
export async function getActiveShareLinkToken(gardenId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('garden_share_links')
    .select('token')
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', false)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return (data as { token: string }).token
}
```

Also update `revokeShareLink` to only revoke member-invite links:

```typescript
export async function revokeShareLink(gardenId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', false)
    .is('revoked_at', null)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/gardens.ts
git commit -m "fix: scope share link operations to allow_anonymous=false, always set expires_at"
```

---

## Task 5: Create lib/db/anonymous-links.ts

**Files:**
- Create: `lib/db/anonymous-links.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/db/anonymous-links.ts
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function getAnonymousShareLinkToken(
  gardenId: string
): Promise<{ token: string; expiresAt: string } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('garden_share_links')
    .select('token, expires_at')
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', true)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return { token: (data as { token: string; expires_at: string }).token, expiresAt: (data as { token: string; expires_at: string }).expires_at }
}

export async function createOrRotateAnonymousLink(
  gardenId: string,
  durationDays: number,
  label: string | null
): Promise<{ token: string; expiresAt: string }> {
  const supabase = await createClient()
  // Revoke existing anonymous links for this garden only
  await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', true)
    .is('revoked_at', null)

  const token = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)

  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('garden_share_links')
    .insert({
      garden_id: gardenId,
      token,
      role: 'limited_editor',
      created_by: user!.id,
      allow_anonymous: true,
      label: label ?? null,
      duration_days: durationDays,
      expires_at: expiresAt.toISOString(),
    })
  if (error) throw new Error(error.message)
  return { token, expiresAt: expiresAt.toISOString() }
}

export async function revokeAnonymousLink(gardenId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', true)
    .is('revoked_at', null)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/anonymous-links.ts
git commit -m "feat: add anonymous share link DB helpers"
```

---

## Task 6: Create lib/guest-jwt.ts

**Files:**
- Create: `lib/guest-jwt.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/guest-jwt.ts
import { SignJWT } from 'jose'

/** Signs a guest JWT with SUPABASE_JWT_SECRET. PostgREST verifies this. */
export async function signGuestJwt(
  guestToken: string,
  gardenId: string,
  expiresAt: Date
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)
  return new SignJWT({
    role: 'anon',
    guest_token: guestToken,
    garden_id: gardenId,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expiresAt)
    .sign(secret)
}

/**
 * Decodes the JWT payload WITHOUT verifying the signature.
 * Safe because: (a) cookie is httpOnly so clients cannot forge it,
 * (b) PostgREST independently verifies the signature on every request,
 * (c) RPCs validate guest_token against the DB.
 */
export function decodeGuestJwtClaims(
  jwt: string
): { guestToken: string; gardenId: string } | null {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as Record<string, unknown>
    if (typeof payload.guest_token !== 'string') return null
    if (typeof payload.garden_id !== 'string') return null
    return { guestToken: payload.guest_token, gardenId: payload.garden_id }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/guest-jwt.ts
git commit -m "feat: add guest JWT sign/decode utilities"
```

---

## Task 7: Create lib/supabase/guest.ts

**Files:**
- Create: `lib/supabase/guest.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/supabase/guest.ts
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client that sends the guest JWT as the Authorization header.
 * PostgREST verifies the JWT and makes auth.jwt() available to RLS and RPCs.
 * Uses the anon key — the JWT overrides the effective Postgres role to 'anon'
 * with the guest_token claim that unlocks the guest RLS branches.
 */
export function createGuestClient(guestJwt: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${guestJwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/guest.ts
git commit -m "feat: add guest Supabase client helper"
```

---

## Task 8: Create /api/guest/token/route.ts

**Files:**
- Create: `app/api/guest/token/route.ts`

This route validates an anonymous share link token, signs a guest JWT, and sets it as an httpOnly cookie. It uses the anon Supabase client to call the `validate_anonymous_share_link` RPC — no auth required since that RPC is granted to `anon`.

- [ ] **Step 1: Write the route**

```typescript
// app/api/guest/token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signGuestJwt } from '@/lib/guest-jwt'
import { z } from 'zod'

const bodySchema = z.object({ token: z.string().min(1) })

// Anon client — no auth. Used only to call validate_anonymous_share_link.
function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const { token } = parsed.data

  const supabase = anonClient()
  const { data, error } = await supabase.rpc('validate_anonymous_share_link', {
    p_token: token,
  })

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })
  }

  const { garden_id: gardenId, expires_at: expiresAtStr } = data[0] as {
    garden_id: string
    expires_at: string
  }
  const expiresAt = new Date(expiresAtStr)

  const jwt = await signGuestJwt(token, gardenId, expiresAt)

  const response = NextResponse.json({ gardenId })
  response.cookies.set('guest_jwt', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
  return response
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Manual verification**

With the dev server running (`npm run dev`), create an anonymous share link in the DB directly via Supabase dashboard (or run the owner UI after Task 16). Then:

```bash
curl -X POST http://localhost:3000/api/guest/token \
  -H "Content-Type: application/json" \
  -d '{"token":"<your-token>"}'
```

Expected: `{ "gardenId": "<uuid>" }` and a `Set-Cookie: guest_jwt=...` header.

With an invalid token:
```bash
curl -X POST http://localhost:3000/api/guest/token \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid"}'
```

Expected: 401.

- [ ] **Step 4: Commit**

```bash
git add app/api/guest/token/route.ts
git commit -m "feat: add /api/guest/token route to issue guest JWT"
```

---

## Task 9: Create guest plant water and feed routes

**Files:**
- Create: `app/api/guest/plants/[id]/water/route.ts`
- Create: `app/api/guest/plants/[id]/feed/route.ts`

- [ ] **Step 1: Write the water route**

```typescript
// app/api/guest/plants/[id]/water/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeGuestJwtClaims } from '@/lib/guest-jwt'
import { createGuestClient } from '@/lib/supabase/guest'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guestJwt = request.cookies.get('guest_jwt')?.value
  if (!guestJwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const claims = decodeGuestJwtClaims(guestJwt)
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const client = createGuestClient(guestJwt)

  const { data, error } = await client.rpc('water_plant_guest', {
    p_plant_id: id,
    p_token: claims.guestToken,
  })

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ updated: data === 1 })
}
```

- [ ] **Step 2: Write the feed route**

```typescript
// app/api/guest/plants/[id]/feed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeGuestJwtClaims } from '@/lib/guest-jwt'
import { createGuestClient } from '@/lib/supabase/guest'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guestJwt = request.cookies.get('guest_jwt')?.value
  if (!guestJwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const claims = decodeGuestJwtClaims(guestJwt)
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const client = createGuestClient(guestJwt)

  const { data, error } = await client.rpc('feed_plant_guest', {
    p_plant_id: id,
    p_token: claims.guestToken,
  })

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ updated: data === 1 })
}
```

- [ ] **Step 3: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/guest/plants/[id]/water/route.ts app/api/guest/plants/[id]/feed/route.ts
git commit -m "feat: add guest water and feed API routes"
```

---

## Task 10: Create /api/gardens/[id]/anonymous-share-link/route.ts

**Files:**
- Create: `app/api/gardens/[id]/anonymous-share-link/route.ts`

Owner-only CRUD for the anonymous share link. Follows the same pattern as `app/api/gardens/[id]/share-link/route.ts`.

- [ ] **Step 1: Write the route**

```typescript
// app/api/gardens/[id]/anonymous-share-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth'
import { isGardenOwner } from '@/lib/db/gardens'
import {
  getAnonymousShareLinkToken,
  createOrRotateAnonymousLink,
  revokeAnonymousLink,
} from '@/lib/db/anonymous-links'

const postSchema = z.object({
  durationDays: z.number().int().min(1).max(14).default(7),
  label: z.string().max(100).nullable().optional(),
})

function buildGuestUrl(request: NextRequest, token: string): string {
  const origin = request.headers.get('origin') ?? request.nextUrl.origin
  return `${origin}/guest/${token}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await isGardenOwner(id, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const result = await getAnonymousShareLinkToken(id)
  if (!result) return NextResponse.json({ url: null })
  return NextResponse.json({ url: buildGuestUrl(request, result.token) })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await isGardenOwner(id, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await request.json().catch(() => ({}))
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const { durationDays, label } = parsed.data
  const { token } = await createOrRotateAnonymousLink(id, durationDays, label ?? null)
  return NextResponse.json({ url: buildGuestUrl(request, token) })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await isGardenOwner(id, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await revokeAnonymousLink(id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/gardens/[id]/anonymous-share-link/route.ts
git commit -m "feat: add owner anonymous share link API routes"
```

---

## Task 11: Update middleware.ts

**Files:**
- Modify: `middleware.ts`

Guest routes must bypass Supabase Auth entirely. We early-return before the Supabase client is created — this avoids unnecessary auth calls on every guest page request.

- [ ] **Step 1: Add early return for guest paths**

Add the following block immediately after `const { pathname } = request.nextUrl` and before the Supabase client creation:

```typescript
  // Guest routes are fully public — skip Supabase auth check entirely
  const isGuestPath =
    pathname.startsWith('/guest') ||
    pathname.startsWith('/api/guest')
  if (isGuestPath) {
    return NextResponse.next({ request })
  }
```

The full updated `middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Guest routes are fully public — skip Supabase auth check entirely
  const isGuestPath =
    pathname.startsWith('/guest') ||
    pathname.startsWith('/api/guest')
  if (isGuestPath) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add logic between createServerClient and getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve original destination so login can redirect back
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: must return supabaseResponse so session cookies are forwarded
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: exempt guest routes from Supabase auth middleware"
```

---

## Task 12: Create GuestTokenValidator + /app/guest/[token]/page.tsx

**Files:**
- Create: `components/GuestTokenValidator.tsx`
- Create: `app/guest/[token]/page.tsx`

**Why client-side:** Next.js does not forward `Set-Cookie` headers from internal server-to-server `fetch()` calls back to the browser response. The `/api/guest/token` route sets an httpOnly cookie via `Set-Cookie`. The only way to propagate that cookie to the browser is a real browser-initiated HTTP request. So the token validation must happen client-side.

- [ ] **Step 1: Write GuestTokenValidator**

```typescript
// components/GuestTokenValidator.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { token: string }

export function GuestTokenValidator({ token }: Props) {
  const router = useRouter()
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    fetch('/api/guest/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => {
        if (res.ok) {
          router.replace('/guest')
        } else {
          setInvalid(true)
        }
      })
      .catch(() => setInvalid(true))
  }, [token, router])

  if (invalid) {
    return (
      <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
        <p className="text-brand-fg-dim text-center">
          This link is invalid or has expired.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
      <p className="text-brand-fg-dim text-center">Verifying link…</p>
    </main>
  )
}
```

- [ ] **Step 2: Write the page shell**

```typescript
// app/guest/[token]/page.tsx
import { GuestTokenValidator } from '@/components/GuestTokenValidator'

type Props = { params: Promise<{ token: string }> }

export default async function GuestTokenPage({ params }: Props) {
  const { token } = await params
  return <GuestTokenValidator token={token} />
}
```

- [ ] **Step 3: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/GuestTokenValidator.tsx app/guest/[token]/page.tsx
git commit -m "feat: add /guest/[token] validation page with client-side token exchange"
```

---

## Task 13: Create components/GuestPlantList.tsx

**Files:**
- Create: `components/GuestPlantList.tsx`

Client component. Renders plant cards with Water/Feed buttons. Updates local state optimistically after successful mutation.

- [ ] **Step 1: Write the component**

```typescript
// components/GuestPlantList.tsx
'use client'

import { useState } from 'react'
import { Plant } from '@/types'
import { isDueForWatering, isDueForFeeding } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = {
  initialPlants: Plant[]
}

export function GuestPlantList({ initialPlants }: Props) {
  const [plants, setPlants] = useState<Plant[]>(initialPlants)
  const today = new Date()

  async function handleWater(plantId: string) {
    const res = await fetch(`/api/guest/plants/${plantId}/water`, {
      method: 'POST',
    })
    if (!res.ok) return
    const data = (await res.json()) as { updated: boolean }
    if (data.updated) {
      setPlants(prev =>
        prev.map(p =>
          p.id === plantId ? { ...p, lastWateredAt: new Date().toISOString() } : p
        )
      )
    }
  }

  async function handleFeed(plantId: string) {
    const res = await fetch(`/api/guest/plants/${plantId}/feed`, {
      method: 'POST',
    })
    if (!res.ok) return
    const data = (await res.json()) as { updated: boolean }
    if (data.updated) {
      setPlants(prev =>
        prev.map(p =>
          p.id === plantId ? { ...p, lastFedAt: new Date().toISOString() } : p
        )
      )
    }
  }

  if (plants.length === 0) {
    return <p className="text-brand-fg-dim">No plants in this garden.</p>
  }

  return (
    <ul className="space-y-3">
      {plants.map(plant => {
        const waterDue = isDueForWatering(plant, today)
        const feedDue = isDueForFeeding(plant, today)
        return (
          <li
            key={plant.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-brand-surface p-4"
          >
            <span className="text-2xl">{plant.emoji}</span>
            <span className="flex-1 font-medium text-brand-fg">{plant.name}</span>
            <Button
              onClick={() => handleWater(plant.id)}
              disabled={!waterDue}
              size="sm"
              className="bg-brand-cta text-brand-cta-fg hover:brightness-[0.92] disabled:opacity-40"
            >
              Water
            </Button>
            <Button
              onClick={() => handleFeed(plant.id)}
              disabled={!feedDue}
              size="sm"
              variant="outline"
              className="border-white/10 bg-transparent text-brand-fg hover:bg-white/5 disabled:opacity-40"
            >
              Feed
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/GuestPlantList.tsx
git commit -m "feat: add GuestPlantList client component with water/feed buttons"
```

---

## Task 14: Create /app/guest/page.tsx

**Files:**
- Create: `app/guest/page.tsx`

Server component. Reads the `guest_jwt` cookie, creates a guest Supabase client, fetches garden and plants, renders `GuestPlantList`.

- [ ] **Step 1: Write the page**

```typescript
// app/guest/page.tsx
import { cookies } from 'next/headers'
import { decodeGuestJwtClaims } from '@/lib/guest-jwt'
import { createGuestClient } from '@/lib/supabase/guest'
import { DbPlant, toPlant } from '@/lib/db/plants'
import { GuestPlantList } from '@/components/GuestPlantList'

type DbGarden = { id: string; name: string }

const sessionExpiredUi = (
  <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
    <p className="text-brand-fg-dim text-center">
      Reopen the original link to continue.
    </p>
  </main>
)

export default async function GuestPage() {
  const cookieStore = await cookies()
  const guestJwt = cookieStore.get('guest_jwt')?.value

  if (!guestJwt) return sessionExpiredUi

  const claims = decodeGuestJwtClaims(guestJwt)
  if (!claims) return sessionExpiredUi

  const client = createGuestClient(guestJwt)

  const [gardenResult, plantsResult] = await Promise.all([
    client
      .from('gardens')
      .select('id, name')
      .eq('id', claims.gardenId)
      .single(),
    client
      .from('plants')
      .select('*')
      .eq('garden_id', claims.gardenId)
      .order('created_at', { ascending: true }),
  ])

  if (gardenResult.error || !gardenResult.data) {
    return (
      <main className="min-h-screen bg-brand-bg p-6 text-brand-fg flex items-center justify-center">
        <p className="text-brand-fg-dim text-center">
          This link is invalid or has expired.
        </p>
      </main>
    )
  }

  const garden = gardenResult.data as DbGarden
  const plants = (plantsResult.data ?? []).map(row => toPlant(row as DbPlant))

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-fg">
      <h1 className="text-2xl font-bold mb-6">{garden.name}</h1>
      <GuestPlantList initialPlants={plants} />
    </main>
  )
}
```

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/guest/page.tsx
git commit -m "feat: add /guest server component for guest plant view"
```

---

## Task 15: Update GardenHeader.tsx — anonymous link section

**Files:**
- Modify: `components/GardenHeader.tsx`

Adds anonymous link state + handlers + a second section inside the share dialog.

- [ ] **Step 1: Add imports**

At the top of the file, `Copy` and `RefreshCw` are already imported. No new imports needed.

- [ ] **Step 2: Add anonymous link state after the existing share state block**

After the `shareCopied` state line (line ~49), add:

```typescript
  // anonymous share link state
  const [anonUrl, setAnonUrl] = useState<string | null>(null)
  const [anonLoading, setAnonLoading] = useState(false)
  const [anonCopied, setAnonCopied] = useState(false)
  const [durationDays, setDurationDays] = useState(7)
```

- [ ] **Step 3: Update handleShareOpenChange to also fetch the anonymous link**

Replace the existing `handleShareOpenChange`:

```typescript
  async function handleShareOpenChange(next: boolean) {
    setShareOpen(next)
    if (next) {
      setShareLoading(true)
      setShareCopied(false)
      setAnonLoading(true)
      setAnonCopied(false)
      try {
        const [shareRes, anonRes] = await Promise.all([
          fetch(`/api/gardens/${garden.id}/share-link`),
          fetch(`/api/gardens/${garden.id}/anonymous-share-link`),
        ])
        if (shareRes.ok) {
          const data = (await shareRes.json()) as { url: string | null }
          setShareUrl(data.url)
        }
        if (anonRes.ok) {
          const data = (await anonRes.json()) as { url: string | null }
          setAnonUrl(data.url)
        }
      } finally {
        setShareLoading(false)
        setAnonLoading(false)
      }
    }
  }
```

- [ ] **Step 4: Add anonymous link handler functions**

Add after the existing `handleCopy` function:

```typescript
  async function handleCreateAnon() {
    setAnonLoading(true)
    setAnonCopied(false)
    try {
      const res = await fetch(`/api/gardens/${garden.id}/anonymous-share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays }),
      })
      if (res.ok) {
        const data = (await res.json()) as { url: string }
        setAnonUrl(data.url)
      }
    } finally {
      setAnonLoading(false)
    }
  }

  async function handleRevokeAnon() {
    setAnonLoading(true)
    try {
      await fetch(`/api/gardens/${garden.id}/anonymous-share-link`, {
        method: 'DELETE',
      })
      setAnonUrl(null)
    } finally {
      setAnonLoading(false)
    }
  }

  function handleAnonCopy() {
    if (anonUrl) {
      navigator.clipboard.writeText(anonUrl)
      setAnonCopied(true)
      setTimeout(() => setAnonCopied(false), 2000)
    }
  }
```

- [ ] **Step 5: Add anonymous link section inside the share dialog**

Inside the `DialogContent` for the share dialog, after the closing `})}` of the `!shareLoading && !shareUrl` block (just before the closing `</div>` of the dialog content `space-y-4 pt-2` div), add:

```tsx
                {/* Anonymous guest access section */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-brand-fg">Guest access</p>
                    <p className="text-sm text-brand-fg-dim">
                      Anyone with this link can water and feed plants without logging in.
                    </p>
                  </div>

                  {anonLoading && (
                    <p className="text-sm text-brand-fg-dim">Loading…</p>
                  )}

                  {!anonLoading && anonUrl && (
                    <>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={anonUrl}
                          className="border-white/10 bg-brand-bg text-brand-fg text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAnonCopy}
                          className="shrink-0 border-white/10 bg-transparent text-brand-fg hover:bg-white/5"
                        >
                          {anonCopied ? 'Copied!' : <Copy size={16} />}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        onClick={handleRevokeAnon}
                        disabled={anonLoading}
                        className="w-full bg-brand-alert text-white hover:brightness-[0.92] text-sm"
                      >
                        Revoke guest link
                      </Button>
                    </>
                  )}

                  {!anonLoading && !anonUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand-fg-dim">Expires in</span>
                        <select
                          value={durationDays}
                          onChange={e => setDurationDays(Number(e.target.value))}
                          className="text-sm bg-brand-bg border border-white/10 rounded px-2 py-1 text-brand-fg"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(d => (
                            <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        onClick={handleCreateAnon}
                        disabled={anonLoading}
                        className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
                      >
                        Create guest link
                      </Button>
                    </div>
                  )}
                </div>
```

- [ ] **Step 6: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 7: Verify the file is under 150 lines (CLAUDE.md rule)**

```bash
wc -l components/GardenHeader.tsx
```

If it exceeds 150 lines, split the share dialog into a `ShareDialog.tsx` component following the existing pattern (the dialog content becomes its own component, GardenHeader imports and renders it).

- [ ] **Step 8: Commit**

```bash
git add components/GardenHeader.tsx
git commit -m "feat: add anonymous guest link section to share dialog"
```

---

## End-to-End Verification

After all tasks are complete, verify the full guest flow:

- [ ] **Step 1: Start dev server**
```bash
npm run dev
```

- [ ] **Step 2: Create guest link as owner**
  - Log in as a garden owner
  - Open share dialog on a garden
  - Confirm "Guest access" section appears
  - Set duration to 3 days, click "Create guest link"
  - Copy the `/guest/<token>` URL

- [ ] **Step 3: Open the link in an incognito window**
  - Paste the URL into an incognito browser window (no login)
  - Confirm you are redirected to `/guest` and see the garden name + plant list
  - Confirm no edit controls, no navigation admin features

- [ ] **Step 4: Water a due plant**
  - Click Water on a plant that is due
  - Confirm the button becomes disabled immediately (optimistic update)
  - Confirm no errors in the browser console or network tab

- [ ] **Step 5: Try watering a plant that is not due**
  - Confirm the Water button is disabled and cannot be clicked

- [ ] **Step 6: Revoke the link from the owner's share dialog**
  - In the owner's browser, click "Revoke guest link"
  - In the incognito window, click Water on any plant
  - Confirm the request returns an error (link is revoked, RLS rejects it)

- [ ] **Step 7: Final lint**
```bash
npm run lint
```

Expected: no errors across the whole project.
