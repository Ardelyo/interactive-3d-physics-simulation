import { useMemo } from "react";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";

/**
 * High-performance 3D vector arrow with smooth WebGL billboard labeling.
 * No HTML DOM jitter or CSS transform lag during rapid rotation!
 */
export function Arrow3D({
  from = [0, 0, 0] as [number, number, number],
  direction,
  length,
  color = "#1CB0F6",
  radius = 0.024,
  label,
  labelColor,
  opacity = 1,
  showLabel = true,
}: {
  from?: [number, number, number];
  direction: [number, number, number];
  length: number;
  color?: string;
  radius?: number;
  label?: string;
  labelColor?: string;
  opacity?: number;
  showLabel?: boolean;
}) {
  const { quaternion, shaftLen, headLen } = useMemo(() => {
    const dir = new THREE.Vector3(...direction);
    if (dir.lengthSq() < 1e-9) dir.set(0, 1, 0);
    dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const hLen = Math.min(0.28, Math.max(0.08, length * 0.22));
    const sLen = Math.max(0.001, length - hLen);
    return { quaternion: q, shaftLen: sLen, headLen: hLen };
  }, [direction, length]);

  if (length < 0.02) return null;

  return (
    <group position={from} quaternion={quaternion}>
      {/* Shaft */}
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[radius, radius, shaftLen, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.25}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Cone Head */}
      <mesh position={[0, shaftLen + headLen / 2, 0]}>
        <coneGeometry args={[radius * 2.8, headLen, 20]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Smooth WebGL Billboard Label (Rotates with camera, zero DOM jitter) */}
      {showLabel && label && (
        <Billboard position={[0, shaftLen + headLen + 0.14, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[label.length * 0.08 + 0.16, 0.2]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.92} />
          </mesh>
          <Text
            fontSize={0.12}
            color={labelColor ?? color}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
