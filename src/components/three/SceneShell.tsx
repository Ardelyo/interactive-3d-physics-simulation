import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import type { PropsWithChildren } from "react";
import * as THREE from "three";

export function SceneShell({
  children,
  camera = { position: [3.8, 2.8, 4.8], fov: 42 },
  showGrid = true,
  groundY = 0,
  minDistance = 1.8,
  maxDistance = 18,
  autoRotate = false,
  bg = "#F8FAFC",
}: PropsWithChildren<{
  camera?: { position: [number, number, number]; fov?: number };
  showGrid?: boolean;
  groundY?: number;
  minDistance?: number;
  maxDistance?: number;
  autoRotate?: boolean;
  bg?: string;
}>) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: camera.position, fov: camera.fov ?? 42 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 14, 30]} />

      {/* Gentle studio lighting */}
      <hemisphereLight intensity={0.85} groundColor="#F1F5F9" color="#E0F2FE" />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color="#BAE6FD" />
      <ambientLight intensity={0.35} />

      {/* Clean Stage Base Grid */}
      {showGrid && (
        <Grid
          position={[0, groundY, 0]}
          args={[26, 26]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#E2E8F0"
          sectionSize={2.5}
          sectionThickness={1.2}
          sectionColor="#CBD5E1"
          fadeDistance={18}
          fadeStrength={1.4}
          infiniteGrid
        />
      )}

      {/* Soft Contact Shadow */}
      <ContactShadows
        position={[0, groundY + 0.001, 0]}
        opacity={0.38}
        scale={16}
        blur={2.2}
        far={5}
      />

      {children}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={minDistance}
        maxDistance={maxDistance}
        maxPolarAngle={Math.PI / 2 - 0.02}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </Canvas>
  );
}
