import React, { useState } from 'react';
import { HiveFeed } from './HiveFeed';
import { TrainingChart } from './TrainingChart';
import { Terminal, LineChart } from 'lucide-react';

export const HiveIntelligencePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chart' | 'feed'>('chart');

  return (
    <div className="c2-card rounded flex flex-col h-[280px] overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex items-center border-b border-slate-700/80 bg-[#070c14] text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-bold transition border-b-2 ${
            activeTab === 'chart'
              ? 'border-[#00ff88] text-[#00ff88] bg-[#0c1524]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>TRAINING CURVES</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-bold transition border-b-2 ${
            activeTab === 'feed'
              ? 'border-[#06b6d4] text-[#06b6d4] bg-[#0c1524]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>TELEMETRY FEED</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chart' ? (
          <div className="h-full p-2">
            <TrainingChart />
          </div>
        ) : (
          <div className="h-full p-2">
            <HiveFeed />
          </div>
        )}
      </div>
    </div>
  );
};
