import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneShell } from "../components/three/SceneShell";
import { Arrow3D } from "../components/three/Arrow3D";
import { Slider } from "../components/ui/Slider";
import { Panel, StatCard } from "../components/ui/Panel";
import { FBlock, F } from "../components/ui/Formula";
import { LiveChart } from "../components/ui/LiveChart";
import { Mascot } from "../components/ui/Mascot";
import { StepCalculation } from "../components/ui/StepCalculation";
import { sound, triggerHaptic } from "../utils/audio";

const BODY_I = 0.85; // kg·m² torso + head + legs
const ARM_MASS = 3.2; // kg per arm
const SHOULDER_R = 0.14;
const ARM_LEN = 0.64;

function armRadius(extension: number) {
  const angle = (extension * Math.PI) / 2;
  return SHOULDER_R + ARM_LEN * Math.sin(angle);
}

function IceArenaEnvironment() {
  return (
    <group position={[0, 0, 0]}>
      {/* Glossy Ice Rink Surface */}
      <mesh position={[0, -0.015, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.3, 0.05, 64]} />
        <meshStandardMaterial
          color="#E0F2FE"
          roughness={0.06}
          metalness={0.2}
        />
      </mesh>

      {/* Rink Dasher Boards (Outer Protective Barrier) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[4.2, 4.2, 0.5, 64, 1, true]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Dasher Blue Cap Rail */}
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[4.22, 4.22, 0.04, 64, 1, true]} />
        <meshStandardMaterial color="#0284C7" roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Dasher Yellow Kickplate */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[4.19, 4.19, 0.1, 64, 1, true]} />
        <meshStandardMaterial color="#FFC800" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Transparent Protective Glass above Boards */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[4.2, 4.2, 0.75, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#BAE6FD"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Background Tiered Arena Grandstand Seating */}
      <group position={[0, 0.4, 0]}>
        {[5.2, 6.0, 6.8].map((radius, idx) => (
          <mesh key={idx} position={[0, idx * 0.4, 0]}>
            <cylinderGeometry args={[radius, radius + 0.6, 0.38, 48, 1, true]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "#CBD5E1" : "#94A3B8"} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Overhead Arena Floodlight Trusses */}
      {[-3.5, 3.5].map((x) => (
        <group key={x} position={[x, 3.2, -2.5]}>
          <mesh>
            <boxGeometry args={[0.8, 0.25, 0.4]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <pointLight intensity={1.8} distance={8} color="#F0F9FF" />
        </group>
      ))}

      {/* Circular Ice Markings */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.34, 64]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.54, 64]} />
        <meshBasicMaterial color="#F43F5E" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function IceSparkles({ count = 30, spinning }: { count?: number; spinning: boolean }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.45;
      p[i * 3] = r * Math.cos(theta);
      p[i * 3 + 1] = Math.random() * 0.12;
      p[i * 3 + 2] = r * Math.sin(theta);
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (!spinning || !ref.current) return;
    ref.current.rotation.y += dt * 5;
  });

  if (!spinning) return null;

  return (
    <points ref={ref} position={[0, 0.05, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#38BDF8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SkaterModel({
  extension,
  thetaRef,
  omegaRef,
}: {
  extension: number;
  thetaRef: React.MutableRefObject<number>;
  omegaRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Mesh>(null);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.033);
    thetaRef.current += omegaRef.current * dt;
    if (groupRef.current) groupRef.current.rotation.y = thetaRef.current;

    // Skirt flutters outward with centrifugal force!
    if (skirtRef.current) {
      const speed = Math.abs(omegaRef.current);
      const flare = Math.min(1.4, 1.0 + speed * 0.04);
      skirtRef.current.scale.set(flare, 1, flare);
    }
  });

  const angle = (extension * Math.PI) / 2;
  const r = armRadius(extension);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Chrome Ice Skates */}
      {[-0.08, 0.08].map((x) => (
        <group key={x} position={[x, 0.04, 0]}>
          {/* Blade */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.015, 0.05, 0.36]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.07, 0.1, 0.28]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Legs (Tights) */}
      <mesh position={[-0.08, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.72, 16]} />
        <meshStandardMaterial color="#F87171" />
      </mesh>
      <mesh position={[0.08, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.72, 16]} />
        <meshStandardMaterial color="#F87171" />
      </mesh>

      {/* Skater Pleated Dress / Skirt */}
      <mesh ref={skirtRef} position={[0, 0.86, 0]} castShadow>
        <coneGeometry args={[0.38, 0.36, 24, 1, true]} />
        <meshStandardMaterial color="#EC4899" side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.12, 16]} />
        <meshStandardMaterial color="#DB2777" />
      </mesh>

      {/* Torso (Glitter Vest) */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.46, 8, 16]} />
        <meshStandardMaterial color="#F43F5E" roughness={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color="#FED7AA" roughness={0.5} />
      </mesh>

      {/* Hair Bun & Ribbon */}
      <mesh position={[0, 1.9, -0.04]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#451A03" />
      </mesh>
      <mesh position={[0, 1.84, -0.08]}>
        <torusGeometry args={[0.05, 0.015, 8, 16]} />
        <meshStandardMaterial color="#EC4899" />
      </mesh>

      {/* Cute Eyes */}
      <mesh position={[-0.05, 1.73, 0.14]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#1E293B" />
      </mesh>
      <mesh position={[0.05, 1.73, 0.14]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#1E293B" />
      </mesh>
      {/* Cheerful Blush */}
      <mesh position={[-0.08, 1.68, 0.12]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#FDA4AF" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.08, 1.68, 0.12]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#FDA4AF" transparent opacity={0.6} />
      </mesh>

      {/* Arms (Pivoting at shoulders) */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * SHOULDER_R, 1.38, 0]}
          rotation={[0, 0, side * angle]}
        >
          {/* Shoulder Cap */}
          <mesh>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#F43F5E" />
          </mesh>
          {/* Arm Limb */}
          <mesh position={[0, -ARM_LEN / 2, 0]} castShadow>
            <capsuleGeometry args={[0.045, ARM_LEN - 0.1, 6, 12]} />
            <meshStandardMaterial color="#FED7AA" />
          </mesh>
          {/* Hand & Glowing Mittens */}
          <mesh position={[0, -ARM_LEN, 0]} castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial
              color="#FFC800"
              emissive="#FFC800"
              emissiveIntensity={0.3}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Orbit Circle of Hands */}
      <mesh position={[0, 1.38 - ARM_LEN * Math.cos(angle), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r - 0.01, r + 0.01, 64]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export default function SkaterModule() {
  const [extension, setExtension] = useState<number>(0.85); // 0 = tucked, 1 = outstretched
  const [omega0, setOmega0] = useState<number>(3.5);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [friction, setFriction] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"controls" | "calc" | "stats" | "theory">("controls");

  const thetaRef = useRef<number>(0);
  const omegaRef = useRef<number>(0);
  const LRef = useRef<number>(0);

  const [tick, setTick] = useState<number>(0);
  const [history, setHistory] = useState<{ I: number[]; omega: number[]; L: number[] }>({
    I: [],
    omega: [],
    L: [],
  });

  const I = BODY_I + 2 * ARM_MASS * armRadius(extension) * armRadius(extension);
  const Ek = 0.5 * I * omegaRef.current * omegaRef.current;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (spinning) {
      if (friction) {
        LRef.current *= 0.998;
      }
      omegaRef.current = LRef.current / I;
    } else {
      omegaRef.current = 0;
    }
    setHistory((h) => ({
      I: [...h.I.slice(-50), I],
      omega: [...h.omega.slice(-50), omegaRef.current],
      L: [...h.L.slice(-50), LRef.current],
    }));
  }, [tick, extension, friction, I, spinning]);

  const handleStartSpin = () => {
    sound.playWhoosh();
    triggerHaptic("medium");
    LRef.current = I * omega0;
    setSpinning(true);
  };

  const handleStopSpin = () => {
    sound.playPop(420);
    triggerHaptic("light");
    setSpinning(false);
    LRef.current = 0;
    omegaRef.current = 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
      {/* 3D Viewport (Sticky on Scroll) */}
      <div className="lg:col-span-8 flex flex-col gap-2.5 sticky top-[68px] sm:top-[74px] z-20 self-start bg-[#F7F9FC] pb-1.5">
        <div className="relative h-[260px] sm:h-[380px] lg:h-[480px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-xs">
          <SceneShell camera={{ position: [3.4, 2.4, 4.2], fov: 42 }} groundY={0}>
            {/* Full Olympic Ice Arena Environment */}
            <IceArenaEnvironment />

            {/* Skater Model */}
            <SkaterModel
              extension={extension}
              thetaRef={thetaRef}
              omegaRef={omegaRef}
            />

            {/* Sparkles on ice */}
            <IceSparkles spinning={spinning && Math.abs(omegaRef.current) > 2} />

            {/* Angular Momentum Vector Arrow */}
            {spinning && (
              <Arrow3D
                from={[0, 2.1, 0]}
                direction={[0, 1, 0]}
                length={Math.min(1.5, 0.4 + Math.abs(LRef.current) * 0.12)}
                color="#58CC02"
                label="L = I·ω (Kekal)"
                labelColor="#15803D"
              />
            )}
          </SceneShell>

          {/* Quick Status Pill */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <span className={`h-3 w-3 rounded-full ${spinning ? "bg-[#58CC02] animate-pulse" : "bg-slate-300"}`} />
            <span className="text-xs font-heading font-bold text-slate-700">
              {spinning
                ? `Berputar: ω = ${omegaRef.current.toFixed(2)} rad/s`
                : "Penari Siap Berputar"}
            </span>
          </div>

          {/* Floating Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 p-3 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartSpin}
                disabled={spinning}
                className="btn-duo btn-duo-green px-4 py-2 text-xs disabled:opacity-40"
              >
                💫 Beri Putaran Awal
              </button>
              <button
                type="button"
                onClick={handleStopSpin}
                disabled={!spinning}
                className="btn-duo btn-duo-coral px-4 py-2 text-xs disabled:opacity-40"
              >
                ⏹ Stop
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playPop(550);
                  setExtension(0.05);
                }}
                className="btn-duo btn-duo-sky px-3 py-1 text-xs"
              >
                Tarik Tangan ➔ Cepat! ⚡
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playPop(450);
                  setExtension(0.95);
                }}
                className="btn-duo btn-duo-white px-3 py-1 text-xs"
              >
                Rentang Tangan ➔ Lambat
              </button>
            </div>
          </div>
        </div>

        {/* Mascot (Desktop always visible) */}
        <div className="hidden lg:block">
          <Mascot
            mood="amazed"
            quote="Saat tangan penari ditarik mendekati badan, momen inersianya (I) turun drastis! Karena es licin dan tidak ada torsi luar, alam semesta memaksa putarannya (ω) melesat kencang agar L tetap sama!"
            tip="Energi kinetik rotasi Ek = 1/2 I ω² justru bertambah saat tangan didekapkan! Energi tambahan ini berasal dari usaha otot penari yang menarik tangannya melawan gaya sentrifugal!"
            mission={{
              text: "Coba rapatkan tangan penari ke dada saat sedang berputar!",
              actionLabel: "Tarik Tangan Rapat 🤲",
              onAction: () => setExtension(0.02),
            }}
          />
        </div>
      </div>

      {/* Controls & Telemetry (Mobile Tabbed, Desktop Multi-Column) */}
      <div className="lg:col-span-4 space-y-3">
        {/* Mobile Segmented Switcher */}
        <div className="flex lg:hidden rounded-xl border-2 border-[#E5E7EB] bg-white p-1 shadow-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setMobileTab("controls")}
            className={`flex-1 min-w-[70px] rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "controls"
                ? "bg-[#1CB0F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            🎛️ Kontrol
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("calc")}
            className={`flex-1 min-w-[85px] rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "calc"
                ? "bg-[#16A34A] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            📝 Hitungan
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("stats")}
            className={`flex-1 min-w-[70px] rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "stats"
                ? "bg-[#1CB0F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            📊 Grafik
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("theory")}
            className={`flex-1 min-w-[70px] rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "theory"
                ? "bg-[#1CB0F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            🦉 Tips
          </button>
        </div>

        {/* Section 1: Controls */}
        <div className={`${mobileTab === "controls" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Kontrol Posisi Penari" icon="🩰">
            <div className="space-y-3">
              <Slider
                label="Rentangan Kedua Lengan"
                value={extension}
                min={0}
                max={1}
                step={0.01}
                precision={2}
                accent="green"
                onChange={setExtension}
                hint="0 = Rapat (I kecil, ω cepat) · 1 = Lebar (I besar, ω pelan)"
                quickPicks={[
                  { label: "Rapat (0.1)", val: 0.1 },
                  { label: "Setengah (0.5)", val: 0.5 },
                  { label: "Lebar (1.0)", val: 1.0 },
                ]}
              />

              <Slider
                label="Kecepatan Awal (ω₀)"
                value={omega0}
                min={1}
                max={8}
                step={0.5}
                unit="rad/s"
                accent="sky"
                disabled={spinning}
                onChange={setOmega0}
              />

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={friction}
                  onChange={(e) => setFriction(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#58CC02]"
                />
                <span>Sertakan sedikit gesekan es nyata</span>
              </label>
            </div>
          </Panel>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Momen Inersia (I)"
              value={I.toFixed(3)}
              unit="kg·m²"
              color="amber"
              sublabel="I = I_badan + 2·m·r²"
            />
            <StatCard
              label="Kec. Sudut (ω)"
              value={omegaRef.current.toFixed(2)}
              unit="rad/s"
              color="emerald"
              sublabel="Makin kecil I, makin besar ω"
            />
            <StatCard
              label="Momentum (L)"
              value={LRef.current.toFixed(2)}
              unit="kg·m²/s"
              color="sky"
              sublabel="L = I·ω (Kekal)"
            />
            <StatCard
              label="Energi Kinetik (Ek)"
              value={Ek.toFixed(1)}
              unit="J"
              color="rose"
              sublabel="Ek = 1/2 I·ω²"
            />
          </div>
        </div>

        {/* Section 2: Step Calculation (Diketahui, Ditanya, Dijawab) */}
        <div className={`${mobileTab === "calc" ? "block" : "hidden"} lg:block space-y-3`}>
          <StepCalculation
            diketahui={[
              { symbol: "I_{\\text{badan}}", value: BODY_I.toFixed(2), unit: "kg·m²", desc: "Inersia Tubuh Dasar" },
              { symbol: "m_{\\text{lengan}}", value: ARM_MASS.toFixed(1), unit: "kg", desc: "Massa Tiap Lengan" },
              { symbol: "r", value: armRadius(extension).toFixed(2), unit: "m", desc: "Radius Lengan" },
              { symbol: "L", value: LRef.current.toFixed(2), unit: "kg·m²/s", desc: "Momentum Sudut (Kekal)" },
            ]}
            ditanya={{
              symbol: "\\omega",
              desc: "Kecepatan Sudut Putaran Penari",
              unit: "rad/s",
            }}
            langkah={[
              {
                step: "Hitung Momen Inersia Total Baru (I)",
                formula: "I = I_{\\text{badan}} + 2 \\cdot m_{\\text{lengan}} \\cdot r^2",
                substitution: `I = ${BODY_I} + 2 \\times ${ARM_MASS} \\times (${armRadius(extension).toFixed(2)})^2`,
                result: `I = ${I.toFixed(3)} kg·m²`,
                explanation: extension < 0.3 ? "Lengan rapat membuat distribusi massa mendekati sumbu putar (I mengecil drastis!)." : "Lengan terentang memperbesar jari-jari massa r sehingga I membesar.",
              },
              {
                step: "Terapkan Hukum Kekekalan Momentum Sudut",
                formula: "I_1 \\omega_1 = I_2 \\omega_2 \\Rightarrow \\omega_2 = \\dfrac{L}{I_2}",
                substitution: `\\omega = \\dfrac{${LRef.current.toFixed(2)}}{${I.toFixed(3)}}`,
                result: `\\omega = ${omegaRef.current.toFixed(2)} rad/s`,
                explanation: "Karena torsi luar di atas es licin nol (τ = 0), momentum sudut L kekal abadi.",
              },
              {
                step: "Hitung Energi Kinetik Rotasi (Ek)",
                formula: "E_k = \\dfrac{1}{2} I \\omega^2 = \\dfrac{L^2}{2I}",
                substitution: `E_k = 0.5 \\times ${I.toFixed(3)} \\times (${omegaRef.current.toFixed(2)})^2`,
                result: `E_k = ${Ek.toFixed(1)} Joule`,
                explanation: "Saat lengan ditarik rapat, Ek meningkat karena usaha internal otot penari melawan gaya sentrifugal!",
              },
            ]}
          />
        </div>

        {/* Section 3: Stats & Charts */}
        <div className={`${mobileTab === "stats" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Grafik Real-time (Kekekalan L)" icon="📈">
            <LiveChart
              series={[
                { data: history.I, color: "#EAB308", label: "Inersia I", unit: "kg·m²" },
                { data: history.omega, color: "#22C55E", label: "Kec. Sudut ω", unit: "rad/s" },
                { data: history.L, color: "#0EA5E9", label: "Momentum L", unit: "kg·m²/s" },
              ]}
              height={95}
            />
          </Panel>
        </div>

        {/* Section 4: Theory & Mascot */}
        <div className={`${mobileTab === "theory" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="lg:hidden">
            <Mascot
              mood="amazed"
              quote="Saat tangan penari ditarik mendekati badan, momen inersianya (I) turun drastis! Karena es licin dan tidak ada torsi luar, alam semesta memaksa putarannya (ω) melesat kencang agar L tetap sama!"
              tip="Energi kinetik rotasi Ek = 1/2 I ω² justru bertambah saat tangan didekapkan!"
            />
          </div>

          <Panel title="Rumus Fisika Terkait" icon="📘">
            <div className="space-y-2 text-xs">
              <FBlock
                tex="I_1\omega_1 = I_2\omega_2 = L \quad (\tau_{\text{luar}} = 0)"
                label="Hukum Kekekalan"
                explanation="Momentum sudut awal sama persis dengan momentum sudut akhir saat tidak ada torsi luar."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
