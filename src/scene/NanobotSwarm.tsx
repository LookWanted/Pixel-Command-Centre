import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BaymaxState, PixelState } from '../sim/types';

type CadMesh = {
  attributes: { position: { array: number[] }, normal?: { array: number[] } };
  index: { array: number[] };
};
type CadResult = { success: boolean; meshes: CadMesh[] };

let importerPromise: Promise<void> | null = null;
const BOT_COUNT = 100;
const BOTS_PER_COMMANDER = 10;

function loadCadImporter() {
  const cadWindow = window as unknown as { occtimportjs?: () => Promise<{ ReadStepFile: (data: Uint8Array, params: unknown) => CadResult }> };
  if (cadWindow.occtimportjs) return Promise.resolve();
  if (importerPromise) return importerPromise;
  importerPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/assets/cad/occt-import-js.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Nanobot STEP importer could not load'));
    document.head.appendChild(script);
  });
  return importerPromise;
}

function formationMatrix(
  dummy: THREE.Object3D,
  index: number,
  commanders: PixelState[],
  baymax: BaymaxState,
  time: number
) {
  const commander = commanders[Math.floor(index / BOTS_PER_COMMANDER)];
  if (!commander?.alive) {
    dummy.position.set(0, -100, 0);
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    return;
  }

  const bx = baymax.pos.x * 0.1;
  const bz = baymax.pos.y * 0.1;
  // A longer rhythm gives each structure time to read as a physical object:
  // short ground scramble, deliberate build, then a sustained hold.
  const cycle = Math.floor(time / 18);
  const cycleTime = time % 18;
  const structure = Math.floor(Math.abs(Math.sin((cycle + 1) * 91.73)) * 3) % 3;
  const formationStrength = cycleTime < 3
    ? THREE.MathUtils.smootherstep(cycleTime / 3, 0, 1)
    : cycleTime < 14
      ? 1
      : cycleTime < 16
        ? 1 - THREE.MathUtils.smootherstep((cycleTime - 14) / 2, 0, 1)
        : 0;

  // Nanobots stay on the arena floor. They scatter and surge around Baymax,
  // then physically stack into a structure instead of flying like commanders.
  const seed = index * 1.618;
  const attackAngle = time * (1.1 + (index % 7) * 0.13) + seed;
  const attackRadius = 3.6 + ((Math.sin(time * 1.9 + seed) + 1) * 1.7) + (index % 8) * 0.35;
  const attackX = bx + Math.cos(attackAngle) * attackRadius + Math.sin(time * 4.4 + seed) * 0.3;
  const attackZ = bz + Math.sin(attackAngle * 1.27) * attackRadius + Math.cos(time * 3.8 + seed) * 0.3;
  const attackY = 0.035;

  let fx = bx;
  let fy = 0.035;
  let fz = bz;
  if (structure === 0) {
    // Cube: a clearly stacked 5 × 4 × 5 ground lattice.
    const gx = (index % 5) - 2;
    const gy = Math.floor(index / 5) % 4;
    const gz = Math.floor(index / 20) - 2;
    fx += gx * 0.52; fy += gy * 0.5; fz += gz * 0.52;
  } else if (structure === 1) {
    // Sphere: an unmistakable, ground-resting Fibonacci shell.
    const ratio = (index + 0.5) / BOT_COUNT;
    const polar = Math.acos(1 - ratio * 2);
    const azimuth = Math.PI * (3 - Math.sqrt(5)) * index;
    const radius = 2.15;
    fx += Math.cos(azimuth) * Math.sin(polar) * radius;
    fy += radius + Math.cos(polar) * radius;
    fz += Math.sin(azimuth) * Math.sin(polar) * radius;
  } else {
    // Hexagon: five tall, six-sided rings closed around the target.
    const ring = Math.floor(index / 20);
    const point = index % 20;
    const side = Math.floor(point / 4);
    const sideT = (point % 4) / 4;
    const a = side * Math.PI / 3;
    const b = (side + 1) * Math.PI / 3;
    const radius = 2.2;
    fx += (Math.cos(a) * (1 - sideT) + Math.cos(b) * sideT) * radius;
    fz += (Math.sin(a) * (1 - sideT) + Math.sin(b) * sideT) * radius;
    fy += ring * 0.5;
  }

  dummy.position.set(
    THREE.MathUtils.lerp(attackX, fx, formationStrength),
    THREE.MathUtils.lerp(attackY, fy, formationStrength),
    THREE.MathUtils.lerp(attackZ, fz, formationStrength)
  );
  dummy.rotation.set(0, attackAngle + Math.PI / 2, Math.sin(time * 3 + seed) * 0.16 * (1 - formationStrength));
  dummy.scale.setScalar(0.022);
  dummy.updateMatrix();
}

const NanobotCadPart: React.FC<{ mesh: CadMesh; commanders: PixelState[]; baymax: BaymaxState }> = ({ mesh, commanders, baymax }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef(new THREE.MeshStandardMaterial({
    color: '#1a2229', roughness: 0.3, metalness: 0.86, emissive: '#071015', emissiveIntensity: 0.6
  }));

  if (!geometryRef.current) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mesh.attributes.position.array), 3));
    if (mesh.attributes.normal) geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(mesh.attributes.normal.array), 3));
    else geometry.computeVertexNormals();
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.index.array), 1));
    geometry.computeBoundingSphere();
    geometryRef.current = geometry;
  }

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < BOT_COUNT; i++) {
      formationMatrix(dummy.current, i, commanders, baymax, time);
      ref.current.setMatrixAt(i, dummy.current.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometryRef.current, materialRef.current, BOT_COUNT]} frustumCulled={false} />;
};

/** One hundred supplied Big Hero nanobots, grouped 10:1 under flying Pixel commanders. */
export const NanobotSwarm: React.FC<{ commanders: PixelState[]; baymax: BaymaxState }> = ({ commanders, baymax }) => {
  const [meshes, setMeshes] = useState<CadMesh[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadCadImporter(),
      fetch('/assets/models/bigHeroNanoBot.step').then((response) => response.arrayBuffer())
    ]).then(async ([, buffer]) => {
      const cadWindow = window as unknown as { occtimportjs?: () => Promise<{ ReadStepFile: (data: Uint8Array, params: unknown) => CadResult }> };
      const importer = await cadWindow.occtimportjs?.();
      const result = importer?.ReadStepFile(new Uint8Array(buffer), {
        linearUnit: 'millimeter', linearDeflectionType: 'bounding_box_ratio', linearDeflection: 0.003
      });
      if (active && result?.success) setMeshes(result.meshes);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return <group>{meshes.map((mesh, index) => <NanobotCadPart key={index} mesh={mesh} commanders={commanders} baymax={baymax} />)}</group>;
};
