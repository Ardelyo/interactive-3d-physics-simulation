import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneShell } from "../components/three/SceneShell";
import { Arrow3D } from "../components/three/Arrow3D";
import { Slider } from "../components/ui/Slider";
import { Panel, StatCard } from "../components/ui/Panel";
import { FBlock, F } from "../components/ui/Formula";
import { LiveChart } from "../components/ui/LiveChart";
import { Mascot } from "../components/ui/Mascot";
import { Billboard, Text } from "@react-three/drei";
import { sound, triggerHaptic } from "../utils/audio";

function CurlDirectionRing({
  radius,
  ccw,
}: {
  radius: number;
  ccw: boolean;
}) {
  const ringRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += (ccw ? 1 : -1) * dt * 1.5;
    }
  });

  const arrowCount = 4;

  return (
    <group ref={ringRef} position={[0, 0.05, 0]}>
      {/* Luminous Guide Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.45, radius * 0.49, 48]} />
        <meshBasicMaterial
          color={ccw ? "#10B981" : "#F59E0B"}
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* 4 Direction Indicator Chevrons */}
      {Array.from({ length: arrowCount }).map((_, i) => {
        const ang = (i * 2 * Math.PI) / arrowCount;
        const r = radius * 0.47;
        return (
          <mesh
            key={i}
            position={[r * Math.cos(ang), 0.005, r * Math.sin(ang)]}
            rotation={[-Math.PI / 2, 0, ang + (ccw ? Math.PI / 2 : -Math.PI / 2)]}
          >
            <coneGeometry args={[0.04, 0.1, 8]} />
            <meshBasicMaterial color={ccw ? "#10B981" : "#F59E0B"} />
          </mesh>
        );
      })}
    </group>
  );
}

function Scene({
  mass,
  radius,
  omega,
  running,
  thetaRef,
  showR,
  showV,
  showP,
  showL,
}: {
  mass: number;
  radius: number;
  omega: number;
  running: boolean;
  thetaRef: React.MutableRefObject<number>;
  showR: boolean;
  showV: boolean;
  showP: boolean;
  showL: boolean;
}) {
  const ballRef = useRef<THREE.Group>(null);
  const turntableRef = useRef<THREE.Group>(null);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.033);
    if (running) {
      thetaRef.current += omega * dt;
    }
    const t = thetaRef.current;
    if (ballRef.current) {
      ballRef.current.position.set(radius * Math.cos(t), 0.22, radius * Math.sin(t));
    }
    if (turntableRef.current && running) {
      turntableRef.current.rotation.y = t;
    }
  });

  const t = thetaRef.current;
  const pos: [number, number, number] = [radius * Math.cos(t), 0.22, radius * Math.sin(t)];
  const tangent = new THREE.Vector3(-Math.sin(t), 0, Math.cos(t)).multiplyScalar(
    Math.sign(omega) || 1
  );
  const v = Math.abs(omega) * radius;
  const p = mass * v;
  const L = mass * radius * radius * omega;

  const rDir: [number, number, number] =
    radius > 0.001 ? [pos[0] / radius, 0, pos[2] / radius] : [1, 0, 0];

  const L_length = Math.min(2.5, 0.6 + Math.abs(L) * 0.42);
  const isUp = omega >= 0;

  return (
    <group>
      {/* Platter Studio Base */}
      <group ref={turntableRef} position={[0, 0.02, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[2.55, 2.6, 0.04, 64]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.15} roughness={0.6} />
        </mesh>
        {/* Degree Ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i * Math.PI) / 6;
          return (
            <mesh
              key={i}
              position={[2.2 * Math.cos(ang), 0.022, 2.2 * Math.sin(ang)]}
              rotation={[-Math.PI / 2, 0, ang]}
            >
              <planeGeometry args={[0.03, 0.22]} />
              <meshBasicMaterial color="#CBD5E1" />
            </mesh>
          );
        })}
      </group>

      {/* Orbit Ring Track */}
      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 96]} />
        <meshBasicMaterial color="#BAE6FD" transparent opacity={0.7} />
      </mesh>

      {/* Kaidah Tangan Kanan Rotating Ring */}
      <CurlDirectionRing radius={radius} ccw={isUp} />

      {/* Center Pivot Axis O */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.8, 20]} />
        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color="#FFC800" metalness={0.6} roughness={0.3} />
      </mesh>
      <Billboard position={[0, 0.98, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.7, 0.2]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
        </mesh>
        <Text fontSize={0.11} color="#334155" anchorX="center" anchorY="middle" fontWeight="bold">
          Poros O
        </Text>
      </Billboard>

      {/* Connecting Rod */}
      <mesh position={[pos[0] / 2, 0.12, pos[2] / 2]} rotation={[0, -t, 0]}>
        <boxGeometry args={[radius, 0.026, 0.026]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* The Particle Sphere */}
      <group ref={ballRef} position={pos}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial
            color="#FF9600"
            metalness={0.25}
            roughness={0.3}
            emissive="#FF9600"
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* Glow rim */}
        <mesh>
          <sphereGeometry args={[0.195, 16, 16]} />
          <meshBasicMaterial color="#FFC800" wireframe transparent opacity={0.3} />
        </mesh>
      </group>

      {/* ================= 3D VECTOR ARROWS ================= */}

      {/* Vector r (Posisi) */}
      {showR && (
        <Arrow3D
          from={[0, 0.22, 0]}
          direction={rDir}
          length={Math.max(radius, 0.1)}
          color="#0284C7"
          radius={0.02}
          showLabel={false}
        />
      )}

      {/* Vector v (Kecepatan Linear Tangensial) */}
      {showV && (
        <Arrow3D
          from={pos}
          direction={[tangent.x, tangent.y, tangent.z]}
          length={Math.min(1.5, 0.4 + v * 0.22)}
          color="#10B981"
          radius={0.022}
          showLabel={false}
        />
      )}

      {/* Vector p (Momentum Linear) */}
      {showP && (
        <Arrow3D
          from={[pos[0], pos[1] + 0.28, pos[2]]}
          direction={[tangent.x, tangent.y, tangent.z]}
          length={Math.min(1.6, 0.35 + p * 0.25)}
          color="#F97316"
          radius={0.022}
          showLabel={false}
        />
      )}

      {/* Vector L (Momentum Sudut di Sumbu Vertikal) — BOLD & CLEAR! */}
      {showL && (
        <group>
          <Arrow3D
            from={[0, 0.4, 0]}
            direction={[0, isUp ? 1 : -1, 0]}
            length={L_length}
            color="#9333EA"
            radius={0.036}
            showLabel={false}
          />
          {/* Billboard Label directly anchored to the vertical vector */}
          <Billboard
            position={[0, isUp ? 0.4 + L_length + 0.2 : 0.4 - L_length - 0.2, 0]}
          >
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.5, 0.3]} />
              <meshBasicMaterial color="#FAF5FF" />
            </mesh>
            <Text
              fontSize={0.14}
              color="#7E22CE"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {isUp ? "▲ L = r × p (Ke Atas)" : "▼ L = r × p (Ke Bawah)"}
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}

export default function ParticleModule() {
  const [mass, setMass] = useState<number>(1.2);
  const [radius, setRadius] = useState<number>(1.4);
  const [omegaMag, setOmegaMag] = useState<number>(2.0);
  const [ccw, setCcw] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(true);

  // Vector toggles
  const [showR, setShowR] = useState<boolean>(true);
  const [showV, setShowV] = useState<boolean>(true);
  const [showP, setShowP] = useState<boolean>(true);
  const [showL, setShowL] = useState<boolean>(true);

  // Mobile compact segmented tab
  const [mobileTab, setMobileTab] = useState<"controls" | "stats" | "theory">("controls");

  const thetaRef = useRef<number>(0);
  const [history, setHistory] = useState<{ L: number[]; v: number[] }>({ L: [], v: [] });

  const omega = ccw ? omegaMag : -omegaMag;
  const v = omegaMag * radius;
  const p = mass * v;
  const I = mass * radius * radius;
  const L = I * omega;

  useEffect(() => {
    const id = setInterval(() => {
      setHistory((h) => ({
        L: [...h.L.slice(-40), Math.abs(L)],
        v: [...h.v.slice(-40), v],
      }));
    }, 200);
    return () => clearInterval(id);
  }, [L, v]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
      {/* 3D Viewport (Centerpiece) */}
      <div className="lg:col-span-7 flex flex-col gap-2.5">
        <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-xs">
          <SceneShell camera={{ position: [3.4, 2.9, 4.2], fov: 42 }}>
            <Scene
              mass={mass}
              radius={radius}
              omega={omega}
              running={running}
              thetaRef={thetaRef}
              showR={showR}
              showV={showV}
              showP={showP}
              showL={showL}
            />
          </SceneShell>

          {/* Top Floating Status & Kaidah Tangan Kanan HUD */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1 shadow-xs border border-[#E5E7EB] backdrop-blur-xs">
              <span className="text-base">{ccw ? "👍" : "👎"}</span>
              <span className="font-heading text-xs font-bold text-slate-800">
                {ccw ? "Kaidah Tangan Kanan: L ke Atas" : "Putaran CW: L ke Bawah"}
              </span>
            </div>
            <div className="rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] px-2.5 py-1 text-xs font-heading font-extrabold text-[#7E22CE]">
              L = {Math.abs(L).toFixed(2)} kg·m²/s
            </div>
          </div>

          {/* Top-Right Interactive Vector Legend Chips (Tap to Toggle!) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playPop(520);
                setShowL(!showL);
              }}
              className={`rounded-lg px-2 py-0.8 text-[11px] font-heading font-bold border transition shadow-xs flex items-center gap-1.5 ${
                showL
                  ? "bg-[#FAF5FF] text-[#7E22CE] border-[#D8B4FE]"
                  : "bg-white/80 text-slate-400 border-slate-200 line-through"
              }`}
              title="Klik untuk tampilkan/sembunyikan vektor L"
            >
              <span className="h-2 w-2 rounded-full bg-[#9333EA]" />
              <span>Vektor L: {Math.abs(L).toFixed(2)}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop(500);
                setShowR(!showR);
              }}
              className={`rounded-lg px-2 py-0.8 text-[11px] font-heading font-bold border transition shadow-xs flex items-center gap-1.5 ${
                showR
                  ? "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]"
                  : "bg-white/80 text-slate-400 border-slate-200 line-through"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
              <span>Vektor r: {radius.toFixed(2)} m</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop(480);
                setShowV(!showV);
              }}
              className={`rounded-lg px-2 py-0.8 text-[11px] font-heading font-bold border transition shadow-xs flex items-center gap-1.5 ${
                showV
                  ? "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                  : "bg-white/80 text-slate-400 border-slate-200 line-through"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span>Vektor v: {v.toFixed(2)} m/s</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop(460);
                setShowP(!showP);
              }}
              className={`rounded-lg px-2 py-0.8 text-[11px] font-heading font-bold border transition shadow-xs flex items-center gap-1.5 ${
                showP
                  ? "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]"
                  : "bg-white/80 text-slate-400 border-slate-200 line-through"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#F97316]" />
              <span>Vektor p: {p.toFixed(2)}</span>
            </button>
          </div>

          {/* Bottom Floating Controls */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-wrap items-center justify-between gap-1.5 rounded-xl sm:rounded-2xl bg-white/95 p-2 shadow-xs border border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sound.playPop(520);
                  triggerHaptic("light");
                  setRunning(!running);
                }}
                className={`btn-duo px-3 py-1.5 text-xs ${
                  running ? "btn-duo-sky" : "btn-duo-green"
                }`}
              >
                {running ? "⏸ Jeda" : "▶ Jalankan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playWhoosh();
                  triggerHaptic("medium");
                  setCcw(!ccw);
                }}
                className="btn-duo btn-duo-white px-2.5 py-1.5 text-xs"
              >
                Balik Arah {ccw ? "↺" : "↻"}
              </button>
            </div>
            <div className="text-[10px] font-extrabold text-slate-500 hidden sm:block">
              {running ? "Simulasi Berjalan" : "Terjeda"}
            </div>
          </div>
        </div>

        {/* Mascot Explainer (Desktop always visible, mobile compact) */}
        <div className="hidden lg:block">
          <Mascot
            mood="thinking"
            quote="Kaidah Tangan Kanan: Lekukan empat jarimu searah putaran partikel, maka ibu jarimu (jempol) menunjuk langsung ke arah vektor L di sumbu putar!"
            tip="Momentum sudut partikel adalah L = r × p = m·r·v. Jika jari-jari r dilipatgandakan, momen inersia melonjak 4 kali lipat karena r dikuadratkan!"
            mission={{
              text: "Coba balik arah putaran menjadi searah jarum jam (CW)!",
              actionLabel: "Balik Arah ↻",
              onAction: () => setCcw(false),
            }}
          />
        </div>
      </div>

      {/* Control & Data Panel (Mobile Tabbed, Desktop Multi-Column) */}
      <div className="lg:col-span-5 flex flex-col gap-2.5">
        {/* Mobile Segmented Switcher (Visible only on mobile/tablet) */}
        <div className="flex lg:hidden rounded-xl border-2 border-[#E5E7EB] bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTab("controls")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "controls"
                ? "bg-[#1CB0F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            🎛️ Kontrol
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("stats")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "stats"
                ? "bg-[#1CB0F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            📊 Grafik & Data
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("theory")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-heading font-bold transition ${
              mobileTab === "theory"
                ? "bg-[#1CB0F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            🦉 Tips & Rumus
          </button>
        </div>

        {/* Controls Section (Shown on desktop OR mobile tab === 'controls') */}
        <div className={`${mobileTab === "controls" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Parameter Partikel" icon="🎯">
            <div className="space-y-3">
              <Slider
                label="Massa Partikel (m)"
                value={mass}
                min={0.2}
                max={3.0}
                step={0.1}
                unit="kg"
                accent="amber"
                onChange={setMass}
              />
              <Slider
                label="Jari-jari Lintasan (r)"
                value={radius}
                min={0.4}
                max={2.4}
                step={0.05}
                unit="m"
                accent="sky"
                onChange={setRadius}
                hint="Jarak partikel ke sumbu pusat"
              />
              <Slider
                label="Kecepatan Sudut (ω)"
                value={omegaMag}
                min={0.2}
                max={5.0}
                step={0.1}
                unit="rad/s"
                accent="green"
                onChange={setOmegaMag}
              />
            </div>
          </Panel>

          {/* Quick Realtime Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Kecepatan (v)"
              value={v.toFixed(2)}
              unit="m/s"
              color="emerald"
              sublabel="v = ω · r"
            />
            <StatCard
              label="Momentum (p)"
              value={p.toFixed(2)}
              unit="kg·m/s"
              color="amber"
              sublabel="p = m · v"
            />
            <StatCard
              label="Inersia (I)"
              value={I.toFixed(2)}
              unit="kg·m²"
              color="sky"
              sublabel="I = m · r²"
            />
            <StatCard
              label="Momentum Sudut (L)"
              value={Math.abs(L).toFixed(2)}
              unit="kg·m²/s"
              color="purple"
              sublabel="L = I · ω"
            />
          </div>
        </div>

        {/* Stats & Charts Section (Shown on desktop OR mobile tab === 'stats') */}
        <div className={`${mobileTab === "stats" ? "block" : "hidden"} lg:block space-y-3`}>
          <Panel title="Grafik Real-time (|L| & v)" icon="📈">
            <LiveChart
              series={[
                { data: history.L, color: "#9333EA", label: "|L|", unit: "kg·m²/s" },
                { data: history.v, color: "#16A34A", label: "v", unit: "m/s" },
              ]}
              height={95}
            />
          </Panel>
        </div>

        {/* Theory & Formula Section (Shown on desktop OR mobile tab === 'theory') */}
        <div className={`${mobileTab === "theory" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="lg:hidden">
            <Mascot
              mood="thinking"
              quote="Kaidah Tangan Kanan: Lekukan empat jarimu searah putaran partikel, maka ibu jarimu (jempol) menunjuk langsung ke arah vektor L di sumbu putar!"
              tip="Momentum sudut partikel adalah L = r × p = m·r·v."
            />
          </div>

          <Panel title="Substitusi Nilai Langsung" icon="📐">
            <div className="space-y-1.5 text-xs text-slate-700">
              <FBlock
                tex={`L = m \\cdot r^2 \\cdot \\omega = ${mass} \\times (${radius.toFixed(2)})^2 \\times ${omegaMag.toFixed(1)} = ${Math.abs(L).toFixed(2)}\\text{ kg}\\cdot\\text{m}^2/\\text{s}`}
                label="Kalkulasi"
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Vektor <F tex="\vec L" /> tegak lurus bidang putaran sesuai aturan perkalian silang <F tex="\vec r \times \vec p" />.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
