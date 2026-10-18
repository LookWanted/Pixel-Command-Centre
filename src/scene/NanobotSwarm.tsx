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

  const local = index % BOTS_PER_COMMANDER;
  const group = Math.floor(index / BOTS_PER_COMMANDER);
  const bx = baymax.pos.x * 0.1;
  const bz = baymax.pos.y * 0.1;
  const phase = Math.floor(time / 9) % 3;
  const angle = (local / BOTS_PER_COMMANDER) * Math.PI * 2 + group * 0.61 + time * 0.35;
  let radius = 1.85 + (group % 3) * 0.44;
  let y = 0.18 + (local % 3) * 0.14;

  if (phase === 1) {
    // Vertical helix pillars: the swarm is building around Baymax.
    radius = 2.25 + (local % 2) * 0.35;
    y = 0.16 + local * 0.2;
  } else if (phase === 2) {
    // Low shell: a closing ring that leaves Baymax's face readable.
    radius = 1.6 + (local % 5) * 0.34;
    y = 0.2 + Math.abs(Math.sin(angle * 1.5)) * 1.18;
  }

  dummy.position.set(bx + Math.cos(angle) * radius, y + Math.sin(time * 2.4 + index) * 0.04, bz + Math.sin(angle) * radius);
  dummy.rotation.set(0, -angle + Math.PI / 2, phase === 1 ? Math.sin(angle * 2) * 0.12 : 0);
  dummy.scale.setScalar(0.012);
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
