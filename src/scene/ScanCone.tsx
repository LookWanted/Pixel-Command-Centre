import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BaymaxState, PixelState } from '../sim/types';

interface ScanConeProps {
  baymaxState: BaymaxState;
  pixels: PixelState[];
  lungeReach: number;
}

export const ScanCone: React.FC<ScanConeProps> = ({
  baymaxState,
  pixels,
  lungeReach
}) => {
  const coneGroupRef = useRef<THREE.Group>(null);
  const sweepRef = useRef<THREE.Group>(null);
  const reachRingRef = useRef<THREE.Group>(null);

  const baymax3DX = baymaxState.pos.x * 0.1;
  const baymax3DZ = baymaxState.pos.y * 0.1;
  const reach3D = lungeReach * 0.1;
  const scanRadius3D = baymaxState.scanRadius * 0.1;


  useFrame((state, delta) => {
    if (coneGroupRef.current) {
      coneGroupRef.current.position.x = THREE.MathUtils.lerp(coneGroupRef.current.position.x, baymax3DX, delta * 15);
      coneGroupRef.current.position.z = THREE.MathUtils.lerp(coneGroupRef.current.position.z, baymax3DZ, delta * 15);
      coneGroupRef.current.rotation.y = -baymaxState.angle + Math.PI / 2;
    }

    if (sweepRef.current) {
      // Scanning sweep oscillation
      const sweep = Math.sin(state.clock.getElapsedTime() * 4.5) * 0.45;
      sweepRef.current.rotation.y = sweep;
    }

    if (reachRingRef.current) {
      reachRingRef.current.rotation.y += delta * 0.2;
    }

  });

  if (baymaxState.state === 'pacified') return null;

  return (
    <>
      {/* Radar Scan Cone attached to Baymax */}
      <group ref={coneGroupRef} position={[baymax3DX, 0.4, baymax3DZ]}>
        {/* Forward Scan Field Arc */}
        <group ref={sweepRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, scanRadius3D * 0.5]}>
            <coneGeometry args={[scanRadius3D * 0.6, scanRadius3D, 24, 1, true, -0.6, 1.2]} />
            <meshBasicMaterial
              color="#ff3344"
              transparent
              opacity={0.035}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

        </group>

        {/* Dashed Ring showing Lunge Reach Boundary */}
        <group ref={reachRingRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[reach3D - 0.12, reach3D + 0.12, 64]} />
            <meshBasicMaterial
              color="#ff3344"
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>

    </>
  );
};
