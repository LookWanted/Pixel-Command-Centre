import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import { X, Box, RotateCw, Shield, Sparkles } from 'lucide-react';

function ModelMesh({ wireframe }: { wireframe: boolean }) {
  // Load the user-provided 3D textured model
  const { scene } = useGLTF('/assets/models/pixel-textured.glb');
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5;
    }
  });

  // Apply wireframe or enhance materials
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: any) => { if ('wireframe' in m) m.wireframe = wireframe; });
        } else {
          const mat = mesh.material as any;
          if ('wireframe' in mat) mat.wireframe = wireframe;
        }
      }
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={2.5} />
    </group>
  );
}

function FallbackMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.8;
  });
  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[0.8, 1.4, 16, 32]} />
      <meshStandardMaterial color="#38bdf8" emissive="#00e5ff" emissiveIntensity={1.2} />
    </mesh>
  );
}

interface PixelModelViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixelModelViewer: React.FC<PixelModelViewerProps> = ({ isOpen, onClose }) => {
  const [wireframe, setWireframe] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <div className="hud-panel rounded-sm w-full max-w-2xl border border-[#00ff88]/60 overflow-hidden flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/80 bg-[#070d14]">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#00ff88]" />
            <span className="font-bold tracking-wider text-[#00ff88] uppercase text-xs">
              UNIT SCHEMATIC // PIXEL SWARM BOT (TEXTURED GLB)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-2 py-0.5 rounded text-[10px] border transition ${
                wireframe ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88]' : 'bg-slate-800 border-slate-600 text-slate-300'
              }`}
            >
              WIREFRAME
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Model Viewport */}
        <div className="w-full h-80 bg-gradient-to-b from-[#0a121e] to-[#04070b] relative">
          <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 15, 10]} intensity={2.0} />
            <pointLight position={[-10, -5, -10]} intensity={1.0} color="#00ff88" />
            <Suspense fallback={<FallbackMesh />}>
              <Center>
                <ModelMesh wireframe={wireframe} />
              </Center>
            </Suspense>
            <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
          </Canvas>

          {/* Interactive hint */}
          <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 pointer-events-none">
            [DRAG TO ROTATE 3D MODEL • SCROLL TO ZOOM]
          </div>
        </div>

        {/* Technical Specification readout */}
        <div className="p-4 bg-[#080d14] border-t border-slate-800 grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">CHASSIS CLASS</div>
            <div className="text-slate-200 font-bold mt-0.5">Micro-Decoy Drone</div>
            <div className="text-[9px] text-[#00ff88] mt-0.5">High Agility / Low Mass</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">TACTICAL DOCTRINE</div>
            <div className="text-slate-200 font-bold mt-0.5">Swarm Cooperation</div>
            <div className="text-[9px] text-[#38bdf8] mt-0.5">Shared Neural Dodge Sync</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">EXTRACTION SUITE</div>
            <div className="text-slate-200 font-bold mt-0.5">Tripartite Clamp</div>
            <div className="text-[9px] text-amber-400 mt-0.5">Holder + Puller + Grabber</div>
          </div>
        </div>
      </div>
    </div>
  );
};
