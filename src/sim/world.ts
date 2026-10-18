import { SimConfig, SimWorld, EpisodeResult } from './types';
import { createRNG } from './rng';
import { createPixels, updatePixels } from './pixel';
import { createBaymax, updateBaymax } from './baymax';
import { assignInitialRoles, checkRoleContact, handleBackupPromotions } from './roles';

export const DEFAULT_CONFIG: SimConfig = {
  // One visible airborne Pixel commander directs the nanobot swarm.
  pixelCount: 1,
  pixelSpeed: 115,
  baymaxSpeed: 68,
  retargetInterval: 2.0,
  lungeInterval: 3.6,
  lungeReach: 155,
  learnRate: 0.065,
  extractionTime: 26.0,
  hiveMode: true,
  missionMode: 'extract',
  simSpeed: 1,
  arenaRadius: 360
};

export function createWorld(
  config: SimConfig = DEFAULT_CONFIG,
  initialKnowledge: number = 0,
  seed: number = 42
): SimWorld {
  const rng = createRNG(seed);
  const pixels = createPixels(config, rng);
  assignInitialRoles(pixels, config.missionMode);
  const baymax = createBaymax(config);

  return {
    config: { ...config },
    pixels,
    baymax,
    hiveKnowledge: Math.max(0, Math.min(0.95, initialKnowledge)),
    extractionProgress: 0,
    timeElapsed: 0,
    status: 'running',
    statusReason: '',
    events: [
      {
        id: `init_0`,
        time: 0,
        kind: 'lunge_started',
        message: `[MISSION LAUNCH] Portal Zone Theta. Mode: ${config.missionMode.toUpperCase()}. Hive: ${config.hiveMode ? 'ACTIVE' : 'ISOLATED'}. Swarm: ${config.pixelCount} units.`,
        data: {}
      }
    ],
    recentEvents: [],
    lastLungeObservers: 0,
    seed,
    rngState: rng.getState()
  };
}

export function resetWorld(
  world: SimWorld,
  newConfig?: Partial<SimConfig>,
  keepKnowledge: boolean = true
): SimWorld {
  const cfg: SimConfig = {
    ...world.config,
    ...(newConfig || {})
  };
  const knowledge = keepKnowledge ? world.hiveKnowledge : 0;
  const newSeed = (world.seed + 1337) >>> 0;
  return createWorld(cfg, knowledge, newSeed);
}

/**
 * Deterministic simulation step (called with fixed dt, e.g. 1/60s)
 */
export function step(world: SimWorld, dt: number): SimWorld {
  if (world.status !== 'running') {
    return world;
  }

  const rng = createRNG(world.seed);
  rng.setState(world.rngState);

  world.recentEvents = [];
  world.timeElapsed += dt;

  // 1. Update Baymax state machine & combat dash
  const baymaxResult = updateBaymax(
    world.baymax,
    world.pixels,
    world.config,
    dt,
    world.timeElapsed,
    rng,
    world.hiveKnowledge
  );

  world.hiveKnowledge = baymaxResult.newSharedKnowledge;
  if (baymaxResult.events.length > 0) {
    world.events.push(...baymaxResult.events);
    world.recentEvents.push(...baymaxResult.events);
  }

  // 2. Break grips if lunge triggered
  if (baymaxResult.gripsBroken) {
    for (const p of world.pixels) {
      if (p.inContactWithBaymax) {
        p.inContactWithBaymax = false;
        p.gripBrokenCooldown = 1.0; // 1s before they can grip again
      }
    }
  }

  // 3. Backup promotions if any role unit died
  if (baymaxResult.destroyedPixelIds.length > 0) {
    handleBackupPromotions(world.pixels, world.timeElapsed, world.recentEvents);
    world.events.push(...world.recentEvents.filter(e => e.kind === 'backup_promoted'));
  }

  // 4. Update Pixels movement & flocking
  updatePixels(
    world.pixels,
    world.baymax.pos,
    world.baymax.angle,
    world.baymax.state,
    world.config,
    dt,
    rng
  );

  // 5. Teamwork contact check & extraction progress
  const contact = checkRoleContact(world.pixels, world.baymax.pos, world.baymax.angle);
  world.baymax.grippedCount = contact.grippingCount;

  if (world.config.missionMode === 'extract') {
    // Three roles required simultaneously: Holder, Puller, Grabber
    const allThreeConnected = contact.holderInContact && contact.pullerInContact && contact.grabberInContact;

    if (allThreeConnected && world.baymax.state !== 'lunging') {
      const inc = dt / world.config.extractionTime;
      const prevProgress = world.extractionProgress;
      world.extractionProgress = Math.min(1.0, world.extractionProgress + inc);

      // Check milestones
      if (Math.floor(world.extractionProgress * 4) > Math.floor(prevProgress * 4)) {
        const pct = Math.round(world.extractionProgress * 100);
        const event = {
          id: `chip_progress_${world.timeElapsed}`,
          time: world.timeElapsed,
          kind: 'chip_progress' as const,
          message: `[EXTRACTION] Red combat chip unlocked: ${pct}% complete!`,
          data: { progress: world.extractionProgress }
        };
        world.events.push(event);
        world.recentEvents.push(event);
      }
    } else {
      // Extraction decays slowly when connection is lost
      world.extractionProgress = Math.max(0, world.extractionProgress - dt * 0.08);
    }
  }

  // 6. Win / Lose check
  const alivePixels = world.pixels.filter(p => p.alive);

  if (world.config.missionMode === 'extract') {
    if (world.extractionProgress >= 1.0) {
      // Extraction has a deliberate 50/50 outcome: half of the time the chip
      // destabilises Baymax instead of restoring him, keeping every episode uncertain.
      const restored = rng.next() >= 0.5;
      if (restored) {
        world.status = 'success';
        world.statusReason = 'Red combat chip extracted! Baymax restored to healthcare mode.';
        world.baymax.state = 'pacified';
        const event = {
          id: `success_${world.timeElapsed}`,
          time: world.timeElapsed,
          kind: 'mission_success' as const,
          message: `[MISSION ACCOMPLISHED] Red chip removed! Baymax: "Hello, I am Baymax, your personal healthcare companion."`,
          data: {}
        };
        world.events.push(event);
        world.recentEvents.push(event);
      } else {
        world.status = 'failed';
        world.statusReason = 'Chip extraction destabilised Baymax. He remains affected.';
        const event = {
          id: `affected_${world.timeElapsed}`,
          time: world.timeElapsed,
          kind: 'mission_failed' as const,
          message: `[OUTCOME] The chip reacted during removal. Baymax remains affected.`,
          data: {}
        };
        world.events.push(event);
        world.recentEvents.push(event);
      }
    } else if (alivePixels.length === 0) {
      // With no surviving Pixel commanders, every nanobot formation loses its
      // controller. This is Baymax's combat victory, not a mission failure.
      world.status = 'success';
      world.statusReason = 'All Pixel commanders were neutralized. Baymax secured the arena.';
      const event = {
        id: `baymax_victory_${world.timeElapsed}`,
        time: world.timeElapsed,
        kind: 'mission_success' as const,
        message: `[COMBAT VICTORY] All Pixel commanders were neutralized. Nanobot network offline.`,
        data: {}
      };
      world.events.push(event);
      world.recentEvents.push(event);
    }
  } else {
    // Decoy mode has no clock-based success condition: it remains a live
    // training run until the operator resets it or the squad is eliminated.
    if (alivePixels.length === 0) {
      world.status = 'failed';
      world.statusReason = 'All swarm decoys eliminated.';
      const event = {
        id: `decoy_failed_${world.timeElapsed}`,
        time: world.timeElapsed,
        kind: 'mission_failed' as const,
        message: `[MISSION FAILED] All decoy units wiped out.`,
        data: {}
      };
      world.events.push(event);
      world.recentEvents.push(event);
    }
  }

  world.rngState = rng.getState();
  return world;
}

/**
 * Headless episode runner for worker or training batch
 */
export function runEpisode(
  config: SimConfig,
  initialKnowledge: number,
  episodeNum: number,
  seed: number
): { result: EpisodeResult; finalKnowledge: number } {
  let sim = createWorld(config, initialKnowledge, seed);
  const fixedDt = 1 / 60;
  const maxSteps = 90 * 60; // 90 seconds max

  for (let s = 0; s < maxSteps; s++) {
    sim = step(sim, fixedDt);
    if (sim.status !== 'running') {
      break;
    }
  }

  const aliveCount = sim.pixels.filter(p => p.alive).length;
  const result: EpisodeResult = {
    episodeNumber: episodeNum,
    hiveMode: config.hiveMode,
    success: sim.status === 'success',
    timeElapsed: Math.round(sim.timeElapsed * 10) / 10,
    survivors: aliveCount,
    extractionProgress: Math.round(sim.extractionProgress * 100),
    hiveKnowledge: Math.round(sim.hiveKnowledge * 100),
    wastedRetargets: sim.baymax.wastedRetargets,
    reason: sim.statusReason
  };

  return {
    result,
    finalKnowledge: sim.hiveKnowledge
  };
}
