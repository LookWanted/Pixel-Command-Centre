import React from 'react';
import { useStore } from '../store/useStore';
import { Eye, Cpu, Users, RotateCcw } from 'lucide-react';
import { PixelEmotions } from './PixelEmotions';

export const SimpleControls: React.FC = () => {
  const { snapshot, setTriggerAction, requestReset } = useStore();
  return <div className="simple-side mission-card">
    <section className="simple-panel">
      <p className="side-eyebrow">Mission</p>
      <h2>Restore Baymax</h2>
      <p>Guide the Pixels long enough to remove the combat chip. Take manual control at any time.</p>
      <div className="action-stack">
        <button onClick={() => setTriggerAction('split_attention')} className="action-row"><Eye /> Distract Baymax <span>{snapshot.wastedRetargets}</span></button>
        <button onClick={() => setTriggerAction('test_hive_pulse')} className="action-row"><Cpu /> Share learning <span>{Math.round(snapshot.hiveKnowledge * 100)}%</span></button>
        <button onClick={() => setTriggerAction('force_clamp')} className="action-row"><Users /> Start chip removal <span>{Math.round(snapshot.extractionProgress * 100)}%</span></button>
      </div>
      <button onClick={requestReset} className="text-button"><RotateCcw /> Restart scenario</button>
    </section>
    <PixelEmotions />
  </div>;
};
