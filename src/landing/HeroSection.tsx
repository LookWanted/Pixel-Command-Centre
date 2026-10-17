import React, { useState, useEffect } from 'react';
import { useTypewriter } from './useTypewriter';

interface HeroSectionProps {
  onLaunchSimulator: () => void;
  onOpenModal: (type: 'pixels' | 'story' | 'hive') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchSimulator,
  onOpenModal
}) => {
  const [pillsVisible, setPillsVisible] = useState(false);

  // Typewriter text per specification
  const typewriterContent =
    'A tactical reinforcement-learning mission to restore Baymax through coordinated swarm extraction.';
  const { displayed, done } = useTypewriter(typewriterContent, 38, 600);

  // Pills appear 400ms after load independent of typewriter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative z-[1] w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-12 overflow-hidden font-body pointer-events-none">
      <div className="max-w-2xl relative z-10 pointer-events-auto border-l-2 border-[#F7E600] pl-6 md:pl-8">
        {/* 1. Blurred intro label */}
        <div
          className="pointer-events-none select-none mb-5 sm:mb-6"
          style={{
            fontSize: '11px', lineHeight: 1.3, fontWeight: 700, color: '#F7E600',
            letterSpacing: '.18em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase'
          }}
        >
          PIXEL COMMAND CENTER // SECTOR 04
        </div>

        {/* 2. Typewriter text */}
        <p
          className="text-white mb-5 sm:mb-6 min-h-[54px] select-none"
          style={{
            fontSize: 'clamp(28px, 4vw, 50px)', lineHeight: 1.04, fontWeight: 700,
            letterSpacing: '-.04em', maxWidth: '760px'
          }}
        >
          {displayed}
          {!done && (
            <span
              className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-cursor-blink"
            />
          )}
        </p>

        {/* 3. Tactical Action Buttons (No pills, crisp command-center styling) */}
        <div
          className="flex flex-wrap items-center gap-3 transition-all duration-400 ease-out font-heading"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)'
          }}
        >
          {/* Primary Action: Launch Simulator */}
          <button
            onClick={onLaunchSimulator}
            className="inline-flex items-center justify-center bg-[#F7E600] text-[#0A0A0A] font-extrabold text-sm px-6 py-3 border border-[#F7E600] hover:bg-[#FFD400] transition cursor-pointer font-mono"
          >
            Launch Command Center →
          </button>

          {/* Secondary Action: first-time guide */}
          <button
            onClick={() => onOpenModal('hive')}
            className="inline-flex items-center justify-center bg-[#141414]/90 text-white border border-[#E10600]/40 hover:border-[#E10600] font-bold text-sm px-5 py-3 hover:bg-[#1F1F1F] transition cursor-pointer gap-2 font-mono"
          >
            <span>How to play</span>
          </button>
        </div>
      </div>
    </section>
  );
};
