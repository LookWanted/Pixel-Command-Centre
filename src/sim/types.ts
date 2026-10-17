// Pure simulation types (No React, No Three.js)

export type PixelRole = 'decoy' | 'holder' | 'puller' | 'grabber';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PixelState {
  id: number;
  pos: Vector2D;
  vel: Vector2D;
  role: PixelRole;
  alive: boolean;
  knowledge: number; // 0 to 0.95 (used when hiveMode is false)
  dodgeCooldown: number;
  inContactWithBaymax: boolean;
  gripBrokenCooldown: number;
  deathTime?: number;
  justDodged: boolean;
  promotedFlash: number; // visual timer for backup takeover
}

export type BaymaxStateMode = 'patrol' | 'scan' | 'locked' | 'lunge_prep' | 'lunging' | 'recovering' | 'pacified';

export interface BaymaxState {
  pos: Vector2D;
  vel: Vector2D;
  angle: number; // facing angle in radians
  targetPixelId: number | null;
  state: BaymaxStateMode;
  stateTimer: number;
  retargetTimer: number;
  lungeTimer: number;
  lungeStartPos: Vector2D;
  lungeTargetPos: Vector2D;
  lungeProgress: number; // 0 to 1
  scanRadius: number;
  wastedRetargets: number;
  grippedCount: number; // holders attached
}

export interface SimConfig {
  pixelCount: number;         // 3 - 20 (scalable)
  pixelSpeed: number;         // e.g. 110
  baymaxSpeed: number;        // e.g. 65
  retargetInterval: number;   // e.g. 2.0 s
  lungeInterval: number;      // e.g. 3.5 s
  lungeReach: number;         // e.g. 150
  learnRate: number;          // e.g. 0.06
  extractionTime: number;     // e.g. 12.0 s required
  hiveMode: boolean;          // true = shared knowledge, false = individual
  missionMode: 'extract' | 'decoy';
  simSpeed: number;           // 1, 2, 4
  arenaRadius: number;        // e.g. 380
}

export type SimEventKind = 
  | 'lunge_started'
  | 'lunge_dodged'
  | 'pixel_destroyed'
  | 'backup_promoted'
  | 'role_attached'
  | 'grip_broken'
  | 'chip_progress'
  | 'retarget_wasted'
  | 'mission_success'
  | 'mission_failed'
  | 'hive_learn_pulse';

export interface SimEvent {
  id: string;
  time: number;
  kind: SimEventKind;
  message: string;
  data?: Record<string, any>;
}

export interface SimWorld {
  config: SimConfig;
  pixels: PixelState[];
  baymax: BaymaxState;
  hiveKnowledge: number;      // Shared knowledge (0 to 0.95)
  extractionProgress: number; // 0 to 1.0 (100%)
  timeElapsed: number;
  status: 'running' | 'success' | 'failed';
  statusReason: string;
  events: SimEvent[];
  recentEvents: SimEvent[];   // Fresh events since last frame
  lastLungeObservers: number;
  seed: number;
  rngState: number;
}

export interface EpisodeResult {
  episodeNumber: number;
  hiveMode: boolean;
  success: boolean;
  timeElapsed: number;
  survivors: number;
  extractionProgress: number;
  hiveKnowledge: number;
  wastedRetargets: number;
  reason: string;
}
