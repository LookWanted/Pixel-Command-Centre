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
const BOT_COUNT = 420;

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
  time: number,
  isCoveringBaymax: boolean
) {
  // One Pixel commander now directs the full ground swarm. Modulo preserves
  // sane ownership if a future scenario adds more commanders.
  const commander = commanders[index % commanders.length];
  if (!commander?.alive && !isCoveringBaymax) {
    dummy.position.set(0, -100, 0);
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    return;
  }

  const bx = baymax.pos.x * 0.1;
  const bz = baymax.pos.y * 0.1;
  if (isCoveringBaymax) {
    // Pin him with a low, dark ring instead of burying the white model under a
    // high pile that reads as snow rather than a defeated Baymax.
    const layer = Math.floor(index / 70);
    const ringIndex = index % 70;
    const angle = (ringIndex / 70) * Math.PI * 2 + layer * 0.42;
    const radius = 1.05 + (ringIndex % 7) * 0.12 + layer * 0.24;
    dummy.position.set(
      bx + Math.cos(angle) * radius,
      0.045 + Math.min(layer, 2) * 0.16,
      bz + Math.sin(angle) * radius
    );
    dummy.rotation.set(0.1 * Math.sin(time * 2 + index), -angle, 0.08 * Math.cos(time * 1.7 + index));
    dummy.scale.setScalar(0.0075);
    dummy.updateMatrix();
    return;
  }
  // Short, deliberate structures leave most of the encounter active.
  const cycle = Math.floor(time / 12);
  const cycleTime = time % 12;
  const structure = Math.floor(Math.abs(Math.sin((cycle + 1) * 91.73)) * 5) % 5;
  const formationStrength = cycleTime < 2
    ? THREE.MathUtils.smootherstep(cycleTime / 2, 0, 1)
    : cycleTime < 6
      ? 1
      : cycleTime < 8
        ? 1 - THREE.MathUtils.smootherstep((cycleTime - 6) / 2, 0, 1)
        : 0;

  // Nanobots stay on the arena floor. They scatter and surge around Baymax,
  // then physically stack into a structure instead of flying like commanders.
  const seed = index * 1.618;
  const attackAngle = time * (1.1 + (index % 7) * 0.13) + seed;
  const attackRadius = 3.1 + ((Math.sin(time * 2.55 + seed) + 1) * 2.3) + (index % 13) * 0.44;
  const attackX = bx + Math.cos(attackAngle) * attackRadius + Math.sin(time * 4.4 + seed) * 0.3;
  const attackZ = bz + Math.sin(attackAngle * 1.27) * attackRadius + Math.cos(time * 3.8 + seed) * 0.3;
  const attackY = 0.035;

  // Structures are deliberately built away from Baymax, making the swarm's
  // regrouping obvious and giving the health system a visible respite.
  const regroupAngle = cycle * 2.399 + Math.PI * 0.35;
  const regroupDistance = 10.8;
  const regroupX = bx + Math.cos(regroupAngle) * regroupDistance;
  const regroupZ = bz + Math.sin(regroupAngle) * regroupDistance;
  let fx = regroupX;
  let fy = 0.035;
  let fz = regroupZ;
  if (structure === 0) {
    // Cube: a large 7 × 6 × 7 ground lattice.
    const gx = (index % 7) - 3;
    const gy = Math.floor(index / 7) % 6;
    const gz = Math.floor(index / 42) - 4.5;
    fx += gx * 0.38; fy += gy * 0.34; fz += gz * 0.38;
  } else if (structure === 1) {
    // Sphere: an unmistakable, ground-resting Fibonacci shell.
    const ratio = (index + 0.5) / BOT_COUNT;
    const polar = Math.acos(1 - ratio * 2);
    const azimuth = Math.PI * (3 - Math.sqrt(5)) * index;
    const radius = 2.45;
    fx += Math.cos(azimuth) * Math.sin(polar) * radius;
    fy += radius + Math.cos(polar) * radius;
    fz += Math.sin(azimuth) * Math.sin(polar) * radius;
  } else if (structure === 2) {
    // Hexagon: layered, six-sided rings.
    const ring = Math.floor(index / 24);
    const point = index % 24;
    const side = Math.floor(point / 4);
    const sideT = (point % 4) / 4;
    const a = side * Math.PI / 3;
    const b = (side + 1) * Math.PI / 3;
    const radius = 2.35;
    fx += (Math.cos(a) * (1 - sideT) + Math.cos(b) * sideT) * radius;
    fz += (Math.sin(a) * (1 - sideT) + Math.sin(b) * sideT) * radius;
    fy += ring * 0.28;
  } else if (structure === 3) {
    // Spiral tower: an unmistakable vertical build.
    const level = Math.floor(index / 28);
    const angle = index * 2.399;
    const radius = 2.25 - level * 0.11;
    fx += Math.cos(angle) * radius;
    fz += Math.sin(angle) * radius;
    fy += level * 0.29;
  } else {
    // Arch: two physical supports and a connected overhead curve.
    const t = (index % 70) / 69;
    const side = Math.floor(index / 70) % 2 === 0 ? -1 : 1;
    fx += side * (1.2 + t * 1.25);
    fz += (index % 6) * 0.2 - 0.5;
    fy += Math.sin(t * Math.PI) * 3.0;
  }

  dummy.position.set(
    THREE.MathUtils.lerp(attackX, fx, formationStrength),
    THREE.MathUtils.lerp(attackY, fy, formationStrength),
    THREE.MathUtils.lerp(attackZ, fz, formationStrength)
  );
  dummy.rotation.set(0, attackAngle + Math.PI / 2, Math.sin(time * 3 + seed) * 0.16 * (1 - formationStrength));
  dummy.scale.setScalar(0.0075);
  dummy.updateMatrix();
}

const NanobotCadPart: React.FC<{ mesh: CadMesh; commanders: PixelState[]; baymax: BaymaxState; isCoveringBaymax: boolean }> = ({ mesh, commanders, baymax, isCoveringBaymax }) => {
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
      formationMatrix(dummy.current, i, commanders, baymax, time, isCoveringBaymax);
      ref.current.setMatrixAt(i, dummy.current.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometryRef.current, materialRef.current, BOT_COUNT]} frustumCulled={false} />;
};

/** A dense ground field of supplied Big Hero nanobots, directed by the airborne Pixel commander. */
export const NanobotSwarm: React.FC<{ commanders: PixelState[]; baymax: BaymaxState; isCoveringBaymax: boolean }> = ({ commanders, baymax, isCoveringBaymax }) => {
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

  return <group>{meshes.map((mesh, index) => <NanobotCadPart key={index} mesh={mesh} commanders={commanders} baymax={baymax} isCoveringBaymax={isCoveringBaymax} />)}</group>;
};
