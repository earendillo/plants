# Plan: Optional Plant Groups Within Gardens

## Context

Plants currently display as a flat grid within each garden. The user wants to optionally organize plants into named groups (e.g., "Near window", "On shelf", "Succulents"). Groups are user-defined, per-garden, and fully optional — gardens without groups remain unchanged.

## Design Reference

Claude Design handoff bundle: `https://api.anthropic.com/v1/design/h/AldZGy5Ik3gRVtN4U3EwzQ?open_file=Plants+App.html`

Key visual decisions from the prototype (Greenhouse variation):
- **Group container**: `border-radius: 24px`, faint border (`rgba(255,255,255,0.09)`), subtle bg (`rgba(255,255,255,0.025)`), spans both grid columns
- **Group header**: folder icon + uppercase name (11px, `fgDim`, 0.06em letter-spacing) + plant count (10px, dimmed)
- **Inner grid**: same 2-col layout as ungrouped plants, 10px gap
- **Ungrouped plants**: render as standalone cards in the main grid, no wrapper
- Groups are a lightweight visual bracket, not a heavy nested card

## Data Model

**New table: `plant_groups`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | `gen_random_uuid()` |
| garden_id | uuid NOT NULL | FK → gardens(id) ON DELETE CASCADE |
| name | text NOT NULL | |
| position | integer NOT NULL | DEFAULT 0, for ordering |
| created_at | timestamptz NOT NULL | DEFAULT now() |
| | UNIQUE(garden_id, name) | |

**Modify `plants`**: add `group_id uuid REFERENCES plant_groups(id) ON DELETE SET NULL`

`ON DELETE SET NULL` = deleting a group auto-ungroups its plants. No app-level cleanup.

## Implementation Steps

### Step 1 — Migration
**New file**: `supabase/migrations/20260506000000_add_plant_groups.sql`
- Create `plant_groups` table
- Enable RLS
- Add `group_id` nullable column to `plants`
- Index: `plant_groups(garden_id)`, `plants(group_id)`
- RLS policies (mirror plants pattern):
  - SELECT: garden owner OR garden_members OR guests (same 3-branch pattern)
  - INSERT/UPDATE/DELETE: garden owner only

### Step 2 — Types & DB Layer
**Run**: `npm run update-types` → re-read `types/supabase.ts`

**Modify `types/index.ts`**:
- Add `PlantGroup` type: `{ id, gardenId, name, position, createdAt }`
- Add `PlantGroupInsert = Omit<PlantGroup, 'id' | 'createdAt'>`
- Add `groupId: string | null` to `Plant`

**New file `lib/db/plant-groups.ts`**:
- `DbPlantGroup` snake_case type + `toPlantGroup()` mapper
- `getPlantGroups(gardenId)` — ordered by position ASC, created_at ASC
- `createPlantGroup(data)`, `updatePlantGroup(id, data)`, `deletePlantGroup(id)`
- `reorderPlantGroups(gardenId, orderedIds[])` — bulk position update

**Modify `lib/db/plants.ts`**:
- Add `group_id` to `DbPlant`, `toPlant()`, insert/update flows

### Step 3 — API Routes
**New `app/api/gardens/[id]/groups/route.ts`**:
- GET — list groups for garden
- POST — create group (Zod: `name` 1-50 chars, optional `position`)

**New `app/api/gardens/[id]/groups/[groupId]/route.ts`**:
- PUT — rename/reposition
- DELETE — delete group (plants auto-ungrouped by DB)

**Modify `app/api/plants/route.ts`**: add `groupId: z.string().uuid().nullable().optional()` to createSchema

**Modify `app/api/plants/[id]/route.ts`**: add `groupId` to updateSchema

### Step 4 — React Query Hook
**Modify `hooks/queries.ts`**:
- Add `usePlantGroups(gardenId)` hook with queryKey `['plantGroups', gardenId]`

### Step 5 — i18n
**Modify `messages/en.json` and `messages/pl.json`**:
- New namespace `plantGroups`: ungrouped, manageGroups, addGroup, deleteConfirm, noGroup, etc.
- Add `groupLabel` to `plantFormFields`

### Step 6 — Plant Form (group assignment)
**Modify `components/PlantFormFields.tsx`**:
- Add optional `PlantGroup[]` and group selection props
- Render a `GroupSelect` dropdown (after GardenSelect), with "No group" option
- Only show when groups exist for the selected garden

**Modify `components/PlantForm.tsx`**:
- Add `selectedGroupId` state, init from `plant?.groupId`
- Fetch groups via `usePlantGroups(selectedGardenId)`
- Reset group to null when garden changes
- Include `groupId` in submit body

### Step 7 — Plants Page (grouped display)
**Modify `components/PlantsPageContent.tsx`**:
- Fetch `usePlantGroups(resolvedId)`
- If no groups exist → render flat grid (unchanged behavior)
- If groups exist → partition plants by groupId:
  - Each group: collapsible section with header (name + plant count + chevron)
  - Ungrouped plants: rendered last under "Ungrouped" header (only if there are also grouped plants)
  - Each section body: same `grid grid-cols-2 gap-3` of PlantCards

### Step 8 — Quick-Assign via Long-Press
**New `components/PlantCardContextMenu.tsx`** (~80 lines):
- Long-press (touch) or right-click (desktop) on a PlantCard opens an action sheet
- Action sheet shows "Move to group" with list of available groups + "No group" option
- On select: PATCH `/api/plants/[id]` with new `groupId`, invalidate queries
- Only shown when groups exist for the current garden
- Only available to garden owners / limited_editors (not guests)

**Modify `components/PlantCard.tsx`**:
- Wrap card with long-press handler (e.g., `useLongPress` hook or pointer events with timeout)
- Pass plant id and current groupId to context menu

**i18n**: Add `moveToGroup`, `removeFromGroup` keys to `plantGroups` namespace

### Step 9 — Manage Groups Drawer/Dialog
**New `components/ManageGroupsDrawer.tsx`** (~100 lines):
- Drawer on mobile, Dialog on desktop (responsive pattern)
- List groups with inline rename
- Delete button per group (confirm: "plants become ungrouped")
- "Add group" input at bottom
- Up/down arrows for reorder (or drag — arrows simpler)
- Only accessible to garden owners via button in PlantsPageContent

### Step 10 — Guest View (optional, can defer)
- Update `GuestPlantList.tsx` to show group section headers if groups exist

## Critical Files
- `types/index.ts` — add PlantGroup, modify Plant
- `lib/db/plants.ts` — add group_id mapping
- `lib/db/plant-groups.ts` — new DB layer
- `hooks/queries.ts` — add usePlantGroups
- `components/PlantsPageContent.tsx` — grouped rendering
- `components/PlantForm.tsx` + `PlantFormFields.tsx` — group selector
- `components/PlantCardContextMenu.tsx` — long-press quick-assign UI
- `components/ManageGroupsDrawer.tsx` — new group CRUD UI (Drawer on mobile)
- `app/api/gardens/[id]/groups/route.ts` — new API
- `app/api/plants/route.ts` + `[id]/route.ts` — add groupId

## Verification
1. `npx supabase db push` — migration applies cleanly
2. `npm run update-types` — types regenerate with new table + column
3. `npx tsc --noEmit` — no type errors
4. `npm run lint` — passes
5. Manual test: create groups, assign plants, verify collapsible sections render
6. Manual test: delete a group → plants become ungrouped
7. Manual test: garden with no groups → flat grid unchanged
8. Manual test: limited_editor sees groups but can't manage them
