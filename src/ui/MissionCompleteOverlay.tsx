import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

/** Appears only after Baymax has had time to launch out of the arena. */
export const MissionCompleteOverlay: React.FC = () => {
  const { snapshot, requestReset } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (snapshot.status !== 'success') {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 5200);
    return () => window.clearTimeout(timer);
  }, [snapshot.status]);

  if (!visible) return null;
  return (
    <div className="mission-complete" role="dialog" aria-modal="true" aria-label="Mission complete">
      <div className="mission-complete__card">
        <p>Mission complete</p>
        <h2>Baymax is safe.</h2>
        <span>He has cleared the arena and returned to healthcare mode.</span>
        <button onClick={requestReset}>Run another simulation</button>
      </div>
    </div>
  );
};
