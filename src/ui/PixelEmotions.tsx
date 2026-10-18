import React from 'react';
import { useStore } from '../store/useStore';

type Mood = { label: string; pixels: number[] };

// The five supplied Pixel LED expressions, recreated as a single large matrix.
const moods: Mood[] = [
  { label: 'Overrun', pixels: [0, 6, 8, 12, 14, 16, 18, 20, 24, 26, 30, 32, 34, 36, 40, 42, 48] },
  { label: 'Ambush', pixels: [1, 2, 3, 4, 5, 7, 13, 17, 19, 21, 27, 28, 29, 30, 31, 32, 33] },
  { label: 'Pursuit', pixels: [3, 10, 17, 24, 31, 38, 45, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41] },
  { label: 'Tracking', pixels: [1, 5, 7, 13, 15, 19, 21, 27, 28, 29, 30, 31, 32, 33, 35, 41, 43, 47] },
  { label: 'Calm', pixels: [8, 9, 11, 12, 15, 16, 18, 19, 29, 30, 32, 33, 36, 37, 39, 40] }
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
