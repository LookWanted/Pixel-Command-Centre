import React from 'react';
import { useStore } from '../store/useStore';
import { Eye, Cpu, Users, RotateCcw } from 'lucide-react';
import { PixelEmotions } from './PixelEmotions';
import { PixelThinkingPanel } from './PixelThinkingPanel';

export const SimpleControls: React.FC = () => {
  const { snapshot, setTriggerAction, requestReset } = useStore();
  return <div className="simple-side mission-card">
    <section className="simple-panel">
      <div className="mission-card__topline"><p className="side-eyebrow">Active mission</p><span>Range 04</span></div>
      <h2>Restore Baymax<span className="mission-card__period">.</span></h2>
      <p>Keep the command drone alive long enough to remove Baymax’s combat chip. Manual control is always available.</p>
      <div className="action-stack">
        <button onClick={() => setTriggerAction('split_attention')} className="action-row"><Eye /><span className="action-row__copy"><strong>Distract Baymax</strong><small>Break target lock</small></span><b>{snapshot.wastedRetargets}</b></button>
        <button onClick={() => setTriggerAction('test_hive_pulse')} className="action-row"><Cpu /><span className="action-row__copy"><strong>Share learning</strong><small>Feed the swarm model</small></span><b>{Math.round(snapshot.hiveKnowledge * 100)}%</b></button>
        <button onClick={() => setTriggerAction('force_clamp')} className="action-row"><Users /><span className="action-row__copy"><strong>Start chip removal</strong><small>Commit the swarm</small></span><b>{Math.round(snapshot.extractionProgress * 100)}%</b></button>
      </div>
      <button onClick={requestReset} className="text-button"><RotateCcw /> Restart scenario</button>
    </section>
    <PixelEmotions />
    <PixelThinkingPanel />
  </div>;
};
