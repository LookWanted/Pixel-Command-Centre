import React from 'react';
import { useStore } from '../store/useStore';
import { Sliders, RotateCcw } from 'lucide-react';
import { DEFAULT_CONFIG } from '../sim/world';

export const VariablesPanel: React.FC = () => {
  const { config, updateConfig, requestReset } = useStore();

  const handleResetDefaults = () => {
    updateConfig({ ...DEFAULT_CONFIG });
    requestReset();
  };

  return (
    <div className="c2-card rounded p-3 space-y-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
        <div className="flex items-center gap-1.5 text-slate-100 font-extrabold uppercase text-[11px]">
          <Sliders className="w-3.5 h-3.5 text-[#00ff88]" />
          <span>SWARM VARIABLES</span>
        </div>
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
          title="Reset to default parameters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET</span>
        </button>
      </div>

      {/* Sliders List */}
      <div className="space-y-2.5">
        {/* Swarm Size */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-300">Swarm Size (Pixels)</span>
            <span className="font-extrabold text-[#00ff88]">{config.pixelCount} units</span>
          </div>
          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={config.pixelCount}
            onChange={(e) => {
              updateConfig({ pixelCount: parseInt(e.target.value, 10) });
              requestReset();
            }}
            className="w-full accent-[#00ff88] h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {/* Pixel Velocity */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-300">Pixel Velocity</span>
            <span className="font-extrabold text-[#06b6d4]">{config.pixelSpeed} u/s</span>
          </div>
          <input
            type="range"
            min={60}
            max={180}
            step={5}
            value={config.pixelSpeed}
            onChange={(e) => updateConfig({ pixelSpeed: parseFloat(e.target.value) })}
            className="w-full accent-[#06b6d4] h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {/* Baymax Velocity */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-300">Baymax Velocity</span>
            <span className="font-extrabold text-[#e11d48]">{config.baymaxSpeed} u/s</span>
          </div>
          <input
            type="range"
            min={40}
            max={120}
            step={5}
            value={config.baymaxSpeed}
            onChange={(e) => updateConfig({ baymaxSpeed: parseFloat(e.target.value) })}
            className="w-full accent-[#e11d48] h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {/* Retarget Interval */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-300">Retarget Interval</span>
            <span className="font-extrabold text-amber-400">{config.retargetInterval.toFixed(1)} s</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={4.0}
            step={0.2}
            value={config.retargetInterval}
            onChange={(e) => updateConfig({ retargetInterval: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {/* Lunge Interval */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-300">Lunge Interval</span>
            <span className="font-extrabold text-[#e11d48]">{config.lungeInterval.toFixed(1)} s</span>
          </div>
          <input
            type="range"
            min={1.5}
            max={5.5}
            step={0.2}
            value={config.lungeInterval}
            onChange={(e) => updateConfig({ lungeInterval: parseFloat(e.target.value) })}
            className="w-full accent-[#e11d48] h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {/* Extraction Time Required */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-300">Extraction Required</span>
            <span className="font-extrabold text-yellow-400">{config.extractionTime.toFixed(0)} s</span>
          </div>
          <input
            type="range"
            min={6}
            max={20}
            step={1}
            value={config.extractionTime}
            onChange={(e) => updateConfig({ extractionTime: parseFloat(e.target.value) })}
            className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
