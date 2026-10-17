// Deterministic 32-bit PRNG (Mulberry32) for reproducible simulation runs

export function createRNG(seed: number) {
  let s = Math.floor(seed) >>> 0;
  if (s === 0) s = 1337;

  return {
    next(): number {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min: number, max: number): number {
      return min + this.next() * (max - min);
    },
    getState(): number {
      return s;
    },
    setState(newState: number) {
      s = newState >>> 0;
    }
  };
}
