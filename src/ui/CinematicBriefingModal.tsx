import React from 'react';
import { useStore } from '../store/useStore';
import { Play, Shield, Cpu, Users, Eye, X } from 'lucide-react';

export const CinematicBriefingModal: React.FC = () => {
  const { cinematicBriefingOpen, setCinematicBriefingOpen } = useStore();

  if (!cinematicBriefingOpen) return null;

  const handleLaunch = () => {
    setCinematicBriefingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl select-none p-4">
      {/* Cinematic Film Letterbox Bars */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-black z-20 flex items-center px-6 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        HIVEGRID // QUICK START GUIDE
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-black z-20 flex items-center justify-between px-6 text-[10px] text-slate-500 font-mono tracking-widest">
        <span>GOAL: RESTORE BAYMAX</span>
        <span>KEYBOARD + MOUSE</span>
      </div>

      <div className="relative max-w-2xl w-full bg-[#141414] border border-[#1F1F1F] rounded-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-white my-10 overflow-y-auto max-h-[85vh]">
        {/* Header with Close */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
              <span className="text-[11px] font-mono text-[#E10600] tracking-wider uppercase font-bold">
                QUICK START
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">
              Restore Baymax with the Pixel swarm
            </h2>
          </div>
          <button
            onClick={() => setCinematicBriefingOpen(false)}
            className="p-1 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#C9C9C9] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clear first-time instructions */}
        <div className="space-y-2 text-xs text-[#C9C9C9] leading-relaxed font-sans border-l-2 border-[#E10600] pl-3.5 bg-[#0A0A0A] p-2.5 rounded">
          <p>
            Baymax has a corrupted red combat chip. Your goal is to help the Pixels distract him, learn his moves, and coordinate a clamp that removes the chip.
          </p>
          <p>
            Start simple: turn on <strong className="text-white">Manual mode</strong>, then use <strong className="text-white">WASD or arrow keys</strong> to pilot Baymax. Press <strong className="text-white">Space</strong> for a boost and click the arena to neutralize a nearby Pixel.
          </p>
          <p className="text-white font-medium">
            You can also click the arena floor to give decoy Pixels a shared route. Use the three actions in the left panel when you are ready.
          </p>
        </div>

        {/* 4 Core Directives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <div className="flex items-center gap-1.5 text-[#F7E600] font-bold font-mono">
              <Eye className="w-3.5 h-3.5" />
              <span>01. Split Attention</span>
            </div>
            <p className="text-[11px] text-[#7A7A7A]">
              Swarm his scan cone. Baymax cannot choose a target and continuously stalls his attacks.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <div className="flex items-center gap-1.5 text-[#3DFFA2] font-bold font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>02. Autonomous Backup</span>
            </div>
            <p className="text-[11px] text-[#7A7A7A]">
              When a unit is destroyed, the nearest decoy autonomously promotes to the fallen role.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <div className="flex items-center gap-1.5 text-[#3DFFA2] font-bold font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>03. Real-Time Hive Mind</span>
            </div>
            <p className="text-[11px] text-[#7A7A7A]">
              Every observed lunge updates the neural weights across the entire swarm so everyone dodges.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <div className="flex items-center gap-1.5 text-[#F7E600] font-bold font-mono">
              <Users className="w-3.5 h-3.5" />
              <span>04. Tripartite Extraction</span>
            </div>
            <p className="text-[11px] text-[#7A7A7A]">
              Holder pins Baymax's left arm, Puller anchors his rear, and Grabber removes the red chip!
            </p>
          </div>
        </div>

        {/* Manual Gaming Controls Callout */}
        <div className="p-3 rounded bg-[#0A0A0A] border border-[#F7E600]/30 flex items-center justify-between gap-4 font-mono text-[11px]">
          <div className="space-y-0.5">
            <span className="text-[#F7E600] font-bold">MANUAL GAMING OVERRIDE:</span>
            <div className="text-[#C9C9C9] text-[10.5px]">
              Use <strong className="text-white">[W][A][S][D]</strong> to steer Unit #1 • <strong className="text-white">[CLICK FLOOR]</strong> to route swarm • <strong className="text-white">[SPACE]</strong> to dodge!
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-3 rounded bg-gradient-to-r from-[#F7E600] via-[#FF9F00] to-[#E10600] hover:brightness-110 text-[#0A0A0A] font-black text-xs tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer font-mono"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>GOT IT — START TRAINING</span>
        </button>
      </div>
    </div>
  );
};

