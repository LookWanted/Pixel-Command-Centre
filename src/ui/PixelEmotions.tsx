import React from 'react';
import { useStore } from '../store/useStore';

type Mood = { label: string; pixels: number[] };

// Clean LED-matrix versions of the five supplied expressions only.
const moods: Mood[] = [
  // Two upward carets
  { label: 'Overrun', pixels: [9, 15, 17, 22, 24, 11, 19, 21, 23, 25] },
  // Two vertical bars
  { label: 'Ambush', pixels: [8, 15, 22, 29, 36, 12, 19, 26, 33, 40] },
  // Inward chevrons
  { label: 'Pursuit', pixels: [9, 15, 21, 29, 37, 13, 19, 27, 33, 39] },
  // Two tilted LED rings
  { label: 'Tracking', pixels: [8, 9, 15, 17, 22, 24, 29, 30, 12, 13, 19, 21, 26, 28, 33, 34] },
  // Two round LED rings
  { label: 'Calm', pixels: [8, 9, 10, 15, 17, 22, 24, 29, 30, 12, 13, 14, 19, 21, 26, 28, 33, 34] }
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
        {Array.from({ length: 49 }, (_, dot) => <i key={dot} className={moods[active].pixels.includes(dot) ? 'is-lit' : ''} />)}
      </div>
    </section>
  );
};
