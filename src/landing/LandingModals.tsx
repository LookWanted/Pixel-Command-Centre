import React from 'react';
import { X, Shield, Eye, Cpu, Users } from 'lucide-react';

interface LandingModalsProps {
  activeModal: 'pixels' | 'story' | 'hive' | 'team' | null;
  onClose: () => void;
  onLaunchSimulator: () => void;
}

export const LandingModals: React.FC<LandingModalsProps> = ({
  activeModal,
  onClose,
  onLaunchSimulator
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#7A7A7A] hover:text-white transition cursor-pointer border border-[#2A2A2A]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* PIXELS MODAL */}
        {activeModal === 'pixels' && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3DFFA2]/10 border border-[#3DFFA2]/30 text-[#3DFFA2] text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DFFA2]" />
              ROBOT SPECIFICATIONS // MK-IV
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Hiro's Microbot (Pixel)
            </h2>
            <p className="text-[#C9C9C9] text-xs leading-relaxed">
              Forged from high-density magnetic carbon alloy. Individually lightweight and expendable; collectively capable of overwhelming corrupted combat systems.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F]">
                <div className="text-[#3DFFA2] font-mono font-bold text-[11px]">HOLDER ROLE</div>
                <div className="text-[#7A7A7A] text-[11px] mt-1">Clamps Baymax's left arm, inducing -25% kinetic drag per unit.</div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F]">
                <div className="text-[#E10600] font-mono font-bold text-[11px]">PULLER ROLE</div>
                <div className="text-[#7A7A7A] text-[11px] mt-1">Latches rear magnetic tow cables to anchor and pull him backward.</div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F]">
                <div className="text-[#F7E600] font-mono font-bold text-[11px]">GRABBER ROLE</div>
                <div className="text-[#7A7A7A] text-[11px] mt-1">Climbs to the chest port to extract the red combat chip.</div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F]">
                <div className="text-white font-mono font-bold text-[11px]">DECOY SWARM</div>
                <div className="text-[#7A7A7A] text-[11px] mt-1">Orbits erratic vectors to induce split attention and act as live reserves.</div>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onLaunchSimulator(); }}
              className="w-full mt-4 py-3 rounded bg-[#3DFFA2] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
            >
              INITIALIZE IN SIMULATOR →
            </button>
          </div>
        )}

        {/* STORY MODAL */}
        {activeModal === 'story' && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E10600]/10 border border-[#E10600]/30 text-[#E10600] text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
              MISSION LOG // PORTAL SECTOR 04
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              The Rescue of Baymax
            </h2>
            <p className="text-[#C9C9C9] text-xs leading-relaxed">
              Hiro Hamada is trapped inside an unstable portal dimension. A hostile Baymax has been revived with a corrupted red combat chip.
            </p>
            <p className="text-[#C9C9C9] text-xs leading-relaxed">
              A single heavy combat robot cannot win this fight against Baymax's kinetic strikes. So Hiro deploys an autonomous swarm of small, inexpensive microbots called <strong>Pixels</strong>.
            </p>
            <p className="text-[#C9C9C9] text-xs leading-relaxed">
              Pixels win through cooperation, split attention, real-time hive learning, and backup redundancy. Once the red chip is removed, Baymax returns to his warm healthcare companion state: <em>"Hello, I am Baymax."</em>
            </p>
            <button
              onClick={() => { onClose(); onLaunchSimulator(); }}
              className="w-full mt-4 py-3 rounded bg-[#E10600] text-white font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
            >
              ENTER PORTAL SIMULATOR →
            </button>
          </div>
        )}

        {/* HIVE MIND MODAL */}
        {activeModal === 'hive' && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F7E600]/10 border border-[#F7E600]/30 text-[#F7E600] text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7E600]" />
              NEURAL DOCTRINE SPECIFICATION
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              How to play
            </h2>
            <div className="space-y-2 text-xs text-[#C9C9C9]">
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#3DFFA2]/30 flex items-start gap-3">
                <Cpu className="w-4 h-4 text-[#3DFFA2] flex-shrink-0 mt-0.5" />
                <div><strong className="text-white font-mono uppercase text-[11px]">Start here:</strong> Press <strong className="text-white">Manual mode</strong> in the arena, then use <strong className="text-white">WASD / arrow keys</strong> to pilot Baymax. Press <strong className="text-white">Space</strong> for a short boost and click the arena to neutralize the nearest Pixel.</div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] flex items-start gap-3">
                <Eye className="w-4 h-4 text-[#F7E600] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono uppercase text-[11px]">01. Split Attention:</strong> Baymax retargets every 2 seconds. Swarming microbots force constant retarget switches, wasting precious attack time.
                </div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] flex items-start gap-3">
                <Shield className="w-4 h-4 text-[#3DFFA2] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono uppercase text-[11px]">02. Autonomous Backup:</strong> If an active role unit is neutralized, the nearest living decoy immediately steps up and takes over the role.
                </div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] flex items-start gap-3">
                <Cpu className="w-4 h-4 text-[#F7E600] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono uppercase text-[11px]">03. Real-Time Hive Mind:</strong> When Hive is active, observations instantly propagate across all units. Shared dodge chance climbs up to 85%+.
                </div>
              </div>
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] flex items-start gap-3">
                <Users className="w-4 h-4 text-[#E10600] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono uppercase text-[11px]">04. Tripartite Extraction:</strong> Holder + Puller + Grabber must clamp Baymax simultaneously to extract the corrupted red chip.
                </div>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onLaunchSimulator(); }}
              className="w-full mt-4 py-3 rounded bg-[#F7E600] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
            >
              START THE SIMULATION →
            </button>
          </div>
        )}

        {/* TEAM MODAL */}
        {activeModal === 'team' && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3DFFA2]/10 border border-[#3DFFA2]/30 text-[#3DFFA2] text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DFFA2]" />
              HACKATHON // NCREATE
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              HiveGrid™ Systems
            </h2>
            <p className="text-[#C9C9C9] text-xs leading-relaxed">
              Interactive 3D tactical command & control simulation demonstrating emergent swarm robotics and cooperative multi-agent reinforcement learning. Inspired by Disney's Big Hero 6.
            </p>
            <div className="p-3 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-xs space-y-1 font-mono">
              <div className="text-white font-bold">DISPATCH & CONTACT:</div>
              <div className="text-[#3DFFA2]">command@hivegrid.systems</div>
            </div>
            <button
              onClick={() => { onClose(); onLaunchSimulator(); }}
              className="w-full mt-4 py-3 rounded bg-white text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-90 transition cursor-pointer"
            >
              LAUNCH LIVE COMMAND DEMO →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
