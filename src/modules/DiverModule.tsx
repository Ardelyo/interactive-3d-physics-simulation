import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneShell } from "../components/three/SceneShell";
import { Slider } from "../components/ui/Slider";
import { Panel, StatCard } from "../components/ui/Panel";
import { FBlock, F } from "../components/ui/Formula";
import { LiveChart } from "../components/ui/LiveChart";
import { Mascot } from "../components/ui/Mascot";
import { StepCalculation } from "../components/ui/StepCalculation";
import { Html } from "@react-three/drei";
import { sound, triggerHaptic } from "../utils/audio";
import confetti from "canvas-confetti";

const G = 9.8;
const I_EXT = 11.0; // kg·m² body extended straight
const I_TUCK = 2.4; // kg·m² body tightly tucked

function iFromTuck(tuck: number) {
  return I_TUCK + (I_EXT - I_TUCK) * (1 - tuck);
}

interface FlightState {
  t: number;
  x: number;
  y: number;
  vy: number;
  theta: number;
}

function WaterSplashParticles({ active }: { active: boolean }) {
  const count = 35;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 1.5;
      p[i * 3 + 1] = Math.random() * 1.2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (!active || !ref.current) return;
    ref.current.position.y += dt * 0.4;
  });

  if (!active) return null;

  return (
    <points ref={ref} position={[3.5, 0.2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#38BDF8"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DiverFigure({ tuck, theta }: { tuck: number; theta: number }) {
  const legAngle = THREE.MathUtils.lerp(0, 2.1, tuck);
  const armAngle = THREE.MathUtils.lerp(0.1, 1.9, tuck);

  return (
    <group rotation={[0, 0, theta]}>
      {/* Torso */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.42, 6, 12]} />
        <meshStandardMaterial color="#0284C7" />
      </mesh>
      {/* Head + Swim Cap */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color="#FFC800" />
      </mesh>
      {/* Swim Goggles */}
      <mesh position={[0, 0.66, 0.1]}>
        <boxGeometry args={[0.12, 0.03, 0.02]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* Arms */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.14, 0.48, 0]} rotation={[0, 0, side * armAngle]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.34, 6, 10]} />
            <meshStandardMaterial color="#FED7AA" />
          </mesh>
        </group>
      ))}

      {/* Legs */}
      <group rotation={[legAngle, 0, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.45, 6, 12]} />
          <meshStandardMaterial color="#0369A1" />
        </mesh>
      </group>
    </group>
  );
}

function Scene({
  boardHeight,
  flight,
  tuck,
  phase,
  L,
  onEnter,
}: {
  boardHeight: number;
  flight: React.MutableRefObject<FlightState>;
  tuck: number;
  phase: "ready" | "flying" | "entered";
  L: React.MutableRefObject<number>;
  onEnter: (theta: number) => void;
}) {
  useFrame((_, dtRaw) => {
    if (phase !== "flying") return;
    const dt = Math.min(dtRaw, 0.033);
    const f = flight.current;
    f.t += dt;
    f.vy -= G * dt;
    f.y += f.vy * dt;
    f.x += 1.15 * dt;

    const I = iFromTuck(tuck);
    const omega = L.current / I;
    f.theta += omega * dt;

    if (f.y <= 0.2) {
      f.y = 0.2;
      onEnter(f.theta);
    }
  });

  const diverPos: [number, number, number] =
    phase === "ready"
      ? [0.45, boardHeight + 0.1, 0]
      : [flight.current.x, Math.max(flight.current.y, 0.2), 0];

  return (
    <group>
      {/* Swimming Pool Surface (Clear Turquoise Water) */}
      <mesh position={[4.5, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial
          color="#06B6D4"
          metalness={0.15}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Pool Basin Floor */}
      <mesh position={[4.5, -1.0, 0]} receiveShadow>
        <boxGeometry args={[14, 1.9, 8]} />
        <meshStandardMaterial color="#0891B2" roughness={0.3} />
      </mesh>
      {/* Pool Lane Lines */}
      {[-2, 0, 2].map((z) => (
        <mesh key={z} position={[4.5, -0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13.5, 0.08]} />
          <meshBasicMaterial color="#E0F2FE" />
        </mesh>
      ))}

      {/* Diving Tower Structure (Multi-Tier Olympic Tower) */}
      <mesh position={[0, boardHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, boardHeight, 1.6]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>
      {/* Lower Platform Tiers (5m and 7.5m) */}
      {boardHeight > 5.5 && (
        <group position={[0.45, 5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.08, 1.2]} />
            <meshStandardMaterial color="#38BDF8" />
          </mesh>
        </group>
      )}
      {/* Springboard with Non-slip Mat */}
      <mesh position={[0.7, boardHeight, 0]} castShadow>
        <boxGeometry args={[1.4, 0.08, 1.1]} />
        <meshStandardMaterial color="#0284C7" roughness={0.3} />
      </mesh>
      {/* Safety Railings on Top Platform */}
      {[-0.5, 0.5].map((z) => (
        <group key={z} position={[0.1, boardHeight + 0.45, z]}>
          <mesh>
            <boxGeometry args={[1.0, 0.04, 0.04]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
          </mesh>
          <mesh position={[-0.45, -0.22, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.45, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
          </mesh>
          <mesh position={[0.45, -0.22, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.45, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Ladder Rungs up the Back */}
      {Array.from({ length: Math.floor(boardHeight * 2) }).map((_, i) => (
        <mesh key={i} position={[-0.52, i * 0.5 + 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.5, 8]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} />
        </mesh>
      ))}

      {/* Aquatic Arena Grandstand in Background */}
      <group position={[4.5, 0, -4.5]}>
        {[0, 1, 2, 3].map((step) => (
          <mesh key={step} position={[0, step * 0.4, -step * 0.5]}>
            <boxGeometry args={[14, 0.4, 0.6]} />
            <meshStandardMaterial color={step % 2 === 0 ? "#E2E8F0" : "#CBD5E1"} />
          </mesh>
        ))}
      </group>

      {/* The Diver */}
      <group position={diverPos}>
        <DiverFigure
          tuck={phase === "ready" ? 0 : tuck}
          theta={phase === "ready" ? 0 : flight.current.theta}
        />
      </group>

      {/* Splash Particles */}
      <WaterSplashParticles active={phase === "entered"} />

      {/* Board Label */}
      <Html position={[0, boardHeight + 0.9, 0]} center>
        <div className="rounded-xl bg-white/95 px-2.5 py-1 text-xs font-heading font-bold text-slate-700 shadow border border-slate-200">
          Papan {boardHeight} m
        </div>
      </Html>
    </group>
  );
}

export default function DiverModule() {
  const [boardHeight, setBoardHeight] = useState<number>(7.5);
  const [omega0, setOmega0] = useState<number>(3.5);
  const [jumpPower, setJumpPower] = useState<number>(3.2);
  const [tuck, setTuck] = useState<number>(0.85);
  const [phase, setPhase] = useState<"ready" | "flying" | "entered">("ready");
  const [mobileTab, setMobileTab] = useState<"controls" | "calc" | "stats" | "theory">("controls");

  const flight = useRef<FlightState>({ t: 0, x: 0.45, y: boardHeight, vy: 0, theta: 0 });
  const L = useRef<number>(0);
  const [tick, setTick] = useState<number>(0);
  const [history, setHistory] = useState<{ I: number[]; omega: number[] }>({
    I: [],
    omega: [],
  });
  const [entryResult, setEntryResult] = useState<{ text: string; perfect: boolean } | null>(null);

  const handleEnter = (theta: number) => {
    setPhase("entered");
    sound.playSplash();
    triggerHaptic("medium");

    const straightness = 1 - tuck;
    const angleMod = Math.abs(((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
    const verticalness = angleMod / Math.PI;
    const score = straightness * 0.6 + verticalness * 0.4;

    if (score > 0.65) {
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
      setEntryResult({
        text: "🌟 Entry Sempurna! Nyaris tanpa cipratan (Nilai 10/10)!",
        perfect: true,
      });
    } else {
      setEntryResult({
        text: "💦 Byuuuur! Badan belum lurus sempurna saat menyentuh air.",
        perfect: false,
      });
    }
  };

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase === "flying") {
      const I = iFromTuck(tuck);
      setHistory((h) => ({
        I: [...h.I.slice(-50), I],
        omega: [...h.omega.slice(-50), L.current / I],
      }));
    }
  }, [tick, phase, tuck]);

  const handleJump = () => {
    sound.playWhoosh();
    triggerHaptic("medium");
    flight.current = { t: 0, x: 0.45, y: boardHeight, vy: jumpPower, theta: 0 };
    L.current = iFromTuck(0) * omega0;
    setHistory({ I: [], omega: [] });
    setEntryResult(null);
    setPhase("flying");
  };

  const handleReset = () => {
    sound.playPop(480);
    flight.current = { t: 0, x: 0.45, y: boardHeight, vy: 0, theta: 0 };
    setPhase("ready");
    setEntryResult(null);
  };

  const I = useMemo(() => iFromTuck(tuck), [tuck]);
  const omegaNow = phase === "flying" ? L.current / I : phase === "entered" ? L.current / I : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
      {/* 3D Viewport (Sticky on Scroll) */}
      <div className="lg:col-span-8 flex flex-col gap-2.5 sticky top-[68px] sm:top-[74px] z-20 self-start bg-[#F7F9FC] pb-1.5">
        <div className="relative h-[260px] sm:h-[380px] lg:h-[480px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-xs">
          <SceneShell
            camera={{ position: [9, boardHeight * 0.65 + 1.8, 9.5], fov: 42 }}
            groundY={-1.0}
            maxDistance={24}
          >
            <Scene
              boardHeight={boardHeight}
              flight={flight}
              tuck={tuck}
              phase={phase}
              L={L}
              onEnter={handleEnter}
            />
          </SceneShell>

          {/* Height Switch Pills */}
          <div className="absolute top-4 left-4 z-10 flex gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            {[5, 7.5, 10].map((h) => (
              <button
                key={h}
                type="button"
                disabled={phase !== "ready"}
                onClick={() => {
                  sound.playPop(520);
                  setBoardHeight(h);
                  flight.current.y = h;
                }}
                className={`rounded-xl px-3 py-1 text-xs font-heading font-bold transition ${
                  boardHeight === h
                    ? "bg-[#1CB0F6] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                } disabled:opacity-40`}
              >
                {h} m
              </button>
            ))}
          </div>

          {/* Score Banner */}
          {entryResult && (
            <div
              className={`absolute top-4 right-4 z-10 rounded-2xl border-2 p-3 shadow-lg animate-pop-in ${
                entryResult.perfect
                  ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"
                  : "bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]"
              }`}
            >
              <p className="text-xs font-extrabold">{entryResult.text}</p>
            </div>
          )}

          {/* Action Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 p-3 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleJump}
                disabled={phase !== "ready"}
                className="btn-duo btn-duo-green px-5 py-2.5 text-xs disabled:opacity-40"
              >
                🚀 Loncat Sekarang!
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-duo btn-duo-white px-3 py-2 text-xs"
              >
                ↺ Ulangi Loncatan
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sound.playPop(560);
                  setTuck(0.95);
                }}
                className="btn-duo btn-duo-sky px-3 py-1 text-xs"
              >
                Tuck (Meringkuk) ➔ Salto Cepat!
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playPop(480);
                  setTuck(0.05);
                }}
                className="btn-duo btn-duo-white px-3 py-1 text-xs"
              >
                Lurus (Layout) ➔ Masuk Air
              </button>
            </div>
          </div>
        </div>

        {/* Mascot (Desktop always visible) */}
        <div className="hidden lg:block">
          <Mascot
            mood="amazed"
            quote="Saat melayang di udara, gaya gravitasi bekerja tepat di pusat massa sehingga torsi luarnya NOL (τ = 0)! Momen inersia peloncat berkurang dari 11 kg·m² menjadi cuma 2.4 kg·m² saat meringkuk (tuck) — sehingga putarannya jadi super cepat!"
            tip="Trik atlet profesional: lakukan posisi tuck rapat saat di puncak ketinggian untuk mengumpulkan putaran salto sebanyak-banyaknya, lalu buka luruskan tubuh (I membesar, putaran melambat) tepat sebelum menyentuh air agar masuk tegak lurus!"
            mission={{
              text: "Coba loncat, pasang tuck = 1 saat melayang, lalu buka ke 0 tepat sebelum masuk air!",
              actionLabel: "Uji Salto Pro 🥇",
              onAction: () => {
                handleJump();
                setTimeout(() => setTuck(1.0), 300);
                setTimeout(() => setTuck(0.05), 1100);
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
          <Panel title="Parameter Loncatan" icon="🤸">
            <div className="space-y-3">
              <Slider
                label="Bentuk Tubuh (Tuck / Meringkuk)"
                value={tuck}
                min={0}
                max={1}
                step={0.01}
                precision={2}
                accent="green"
                onChange={setTuck}
                hint="0 = Lurus (I besar) · 1 = Meringkuk bulat (I kecil)"
                quickPicks={[
                  { label: "Lurus (0.05)", val: 0.05 },
                  { label: "Pike (0.5)", val: 0.5 },
                  { label: "Tuck (0.95)", val: 0.95 },
                ]}
              />
              <Slider
                label="Tolakan Vertikal (v₀y)"
                value={jumpPower}
                min={1.5}
                max={5.5}
                step={0.1}
                unit="m/s"
                accent="sky"
                disabled={phase !== "ready"}
                onChange={setJumpPower}
              />
              <Slider
                label="Putaran Awal Salto (ω₀)"
                value={omega0}
                min={1.0}
                max={6.0}
                step={0.2}
                unit="rad/s"
                accent="purple"
                disabled={phase !== "ready"}
                onChange={setOmega0}
              />
            </div>
          </Panel>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Inersia Tubuh (I)"
              value={I.toFixed(2)}
              unit="kg·m²"
              color="amber"
              sublabel="Turun saat meringkuk"
            />
            <StatCard
              label="Kec. Sudut (ω)"
              value={omegaNow.toFixed(2)}
              unit="rad/s"
              color="emerald"
              sublabel="Melesat naik saat tuck"
            />
            <StatCard
              label="Momentum (L)"
              value={phase === "ready" ? "0.00" : L.current.toFixed(2)}
              unit="kg·m²/s"
              color="sky"
              sublabel="Kekal sepanjang terbang"
            />
            <StatCard
              label="Tinggi (y)"
              value={Math.max(flight.current.y, 0).toFixed(2)}
              unit="m"
              color="rose"
              sublabel="Jarak ke air"
            />
          </div>
        </div>

        {/* Section 2: Step-by-Step Calculation */}
        <div className={`${mobileTab === "calc" ? "block" : "hidden"} lg:block space-y-3`}>
          <StepCalculation
            diketahui={[
              { symbol: "h", value: boardHeight.toFixed(1), unit: "m", desc: "Tinggi Menara" },
              { symbol: "I_{\\text{lurus}}", value: I_EXT.toFixed(1), unit: "kg·m²", desc: "Inersia Posisi Lurus" },
              { symbol: "I_{\\text{tuck}}", value: I_TUCK.toFixed(1), unit: "kg·m²", desc: "Inersia Posisi Meringkuk" },
              { symbol: "\\text{tuck}", value: tuck.toFixed(2), unit: "", desc: "Tingkat Tekukan" },
            ]}
            ditanya={{
              symbol: "\\omega \\text{ & } t_{\\text{terbang}}",
              desc: "Kecepatan Putar Salto & Estimasi Jumlah Putaran Salto",
              unit: "rad/s",
            }}
            langkah={[
              {
                step: "Hitung Inersia Sesaat Tubuh Atlet (I)",
                formula: "I = I_{\\text{tuck}} + (I_{\\text{lurus}} - I_{\\text{tuck}})(1 - \\text{tuck})",
                substitution: `I = ${I_TUCK} + (${I_EXT} - ${I_TUCK}) \\times (1 - ${tuck.toFixed(2)})`,
                result: `I = ${I.toFixed(2)} kg·m²`,
                explanation: tuck > 0.7 ? "Posisi meringkuk bulat (tuck) memangkas inersia hingga 75%!" : "Posisi merentang lurus memperbesar inersia untuk memperlambat putaran.",
              },
              {
                step: "Hitung Kecepatan Sudut Putaran Salto (ω)",
                formula: "\\omega = \\dfrac{L}{I}",
                substitution: `\\omega = \\dfrac{${L.current.toFixed(2)}}{${I.toFixed(2)}}`,
                result: `\\omega = ${omegaNow.toFixed(2)} rad/s`,
                explanation: "Di udara bebas hambatan, torsi luar nol (τ = 0) sehingga L konstan sepanjang melayang.",
              },
              {
                step: "Hitung Waktu Jatuh & Estimasi Jumlah Putaran Salto",
                formula: "t_{\\text{terbang}} \\approx \\sqrt{\\dfrac{2h}{g}} ,\\quad N = \\dfrac{\\omega \\cdot t}{2\\pi}",
                substitution: `t \\approx \\sqrt{\\dfrac{2 \\times ${boardHeight.toFixed(1)}}{${G}}} = ${Math.sqrt(2 * boardHeight / G).toFixed(2)}\\text{ s}`,
                result: `Jumlah Salto N \\approx ${((omegaNow * Math.sqrt(2 * boardHeight / G)) / (2 * Math.PI)).toFixed(1)} putaran`,
                explanation: "Sebelum masuk air, atlet meluruskan tubuh (tuck ➔ 0) agar putaran melambat tepat tegak lurus!",
              },
            ]}
          />
        </div>

        {/* Section 3: Stats & Charts */}
        <div className={`${mobileTab === "stats" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Grafik Dinamika di Udara" icon="📈">
            <LiveChart
              series={[
                { data: history.I, color: "#EAB308", label: "Inersia I", unit: "kg·m²" },
                { data: history.omega, color: "#16A34A", label: "Kec. Sudut ω", unit: "rad/s" },
              ]}
              height={95}
            />
          </Panel>
        </div>

        {/* Section 3: Theory & Mascot */}
        <div className={`${mobileTab === "theory" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="lg:hidden">
            <Mascot
              mood="amazed"
              quote="Saat melayang di udara, gaya gravitasi bekerja tepat di pusat massa sehingga torsi luarnya NOL (τ = 0)! Momen inersia peloncat berkurang saat meringkuk (tuck) — sehingga putarannya jadi super cepat!"
              tip="Luruskan tubuh tepat sebelum menyentuh air agar masuk tegak lurus!"
            />
          </div>

          <Panel title="Kekekalan Momentum Bebas Torsi" icon="📘">
            <div className="space-y-2 text-xs">
              <FBlock
                tex="\Sigma\tau_{\text{luar}} = 0 \;\Rightarrow\; I_1\omega_1 = I_2\omega_2 = \text{konstan}"
                label="Di Udara Bebas"
                explanation="Gravitasi bekerja tepat di pusat massa sehingga tidak ada torsi pemuntir terhadap pusat massa atlet."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
