import React from 'react';

interface NavbarProps { onLaunchSimulator: () => void; onOpenModal: (type: 'pixels' | 'story' | 'team') => void; }

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => (
  <nav className="fixed top-0 left-0 right-0 z-10 px-6 sm:px-10 py-5 flex justify-between items-center bg-black/25 border-b border-white/10 backdrop-blur-sm">
    <div><div className="text-white font-heading text-lg tracking-tight">HiveGrid</div><div className="text-[9px] font-mono tracking-[.16em] text-[#c8e86b]">PIXEL COMMAND CENTER</div></div>
    <button onClick={() => onOpenModal('story')} className="text-[11px] text-[#d9e1dd] hover:text-white font-mono">WHAT IS THIS?</button>
  </nav>
);
