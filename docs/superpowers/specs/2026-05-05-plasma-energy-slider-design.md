# Gold Capsule Energy Bar Design

## Goal

Rebuild the daily energy control to 1:1 match the user-provided target image: a calm, premium gold capsule energy bar inside the dark forest product style.

## Visual Direction

- Default daily energy value is `62%`.
- Use an dark-gold glass card with a thin gold border.
- Use a long dark capsule track with a thin gold outline.
- Fill the track with a gold capsule gradient, not a separate circular thumb.
- Keep the fill rounded at both ends and proportional to the value.
- Add subtle internal shine, a restrained moving highlight, and small gold particles inside the fill.
- Add cyan HUD endpoint corners and fine decorative lines around the rail.
- Render the tail mist as a transparent layer with a horizontal fade gradient so it disappears naturally without a rectangular yellow/cyan boundary.
- Avoid orange fire, large plasma blocks, independent round knobs, or exaggerated game UI effects.
- Keep `0%` visually clean: no stray glow block, no leftover cap, no `NaN%`.

## Implementation Boundaries

- `prototype/index.html` remains the visual source of truth.
- `apps/mobile/src/features/energy/components/EnergySlider.tsx` implements the mobile version with React Native `View`, `LinearGradient`, and lightweight `Animated`.
- No Skia dependency in this pass; Skia can be added later for true procedural particles if the static 1:1 target needs more motion.
- Preserve existing page layout, copy, API behavior, and confirmation flow.

## Testing

- Playwright parity checks must assert default `62%`, gold capsule structure, HUD line/corner counts, particle count, fill ratio, a transparent tail container with a gradient fade child, finger-follow dragging, and clean `0%` state.
- Existing prototype visual regression must remain green.

## Documentation

- Update `产品需求设计文档.md`, the parity audit, and the progress log to record the target-image gold capsule bar as the current acceptance baseline.
