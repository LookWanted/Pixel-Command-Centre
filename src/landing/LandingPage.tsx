import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { BackgroundView } from './BackgroundView';
import { LandingModals } from './LandingModals';

interface LandingPageProps {
  onLaunchSimulator: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchSimulator }) => {
  const [activeModal, setActiveModal] = useState<'pixels' | 'hive' | 'team' | null>(null);

  const handleOpenModal = (type: string) => {
    setActiveModal(type === 'story' || type === 'cinematics' ? 'hive' : type as any);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white font-body select-none">
      {/* 1. Background (3D Microbot Model with mouse-scrubbing OR Video Fallback) */}
      <BackgroundView use3DModel />

      {/* 2. Top Navigation Bar */}
      <Navbar
        onLaunchSimulator={onLaunchSimulator}
        onOpenModal={handleOpenModal}
      />

      {/* 3. Hero Content Section */}
      <HeroSection
        onLaunchSimulator={onLaunchSimulator}
        onOpenModal={handleOpenModal as any}
      />

      {/* 5. Modals for Technical Specs */}
      <LandingModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onLaunchSimulator={onLaunchSimulator}
      />

    </main>
  );
};

export default LandingPage;
