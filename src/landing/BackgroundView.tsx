import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundViewProps {
  use3DModel?: boolean;
}

function PixelRobotHero({ scrubAngle }: { scrubAngle: number }) {
  const { scene } = useGLTF('/assets/models/pixel-textured.glb');
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef<number>(0.2);

  // Smooth lerp to mouse scrub angle
  useFrame((_, delta) => {
    if (groupRef.current) {
      targetRotation.current = scrubAngle;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current,
        delta * 6
      );
      // Gentle tilt with mouse height
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.05,
        delta * 4
      );
    }
  });

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
      {/* Positioned towards 70% center (right side) to balance hero typography on left */}
      <group ref={groupRef} position={[2.2, -0.4, 0]} scale={1.85}>
        <primitive object={cloned} />
        {/* Soft underglow aura */}
        <pointLight position={[0, -0.5, 0]} intensity={3.0} distance={5} color="#5DF9C0" />
        <pointLight position={[0, 1.5, 1]} intensity={2.0} distance={6} color="#D7E8FA" />
      </group>
    </Float>
  );
}

export const BackgroundView: React.FC<BackgroundViewProps> = ({ use3DModel = true }) => {
  const [scrubAngle, setScrubAngle] = useState(0.2);
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundtrackRef = useRef<HTMLAudioElement>(null);

  // Mouse controls only the 3D Pixel model. The cinematic remains a continuous loop.
  useEffect(() => {
    let prevX: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (prevX === null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;

      // 3D Model rotation scrub
      setScrubAngle((prev) => prev + (delta / window.innerWidth) * Math.PI * 2.2);

    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => undefined);
  }, []);

  // The soundtrack is intentionally scoped to the landing experience. Browsers
  // may require one gesture before allowing audible playback, so retry once on
  // the first input without adding another control to the minimal header.
  useEffect(() => {
    const soundtrack = soundtrackRef.current;
    if (!soundtrack) return;

    soundtrack.volume = 0.34;
    const startSoundtrack = () => soundtrack.play().catch(() => undefined);
    startSoundtrack();

    window.addEventListener('pointerdown', startSoundtrack, { once: true });
    window.addEventListener('keydown', startSoundtrack, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startSoundtrack);
      window.removeEventListener('keydown', startSoundtrack);
      soundtrack.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black">
      {/* Crop the source's baked-in letterbox and upper-right channel mark. */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/assets/portal_bg.mp4"
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            use3DModel ? 'opacity-70 brightness-90' : 'opacity-75 brightness-90'
          }`}
          style={{ objectPosition: 'center center', transform: 'scale(1.34)' }}
        />
      </div>
      <audio ref={soundtrackRef} src="/assets/portal_soundtrack.mp3" autoPlay loop preload="auto" />

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* 2. Optional 3D Model Layer over the Portal Video */}
      {use3DModel && (
        <div className="absolute inset-0 z-1">
          <Canvas
            shadows
            camera={{ position: [0, 0, 7.5], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={1.4} />
            <directionalLight position={[10, 15, 10]} intensity={2.5} color="#F7E600" />
            <directionalLight position={[-10, 5, -5]} intensity={2.0} color="#3B1EFF" />
            <Suspense fallback={null}>
              <PixelRobotHero scrubAngle={scrubAngle} />
            </Suspense>
          </Canvas>
          {/* Subtle gradient vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};
