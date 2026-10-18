import React from 'react';
import { useStore } from '../store/useStore';

type Mood = { label: string; pixels: number[] };

// Clean LED-matrix versions of the five supplied expressions only.
const moods: Mood[] = [
  // Two upward carets
  { label: 'Overrun', pixels: [11, 19, 21, 28, 30, 15, 23, 25, 32, 34] },
  // Two vertical bars
  { label: 'Ambush', pixels: [11, 20, 29, 38, 47, 15, 24, 33, 42, 51] },
  // Inward chevrons
  { label: 'Pursuit', pixels: [11, 19, 27, 37, 47, 15, 25, 35, 43, 51] },
  // Two diagonal, slightly narrowed eyes
  { label: 'Tracking', pixels: [11, 12, 19, 21, 28, 30, 37, 38, 15, 16, 23, 25, 32, 34, 41, 42] },
  // Two unmistakable round LED eyes: O   O
  { label: 'Calm', pixels: [10, 11, 12, 19, 21, 28, 30, 37, 38, 39, 14, 15, 16, 23, 25, 32, 34, 41, 42, 43] }
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
        {Array.from({ length: 63 }, (_, dot) => <i key={dot} className={moods[active].pixels.includes(dot) ? 'is-lit' : ''} />)}
      </div>
    </section>
  );
};
