import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from './store/useStore';
import { SimScene } from './scene/SimScene';
import { Effects } from './scene/Effects';
import { SimpleHeader } from './ui/SimpleHeader';
import { SimpleControls } from './ui/SimpleControls';
import { SimpleAnalytics } from './ui/SimpleAnalytics';
import { PixelModelViewer } from './ui/PixelModelViewer';
import { GamingHUDOverlay } from './ui/GamingHUDOverlay';
import { CinematicBriefingModal } from './ui/CinematicBriefingModal';
import { CinematicTheaterModal } from './ui/CinematicTheaterModal';
import { Timeline } from './ui/Timeline';
import { LandingPage } from './landing/LandingPage';

export function App() {
  const { 
    quality, 
    modelModalOpen, 
    setModelModalOpen,
    cinematicTheaterOpen,
    setCinematicTheaterOpen
  } = useStore();
  const [currentView, setCurrentView] = useState<'landing' | 'simulator'>('landing');

  // Check URL query parameters (e.g. ?view=simulator)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'simulator') {
      setCurrentView('simulator');
    }
  }, []);

  const handleLaunchSimulator = () => {
    setCurrentView('simulator');
    window.history.pushState({}, '', '?view=simulator');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', window.location.pathname);
  };

  // If in landing page view, render full-screen hero landing page
  if (currentView === 'landing') {
    return <LandingPage onLaunchSimulator={handleLaunchSimulator} />;
  }

  // Simulator View (Pixel Command Center)
  return (
    <div className="command-shell software-workspace w-screen h-screen overflow-hidden bg-[#121414] text-white font-sans select-none flex flex-col">
      <SimpleHeader onBackToLanding={handleBackToLanding} />

      <div className="dashboard-grid flex-1 w-full min-h-0 overflow-hidden">
        <aside className="dashboard-rail h-full overflow-y-auto z-20">
          <SimpleControls />
        </aside>
        <main className="tactical-frame visual-core h-full relative overflow-hidden bg-[#101314] z-10">
          <div className="absolute inset-0 z-0">
            <Canvas
              shadows={quality === 'high'}
              gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
              camera={{ position: [0, 15, 20], fov: 42 }}
            >
              <color attach="background" args={['#101314']} />
              <fog attach="fog" args={['#101314', 17, 58]} />
              <SimScene />
              <Effects quality={quality} />
            </Canvas>
          </div>
          <GamingHUDOverlay />
        </main>

        <aside className="dashboard-intel h-full overflow-y-auto z-20">
          <SimpleAnalytics />
        </aside>
      </div>
      <Timeline />

      {/* 3. 3D Model Inspector Modal */}
      <PixelModelViewer
        isOpen={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
      />

      {/* 4. Cinematic Mission Briefing Cutscene Modal */}
      <CinematicBriefingModal />

      {/* 5. Movie Cinematics Theater Modal */}
      <CinematicTheaterModal
        isOpen={cinematicTheaterOpen}
        onClose={() => setCinematicTheaterOpen(false)}
        onLaunchSimulator={handleLaunchSimulator}
      />
    </div>
  );
}

export default App;
