# Guest Garden Access — Design Spec

**Date:** 2026-04-29  
**Feature:** `guest_garden_access`  
**Status:** Approved

---

## Purpose

Allow anonymous users to access a single garden via a time-limited share link and perform limited plant actions (water, feed) without authentication. Guests are not database users — they hold a signed capability token that unlocks specific, explicitly scoped access.

---

## Core Rules

- R1. A guest is identified ONLY by a valid `garden_share_links.token`.
- R2. Guest access is time-limited (`expires_at` enforced at both API and DB layers).
- R3. Guest access is revocable (`revoked_at` enforced at both layers).
- R4. Guest can access ONLY one garden per token.
- R5. Guest can ONLY perform: water, feed.
- R6. Guest MUST NOT perform: create, edit, delete, admin actions.
- R7. All authorization MUST be enforced in Supabase RLS (not frontend alone).
- R8. Guest must NEVER directly update the plants table.
- R9. All plant mutations MUST go through RPC functions.

---

## Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| Token storage | httpOnly cookie | Prevents JS access; all guest calls proxied through Next.js API routes |
| JWT role | `"anon"` | Guests are not authenticated users; `anon` Postgres role has no default access |
| Guest identity source | `guest_token` JWT claim exclusively | Explicit, stable — does not rely on `auth.uid()` being NULL or other implicit fields |
| Guest RPCs | New `water_plant_guest` / `feed_plant_guest` | Keeps existing RPCs untouched; clean separation |
| Anonymous token | Separate from member-invite token | Independent lifecycle; owner manages both independently |
| `expires_at` | Always non-null | Removes dual semantics; even member-invite links get a long-lived default (6 months) |

---

## Section 1: Database

### Migration — `garden_share_links` additions

```sql
ALTER TABLE garden_share_links
  ADD COLUMN allow_anonymous BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN label TEXT NULL,
  ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 7;

-- expires_at already exists but was nullable and unenforced.
-- All new rows must have expires_at set. Existing rows backfilled to now() + interval '6 months'.
UPDATE garden_share_links SET expires_at = now() + interval '6 months' WHERE expires_at IS NULL;
ALTER TABLE garden_share_links ALTER COLUMN expires_at SET NOT NULL;

-- Indexes for guest token lookup performance
CREATE INDEX idx_garden_share_links_token ON garden_share_links (token);
CREATE INDEX idx_garden_share_links_garden_token ON garden_share_links (garden_id, token);
```

**`expires_at` policy:**
- Anonymous links: `now() + duration_days * interval '1 day'` (1–14 days, enforced in app)
- Member-invite links: `now() + interval '6 months'` (long-lived default)
- No NULL `expires_at` anywhere in the system

### Guest RPCs

Both functions are `SECURITY DEFINER`. They resolve the share link **once** at the start, store `garden_id` in a local variable, and reuse it for all subsequent checks. Never re-query `garden_share_links`.

**`water_plant_guest(p_plant_id uuid, p_token text)`**

1. Resolve token: query `garden_share_links` WHERE `token = p_token AND allow_anonymous = true AND revoked_at IS NULL AND expires_at > now()`. Store `garden_id`.
2. If no row found → return 0 (silent no-op).
3. Verify `plants.garden_id = resolved_garden_id` explicitly (defense in depth — do not rely solely on RLS).
4. Check plant is due: `last_watered_at IS NULL OR last_watered_at + (watering_interval_days * interval '1 day') <= now()`.
5. If not due → return 0 (silent no-op).
6. `UPDATE plants SET last_watered_at = now() WHERE id = p_plant_id`. Return 1.

**`feed_plant_guest(p_plant_id uuid, p_token text)`** — same structure, uses `last_fed_at` and `feeding_interval_days`.

### Plants SELECT RLS — guest branch

Added as a second `OR` branch to the existing policy:

```sql
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
```

All six conditions are inside a single `EXISTS` clause. `auth.jwt()->>'guest_token'` is the only guest identity source in RLS.

### Gardens SELECT RLS — guest branch

Same pattern — allows guest to read the single garden their token is scoped to:

```sql
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
```

---

## Section 2: Auth Flow

### JWT

Signed by `POST /api/guest/token` using `SUPABASE_JWT_SECRET` (env var, server-side only).

```json
{
  "role": "anon",
  "guest_token": "<garden_share_links.token>",
  "garden_id": "<garden_share_links.garden_id>",
  "exp": <expires_at as unix timestamp>
}
```

- `role: "anon"` — the Postgres anonymous role; no default access
- `guest_token` — the only source of guest identity in RLS and RPCs
- `garden_id` — convenience claim for API routes to scope requests
- No `sub` claim — this is intentional and not relied upon for access control

### `/api/guest/token` — POST

1. Read `token` from request body.
2. Query `garden_share_links` using service-role Supabase client (bypasses RLS for this validation lookup only): verify `allow_anonymous = true`, `revoked_at IS NULL`, `expires_at > now()`.
3. If invalid → 401.
4. Sign JWT with `SUPABASE_JWT_SECRET`; `exp` = `expires_at` unix timestamp.
5. Set response cookie: name `guest_jwt`, value = signed JWT, `httpOnly`, `Secure`, `SameSite=Lax`, `expires` = `expires_at`.
6. Return `{ gardenId }`.

### Entry flow

```
User opens /guest/[token]
  → Server Component calls POST /api/guest/token
  → On failure: render error ("This link is invalid or has expired.")
  → On success: redirect to /guest
```

### Middleware

Add `/guest` and `/guest/[token]` to the public paths list — these routes bypass the existing Supabase Auth middleware check.

---

## Section 3: API Routes

All guest API routes follow this pattern:

1. Read the `guest_jwt` httpOnly cookie from the request. Its value is the signed JWT issued by `/api/guest/token`.
2. If missing → 401.
3. Create a Supabase client with `Authorization: Bearer <guest_jwt>` header — PostgREST verifies the JWT and exposes `auth.jwt()` to RLS/RPCs.
4. Execute the query — RLS enforces access; no further auth logic in the route handler.

For RPC calls, the route handler decodes the JWT payload (base64) to extract the `guest_token` claim value (the raw share link token) and passes it as the `p_token` parameter.

### `GET /api/guest/garden`

Returns `{ id, name }` for the garden in the JWT `garden_id` claim. Gardens SELECT RLS guest branch handles authorization.

### `GET /api/guest/plants`

Returns all plants for the garden. Plants SELECT RLS guest branch handles authorization.

### `POST /api/guest/plants/[id]/water`

Calls `water_plant_guest(p_plant_id := id, p_token := guest_token claim extracted from the JWT)`. Returns `{ updated: true }` if the RPC updated a row, `{ updated: false }` if no-op (not due or validation failed).

### `POST /api/guest/plants/[id]/feed`

Same pattern — calls `feed_plant_guest`.

**No other guest routes.** Guests cannot list gardens, create, edit, or delete plants.

---

## Section 4: Frontend

### `/guest/[token]` — Validation entry (Server Component)

- Calls `POST /api/guest/token` server-side.
- Success → redirect to `/guest`.
- Failure → renders: "This link is invalid or has expired."

### `/guest` — Main guest page (Server Component + Client islands)

Server component fetches `/api/guest/garden` and `/api/guest/plants` (cookie forwarded server-side).

If cookie is missing or JWT is expired on load → renders: "Reopen the original link to continue." No plant data exposed.

**Renders:**
- Garden name as page heading
- Plant list with name, emoji, watering/feeding status
- Per-plant: **Water** button (disabled if not due), **Feed** button (disabled if not due)
- No navigation, no settings, no edit controls

Water/Feed buttons are Client Components — call `/api/guest/plants/[id]/water` and `/api/guest/plants/[id]/feed` via `fetch`, refresh local plant state on response.

### Owner UI — `GardenHeader.tsx` share dialog additions

A second section is added below the existing member-invite section:

- Toggle: "Allow anonymous access" (`allow_anonymous`)
- When toggled on:
  - Duration picker: 1–14 days (default 7), label: "Link expires in N days"
  - Optional label field (e.g., "Family link")
  - Generate button → calls `POST /api/gardens/[id]/anonymous-share-link`
- When an anonymous link exists:
  - Displays the `/guest/[token]` URL with a copy button
  - Revoke button → calls `DELETE /api/gardens/[id]/anonymous-share-link`
- Both sections (member-invite and anonymous) operate independently.

### New owner API routes

- `GET /api/gardens/[id]/anonymous-share-link` — returns `{ url }` or `{ url: null }`
- `POST /api/gardens/[id]/anonymous-share-link` — creates/rotates anonymous link; accepts `{ durationDays, label }`
- `DELETE /api/gardens/[id]/anonymous-share-link` — revokes (`revoked_at = now()`)

---

## Section 5: Error Handling & Edge Cases

| Case | Where handled | Behaviour |
|------|--------------|-----------|
| Expired token | `/api/guest/token` + RLS | 401 from token endpoint; RLS rejects even if stale cookie present |
| Revoked token | `/api/guest/token` + RLS | 401; `revoked_at IS NULL` check fails at both layers |
| Invalid token | `/api/guest/token` | 401, no JWT issued |
| `allow_anonymous = false` | `/api/guest/token` | 401 — guest JWT never issued |
| Cross-garden access | RLS + RPC explicit check | `garden_id` in JWT must match plant's `garden_id`; both layers verify |
| Plant not due | RPC no-op | Returns 0 rows; API returns `{ updated: false }`; button shown as disabled |
| Missing cookie on `/guest` load | `/guest` page | Renders session-expired message; no data exposed |
| JWT expired mid-session | Any guest API route | Supabase rejects at PostgREST level → 401 → guest page shows expired message |
| Owner revokes link | Immediate | `revoked_at` set → next guest API call fails RLS → "This link has been revoked." |

---

## Non-Goals

- No guest accounts or anonymous users table
- No realtime features
- No notifications
- No analytics or logging system
- No password or email for guests

---

## Success Criteria

- S1. Guest opens link without login
- S2. Guest sees only one garden
- S3. Guest can water/feed plants
- S4. RLS enforces all access rules at DB level
- S5. Guest RPCs enforce plant update rules with defense-in-depth
- S6. Access expires correctly at both JWT and DB levels
- S7. Owner can revoke access immediately
- S8. No cross-garden data leakage possible
