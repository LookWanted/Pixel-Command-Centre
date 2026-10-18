import React from 'react';
import { useStore } from '../store/useStore';

export const PixelThinkingPanel: React.FC = () => {
  const { snapshot } = useStore();
  let thought = 'Map the arena. Keep the commander moving and direct the swarm from range.';
  if (snapshot.status === 'success') thought = 'Baymax escaped the arena. Preserve the encounter data and rebuild the command network.';
  else if (snapshot.status === 'failed') thought = snapshot.baymaxHealth <= 0
    ? 'Baymax is down. The swarm has secured the arena and is holding position.'
    : 'The mission ended before Baymax could be restored. Archive the encounter and recalibrate.';
  else if (snapshot.baymaxHealth <= 10) thought = 'Baymax is vulnerable. Maintain normal pressure and avoid his final dash.';
  else if (snapshot.baymaxState === 'lunge_prep' || snapshot.baymaxState === 'lunging') thought = 'Baymax has committed to a dash. Break formation and widen the flight path.';
  else if (snapshot.baymaxState === 'locked') thought = 'Target lock acquired. Change direction while the nanobots close in.';
  else if (snapshot.hiveSignal > 0.7) thought = 'The hive signal is strong. Time a structure before the next attack wave.';

  return <section className="simple-panel pixel-thinking" aria-live="polite">
    <div className="pixel-thinking__heading"><p className="side-eyebrow">Pixel is thinking</p><span>Live</span></div>
    <p>{thought}</p>
  </section>;
};
