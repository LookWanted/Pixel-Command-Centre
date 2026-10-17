import React from 'react';
import { useStore } from '../store/useStore';
import { BookOpen, Pause, Play, RotateCcw } from 'lucide-react';

export const SimpleHeader: React.FC<{ onBackToLanding?: () => void }> = ({ onBackToLanding }) => {
  const { isPaused, togglePause, requestReset, setCinematicBriefingOpen, snapshot } = useStore();
  const settled = snapshot.status === 'success';
  return (
    <header className="app-header">
      <div className="flex items-center gap-3 min-w-0">
        {onBackToLanding && <button onClick={onBackToLanding} className="back-link">← Home</button>}
        <div className="brand">HiveGrid <span>Pixel Command Center</span></div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`session-state hidden sm:inline ${settled ? 'is-good' : 'is-danger'}`}>{settled ? 'Baymax restored' : 'Combat mode'}</span>
        <button onClick={togglePause} className="icon-button" aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}>{isPaused ? <Play /> : <Pause />}</button>
        <button onClick={requestReset} className="icon-button" aria-label="Restart episode"><RotateCcw /></button>
        <button onClick={() => setCinematicBriefingOpen(true)} className="secondary-button" aria-label="Open instructions"><BookOpen /> How it works</button>
      </div>
    </header>
  );
};
