import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { sound } from '../utils/audio';

function WaypointBeacon() {
  const waypoint = useStore((s) => s.waypoint);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 2;
    }
  });

  if (!waypoint) return null;

  return (
    <group position={[waypoint.x * 0.1, 0.08, waypoint.y * 0.1]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.34, 32]} />
        <meshBasicMaterial color="#3DFFA2" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.8, 0]} intensity={0.7} distance={3} color="#3DFFA2" />
    </group>
  );
}

interface ArenaProps {
  timeElapsed: number;
  maxTime?: number;
  arenaRadius?: number;
}

export const Arena: React.FC<ArenaProps> = ({
  timeElapsed,
  maxTime = 90,
  arenaRadius = 32
}) => {
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.Points>(null);
  const groundShaderRef = useRef<THREE.ShaderMaterial>(null);

  // Floating slow-drifting debris chunks (dark charcoal polygons)
  const debrisCount = 28;
  const debrisData = useMemo(() => {
    const data = [];
    for (let i = 0; i < debrisCount; i++) {
      const angle = (i / debrisCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = arenaRadius * (0.65 + Math.random() * 0.6);
      const height = 0.5 + Math.random() * 14;
      const rotSpeed = {
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.12
      };
      const scale = 0.5 + Math.random() * 1.1;
      data.push({
        x: Math.cos(angle) * dist,
        y: height,
        z: Math.sin(angle) * dist,
        rotSpeed,
        scale,
        rx: Math.random() * 3,
        ry: Math.random() * 3,
        rz: Math.random() * 3,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, [arenaRadius]);

  // Floating ambient dust particles in void
  const dustCount = 180;
  const dustPositions = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * arenaRadius * 1.1;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.random() * 18;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, [arenaRadius]);

  // A deliberately quiet telemetry terrain: dense points with a warm danger ridge near the breach.
  // The field replaces a literal grid while leaving the real actors and links visually dominant.
  const terrain = useMemo(() => {
    const count = 60000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const teal = new THREE.Color('#0f3b34');
    const green = new THREE.Color('#2fd3a0');
    const lime = new THREE.Color('#c8e86b');
    const danger = new THREE.Color('#ff8a3d');
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * arenaRadius * 1.1;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const ridge = Math.exp(-Math.pow(Math.abs(z - x * 0.32) - 4.5, 2) / 36) * 0.72;
      const core = Math.exp(-(x * x + z * z) / 210) * 0.36;
      const instability = Math.min(1, ridge + core + Math.random() * 0.16);
      const height = instability * 0.32 + (Math.random() - 0.5) * 0.07;
      positions[i * 3] = x;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = z;
      if (instability > 0.9) color.copy(danger);
      else if (instability > 0.65) color.copy(lime);
      else color.copy(teal).lerp(green, instability * 0.82);
      const fade = 1 - Math.max(0, radius - arenaRadius * 0.73) / (arenaRadius * 0.4);
      colors[i * 3] = color.r * Math.max(0.05, fade);
      colors[i * 3 + 1] = color.g * Math.max(0.05, fade);
      colors[i * 3 + 2] = color.b * Math.max(0.05, fade);
    }
    return { positions, colors };
  }, [arenaRadius]);

  // Ground Grid Disc: deep dark floor with subtle tactical grid and radar ring pulse that fades at edges
  const groundGridShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRadius: { value: arenaRadius },
        uGridColor: { value: new THREE.Color('#3DFFA2') }, // Tactical mint green
        uSecondaryColor: { value: new THREE.Color('#F7E600') }, // Subtle brand yellow accent
        uFloorBase: { value: new THREE.Color('#0A0E17') },
        uVoid: { value: new THREE.Color('#05080A') }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uRadius;
        uniform vec3 uGridColor;
        uniform vec3 uSecondaryColor;
        uniform vec3 uFloorBase;
        uniform vec3 uVoid;
        varying vec3 vWorldPos;

        void main() {
          float dist = length(vWorldPos.xz);
          if (dist > uRadius) {
            discard;
          }

          // Crisp dual-line tactical grid
          vec2 coord = vWorldPos.xz * 0.3;
          vec2 grid = abs(fract(coord - 0.5) - 0.5);
          float line = min(grid.x, grid.y);
          float gridVal = smoothstep(0.045, 0.0, line);

          // Major grid markers every 4 units
          vec2 majorCoord = vWorldPos.xz * 0.075;
          vec2 majorGrid = abs(fract(majorCoord - 0.5) - 0.5);
          float majorLine = min(majorGrid.x, majorGrid.y);
          float majorVal = smoothstep(0.02, 0.0, majorLine);

          // Subtle outward radar sweep
          float sweep = fract(dist * 0.07 - uTime * 0.08);
          float pulse = exp(-sweep * 9.0) * 0.35;

          // Inner focus zone around Baymax combat ring
          float innerRing = smoothstep(0.12, 0.0, abs(dist - 14.0));

          // Soft edge fade at boundary
          float edgeFade = 1.0 - smoothstep(uRadius * 0.65, uRadius * 0.98, dist);

          vec3 baseCol = mix(uVoid, uFloorBase, 0.7);
          vec3 lineCol = mix(uGridColor, uSecondaryColor, majorVal * 0.6);
          vec3 finalCol = baseCol + lineCol * (gridVal * 0.16 + majorVal * 0.22 + pulse + innerRing * 0.4);

          gl_FragColor = vec4(finalCol, edgeFade * 0.95);
        }
      `,
      transparent: true,
      depthWrite: false
    });
  }, [arenaRadius]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (groundShaderRef.current) {
      groundShaderRef.current.uniforms.uTime.value = time;
    }

    // Gentle debris drift
    if (debrisRef.current) {
      debrisData.forEach((d, i) => {
        d.rx += d.rotSpeed.x * delta;
        d.ry += d.rotSpeed.y * delta;
        d.rz += d.rotSpeed.z * delta;
        const bob = Math.sin(time * 0.4 + d.phase) * 0.4;

        dummy.position.set(d.x, d.y + bob, d.z);
        dummy.rotation.set(d.rx, d.ry, d.rz);
        dummy.scale.set(d.scale, d.scale, d.scale);
        dummy.updateMatrix();
        debrisRef.current!.setMatrixAt(i, dummy.matrix);
      });
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Gentle dust oscillation
    if (dustRef.current) {
      dustRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group>
      {/* Cinematic Studio Lighting: Warm key, cool rim, deep void ambient */}
      <ambientLight intensity={0.35} color="#0A0F18" />
      <directionalLight
        position={[18, 32, 18]}
        intensity={2.2}
        color="#FFF5EA"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight
        position={[-18, 22, -18]}
        intensity={1.8}
        color="#7EC8F8"
      />
      <pointLight position={[0, 0.5, 0]} intensity={0.7} distance={20} color="#c7dce8" />

      {/* Invisible interaction plane preserves the click-to-route waypoint control. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          const pt = e.point;
          const store = useStore.getState();
          if (store.manualPilotActive) store.setManualKillPoint({ x: pt.x * 10, y: pt.z * 10 });
          else store.setWaypoint({ x: pt.x * 10, y: pt.z * 10 });
        }}
      >
        <planeGeometry args={[arenaRadius * 2.1, arenaRadius * 2.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* One quiet arena floor: readable, interactive, and free from decorative particles. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        material={groundGridShader}
        visible
        onPointerDown={(e) => {
          e.stopPropagation();
          const pt = e.point;
          const store = useStore.getState();
          if (store.manualPilotActive) store.setManualKillPoint({ x: pt.x * 10, y: pt.z * 10 });
          else store.setWaypoint({ x: pt.x * 10, y: pt.z * 10 });
        }}
      >
        <planeGeometry args={[arenaRadius * 2.1, arenaRadius * 2.1, 48, 48]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]} receiveShadow>
        <circleGeometry args={[arenaRadius, 96]} />
        <meshPhysicalMaterial color="#171c1e" roughness={0.33} metalness={0.36} clearcoat={0.16} transparent opacity={0.32} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[arenaRadius * .82, arenaRadius, 96]} />
        <meshBasicMaterial color="#0b0e0f" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Holographic Tactical Waypoint Beacon */}
      <WaypointBeacon />

      {/* Charcoal Floating Debris Chunks */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, debrisCount]} visible={false}>
        <dodecahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          color="#161B24"
          roughness={0.7}
          metalness={0.5}
        />
      </instancedMesh>

      {/* Floating Dust Particles */}
      <points ref={dustRef} visible>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#C9D6E8"
          transparent
          opacity={0.2}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
