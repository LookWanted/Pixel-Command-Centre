import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Activity } from 'lucide-react';

export const SimpleAnalytics: React.FC = () => {
  const { snapshot, eventLog, hiveLearningHistory } = useStore();
  const pct = Math.round(snapshot.extractionProgress * 100);
  const signalPoints = useMemo(() => {
    const values = hiveLearningHistory.length ? hiveLearningHistory : [{ time: 0, value: snapshot.hiveKnowledge }];
    if (values.length === 1) return `0,76 100,${76 - values[0].value * 64}`;
    return values.map((sample, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 76 - sample.value * 64;
      return `${x},${y}`;
    }).join(' ');
  }, [hiveLearningHistory, snapshot.hiveKnowledge]);
  return <div className="simple-side status-card">
    <section className="simple-panel">
      <p className="side-eyebrow">Scenario status</p>
      <div className="metric-grid">
        <div><span>Pixels left</span><b>{snapshot.aliveCount}<em> / {snapshot.totalPixels}</em></b></div>
        <div><span>Hive learning</span><b>{Math.round(snapshot.hiveKnowledge * 100)}<em>%</em></b></div>
      </div>
      <div className="progress-label"><span>Chip removal</span><b>{pct}%</b></div><div className="thin-progress"><i style={{ width: `${pct}%` }} /></div>
    </section>
    <section className="simple-panel technical-chart" aria-label="Hive learning signal chart">
      <div className="chart-heading"><p className="side-eyebrow">Hive signal</p><span>{Math.round(snapshot.hiveKnowledge * 100)}%</span></div>
      <svg viewBox="0 0 100 80" preserveAspectRatio="none" role="img" aria-label="Learning signal over time">
        <path className="chart-grid" d="M0 20H100M0 40H100M0 60H100M25 0V80M50 0V80M75 0V80" />
        <polyline className="chart-line" points={signalPoints} />
      </svg>
      <div className="chart-caption"><span>{hiveLearningHistory[0]?.time.toFixed(0) ?? 0}s</span><span>{snapshot.timeElapsed.toFixed(0)}s</span></div>
    </section>
    <section className="simple-panel">
      <p className="side-eyebrow">Activity</p>
      <div className="event-line"><Activity className="w-3.5 h-3.5 text-[#6dffb0]" />{eventLog.length ? eventLog[eventLog.length - 1].message : 'The range is ready. Choose Manual mode or let the swarm run.'}</div>
      <div className="event-log">{eventLog.slice(-5).reverse().map((event) => <div key={event.id}><time>{event.time.toFixed(1)}s</time>{event.message.replace(/^\[[^\]]+\]\s*/, '')}</div>)}</div>
    </section>
  </div>;
};
