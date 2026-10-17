import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BaymaxState } from '../sim/types';

interface CameraRigProps {
  baymaxState: BaymaxState;
  cinematic: boolean;
  extractionProgress: number;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  baymaxState,
  cinematic,
  extractionProgress
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const shakeIntensity = useRef<number>(0);
  const lastState = useRef<string>(baymaxState.state);

  // Detect lunge trigger for camera shake
  useEffect(() => {
    if (baymaxState.state === 'lunging' && lastState.current !== 'lunging') {
      shakeIntensity.current = 1.0;
    }
    lastState.current = baymaxState.state;
  }, [baymaxState.state]);

  useFrame((state, delta) => {
    // Decay camera shake
    if (shakeIntensity.current > 0.01) {
      shakeIntensity.current = THREE.MathUtils.lerp(shakeIntensity.current, 0, delta * 6);
    } else {
      shakeIntensity.current = 0;
    }

    const shakeX = (Math.random() - 0.5) * shakeIntensity.current * 0.7;
    const shakeY = (Math.random() - 0.5) * shakeIntensity.current * 0.7;

    if (controlsRef.current) {
      const bx = baymaxState.pos.x * 0.1;
      const bz = baymaxState.pos.y * 0.1;

      // Gentle idle drift
      const time = state.clock.getElapsedTime();
      const driftX = Math.sin(time * 0.15) * 1.2;
      const driftZ = Math.cos(time * 0.12) * 1.0;

      // Push in closer during chip extraction
      const zoomFactor = 1.0 - extractionProgress * 0.28;

      if (cinematic) {
        // Follow-cam mode active: tracks Baymax dynamics
        const targetCamX = bx * 0.5 + driftX;
        const targetCamY = (15.5 + Math.sin(time * 0.1) * 0.6) * zoomFactor;
        const targetCamZ = bz * 0.5 + 19.5 * zoomFactor + driftZ;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX + shakeX, delta * 3.0);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY + shakeY, delta * 3.0);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, delta * 3.0);

        const currentTarget = controlsRef.current.target;
        currentTarget.x = THREE.MathUtils.lerp(currentTarget.x, bx, delta * 3.5);
        currentTarget.y = THREE.MathUtils.lerp(currentTarget.y, 1.8, delta * 3.5);
        currentTarget.z = THREE.MathUtils.lerp(currentTarget.z, bz, delta * 3.5);
      } else {
        // Fixed arena overview mode
        const targetCamX = driftX;
        const targetCamY = 16.5 * zoomFactor;
        const targetCamZ = 21.0 * zoomFactor + driftZ;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX + shakeX, delta * 2.5);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY + shakeY, delta * 2.5);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, delta * 2.5);

        const currentTarget = controlsRef.current.target;
        currentTarget.x = THREE.MathUtils.lerp(currentTarget.x, 0, delta * 3.0);
        currentTarget.y = THREE.MathUtils.lerp(currentTarget.y, 1.5, delta * 3.0);
        currentTarget.z = THREE.MathUtils.lerp(currentTarget.z, 0, delta * 3.0);
      }
      controlsRef.current.update();
    } else if (shakeIntensity.current > 0) {
      camera.position.x += shakeX;
      camera.position.y += shakeY;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
      minDistance={10}
      maxDistance={85}
    />
  );
};
