# Shared Garden Indicator & Add Button Guard

**Date:** 2026-05-07  
**Status:** Approved

## Problem

When a user views a shared (non-owned) garden and taps the Add tab in the bottom bar, they are routed to `/plants/new?garden=<id>`. There is no visual distinction between owned and shared gardens, so users have no indication that Add is unavailable for shared gardens.

## Scope

- Mobile bottom tab bar (Add tab)
- `GardenPicker` dropdown (both Today and Plants screens)
- No changes to desktop sidebar or any server-side logic

---

## Architecture

### Shared State: Extend `GardenNavigationContext`

Add two fields to the existing context:

```ts
isOwnGarden: boolean | null   // null = unknown (no garden selected yet)
setActiveGarden: (garden: Garden | null) => void
```

`GardenNavigationProvider` holds this state via `useState`. `GardenPicker` calls `setActiveGarden(activeGarden)` in a `useEffect` whenever its resolved active garden changes. Both `BottomTabBar` and the indicator in `GardenPicker`'s trigger button consume `isOwnGarden`.

No new files. No new providers.

---

## Components

### `GardenNavigationContext`

- Add `isOwnGarden: boolean | null` (default `null`) via `useState`
- Add `setActiveGarden: (garden: Garden | null) => void` that derives and sets `isOwnGarden` from `garden.role === 'owner'`
- Export both through the context value

### `GardenPicker`

**Trigger button — shared indicator:**
- Owned garden: dot is `bg-brand-cta` (green, current)
- Shared garden: dot is `bg-brand-fg-dim` (muted) + a small `"Shared"` text label appears inline next to the garden name, styled `text-brand-fg-dim text-[10px]`

**`useEffect` to sync context:**
```ts
useEffect(() => {
  setActiveGarden(activeGarden ?? null)
}, [activeGarden?.id])
```

**Dropdown list items — ownership hint:**
- Each garden row in the dropdown shows a small role badge: `Owner` / `Shared` in muted text on the right side, so the user can see all roles at a glance when switching.

### `BottomTabBar`

When `isOwnGarden === false`:
- Render the Add tab as a `<span>` (not `<Link>`) — no navigation on tap
- Icon and label use the same inactive color (`text-brand-fg-dim`), plus `opacity-40` to signal it's disabled
- No tooltip or toast needed (the GardenPicker indicator already communicates the reason)

When `isOwnGarden === null` (loading / no garden):
- Render Add tab normally (same as current behavior — the add page will handle any authorization edge cases server-side)

---

## Data Flow

```
GardenNavigationProvider (layout)
  ├── GardenPicker
  │     reads: gardens[], activeGardenId
  │     calls: setActiveGarden(activeGarden) on mount/change
  │     reads: isOwnGarden → dot color + "Shared" label
  └── BottomTabBar
        reads: isOwnGarden → Link vs span for Add tab
```

---

## Out of Scope

- Desktop sidebar Add button (not present)
- Server-side authorization for `/plants/new` (already handled by RLS)
- Toast or error message when tapping disabled Add (not needed — indicator is sufficient)
- Hiding the Add tab entirely (disabled is clearer than absent)
