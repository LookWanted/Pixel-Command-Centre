import React from 'react';
import { useStore } from '../store/useStore';
import { Users } from 'lucide-react';

const ROLE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  holder: { bg: 'bg-emerald-950/80', text: 'text-[#00ff88]', border: 'border-emerald-500' },
  puller: { bg: 'bg-orange-950/80', text: 'text-orange-400', border: 'border-orange-500' },
  grabber: { bg: 'bg-yellow-950/80', text: 'text-yellow-400', border: 'border-yellow-500' },
  decoy: { bg: 'bg-cyan-950/70', text: 'text-[#06b6d4]', border: 'border-cyan-600/60' },
  down: { bg: 'bg-red-950/40', text: 'text-slate-500 line-through', border: 'border-slate-800' }
};

export const Roster: React.FC = () => {
  const { snapshot, selectedPixelId, setSelectedPixelId } = useStore();

  return (
    <div className="c2-card rounded px-3 py-2 font-mono text-xs w-full">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-200">
          <Users className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="font-extrabold uppercase">
            SWARM ROSTER ({snapshot.aliveCount}/{snapshot.totalPixels} ALIVE)
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 text-[#00ff88]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" /> Holder
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Puller
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Grabber
          </span>
          <span className="flex items-center gap-1 text-[#06b6d4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> Decoy
          </span>
        </div>
      </div>

      <div className="pt-1.5 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
        {snapshot.pixelRoster.map((p) => {
          const isDead = !p.alive;
          const style = isDead ? ROLE_STYLES.down : (ROLE_STYLES[p.role] || ROLE_STYLES.decoy);
          const isSelected = selectedPixelId === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setSelectedPixelId(isSelected ? null : p.id)}
              className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1.5 transition ${style.bg} ${style.border} ${
                isSelected ? 'ring-2 ring-white scale-105' : 'hover:brightness-125'
              }`}
            >
              <span className="text-slate-400">#{p.id.toString().padStart(2, '0')}</span>
              <span className={`uppercase ${style.text}`}>
                {isDead ? 'KIA' : p.role}
              </span>
              {p.inContact && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
