import { create } from 'zustand';
import { SimConfig, SimEvent, EpisodeResult } from '../sim/types';
import { DEFAULT_CONFIG } from '../sim/world';
import { sound } from '../utils/audio';
import type { DecisionPrompt } from '../sim/decisionPrompts';

export interface UIWorldSnapshot {
  timeElapsed: number;
  status: 'running' | 'success' | 'failed';
  statusReason: string;
  hiveKnowledge: number;
  hiveSignal: number;
  extractionProgress: number;
  aliveCount: number;
  totalPixels: number;
  inRangeCount: number;
  wastedRetargets: number;
  baymaxState: string;
  baymaxGrippedCount: number;
  baymaxHealth: number;
  holderActive: boolean;
  pullerActive: boolean;
  grabberActive: boolean;
  pixelRoster: {
    id: number;
    role: string;
    alive: boolean;
    knowledge: number;
    inContact: boolean;
  }[];
}

interface AppState {
  // Config (live-tunable)
  config: SimConfig;
  updateConfig: (patch: Partial<SimConfig>) => void;

  // Simulation controls
  isPaused: boolean;
  togglePause: () => void;
  resetRequested: boolean;
  requestReset: () => void;
  clearResetRequest: () => void;

  // Manual Trigger Actions for the 4 Core Purposes
  triggerAction: 'none' | 'split_attention' | 'test_backup' | 'test_hive_pulse' | 'force_clamp';
  setTriggerAction: (action: 'none' | 'split_attention' | 'test_backup' | 'test_hive_pulse' | 'force_clamp') => void;

  // Throttled Snapshot (~10 Hz)
  snapshot: UIWorldSnapshot;
  updateSnapshot: (snap: UIWorldSnapshot) => void;
  hiveLearningHistory: { time: number; value: number }[];

  // Event Log
  eventLog: SimEvent[];
  addEvents: (events: SimEvent[]) => void;
  clearEventLog: () => void;

  // Training & Episode History
  currentEpisode: number;
  history: EpisodeResult[];
  addEpisodeResult: (res: EpisodeResult) => void;
  wipeHiveMemory: () => void;

  // Headless Training state
  isTraining: boolean;
  trainingProgress: number;
  setIsTraining: (val: boolean, progress?: number) => void;

  // A/B Compare state
  abResults: {
    active: boolean;
    hiveOn: EpisodeResult[];
    hiveOff: EpisodeResult[];
  };
  setABResults: (res: { hiveOn: EpisodeResult[]; hiveOff: EpisodeResult[] }) => void;
  clearABResults: () => void;

  // View & Graphic settings
  quality: 'high' | 'low';
  setQuality: (q: 'high' | 'low') => void;
  cinematicCamera: boolean;
  setCinematicCamera: (val: boolean) => void;
  baymaxPov: boolean;
  setBaymaxPov: (val: boolean) => void;
  cameraZoom: number;
  setCameraZoom: (zoom: number) => void;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  soundtrackPlaying: boolean;
  setSoundtrackPlaying: (playing: boolean) => void;

  // Manual Gaming & Swarm Commander Mode
  manualPilotActive: boolean;
  setManualPilotActive: (active: boolean) => void;
  manualInput: { forward: boolean; backward: boolean; left: boolean; right: boolean; boost: boolean };
  setManualInput: (input: Partial<{ forward: boolean; backward: boolean; left: boolean; right: boolean; boost: boolean }>) => void;
  waypoint: { x: number; y: number } | null;
  setWaypoint: (pt: { x: number; y: number } | null) => void;
  manualKillPoint: { x: number; y: number } | null;
  setManualKillPoint: (pt: { x: number; y: number } | null) => void;
  boostEnergy: number;
  setBoostEnergy: (energy: number) => void;
  shieldActive: boolean;
  setShieldActive: (active: boolean) => void;

  // Brief automated-mode operator checks
  decisionPrompt: DecisionPrompt | null;
  setDecisionPrompt: (prompt: DecisionPrompt | null) => void;

  // Cinematic Story Briefing & Theater
  cinematicBriefingOpen: boolean;
  setCinematicBriefingOpen: (open: boolean) => void;
  cinematicTheaterOpen: boolean;
  setCinematicTheaterOpen: (open: boolean) => void;

  // Selected Pixel for Telemetry inspection
  selectedPixelId: number | null;
  setSelectedPixelId: (id: number | null) => void;

  // 3D Model Inspector Modal
  modelModalOpen: boolean;
  setModelModalOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  updateConfig: (patch) => {
    set((state) => ({ config: { ...state.config, ...patch } }));
  },

  isPaused: false,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  resetRequested: false,
  requestReset: () => set({ resetRequested: true, hiveLearningHistory: [] }),
  clearResetRequest: () => set({ resetRequested: false, decisionPrompt: null }),

  triggerAction: 'none',
  setTriggerAction: (action) => set({ triggerAction: action }),

  snapshot: {
    timeElapsed: 0,
    status: 'running',
    statusReason: '',
    hiveKnowledge: 0,
    hiveSignal: 0,
    extractionProgress: 0,
    aliveCount: DEFAULT_CONFIG.pixelCount,
    totalPixels: DEFAULT_CONFIG.pixelCount,
    inRangeCount: 0,
    wastedRetargets: 0,
    baymaxState: 'scan',
    baymaxGrippedCount: 0,
    baymaxHealth: 100,
    holderActive: false,
    pullerActive: false,
    grabberActive: false,
    pixelRoster: []
  },
  hiveLearningHistory: [],
  updateSnapshot: (snap) => set((state) => {
    const previous = state.hiveLearningHistory[state.hiveLearningHistory.length - 1];
    const shouldRecord = !previous || snap.timeElapsed < previous.time || snap.timeElapsed - previous.time >= 0.45;
    return {
      snapshot: snap,
      hiveLearningHistory: shouldRecord
        ? [...(snap.timeElapsed < (previous?.time ?? 0) ? [] : state.hiveLearningHistory), { time: snap.timeElapsed, value: snap.hiveSignal }].slice(-60)
        : state.hiveLearningHistory
    };
  }),

  eventLog: [],
  addEvents: (events) => {
    if (events.length === 0) return;
    set((state) => ({
      eventLog: [...state.eventLog, ...events].slice(-150)
    }));
  },
  clearEventLog: () => set({ eventLog: [] }),

  currentEpisode: 1,
  history: [],
  addEpisodeResult: (res) => {
    set((state) => ({
      history: [...state.history, res].slice(-50),
      currentEpisode: state.currentEpisode + 1
    }));
  },
  wipeHiveMemory: () => {
    set({
      history: [],
      currentEpisode: 1,
      eventLog: [],
      abResults: { active: false, hiveOn: [], hiveOff: [] }
    });
  },

  isTraining: false,
  trainingProgress: 0,
  setIsTraining: (isTraining, trainingProgress = 0) => set({ isTraining, trainingProgress }),

  abResults: {
    active: false,
    hiveOn: [],
    hiveOff: []
  },
  setABResults: (res) => set({
    abResults: {
      active: true,
      hiveOn: res.hiveOn,
      hiveOff: res.hiveOff
    }
  }),
  clearABResults: () => set({
    abResults: {
      active: false,
      hiveOn: [],
      hiveOff: []
    }
  }),

  quality: 'high',
  setQuality: (quality) => set({ quality }),

  // Free orbit is the default; tracking is an explicit user choice.
  // Keep the commander in frame when a mission first opens. Players can still
  // switch to the free camera from the arena header at any time.
  cinematicCamera: true,
  setCinematicCamera: (cinematicCamera) => set({ cinematicCamera }),
  baymaxPov: false,
  setBaymaxPov: (baymaxPov) => set({ baymaxPov }),
  cameraZoom: 1,
  setCameraZoom: (cameraZoom) => set({ cameraZoom: Math.min(1.55, Math.max(0.62, cameraZoom)) }),

  audioMuted: false,
  setAudioMuted: (muted) => {
    sound.setMuted(muted);
    set({ audioMuted: muted });
  },

  soundtrackPlaying: true,
  setSoundtrackPlaying: (playing) => {
    sound.setSoundtrackPlaying(playing);
    set({ soundtrackPlaying: playing });
  },

  manualPilotActive: false,
  setManualPilotActive: (manualPilotActive) => set({ manualPilotActive }),
  manualInput: { forward: false, backward: false, left: false, right: false, boost: false },
  setManualInput: (input) => set((state) => ({ manualInput: { ...state.manualInput, ...input } })),
  waypoint: null,
  setWaypoint: (waypoint) => set({ waypoint }),
  manualKillPoint: null,
  setManualKillPoint: (manualKillPoint) => set({ manualKillPoint }),
  boostEnergy: 100,
  setBoostEnergy: (boostEnergy) => set({ boostEnergy }),
  shieldActive: false,
  setShieldActive: (shieldActive) => set({ shieldActive }),

  decisionPrompt: null,
  setDecisionPrompt: (decisionPrompt) => set({ decisionPrompt }),

  cinematicBriefingOpen: false,
  setCinematicBriefingOpen: (cinematicBriefingOpen) => set({ cinematicBriefingOpen }),
  cinematicTheaterOpen: false,
  setCinematicTheaterOpen: (cinematicTheaterOpen) => set({ cinematicTheaterOpen }),

  selectedPixelId: 1, // Default to Unit #1
  setSelectedPixelId: (id) => set({ selectedPixelId: id }),

  modelModalOpen: false,
  setModelModalOpen: (modelModalOpen) => set({ modelModalOpen })
}));
