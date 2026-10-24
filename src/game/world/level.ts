export const TILE = 16;
export const LEVEL_WIDTH = 160;
export const GROUND_Y = 174;

export type Solid = { x: number; y: number; w: number; h: number };
export const platforms: Solid[] = [
  { x: 0, y: GROUND_Y, w: LEVEL_WIDTH * TILE, h: 42 },
  { x: 160, y: 142, w: 96, h: 10 }, { x: 304, y: 122, w: 72, h: 10 },
  { x: 464, y: 150, w: 128, h: 10 }, { x: 670, y: 130, w: 90, h: 10 },
  { x: 870, y: 144, w: 115, h: 10 }, { x: 1080, y: 112, w: 130, h: 10 }
];
