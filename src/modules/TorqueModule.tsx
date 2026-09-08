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
import { Html } from "@react-three/drei";
import { sound, triggerHaptic } from "../utils/audio";

interface Physics {
  theta: number;
  omega: number;
}

function Sparks({ active }: { active: boolean }) {
  const count = 25;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 0.2;
      p[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame(() => {
    if (!active || !ref.current) return;
    ref.current.rotation.y += 0.2;
  });

  if (!active) return null;

  return (
    <points ref={ref} position={[0, 0.9, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#F59E0B"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({
  I,
  lever,
  forceOn,
  forceMag,
  friction,
  phys,
  wheelRadius,
}: {
  I: number;
  lever: number;
  forceOn: boolean;
  forceMag: number;
  friction: number;
  phys: React.MutableRefObject<Physics>;
  wheelRadius: number;
}) {
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.033);
    const torque = forceOn ? forceMag * lever : 0;
    const frictionTorque =
      -Math.sign(phys.current.omega) * friction * Math.abs(phys.current.omega);
    const alpha = (torque + frictionTorque) / I;
    phys.current.omega += alpha * dt;
    if (!forceOn && Math.abs(phys.current.omega) < 0.002) phys.current.omega = 0;
    phys.current.theta += phys.current.omega * dt;
    if (wheelRef.current) wheelRef.current.rotation.y = phys.current.theta;
  });

  const leverTip: [number, number, number] = [
    lever * Math.cos(phys.current.theta),
    0.9,
    lever * Math.sin(phys.current.theta),
  ];
  const tangent = new THREE.Vector3(
    -Math.sin(phys.current.theta),
    0,
    Math.cos(phys.current.theta)
  );

  return (
    <group>
      {/* Heavy Base Pedestal */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.08, 32]} />
        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.88, 20]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.2} />
      </mesh>

      <group ref={wheelRef} position={[0, 0.9, 0]}>
        {/* Flywheel Disk (Solid Cast Steel with Gold Trim) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, 0.09, 48]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Outer Brass Rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[wheelRadius - 0.02, 0.025, 16, 48]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Radial Spokes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[wheelRadius * 1.9, 0.05, 0.05]} />
            <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Central Bearing Cap */}
        <mesh>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Lever arm bar */}
        <mesh position={[lever / 2, 0, 0]}>
          <boxGeometry args={[lever, 0.04, 0.04]} />
          <meshStandardMaterial color="#0284C7" />
        </mesh>
        {/* Force Contact Node */}
        <mesh position={[lever, 0, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial
            color="#FF4B4B"
            emissive="#FF4B4B"
            emissiveIntensity={forceOn ? 0.6 : 0.2}
          />
        </mesh>
      </group>

      {/* Sparks when force is applied */}
      <Sparks active={forceOn} />

      {/* Force Vector F */}
      {forceOn && (
        <Arrow3D
          from={leverTip}
          direction={[tangent.x, tangent.y, tangent.z]}
          length={0.5 + forceMag * 0.16}
          color="#FF4B4B"
          radius={0.028}
          label="Gaya F"
          labelColor="#BE123C"
        />
      )}

      {/* Lever Arm Vector r */}
      <Arrow3D
        from={[0, 0.9, 0]}
        direction={[Math.cos(phys.current.theta), 0, Math.sin(phys.current.theta)]}
        length={lever}
        color="#0284C7"
        radius={0.016}
        label="Lengan r"
        labelColor="#0369A1"
        opacity={0.8}
      />

      {/* Torque Vector τ (Along Axis) */}
      {forceOn && (
        <Arrow3D
          from={[0, 1.0, 0]}
          direction={[0, 1, 0]}
          length={Math.min(1.5, 0.4 + forceMag * lever * 0.14)}
          color="#16A34A"
          radius={0.026}
          label="Torsi τ = r × F"
          labelColor="#15803D"
        />
      )}

      {/* Angular Momentum Vector L along axis */}
      <Arrow3D
        from={[0, 1.5, 0]}
        direction={[0, Math.sign(phys.current.omega) || 1, 0]}
        length={Math.min(2.0, 0.35 + Math.abs(I * phys.current.omega) * 0.35)}
        color="#9333EA"
        radius={0.032}
        label="L = I·ω"
        labelColor="#7E22CE"
      />

      <Html position={[0, -0.15, 0]} center>
        <div className="rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
          Roda Gaya (Flywheel)
        </div>
      </Html>
    </group>
  );
}

export default function TorqueModule() {
  const [mass, setMass] = useState<number>(4);
  const [wheelRadius, setWheelRadius] = useState<number>(0.75);
  const [lever, setLever] = useState<number>(0.85);
  const [forceMag, setForceMag] = useState<number>(6);
  const [friction, setFriction] = useState<number>(0.12);
  const [forceOn, setForceOn] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"controls" | "calc" | "stats" | "theory">("controls");

  const phys = useRef<Physics>({ theta: 0, omega: 0 });
  const [tick, setTick] = useState<number>(0);
  const [history, setHistory] = useState<{ tau: number[]; omega: number[]; L: number[] }>({
    tau: [],
    omega: [],
    L: [],
  });

  const I = 0.5 * mass * wheelRadius * wheelRadius;
  const torque = forceOn ? forceMag * lever : 0;
  const L = I * phys.current.omega;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 150);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const currentL = I * phys.current.omega;
    setHistory((h) => ({
      tau: [...h.tau.slice(-50), torque],
      omega: [...h.omega.slice(-50), phys.current.omega],
      L: [...h.L.slice(-50), currentL],
    }));
  }, [tick, I, torque]);

  const handleForceDown = () => {
    sound.playPop(580);
    triggerHaptic("medium");
    setForceOn(true);
  };

  const handleForceUp = () => {
    sound.playPop(420);
    setForceOn(false);
  };

  const handleReset = () => {
    sound.playWhoosh();
    triggerHaptic("light");
    phys.current.theta = 0;
    phys.current.omega = 0;
    setForceOn(false);
    setHistory({ tau: [], omega: [], L: [] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 3D Viewport */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="relative h-[420px] sm:h-[500px] w-full overflow-hidden rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-[0_4px_0_0_#E5E7EB]">
          <SceneShell camera={{ position: [3.4, 2.6, 4.2], fov: 42 }}>
            <Scene
              I={I}
              lever={lever}
              forceOn={forceOn}
              forceMag={forceMag}
              friction={friction}
              phys={phys}
              wheelRadius={wheelRadius}
            />
          </SceneShell>

          {/* Torque Active Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <span
              className={`h-3 w-3 rounded-full ${
                forceOn ? "bg-[#FF4B4B] animate-ping" : "bg-[#10B981]"
              }`}
            />
            <span className="text-xs font-heading font-bold text-slate-700">
              {forceOn
                ? `Torsi Aktif: τ = ${torque.toFixed(2)} N·m`
                : `Tanpa Torsi Luar (L = ${L.toFixed(2)} Kekal)`}
            </span>
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 p-3 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onMouseDown={handleForceDown}
                onMouseUp={handleForceUp}
                onMouseLeave={handleForceUp}
                onTouchStart={handleForceDown}
                onTouchEnd={handleForceUp}
                className={`btn-duo px-5 py-2.5 text-xs ${
                  forceOn ? "btn-duo-yellow" : "btn-duo-coral"
                }`}
              >
                {forceOn ? "⚡ Torsi Bekerja!" : "🖐 Tekan & Tahan Terapkan Torsi"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-duo btn-duo-white px-3 py-2 text-xs"
              >
                ↺ Reset
              </button>
            </div>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Lepaskan tombol untuk menguji kekekalan L saat τ = 0!
            </span>
          </div>
        </div>

        {/* Mascot (Desktop always visible) */}
        <div className="hidden lg:block">
          <Mascot
            mood="thinking"
            quote="Hukum II Newton untuk rotasi: τ = ΔL / Δt! Saat kamu menekan tombol gaya, torsi luar menghasilkan impuls sudut (ΔL = τ·Δt) yang memompa momentum sudut roda naik!"
            tip="Ketika torsi luar nol (τ = 0), momentum sudut L berhenti naik dan nilainya kekal!"
            mission={{
              text: "Coba tahan dorongan selama 2 detik, lalu lepas!",
              actionLabel: "Dorong 2 Detik ⏱️",
              onAction: () => {
                handleForceDown();
                setTimeout(handleForceUp, 2000);
              },
            }}
          />
        </div>
      </div>

      {/* Control & Telemetry (Mobile Tabbed, Desktop Multi-Column) */}
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
          <Panel title="Parameter Roda Gaya" icon="⚙️">
            <div className="space-y-3">
              <Slider
                label="Massa Roda (M)"
                value={mass}
                min={1}
                max={10}
                step={0.5}
                unit="kg"
                accent="amber"
                onChange={setMass}
              />
              <Slider
                label="Jari-jari Roda (R)"
                value={wheelRadius}
                min={0.4}
                max={1.1}
                step={0.05}
                unit="m"
                accent="sky"
                onChange={setWheelRadius}
              />
              <Slider
                label="Lengan Gaya (r)"
                value={lever}
                min={0.3}
                max={1.1}
                step={0.05}
                unit="m"
                accent="purple"
                onChange={setLever}
              />
              <Slider
                label="Gaya Dorong (F)"
                value={forceMag}
                min={1}
                max={15}
                step={0.5}
                unit="N"
                accent="rose"
                onChange={setForceMag}
              />
              <Slider
                label="Gesekan Poros"
                value={friction}
                min={0}
                max={0.5}
                step={0.02}
                unit=""
                accent="green"
                onChange={setFriction}
              />
            </div>
          </Panel>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Momen Inersia (I)"
              value={I.toFixed(3)}
              unit="kg·m²"
              color="amber"
              sublabel="I = 1/2 M·R²"
            />
            <StatCard
              label="Torsi Luar (τ)"
              value={torque.toFixed(2)}
              unit="N·m"
              color="rose"
              sublabel="τ = r × F"
            />
            <StatCard
              label="Kec. Sudut (ω)"
              value={phys.current.omega.toFixed(2)}
              unit="rad/s"
              color="emerald"
              sublabel="ω = L / I"
            />
            <StatCard
              label="Momentum (L)"
              value={L.toFixed(2)}
              unit="kg·m²/s"
              color="purple"
              sublabel="L = I · ω"
            />
          </div>
        </div>

        {/* Section 2: Step-by-Step Calculation */}
        <div className={`${mobileTab === "calc" ? "block" : "hidden"} lg:block space-y-3`}>
          <StepCalculation
            diketahui={[
              { symbol: "M", value: mass.toFixed(1), unit: "kg", desc: "Massa Roda" },
              { symbol: "R", value: wheelRadius.toFixed(2), unit: "m", desc: "Radius Roda" },
              { symbol: "r", value: lever.toFixed(2), unit: "m", desc: "Lengan Torsi" },
              { symbol: "F", value: forceOn ? forceMag.toFixed(1) : "0 (lepas)", unit: "N", desc: "Gaya Dorong" },
            ]}
            ditanya={{
              symbol: "\\tau \\text{ & } \\Delta L",
              desc: "Torsi & Perubahan Momentum Sudut",
              unit: "N·m / kg·m²/s",
            }}
            langkah={[
              {
                step: "Hitung Momen Inersia Cakram Pejal (I)",
                formula: "I = \\dfrac{1}{2} M R^2",
                substitution: `I = 0.5 \\times ${mass.toFixed(1)} \\times (${wheelRadius.toFixed(2)})^2`,
                result: `I = ${I.toFixed(3)} kg·m²`,
                explanation: "Cakram silinder pejal homogen yang berputar terhadap sumbu simetrinya.",
              },
              {
                step: "Hitung Momen Gaya (Torsi τ)",
                formula: "\\tau = r \\times F",
                substitution: `\\tau = ${lever.toFixed(2)} \\times ${forceOn ? forceMag.toFixed(1) : 0}`,
                result: `\\tau = ${torque.toFixed(2)} N·m`,
                explanation: forceOn ? "Gaya tangensial menghasilkan percepatan sudut α = τ/I." : "Tombol dilepas, τ = 0 sehingga momentum sudut L berhenti bertambah (kekal).",
              },
              {
                step: "Hubungan Impuls Sudut & Momentum Sudut",
                formula: "\\Delta L = \\tau \\cdot \\Delta t \\Rightarrow \\dfrac{\\Delta L}{\\Delta t} = \\tau",
                substitution: `\\Delta L = ${torque.toFixed(2)} \\times \\Delta t`,
                result: `L_{\\text{sekarang}} = ${L.toFixed(2)} kg·m²/s`,
                explanation: "Hukum II Newton versi rotasi: Torsi adalah turunan pertama momentum sudut terhadap waktu.",
              },
            ]}
          />
        </div>

        {/* Section 3: Stats & Charts */}
        <div className={`${mobileTab === "stats" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Grafik Dinamika Rotasi" icon="📈">
            <LiveChart
              series={[
                { data: history.tau, color: "#FF4B4B", label: "Torsi τ", unit: "N·m" },
                { data: history.L, color: "#9333EA", label: "Momentum L", unit: "kg·m²/s" },
                { data: history.omega, color: "#16A34A", label: "Kec. Sudut ω", unit: "rad/s" },
              ]}
              height={95}
            />
          </Panel>
        </div>

        {/* Section 4: Theory & Mascot */}
        <div className={`${mobileTab === "theory" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="lg:hidden">
            <Mascot
              mood="thinking"
              quote="Hukum II Newton untuk rotasi: τ = ΔL / Δt! Saat kamu menekan tombol gaya, torsi luar menghasilkan impuls sudut yang memompa momentum sudut roda naik!"
              tip="Ketika torsi luar nol (τ = 0), momentum sudut L berhenti naik dan nilainya kekal!"
            />
          </div>

          <Panel title="Hubungan Impuls & Momentum" icon="📘">
            <div className="space-y-2 text-xs">
              <FBlock
                tex="\Delta L = \tau \cdot \Delta t"
                label="Impuls Sudut"
                explanation="Impuls sudut menghasilkan perubahan momentum sudut benda rotasi."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
