import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneShell } from "../components/three/SceneShell";
import { Arrow3D } from "../components/three/Arrow3D";
import { Slider } from "../components/ui/Slider";
import { Panel, StatCard } from "../components/ui/Panel";
import { FBlock, F } from "../components/ui/Formula";
import { Mascot } from "../components/ui/Mascot";
import { Html } from "@react-three/drei";
import { sound, triggerHaptic } from "../utils/audio";
import confetti from "canvas-confetti";

interface Snapshot {
  label: string;
  I: number;
  omega: number;
  L: number;
}

function ChairScene({
  dumbbellMass,
  radius,
  thetaRef,
  omegaRef,
  spinning,
}: {
  dumbbellMass: number;
  radius: number;
  thetaRef: React.MutableRefObject<number>;
  omegaRef: React.MutableRefObject<number>;
  spinning: boolean;
}) {
  const rotGroup = useRef<THREE.Group>(null);
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.033);
    if (spinning) {
      thetaRef.current += omegaRef.current * dt;
    }
    if (rotGroup.current) rotGroup.current.rotation.y = thetaRef.current;
  });

  return (
    <group>
      {/* 5-Star Chrome Office Chair Base (Fixed to Floor) */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.06, 24]} />
        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* 5 Castor Wheel spokes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = (i * 2 * Math.PI) / 5;
        return (
          <group key={i} rotation={[0, ang, 0]}>
            <mesh position={[0.26, 0.04, 0]}>
              <boxGeometry args={[0.4, 0.03, 0.04]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <mesh position={[0.45, 0.03, 0]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>
        );
      })}

      {/* Hydraulic Lift Cylinder */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.52, 16]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Rotating Chair Assembly & Student */}
      <group ref={rotGroup} position={[0, 0.58, 0]}>
        {/* Seat Cushion */}
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 28]} />
          <meshStandardMaterial color="#0284C7" roughness={0.4} />
        </mesh>
        {/* Ergonomic Backrest */}
        <mesh position={[0, 0.42, -0.3]} castShadow>
          <boxGeometry args={[0.5, 0.65, 0.06]} />
          <meshStandardMaterial color="#0369A1" roughness={0.5} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.45, 8, 16]} />
          <meshStandardMaterial color="#58CC02" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.94, 0]} castShadow>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color="#FED7AA" />
        </mesh>
        {/* Glasses */}
        <mesh position={[0, 0.96, 0.14]}>
          <boxGeometry args={[0.16, 0.03, 0.02]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>

        {/* Arms holding Dumbbells at distance `radius` */}
        {[-1, 1].map((side) => {
          const armLen = Math.max(0.18, radius - 0.12);
          return (
            <group key={side}>
              {/* Upper arm & forearm */}
              <mesh
                position={[(side * (0.12 + armLen / 2)), 0.62, 0]}
                rotation={[0, 0, (side * Math.PI) / 2]}
                castShadow
              >
                <cylinderGeometry args={[0.04, 0.04, armLen, 12]} />
                <meshStandardMaterial color="#58CC02" />
              </mesh>
              {/* Hand */}
              <mesh position={[side * (radius - 0.04), 0.62, 0]}>
                <sphereGeometry args={[0.045, 12, 12]} />
                <meshStandardMaterial color="#FED7AA" />
              </mesh>
              {/* Hex Dumbbell (Metal Cast Iron) */}
              <group position={[side * radius, 0.62, 0]}>
                {/* Bar handle */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.28, 12]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
                </mesh>
                {/* Dumbbell Weights */}
                {[-0.11, 0.11].map((z) => (
                  <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry
                      args={[0.09 + dumbbellMass * 0.015, 0.09 + dumbbellMass * 0.015, 0.06, 6]}
                    />
                    <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
                  </mesh>
                ))}
              </group>

              {/* Little Floating Badge */}
              <Html position={[side * radius, 0.88, 0]} center>
                <div className="rounded-full bg-[#1E293B] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                  {dumbbellMass} kg
                </div>
              </Html>
            </group>
          );
        })}

        {/* Angular Momentum Vector L along vertical axis */}
        {spinning && (
          <Arrow3D
            from={[0, 1.3, 0]}
            direction={[0, 1, 0]}
            length={Math.min(1.8, 0.4 + Math.abs(omegaRef.current) * 0.25)}
            color="#58CC02"
            label="L = I·ω"
            labelColor="#15803D"
          />
        )}
      </group>

      {/* Orbit Circle of Dumbbells */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 64]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export default function StoolModule() {
  const [bodyI, setBodyI] = useState<number>(1.2);
  const [dumbbellMass, setDumbbellMass] = useState<number>(3.0);
  const [radius, setRadius] = useState<number>(0.85);
  const [omega0, setOmega0] = useState<number>(2.5);
  const [spinning, setSpinning] = useState<boolean>(false);

  const thetaRef = useRef<number>(0);
  const omegaRef = useRef<number>(0);
  const LRef = useRef<number>(0);
  const [, setTick] = useState<number>(0);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const I = bodyI + 2 * dumbbellMass * radius * radius;

  useEffect(() => {
    const id = setInterval(() => {
      if (spinning) {
        omegaRef.current = LRef.current / I;
      }
      setTick((v) => v + 1);
    }, 100);
    return () => clearInterval(id);
  }, [spinning, I]);

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
    setSnapshots([]);
  };

  const recordSnapshot = (label: string) => {
    sound.playSuccess();
    triggerHaptic("success");
    const nextSnap: Snapshot = {
      label,
      I,
      omega: omegaRef.current,
      L: LRef.current,
    };
    const updated = [...snapshots.slice(-1), nextSnap];
    setSnapshots(updated);

    if (updated.length === 2) {
      sound.playFanfare();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#58CC02", "#1CB0F6", "#FFC800"],
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 3D Viewport */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="relative h-[420px] sm:h-[500px] w-full overflow-hidden rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-[0_4px_0_0_#E5E7EB]">
          <SceneShell camera={{ position: [3.4, 2.5, 4.2], fov: 42 }}>
            <ChairScene
              dumbbellMass={dumbbellMass}
              radius={radius}
              thetaRef={thetaRef}
              omegaRef={omegaRef}
              spinning={spinning}
            />
          </SceneShell>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <span
              className={`h-3 w-3 rounded-full ${
                spinning ? "bg-[#58CC02] animate-pulse" : "bg-slate-300"
              }`}
            />
            <span className="text-xs font-heading font-bold text-slate-700">
              {spinning
                ? `Berputar: ω = ${omegaRef.current.toFixed(2)} rad/s`
                : "Kursi Diam (Siap Diputar)"}
            </span>
          </div>

          {/* Quick Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 p-3 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartSpin}
                disabled={spinning}
                className="btn-duo btn-duo-green px-4 py-2 text-xs disabled:opacity-40"
              >
                🌀 Putar Kursi
              </button>
              <button
                type="button"
                onClick={handleStopSpin}
                disabled={!spinning}
                className="btn-duo btn-duo-coral px-4 py-2 text-xs disabled:opacity-40"
              >
                ⏹ Reset
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => recordSnapshot(snapshots.length === 0 ? "Keadaan 1 (Awal)" : "Keadaan 2 (Akhir)")}
                disabled={!spinning || snapshots.length >= 2}
                className="btn-duo btn-duo-sky px-4 py-2 text-xs disabled:opacity-40"
              >
                📸 Catat {snapshots.length === 0 ? "Keadaan 1" : "Keadaan 2"}
              </button>
            </div>
          </div>
        </div>

        {/* Mascot */}
        <Mascot
          mood="happy"
          quote="Ini eksperimen fisika paling legendaris di kelas! Duduk di kursi putar sambil memegang dua barbel berat. Saat tangan ditarik ke dada, kamu akan berputar melesat kencang!"
          tip="Momen inersia total sistem adalah I = I_kursi + 2·m·r². Karena r dikuadratkan, perubahan jarak tangan sedikit saja sudah melipatgandakan kecepatan putaranmu!"
          mission={{
            text: "Putar kursi, catat Keadaan 1, ubah jarak r, lalu catat Keadaan 2!",
            actionLabel: "Tarik Tangan ke Dada 🤲",
            onAction: () => {
              if (!spinning) handleStartSpin();
              setRadius(0.25);
            },
          }}
        />
      </div>

      {/* Control & Verification Panel */}
      <div className="lg:col-span-4 space-y-4">
        <Panel title="Kontrol Bangku & Beban" icon="🪑">
          <div className="space-y-4">
            <Slider
              label="Jarak Beban ke Poros (r)"
              value={radius}
              min={0.2}
              max={1.1}
              step={0.02}
              unit="m"
              accent="green"
              onChange={setRadius}
              hint="0.2 m = Beban menempel dada · 1.1 m = Rentangan penuh"
              quickPicks={[
                { label: "Dekap (0.25m)", val: 0.25 },
                { label: "Setengah (0.65m)", val: 0.65 },
                { label: "Rentang (1.0m)", val: 1.0 },
              ]}
            />
            <Slider
              label="Massa Barbel Tiap Tangan (m)"
              value={dumbbellMass}
              min={1}
              max={6}
              step={0.5}
              unit="kg"
              accent="amber"
              onChange={setDumbbellMass}
              hint="Beban besi yang digenggam di masing-masing tangan"
            />
            <Slider
              label="Kec. Sudut Awal (ω₀)"
              value={omega0}
              min={1}
              max={6}
              step={0.5}
              unit="rad/s"
              accent="sky"
              disabled={spinning}
              onChange={setOmega0}
            />
          </div>
        </Panel>

        {/* Live Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Inersia Total (I)"
            value={I.toFixed(3)}
            unit="kg·m²"
            color="amber"
            sublabel="I = I₀ + 2·m·r²"
          />
          <StatCard
            label="Kec. Sudut (ω)"
            value={omegaRef.current.toFixed(2)}
            unit="rad/s"
            color="emerald"
            sublabel="ω = L / I"
          />
          <StatCard
            label="Momentum Sudut (L)"
            value={LRef.current.toFixed(2)}
            unit="kg·m²/s"
            color="sky"
            sublabel="L = I · ω (Kekal)"
          />
          <StatCard
            label="Kondisi"
            value={spinning ? "Berputar" : "Diam"}
            color="purple"
            sublabel="Gesekan Poros ≈ 0"
          />
        </div>

        {/* Numerical Verification Table */}
        {snapshots.length > 0 && (
          <Panel title="Tabel Verifikasi L₁ = L₂" icon="🧮">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-slate-500 font-extrabold pb-1">
                    <th className="py-1">Keadaan</th>
                    <th>I (kg·m²)</th>
                    <th>ω (rad/s)</th>
                    <th>L (kg·m²/s)</th>
                  </tr>
                </thead>
                <tbody className="font-heading font-bold text-slate-800">
                  {snapshots.map((s) => (
                    <tr key={s.label} className="border-b border-slate-100">
                      <td className="py-2 text-[#0284C7]">{s.label}</td>
                      <td>{s.I.toFixed(3)}</td>
                      <td>{s.omega.toFixed(2)}</td>
                      <td>{s.L.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {snapshots.length === 2 && (
              <div className="mt-3 rounded-xl border-2 border-[#BBF7D0] bg-[#F0FDF4] p-3 text-xs text-[#15803D] font-bold animate-pop-in">
                🎉 Selisih <F tex="\Delta L = |L_1 - L_2|" /> ={" "}
                {Math.abs(snapshots[0].L - snapshots[1].L).toFixed(4)} kg·m²/s.
                Hukum Kekekalan Momentum Sudut terbukti 100% valid!
              </div>
            )}
          </Panel>
        )}

        {/* Formula */}
        <Panel title="Prinsip Fisika" icon="📘">
          <div className="space-y-3">
            <FBlock
              tex="I_1\omega_1 = I_2\omega_2 = \text{konstan}"
              label="Hukum Kekekalan"
              explanation="Saat tangan didekatkan ke dada (r mengecil), inersia I turun dan ω melesat naik!"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
