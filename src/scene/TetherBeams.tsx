import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BaymaxState, PixelState } from '../sim/types';

interface TetherBeamsProps {
  pixels: PixelState[];
  baymaxState: BaymaxState;
  extractionProgress: number;
}

export const TetherBeams: React.FC<TetherBeamsProps> = ({
  pixels,
  baymaxState,
  extractionProgress
}) => {
  const maxTethers = 12;
  const positions = useMemo(() => new Float32Array(maxTethers * 2 * 3), []);
  const colors = useMemo(() => new Float32Array(maxTethers * 2 * 3), []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const holderColor = useMemo(() => new THREE.Color('#3DFFA2'), []);
  const pullerColor = useMemo(() => new THREE.Color('#FF9F43'), []);
  const grabberColor = useMemo(() => new THREE.Color('#FFD54F'), []);
  const defaultColor = useMemo(() => new THREE.Color('#4FC3F7'), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const bx = baymaxState.pos.x * 0.1;
    const bz = baymaxState.pos.y * 0.1;
    const cosA = Math.cos(baymaxState.angle);
    const sinA = Math.sin(baymaxState.angle);

    let tetherIdx = 0;

    for (const p of pixels) {
      if (!p.alive || !p.inContactWithBaymax) continue;
      if (tetherIdx >= maxTethers) break;

      const px = p.pos.x * 0.1;
      const pz = p.pos.y * 0.1;

      const ptr = tetherIdx * 6;
      // Pixel end
      positions[ptr] = px;
      positions[ptr + 1] = 0.95;
      positions[ptr + 2] = pz;

      // Calculate Baymax specific anatomical attach point
      let targetOffsetX = 0;
      let targetOffsetY = 2.0;
      let targetOffsetZ = 0;
      let tetherCol = defaultColor;

      if (p.role === 'holder') {
        // Grips Baymax's left arm
        targetOffsetX = -1.25;
        targetOffsetY = 2.1;
        targetOffsetZ = 0.1;
        tetherCol = holderColor;
      } else if (p.role === 'puller') {
        // Grips Baymax from behind (back torso)
        targetOffsetX = 0;
        targetOffsetY = 1.8;
        targetOffsetZ = -1.2;
        tetherCol = pullerColor;
      } else if (p.role === 'grabber') {
        // Clamps onto chest chip slot
        targetOffsetX = -0.42;
        targetOffsetY = 2.38;
        targetOffsetZ = 1.05;
        tetherCol = grabberColor;
      }

      // Rotate offset by Baymax facing angle
      const worldTargetX = bx + targetOffsetX * sinA + targetOffsetZ * cosA;
      const worldTargetZ = bz - targetOffsetX * cosA + targetOffsetZ * sinA;

      // Jitter for electric tether arc
      const jitterX = Math.sin(time * 30 + tetherIdx * 4) * 0.04;
      const jitterZ = Math.cos(time * 30 + tetherIdx * 4) * 0.04;

      positions[ptr + 3] = worldTargetX + jitterX;
      positions[ptr + 4] = targetOffsetY;
      positions[ptr + 5] = worldTargetZ + jitterZ;

      // Vertex colors
      colors[ptr] = tetherCol.r;
      colors[ptr + 1] = tetherCol.g;
      colors[ptr + 2] = tetherCol.b;

      colors[ptr + 3] = tetherCol.r * 1.5;
      colors[ptr + 4] = tetherCol.g * 1.5;
      colors[ptr + 5] = tetherCol.b * 1.5;

      tetherIdx++;
    }

    for (let k = tetherIdx * 6; k < maxTethers * 6; k++) {
      positions[k] = 0;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.setDrawRange(0, tetherIdx * 2);
  });

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        vertexColors
        linewidth={3}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};
