import { useState } from "react";
import ParticleModule from "./modules/ParticleModule";
import TorqueModule from "./modules/TorqueModule";
import SkaterModule from "./modules/SkaterModule";
import GyroscopeModule from "./modules/GyroscopeModule";
import StoolModule from "./modules/StoolModule";
import DiverModule from "./modules/DiverModule";
import KeplerModule from "./modules/KeplerModule";
import { SummaryModal } from "./components/ui/SummaryModal";
import { QuizModal } from "./components/ui/QuizModal";
import { sound } from "./utils/audio";
import { cn } from "./utils/cn";

const TABS = [
  {
    id: "particle",
    label: "1. Momentum Sudut Partikel",
    short: "Partikel",
    icon: "🎯",
    desc: "Kaidah Tangan Kanan & Vektor L = r × p",
    accent: "sky",
    Component: ParticleModule,
  },
  {
    id: "torque",
    label: "2. Torsi & Impuls Sudut",
    short: "Torsi & Impuls",
    icon: "🔧",
    desc: "Hukum II Rotasi: τ = ΔL / Δt pada Roda Gaya",
    accent: "coral",
    Component: TorqueModule,
  },
  {
    id: "skater",
    label: "3. Penari Balet Berputar",
    short: "Penari Balet",
    icon: "🩰",
    desc: "Kekekalan L: Tangan Direntangkan vs Didekapkan",
    accent: "green",
    Component: SkaterModule,
  },
  {
    id: "gyroscope",
    label: "4. Giroskop & Roda Sepeda",
    short: "Giroskop",
    icon: "🚲",
    desc: "Kemudi Kursi Putar & Presesi Roda Sepeda Gantung",
    accent: "purple",
    Component: GyroscopeModule,
  },
  {
    id: "stool",
    label: "5. Kursi Putar + Beban",
    short: "Kursi Putar",
    icon: "🪑",
    desc: "Verifikasi Kuantitatif Presisi Numerik L₁ = L₂",
    accent: "yellow",
    Component: StoolModule,
  },
  {
    id: "diver",
    label: "6. Loncat Indah 10m",
    short: "Loncat Indah",
    icon: "🤸",
    desc: "Meringkuk (Tuck) & Salto Bebas Torsi Luar di Udara",
    accent: "sky",
    Component: DiverModule,
  },
  {
    id: "kepler",
    label: "7. Orbit Planet (Kepler II)",
    short: "Orbit Kepler",
    icon: "🪐",
    desc: "Gaya Sentral Radial Gravitasi Matahari (τ = 0)",
    accent: "green",
    Component: KeplerModule,
  },
] as const;

export default function App() {
  const [activeId, setActiveId] = useState<(typeof TABS)[number]["id"]>("skater");
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isEnabled());
  const [xp, setXp] = useState<number>(180);

  const active = TABS.find((t) => t.id === activeId) || TABS[0];
  const ActiveComponent = active.Component;

  const handleTabChange = (id: (typeof TABS)[number]["id"]) => {
    sound.playPop(500);
    setActiveId(id);
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const handleEarnXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col font-sans">
      {/* Duolingo Playful Top Header */}
      <header className="sticky top-0 z-30 border-b-2 border-[#E5E7EB] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-3 py-2.5 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] text-xl text-white shadow-sm">
              🌀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                  SpinLab 3D
                </span>
                <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-extrabold text-[#0284C7] border border-[#BAE6FD]">
                  Fisika XI
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                Momentum Sudut &amp; Hukum Kekekalannya · Dinamika Rotasi
              </p>
            </div>
          </div>

          {/* Gamification Stats & Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 rounded-xl border-2 border-[#FEF08A] bg-[#FEFCE8] px-2.5 py-1 shadow-xs">
              <span className="text-sm">🔥</span>
              <span className="font-heading text-xs font-bold text-[#A16207]">3 Hari</span>
            </div>

            {/* Gems / Lingots */}
            <div className="hidden md:flex items-center gap-1 rounded-xl border-2 border-[#BAE6FD] bg-[#F0F9FF] px-2.5 py-1 shadow-xs">
              <span className="text-sm">💎</span>
              <span className="font-heading text-xs font-bold text-[#0369A1]">140</span>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-1 rounded-xl border-2 border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 shadow-xs">
              <span className="text-sm">⚡</span>
              <span className="font-heading text-xs font-bold text-[#15803D]">{xp} XP</span>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E5E7EB] bg-white text-base hover:bg-slate-50 transition cursor-pointer"
              title={soundEnabled ? "Matikan Suara" : "Nyalakan Suara"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Formula Reference Button */}
            <button
              type="button"
              onClick={() => {
                sound.playPop(520);
                setShowSummary(true);
              }}
              className="btn-duo btn-duo-white px-3 py-1.5 text-xs hidden sm:inline-flex"
            >
              📖 Rumus LaTeX
            </button>

            {/* Quiz Challenge Button */}
            <button
              type="button"
              onClick={() => {
                sound.playPop(620);
                setShowQuiz(true);
              }}
              className="btn-duo btn-duo-green px-3.5 py-1.5 text-xs"
            >
              🏆 Tantangan Kuis
            </button>
          </div>
        </div>

        {/* Tactile 3D Tabs Scrollbar */}
        <div className="border-t border-[#F1F5F9] bg-[#FAFAFA]">
          <div className="mx-auto flex max-w-[1550px] gap-2 overflow-x-auto px-3 py-2 sm:px-6 no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer",
                    isActive
                      ? "btn-duo btn-duo-sky text-white shadow-sm"
                      : "bg-white border-2 border-[#E5E7EB] text-slate-600 hover:border-[#CBD5E1]"
                  )}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Simulation Workspace */}
      <main className="flex-1 mx-auto w-full max-w-[1550px] px-3 py-4 sm:px-6">
        {/* Module Title Bar */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border-2 border-[#E5E7EB] text-base shadow-xs">
              {active.icon}
            </span>
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-800">
                {active.label}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {active.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSummary(true)}
              className="sm:hidden btn-duo btn-duo-white px-2.5 py-1 text-xs"
            >
              📖 Rumus
            </button>
            <div className="text-[11px] font-bold text-slate-400 hidden lg:inline">
              👆 Geser mouse / 1 jari untuk rotasi 3D · Scroll / cubit untuk zoom
            </div>
          </div>
        </div>

        {/* Active 3D Module Component */}
        <div key={active.id} className="animate-pop-in">
          <ActiveComponent />
        </div>
      </main>

      {/* Duolingo Playful Footer */}
      <footer className="mt-8 border-t-2 border-[#E5E7EB] bg-white px-4 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl space-y-2">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-slate-700">
            <span>🌀 SpinLab 3D</span>
            <span>·</span>
            <span>Fisika SMA/MA Kelas XI (Kurikulum Merdeka / K13)</span>
            <span>·</span>
            <span className="rounded-full bg-[#BBF7D0] px-2 py-0.5 text-[10px] text-[#15803D]">
              Siap Deploy Vercel 🚀
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Laboratorium Fisika Interaktif 3D berbasis perhitungan persamaan gerak rotasi nyata
            (Three.js + React Three Fiber + KaTeX). Desain playful terinspirasi Duolingo untuk
            pengalaman belajar yang seru, mudah dipahami, dan menyenangkan!
          </p>
        </div>
      </footer>

      {/* Popups & Modals */}
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} />
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onEarnXp={handleEarnXp}
      />
    </div>
  );
}
