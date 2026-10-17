import React from 'react';
import { useStore } from '../store/useStore';
import { Radio } from 'lucide-react';

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  holder: { bg: 'bg-[#3DFFA2]/15', text: 'text-[#3DFFA2]', border: 'border-[#3DFFA2]/40' },
  puller: { bg: 'bg-[#FF9F43]/15', text: 'text-[#FF9F43]', border: 'border-[#FF9F43]/40' },
  grabber: { bg: 'bg-[#FFD54F]/15', text: 'text-[#FFD54F]', border: 'border-[#FFD54F]/40' },
  decoy: { bg: 'bg-[#4FC3F7]/10', text: 'text-[#4FC3F7]', border: 'border-[#4FC3F7]/30' },
  down: { bg: 'bg-[#161B26]/60', text: 'text-[#7A7A7A] line-through', border: 'border-white/5' }
};

export const SimpleRoster: React.FC = () => {
  const { snapshot, setSelectedPixelId, selectedPixelId } = useStore();
  return (
    <div className="roster-row">
        <div className="roster-title"><Radio /> Pixels <span>{snapshot.aliveCount}/{snapshot.totalPixels}</span></div>
        <div className="roster-scroll">
          {snapshot.pixelRoster.map((p) => {
            const isDead = !p.alive;
            const style = isDead ? ROLE_COLORS.down : (ROLE_COLORS[p.role] || ROLE_COLORS.decoy);
            const isSelected = selectedPixelId === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPixelId(isSelected ? null : p.id)}
                className={`roster-item ${style.bg} ${style.border} ${isSelected ? 'is-selected' : ''}`}
              >
                <span>#{p.id}</span>
                <span className={style.text}>
                  {isDead ? 'Down' : p.role}
                </span>
                {p.inContact && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3DFFA2] animate-ping" />
                )}
              </button>
            );
          })}
        </div>
    </div>
  );
};
