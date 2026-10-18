import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore, UIWorldSnapshot } from '../store/useStore';
import { createWorld, resetWorld, step } from '../sim/world';
import { SimWorld, EpisodeResult } from '../sim/types';
import { Arena } from './Arena';
import { BaymaxModel } from './BaymaxModel';
import { PixelSwarm } from './PixelSwarm';
import { NanobotSwarm } from './NanobotSwarm';
import { ScanCone } from './ScanCone';
import { CameraRig } from './CameraRig';
import { sound } from '../utils/audio';

export const SimScene: React.FC = () => {
  const {
    config,
    isPaused,
    resetRequested,
    clearResetRequest,
    updateSnapshot,
    addEvents,
    addEpisodeResult,
    cinematicCamera,
    baymaxPov,
    cameraZoom,
    triggerAction,
    setTriggerAction,
    manualPilotActive,
    manualInput,
    waypoint,
    manualKillPoint,
    setManualKillPoint,
    selectedPixelId
  } = useStore();

  const worldRef = useRef<SimWorld>(createWorld(config, 0, 42));
  const accumulatorRef = useRef<number>(0);
  const snapshotTimerRef = useRef<number>(0);
  const prevStatusRef = useRef<string>('running');

  // Handle live config updates or reset requests
  useEffect(() => {
    if (resetRequested) {
      worldRef.current = resetWorld(worldRef.current, config, true);
      clearResetRequest();
      prevStatusRef.current = 'running';
    }
  }, [resetRequested, config, clearResetRequest]);

  // Keep config in sync with world
  useEffect(() => {
    worldRef.current.config = { ...config };
  }, [config]);

  // Handle 4 Core Purpose Interactive Triggers
  useEffect(() => {
    if (triggerAction === 'none') return;
    const world = worldRef.current;

    if (triggerAction === 'split_attention') {
      // Force Baymax to retarget and confuse
      world.baymax.retargetTimer = world.config.retargetInterval;
      world.baymax.wastedRetargets += 2;
      sound.playBeep(880, 0.08);
      world.events.push({
        id: `manual_split_${Date.now()}`,
        time: world.timeElapsed,
        kind: 'retarget_wasted',
        message: `[MANUAL DEMO] Decoy swarm feint executed! Baymax split attention triggered.`,
        data: {}
      });
      addEvents(world.events.slice(-1));
    } else if (triggerAction === 'test_backup') {
      // Sacrifice active holder to demonstrate immediate backup takeover!
      const holder = world.pixels.find(p => p.alive && p.role === 'holder');
      if (holder) {
        holder.alive = false;
        sound.playHit();
        world.events.push({
          id: `sacrifice_${Date.now()}`,
          time: world.timeElapsed,
          kind: 'pixel_destroyed',
          message: `[MANUAL DEMO] Unit #${holder.id} [HOLDER] eliminated to demonstrate backup response!`,
          data: {}
        });
        addEvents(world.events.slice(-1));
      }
    } else if (triggerAction === 'test_hive_pulse') {
      // Trigger instant hive sync wave
      world.hiveKnowledge = Math.min(0.95, world.hiveKnowledge + 0.15);
      sound.playHiveSync();
      world.events.push({
        id: `manual_sync_${Date.now()}`,
        time: world.timeElapsed,
        kind: 'hive_learn_pulse',
        message: `[MANUAL DEMO] Hive Mind neural wave pulsed! Swarm memory now: ${Math.round(world.hiveKnowledge * 100)}%`,
        data: {}
      });
      addEvents(world.events.slice(-1));
    } else if (triggerAction === 'force_clamp') {
      // Position tripartite units directly at Baymax
      const holder = world.pixels.find(p => p.alive && p.role === 'holder');
      const puller = world.pixels.find(p => p.alive && p.role === 'puller');
      const grabber = world.pixels.find(p => p.alive && p.role === 'grabber');

      const cosA = Math.cos(world.baymax.angle);
      const sinA = Math.sin(world.baymax.angle);

      if (holder) {
        holder.pos.x = world.baymax.pos.x - sinA * 22;
        holder.pos.y = world.baymax.pos.y + cosA * 22;
        holder.inContactWithBaymax = true;
      }
      if (puller) {
        puller.pos.x = world.baymax.pos.x - cosA * 25;
        puller.pos.y = world.baymax.pos.y - sinA * 25;
        puller.inContactWithBaymax = true;
      }
      if (grabber) {
        grabber.pos.x = world.baymax.pos.x + cosA * 18;
        grabber.pos.y = world.baymax.pos.y + sinA * 18;
        grabber.inContactWithBaymax = true;
      }
      sound.playHiveSync();
      world.events.push({
        id: `manual_clamp_${Date.now()}`,
        time: world.timeElapsed,
        kind: 'chip_progress',
        message: `[MANUAL DEMO] Tripartite clamp locked! (Holder + Puller + Grabber extracting)`,
        data: {}
      });
      addEvents(world.events.slice(-1));
    }

    setTriggerAction('none');
  }, [triggerAction, setTriggerAction, addEvents]);

  useFrame((_, delta) => {
    const world = worldRef.current;

    // Fixed timestep sim execution
    if (!isPaused && world.status === 'running') {
      const fixedDt = 1 / 60;
      const speed = config.simSpeed || 1;
      const clampedDelta = Math.min(delta, 0.1) * speed;
      accumulatorRef.current += clampedDelta;

      while (accumulatorRef.current >= fixedDt) {
        step(world, fixedDt);

        // Manual instructor override: WASD drives Baymax directly.
        if (manualPilotActive) {
          let mx = 0; let my = 0;
          if (manualInput.forward) my -= 1;
          if (manualInput.backward) my += 1;
          if (manualInput.left) mx -= 1;
          if (manualInput.right) mx += 1;
          if (mx !== 0 || my !== 0) {
            const len = Math.hypot(mx, my);
            const spd = world.config.baymaxSpeed * (manualInput.boost ? 1.75 : 1.05);
            world.baymax.pos.x += (mx / len) * spd * fixedDt;
            world.baymax.pos.y += (my / len) * spd * fixedDt;
            world.baymax.vel.x = (mx / len) * spd;
            world.baymax.vel.y = (my / len) * spd;
            world.baymax.angle = Math.atan2(my, mx);
            world.baymax.state = 'scan';
            const distance = Math.hypot(world.baymax.pos.x, world.baymax.pos.y);
            if (distance > 330) { world.baymax.pos.x = world.baymax.pos.x / distance * 330; world.baymax.pos.y = world.baymax.pos.y / distance * 330; }
          }
        }

        // Clicking the arena in Manual Mode performs an explicit targeted kill attempt.
        if (manualPilotActive && manualKillPoint) {
          const target = world.pixels.filter((pixel) => pixel.alive).sort((a, b) =>
            Math.hypot(a.pos.x - manualKillPoint.x, a.pos.y - manualKillPoint.y) - Math.hypot(b.pos.x - manualKillPoint.x, b.pos.y - manualKillPoint.y)
          )[0];
          if (target) {
            target.alive = false;
            target.deathTime = world.timeElapsed;
            target.inContactWithBaymax = false;
            world.baymax.targetPixelId = target.id;
            world.events.push({ id: `manual_kill_${Date.now()}`, time: world.timeElapsed, kind: 'pixel_destroyed', message: `[MANUAL HIT] Baymax neutralized Unit #${target.id.toString().padStart(2, '0')}.`, data: { pixelId: target.id } });
            addEvents(world.events.slice(-1));
          }
          setManualKillPoint(null);
        }

        // Tactical Waypoint Flocking for Swarm
        if (waypoint) {
          world.pixels.forEach(p => {
            if (p.alive && p.role === 'decoy') {
              const dx = waypoint.x - p.pos.x;
              const dy = waypoint.y - p.pos.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 1.5) {
                const steerSpeed = (config.pixelSpeed || 12) * 0.45;
                p.pos.x += (dx / dist) * steerSpeed * fixedDt;
                p.pos.y += (dy / dist) * steerSpeed * fixedDt;
              }
            }
          });
        }

        accumulatorRef.current -= fixedDt;

        if (world.recentEvents.length > 0) {
          world.recentEvents.forEach((ev) => {
            if (ev.kind === 'lunge_started') sound.playLungeAlarm();
            else if (ev.kind === 'pixel_destroyed') sound.playHit();
            else if (ev.kind === 'lunge_dodged') sound.playDodge();
            else if (ev.kind === 'hive_learn_pulse') sound.playHiveSync();
            else if (ev.kind === 'mission_success') sound.playVictory();
          });
          addEvents(world.recentEvents);
        }

        if (world.status !== 'running' && prevStatusRef.current === 'running') {
          prevStatusRef.current = world.status;
          const aliveCount = world.pixels.filter(p => p.alive).length;
          const result: EpisodeResult = {
            episodeNumber: useStore.getState().currentEpisode,
            hiveMode: world.config.hiveMode,
            success: world.status === 'success',
            timeElapsed: Math.round(world.timeElapsed * 10) / 10,
            survivors: aliveCount,
            extractionProgress: Math.round(world.extractionProgress * 100),
            hiveKnowledge: Math.round(world.hiveKnowledge * 100),
            wastedRetargets: world.baymax.wastedRetargets,
            reason: world.statusReason
          };
          addEpisodeResult(result);
        }
      }
    }

    // Throttled UI Snapshot
    snapshotTimerRef.current += delta;
    if (snapshotTimerRef.current >= 0.1) {
      snapshotTimerRef.current = 0;

      const aliveList = world.pixels.filter(p => p.alive);
      const inRangeList = aliveList.filter(p => {
        const d = Math.hypot(p.pos.x - world.baymax.pos.x, p.pos.y - world.baymax.pos.y);
        return d <= world.baymax.scanRadius;
      });

      const snap: UIWorldSnapshot = {
        timeElapsed: world.timeElapsed,
        status: world.status,
        statusReason: world.statusReason,
        hiveKnowledge: world.hiveKnowledge,
        // Live learning signal, not cumulative memory: it rises only when
        // surviving commanders are observing/coordinating in the encounter.
        hiveSignal: Math.min(1, Math.max(0,
          world.hiveKnowledge * 0.42 +
          (aliveList.length / Math.max(1, world.pixels.length)) * 0.22 +
          (world.baymax.state === 'lunge_prep' || world.baymax.state === 'lunging' ? 0.24 : 0) +
          (world.baymax.grippedCount / 3) * 0.12 +
          world.extractionProgress * 0.14 +
          Math.sin(world.timeElapsed * 1.7) * 0.035
        )),
        extractionProgress: world.extractionProgress,
        aliveCount: aliveList.length,
        totalPixels: world.pixels.length,
        inRangeCount: inRangeList.length,
        wastedRetargets: world.baymax.wastedRetargets,
        baymaxState: world.baymax.state,
        baymaxGrippedCount: world.baymax.grippedCount,
        baymaxHealth: world.baymax.health,
        holderActive: world.pixels.some(p => p.alive && p.role === 'holder' && p.inContactWithBaymax),
        pullerActive: world.pixels.some(p => p.alive && p.role === 'puller' && p.inContactWithBaymax),
        grabberActive: world.pixels.some(p => p.alive && p.role === 'grabber' && p.inContactWithBaymax),
        pixelRoster: world.pixels.map(p => ({
          id: p.id,
          role: p.role,
          alive: p.alive,
          knowledge: p.knowledge,
          inContact: p.inContactWithBaymax
        }))
      };
      updateSnapshot(snap);
    }
  });

  const world = worldRef.current;
  const isPacified = world.status === 'success';
  const isDefeated = world.status === 'failed' && world.baymax.health <= 0;

  return (
    <>
      <CameraRig
        baymaxState={world.baymax}
        cinematic={cinematicCamera}
        baymaxPov={baymaxPov}
        zoom={cameraZoom}
        extractionProgress={world.extractionProgress}
      />
      <Arena timeElapsed={world.timeElapsed} arenaRadius={36} />
      <BaymaxModel
        baymaxState={world.baymax}
        isPacified={isPacified}
        isDefeated={isDefeated}
        extractionProgress={world.extractionProgress}
      />
      {world.status === 'running' && <ScanCone
        baymaxState={world.baymax}
        pixels={world.pixels}
        lungeReach={world.config.lungeReach}
      />}
      <PixelSwarm
        pixels={world.pixels}
        hiveKnowledge={world.hiveKnowledge}
      />
      <NanobotSwarm
        commanders={world.pixels}
        baymax={world.baymax}
        isCoveringBaymax={isDefeated}
      />
    </>
  );
};
