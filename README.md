# HiveGrid: Pixel Command Center

HiveGrid is an interactive 3D command-center experience built around a Pixel swarm and Baymax. It combines a cinematic landing page with a playable real-time simulation: direct the swarm, learn from combat encounters, and work to remove Baymax's red combat chip.

## What’s included

- A cinematic landing experience with a looping portal backdrop, a cursor-responsive Pixel model, and the supplied soundtrack.
- A real-time react-three-fiber arena featuring Baymax and a growing Pixel swarm.
- Swarm behaviors for distraction, backup roles, hive learning, and chip extraction.
- A focused command interface with live status, a learning signal chart, activity log, playback controls, and roster.
- Manual mode: move Baymax with `W`, `A`, `S`, and `D` (or the arrow keys), use `Space` to boost, and click the arena to neutralize the nearest Pixel.
- Success and failure outcomes: a completed extraction can restore Baymax, while combat can also leave him affected.

## Tech stack

- React 18 + TypeScript
- Vite
- Three.js through `@react-three/fiber` and `@react-three/drei`
- Zustand for simulation state
- Framer Motion and CSS for interface motion

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal. Open it in a modern desktop browser.

### Production build

```bash
npm run build
npm run preview
```

## How to use it

1. Explore the landing page and move the pointer to inspect the Pixel model.
2. Choose **Launch Command Center**.
3. Use the mission actions to distract Baymax, share hive learning, and begin chip removal.
4. Turn on **Manual mode** if you want direct Baymax movement with the keyboard.
5. Open **How it works** for the complete control guide and objective.

## Media and models

Project media is served from `public/assets`, including the portal video, soundtrack, Pixel GLB, Baymax OBJ, and Satoshi font files. Replace an asset in that directory using the same filename to update the experience without changing application code.

## Audio note

The landing page requests soundtrack playback as soon as it opens and retries on first interaction. Some browsers intentionally block unmuted autoplay on a fresh page load; this restriction is controlled by the browser and cannot be overridden by a website. If that happens, any click or key press starts the soundtrack.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Type-check and create a production build. |
| `npm run preview` | Serve the production build locally. |

## Project status

This is a fictional interactive training scenario inspired by *Big Hero 6*. It is a creative demo, not an operational control system.
