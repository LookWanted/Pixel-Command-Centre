import type { GameInput } from '../engine/input';
import { GROUND_Y, platforms, type Solid } from '../world/level';

export type Player = { x:number; y:number; vx:number; vy:number; grounded:boolean; facing:1|-1; coyote:number; jumpBuffer:number; jumpHeld:boolean; cells:number; gears:number; lives:number; };
export const createPlayer = (): Player => ({ x: 58, y: GROUND_Y - 23, vx: 0, vy: 0, grounded: false, facing: 1, coyote: 0, jumpBuffer: 0, jumpHeld: false, cells: 3, gears: 0, lives: 3 });
const intersects = (x:number,y:number,w:number,h:number,s:Solid) => x < s.x+s.w && x+w > s.x && y < s.y+s.h && y+h > s.y;
export const updatePlayer = (p:Player, input:GameInput, dt:number) => {
  const max = input.run ? 130 : 80, accel = input.run ? 900 : 700;
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (direction) { p.vx += direction * accel * dt; p.facing = direction as 1|-1; } else p.vx *= Math.max(0, 1 - 900 * dt / Math.max(1, Math.abs(p.vx)));
  p.vx = Math.max(-max, Math.min(max, p.vx));
  p.coyote = p.grounded ? .1 : Math.max(0, p.coyote - dt);
  p.jumpBuffer = input.jumpPressed ? .12 : Math.max(0, p.jumpBuffer - dt);
  if (p.jumpBuffer && p.coyote) { p.vy = -330; p.grounded = false; p.coyote = 0; p.jumpBuffer = 0; }
  if (!input.jump && p.jumpHeld && p.vy < 0) p.vy *= .4;
  p.jumpHeld = input.jump;
  p.vy = Math.min(340, p.vy + 1000 * dt);
  p.x += p.vx * dt;
  for (const s of platforms) if (intersects(p.x,p.y,10,22,s)) { if (p.vx > 0) p.x = s.x - 10; else if (p.vx < 0) p.x = s.x + s.w; p.vx = 0; }
  p.y += p.vy * dt; p.grounded = false;
  for (const s of platforms) if (intersects(p.x,p.y,10,22,s)) {
    if (p.vy >= 0 && p.y + 22 - p.vy * dt <= s.y + 2) { p.y = s.y - 22; p.vy = 0; p.grounded = true; }
    else if (p.vy < 0) { p.y = s.y + s.h; p.vy = 0; }
  }
  p.x = Math.max(0, Math.min(p.x, 2520));
};
