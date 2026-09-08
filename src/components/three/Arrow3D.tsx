import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

/**
 * Realistic vector arrow (shaft + cone head) with crisp Duolingo-style 3D labels.
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
}: {
  from?: [number, number, number];
  direction: [number, number, number];
  length: number;
  color?: string;
  radius?: number;
  label?: string;
  labelColor?: string;
  opacity?: number;
}) {
  const { quaternion, shaftLen, headLen } = useMemo(() => {
    const dir = new THREE.Vector3(...direction);
    if (dir.lengthSq() < 1e-9) dir.set(0, 1, 0);
    dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const hLen = Math.min(0.26, Math.max(0.09, length * 0.22));
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
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
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
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.35}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Crisp Floating Vector Tag */}
      {label && (
        <Html position={[0, shaftLen + headLen + 0.14, 0]} center distanceFactor={7} occlude={false}>
          <div
            className="select-none pointer-events-none whitespace-nowrap rounded-lg px-2 py-0.5 text-[11px] font-extrabold shadow-sm flex items-center gap-1 border"
            style={{
              backgroundColor: "#FFFFFF",
              color: labelColor ?? color,
              borderColor: labelColor ?? color,
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span>{label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
