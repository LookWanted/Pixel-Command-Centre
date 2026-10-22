import React from 'react';

interface NavbarProps { onLaunchSimulator: () => void; onOpenModal: (type: 'pixels' | 'story' | 'team') => void; }

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => (
  <nav className="landing-nav fixed top-0 left-0 right-0 z-10 px-6 sm:px-10 py-5 flex justify-between items-center">
    <div className="landing-nav__brand"><div className="text-white font-heading text-lg tracking-tight">HiveGrid</div><div>Pixel command center</div></div>
    <button onClick={() => onOpenModal('story')} className="landing-nav__about">The mission <span>↗</span></button>
  </nav>
);
