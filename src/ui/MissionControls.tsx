import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw, FastForward, BrainCircuit, Trash2, GitCompare, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export const MissionControls: React.FC = () => {
  const {
    isPaused,
    togglePause,
    requestReset,
    config,
    updateConfig,
    wipeHiveMemory,
    isTraining,
    trainingProgress,
    setIsTraining,
    addEpisodeResult,
    setABResults,
    snapshot,
    currentEpisode
  } = useStore();

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../sim/train.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (data.type === 'TRAIN_PROGRESS') {
        setIsTraining(true, data.percent);
      } else if (data.type === 'TRAIN_COMPLETE') {
        setIsTraining(false, 100);
        sound.playVictory();
        data.results.forEach((res: any) => addEpisodeResult(res));
      } else if (data.type === 'AB_PROGRESS') {
        setIsTraining(true, data.percent);
      } else if (data.type === 'AB_COMPLETE') {
        setIsTraining(false, 100);
        sound.playVictory();
        setABResults({
          hiveOn: data.hiveOnResults,
          hiveOff: data.hiveOffResults
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleTrain50 = () => {
    if (isTraining || !workerRef.current) return;
    sound.playHiveSync();
    setIsTraining(true, 0);
    workerRef.current.postMessage({
      type: 'START_TRAIN',
      episodesCount: 50,
      config,
      initialKnowledge: snapshot.hiveKnowledge,
      startEpisodeNum: currentEpisode
    });
  };

  const handleABCompare = () => {
    if (isTraining || !workerRef.current) return;
    sound.playHiveSync();
    setIsTraining(true, 0);
    workerRef.current.postMessage({
      type: 'START_AB_COMPARE',
      episodesCount: 50,
      config
    });
  };

  const handleWipeMemory = () => {
    wipeHiveMemory();
    requestReset();
    sound.playBeep(440, 0.15, 'sawtooth');
  };

  return (
    <div className="c2-card rounded p-3 space-y-2.5 font-mono text-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
        <span className="font-extrabold tracking-wider text-slate-100 uppercase text-[11px]">
          MISSION CONTROLS
        </span>
        <span className="text-[10px] text-slate-400">EPISODE #{currentEpisode}</span>
      </div>

      {/* Primary Actions: Play / Pause & Retry */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            togglePause();
            sound.playBeep(660, 0.05);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded font-bold transition text-xs ${
            isPaused
              ? 'bg-amber-500 text-black hover:bg-amber-400'
              : 'bg-[#00ff88] text-black hover:bg-[#34d399]'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
        </button>

        <button
          onClick={() => {
            requestReset();
            sound.playBeep(520, 0.06);
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RETRY SIM</span>
        </button>
      </div>

      {/* Sim Speed Multiplier (1x / 2x / 4x) */}
      <div className="flex items-center justify-between p-1.5 rounded bg-[#070c14] border border-slate-800">
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <FastForward className="w-3 h-3 text-[#06b6d4]" />
          SIM WARP SPEED:
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                updateConfig({ simSpeed: spd });
                sound.playBeep(440 + spd * 100, 0.04);
              }}
              className={`px-2 py-0.5 rounded font-bold transition text-[11px] ${
                config.simSpeed === spd
                  ? 'bg-[#00ff88] text-black font-extrabold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Headless Training Buttons */}
      <div className="pt-1 space-y-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-extrabold text-[#00ff88] flex items-center gap-1">
            <BrainCircuit className="w-3.5 h-3.5" />
            HEADLESS BENCHMARK
          </span>
          {isTraining && (
            <span className="text-amber-400 font-bold animate-pulse text-[10px]">
              EVALUATING {trainingProgress}%
            </span>
          )}
        </div>

        {isTraining && (
          <div className="w-full bg-slate-800 h-2 rounded overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-[#00ff88] to-[#06b6d4] h-full transition-all duration-150"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleTrain50}
            disabled={isTraining}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-[#064e3b]/80 hover:bg-[#064e3b] border border-emerald-500/60 text-emerald-300 font-bold text-[10px] transition disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3 text-[#00ff88]" />
            <span>TRAIN 50 EP</span>
          </button>

          <button
            onClick={handleABCompare}
            disabled={isTraining}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-[#1e293b] hover:bg-[#334155] border border-[#06b6d4]/60 text-[#06b6d4] font-bold text-[10px] transition disabled:opacity-50"
          >
            <GitCompare className="w-3 h-3 text-[#06b6d4]" />
            <span>A/B COMPARE</span>
          </button>
        </div>

        <button
          onClick={handleWipeMemory}
          className="w-full flex items-center justify-center gap-1 py-1 rounded bg-red-950/30 hover:bg-red-950/60 border border-red-900/60 text-red-400 text-[10px] transition"
        >
          <Trash2 className="w-3 h-3" />
          <span>WIPE MEMORY & RESET BENCHMARKS</span>
        </button>
      </div>
    </div>
  );
};
