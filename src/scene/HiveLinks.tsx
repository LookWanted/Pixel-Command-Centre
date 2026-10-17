import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PixelState } from '../sim/types';

interface HiveLinksProps {
  pixels: PixelState[];
  hiveKnowledge: number;
}

export const HiveLinks: React.FC<HiveLinksProps> = ({ pixels, hiveKnowledge }) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const maxPairs = 350;

  const positions = useMemo(() => new Float32Array(maxPairs * 2 * 3), []);
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const prevKnowledgeRef = useRef(hiveKnowledge);
  const pulseIntensityRef = useRef(0);

  useFrame((state, delta) => {
    if (!linesRef.current) return;

    const time = state.clock.getElapsedTime();

    // Trigger bright neural wave pulse when hive knowledge increases
    if (hiveKnowledge > prevKnowledgeRef.current + 0.005) {
      pulseIntensityRef.current = 1.0;
    }
    prevKnowledgeRef.current = hiveKnowledge;

    if (pulseIntensityRef.current > 0.01) {
      pulseIntensityRef.current = THREE.MathUtils.lerp(pulseIntensityRef.current, 0, delta * 3.5);
    } else {
      pulseIntensityRef.current = 0;
    }

    const alivePixels = pixels.filter((p) => p.alive);
    let pairIdx = 0;
    // Connect swarm peers within tactical radius
    const maxLinkDist = 16.0;

    for (let i = 0; i < alivePixels.length; i++) {
      for (let j = i + 1; j < alivePixels.length; j++) {
        if (pairIdx >= maxPairs) break;

        const pA = alivePixels[i];
        const pB = alivePixels[j];

        const xA = pA.pos.x * 0.1;
        const zA = pA.pos.y * 0.1;
        const xB = pB.pos.x * 0.1;
        const zB = pB.pos.y * 0.1;

        const dist = Math.hypot(xA - xB, zA - zB);
        if (dist <= maxLinkDist) {
          const ptr = pairIdx * 6;
          positions[ptr] = xA;
          positions[ptr + 1] = 0.95;
          positions[ptr + 2] = zA;

          positions[ptr + 3] = xB;
          positions[ptr + 4] = 0.95;
          positions[ptr + 5] = zB;

          pairIdx++;
        }
      }
    }

    for (let k = pairIdx * 6; k < maxPairs * 6; k++) {
      positions[k] = 0;
    }

    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, pairIdx * 2);

    // Dynamic wave pulsation
    const wave = Math.sin(time * 6.0) * 0.2 + 0.8;
    const baseOpacity = Math.max(0.18, hiveKnowledge * 0.75);
    const finalOpacity = Math.min(1.0, baseOpacity * wave + pulseIntensityRef.current * 0.8);

    const mat = linesRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = finalOpacity;
  });

  return (
    <lineSegments ref={linesRef} geometry={lineGeo}>
      <lineBasicMaterial
        color="#3DFFA2" // Target tactical green
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};
