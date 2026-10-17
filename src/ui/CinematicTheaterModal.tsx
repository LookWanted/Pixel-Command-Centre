import React, { useState } from 'react';
import { X, Play, Film, Sparkles, ExternalLink, ShieldAlert, Award } from 'lucide-react';

interface CinematicTheaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSimulator?: () => void;
}

export const CinematicTheaterModal: React.FC<CinematicTheaterModalProps> = ({
  isOpen,
  onClose,
  onLaunchSimulator
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'scene_breakdown'>('video');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl select-none font-sans">
      {/* Top Film Strip Header */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-[#0A0A0A] border-b border-[#1F1F1F] z-20 flex items-center justify-between px-6 text-[11px] text-[#7A7A7A] font-mono tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-[#F7E600]" />
          <span>BIG HERO 6 // PORTAL DIMENSION CLIMAX SCENE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-[#C9C9C9]">ARCHIVE ID: BH6-PORTAL-01</span>
          <span className="text-[#E10600] font-bold">HOSTILE COMBAT PROTOCOL</span>
        </div>
      </div>

      {/* Main Theater Modal Body */}
      <div className="relative w-full max-w-5xl bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl shadow-2xl overflow-hidden flex flex-col mt-6 max-h-[90vh]">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#F7E600] via-[#FF9F00] to-[#E10600] flex items-center justify-center font-black text-[#0A0A0A] text-sm shadow">
              ▶
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Big Hero 6: Portal Void & The Red Combat Chip
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40">
                  MOVIE CINEMATICS
                </span>
              </div>
              <p className="text-xs text-[#7A7A7A]">
                The inspiration and stakes behind the Pixel Swarm Training Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-[#0A0A0A] rounded-lg border border-[#1F1F1F] text-xs font-mono">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'video'
                    ? 'bg-[#F7E600] text-[#0A0A0A] font-bold'
                    : 'text-[#C9C9C9] hover:text-white'
                }`}
              >
                Watch Scene
              </button>
              <button
                onClick={() => setActiveTab('scene_breakdown')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'scene_breakdown'
                    ? 'bg-[#F7E600] text-[#0A0A0A] font-bold'
                    : 'text-[#C9C9C9] hover:text-white'
                }`}
              >
                Story Lore
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#C9C9C9] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {activeTab === 'video' ? (
            <div className="flex flex-col gap-4">
              {/* Responsive 16:9 Cinema Video Player with local extracted Big Hero 6 clip */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-[#1F1F1F] shadow-2xl">
                <video
                  className="w-full h-full object-cover"
                  src="/assets/portal_bg.mp4"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              </div>

              {/* Video Context Caption */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#1F1F1F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#F7E600] font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>MISSION STAKES: EXTRACT RED COMBAT CHIP</span>
                  </div>
                  <p className="text-xs text-[#C9C9C9] max-w-2xl leading-relaxed">
                    Hiro and Baymax dive into the unstable portal vortex. Inside, Baymax is overwhelmed by combat protocols until Hiro commands the swarm to cooperatively hold, pull, and extract the corrupted red chip.
                  </p>
                </div>

                {onLaunchSimulator && (
                  <button
                    onClick={() => {
                      onClose();
                      onLaunchSimulator();
                    }}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F7E600] to-[#FF9F00] text-[#0A0A0A] font-extrabold text-xs hover:brightness-110 transition shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Simulator</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Scene Breakdown & Core Lore */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#141414] border border-[#1F1F1F] space-y-3">
                <div className="flex items-center gap-2 text-[#E10600] font-mono text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
                  <span>THE CORRUPTED COMBAT PROTOCOL</span>
                </div>
                <h3 className="text-white font-bold text-base">Why One Robot Can't Win</h3>
                <p className="text-xs text-[#C9C9C9] leading-relaxed">
                  Callaghan's red combat card turns Baymax into an unstoppable kinetic juggernaut. He delivers devastating 180° sweeps and high-velocity lunges. Any single robot facing him is immediately destroyed.
                </p>
                <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] text-[11px] text-[#7A7A7A] font-mono">
                  &gt; BAYMAX KINETIC FORCE: 4,500 N<br />
                  &gt; SINGLE UNIT SURVIVAL PROBABILITY: &lt; 2%
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#141414] border border-[#1F1F1F] space-y-3">
                <div className="flex items-center gap-2 text-[#3DFFA2] font-mono text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#3DFFA2] animate-pulse" />
                  <span>HIRO'S MICROBOT SWARM (PIXELS)</span>
                </div>
                <h3 className="text-white font-bold text-base">Winning by Collective Intelligence</h3>
                <p className="text-xs text-[#C9C9C9] leading-relaxed">
                  Instead of building one large robot, Hiro builds dozens of lightweight, inexpensive magnetic microbots ("Pixels"). They defeat Baymax through the 4 doctrines:
                </p>
                <ul className="text-xs text-[#C9C9C9] space-y-1.5 list-disc list-inside">
                  <li><strong className="text-white">Split Attention:</strong> Baymax can only target one unit at once, wasting attack cycles.</li>
                  <li><strong className="text-white">Instant Backup:</strong> Destroyed units are instantly replaced by nearby reserves.</li>
                  <li><strong className="text-white">Hive Learning:</strong> Every dodge observation teaches the entire collective.</li>
                  <li><strong className="text-white">Tripartite Extraction:</strong> Holder clamps arm, Puller tethers back, Grabber removes the red chip.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Strip */}
        <div className="px-6 py-3 bg-[#0A0A0A] border-t border-[#1F1F1F] flex items-center justify-between text-xs text-[#7A7A7A] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F7E600]" />
            <span>PALETTE: #F7E600 (YELLOW) • #E10600 (RED COMBAT) • #3DFFA2 (HEALTHCARE)</span>
          </div>
          <a
            href="https://youtu.be/nds0teAB5Ig"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#C9C9C9] hover:text-[#F7E600] transition"
          >
            <span>Open in YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
