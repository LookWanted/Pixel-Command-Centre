import { PixelState, SimConfig, SimEvent } from './types';

export interface HiveUpdateResult {
  observersCount: number;
  newSharedKnowledge: number;
  events: SimEvent[];
}

/**
 * Updates hive / individual knowledge whenever a lunge is observed.
 * Observation radius = scanRadius + 160.
 */
export function processLungeObservation(
  pixels: PixelState[],
  baymaxPos: { x: number; y: number },
  scanRadius: number,
  currentSharedKnowledge: number,
  config: SimConfig,
  time: number
): HiveUpdateResult {
  const observationRadius = scanRadius + 160;
  const events: SimEvent[] = [];

  // Count living pixels within observation radius
  const observers: PixelState[] = [];
  for (const p of pixels) {
    if (!p.alive) continue;
    const dist = Math.hypot(p.pos.x - baymaxPos.x, p.pos.y - baymaxPos.y);
    if (dist <= observationRadius) {
      observers.push(p);
    }
  }

  let newSharedKnowledge = currentSharedKnowledge;

  if (observers.length > 0) {
    if (config.hiveMode) {
      // Shared knowledge increases by learnRate * sqrt(observers), capped at 0.95
      const gain = config.learnRate * Math.sqrt(observers.length);
      newSharedKnowledge = Math.min(0.95, currentSharedKnowledge + gain);
      const pct = Math.round(newSharedKnowledge * 100);

      events.push({
        id: `hive_learn_${time}`,
        time,
        kind: 'hive_learn_pulse',
        message: `[HIVE SYNC] ${observers.length} units observed lunge. Swarm memory: ${pct}% (+${(gain * 100).toFixed(1)}%)`,
        data: { observers: observers.length, knowledge: newSharedKnowledge, gain }
      });
    } else {
      // Hive OFF: each Pixel keeps its own knowledge and learns only from its own observation
      for (const obs of observers) {
        obs.knowledge = Math.min(0.95, obs.knowledge + config.learnRate);
      }
      events.push({
        id: `indiv_learn_${time}`,
        time,
        kind: 'hive_learn_pulse',
        message: `[ISOLATED] ${observers.length} units observed lunge independently.`,
        data: { observers: observers.length }
      });
    }
  }

  return {
    observersCount: observers.length,
    newSharedKnowledge,
    events
  };
}

/**
 * Calculates a Pixel's dodge chance.
 * dodge chance = knowledge * 0.85
 */
export function getPixelDodgeChance(pixel: PixelState, sharedKnowledge: number, hiveMode: boolean): number {
  const knowledge = hiveMode ? sharedKnowledge : pixel.knowledge;
  return Math.min(0.74, knowledge * 0.78);
}
