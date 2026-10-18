import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BaymaxState } from '../sim/types';

interface CameraRigProps {
  baymaxState: BaymaxState;
  cinematic: boolean;
  baymaxPov: boolean;
  zoom: number;
  extractionProgress: number;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  baymaxState,
  cinematic,
  baymaxPov,
  zoom,
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
      const forwardX = Math.cos(baymaxState.angle);
      const forwardZ = Math.sin(baymaxState.angle);

      if (baymaxPov) {
        // A first-person camera placed at Baymax's eye line and directed along
        // his real simulation heading.
        const eyeX = bx + forwardX * 0.18;
        const eyeZ = bz + forwardZ * 0.18;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, eyeX, delta * 7);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.85, delta * 7);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, eyeZ, delta * 7);
        controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, bx + forwardX * 10, delta * 7);
        controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, 2.8, delta * 7);
        controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, bz + forwardZ * 10, delta * 7);
        controlsRef.current.update();
        return;
      }

      if (cinematic) {
        // Follow-cam is opt-in. In free mode we must not write to the camera
        // or its target: OrbitControls owns both so every angle can be held.
        const time = state.clock.getElapsedTime();
        const driftX = Math.sin(time * 0.15) * 1.2;
        const driftZ = Math.cos(time * 0.12) * 1.0;
        const zoomFactor = 1.0 - extractionProgress * 0.28;
        // Follow-cam mode active: tracks Baymax dynamics
        // Follow Baymax's actual arena position. The old half-strength X
        // offset let him drift out of frame whenever he crossed the range.
        const targetCamX = bx + driftX;
        const targetCamY = (15.5 + Math.sin(time * 0.1) * 0.6) * zoomFactor * zoom;
        const targetCamZ = bz + 19.5 * zoomFactor * zoom + driftZ;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX + shakeX, delta * 3.0);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY + shakeY, delta * 3.0);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, delta * 3.0);

        const currentTarget = controlsRef.current.target;
        currentTarget.x = THREE.MathUtils.lerp(currentTarget.x, bx, delta * 3.5);
        currentTarget.y = THREE.MathUtils.lerp(currentTarget.y, 1.8, delta * 3.5);
        currentTarget.z = THREE.MathUtils.lerp(currentTarget.z, bz, delta * 3.5);
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
      enableRotate={!baymaxPov}
      enableZoom={!baymaxPov}
      enablePan={!baymaxPov}
      dampingFactor={0.06}
      minPolarAngle={0.03}
      maxPolarAngle={Math.PI / 2 - 0.015}
      minDistance={4}
      maxDistance={110}
    />
  );
};
