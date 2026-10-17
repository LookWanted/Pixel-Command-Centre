import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Crosshair, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Video, 
  SlidersHorizontal,
  Flame,
  Activity,
  Box
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    snapshot, 
    config, 
    quality, 
    setQuality, 
    cinematicCamera, 
    setCinematicCamera, 
    audioMuted, 
    setAudioMuted,
    setModelModalOpen
  } = useStore();

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCombat = snapshot.baymaxState === 'lunging' || snapshot.baymaxState === 'lunge_prep';
  const isPacified = snapshot.status === 'success';

  return (
    <header className="h-12 w-full bg-[#070b13] border-b border-[#1e293b] px-4 flex items-center justify-between text-xs z-30 select-none flex-shrink-0">
      {/* Brand & System callsign matching inspiration image */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0b121f] border border-[#e11d48]/50 rounded-sm">
          <Crosshair className="w-3.5 h-3.5 text-[#e11d48] animate-pulse" />
          <span className="font-extrabold tracking-wider text-slate-100 uppercase text-[11px]">
            MAGSEARCH // HIRO C2 SWARM
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
          <span className="text-slate-500 uppercase">SYS:</span>
          <span className="text-[#00ff88] font-bold">RECON • TRACK • ENGAGE • RTB</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
          <Cpu className="w-3 h-3 text-[#06b6d4]" />
          <span className="text-slate-500 uppercase">HIVE:</span>
          <span className={config.hiveMode ? "text-[#00ff88] font-bold" : "text-amber-400 font-bold"}>
            {config.hiveMode ? 'SYNCHRONIZED' : 'ISOLATED'}
          </span>
        </div>

        {/* Threat Level Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[11px] font-bold ${
          isPacified
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
            : isCombat
            ? 'bg-[#e11d48] text-white animate-pulse'
            : 'bg-red-950/60 border-red-700 text-red-400'
        }`}>
          {isPacified ? (
            <Activity className="w-3.5 h-3.5" />
          ) : (
            <Flame className="w-3.5 h-3.5" />
          )}
          <span>
            {isPacified 
              ? 'PACIFIED // HEALTHCARE RESTORED' 
              : 'THREAT: +10 ELEVATED (RED CHIP)'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* 3D Model Inspector Button */}
        <button
          onClick={() => setModelModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#0b1726] border border-[#06b6d4]/60 hover:border-[#06b6d4] text-[#06b6d4] hover:text-white transition font-bold text-[10px]"
          title="Inspect Hiro's 3D Textured Microbot Model"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">INSPECT 3D BOT (GLB)</span>
        </button>

        {/* Quality Toggle */}
        <button
          onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-semibold transition"
          title="Toggle Bloom / Postprocessing"
        >
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          <span>{quality.toUpperCase()}</span>
        </button>

        {/* Camera Track Toggle */}
        <button
          onClick={() => setCinematicCamera(!cinematicCamera)}
          className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-semibold transition ${
            cinematicCamera 
              ? 'bg-[#00ff88]/15 border-[#00ff88]/50 text-[#00ff88]' 
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
          title="Toggle Cinematic Tracking vs Free Orbit"
        >
          <Video className="w-3 h-3" />
          <span className="hidden md:inline">{cinematicCamera ? 'TRACK' : 'FREE'}</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={() => setAudioMuted(!audioMuted)}
          className="p-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition"
          title={audioMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ff88]" />}
        </button>
      </div>
    </header>
  );
};
