import React from 'react';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface EffectsProps {
  quality: 'high' | 'low';
}

export const Effects: React.FC<EffectsProps> = ({ quality }) => {
  // If low quality selected, disable heavy post-processing to ensure 60 FPS
  if (quality === 'low') {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      {/* Bloom strictly on emissive lasers, eyes, chips, and links */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.2}
        blendFunction={BlendFunction.SCREEN}
      />

      {/* Light Chromatic Aberration for tactical lens distortion */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.0012, 0.0012)}
        radialModulation={true}
        modulationOffset={0.5}
      />

      {/* Subtle sensor grain noise */}
      <Noise
        opacity={0.035}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* Vignette for dark void atmosphere */}
      <Vignette
        eskil={false}
        offset={0.25}
        darkness={0.7}
      />
    </EffectComposer>
  );
};
