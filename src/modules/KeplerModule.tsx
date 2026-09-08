import { useEffect, useMemo, useRef, useState } from "react";
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
import { Html, Trail } from "@react-three/drei";
import { sound, triggerHaptic } from "../utils/audio";

const GM = 4.2;
const R0 = 3.0;
const SAMPLE_INTERVAL = 0.55;
const MAX_SECTORS = 4;

interface OrbitState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
}

function accel(pos: THREE.Vector3) {
  const r = pos.length();
  return pos.clone().multiplyScalar(-GM / (r * r * r));
}

function Sector({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null;
    const verts: number[] = [0, 0.002, 0];
    points.forEach((p) => verts.push(p.x, 0.002, p.z));
    const idx: number[] = [];
    for (let i = 1; i < points.length; i++) {
      idx.push(0, i, i + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }, [points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Starfield({ count = 160 }: { count?: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 36;
      p[i * 3 + 1] = (Math.random() - 0.5) * 16 + 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    return p;
  }, [count]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#BAE6FD" transparent opacity={0.65} />
    </points>
  );
}

function Scene({
  state,
  running,
  speedMul,
  showSectors,
  sectors,
  currentArc,
}: {
  state: React.MutableRefObject<OrbitState>;
  running: boolean;
  speedMul: number;
  showSectors: boolean;
  sectors: { points: THREE.Vector3[]; color: string }[];
  currentArc: React.MutableRefObject<THREE.Vector3[]>;
}) {
  const planetRef = useRef<THREE.Group>(null);

  useFrame((_, dtRaw) => {
    if (!running) return;
    const dt = Math.min(dtRaw, 0.033) * speedMul;
    const substeps = 6;
    const h = dt / substeps;
    for (let i = 0; i < substeps; i++) {
      const a0 = accel(state.current.pos);
      state.current.pos
        .add(state.current.vel.clone().multiplyScalar(h))
        .add(a0.clone().multiplyScalar(0.5 * h * h));
      const a1 = accel(state.current.pos);
      state.current.vel.add(a0.add(a1).multiplyScalar(0.5 * h));
      currentArc.current.push(state.current.pos.clone());
    }
    if (planetRef.current) planetRef.current.position.copy(state.current.pos);
  });

  const pos = state.current.pos;
  const vel = state.current.vel;
  const rDir: [number, number, number] = [pos.x / pos.length(), 0, pos.z / pos.length()];
  const vLen = vel.length();
  const vDir: [number, number, number] =
    vLen > 0.001 ? [vel.x / vLen, 0, vel.z / vLen] : [0, 0, 1];

  return (
    <group>
      {/* Deep Space Starfield Backdrop */}
      <Starfield />

      {/* Radiant Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#FFC800"
          emissive="#FF9600"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
      {/* Sun Corona Halo Ring */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.65, 32]} />
        <meshBasicMaterial color="#FEF08A" transparent opacity={0.4} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={4.5} distance={20} color="#FFFBEB" />
      <Html position={[0, 0.75, 0]} center>
        <div className="rounded-full bg-[#FFC800] px-2 py-0.5 text-[10px] font-heading font-bold text-[#78350F] shadow border border-white">
          ☀ Matahari
        </div>
      </Html>

      {/* Swept Sectors (Equal Area in Equal Time) */}
      {showSectors &&
        sectors.map((s, i) => <Sector key={i} points={s.points} color={s.color} />)}
      {showSectors && currentArc.current.length > 1 && (
        <Sector points={currentArc.current} color="#0284C7" />
      )}

      {/* The Planet with Blue Trail */}
      <group ref={planetRef} position={pos}>
        <Trail width={2.2} length={12} color="#38BDF8" attenuation={(t) => t}>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial
              color="#0284C7"
              metalness={0.3}
              roughness={0.4}
              emissive="#0369A1"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Trail>
        <Html position={[0, 0.35, 0]} center>
          <div className="rounded-full bg-[#0284C7] px-2 py-0.5 text-[10px] font-heading font-bold text-white shadow">
            Planet
          </div>
        </Html>
      </group>

      {/* Position Vector r */}
      <Arrow3D
        from={[0, 0.02, 0]}
        direction={rDir}
        length={pos.length()}
        color="#F59E0B"
        radius={0.016}
        label="r (Jarak)"
        labelColor="#B45309"
        opacity={0.7}
      />
      {/* Tangential Velocity Vector v */}
      <Arrow3D
        from={[pos.x, 0.02, pos.z]}
        direction={vDir}
        length={Math.min(1.8, vLen * 0.55)}
        color="#10B981"
        radius={0.022}
        label="v (Kecepatan)"
        labelColor="#047857"
      />
      {/* Orbital Angular Momentum Vector L pointing up */}
      <Arrow3D
        from={[0, 0, 0]}
        direction={[0, 1, 0]}
        length={1.8}
        color="#9333EA"
        radius={0.026}
        label="L = r × p (Kekal)"
        labelColor="#7E22CE"
      />
    </group>
  );
}

export default function KeplerModule() {
  const [speedFactor, setSpeedFactor] = useState<number>(0.85);
  const [speedMul, setSpeedMul] = useState<number>(1);
  const [running, setRunning] = useState<boolean>(true);
  const [showSectors, setShowSectors] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<"controls" | "calc" | "stats" | "theory">("controls");

  const vCirc = Math.sqrt(GM / R0);
  const state = useRef<OrbitState>({
    pos: new THREE.Vector3(R0, 0, 0),
    vel: new THREE.Vector3(0, 0, vCirc * speedFactor),
  });
  const currentArc = useRef<THREE.Vector3[]>([]);
  const sampleTimer = useRef<number>(0);
  const [sectors, setSectors] = useState<{ points: THREE.Vector3[]; color: string }[]>([]);
  const [tick, setTick] = useState<number>(0);
  const [history, setHistory] = useState<{ L: number[]; speed: number[]; r: number[] }>({
    L: [],
    speed: [],
    r: [],
  });

  const colorCycle = ["#0284C7", "#9333EA", "#EC4899", "#F59E0B", "#10B981"];

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (running) {
        sampleTimer.current += 0.1 * speedMul;
        if (sampleTimer.current >= SAMPLE_INTERVAL) {
          sampleTimer.current = 0;
          setSectors((s) => {
            const next = [
              ...s,
              {
                points: [...currentArc.current],
                color: colorCycle[s.length % colorCycle.length],
              },
            ];
            currentArc.current = [];
            return next.slice(-MAX_SECTORS);
          });
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, speedMul]);

  useEffect(() => {
    const pos = state.current.pos;
    const vel = state.current.vel;
    const Lvec = new THREE.Vector3().crossVectors(pos, vel);
    setHistory((h) => ({
      L: [...h.L.slice(-50), Math.abs(Lvec.y)],
      speed: [...h.speed.slice(-50), vel.length()],
      r: [...h.r.slice(-50), pos.length()],
    }));
  }, [tick]);

  const resetOrbit = (f = speedFactor) => {
    state.current.pos.set(R0, 0, 0);
    state.current.vel.set(0, 0, vCirc * f);
    currentArc.current = [];
    sampleTimer.current = 0;
    setSectors([]);
    setHistory({ L: [], speed: [], r: [] });
  };

  const pos = state.current.pos;
  const vel = state.current.vel;
  const L = Math.abs(pos.x * vel.z - pos.z * vel.x);
  const r = pos.length();
  const speed = vel.length();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
      {/* 3D Viewport (Sticky on Scroll) */}
      <div className="lg:col-span-8 flex flex-col gap-2.5 sticky top-[68px] sm:top-[74px] z-20 self-start bg-[#F7F9FC] pb-1.5">
        <div className="relative h-[260px] sm:h-[380px] lg:h-[480px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E5E7EB] bg-[#0F172A] shadow-xs">
          <SceneShell
            camera={{ position: [0, 6.2, 0.1], fov: 48 }}
            showGrid={false}
            bg="#0F172A"
            maxDistance={22}
          >
            <Scene
              state={state}
              running={running}
              speedMul={speedMul}
              showSectors={showSectors}
              sectors={sectors}
              currentArc={currentArc}
            />
          </SceneShell>

          {/* Orbit Type Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
            <span className="text-xs font-heading font-bold text-slate-800">
              {speedFactor < 0.96
                ? "Orbit Elips (Mulai dari Titik Terjauh / Aphelion)"
                : speedFactor > 1.04
                ? "Orbit Elips (Mulai dari Titik Terdekat / Perihelion)"
                : "Orbit Hampir Lingkaran Sempurna"}
            </span>
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 p-3 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playPop(520);
                  triggerHaptic("light");
                  setRunning(!running);
                }}
                className={`btn-duo px-4 py-2 text-xs ${
                  running ? "btn-duo-sky" : "btn-duo-green"
                }`}
              >
                {running ? "⏸ Jeda" : "▶ Lanjut Orbit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playWhoosh();
                  resetOrbit();
                }}
                className="btn-duo btn-duo-white px-3 py-2 text-xs"
              >
                ↺ Ulangi Orbit
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showSectors}
                onChange={(e) => setShowSectors(e.target.checked)}
                className="h-4 w-4 rounded accent-[#58CC02]"
              />
              <span>Tampilkan Juring Luas Kepler II</span>
            </label>
          </div>
        </div>

        {/* Mascot (Desktop always visible) */}
        <div className="hidden lg:block">
          <Mascot
            mood="thinking"
            quote="Gaya gravitasi Matahari mengarah lurus ke pusat (segaris dengan vektor posisi r), sehingga torsi terhadap Matahari adalah NOL (τ = r × F = 0)! Momentum sudut orbital planet L = m·r·v selalu KEKAL abadi!"
            tip="Inilah bukti rahasia Hukum II Kepler: karena L konstan, maka laju sapuan luas dA/dt = L/(2m) juga konstan! Juring yang disapu dalam selang waktu yang sama selalu memiliki luas yang sama!"
            mission={{
              text: "Ubah orbit menjadi elips lonjong (kecepatan = 0.75) untuk melihat lonjakan kelajuan di perihelion!",
              actionLabel: "Set Elips Lonjong 🛸",
              onAction: () => {
                setSpeedFactor(0.75);
                resetOrbit(0.75);
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
            📊 Data
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
          <Panel title="Parameter Orbit Kepler" icon="🪐">
            <div className="space-y-3">
              <Slider
                label="Bentuk Orbit (v₀ / v_lingkaran)"
                value={speedFactor}
                min={0.6}
                max={1.3}
                step={0.02}
                precision={2}
                accent="green"
                onChange={(v) => {
                  setSpeedFactor(v);
                  resetOrbit(v);
                }}
                hint="1.00 = Lingkaran · < 1.00 = Elips"
                quickPicks={[
                  { label: "Elips (0.75)", val: 0.75 },
                  { label: "Lingkaran (1.0)", val: 1.0 },
                  { label: "Elips Cepat (1.2)", val: 1.2 },
                ]}
              />
              <Slider
                label="Kecepatan Simulasi Waktu"
                value={speedMul}
                min={0.2}
                max={2.5}
                step={0.1}
                unit="×"
                accent="sky"
                onChange={setSpeedMul}
              />
            </div>
          </Panel>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Jarak (r)"
              value={r.toFixed(2)}
              unit="AU"
              color="amber"
              sublabel="Jarak ke Matahari"
            />
            <StatCard
              label="Kelajuan (v)"
              value={speed.toFixed(2)}
              unit="AU/s"
              color="emerald"
              sublabel="Cepat di perihelion"
            />
            <StatCard
              label="Momentum (L)"
              value={L.toFixed(3)}
              unit="AU²/s"
              color="sky"
              sublabel="100% Kekal"
            />
            <StatCard
              label="Torsi (τ)"
              value="0.000"
              unit="N·m"
              color="rose"
              sublabel="Gaya Sentral = 0"
            />
          </div>
        </div>

        {/* Section 2: Step-by-Step Calculation */}
        <div className={`${mobileTab === "calc" ? "block" : "hidden"} lg:block space-y-3`}>
          <StepCalculation
            diketahui={[
              { symbol: "r", value: r.toFixed(2), unit: "AU", desc: "Jarak Sesaat Planet" },
              { symbol: "v", value: speed.toFixed(2), unit: "AU/s", desc: "Kelajuan Orbital" },
              { symbol: "GM", value: GM.toFixed(1), unit: "", desc: "Konstanta Gravitasi" },
              { symbol: "L", value: L.toFixed(3), unit: "AU²/s", desc: "Momentum Sudut Spesifik" },
            ]}
            ditanya={{
              symbol: "\\tau \\text{ & } \\dfrac{dA}{dt}",
              desc: "Torsi Gravitasi & Kecepatan Luasan (Kepler II)",
              unit: "N·m / AU²/s",
            }}
            langkah={[
              {
                step: "Buktikan Torsi Gravitasi Bernilai Nol (τ = 0)",
                formula: "\\vec\\tau = \\vec r \\times \\vec F_g = r \\cdot F_g \\cdot \\sin(180^\\circ) = 0",
                substitution: `\\tau = ${r.toFixed(2)} \\times F_g \\times 0 = 0`,
                result: `\\tau = 0.000 N·m`,
                explanation: "Gaya gravitasi matahari adalah gaya sentral yang selalu mengarah ke pusat Matahari (segaris dengan vektor posisi r).",
              },
              {
                step: "Kekekalan Momentum Sudut Orbital",
                formula: "\\dfrac{d\\vec L}{dt} = \\vec\\tau = 0 \\Rightarrow \\vec L = \\vec r \\times \\vec v = \\text{konstan}",
                substitution: `L = |\\vec r \\times \\vec v| = ${L.toFixed(3)}`,
                result: `L = ${L.toFixed(3)} AU²/s`,
                explanation: "Karena r berubah sepanjang orbit elips, kelajuan v harus menyesuaikan agar perkalian r × v konstan!",
              },
              {
                step: "Pembuktian Hukum II Kepler (Kecepatan Luas Tetap)",
                formula: "\\dfrac{dA}{dt} = \\dfrac{1}{2} |\\vec r \\times \\vec v| = \\dfrac{L}{2m} = \\text{konstan}",
                substitution: `\\dfrac{dA}{dt} = \\dfrac{${L.toFixed(3)}}{2} = ${(L / 2).toFixed(3)}`,
                result: `\\dfrac{dA}{dt} = ${(L / 2).toFixed(3)} AU²/s (Konstan)`,
                explanation: "Juring luasan yang disapu dalam selang waktu yang sama selalu memiliki luas yang sama persis!",
              },
            ]}
          />
        </div>

        {/* Section 3: Stats & Charts */}
        <div className={`${mobileTab === "stats" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Grafik Real-time (L Konstan)" icon="📈">
            <LiveChart
              series={[
                { data: history.L, color: "#0284C7", label: "L (Kekal)", unit: "AU²/s" },
                { data: history.speed, color: "#16A34A", label: "Kelajuan v", unit: "AU/s" },
                { data: history.r, color: "#F59E0B", label: "Jarak r", unit: "AU" },
              ]}
              height={95}
            />
          </Panel>
        </div>

        {/* Section 3: Theory & Mascot */}
        <div className={`${mobileTab === "theory" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="lg:hidden">
            <Mascot
              mood="thinking"
              quote="Gaya gravitasi Matahari mengarah lurus ke pusat (segaris dengan vektor posisi r), sehingga torsi terhadap Matahari adalah NOL (τ = 0)! Momentum sudut orbital planet L selalu KEKAL!"
              tip="Luas juring yang disapu dalam selang waktu yang sama selalu memiliki luas yang sama!"
            />
          </div>

          <Panel title="Hukum II Kepler" icon="📘">
            <div className="space-y-2 text-xs">
              <FBlock
                tex="\dfrac{dA}{dt} = \dfrac{L}{2m} = \text{konstan}"
                label="Kecepatan Luasan"
                explanation="Garis khayal yang menghubungkan planet ke Matahari menyapu luas yang sama dalam selang waktu yang sama."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
