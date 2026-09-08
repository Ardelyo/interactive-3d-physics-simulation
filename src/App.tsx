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
    label: "Momentum Sudut Partikel",
    short: "Partikel",
    icon: "🎯",
    desc: "Kaidah Tangan Kanan & Vektor L = r × p",
    Component: ParticleModule,
  },
  {
    id: "torque",
    label: "Torsi & Impuls Sudut",
    short: "Torsi & Impuls",
    icon: "🔧",
    desc: "Hukum II Rotasi: τ = ΔL / Δt pada Roda Gaya",
    Component: TorqueModule,
  },
  {
    id: "skater",
    label: "Penari Balet Berputar",
    short: "Penari Balet",
    icon: "🩰",
    desc: "Kekekalan L: Tangan Direntangkan vs Didekapkan",
    Component: SkaterModule,
  },
  {
    id: "gyroscope",
    label: "Giroskop & Roda Sepeda",
    short: "Giroskop",
    icon: "🚲",
    desc: "Kemudi Kursi Putar & Presesi Roda Sepeda Gantung",
    Component: GyroscopeModule,
  },
  {
    id: "stool",
    label: "Kursi Putar + Beban",
    short: "Kursi Putar",
    icon: "🪑",
    desc: "Verifikasi Kuantitatif Presisi Numerik L₁ = L₂",
    Component: StoolModule,
  },
  {
    id: "diver",
    label: "Loncat Indah 10m",
    short: "Loncat Indah",
    icon: "🤸",
    desc: "Meringkuk (Tuck) & Salto Bebas Torsi Luar di Udara",
    Component: DiverModule,
  },
  {
    id: "kepler",
    label: "Orbit Planet (Kepler II)",
    short: "Orbit Kepler",
    icon: "🪐",
    desc: "Gaya Sentral Radial Gravitasi Matahari (τ = 0)",
    Component: KeplerModule,
  },
] as const;

export default function App() {
  const [activeId, setActiveId] = useState<(typeof TABS)[number]["id"]>("particle");
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isEnabled());

  const active = TABS.find((t) => t.id === activeId) || TABS[0];
  const ActiveComponent = active.Component;

  const handleTabChange = (id: (typeof TABS)[number]["id"]) => {
    sound.playPop(520);
    setActiveId(id);
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col font-sans">
      {/* Sleek, Compact Mobile-First Header (No clutter, No fake XP/days) */}
      <header className="sticky top-0 z-30 border-b-2 border-[#E5E7EB] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-3 py-2 sm:px-6">
          {/* Brand Logo & Compact Subtitle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-[#58CC02] border-b-3 border-[#46A302] text-lg sm:text-xl text-white shadow-xs">
              🌀
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-slate-800">
                  SpinLab 3D
                </span>
                <span className="rounded-full bg-[#E0F2FE] px-2 py-0.2 text-[10px] font-extrabold text-[#0284C7] border border-[#BAE6FD]">
                  Fisika XI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 hidden sm:block">
                Momentum Sudut &amp; Hukum Kekekalan Dinamika Rotasi
              </p>
            </div>
          </div>

          {/* Quick Clean Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border-2 border-[#E5E7EB] bg-white text-sm sm:text-base hover:bg-slate-50 transition cursor-pointer"
              title={soundEnabled ? "Matikan Suara" : "Nyalakan Suara"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Formula Reference */}
            <button
              type="button"
              onClick={() => {
                sound.playPop(520);
                setShowSummary(true);
              }}
              className="btn-duo btn-duo-white px-2.5 py-1 text-xs"
            >
              📖 <span className="hidden sm:inline">Rumus</span>
            </button>

            {/* Quiz Challenge */}
            <button
              type="button"
              onClick={() => {
                sound.playPop(620);
                setShowQuiz(true);
              }}
              className="btn-duo btn-duo-green px-3 py-1 text-xs"
            >
              🏆 <span className="hidden sm:inline">Tantangan Kuis</span>
              <span className="sm:hidden">Kuis</span>
            </button>
          </div>
        </div>

        {/* Compact 3D Tab Carousel */}
        <div className="border-t border-[#F1F5F9] bg-[#FAFAFA] py-1.5">
          <div className="mx-auto flex max-w-[1550px] gap-1.5 overflow-x-auto px-3 sm:px-6 no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-heading font-bold transition-all cursor-pointer",
                    isActive
                      ? "btn-duo btn-duo-sky text-white shadow-xs"
                      : "bg-white border-2 border-[#E5E7EB] text-slate-600 hover:border-[#CBD5E1]"
                  )}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Simulation Workspace */}
      <main className="flex-1 mx-auto w-full max-w-[1550px] px-2.5 sm:px-6 py-2.5 sm:py-4">
        {/* Module Sub-Header */}
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-white border-2 border-[#E5E7EB] text-sm sm:text-base shadow-xs">
              {active.icon}
            </span>
            <div>
              <h2 className="font-heading text-sm sm:text-base font-bold text-slate-800 leading-tight">
                {active.label}
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                {active.desc}
              </p>
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400">
            👆 Geser 1 jari rotasi · Cubit zoom
          </div>
        </div>

        {/* Active 3D Module */}
        <div key={active.id} className="animate-pop-in">
          <ActiveComponent />
        </div>
      </main>

      {/* Clean Compact Footer */}
      <footer className="mt-6 border-t-2 border-[#E5E7EB] bg-white px-4 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-2 font-heading font-bold text-slate-600">
          <span>🌀 SpinLab 3D</span>
          <span>·</span>
          <span>Fisika SMA/MA Kelas XI Bab 6</span>
          <span>·</span>
          <span className="text-[#16A34A]">Kekekalan Momentum Sudut</span>
        </div>
      </footer>

      {/* Modals */}
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} />
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onEarnXp={() => {}}
      />
    </div>
  );
}
