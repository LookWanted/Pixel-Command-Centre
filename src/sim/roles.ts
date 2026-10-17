import { PixelRole, PixelState, SimEvent } from './types';

export function assignInitialRoles(pixels: PixelState[], missionMode: 'extract' | 'decoy'): void {
  // If decoy mission, all are decoys
  if (missionMode === 'decoy') {
    pixels.forEach(p => { p.role = 'decoy'; });
    return;
  }

  // Extract mission requires Holder, Puller, Grabber
  const alivePixels = pixels.filter(p => p.alive);
  if (alivePixels.length === 0) return;

  // Reset all to decoy first
  pixels.forEach(p => { p.role = 'decoy'; });

  // Assign primary roles
  if (alivePixels[0]) alivePixels[0].role = 'holder';
  if (alivePixels[1]) alivePixels[1].role = 'puller';
  if (alivePixels[2]) alivePixels[2].role = 'grabber';
  // Remaining stay decoys (or backup holders if count > 6)
  for (let i = 3; i < alivePixels.length; i++) {
    alivePixels[i].role = 'decoy';
  }
}

/**
 * BACKUP: If a Pixel holding a primary role dies, the nearest free decoy takes over that role immediately.
 */
export function handleBackupPromotions(
  pixels: PixelState[],
  time: number,
  events: SimEvent[]
): void {
  const rolesNeeded: PixelRole[] = ['holder', 'puller', 'grabber'];

  for (const role of rolesNeeded) {
    const activeHolder = pixels.find(p => p.alive && p.role === role);
    if (!activeHolder) {
      // Find nearest living decoy to take over
      let nearestDecoy: PixelState | null = null;
      let minDistSq = Infinity;

      for (const p of pixels) {
        if (p.alive && p.role === 'decoy') {
          // evaluate availability
          const distSq = p.pos.x * p.pos.x + p.pos.y * p.pos.y;
          if (distSq < minDistSq) {
            minDistSq = distSq;
            nearestDecoy = p;
          }
        }
      }

      if (nearestDecoy) {
        nearestDecoy.role = role;
        nearestDecoy.promotedFlash = 1.2; // 1.2s visual flash
        events.push({
          id: `backup_${time}_${nearestDecoy.id}`,
          time,
          kind: 'backup_promoted',
          message: `[BACKUP] PIXEL #${nearestDecoy.id.toString().padStart(2, '0')} promoted to ${role.toUpperCase()}`,
          data: { pixelId: nearestDecoy.id, newRole: role }
        });
      }
    }
  }
}

/**
 * Checks contact status for Holder, Puller, Grabber around Baymax.
 * Holder positions: sides (left/right arm). Slows Baymax 25% per gripping Pixel (min 25% speed).
 * Puller position: behind Baymax (-angle direction).
 * Grabber position: front chest chip (+angle direction).
 */
export function checkRoleContact(
  pixels: PixelState[],
  baymaxPos: { x: number; y: number },
  baymaxAngle: number,
  contactDist: number = 32
): {
  holderInContact: boolean;
  pullerInContact: boolean;
  grabberInContact: boolean;
  grippingCount: number;
} {
  let holderInContact = false;
  let pullerInContact = false;
  let grabberInContact = false;
  let grippingCount = 0;

  const cosA = Math.cos(baymaxAngle);
  const sinA = Math.sin(baymaxAngle);

  // Target contact slots relative to Baymax
  // Chest (Grabber): +20 units forward
  const chestX = baymaxPos.x + cosA * 20;
  const chestY = baymaxPos.y + sinA * 20;

  // Rear tether (Puller): -28 units backward
  const rearX = baymaxPos.x - cosA * 28;
  const rearY = baymaxPos.y - sinA * 28;

  // Left arm (Holder): left perp
  const armLX = baymaxPos.x - sinA * 24;
  const armLY = baymaxPos.y + cosA * 24;

  // Right arm (Holder): right perp
  const armRX = baymaxPos.x + sinA * 24;
  const armRY = baymaxPos.y - cosA * 24;

  for (const p of pixels) {
    if (!p.alive) {
      p.inContactWithBaymax = false;
      continue;
    }

    if (p.gripBrokenCooldown > 0) {
      p.inContactWithBaymax = false;
      continue;
    }

    const distToBaymax = Math.hypot(p.pos.x - baymaxPos.x, p.pos.y - baymaxPos.y);

    if (p.role === 'holder') {
      const dL = Math.hypot(p.pos.x - armLX, p.pos.y - armLY);
      const dR = Math.hypot(p.pos.x - armRX, p.pos.y - armRY);
      if (dL < contactDist || dR < contactDist || distToBaymax < contactDist * 0.9) {
        p.inContactWithBaymax = true;
        holderInContact = true;
        grippingCount++;
      } else {
        p.inContactWithBaymax = false;
      }
    } else if (p.role === 'puller') {
      const dRear = Math.hypot(p.pos.x - rearX, p.pos.y - rearY);
      if (dRear < contactDist * 1.3 || (distToBaymax < contactDist * 1.2 && isBehind(p.pos, baymaxPos, cosA, sinA))) {
        p.inContactWithBaymax = true;
        pullerInContact = true;
      } else {
        p.inContactWithBaymax = false;
      }
    } else if (p.role === 'grabber') {
      const dChest = Math.hypot(p.pos.x - chestX, p.pos.y - chestY);
      if (dChest < contactDist * 1.1) {
        p.inContactWithBaymax = true;
        grabberInContact = true;
      } else {
        p.inContactWithBaymax = false;
      }
    } else {
      p.inContactWithBaymax = false;
    }
  }

  return {
    holderInContact,
    pullerInContact,
    grabberInContact,
    grippingCount
  };
}

function isBehind(pos: { x: number; y: number }, baymaxPos: { x: number; y: number }, cosA: number, sinA: number): boolean {
  const dx = pos.x - baymaxPos.x;
  const dy = pos.y - baymaxPos.y;
  const dot = dx * cosA + dy * sinA;
  return dot < 0; // Behind forward vector
}
