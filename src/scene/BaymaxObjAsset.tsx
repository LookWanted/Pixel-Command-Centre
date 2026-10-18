import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';

export interface BaymaxWalkMotion {
  stride: number;
  amount: number;
}

/** Renders the user-provided Baymax OBJ model from Desktop/baymax. */
export const BaymaxObjAsset: React.FC<{
  pacified: boolean;
  onReady: () => void;
  walkMotionRef: React.MutableRefObject<BaymaxWalkMotion>;
}> = ({ pacified, onReady, walkMotionRef }) => {
  const source = useLoader(OBJLoader, '/assets/models/baymax/Bigmax_White_OBJ.obj');
  const leftLegRef = useRef<THREE.Mesh | null>(null);
  const rightLegRef = useRef<THREE.Mesh | null>(null);
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

      // OBJ meshes arrive with vertex coordinates in model space and no useful
      // transform pivot. Re-centre each leg on its hip so it can truly swing.
      if (node.name === 'LeftLeg' || node.name === 'RightLeg') {
        smoothedGeometry.computeBoundingBox();
        const bounds = smoothedGeometry.boundingBox;
        if (bounds) {
          const hip = new THREE.Vector3(
            (bounds.min.x + bounds.max.x) * 0.5,
            bounds.max.y,
            (bounds.min.z + bounds.max.z) * 0.5
          );
          smoothedGeometry.translate(-hip.x, -hip.y, -hip.z);
          node.position.copy(hip);
        }
        if (node.name === 'LeftLeg') leftLegRef.current = node;
        else rightLegRef.current = node;
      }

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

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-12 * delta);
    const { stride, amount } = walkMotionRef.current;
    const swing = Math.sin(stride) * 0.42 * amount;
    const counterSwing = Math.sin(stride + Math.PI) * 0.42 * amount;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, swing, blend);
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, counterSwing, blend);
    }
  });

  return (
    <group position={[0, 0.04, 0]} scale={[0.052, 0.06, 0.052]} rotation={[0, Math.PI, 0]}>
      {/* Preserve the uploaded form's silhouette: a taller, upright Baymax with
          no squash applied across the body width. */}
      <group position={[-1.2, 0.73, 2.3]}>{/* centers the source OBJ at the simulation origin */}
        <primitive object={model} />
      </group>
    </group>
  );
};
