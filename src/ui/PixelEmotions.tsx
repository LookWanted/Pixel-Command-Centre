import React from 'react';
import { useStore } from '../store/useStore';

type Mood = { label: string; pixels: number[] };

// Five tiny LED-matrix expressions, inspired by the Pixel bot display.
const moods: Mood[] = [
  { label: 'Overrun', pixels: [0, 4, 6, 8, 12, 16, 18, 20, 24, 26, 28, 30, 34] },
  { label: 'Ambush', pixels: [0, 5, 10, 16, 22, 28, 34, 4, 9, 14, 20, 26, 32] },
  { label: 'Pursuit', pixels: [2, 8, 14, 20, 26, 32, 30, 31, 33, 34] },
  { label: 'Tracking', pixels: [1, 3, 7, 9, 14, 15, 16, 17, 20, 22, 26, 28, 31, 33] },
  { label: 'Calm', pixels: [7, 8, 11, 12, 22, 23, 26, 27] }
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
      <div className="pixel-emotions__row">
        {moods.map((mood, index) => (
          <div key={mood.label} className={`pixel-expression ${index === active ? 'is-active' : ''}`} title={mood.label}>
            {Array.from({ length: 35 }, (_, dot) => <i key={dot} className={mood.pixels.includes(dot) ? 'is-lit' : ''} />)}
          </div>
        ))}
      </div>
    </section>
  );
};
