import React from 'react';
import { useStore } from '../store/useStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart2 } from 'lucide-react';

export const TrainingChart: React.FC = () => {
  const { history, abResults, clearABResults } = useStore();

  const last20 = history.slice(-20);
  const winCount = last20.filter(ep => ep.success).length;
  const winRate = last20.length > 0 ? Math.round((winCount / last20.length) * 100) : 0;
  const avgSurvivors = last20.length > 0
    ? (last20.reduce((acc, ep) => acc + ep.survivors, 0) / last20.length).toFixed(1)
    : '0';

  const chartData = history.slice(-40).map((ep) => ({
    ep: `E${ep.episodeNumber}`,
    survivors: ep.survivors,
    knowledge: ep.hiveKnowledge,
    progress: ep.extractionProgress
  }));

  const abChartData = abResults.active
    ? Array.from({ length: Math.max(abResults.hiveOn.length, abResults.hiveOff.length) }).map((_, idx) => ({
        ep: `E${idx + 1}`,
        hiveOnSurvivors: abResults.hiveOn[idx]?.survivors ?? 0,
        hiveOffSurvivors: abResults.hiveOff[idx]?.survivors ?? 0
      }))
    : [];

  return (
    <div className="h-full flex flex-col font-mono text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-1 flex-shrink-0 text-[10px]">
        {abResults.active ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[#00ff88] font-bold">A/B BENCHMARK: HIVE ON VS OFF</span>
            <button
              onClick={clearABResults}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
            >
              EXIT A/B
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-400">
            <span>
              WIN (L20): <strong className={winRate > 50 ? "text-[#00ff88]" : "text-amber-400"}>{winRate}%</strong>
            </span>
            <span>
              AVG SURVIVORS: <strong className="text-[#06b6d4]">{avgSurvivors}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 pt-1">
        {abResults.active ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={abChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ep" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 20]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070c14', borderColor: '#334155', fontSize: '10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '9px' }} />
              <Line
                type="monotone"
                dataKey="hiveOnSurvivors"
                name="Hive ON"
                stroke="#00ff88"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="hiveOffSurvivors"
                name="Hive OFF"
                stroke="#e11d48"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4 space-y-1">
            <BarChart2 className="w-6 h-6 opacity-40 text-[#00ff88]" />
            <p className="text-[10px]">No episodes recorded yet.</p>
            <p className="text-[9px] text-slate-600">Click "TRAIN 50 EP" or let simulation run.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ep" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070c14', borderColor: '#334155', fontSize: '10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '9px' }} />
              <Line
                type="monotone"
                dataKey="survivors"
                name="Survivors"
                stroke="#00ff88"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="knowledge"
                name="Hive Knowledge %"
                stroke="#06b6d4"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
