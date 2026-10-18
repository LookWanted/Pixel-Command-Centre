import React from 'react';
import { useStore } from '../store/useStore';
import { BookOpen, Crosshair, Focus, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export const SimpleHeader: React.FC<{ onBackToLanding?: () => void }> = ({ onBackToLanding }) => {
  const { isPaused, togglePause, requestReset, setCinematicBriefingOpen, snapshot, baymaxPov, setBaymaxPov, cinematicCamera, setCinematicCamera, cameraZoom, setCameraZoom } = useStore();
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
        <button onClick={() => setCameraZoom(cameraZoom - 0.14)} className="icon-button" aria-label="Zoom in"><ZoomIn /></button>
        <button onClick={() => setCameraZoom(cameraZoom + 0.14)} className="icon-button" aria-label="Zoom out"><ZoomOut /></button>
        <button onClick={() => { setCinematicCamera(!cinematicCamera); if (!cinematicCamera) setBaymaxPov(false); }} className={`secondary-button ${cinematicCamera ? 'is-active' : ''}`} aria-label={cinematicCamera ? 'Switch to free camera' : 'Follow Baymax'}><Focus /> {cinematicCamera ? 'Free camera' : 'Follow Baymax'}</button>
        <button onClick={() => setBaymaxPov(!baymaxPov)} className={`secondary-button ${baymaxPov ? 'is-active' : ''}`} aria-label="Toggle Baymax point of view"><Crosshair /> {baymaxPov ? 'Arena view' : 'Baymax POV'}</button>
        <button onClick={() => setCinematicBriefingOpen(true)} className="secondary-button" aria-label="Open instructions"><BookOpen /> How it works</button>
      </div>
    </header>
  );
};
