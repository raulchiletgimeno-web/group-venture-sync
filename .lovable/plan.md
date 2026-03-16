

## Plan: Unify notification badges across YORMIT

### Problem
Two badge styles exist with inconsistent sizing, font, shadow, and positioning:

| Location | Size | Font | Shadow |
|---|---|---|---|
| TripCard (line 34) | `min-w-[22px] h-[22px]` | `text-[11px]` | `shadow-[0_2px_8px_rgba(239,68,68,0.4)]` + `ring-2 ring-card` |
| TripDashboard sections (line 464) | `min-w-[20px] h-5` | `text-[10px]` | `shadow-[0_1px_4px_rgba(239,68,68,0.35)]`, no ring |

### Solution

Create a single reusable `UnseenBadge` component with one consistent design token set, then use it in both locations.

### 1. Create `src/components/UnseenBadge.tsx`

A small component that renders the red gradient pill with a count. Props:
- `count: number` — if 0, renders nothing
- `size?: "sm" | "default"` — `default` for trip cards (absolute positioned by parent), `sm` for inline section badges
- Caps display at "99+"

Design tokens (unified):
- **Shape**: `rounded-full`
- **Color**: `bg-gradient-to-br from-red-500 to-rose-400 text-white`
- **Font**: `font-bold tracking-tight`
- **Shadow**: `shadow-[0_2px_6px_rgba(239,68,68,0.4)]`
- **Default size**: `min-w-[22px] h-[22px] px-1.5 text-[11px]`
- **Small size**: `min-w-[18px] h-[18px] px-1 text-[10px]`

### 2. Update `src/components/TripCard.tsx`

Replace the inline badge `<span>` (lines 33-37) with `<UnseenBadge count={unseenCount} />` wrapped in an absolute-positioned container (`absolute -top-2 -right-2 z-10 ring-2 ring-card rounded-full`).

### 3. Update `src/pages/TripDashboard.tsx`

Replace the inline badge `<span>` (lines 463-466) with `<UnseenBadge count={count} size="sm" />` — no absolute positioning needed, stays inline in the flex row.

### Result

Every notification badge in the app uses the same component, same gradient, same font weight, same shadow. Two size variants handle the two contexts (card overlay vs inline). Adding badges anywhere else in the future just requires importing `UnseenBadge`.

