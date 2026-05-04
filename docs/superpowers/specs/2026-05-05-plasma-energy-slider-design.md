# Plasma Energy Slider Design

## Goal

Upgrade the daily energy slider from a plain thumb-based range control into a high-impact plasma nitro energy rail, and make this upgraded rail the new prototype source of truth.

## Visual Direction

- Remove the visible round thumb from the energy bar.
- Use a dark glass rail with a bright yellow-white energy core and cyan plasma halo.
- Represent the current value with an angled nozzle/cut face instead of a circular knob.
- Render three trailing layers behind the nozzle: hot core, cyan flame, and long translucent afterimage.
- Add deterministic particle sparks that drift backward from the nozzle with varied size, opacity, and direction.
- Increase particle intensity while dragging and briefly after confirming energy.
- Keep the value label stable and never render `NaN%`.

## Implementation Boundaries

- Update `prototype/index.html` first so the prototype remains the visual truth.
- Update `apps/mobile/src/features/energy/components/EnergySlider.tsx` to match the new rail using React Native `View` and `Animated`.
- Avoid adding new rendering dependencies in this iteration.
- Preserve the existing page layout, copy, API behavior, and confirmation flow.

## Testing

- Extend Playwright parity coverage to assert the plasma rail structure exists.
- Add a regression assertion that clicking the energy control never renders `NaN%`.
- Keep existing prototype visual regression anchors aligned with the new rail geometry.

## Documentation

- Update `产品需求设计文档.md` to record the plasma energy rail as the current implementation target.
- Update `docs/prototype-parity/2026-05-04-full-page-diff-audit.md` and the progress log with the change and verification result.
