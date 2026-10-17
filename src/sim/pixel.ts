import { PixelState, SimConfig } from './types';
import { createRNG } from './rng';

export function createPixels(config: SimConfig, rng: ReturnType<typeof createRNG>): PixelState[] {
  const pixels: PixelState[] = [];
  const spawnRadius = config.arenaRadius * 0.65;

  for (let i = 0; i < config.pixelCount; i++) {
    // Distribute around Baymax in an arc
    const angle = (i / config.pixelCount) * Math.PI * 2 + rng.range(-0.15, 0.15);
    const dist = rng.range(spawnRadius * 0.55, spawnRadius);

    pixels.push({
      id: i + 1,
      pos: {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      },
      vel: { x: 0, y: 0 },
      role: 'decoy',
      alive: true,
      knowledge: 0,
      dodgeCooldown: 0,
      inContactWithBaymax: false,
      gripBrokenCooldown: 0,
      justDodged: false,
      promotedFlash: 0
    });
  }

  return pixels;
}

export function updatePixels(
  pixels: PixelState[],
  baymaxPos: { x: number; y: number },
  baymaxAngle: number,
  baymaxState: string,
  config: SimConfig,
  dt: number,
  rng: ReturnType<typeof createRNG>
): void {
  const cosA = Math.cos(baymaxAngle);
  const sinA = Math.sin(baymaxAngle);

  // Tactical Tripartite clamp positions around Baymax:
  // 1. Grabber target: Chest Chip (+20 units forward)
  const chestSlot = { x: baymaxPos.x + cosA * 20, y: baymaxPos.y + sinA * 20 };
  // 2. Puller target: Rear Cable Anchor (-28 units backward)
  const rearSlot = { x: baymaxPos.x - cosA * 28, y: baymaxPos.y - sinA * 28 };
  // 3. Holder left arm: -sinA * 24, cosA * 24
  const holderLSlot = { x: baymaxPos.x - sinA * 24, y: baymaxPos.y + cosA * 24 };
  // 4. Holder right arm: sinA * 24, -cosA * 24
  const holderRSlot = { x: baymaxPos.x + sinA * 24, y: baymaxPos.y - cosA * 24 };

  for (let i = 0; i < pixels.length; i++) {
    const p = pixels[i];
    if (!p.alive) continue;

    // Tick timers
    if (p.dodgeCooldown > 0) p.dodgeCooldown -= dt;
    if (p.gripBrokenCooldown > 0) p.gripBrokenCooldown -= dt;
    if (p.promotedFlash > 0) p.promotedFlash -= dt;
    p.justDodged = false;

    // Desired destination based on Role
    let target = { x: 0, y: 0 };
    const distToBaymax = Math.hypot(p.pos.x - baymaxPos.x, p.pos.y - baymaxPos.y);

    if (p.role === 'grabber') {
      target = chestSlot;
    } else if (p.role === 'puller') {
      target = rearSlot;
    } else if (p.role === 'holder') {
      const dL = Math.hypot(p.pos.x - holderLSlot.x, p.pos.y - holderLSlot.y);
      const dR = Math.hypot(p.pos.x - holderRSlot.x, p.pos.y - holderRSlot.y);
      target = dL < dR ? holderLSlot : holderRSlot;
    } else {
      // DECOY (SPLIT ATTENTION):
      // Orbit dynamically in and out of Baymax's scan cone to draw his attention!
      const orbitSpeed = 1.2 + (p.id % 3) * 0.4;
      const orbitAngle = (p.id * 1.5) + (Date.now() * 0.001 * orbitSpeed * (p.id % 2 === 0 ? 1 : -1));
      const orbitDist = 130 + Math.sin(orbitAngle * 3 + p.id) * 55;
      target = {
        x: baymaxPos.x + Math.cos(orbitAngle) * orbitDist,
        y: baymaxPos.y + Math.sin(orbitAngle) * orbitDist
      };
    }

    // Steering velocity
    const dx = target.x - p.pos.x;
    const dy = target.y - p.pos.y;
    const dist = Math.hypot(dx, dy);

    let desiredVx = 0;
    let desiredVy = 0;
    if (dist > 3) {
      desiredVx = (dx / dist) * config.pixelSpeed;
      desiredVy = (dy / dist) * config.pixelSpeed;
    }

    // Swarm separation
    let sepX = 0;
    let sepY = 0;
    for (let j = 0; j < pixels.length; j++) {
      if (i === j) continue;
      const other = pixels[j];
      if (!other.alive) continue;
      const odx = p.pos.x - other.pos.x;
      const ody = p.pos.y - other.pos.y;
      const odist = Math.hypot(odx, ody);
      if (odist > 0 && odist < 18) {
        const force = (18 - odist) / 18;
        sepX += (odx / odist) * force * config.pixelSpeed * 1.2;
        sepY += (ody / odist) * force * config.pixelSpeed * 1.2;
      }
    }

    // Blend movement
    const finalVx = desiredVx + sepX;
    const finalVy = desiredVy + sepY;

    p.vel.x += (finalVx - p.vel.x) * Math.min(1.0, dt * 7.0);
    p.vel.y += (finalVy - p.vel.y) * Math.min(1.0, dt * 7.0);

    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;

    // Arena boundary containment
    const arenaDist = Math.hypot(p.pos.x, p.pos.y);
    const maxPixelDist = config.arenaRadius - 15;
    if (arenaDist > maxPixelDist) {
      const bAngle = Math.atan2(p.pos.y, p.pos.x);
      p.pos.x = Math.cos(bAngle) * maxPixelDist;
      p.pos.y = Math.sin(bAngle) * maxPixelDist;
      p.vel.x *= -0.5;
      p.vel.y *= -0.5;
    }
  }
}
