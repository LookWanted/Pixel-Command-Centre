import React, { useRef, useMemo, useState, useCallback, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BaymaxState, PixelState } from '../sim/types';
import { BaymaxObjAsset, BaymaxWalkMotion } from './BaymaxObjAsset';

interface BaymaxModelProps {
  baymaxState: BaymaxState;
  isPacified: boolean;
  extractionProgress: number;
}

export const BaymaxModel: React.FC<BaymaxModelProps> = ({
  baymaxState,
  isPacified,
  extractionProgress
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const chipRef = useRef<THREE.Mesh>(null);
  const chipLightRef = useRef<THREE.PointLight>(null);
  const scaleTargetRef = useRef(new THREE.Vector3(1, 1, 1));
  const walkMotionRef = useRef<BaymaxWalkMotion>({ stride: 0, amount: 0 });
  const flyOutProgressRef = useRef(0);
  const [cadReady, setCadReady] = useState(false);
  const handleCadReady = useCallback(() => setCadReady(true), []);

  const targetX = baymaxState.pos.x * 0.1;
  const targetZ = baymaxState.pos.y * 0.1;

  // High-fidelity Vinyl Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isPacified ? '#FFFFFF' : '#FAFCFF'),
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      sheen: 0.4,
      sheenColor: new THREE.Color('#D8E6F8'),
      ior: 1.45
    });
  }, [isPacified]);

  const armorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E10600'), // Big Hero 6 Combat Red
      roughness: 0.25,
      metalness: 0.4,
      emissive: new THREE.Color('#3A0000')
    });
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Frame-rate-independent easing prevents position and pose pops under load.
    const movementBlend = 1 - Math.exp(-12 * delta);
    const poseBlend = 1 - Math.exp(-10 * delta);
    if (isPacified) flyOutProgressRef.current = Math.min(1, flyOutProgressRef.current + delta * 0.16);
    else flyOutProgressRef.current = 0;
    const launch = THREE.MathUtils.smootherstep(Math.max(0, (flyOutProgressRef.current - 0.16) / 0.84), 0, 1);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, movementBlend);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, movementBlend);

    // Rotation facing with smooth interpolation
    const targetRotY = -baymaxState.angle + Math.PI / 2;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, movementBlend);

    // The supplied OBJ is a single unrigged mesh, so its walk is a restrained
    // full-body stride: a grounded bob, weight shift, and small forward sway.
    // This only runs while he is travelling, never while attacking or restored.
    const speed = Math.hypot(baymaxState.vel.x, baymaxState.vel.y);
    const isAttacking = baymaxState.state === 'lunge_prep' || baymaxState.state === 'lunging';
    // Baymax glides through the arena; only his Pixel commanders and the
    // nanobot swarm animate motion. Keep his legs at rest between attacks.
    const walkAmount = 0;
    const stride = time * (4.8 + speed * 0.28);
    const walkBob = Math.abs(Math.sin(stride)) * 0.075 * walkAmount;
    const walkSway = Math.sin(stride * 0.5) * 0.045 * walkAmount;
    const walkLean = Math.cos(stride) * 0.028 * walkAmount;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, walkBob + launch * 18, poseBlend);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, walkSway, poseBlend);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, walkLean, poseBlend);
    walkMotionRef.current.stride = stride;
    walkMotionRef.current.amount = walkAmount;

    // 1. Idle Breathing & Combat Lunge Windup / Dash Animation
    if (baymaxState.state === 'lunge_prep') {
      // Windup lowers Baymax before the strike.
      scaleTargetRef.current.set(1, 0.92, 1);
      if (bodyRef.current) bodyRef.current.rotation.x = -0.22;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.4;
    } else if (baymaxState.state === 'lunging') {
      // The attack stays low and wide; roaming Baymax is visibly taller.
      scaleTargetRef.current.set(1, 0.82, 1);
      if (bodyRef.current) bodyRef.current.rotation.x = 0.38;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5;
    } else {
      // Gentle rhythmic vinyl breathing
      const breath = Math.sin(time * 2.2) * 0.025;
      // Keep the supplied Baymax model upright and naturally proportioned
      // while roaming. Only the attack pose compresses vertically.
      scaleTargetRef.current.set(1, 1 + breath, 1);
      if (bodyRef.current) {
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 8);
      }
    }
    groupRef.current.scale.lerp(scaleTargetRef.current, poseBlend);

    // 2. Arms Dynamics: Pinning struggle or iconic friendly wave
    if (leftArmRef.current && rightArmRef.current) {
      if (isPacified) {
        // Friendly Baymax Wave
        rightArmRef.current.rotation.z = -1.35;
        rightArmRef.current.rotation.x = Math.sin(time * 4) * 0.35;
        leftArmRef.current.rotation.z = 0.25;
        leftArmRef.current.rotation.x = 0;
      } else if (baymaxState.grippedCount > 0) {
        // Struggling against Holder microbot grip
        const jitter = Math.sin(time * 30) * 0.12;
        leftArmRef.current.rotation.z = 0.7 + jitter;
        rightArmRef.current.rotation.z = -0.5 - jitter;
      } else if (baymaxState.state !== 'lunge_prep' && baymaxState.state !== 'lunging') {
        const armSway = Math.sin(time * 2.5) * 0.07;
        leftArmRef.current.rotation.x = armSway;
        rightArmRef.current.rotation.x = -armSway;
        leftArmRef.current.rotation.z = 0.15;
        rightArmRef.current.rotation.z = -0.15;
      }
    }

    // 3. Head Tracking & Incline
    if (headRef.current) {
      if (isPacified) {
        headRef.current.rotation.z = 0.12; // Inquisitive tilt
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.15;
      } else if (baymaxState.targetPixelId !== null) {
        const targetHeadAngle = Math.sin(time * 1.5) * 0.15;
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadAngle, delta * 4);
      }
    }

    // 4. Red Combat Chip Pulse / Ejection
    if (chipRef.current) {
      if (isPacified) {
        chipRef.current.position.y = 2.4 + Math.sin(time * 2) * 0.15;
        chipRef.current.rotation.y += delta * 1.8;
      } else {
        const pulse = (Math.sin(time * (5 + extractionProgress * 15)) + 1) * 0.5;
        if (chipLightRef.current) {
          chipLightRef.current.intensity = 1.5 + pulse * 2.5;
        }
      }
    }
  });

  // Eyes styling
  const eyeColor = isPacified ? '#38D9F9' : '#E10600';
  const eyeEmissive = isPacified ? '#38D9F9' : '#FF1020';

  // Dynamic Tag States
  const isLunge = baymaxState.state === 'lunge_prep' || baymaxState.state === 'lunging';
  const isGripped = baymaxState.grippedCount > 0;
  const isConfused = baymaxState.wastedRetargets > 0 && !isLunge;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Suspense fallback={null}>
        <BaymaxObjAsset pacified={isPacified} onReady={handleCadReady} walkMotionRef={walkMotionRef} />
      </Suspense>
      {isPacified && (
        <group position={[0, 0.2, 0]}>
          {[-0.46, 0.46].map((x) => (
            <group key={x} position={[x, 0, -0.08]} rotation={[Math.PI, 0, 0]}>
              <mesh>
                <coneGeometry args={[0.18, 1.05, 18]} />
                <meshBasicMaterial color="#63dfff" transparent opacity={0.8} toneMapped={false} />
              </mesh>
              <pointLight position={[0, 0.34, 0]} color="#63dfff" intensity={2.1} distance={4} />
            </group>
          ))}
        </group>
      )}
      {/* HTML Tactical Status Pill: Never mirrors, crisply rendered */}
      <Html
        position={[0, 6.35, 0]}
        center
        distanceFactor={18}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex flex-col items-center gap-1 select-none pointer-events-none whitespace-nowrap">
          {isPacified ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#141414]/95 border border-[#3DFFA2] backdrop-blur-md shadow-lg shadow-[#3DFFA2]/20 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#3DFFA2] animate-pulse" />
              <span className="text-[11px] font-black text-[#3DFFA2] tracking-wider">
                HEALTHCARE COMPANION RESTORED
              </span>
            </div>
          ) : isLunge ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#141414]/95 border border-[#E10600] backdrop-blur-md shadow-lg shadow-[#E10600]/30 animate-bounce font-mono">
              <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
              <span className="text-[11px] font-black text-[#E10600] tracking-wider">
                ⚡ KINETIC DASH ENGAGED
              </span>
            </div>
          ) : extractionProgress > 0 ? (
            <div className="baymax-status baymax-status-progress">
              Chip removal {Math.round(extractionProgress * 100)}%
            </div>
          ) : isGripped ? (
            <div className="baymax-status baymax-status-progress">Arm held</div>
          ) : isConfused ? (
            <div className="baymax-status">Baymax is searching</div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0A0A0A]/90 border border-[#1F1F1F] backdrop-blur-sm font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
              <span className="text-[10px] font-medium text-[#C9C9C9]">
                {baymaxState.targetPixelId !== null
                  ? `TARGET: UNIT #${baymaxState.targetPixelId}`
                  : 'SCANNING SECTOR'}
              </span>
            </div>
          )}
        </div>
      </Html>

      {/* Main Baymax Mesh Body */}
      <group ref={bodyRef} position={[0, 0, 0]} visible={!cadReady}>
        <mesh position={[0, 1.45, 0]} castShadow material={bodyMaterial}>
          <sphereGeometry args={[1.35, 32, 32]} />
        </mesh>
        <mesh position={[0, 2.15, 0]} castShadow material={bodyMaterial}>
          <sphereGeometry args={[1.18, 32, 32]} />
        </mesh>

        {/* 2. Left Arm Combat Armor Plating (Big Hero 6 Red) */}
        {!isPacified && (
          <group position={[-1.25, 2.3, 0]} rotation={[0, 0, 0.25]}>
            <mesh castShadow material={armorMaterial} rotation={[0.18, 0.15, 0]}>
              <boxGeometry args={[0.78, 0.78, 0.24, 3, 3, 1]} />
            </mesh>
            <mesh position={[0, -0.42, 0]} rotation={[0, 0, 0.1]} castShadow material={armorMaterial}>
              <boxGeometry args={[0.5, 0.68, 0.22, 2, 3, 1]} />
            </mesh>
          </group>
        )}

        {/* 3. Left Chest Receptacle & Red Combat Chip Slot */}
        <group position={[-0.42, 2.38, 1.05]}>
          {/* Access Port Rim */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.26, 0.04, 16, 28]} />
            <meshStandardMaterial color="#1E232E" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Red Combat Chip */}
          <mesh ref={chipRef} position={[0, 0, 0.04]}>
            <boxGeometry args={[0.18, 0.25, 0.06]} />
            <meshStandardMaterial
              color={isPacified ? '#38D9F9' : '#E10600'}
              emissive={isPacified ? '#38D9F9' : '#FF1020'}
              emissiveIntensity={isPacified ? 1.5 : 3.0}
              roughness={0.2}
            />
          </mesh>

          <pointLight
            ref={chipLightRef}
            position={[0, 0, 0.25]}
            intensity={isPacified ? 1.0 : 2.5}
            distance={4}
            color={isPacified ? '#38D9F9' : '#FF1020'}
          />

          {/* Tripartite Extraction Progress Arc Ring */}
          {!isPacified && extractionProgress > 0 && (
            <mesh position={[0, 0, 0.06]} rotation={[0, 0, -extractionProgress * Math.PI]}>
              <ringGeometry args={[0.32, 0.38, 32, 1, 0, extractionProgress * Math.PI * 2]} />
              <meshBasicMaterial color="#3DFFA2" side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>

        {/* 4. Iconic Head with Dot Eyes & Connecting Line */}
        <group ref={headRef} position={[0, 3.15, 0]}>
          <mesh castShadow scale={[1.0, 0.88, 0.95]} material={bodyMaterial}>
            <sphereGeometry args={[0.72, 32, 28]} />
          </mesh>

          {/* Connecting Black Eye Line */}
          <mesh position={[0, 0.02, 0.68]}>
            <boxGeometry args={[0.48, 0.028, 0.03]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeEmissive}
              emissiveIntensity={isPacified ? 1.8 : 2.5}
            />
          </mesh>

          {/* Left Eye */}
          <mesh position={[-0.24, 0.02, 0.68]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeEmissive}
              emissiveIntensity={isPacified ? 2.0 : 3.0}
            />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.24, 0.02, 0.68]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeEmissive}
              emissiveIntensity={isPacified ? 2.0 : 3.0}
            />
          </mesh>
        </group>

        {/* 5. Left Arm */}
        <group ref={leftArmRef} position={[-1.25, 2.1, 0]}>
          <mesh position={[0, -0.65, 0]} rotation={[0, 0, 0.18]} castShadow material={bodyMaterial}>
            <capsuleGeometry args={[0.34, 0.95, 16, 16]} />
          </mesh>
        </group>

        {/* 6. Right Arm */}
        <group ref={rightArmRef} position={[1.25, 2.1, 0]}>
          <mesh position={[0, -0.65, 0]} rotation={[0, 0, -0.18]} castShadow material={bodyMaterial}>
            <capsuleGeometry args={[0.34, 0.95, 16, 16]} />
          </mesh>
        </group>

        {/* 7. Rounded Stubby Legs & Pill Feet */}
        <mesh position={[-0.52, 0.72, 0]} castShadow material={bodyMaterial}>
          <capsuleGeometry args={[0.38, 0.85, 16, 16]} />
        </mesh>
        <mesh position={[0.52, 0.72, 0]} castShadow material={bodyMaterial}>
          <capsuleGeometry args={[0.38, 0.85, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
};
