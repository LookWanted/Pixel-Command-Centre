# Baymax: Portal Escape

## Existing app, in five lines

1. Vite boots React from `src/main.tsx`, which renders `App` and imports the shared global stylesheet.
2. `App.tsx` currently uses a minimal query-string view switch between the landing page and the 3D simulator; no router library is installed.
3. The landing lives in `src/landing`, while the React Three Fiber simulator lives in `src/scene` and its stateful controls live in `src/ui` and Zustand.
4. Simulation mechanics are plain TypeScript under `src/sim`; styles combine Tailwind utilities with authored rules in `src/index.css`.
5. The new platformer is isolated in `src/game`, lazy-loaded at `/play`, and does not replace landing or simulator logic.

## Goal

An original 2D pixel-action game about Baymax escaping portal wreckage while a rogue Pixel commander directs microbots. The visual reference is layered, exploratory pixel worlds and precise platforming—not copied art, assets, sounds, or code.

## Foundations

- Internal render surface: 384 × 216; scale with nearest-neighbour pixels and letterboxing.
- A fixed 60 Hz accumulator owns gameplay state. Rendering reads state only.
- Deterministic seeded random helpers and reusable pools support later enemy/particle work.
- Input supports keyboard immediately; gamepad and touch attach to the same abstract actions in later phases.
- Game code is plain TypeScript inside `src/game`; React hosts the canvas, title screen and accessible controls only.

## Art language

- Original 32-colour indigo, teal, rust, grass, stone and Baymax-white palette.
- Procedural canvas tiles: layered ground, grass lip, cracks, crystal highlights and a slowly rotating portal.
- Baymax is an original pixel silhouette: white rounded body, connected eye dots, red armour accent and thruster glow.
- The HUD uses short operational language: cells, gears, lives, Hive adapt.

## Game loop

1. Move, run and variable-jump through a side-scrolling scrap world.
2. Stomp or punch microbots and collect gears/cells.
3. Pixel commanders learn from dodges through one shared Hive adapt value.
4. Reach checkpoints and the portal; later levels introduce caves, industrial hazards and Pixel Prime.

## Phase plan

1. Engine, canvas scaling, input, camera and debug overlay.
2. Tile collisions, Baymax movement, coyote time and variable jump.
3. Procedural pixel world, parallax, lighting and particles.
4. Microbots, fist, pickups, health and checkpoints.
5. Pixel bot AI and shared Hive adaptation.
6. Levels, saving and level flow.
7. Pixel Prime and ending.
8. Audio, touch, accessibility, tests and documentation.

## Initial controls

- Move: A/D or arrow keys
- Jump: Space, W or Up
- Run: Shift
- Rocket fist: J or X
- Pause: P or Escape
- Debug: F3

