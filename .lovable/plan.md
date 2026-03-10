

## Plan: Adjust Luggage icon size and stroke in YORMIT logo

**Problem**: The Luggage icon is slightly smaller than the letters and its black outline is thinner than the `2px` `WebkitTextStroke` on the text.

**Changes** (single file: `src/pages/Landing.tsx`, line 67):

1. **Increase icon size** from `0.85em` to `0.95em` -- this will make the icon match the cap height of the letters.
2. **Increase strokeWidth** from `0.5` to `0.8` -- the text uses `WebkitTextStroke: 2px`. For an SVG icon rendered at ~72px (text-7xl), a `strokeWidth` of ~0.8 produces a visual stroke equivalent to ~2px text stroke.

```tsx
Y<Luggage 
  className="mx-[-2px]" 
  style={{ height: '0.95em', width: '0.95em' }} 
  strokeWidth={0.8} 
  stroke="black" 
  fill="hsl(182 50% 62%)" 
/>RMIT
```

