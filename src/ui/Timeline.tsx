import React from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SimpleRoster } from './SimpleRoster';

export const Timeline: React.FC = () => {
  const { snapshot, isPaused, togglePause, requestReset, config, updateConfig } = useStore();

  // This is a stopwatch, not a deadline. The subtle bar simply sweeps once
  // per minute so it keeps providing motion without implying a mission limit.
  const current = snapshot.timeElapsed;
  const progressPct = ((current % 60) / 60) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <footer className="playback-strip">
      <div className="playback-controls">
        <button onClick={togglePause} className="icon-button" title={isPaused ? "Resume simulation" : "Pause simulation"}>
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
        </button>
        <button onClick={requestReset} className="icon-button" title="Restart scenario">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="time-readout"><i>Elapsed</i> {formatTime(current)}</span>
      </div>
      <div className="timeline-track"><i style={{ width: `${progressPct}%` }} /></div>
      <div className="speed-picker">{[1, 2, 4].map((speed) => <button key={speed} onClick={() => updateConfig({ simSpeed: speed })} className={config.simSpeed === speed ? 'is-active' : ''}>{speed}×</button>)}</div>
      <div className="footer-roster">
        <SimpleRoster />
      </div>
    </footer>
  );
};
