import React, { useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';

/** Renders the user-provided Baymax OBJ model from Desktop/baymax. */
export const BaymaxObjAsset: React.FC<{ pacified: boolean; onReady: () => void }> = ({ pacified, onReady }) => {
  const source = useLoader(OBJLoader, '/assets/models/baymax/Bigmax_White_OBJ.obj');
  const model = useMemo(() => {
    const copy = source.clone(true);
    copy.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const isStamp = /stamp/i.test(node.name);

      // The supplied OBJ stores separate normals per face. Merge those seams
      // and regenerate smooth normals so the vinyl shell reads as one soft,
      // inflated surface instead of a faceted mesh.
      const geometry = node.geometry.clone();
      geometry.deleteAttribute('normal');
      const smoothedGeometry = mergeVertices(geometry, 0.0001);
      smoothedGeometry.computeVertexNormals();
      smoothedGeometry.normalizeNormals();
      node.geometry = smoothedGeometry;

      node.material = new THREE.MeshPhysicalMaterial({
        color: isStamp ? '#d84a4a' : '#f8fbfd',
        roughness: isStamp ? 0.32 : 0.2,
        metalness: 0.01,
        clearcoat: isStamp ? 0.2 : 0.62,
        clearcoatRoughness: 0.15,
        sheen: isStamp ? 0 : 0.28,
        sheenColor: new THREE.Color('#dceafa'),
        flatShading: false,
        dithering: true
      });
      node.castShadow = true;
      node.receiveShadow = true;
    });
    return copy;
  }, [source]);

  useEffect(() => { onReady(); }, [onReady]);

  return (
    <group position={[0, 0.04, 0]} scale={[0.06, 0.046, 0.06]} rotation={[0, Math.PI, 0]}>
      <group position={[-1.2, 0.73, 2.3]}>{/* centers the source OBJ at the simulation origin */}
        <primitive object={model} />
      </group>
    </group>
  );
};
