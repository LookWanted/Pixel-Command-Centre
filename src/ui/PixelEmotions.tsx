import React from 'react';
import { useStore } from '../store/useStore';

type Mood = { label: string; asset: string };

// Exact LED expressions cropped from the supplied Desktop faces.heic asset.
const moods: Mood[] = [
  { label: 'Overrun', asset: '/assets/faces/overrun.png' },
  { label: 'Ambush', asset: '/assets/faces/ambush.png' },
  { label: 'Pursuit', asset: '/assets/faces/pursuit.png' },
  { label: 'Tracking', asset: '/assets/faces/tracking.png' },
  { label: 'Calm', asset: '/assets/faces/calm.png' }
];

const moodIndex = (status: string, baymaxState: string, health: number) => {
  if (status === 'failed' && health <= 0) return 0;
  if (baymaxState === 'lunging') return 1;
  if (baymaxState === 'lunge_prep') return 2;
  if (baymaxState === 'locked') return 3;
  return 4;
};

export const PixelEmotions: React.FC = () => {
  const { snapshot } = useStore();
  const active = moodIndex(snapshot.status, snapshot.baymaxState, snapshot.baymaxHealth);

  return (
    <section className="simple-panel pixel-emotions" aria-label="Pixel commander mood">
      <div className="pixel-emotions__heading">
        <p className="side-eyebrow">Pixel mood</p>
        <span>{moods[active].label}</span>
      </div>
      <div className="pixel-expression pixel-expression--large" aria-label={`Pixel emotion: ${moods[active].label}`}>
        <img src={moods[active].asset} alt={`${moods[active].label} Pixel LED expression`} />
      </div>
    </section>
  );
};
