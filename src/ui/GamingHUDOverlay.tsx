import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Gamepad2, Navigation } from 'lucide-react';

/** Minimal, explicit manual mode: the player pilots Baymax. */
export const GamingHUDOverlay: React.FC = () => {
  const { manualPilotActive, setManualPilotActive, setManualInput, waypoint, setWaypoint } = useStore();

  useEffect(() => {
    if (!manualPilotActive) return;
    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const map: Record<string, Parameters<typeof setManualInput>[0]> = {
        KeyW: { forward: true }, ArrowUp: { forward: true }, KeyS: { backward: true }, ArrowDown: { backward: true },
        KeyA: { left: true }, ArrowLeft: { left: true }, KeyD: { right: true }, ArrowRight: { right: true }, Space: { boost: true }
      };
      if (map[event.code]) { event.preventDefault(); setManualInput(map[event.code]); }
    };
    const up = (event: KeyboardEvent) => {
      const map: Record<string, Parameters<typeof setManualInput>[0]> = {
        KeyW: { forward: false }, ArrowUp: { forward: false }, KeyS: { backward: false }, ArrowDown: { backward: false },
        KeyA: { left: false }, ArrowLeft: { left: false }, KeyD: { right: false }, ArrowRight: { right: false }, Space: { boost: false }
      };
      if (map[event.code]) { event.preventDefault(); setManualInput(map[event.code]); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [manualPilotActive, setManualInput]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 p-4 font-mono select-none">
      <div className="flex justify-end pointer-events-auto">
        <button onClick={() => setManualPilotActive(!manualPilotActive)} className={`px-3 py-2 border text-[10px] font-bold flex items-center gap-2 ${manualPilotActive ? 'bg-[#e9efec] text-[#111816] border-[#e9efec]' : 'bg-[#111816]/90 text-white border-white/10'}`}>
          <Gamepad2 className="w-3.5 h-3.5" />{manualPilotActive ? 'MANUAL ACTIVE' : 'MANUAL MODE'}
        </button>
      </div>
      {manualPilotActive && <div className="absolute bottom-24 left-4 pointer-events-auto bg-[#111816]/95 border border-[#6dffb0]/40 px-3 py-2.5 max-w-[245px] text-[10px] leading-relaxed">
        <strong className="text-[#6dffb0]">PILOTING BAYMAX</strong><br />
        <span className="text-[#c9d1cd]">WASD / arrows move · Space boosts · click an arena target to neutralize it.</span>
      </div>}
      {waypoint && <div className="absolute bottom-24 right-4 pointer-events-auto bg-[#111816]/95 border border-white/10 px-3 py-2 text-[10px] flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-[#6dffb0]" /> Route set <button onClick={() => setWaypoint(null)} className="text-[#8a9692] hover:text-white underline">clear</button></div>}
    </div>
  );
};
