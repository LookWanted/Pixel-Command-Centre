import React from 'react';
import { useStore } from '../store/useStore';
import { Eye, Shield, Cpu, Users, Zap, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

export const FourPurposesPanel: React.FC = () => {
  const { snapshot, config, updateConfig, setTriggerAction } = useStore();

  const isExtractionConnected = snapshot.holderActive && snapshot.pullerActive && snapshot.grabberActive;
  const slowPct = Math.min(75, snapshot.baymaxGrippedCount * 25);
  const dodgeChancePct = Math.round(snapshot.hiveKnowledge * 0.85 * 100);

  return (
    <div className="c2-card rounded p-3 space-y-3 font-mono text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
        <div className="flex items-center gap-1.5 text-[#e11d48]">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#e11d48]" />
          <span className="font-extrabold tracking-wider text-slate-100 uppercase text-[11px]">
            4 CORE DOCTRINES // BIG HERO 6
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold">SWARM TACTICS</span>
      </div>

      {/* 1. SPLIT ATTENTION */}
      <div className="p-2.5 rounded bg-[#070c14] border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
            <Eye className="w-3.5 h-3.5" />
            <span>1. SPLIT ATTENTION</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
            {snapshot.wastedRetargets} WASTED SWITCHES
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Baymax is confused by {snapshot.inRangeCount} microbots inside scan cone. Each target switch resets his attack and wastes combat time.
        </p>
        <button
          onClick={() => setTriggerAction('split_attention')}
          className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-amber-950/40 hover:bg-amber-950/70 border border-amber-700/60 text-amber-300 font-semibold text-[10px] transition"
        >
          <Zap className="w-3 h-3" />
          <span>INSPECT SPLIT ATTENTION (CONFUSE BAYMAX)</span>
        </button>
      </div>

      {/* 2. BACKUP */}
      <div className="p-2.5 rounded bg-[#070c14] border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>2. AUTONOMOUS BACKUP</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-400 border border-sky-800">
            {Math.max(0, snapshot.aliveCount - 3)} RESERVES READY
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          If Baymax destroys a specialist (Holder, Puller, Grabber), the nearest living Decoy immediately steps up and takes over the role.
        </p>
        <button
          onClick={() => setTriggerAction('test_backup')}
          className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-sky-950/40 hover:bg-sky-950/70 border border-sky-700/60 text-sky-300 font-semibold text-[10px] transition"
        >
          <Flame className="w-3 h-3 text-red-400" />
          <span>TEST ROLE CASUALTY & BACKUP TAKEOVER</span>
        </button>
      </div>

      {/* 3. HIVE MIND */}
      <div className="p-2.5 rounded bg-[#070c14] border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00ff88] font-bold text-[11px]">
            <Cpu className="w-3.5 h-3.5" />
            <span>3. REAL-TIME HIVE MIND</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-[#00ff88] border border-emerald-800">
            {Math.round(snapshot.hiveKnowledge * 100)}% SWARM MEMORY
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          {config.hiveMode
            ? `Synchronized: Every observed lunge teaches all ${snapshot.aliveCount} Pixels simultaneously (Dodge Chance: ${dodgeChancePct}%).`
            : 'Isolated: Pixels learn only individually. High vulnerability to dashes.'}
        </p>
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            onClick={() => updateConfig({ hiveMode: !config.hiveMode })}
            className={`py-1 px-1 rounded border text-[10px] font-bold transition ${
              config.hiveMode
                ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {config.hiveMode ? 'HIVE MIND: ON' : 'HIVE MIND: OFF'}
          </button>
          <button
            onClick={() => setTriggerAction('test_hive_pulse')}
            className="py-1 px-1 rounded bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-700/60 text-[#00ff88] font-semibold text-[10px] transition"
          >
            PULSE SYNC WAVE
          </button>
        </div>
      </div>

      {/* 4. TEAMWORK (TRIPARTITE CLAMP) */}
      <div className="p-2.5 rounded bg-[#070c14] border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[11px]">
            <Users className="w-3.5 h-3.5" />
            <span>4. TRIPARTITE TEAMWORK</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${
            isExtractionConnected
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse'
              : 'bg-slate-900 text-slate-400 border-slate-700'
          }`}>
            {isExtractionConnected ? 'CLAMP LOCKED' : 'APPROACHING'}
          </span>
        </div>

        {/* The 3 Required Roles Checklist */}
        <div className="grid grid-cols-3 gap-1 text-[10px] pt-0.5">
          <div className={`p-1 rounded border text-center ${
            snapshot.holderActive ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <div className="font-bold">1. HOLDER</div>
            <div className="text-[9px]">Grip Arm (-{slowPct}%)</div>
          </div>
          <div className={`p-1 rounded border text-center ${
            snapshot.pullerActive ? 'bg-orange-950/80 border-orange-500 text-orange-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <div className="font-bold">2. PULLER</div>
            <div className="text-[9px]">Rear Tow</div>
          </div>
          <div className={`p-1 rounded border text-center ${
            snapshot.grabberActive ? 'bg-yellow-950/80 border-yellow-500 text-yellow-300' : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <div className="font-bold">3. GRABBER</div>
            <div className="text-[9px]">Extract Chip</div>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 leading-tight">
          One Pixel cannot extract the chip alone. Extraction progress only climbs when all 3 roles grip Baymax simultaneously!
        </p>

        <button
          onClick={() => setTriggerAction('force_clamp')}
          className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-yellow-950/40 hover:bg-yellow-950/70 border border-yellow-700/60 text-yellow-300 font-semibold text-[10px] transition"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>FORCE TRIPARTITE LOCK (DEMO EXTRACTION)</span>
        </button>
      </div>
    </div>
  );
};
