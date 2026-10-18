import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundViewProps {
  use3DModel?: boolean;
}

function PixelRobotHero({ pointer }: { pointer: { x: number; y: number } }) {
  const { scene } = useGLTF('/assets/models/pixel-textured.glb');
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3(2.2, -0.4, 0));

  // Smooth lerp to mouse scrub angle
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 1.05,
        1 - Math.exp(-12 * delta)
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.34,
        1 - Math.exp(-12 * delta)
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.18, 1 - Math.exp(-10 * delta));
      targetPosition.current.set(2.2 + pointer.x * 1.35, -0.4 - pointer.y * 0.72, pointer.x * -0.28);
      groupRef.current.position.lerp(targetPosition.current, 1 - Math.exp(-10 * delta));
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
    <Float speed={2.6} rotationIntensity={0.28} floatIntensity={0.55}>
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
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundtrackRef = useRef<HTMLAudioElement>(null);

  // Mouse controls only the 3D Pixel model. The cinematic remains a continuous loop.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPointer({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
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

  // The portal video is the master clock. Its clip is shorter than the score,
  // so the soundtrack deliberately restarts with each visual loop instead of
  // slowly drifting into an unrelated section of music.
  useEffect(() => {
    const soundtrack = soundtrackRef.current;
    const video = videoRef.current;
    if (!soundtrack || !video) return;

    soundtrack.volume = 0.34;
    soundtrack.loop = false;

    const syncSoundtrack = (force = false) => {
      if (soundtrack.readyState < HTMLMediaElement.HAVE_METADATA) return;
      if (force || Math.abs(soundtrack.currentTime - video.currentTime) > 0.12) {
        soundtrack.currentTime = video.currentTime;
      }
    };
    const startSoundtrack = () => {
      syncSoundtrack();
      soundtrack.play().catch(() => undefined);
    };
    const pauseSoundtrack = () => soundtrack.pause();
    const restartLoop = () => {
      syncSoundtrack(true);
      if (!video.paused) startSoundtrack();
    };
    const handleTimelineSync = () => syncSoundtrack();
    const handleAudioMetadata = () => syncSoundtrack(true);

    startSoundtrack();

    window.addEventListener('pointerdown', startSoundtrack, { once: true });
    window.addEventListener('keydown', startSoundtrack, { once: true });
    soundtrack.addEventListener('loadedmetadata', handleAudioMetadata, { once: true });
    video.addEventListener('timeupdate', handleTimelineSync);
    video.addEventListener('seeking', restartLoop);
    video.addEventListener('play', startSoundtrack);
    video.addEventListener('pause', pauseSoundtrack);
    return () => {
      window.removeEventListener('pointerdown', startSoundtrack);
      window.removeEventListener('keydown', startSoundtrack);
      soundtrack.removeEventListener('loadedmetadata', handleAudioMetadata);
      video.removeEventListener('timeupdate', handleTimelineSync);
      video.removeEventListener('seeking', restartLoop);
      video.removeEventListener('play', startSoundtrack);
      video.removeEventListener('pause', pauseSoundtrack);
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
      <audio
        ref={soundtrackRef}
        src="/assets/portal_soundtrack.mp3"
        autoPlay
        preload="auto"
      />

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
              <PixelRobotHero pointer={pointer} />
            </Suspense>
          </Canvas>
          {/* Subtle gradient vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};
