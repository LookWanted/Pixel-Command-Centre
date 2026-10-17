import { BaymaxState, PixelState, SimConfig, SimEvent } from './types';
import { createRNG } from './rng';
import { getPixelDodgeChance, processLungeObservation } from './hive';

export function createBaymax(config: SimConfig): BaymaxState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    angle: 0,
    targetPixelId: null,
    state: 'scan',
    stateTimer: 0,
    retargetTimer: 0,
    lungeTimer: 0,
    lungeStartPos: { x: 0, y: 0 },
    lungeTargetPos: { x: 0, y: 0 },
    lungeProgress: 0,
    scanRadius: 210,
    wastedRetargets: 0,
    grippedCount: 0
  };
}

export interface BaymaxUpdateResult {
  destroyedPixelIds: number[];
  dodgedPixelIds: number[];
  gripsBroken: boolean;
  events: SimEvent[];
  newSharedKnowledge: number;
}

export function updateBaymax(
  baymax: BaymaxState,
  pixels: PixelState[],
  config: SimConfig,
  dt: number,
  time: number,
  rng: ReturnType<typeof createRNG>,
  currentSharedKnowledge: number
): BaymaxUpdateResult {
  const events: SimEvent[] = [];
  const destroyedPixelIds: number[] = [];
  const dodgedPixelIds: number[] = [];
  let gripsBroken = false;
  let newSharedKnowledge = currentSharedKnowledge;

  if (baymax.state === 'pacified') {
    baymax.vel = { x: 0, y: 0 };
    return { destroyedPixelIds, dodgedPixelIds, gripsBroken, events, newSharedKnowledge };
  }

  // Calculate speed slow-down from gripping Holder Pixels
  // slows Baymax 25% per gripping Pixel, min 25% speed
  const slowFactor = Math.max(0.25, 1.0 - baymax.grippedCount * 0.25);
  const effectiveSpeed = config.baymaxSpeed * slowFactor;

  // 1. SPLIT ATTENTION / RETARGETING
  baymax.retargetTimer += dt;
  if (baymax.retargetTimer >= config.retargetInterval) {
    baymax.retargetTimer = 0;

    // Find all alive Pixels inside scan radius
    const pixelsInRange = pixels.filter(p => {
      if (!p.alive) return false;
      const d = Math.hypot(p.pos.x - baymax.pos.x, p.pos.y - baymax.pos.y);
      return d <= baymax.scanRadius;
    });

    if (pixelsInRange.length > 0) {
      // Pick random Pixel inside scan radius
      const chosenIdx = Math.floor(rng.range(0, pixelsInRange.length));
      const newTarget = pixelsInRange[chosenIdx];

      if (baymax.targetPixelId !== null && baymax.targetPixelId !== newTarget.id) {
        // Switch to a different pixel counts as a wasted retarget!
        baymax.wastedRetargets++;
        events.push({
          id: `retarget_${time}_${baymax.wastedRetargets}`,
          time,
          kind: 'retarget_wasted',
          message: `[ATTENTION SPLIT] Baymax distracted! Switch to Unit #${newTarget.id.toString().padStart(2, '0')} (Wasted: ${baymax.wastedRetargets})`,
          data: { newTargetId: newTarget.id, wastedRetargets: baymax.wastedRetargets }
        });
      }
      baymax.targetPixelId = newTarget.id;
    } else {
      // If nobody in scan radius, find closest alive pixel or patrol
      const closest = pixels.filter(p => p.alive).sort((a, b) => {
        const da = Math.hypot(a.pos.x - baymax.pos.x, a.pos.y - baymax.pos.y);
        const db = Math.hypot(b.pos.x - baymax.pos.x, b.pos.y - baymax.pos.y);
        return da - db;
      })[0];

      if (closest) {
        baymax.targetPixelId = closest.id;
      }
    }
  }

  // Verify target is still alive
  if (baymax.targetPixelId !== null) {
    const targetP = pixels.find(p => p.id === baymax.targetPixelId);
    if (!targetP || !targetP.alive) {
      baymax.targetPixelId = null;
    }
  }

  // 2. STATE MACHINE: Scan / Move / Lunge Prep / Lunging / Recovering
  baymax.lungeTimer += dt;

  if (baymax.state === 'scan' || baymax.state === 'locked' || baymax.state === 'patrol') {
    // Check if ready to initiate lunge
    if (baymax.lungeTimer >= config.lungeInterval) {
      baymax.lungeTimer = 0;
      baymax.state = 'lunge_prep';
      baymax.stateTimer = 0.45; // 0.45s telegraph / windup

      // Target direction
      let targetX = baymax.pos.x + Math.cos(baymax.angle) * config.lungeReach;
      let targetY = baymax.pos.y + Math.sin(baymax.angle) * config.lungeReach;

      if (baymax.targetPixelId !== null) {
        const tgt = pixels.find(p => p.id === baymax.targetPixelId);
        if (tgt && tgt.alive) {
          const dx = tgt.pos.x - baymax.pos.x;
          const dy = tgt.pos.y - baymax.pos.y;
          const dist = Math.hypot(dx, dy);
          const reach = Math.min(dist, config.lungeReach);
          const dirX = dist > 0.001 ? dx / dist : Math.cos(baymax.angle);
          const dirY = dist > 0.001 ? dy / dist : Math.sin(baymax.angle);
          targetX = baymax.pos.x + dirX * reach;
          targetY = baymax.pos.y + dirY * reach;
          baymax.angle = Math.atan2(dirY, dirX);
        }
      }

      baymax.lungeStartPos = { ...baymax.pos };
      baymax.lungeTargetPos = { x: targetX, y: targetY };
      baymax.lungeProgress = 0;

      events.push({
        id: `lunge_prep_${time}`,
        time,
        kind: 'lunge_started',
        message: `[COMBAT ALERT] Baymax initiating combat dash! Vector: (${Math.round(targetX)}, ${Math.round(targetY)})`,
        data: { targetPos: baymax.lungeTargetPos }
      });
    } else {
      // Normal pursuit / movement towards current target
      if (baymax.targetPixelId !== null) {
        const targetP = pixels.find(p => p.id === baymax.targetPixelId);
        if (targetP) {
          const dx = targetP.pos.x - baymax.pos.x;
          const dy = targetP.pos.y - baymax.pos.y;
          const dist = Math.hypot(dx, dy);
          const targetAngle = Math.atan2(dy, dx);
          
          // Smooth rotation
          let diff = targetAngle - baymax.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          baymax.angle += diff * Math.min(1.0, dt * 4.0);

          if (dist > 35) {
            baymax.vel.x = Math.cos(baymax.angle) * effectiveSpeed;
            baymax.vel.y = Math.sin(baymax.angle) * effectiveSpeed;
            baymax.pos.x += baymax.vel.x * dt;
            baymax.pos.y += baymax.vel.y * dt;
          } else {
            baymax.vel = { x: 0, y: 0 };
          }
          baymax.state = 'locked';
        }
      } else {
        // Slow circle patrol in arena
        baymax.angle += 0.3 * dt;
        baymax.vel.x = Math.cos(baymax.angle) * (effectiveSpeed * 0.4);
        baymax.vel.y = Math.sin(baymax.angle) * (effectiveSpeed * 0.4);
        baymax.pos.x += baymax.vel.x * dt;
        baymax.pos.y += baymax.vel.y * dt;
        baymax.state = 'patrol';
      }
    }
  } else if (baymax.state === 'lunge_prep') {
    // Wind up telegraph
    baymax.stateTimer -= dt;
    baymax.vel = { x: 0, y: 0 };
    if (baymax.stateTimer <= 0) {
      baymax.state = 'lunging';
      baymax.stateTimer = 0.35; // 0.35s lunge execution duration
      baymax.lungeProgress = 0;

      // HIVE MIND TRIGGER: Each lunge is observed by Pixels within range+160!
      const hiveResult = processLungeObservation(
        pixels,
        baymax.pos,
        baymax.scanRadius,
        currentSharedKnowledge,
        config,
        time
      );
      newSharedKnowledge = hiveResult.newSharedKnowledge;
      events.push(...hiveResult.events);

      // Lunges break grips!
      gripsBroken = true;
      events.push({
        id: `grip_break_${time}`,
        time,
        kind: 'grip_broken',
        message: `[KINETIC SHOCK] Baymax lunge broke all swarm grips!`,
        data: {}
      });
    }
  } else if (baymax.state === 'lunging') {
    // High-speed dash along lunge trajectory
    const dashDuration = 0.35;
    const progressInc = dt / dashDuration;
    baymax.lungeProgress = Math.min(1.0, baymax.lungeProgress + progressInc);

    const prevPos = { ...baymax.pos };
    baymax.pos.x = baymax.lungeStartPos.x + (baymax.lungeTargetPos.x - baymax.lungeStartPos.x) * baymax.lungeProgress;
    baymax.pos.y = baymax.lungeStartPos.y + (baymax.lungeTargetPos.y - baymax.lungeStartPos.y) * baymax.lungeProgress;

    // Hitbox check along dash: any pixel touched mid-dash is destroyed unless it dodged
    const killRadius = 26;
    for (const p of pixels) {
      if (!p.alive) continue;
      const dist = Math.hypot(p.pos.x - baymax.pos.x, p.pos.y - baymax.pos.y);
      if (dist <= killRadius) {
        // Calculate dodge chance: dodge chance = knowledge * 0.85
        const dodgeChance = getPixelDodgeChance(p, newSharedKnowledge, config.hiveMode);
        const roll = rng.next();

        if (roll < dodgeChance) {
          // Pixel successfully dodges!
          p.justDodged = true;
          p.dodgeCooldown = 0.8;
          // Displace pixel outward
          const pushAngle = Math.atan2(p.pos.y - baymax.pos.y, p.pos.x - baymax.pos.x) || rng.range(0, Math.PI * 2);
          p.pos.x += Math.cos(pushAngle) * 45;
          p.pos.y += Math.sin(pushAngle) * 45;
          dodgedPixelIds.push(p.id);

          events.push({
            id: `dodge_${time}_${p.id}`,
            time,
            kind: 'lunge_dodged',
            message: `[EVASION] Unit #${p.id.toString().padStart(2, '0')} dodged combat dash (Prob: ${(dodgeChance * 100).toFixed(0)}%)!`,
            data: { pixelId: p.id, dodgeChance }
          });
        } else {
          // Destroyed!
          p.alive = false;
          p.deathTime = time;
          p.inContactWithBaymax = false;
          destroyedPixelIds.push(p.id);

          events.push({
            id: `kill_${time}_${p.id}`,
            time,
            kind: 'pixel_destroyed',
            message: `[CASUALTY] Unit #${p.id.toString().padStart(2, '0')} (${p.role.toUpperCase()}) destroyed by Baymax kinetic strike!`,
            data: { pixelId: p.id, role: p.role }
          });
        }
      }
    }

    if (baymax.lungeProgress >= 1.0) {
      baymax.state = 'recovering';
      baymax.stateTimer = 0.4; // 0.4s brief recovery pause
    }
  } else if (baymax.state === 'recovering') {
    baymax.stateTimer -= dt;
    baymax.vel = { x: 0, y: 0 };
    if (baymax.stateTimer <= 0) {
      baymax.state = 'scan';
    }
  }

  // Constrain Baymax within arena bounds
  const distFromCenter = Math.hypot(baymax.pos.x, baymax.pos.y);
  const maxBaymaxDist = config.arenaRadius - 30;
  if (distFromCenter > maxBaymaxDist) {
    const angle = Math.atan2(baymax.pos.y, baymax.pos.x);
    baymax.pos.x = Math.cos(angle) * maxBaymaxDist;
    baymax.pos.y = Math.sin(angle) * maxBaymaxDist;
  }

  return {
    destroyedPixelIds,
    dodgedPixelIds,
    gripsBroken,
    events,
    newSharedKnowledge
  };
}
