import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

type CadMesh = {
  attributes: { position: { array: number[] }, normal?: { array: number[] } };
  index: { array: number[] };
  color?: [number, number, number];
};

type CadResult = { success: boolean; meshes: CadMesh[] };

declare global {
  interface Window { occtimportjs?: () => Promise<{ ReadStepFile: (data: Uint8Array, params: unknown) => CadResult }> }
}

let importerPromise: Promise<void> | null = null;

function loadCadImporter() {
  if (window.occtimportjs) return Promise.resolve();
  if (importerPromise) return importerPromise;
  importerPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/assets/cad/occt-import-js.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Baymax CAD importer could not load'));
    document.head.appendChild(script);
  });
  return importerPromise;
}

/** Renders the user's desktop `baymax2.stp` CAD model directly in the browser. */
export const BaymaxCadAsset: React.FC<{ pacified: boolean; onReady: () => void }> = ({ pacified, onReady }) => {
  const [meshes, setMeshes] = useState<CadMesh[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadCadImporter(),
      fetch('/assets/models/baymax2.stp').then((response) => response.arrayBuffer())
    ]).then(async ([, buffer]) => {
      const importer = await window.occtimportjs?.();
      const result = importer?.ReadStepFile(new Uint8Array(buffer), {
        linearUnit: 'millimeter', linearDeflectionType: 'bounding_box_ratio', linearDeflection: 0.002
      });
      if (active && result?.success) {
        setMeshes(result.meshes);
        onReady();
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, [onReady]);

  const normalized = useMemo(() => {
    if (!meshes.length) return { scale: 1, position: [0, 0, 0] as [number, number, number] };
    const box = new THREE.Box3();
    meshes.forEach((mesh) => {
      const points = mesh.attributes.position.array;
      for (let i = 0; i < points.length; i += 3) box.expandByPoint(new THREE.Vector3(points[i], points[i + 1], points[i + 2]));
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { scale: 3.5 / Math.max(size.x, size.y, size.z), position: [-center.x, -box.min.y, -center.z] as [number, number, number] };
  }, [meshes]);

  if (!meshes.length) return null;
  const tint = pacified ? new THREE.Color('#f6fbff') : new THREE.Color('#ffe9e9');
  // STEP coordinates are millimetric. Translate *inside* the scaled transform so the
  // imported part is normalized around the simulation origin instead of being offset.
  return (
    <group position={[0, 1.62, 0]} scale={normalized.scale} rotation={[-Math.PI / 2, 0, Math.PI]}>
      <group position={normalized.position}>
      {meshes.map((mesh, index) => {
        const color = mesh.color ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2]).multiply(tint) : tint;
        return (
          <mesh key={index} castShadow receiveShadow>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(mesh.attributes.position.array), 3]} />
              {mesh.attributes.normal && <bufferAttribute attach="attributes-normal" args={[new Float32Array(mesh.attributes.normal.array), 3]} />}
              <bufferAttribute attach="index" args={[new Uint32Array(mesh.index.array), 1]} />
            </bufferGeometry>
            <meshStandardMaterial color={color} roughness={0.32} metalness={0.12} emissive={pacified ? '#102018' : '#240000'} emissiveIntensity={0.1} />
          </mesh>
        );
      })}
      </group>
    </group>
  );
};
