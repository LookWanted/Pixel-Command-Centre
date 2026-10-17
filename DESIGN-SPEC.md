# HiveGrid: Pixel Command Center — Design Specification

## Existing architecture

1. `src/App.tsx` switches between the cinematic landing page and the full-screen simulator.
2. `src/store/useStore.ts` exposes configuration, simulation snapshots, controls, events, and benchmark state.
3. `src/sim` is the pure deterministic world, roles, Baymax behavior, seeded RNG, and worker benchmark layer.
4. `src/scene` translates snapshots into the React Three Fiber arena, actors, effects, links, and camera.
5. `src/ui` and `src/landing` are presentation and user input layers; they must not mutate simulation rules directly.

## Reference analysis

| Reference | Grid and density | Palette | Type and components |
| --- | --- | --- | --- |
| Tracking console | Wide header, three metric cells, modular 3-up cards, data table | Charcoal, peach alerts, muted green | Round-but-tight dark panels, headline plus compact operational rows |
| Noise heatmap | Fixed navigation rail, dominant map, narrow analytic rail | Near-black, cobalt/blue, neutral gray | Large map title, small labels, cards reserved for decisions |
| System performance | Airy control bar, map as primary canvas, low-density bottom metrics | Black/charcoal, teal, pale lime, orange only for alert | Light-weight large figures, circular gauges, floating toolbars |
| ISR console | Three operational columns, bottom timeline, dense scan field | Black, phosphor green, amber, danger red | Compact mono labels, strong dividers, functional coordinate data |

## Tokens

- Canvas `#0b0f0e`, panel `rgba(17,24,22,.85)`, border `rgba(255,255,255,.07)`.
- Primary phosphor `#6dffb0`, teal `#1f8f78`, amber `#ffb020`, danger `#ff4d4d`, friendly `#4fc3f7`.
- Console labels use a condensed uppercase treatment; numeric telemetry uses a tabular mono style; paragraphs stay readable sans-serif.
- Tight `6px` console corners, quiet borders, minimal bloom, and teal ambient light behind the bottom surface.

## Main-screen wireframe

```text
┌ classification / callsign / scenario / mode / start-pause-abort ┐
├ trainee: integrity · policy · readiness ┬ live 3D / tactical map ┬ opposition: roster · clamp · comms ┤
│                                           └ radar · range rings · orders toolbar ┘                 │
├────────────────────────────── event timeline / ROE / orders queue ────────────────────────────────┤
└──────────────────────────── after-action review (when an episode ends) ───────────────────────────┘
```

## Component plan

- Keep: `SimScene`, `Arena`, `BaymaxModel`, `PixelSwarm`, `HiveLinks`, `CameraRig`, simulation worker, soundtrack/cinematics.
- Restyle: `App`, `SimpleHeader`, `SimpleControls`, `SimpleAnalytics`, `SimpleRoster`, `Timeline`, `GamingHUDOverlay`.
- Build next: `TraineePanel`, `OppositionPanel`, `TrainingToolbar`, `TacticalMap`, `QualificationPanel`, and `AfterActionReview`.
- The existing triggers map to compact controls: feint, backup test, pulse, hive, clamp, camera, playback, training, and benchmark.
