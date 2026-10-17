# HiveGrid™ // Full-Screen Hero Landing Page & Pixel Command Center

A full-screen interactive hero landing page and 3D simulation command center for **HiveGrid™**, an autonomous cooperative microbot swarm built to rescue Baymax from a corrupted red combat chip.

---

## 🌟 Hero Landing Page Features

### 1. Fonts & Typography
- Loaded via `index.html`:
  - **Heading font**: `HelveticaNowDisplay-Medium`
  - **Body font**: `HelveticaNowDisplayW01-Rg`
- CSS variables defined in `index.css`:
  - `--font-heading`: `'HelveticaNowDisplay-Medium', 'Helvetica Neue', Arial, sans-serif`
  - `--font-body`: `'HelveticaNowDisplayW01-Rg', 'Helvetica Neue', Arial, sans-serif`
- Entire page uses `var(--font-body)` except the logo text which uses `var(--font-heading)`.

### 2. Mouse-Scrub Background: 3D Robot Model
- Rather than an arbitrary video of a person, the landing page features Hiro's actual **3D Textured Microbot Model (`pixel-textured.glb`)** in the background, positioned at `70% center` (right-hand side of the viewport).
- As you move the mouse horizontally across the window, the 3D robot smoothly scrubs and rotates 360 degrees!
- A discreet bottom-right pill lets you toggle between the 3D model and the mouse-scrubbed Cloudfront video.

### 3. Top Navigation Bar (Fixed, z-index: 10)
- **Logo (left)**: Text `HiveGrid™` with decorative asterisk `✳︎`.
- **Desktop Links (center)**: `Simulator`, `Pixels`, `Story`, `Team` separated by commas.
- **Desktop CTA (right)**: `Launch the demo` (underlined, launches the simulator).
- **Mobile Menu**: Responsive 3-line hamburger with smooth 45° cross transition and full-screen backdrop-blurred overlay.

### 4. Hero Section
- **Blurred Intro Label**:
  - `Hey there, meet P.I.X.E.L,`
  - `HiveGrid's Pixel Intelligence for eXtraction, Evasion & Learning`
  - Filter: `blur(4px)`, font size: `clamp(18px, 4vw, 26px)`.
- **Typewriter Text**:
  - *"You made it through the portal. One robot couldn't save Baymax, so we built a swarm. Ready to train it?"*
  - Animated with custom `useTypewriter` hook and blinking white cursor (`animate-cursor-blink`).
- **Action Pill Buttons (Fade + Slide up at 400ms)**:
  - ⚪ `Launch the simulator` (transitions to Pixel Command Center)
  - ⚪ `Meet the Pixels` (opens 3D model specifications modal)
  - ⚪ `Watch the story` (opens Big Hero 6 mission log)
  - ⚪ `See how the hive learns` (explains the 4 doctrines)
  - ⭕ `Reach us: hello@hivegrid.dev` with 12x12 inline copy icon (copies to clipboard with instant feedback)

---

## 🎮 Pixel Command Center Simulator

Clicking **"Launch the simulator"** or **"Launch the demo"** launches into the 3D battlefield:
1. **Split Attention**: Baymax gets confused by multiple microbots, spinning erratically and wasting attack intervals.
2. **Autonomous Backup**: When a specialist unit falls, a reserve decoy immediately takes over its slot with a ring flash.
3. **Real-time Hive Mind**: Observations instantly propagate across all microbots, boosting dodge rates up to 85%+.
4. **Tripartite Teamwork**: Holder clamps the arm, Puller tethers from behind, Grabber extracts the red chip.

---

## 🚀 Running the Project

```bash
cd "/Users/namishdawar/Desktop/pixel-command-center"
npm run dev     # Serving live at http://127.0.0.1:5173/
npm run build   # Type-checked production bundle
```
