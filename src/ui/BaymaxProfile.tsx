import React from 'react';
import { useStore } from '../store/useStore';
import { Target, CheckCircle2, AlertOctagon, Flame, Zap } from 'lucide-react';

export const BaymaxProfile: React.FC = () => {
  const { snapshot, config } = useStore();

  const isLunge = snapshot.baymaxState === 'lunging' || snapshot.baymaxState === 'lunge_prep';
  const isPacified = snapshot.status === 'success';
  const slowPct = Math.min(75, snapshot.baymaxGrippedCount * 25);

  return (
    <div className={`c2-card rounded p-3 space-y-3 font-mono text-xs ${
      isLunge ? 'c2-card-danger' : isPacified ? 'c2-card-success' : ''
    }`}>
      {/* Target Title */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
        <div className="flex items-center gap-1.5 text-[#e11d48]">
          <Target className="w-4 h-4 text-[#e11d48]" />
          <span className="font-extrabold tracking-wider text-slate-100 uppercase text-[11px]">
            ACTIVE TARGET // CORRUPTED BAYMAX
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
          isPacified
            ? 'bg-emerald-500 text-black'
            : isLunge
            ? 'bg-[#e11d48] text-white animate-pulse'
            : 'bg-red-950 text-red-300 border border-red-800'
        }`}>
          {isPacified ? 'PACIFIED' : snapshot.baymaxState.replace('_', ' ')}
        </span>
      </div>

      {/* Extraction Gauge */}
      <div>
        <div className="flex justify-between items-center mb-1 text-[11px]">
          <span className="text-slate-200 font-bold flex items-center gap-1">
            {isPacified ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" /> : <Zap className="w-3.5 h-3.5 text-[#00ff88]" />}
            Red Combat Chip Extraction
          </span>
          <span className="font-extrabold text-[#00ff88] text-[12px]">
            {Math.round(snapshot.extractionProgress * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-150 ${
              isPacified
                ? 'bg-[#00ff88]'
                : 'bg-gradient-to-r from-[#06b6d4] via-[#00ff88] to-[#f59e0b]'
            }`}
            style={{ width: `${Math.round(snapshot.extractionProgress * 100)}%` }}
          />
        </div>
      </div>

      {/* 4 Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded bg-[#070c14] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Wasted Retargets</div>
          <div className="text-base font-extrabold text-amber-400 mt-0.5">
            {snapshot.wastedRetargets}
          </div>
          <div className="text-[9px] text-slate-500">Split attention time loss</div>
        </div>

        <div className="p-2 rounded bg-[#070c14] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">In Scan Cone</div>
          <div className="text-base font-extrabold text-[#06b6d4] mt-0.5">
            {snapshot.inRangeCount} / {snapshot.aliveCount}
          </div>
          <div className="text-[9px] text-slate-500">Decoys drawing fire</div>
        </div>

        <div className="p-2 rounded bg-[#070c14] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Arm Clamp Drag</div>
          <div className="text-base font-extrabold text-[#00ff88] mt-0.5">
            -{slowPct}%
          </div>
          <div className="text-[9px] text-slate-500">{snapshot.baymaxGrippedCount} Holders gripping</div>
        </div>

        <div className="p-2 rounded bg-[#070c14] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Lunge Reach</div>
          <div className="text-base font-extrabold text-slate-200 mt-0.5">
            {config.lungeReach} u
          </div>
          <div className="text-[9px] text-slate-500">Dash killzone radius</div>
        </div>
      </div>
    </div>
  );
};
