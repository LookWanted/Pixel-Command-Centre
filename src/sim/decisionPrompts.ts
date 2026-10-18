export type DecisionPrompt = {
  id: string;
  question: string;
  options: [string, string];
  bestOption: number;
  outcome: string;
};

// Short operator checks that are grounded in the live arena vocabulary.
export const DECISION_PROMPTS: DecisionPrompt[] = [
  { id: 'dash', question: 'Baymax is winding up a dash. What should Pixel do?', options: ['Spread the swarm', 'Hold a tight ring'], bestOption: 0, outcome: 'Swarm spacing widened before the impact.' },
  { id: 'low-health', question: 'Baymax health is dropping. What is Pixel’s next move?', options: ['Keep pressure on', 'Pause the swarm'], bestOption: 0, outcome: 'The swarm keeps pressure on Baymax.' },
  { id: 'formation', question: 'The nanobots are ready to regroup. Which call is safer?', options: ['Build away from Baymax', 'Build at his feet'], bestOption: 0, outcome: 'The formation begins at a safe distance.' },
  { id: 'tracking', question: 'Baymax has locked onto Pixel. What should Pixel do?', options: ['Change direction', 'Fly in a straight line'], bestOption: 0, outcome: 'Pixel breaks its flight line.' },
  { id: 'opening', question: 'Baymax is scanning, but has no target. What is the best next step?', options: ['Probe from range', 'Rush in alone'], bestOption: 0, outcome: 'Pixel probes from the edge of the arena.' },
  { id: 'structure', question: 'The swarm has finished a structure. What now?', options: ['Return to attack', 'Stay clustered'], bestOption: 0, outcome: 'The nanobots resume their attack pattern.' },
  { id: 'healthcare', question: 'Baymax is briefly recovering. What should Pixel prioritise?', options: ['Coordinate a new wave', 'Stop all movement'], bestOption: 0, outcome: 'Pixel directs a fresh attack wave.' },
  { id: 'camera', question: 'Baymax is approaching from the left. What route should Pixel take?', options: ['Arc behind him', 'Hover directly ahead'], bestOption: 0, outcome: 'Pixel arcs out of his direct approach.' },
  { id: 'range', question: 'Pixel is outside Baymax’s reach. What should the swarm do?', options: ['Build a distant structure', 'Pile onto Baymax'], bestOption: 0, outcome: 'The swarm assembles at the perimeter.' },
  { id: 'final', question: 'The combat chip is nearly removed. What does Pixel do?', options: ['Keep the network active', 'Fly away'], bestOption: 0, outcome: 'Pixel maintains the command network.' }
];
