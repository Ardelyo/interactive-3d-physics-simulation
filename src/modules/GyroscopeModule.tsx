import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";
import { SceneShell } from "../components/three/SceneShell";
import { Arrow3D } from "../components/three/Arrow3D";
import { Slider } from "../components/ui/Slider";
import { Panel, StatCard } from "../components/ui/Panel";
import { FBlock, F } from "../components/ui/Formula";
import { Mascot } from "../components/ui/Mascot";
import { StepCalculation } from "../components/ui/StepCalculation";
import { sound, triggerHaptic } from "../utils/audio";

function BicycleWheel3D({
  radius = 0.8,
  spinning = true,
  spinOmega = 25,
  spinAngleRef,
}: {
  radius?: number;
  spinning: boolean;
  spinOmega: number;
  spinAngleRef: React.MutableRefObject<number>;
}) {
  const wheelMeshRef = useRef<THREE.Group>(null);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.033);
    if (spinning) {
      spinAngleRef.current += spinOmega * dt;
    }
    if (wheelMeshRef.current) {
      wheelMeshRef.current.rotation.z = spinAngleRef.current;
    }
  });

  const spokeCount = 18;

  return (
    <group ref={wheelMeshRef}>
      {/* Outer Tire (Rubber Black) */}
      <mesh castShadow>
        <torusGeometry args={[radius, 0.065, 16, 48]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* Rim (Polished Aluminum) */}
      <mesh>
        <torusGeometry args={[radius - 0.045, 0.035, 16, 48]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Central Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.22, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Axle Handles (held by demonstrator) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.65, 16]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Handle grips */}
      {[-0.26, 0.26].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.14, 16]} />
          <meshStandardMaterial color="#0284C7" roughness={0.6} />
        </mesh>
      ))}

      {/* Wire Spokes */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / spokeCount;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, (radius - 0.05) / 2, 0.02]}>
              <cylinderGeometry args={[0.005, 0.005, radius - 0.05, 6]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, (radius - 0.05) / 2, -0.02]}>
              <cylinderGeometry args={[0.005, 0.005, radius - 0.05, 6]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* Valve Stem (Ref mark to see rotation clearly) */}
      <mesh position={[0, radius - 0.04, 0.04]}>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>
    </group>
  );
}

function Scene({
  mode,
  wheelSpin,
  tiltAngleDeg,
  chairOmega,
  precessOmega,
  spinAngleRef,
  chairAngleRef,
  precessAngleRef,
}: {
  mode: "chair" | "precession";
  wheelSpin: number;
  tiltAngleDeg: number;
  chairOmega: number;
  precessOmega: number;
  spinAngleRef: React.MutableRefObject<number>;
  chairAngleRef: React.MutableRefObject<number>;
  precessAngleRef: React.MutableRefObject<number>;
}) {
  const chairGroupRef = useRef<THREE.Group>(null);
  const precessGroupRef = useRef<THREE.Group>(null);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.033);
    if (mode === "chair") {
      chairAngleRef.current += chairOmega * dt;
      if (chairGroupRef.current) chairGroupRef.current.rotation.y = chairAngleRef.current;
    } else {
      precessAngleRef.current += precessOmega * dt;
      if (precessGroupRef.current) precessGroupRef.current.rotation.y = precessAngleRef.current;
    }
  });

  const tiltRad = (tiltAngleDeg * Math.PI) / 180;
  const wheelLMag = 0.5 * wheelSpin * 0.12; // visual scaling
  const chairLMag = chairOmega * 0.7;

  return (
    <group position={[0, 0, 0]}>
      {/* Physics Classroom / Laboratory Backdrop */}
      <group position={[0, 1.8, -2.4]}>
        {/* Wooden Frame */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[4.6, 2.1, 0.06]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
        </mesh>
        {/* Slate Blackboard */}
        <mesh>
          <boxGeometry args={[4.4, 1.9, 0.04]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} />
        </mesh>
        {/* Chalk Title & Formula Billboard */}
        <Billboard position={[0, 0.55, 0.04]}>
          <Text fontSize={0.16} color="#38BDF8" anchorX="center" fontWeight="bold">
            PRAKTIKUM FISIKA: DINAMIKA ROTASI & GIROSKOP
          </Text>
        </Billboard>
        <Billboard position={[0, 0.1, 0.04]}>
          <Text fontSize={0.13} color="#F8FAFC" anchorX="center">
            L_total = L_kursi + L_roda = Konstan  |  Ω_p = τ / L
          </Text>
        </Billboard>
        {/* Chalk Tray */}
        <mesh position={[0, -0.98, 0.08]}>
          <boxGeometry args={[4.4, 0.06, 0.16]} />
          <meshStandardMaterial color="#92400E" />
        </mesh>
      </group>

      {mode === "chair" ? (
        /* ================= MODE 1: SWIVEL CHAIR & BICYCLE WHEEL ================= */
        <group>
          {/* Base Stand (Fixed) */}
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <cylinderGeometry args={[0.55, 0.65, 0.08, 28]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.6, 16]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Rotating Chair & Person */}
          <group ref={chairGroupRef} position={[0, 0.65, 0]}>
            {/* Seat Cushion */}
            <mesh castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.09, 24]} />
              <meshStandardMaterial color="#1CB0F6" roughness={0.4} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.45, -0.32]} castShadow>
              <boxGeometry args={[0.5, 0.75, 0.08]} />
              <meshStandardMaterial color="#0284C7" />
            </mesh>
            {/* Student Body */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <capsuleGeometry args={[0.18, 0.48, 8, 16]} />
              <meshStandardMaterial color="#58CC02" />
            </mesh>
            <mesh position={[0, 1.0, 0]} castShadow>
              <sphereGeometry args={[0.15, 20, 20]} />
              <meshStandardMaterial color="#FED7AA" />
            </mesh>
            {/* Glasses */}
            <mesh position={[0, 1.02, 0.14]}>
              <boxGeometry args={[0.18, 0.04, 0.03]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>

            {/* Arms holding the wheel axle at chest level */}
            <mesh position={[-0.24, 0.72, 0.22]} rotation={[0.6, 0.3, -0.4]}>
              <capsuleGeometry args={[0.045, 0.42, 6, 12]} />
              <meshStandardMaterial color="#58CC02" />
            </mesh>
            <mesh position={[0.24, 0.72, 0.22]} rotation={[0.6, -0.3, 0.4]}>
              <capsuleGeometry args={[0.045, 0.42, 6, 12]} />
              <meshStandardMaterial color="#58CC02" />
            </mesh>

            {/* Held Wheel with Tilt Angle */}
            <group position={[0, 0.78, 0.52]} rotation={[tiltRad, 0, 0]}>
              {/* Wheel axle points along Z, rotating around Z */}
              <BicycleWheel3D
                radius={0.52}
                spinning={wheelSpin > 0.1}
                spinOmega={wheelSpin}
                spinAngleRef={spinAngleRef}
              />

              {/* Vector L_wheel (along wheel axle Z) */}
              <Arrow3D
                from={[0, 0, 0]}
                direction={[0, 0, 1]}
                length={wheelLMag}
                color="#F59E0B"
                label="L_roda"
                labelColor="#B45309"
              />
            </group>

            {/* Vector L_kursi (vertical axis +Y) */}
            {Math.abs(chairLMag) > 0.05 && (
              <Arrow3D
                from={[0, 1.25, 0]}
                direction={[0, Math.sign(chairLMag), 0]}
                length={Math.abs(chairLMag)}
                color="#9333EA"
                label="L_kursi"
                labelColor="#7E22CE"
              />
            )}
          </group>

          {/* Reference Axis */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 2.4, 8]} />
            <meshBasicMaterial color="#E2E8F0" transparent opacity={0.3} />
          </mesh>
        </group>
      ) : (
        /* ================= MODE 2: GYROSCOPIC PRECESSION ================= */
        <group>
          {/* Ceiling / Support Stand */}
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>

          {/* Precessing Pivot Arm */}
          <group ref={precessGroupRef} position={[0, 2.35, 0]}>
            {/* Hanging String */}
            <mesh position={[0, -0.55, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 1.1, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.5} />
            </mesh>

            {/* Hanging Axle End */}
            <group position={[0, -1.1, 0]}>
              {/* Ring Hook */}
              <mesh>
                <torusGeometry args={[0.04, 0.01, 12, 24]} />
                <meshStandardMaterial color="#94A3B8" />
              </mesh>

              {/* Horizontal Axle extending outward */}
              <group position={[0.45, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.022, 0.022, 0.9, 16]} />
                  <meshStandardMaterial color="#64748B" metalness={0.8} />
                </mesh>

                {/* The Wheel hanging horizontally */}
                <group rotation={[0, Math.PI / 2, 0]}>
                  <BicycleWheel3D
                    radius={0.55}
                    spinning={wheelSpin > 0.1}
                    spinOmega={wheelSpin}
                    spinAngleRef={spinAngleRef}
                  />

                  {/* Vector L_wheel (pointing along horizontal axle) */}
                  <Arrow3D
                    from={[0, 0, 0]}
                    direction={[0, 0, 1]}
                    length={wheelLMag}
                    color="#F59E0B"
                    label="L (Spin)"
                    labelColor="#B45309"
                  />
                </group>

                {/* Torque Vector τ (tangential horizontal, due to mg * lever) */}
                <Arrow3D
                  from={[0, 0, 0]}
                  direction={[0, 0, 1]}
                  length={0.45}
                  color="#16A34A"
                  label="Torsi τ = r × mg"
                  labelColor="#15803D"
                />

                {/* Downward Gravity Force at CM */}
                <Arrow3D
                  from={[0, 0, 0]}
                  direction={[0, -1, 0]}
                  length={0.4}
                  color="#EF4444"
                  label="Berat (mg)"
                  labelColor="#DC2626"
                />
              </group>

              {/* Precession Angular Velocity Vector Ω_p (vertical UP) */}
              <Arrow3D
                from={[0, 0, 0]}
                direction={[0, 1, 0]}
                length={Math.min(1.2, Math.max(0.3, precessOmega * 1.5))}
                color="#0284C7"
                label="Kecepatan Presesi Ω_p"
                labelColor="#0369A1"
              />
            </group>
          </group>

          {/* Circular Ground Orbit Track of Precession */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.44, 0.46, 64]} />
            <meshBasicMaterial color="#BAE6FD" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function GyroscopeModule() {
  const [mode, setMode] = useState<"chair" | "precession">("chair");
  const [wheelSpin, setWheelSpin] = useState<number>(30); // rad/s
  const [tiltAngle, setTiltAngle] = useState<number>(0); // 0 = UP, 90 = Horiz, 180 = DOWN
  const [wheelMass, setWheelMass] = useState<number>(3.0); // kg
  const [wheelRadius] = useState<number>(0.35); // m
  const [mobileTab, setMobileTab] = useState<"controls" | "calc" | "stats" | "theory">("controls");

  const spinAngleRef = useRef(0);
  const chairAngleRef = useRef(0);
  const precessAngleRef = useRef(0);

  // Wheel Moment of Inertia I_w = m * r^2 (thin rim hoop)
  const I_wheel = wheelMass * wheelRadius * wheelRadius;
  const L_wheel = I_wheel * wheelSpin;

  // Person + Chair Inertia
  const I_chair = 2.8; // kg·m²

  // In Chair Mode: Initial condition: at tilt = 0°, chair is stationary, L_total_y = +L_wheel.
  // When tilted to angle θ, L_wheel_y = L_wheel * cos(θ).
  // Conserving total vertical angular momentum:
  // L_chair_y + L_wheel * cos(θ) = L_wheel
  // => L_chair_y = L_wheel * (1 - cos(θ))
  // => omega_chair = L_chair_y / I_chair
  const tiltRad = (tiltAngle * Math.PI) / 180;
  const L_chair = L_wheel * (1 - Math.cos(tiltRad));
  const chairOmega = L_chair / I_chair;

  // In Precession Mode:
  // Distance from suspension string to wheel CM: d = 0.45 m
  const d = 0.45;
  const g = 9.8;
  const torque = wheelMass * g * d;
  // Precession speed Omega_p = tau / L_wheel = (m g d) / (I_w * omega_s)
  const precessOmega = wheelSpin > 0.5 ? Math.min(2.5, torque / Math.max(0.05, L_wheel)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
      {/* 3D Scene Viewport (Sticky on Scroll) */}
      <div className="lg:col-span-8 flex flex-col gap-2.5 sticky top-[68px] sm:top-[74px] z-20 self-start bg-[#F7F9FC] pb-1.5">
        <div className="relative h-[260px] sm:h-[380px] lg:h-[480px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E5E7EB] bg-[#F8FAFC] shadow-xs">
          <SceneShell
            camera={{
              position: mode === "chair" ? [3.2, 2.4, 4.2] : [2.6, 2.8, 3.8],
              fov: 42,
            }}
          >
            <Scene
              mode={mode}
              wheelSpin={wheelSpin}
              tiltAngleDeg={tiltAngle}
              chairOmega={chairOmega}
              precessOmega={precessOmega}
              spinAngleRef={spinAngleRef}
              chairAngleRef={chairAngleRef}
              precessAngleRef={precessAngleRef}
            />
          </SceneShell>

          {/* Mode Switch Floating Pill */}
          <div className="absolute top-4 left-4 z-10 flex gap-2 rounded-2xl bg-white/90 p-1.5 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                sound.playPop(520);
                triggerHaptic("light");
                setMode("chair");
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-heading font-bold transition ${
                mode === "chair"
                  ? "bg-[#1CB0F6] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🪑 Kursi Putar & Kemudi
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop(580);
                triggerHaptic("light");
                setMode("precession");
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-heading font-bold transition ${
                mode === "precession"
                  ? "bg-[#58CC02] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🚲 Presesi Roda Gantung
            </button>
          </div>

          {/* Quick HUD Readout */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 p-3 shadow-md border-2 border-[#E5E7EB] backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#F59E0B] animate-ping" />
              <span className="text-xs font-extrabold text-slate-700">
                {mode === "chair"
                  ? `Kursi Berputar: ${chairOmega.toFixed(2)} rad/s`
                  : `Kecepatan Presesi: ${precessOmega.toFixed(2)} rad/s`}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playWhoosh();
                  setWheelSpin(wheelSpin > 5 ? 0 : 35);
                }}
                className={`btn-duo px-3 py-1 text-xs ${
                  wheelSpin > 5 ? "btn-duo-coral" : "btn-duo-green"
                }`}
              >
                {wheelSpin > 5 ? "Hentikan Roda 🛑" : "Putar Kencang 🌀"}
              </button>
            </div>
          </div>
        </div>

        {/* Mascot Explainer (Desktop always visible) */}
        <div className="hidden lg:block">
          <Mascot
            mood="spinning"
            quote={
              mode === "chair"
                ? "Coba balikkan roda 180° ke bawah! Kursimu tiba-tiba berputar searah jarum jam dengan cepat! Kenapa? Karena momentum sudut total vertikal harus tetap kekal!"
                : "Ajaib kan? Roda yang berputar kencang tidak jatuh ke bawah meskipun cuma digantung tali di satu ujung! Gravitasi malah membuatnya berpresesi memutar secara horizontal!"
            }
            tip={
              mode === "chair"
                ? "Ketika roda dibalik dari +L menjadi -L, kursi harus berputar dengan momentum +2L agar jumlah akhirnya tetap sama dengan kondisi awal (+L)."
                : "Semakin kencang kamu memutar roda sepeda (ω besar), gerakan presesinya justru semakin lambat! (Ω_p = τ / L)."
            }
            mission={
              mode === "chair"
                ? {
                    text: "Balikkan orientasi roda hingga 180° (menghadap ke bawah)!",
                    actionLabel: "Balik 180° Sekarang 🔄",
                    onAction: () => setTiltAngle(180),
                  }
                : {
                    text: "Percepat putaran roda sepeda hingga 45 rad/s!",
                    actionLabel: "Gas 45 rad/s 🚀",
                    onAction: () => setWheelSpin(45),
                  }
            }
          />
        </div>
      </div>

      {/* Control & Telemetry Panel (Mobile Tabbed, Desktop Multi-Column) */}
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
          <Panel
            title="Kontrol Eksperimen"
            icon="🎛️"
            badge={mode === "chair" ? "Modus Kursi" : "Modus Presesi"}
          >
            <div className="space-y-3">
              {mode === "chair" ? (
                <>
                  <Slider
                    label="Kemiringan Roda (Tilt Angle)"
                    value={tiltAngle}
                    min={0}
                    max={180}
                    step={5}
                    unit="°"
                    accent="sky"
                    onChange={setTiltAngle}
                    hint="0° = Atas · 90° = Horisontal · 180° = Bawah"
                    quickPicks={[
                      { label: "0° (Tegak)", val: 0 },
                      { label: "90° (Miring)", val: 90 },
                      { label: "180° (Balik)", val: 180 },
                    ]}
                  />
                  <Slider
                    label="Kecepatan Putar Roda (ω_roda)"
                    value={wheelSpin}
                    min={0}
                    max={50}
                    step={2}
                    unit="rad/s"
                    accent="amber"
                    onChange={setWheelSpin}
                  />
                </>
              ) : (
                <>
                  <Slider
                    label="Kecepatan Spin Roda (ω_spin)"
                    value={wheelSpin}
                    min={5}
                    max={60}
                    step={2}
                    unit="rad/s"
                    accent="green"
                    onChange={setWheelSpin}
                    hint="Makin cepat spin roda, presesi makin lambat & stabil"
                    quickPicks={[
                      { label: "Pelan (10)", val: 10 },
                      { label: "Sedang (30)", val: 30 },
                      { label: "Ngebut (55)", val: 55 },
                    ]}
                  />
                  <Slider
                    label="Massa Roda Sepeda (m)"
                    value={wheelMass}
                    min={1.5}
                    max={6.0}
                    step={0.5}
                    unit="kg"
                    accent="rose"
                    onChange={setWheelMass}
                  />
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* Section 2: Step-by-Step Calculation */}
        <div className={`${mobileTab === "calc" ? "block" : "hidden"} lg:block space-y-3`}>
          {mode === "chair" ? (
            <StepCalculation
              diketahui={[
                { symbol: "I_{\\text{kursi}}", value: I_chair.toFixed(2), unit: "kg·m²", desc: "Inersia Kursi+Orang" },
                { symbol: "m_{\\text{roda}}", value: wheelMass.toFixed(1), unit: "kg", desc: "Massa Roda Sepeda" },
                { symbol: "R", value: wheelRadius.toFixed(2), unit: "m", desc: "Radius Pelek" },
                { symbol: "\\omega_{\\text{roda}}", value: wheelSpin.toFixed(1), unit: "rad/s", desc: "Kec. Sudut Roda" },
                { symbol: "\\theta", value: `${tiltAngle}°`, unit: "", desc: "Sudut Balik Roda" },
              ]}
              ditanya={{
                symbol: "\\omega_{\\text{kursi}}",
                desc: "Kecepatan Putaran Kursi Akibat Balikan Roda",
                unit: "rad/s",
              }}
              langkah={[
                {
                  step: "Hitung Momen Inersia & Momentum Roda",
                  formula: "I_{\\text{roda}} = mR^2 ,\\quad L_{\\text{roda}} = I_{\\text{roda}} \\omega",
                  substitution: `I_{\\text{roda}} = ${wheelMass.toFixed(1)} \\times (${wheelRadius.toFixed(2)})^2 = ${I_wheel.toFixed(3)},\\; L = ${L_wheel.toFixed(2)}`,
                  result: `L_{\\text{roda}} = ${L_wheel.toFixed(2)} kg·m²/s`,
                  explanation: "Roda sepeda diasumsikan sebagai silinder tipis berongga (cincin tipis).",
                },
                {
                  step: "Terapkan Kekekalan Momentum Sudut Vertikal",
                  formula: "L_{\\text{awal}} = L_{\\text{akhir}} \\Rightarrow +L_{\\text{roda}} = L_{\\text{kursi}} + L_{\\text{roda}}\\cos\\theta",
                  substitution: `L_{\\text{kursi}} = ${L_wheel.toFixed(2)} \\times (1 - \\cos(${tiltAngle}^\\circ))`,
                  result: `L_{\\text{kursi}} = ${L_chair.toFixed(2)} kg·m²/s`,
                  explanation: "Saat roda dibalik 180° (cos 180° = -1), kursi harus berputar dengan momentum 2 kali lipat roda!",
                },
                {
                  step: "Peroleh Kecepatan Sudut Kursi Putar",
                  formula: "\\omega_{\\text{kursi}} = \\dfrac{L_{\\text{kursi}}}{I_{\\text{kursi}}}",
                  substitution: `\\omega_{\\text{kursi}} = \\dfrac{${L_chair.toFixed(2)}}{${I_chair.toFixed(2)}}`,
                  result: `\\omega_{\\text{kursi}} = ${chairOmega.toFixed(2)} rad/s`,
                  explanation: "Tubuh dan kursi berputar secara spontan tanpa perlu dorongan lantai!",
                },
              ]}
            />
          ) : (
            <StepCalculation
              diketahui={[
                { symbol: "m", value: wheelMass.toFixed(1), unit: "kg", desc: "Massa Roda" },
                { symbol: "d", value: d.toFixed(2), unit: "m", desc: "Jarak Tali ke CM" },
                { symbol: "g", value: g.toFixed(1), unit: "m/s²", desc: "Gravitasi" },
                { symbol: "\\omega_s", value: wheelSpin.toFixed(1), unit: "rad/s", desc: "Kec. Spin Roda" },
              ]}
              ditanya={{
                symbol: "\\Omega_p",
                desc: "Kecepatan Sudut Presesi Horizontal",
                unit: "rad/s",
              }}
              langkah={[
                {
                  step: "Hitung Torsi Gravitasi Luar (τ)",
                  formula: "\\tau = r \\times mg = d \\cdot m \\cdot g",
                  substitution: `\\tau = ${d} \\times ${wheelMass.toFixed(1)} \\times ${g}`,
                  result: `\\tau = ${torque.toFixed(2)} N·m`,
                  explanation: "Torsi mengarah horizontal tegak lurus terhadap poros roda.",
                },
                {
                  step: "Hitung Momentum Sudut Spin Roda (L)",
                  formula: "L = I_{\\text{roda}} \\omega_s = m R^2 \\omega_s",
                  substitution: `L = ${I_wheel.toFixed(3)} \\times ${wheelSpin.toFixed(1)}`,
                  result: `L = ${L_wheel.toFixed(2)} kg·m²/s`,
                  explanation: "Spin berkecepatan tinggi menciptakan kestabilan giroskopik masif.",
                },
                {
                  step: "Hitung Kecepatan Sudut Presesi (Ω_p)",
                  formula: "\\Omega_p = \\dfrac{\\tau}{L} = \\dfrac{mgd}{I\\omega_s}",
                  substitution: `\\Omega_p = \\dfrac{${torque.toFixed(2)}}{${L_wheel.toFixed(2)}}`,
                  result: `\\Omega_p = ${precessOmega.toFixed(2)} rad/s`,
                  explanation: "Makin cepat spin roda (ω_s tinggi), gerakan presesi Ω_p justru semakin lambat!",
                },
              ]}
            />
          )}
        </div>

        {/* Section 3: Stats & Telemetry */}
        <div className={`${mobileTab === "stats" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="L Roda Sepeda"
              value={L_wheel.toFixed(2)}
              unit="kg·m²/s"
              color="amber"
              sublabel="L = I_roda · ω"
            />
            {mode === "chair" ? (
              <StatCard
                label="Kecepatan Kursi"
                value={chairOmega.toFixed(2)}
                unit="rad/s"
                color="purple"
                sublabel="Dihasilkan dari balikan roda"
              />
            ) : (
              <StatCard
                label="Laju Presesi Ω_p"
                value={precessOmega.toFixed(2)}
                unit="rad/s"
                color="sky"
                sublabel="Ω = τ / L_roda"
              />
            )}
          </div>
        </div>

        {/* Section 4: Theory & Mascot on Mobile */}
        <div className={`${mobileTab === "theory" ? "block" : "hidden"} lg:block space-y-3`}>
          <div className="lg:hidden">
            <Mascot
              mood="spinning"
              quote={
                mode === "chair"
                  ? "Coba balikkan roda 180° ke bawah! Kursimu tiba-tiba berputar searah jarum jam dengan cepat! Kenapa? Karena momentum sudut total vertikal harus tetap kekal!"
                  : "Ajaib kan? Roda yang berputar kencang tidak jatuh ke bawah meskipun cuma digantung tali di satu ujung! Gravitasi malah membuatnya berpresesi memutar secara horizontal!"
              }
              tip={
                mode === "chair"
                  ? "Ketika roda dibalik dari +L menjadi -L, kursi harus berputar dengan momentum +2L agar jumlah akhirnya tetap sama (+L)."
                  : "Semakin kencang kamu memutar roda sepeda (ω besar), gerakan presesinya justru semakin lambat! (Ω_p = τ / L)."
              }
            />
          </div>

          <Panel title="Penjelasan Rumus & Analisis" icon="📐">
            {mode === "chair" ? (
              <div className="space-y-2 text-xs">
                <FBlock
                  tex="L_{\text{total}, y} = L_{\text{kursi}} + L_{\text{roda}}\cos\theta = \text{konstan}"
                  label="Kekekalan L Vertikal"
                  explanation="Karena tidak ada torsi luar pada sumbu vertikal, total L vertikal selalu sama dengan kondisi mula-mula."
                />
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <FBlock
                  tex="\Omega_p = \dfrac{\tau}{L} = \dfrac{mgd}{I\omega_s}"
                  label="Kecepatan Presesi"
                  explanation="Makin cepat spin roda (ω_s tinggi), kecepatan presesi Ω_p justru makin lambat!"
                />
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
