import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PixelState } from '../sim/types';

interface PixelSwarmProps {
  pixels: PixelState[];
  hiveKnowledge: number;
}

/** The desktop `pixel textured.glb` asset is used for every live microbot in the arena. */
const PixelBotAsset: React.FC<{ pixel: PixelState }> = ({ pixel }) => {
  const { scene } = useGLTF('/assets/models/pixel-textured.glb');
  const groupRef = useRef<THREE.Group>(null);
  const positionTargetRef = useRef(new THREE.Vector3());
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        // Twenty animated bots casting shadows turns each frame into a costly
        // second scene render. Baymax keeps the cinematic shadow; bot cores
        // provide their readable presence through emissive light instead.
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
    return copy;
  }, [scene]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const x = pixel.pos.x * 0.1;
    const z = pixel.pos.y * 0.1;
    // Pixel units are the airborne commanders. Their nanobot formations act
    // on Baymax below; these larger controllers stay clear in the sky.
    const bob = Math.sin(state.clock.getElapsedTime() * 2.4 + pixel.id) * 0.18;
    const orbitX = Math.cos(state.clock.getElapsedTime() * 0.48 + pixel.id) * 0.35;
    const orbitZ = Math.sin(state.clock.getElapsedTime() * 0.48 + pixel.id) * 0.35;
    positionTargetRef.current.set(x + orbitX, 2.65 + bob, z + orbitZ);
    group.position.lerp(positionTargetRef.current, 1 - Math.exp(-14 * delta));
    const speed = Math.hypot(pixel.vel.x, pixel.vel.y);
    if (speed > 4) group.rotation.y = -Math.atan2(pixel.vel.y, pixel.vel.x) + Math.PI / 2;
    const scale = pixel.dodgeCooldown > 0.4 ? 1.1 : pixel.inContactWithBaymax ? 1.18 : 1.05;
    group.scale.setScalar(scale);
  });

  const core = ROLE_HEX[pixel.role] || '#64e6af';
  return <group ref={groupRef}>
    <primitive object={model} />
    <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={core} emissive={core} emissiveIntensity={2.4} /></mesh>
  </group>;
};

// Target Palette Role Colors
const ROLE_COLORS: Record<string, THREE.Color> = {
  decoy: new THREE.Color('#4FC3F7'),    // Bright tactical cyan
  holder: new THREE.Color('#3DFFA2'),   // High-contrast emerald green
  puller: new THREE.Color('#a783ff'),
  grabber: new THREE.Color('#7bc8ff')
};

const ROLE_HEX: Record<string, string> = {
  decoy: '#4FC3F7',
  holder: '#3DFFA2',
  puller: '#a783ff',
  grabber: '#7bc8ff'
};

// Death Particle system (pool of 60 particles for explosions)
interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export const PixelSwarm: React.FC<PixelSwarmProps> = ({ pixels, hiveKnowledge }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const deathParticlesRef = useRef<THREE.Points>(null);
  const prevAliveRef = useRef<Record<number, boolean>>({});

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const maxInstances = 200;

  // Local death particle pool
  const particles = useRef<Particle[]>([]);
  const particleGeoPositions = useMemo(() => new Float32Array(180 * 3), []);
  const particleGeoColors = useMemo(() => new Float32Array(180 * 3), []);

  // Detect deaths to spawn particle bursts
  useEffect(() => {
    pixels.forEach((p) => {
      const wasAlive = prevAliveRef.current[p.id];
      if (wasAlive === true && !p.alive) {
        // Spawn 16 explosion shards
        const px = p.pos.x * 0.1;
        const pz = p.pos.y * 0.1;
        const col = ROLE_COLORS[p.role] || ROLE_COLORS.decoy;
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3.5 + Math.random() * 5.5;
          particles.current.push({
            x: px,
            y: 0.9 + Math.random() * 0.4,
            z: pz,
            vx: Math.cos(angle) * speed,
            vy: 2.5 + Math.random() * 4.5,
            vz: Math.sin(angle) * speed,
            life: 0.7 + Math.random() * 0.3,
            maxLife: 1.0,
            color: col.clone()
          });
        }
      }
      prevAliveRef.current[p.id] = p.alive;
    });
  }, [pixels]);

  // Specialist pixels for role HTML tags (Holder, Puller, Grabber only)
  const roleHolders = useMemo(() => {
    return pixels.filter((p) => p.alive && p.role !== 'decoy');
  }, [pixels]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Update ONE InstancedMesh for all Pixels (at 60 FPS)
    if (meshRef.current) {
      for (let i = 0; i < maxInstances; i++) {
        const pixel = pixels[i];
        if (!pixel || !pixel.alive) {
          // Hide dead or unallocated instance
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
        }

        const px = pixel.pos.x * 0.1;
        const pz = pixel.pos.y * 0.1;
        const bob = Math.sin(time * 5.0 + pixel.id * 1.3) * 0.14;

        dummy.position.set(px, 0.95 + bob, pz);

        // Rotation: face movement direction
        const speed = Math.hypot(pixel.vel.x, pixel.vel.y);
        if (speed > 5) {
          const moveAngle = -Math.atan2(pixel.vel.y, pixel.vel.x) + Math.PI / 2;
          dummy.rotation.set(0, moveAngle, 0);
        } else {
          dummy.rotation.set(0, time * 1.5 + pixel.id, 0);
        }

        // Dodge Sidestep Blur / Squash & Stretch
        if (pixel.dodgeCooldown > 0.4) {
          // Elongate laterally and tilt during evasive sidestep
          dummy.scale.set(1.4, 0.55, 1.4);
          dummy.rotation.z = Math.sin(time * 25) * 0.35;
        } else if (pixel.inContactWithBaymax) {
          // Vibrating contact clamp
          dummy.scale.set(1.15, 1.15, 1.15);
        } else {
          // Standard scale ~2x for clear tactical visibility (1.1x default)
          dummy.scale.set(1.0, 1.0, 1.0);
        }

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        // Dynamic Role Colors & Pulse
        const baseColor = ROLE_COLORS[pixel.role] || ROLE_COLORS.decoy;
        if (pixel.promotedFlash > 0) {
          // Bright white-gold flash on backup takeover
          meshRef.current.setColorAt(i, new THREE.Color('#FFFFFF'));
        } else {
          meshRef.current.setColorAt(i, baseColor);
        }
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }

    // 2. Update Death Particle Shards
    if (particles.current.length > 0) {
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life -= delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 9.8 * delta; // Gravity

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        }
      }

      // Update particle geometry buffer
      for (let i = 0; i < 180; i++) {
        const p = particles.current[i];
        if (p) {
          particleGeoPositions[i * 3] = p.x;
          particleGeoPositions[i * 3 + 1] = p.y;
          particleGeoPositions[i * 3 + 2] = p.z;

          const alpha = p.life / p.maxLife;
          particleGeoColors[i * 3] = p.color.r * alpha;
          particleGeoColors[i * 3 + 1] = p.color.g * alpha;
          particleGeoColors[i * 3 + 2] = p.color.b * alpha;
        } else {
          particleGeoPositions[i * 3 + 1] = -999;
        }
      }

      if (deathParticlesRef.current) {
        deathParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        deathParticlesRef.current.geometry.attributes.color.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Desktop GLB assets: the simulator renders the textured microbot model, not a generic sphere. */}
      <Suspense fallback={null}>
        {pixels.filter((p) => p.alive).map((pixel) => <PixelBotAsset key={`asset-${pixel.id}`} pixel={pixel} />)}
      </Suspense>

      {/* Kept as a hidden low-cost fallback for the simulation's legacy instance state. */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, maxInstances]}
        castShadow
        receiveShadow
        visible={false}
      >
        {/* Spherical Microbot Drone with Metallic Shell & Emissive Gloss */}
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          roughness={0.2}
          metalness={0.7}
          emissive="#111822"
          emissiveIntensity={0.6}
        />
      </instancedMesh>

      {/* Backup Takeover Promotional Expansion Rings */}
      {pixels.filter((p) => p.alive && p.promotedFlash > 0).map((p) => (
        <mesh
          key={`promo-${p.id}`}
          position={[p.pos.x * 0.1, 0.4, p.pos.y * 0.1]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.8, 1.25, 24]} />
          <meshBasicMaterial
            color="#64e6af"
            transparent
            opacity={p.promotedFlash}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Role Tags: Rendered ONLY above active role-holding Pixels (Holder, Puller, Grabber) */}
      {roleHolders.map((p) => {
        const color = ROLE_HEX[p.role] || '#FFFFFF';
        return (
          <Html
            key={`tag-${p.id}`}
            position={[p.pos.x * 0.1, 1.85, p.pos.y * 0.1]}
            center
            distanceFactor={18}
            zIndexRange={[90, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="pixel-role-tag"
              style={{
                backgroundColor: 'rgba(5, 8, 12, 0.88)',
                borderColor: `${color}88`,
                color: color,
                boxShadow: `0 0 10px ${color}33`
              }}
            >
              {p.role}
            </div>
          </Html>
        );
      })}

      {/* Death Particle Explosions */}
      <points ref={deathParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleGeoPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleGeoColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

useGLTF.preload('/assets/models/pixel-textured.glb');
