import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { SimEventKind } from '../sim/types';

export const HiveFeed: React.FC = () => {
  const { eventLog, clearEventLog } = useStore();
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventLog.length]);

  const getEventBadge = (kind: SimEventKind) => {
    switch (kind) {
      case 'backup_promoted':
        return <span className="text-amber-300 bg-amber-950/80 border border-amber-500/60 px-1 py-0.2 rounded text-[9px] font-bold">BACKUP</span>;
      case 'pixel_destroyed':
        return <span className="text-red-300 bg-red-950/80 border border-red-500/60 px-1 py-0.2 rounded text-[9px] font-bold">KIA</span>;
      case 'lunge_dodged':
        return <span className="text-[#06b6d4] bg-cyan-950/80 border border-cyan-500/60 px-1 py-0.2 rounded text-[9px] font-bold">EVADED</span>;
      case 'hive_learn_pulse':
        return <span className="text-[#00ff88] bg-emerald-950/80 border border-emerald-500/60 px-1 py-0.2 rounded text-[9px] font-bold">SYNC</span>;
      case 'chip_progress':
        return <span className="text-yellow-300 bg-yellow-950/80 border border-yellow-500/60 px-1 py-0.2 rounded text-[9px] font-bold">CHIP</span>;
      case 'mission_success':
        return <span className="text-emerald-300 bg-emerald-950 border border-emerald-400 px-1 py-0.2 rounded text-[9px] font-bold">PACIFIED</span>;
      case 'mission_failed':
        return <span className="text-red-400 bg-red-950 border border-red-500 px-1 py-0.2 rounded text-[9px] font-bold">FAIL</span>;
      default:
        return <span className="text-slate-400 bg-slate-800 px-1 py-0.2 rounded text-[9px]">INFO</span>;
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between pb-1 flex-shrink-0 text-[10px]">
        <span className="text-slate-400 font-bold">REAL-TIME HIVE TELEMETRY STREAM</span>
        <button
          onClick={clearEventLog}
          className="text-slate-500 hover:text-slate-300 transition"
        >
          CLEAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] leading-tight">
        {eventLog.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            [AWAITING SWARM TELEMETRY EVENTS...]
          </div>
        ) : (
          eventLog.map((ev) => (
            <div key={ev.id} className="flex items-start gap-1.5 py-0.5 border-b border-slate-800/60">
              <span className="text-slate-500 text-[9px] tabular-nums mt-0.5">
                {ev.time.toFixed(1)}s
              </span>
              <div className="flex-shrink-0 mt-0.5">
                {getEventBadge(ev.kind)}
              </div>
              <span className={`flex-1 break-words ${
                ev.kind === 'pixel_destroyed'
                  ? 'text-red-300 font-semibold'
                  : ev.kind === 'backup_promoted'
                  ? 'text-amber-300 font-bold'
                  : ev.kind === 'mission_success'
                  ? 'text-emerald-300 font-bold'
                  : ev.kind === 'hive_learn_pulse'
                  ? 'text-[#00ff88]'
                  : 'text-slate-300'
              }`}>
                {ev.message}
              </span>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
};
