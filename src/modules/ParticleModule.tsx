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
import { Html, Trail } from "@react-three/drei";
import { sound, triggerHaptic } from "../utils/audio";

function RightHandRule3D({
  radius,
  omega,
}: {
  radius: number;
  omega: number;
}) {
  const isUp = omega >= 0;
  return (
    <group position={[0, 0.05, 0]}>
      {/* Curved rotation direction arrow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.45, radius * 0.49, 48]} />
        <meshBasicMaterial
          color={isUp ? "#10B981" : "#EF4444"}
          transparent
          opacity={0.6}
        />
      </mesh>
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
  const tangent = new THREE.Vector3(-Math.sin(t), 0, Math.cos(t)).multiplyScalar(Math.sign(omega) || 1);
  const v = Math.abs(omega) * radius;
  const p = mass * v;
  const L = mass * radius * radius * omega;

  const rDir: [number, number, number] =
    radius > 0.001 ? [pos[0] / radius, 0, pos[2] / radius] : [1, 0, 0];

  return (
    <group>
      {/* Turntable Platter */}
      <group ref={turntableRef} position={[0, 0.02, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[2.55, 2.6, 0.04, 64]} />
          <meshStandardMaterial color="#F1F5F9" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* Degree Markings on Turntable */}
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i * Math.PI) / 6;
          return (
            <mesh key={i} position={[2.2 * Math.cos(ang), 0.025, 2.2 * Math.sin(ang)]} rotation={[-Math.PI / 2, 0, ang]}>
              <planeGeometry args={[0.04, 0.25]} />
              <meshBasicMaterial color="#94A3B8" />
            </mesh>
          );
        })}
      </group>

      {/* Orbit Ring Path */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 96]} />
        <meshBasicMaterial color="#1CB0F6" transparent opacity={0.6} />
      </mesh>

      {/* Central Axis O */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#FFC800" metalness={0.5} roughness={0.2} />
      </mesh>
      <Html position={[0, 1.05, 0]} center>
        <div className="rounded-lg bg-white/90 border border-slate-300 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 shadow-sm">
          Poros O
        </div>
      </Html>

      {/* Connecting Telescopic Rod */}
      <mesh position={[pos[0] / 2, 0.12, pos[2] / 2]} rotation={[0, -t, 0]}>
        <boxGeometry args={[radius, 0.028, 0.028]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Particle m with Glowing Trail */}
      <group ref={ballRef} position={pos}>
        <Trail width={1.8} length={7} color="#38BDF8" attenuation={(w) => w}>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial
              color="#FF9600"
              metalness={0.3}
              roughness={0.3}
              emissive="#FF9600"
              emissiveIntensity={0.25}
            />
          </mesh>
        </Trail>
        <Html position={[0, 0.35, 0]} center>
          <div className="rounded-full bg-[#FF9600] px-2 py-0.5 text-[11px] font-heading font-bold text-white shadow">
            m = {mass} kg
          </div>
        </Html>
      </group>

      {/* Kaidah Tangan Kanan Helper Ring */}
      <RightHandRule3D radius={radius} omega={omega} />

      {/* Vector r (Posisi) */}
      {showR && (
        <Arrow3D
          from={[0, 0.22, 0]}
          direction={rDir}
          length={Math.max(radius, 0.1)}
          color="#1CB0F6"
          radius={0.02}
          label="r (Jari-jari)"
          labelColor="#0284C7"
        />
      )}

      {/* Vector v (Kecepatan Linear Tangensial) */}
      {showV && (
        <Arrow3D
          from={pos}
          direction={[tangent.x, tangent.y, tangent.z]}
          length={Math.min(1.5, 0.4 + v * 0.22)}
          color="#10B981"
          radius={0.02}
          label="v = ω·r"
          labelColor="#047857"
        />
      )}

      {/* Vector p (Momentum Linear) */}
      {showP && (
        <Arrow3D
          from={[pos[0], pos[1] + 0.28, pos[2]]}
          direction={[tangent.x, tangent.y, tangent.z]}
          length={Math.min(1.6, 0.35 + p * 0.25)}
          color="#F59E0B"
          radius={0.02}
          label="p = m·v"
          labelColor="#B45309"
        />
      )}

      {/* Vector L (Momentum Sudut di Sumbu Vertikal) */}
      {showL && (
        <Arrow3D
          from={[0, 0.45, 0]}
          direction={[0, Math.sign(L) || 1, 0]}
          length={Math.min(2.4, 0.45 + Math.abs(L) * 0.4)}
          color="#9333EA"
          radius={0.032}
          label={omega >= 0 ? "L = r × p (Ke Atas)" : "L = r × p (Ke Bawah)"}
          labelColor="#7E22CE"
        />
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
        L: [...h.L.slice(-50), Math.abs(L)],
        v: [...h.v.slice(-50), v],
      }));
    }, 200);
    return () => clearInterval(id);
  }, [L, v]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 3D Viewport */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="relative h-[420px] sm:h-[500px] w-full overflow-hidden rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-[0_4px_0_0_#E5E7EB]">
          <SceneShell camera={{ position: [3.8, 3.2, 4.6], fov: 42 }}>
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

          {/* Direction & Status Pill */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <span className="text-sm">{ccw ? "↺" : "↻"}</span>
            <span className="text-xs font-heading font-bold text-slate-700">
              {ccw ? "Putaran CCW (L ke Atas 👍)" : "Putaran CW (L ke Bawah 👎)"}
            </span>
          </div>

          {/* Floating Controls */}
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
                {running ? "⏸ Jeda" : "▶ Jalankan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playWhoosh();
                  triggerHaptic("medium");
                  setCcw(!ccw);
                }}
                className="btn-duo btn-duo-white px-3 py-2 text-xs"
              >
                Balik Arah Putaran 🔄
              </button>
            </div>

            {/* Vector Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowR(!showR)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                  showR ? "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]" : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                Vektor r
              </button>
              <button
                type="button"
                onClick={() => setShowV(!showV)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                  showV ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]" : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                Vektor v
              </button>
              <button
                type="button"
                onClick={() => setShowP(!showP)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                  showP ? "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]" : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                Vektor p
              </button>
              <button
                type="button"
                onClick={() => setShowL(!showL)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                  showL ? "bg-[#FAF5FF] text-[#9333EA] border-[#E9D5FF]" : "bg-white text-slate-400 border-slate-200"
                }`}
              >
                Vektor L
              </button>
            </div>
          </div>
        </div>

        {/* Mascot */}
        <Mascot
          mood="thinking"
          quote="Gunakan Kaidah Tangan Kanan: tekuk empat jarimu mengikuti arah putaran partikel, dan ibu jarimu (jempol) akan menunjuk lurus ke arah vektor momentum sudut L! 👍"
          tip="Momen inersia partikel titik adalah I = m·r². Jika jari-jari lintasan kamu jadikan 2 kali lipat, maka momen inersianya melompat jadi 4 kali lipat!"
          mission={{
            text: "Coba balik arah putaran menjadi searah jarum jam (CW)!",
            actionLabel: "Balik Arah ↻",
            onAction: () => setCcw(false),
          }}
        />
      </div>

      {/* Control & Telemetry */}
      <div className="lg:col-span-4 space-y-4">
        <Panel title="Parameter Partikel" icon="🎯">
          <div className="space-y-4">
            <Slider
              label="Massa Partikel (m)"
              value={mass}
              min={0.2}
              max={3.0}
              step={0.1}
              unit="kg"
              accent="amber"
              onChange={setMass}
              hint="Massa bola yang bergerak melingkar"
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
              hint="Jarak partikel dari poros pusat O"
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
              hint="Laju sudut rotasi partikel"
            />
          </div>
        </Panel>

        {/* Live Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Kelajuan Linear (v)"
            value={v.toFixed(2)}
            unit="m/s"
            color="emerald"
            sublabel="v = ω · r"
          />
          <StatCard
            label="Momentum Linear (p)"
            value={p.toFixed(2)}
            unit="kg·m/s"
            color="amber"
            sublabel="p = m · v"
          />
          <StatCard
            label="Momen Inersia (I)"
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
            sublabel="L = I · ω = r × p"
          />
        </div>

        {/* Chart */}
        <Panel title="Grafik Real-time" icon="📈">
          <LiveChart
            series={[
              { data: history.L, color: "#9333EA", label: "|L|", unit: "kg·m²/s" },
              { data: history.v, color: "#16A34A", label: "v", unit: "m/s" },
            ]}
          />
        </Panel>

        {/* Formula breakdown */}
        <Panel title="Substitusi Nilai Langsung" icon="📐">
          <div className="space-y-2 text-xs font-medium text-slate-700">
            <FBlock
              tex={`L = m \\cdot r^2 \\cdot \\omega = ${mass} \\times (${radius.toFixed(2)})^2 \\times ${omegaMag.toFixed(1)} = ${Math.abs(L).toFixed(2)}\\text{ kg}\\cdot\\text{m}^2/\\text{s}`}
              label="Hitungan Nyata"
            />
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Karena vektor <F tex="\vec r" /> tegak lurus terhadap <F tex="\vec v" />, maka besar momentum sudutnya sederhana: <F tex="L = mvr" />.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
