import React from 'react';
import { Check, Home, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';

interface EscapeCompleteScreenProps {
  onReturnHome: () => void;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

/** A deliberately calm closing state after Baymax's thruster escape. */
export const EscapeCompleteScreen: React.FC<EscapeCompleteScreenProps> = ({ onReturnHome }) => {
  const { snapshot, requestReset } = useStore();

  if (snapshot.status !== 'success') return null;

  return (
    <div className="escape-complete" role="dialog" aria-modal="true" aria-labelledby="escape-title">
      <div className="escape-complete__scrim" />
      <section className="escape-complete__card">
        <div className="escape-complete__mark"><Check /></div>
        <p className="escape-complete__eyebrow">Training complete</p>
        <h1 id="escape-title">Baymax is safely clear of the arena.</h1>
        <p className="escape-complete__copy">The nanobot network has gone quiet and Baymax has exited on thrusters.</p>
        <div className="escape-complete__stats">
          <div><span>Training time</span><b>{formatDuration(snapshot.timeElapsed)}</b></div>
          <div><span>Pixels remaining</span><b>{snapshot.aliveCount} / {snapshot.totalPixels}</b></div>
          <div><span>Chip progress</span><b>{Math.round(snapshot.extractionProgress * 100)}%</b></div>
        </div>
        <div className="escape-complete__actions">
          <button className="escape-complete__primary" onClick={requestReset}><RotateCcw /> Run another scenario</button>
          <button className="escape-complete__secondary" onClick={onReturnHome}><Home /> Return home</button>
        </div>
      </section>
    </div>
  );
};
