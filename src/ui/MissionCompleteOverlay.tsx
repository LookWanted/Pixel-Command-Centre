import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

/** Appears after Baymax has either exited the arena or been overwhelmed. */
export const MissionCompleteOverlay: React.FC = () => {
  const { snapshot, requestReset } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (snapshot.status === 'running') {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), snapshot.status === 'success' ? 5200 : 1800);
    return () => window.clearTimeout(timer);
  }, [snapshot.status]);

  if (!visible) return null;
  const saved = snapshot.status === 'success';
  return (
    <div className={`mission-complete ${saved ? '' : 'mission-complete--failed'}`} role="dialog" aria-modal="true" aria-label={saved ? 'Mission complete' : 'Mission failed'}>
      <div className="mission-complete__card">
        <p>{saved ? 'Mission complete' : 'Mission failed'}</p>
        <h2>{saved ? 'Baymax is safe.' : 'Baymax was overwhelmed.'}</h2>
        <span>{saved ? 'He has cleared the arena and returned to healthcare mode.' : 'The nanobot swarm depleted his health. Reset the arena and try another approach.'}</span>
        <button onClick={requestReset}>{saved ? 'Run another simulation' : 'Restart simulation'}</button>
      </div>
    </div>
  );
};
