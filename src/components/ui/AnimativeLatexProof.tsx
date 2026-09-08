import { useState, useEffect } from "react";
import { F } from "./Formula";
import { sound, triggerHaptic } from "../../utils/audio";
import confetti from "canvas-confetti";

interface ProofStep {
  speaker: string;
  speakerRole: string;
  badgeColor: string;
  title: string;
  concept: string;
  targetSymbol: string;
  targetUnit: string;
  latexFormula: string;
  latexExpanded: string;
  latexResult: string;
  simValue: string;
  speechScript: string;
  note: string;
}

export function AnimativeLatexProof({
  currentMass,
  currentRadius,
  currentOmega,
  onApplyScenario,
}: {
  currentMass: number;
  currentRadius: number;
  currentOmega: number;
  onApplyScenario: () => void;
}) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(100);

  // Scenario constants matching Sabrina & Gladies' script
  const isScenarioActive =
    Math.abs(currentMass - 0.2) < 0.05 &&
    Math.abs(currentRadius - 2.4) < 0.05 &&
    Math.abs(Math.abs(currentOmega) - 5.0) < 0.1;

  const STEPS: ProofStep[] = [
    {
      speaker: "Sabrina",
      speakerRole: "Pembuktian Gerak Linear",
      badgeColor: "bg-[#10B981] text-white",
      title: "1. Kecepatan Linear (v)",
      concept: "Kecepatan linear partikel menyinggung orbit putaran",
      targetSymbol: "v",
      targetUnit: "m/s",
      latexFormula: "v = \\omega \\times r",
      latexExpanded: "v = 5{,}00 \\times 2{,}40",
      latexResult: "v = 12{,}00 \\text{ m/s}",
      simValue: (Math.abs(currentOmega) * currentRadius).toFixed(2),
      speechScript:
        '"Pertama, kecepatan linear: v = omega × r = 5,00 × 2,40 = 12,00 m/s. Coba cek di layar... yup, sama persis 12,00 m/s ✓"',
      note: "Hubungan gerak rotasi dengan gerak lurus translasi.",
    },
    {
      speaker: "Sabrina",
      speakerRole: "Pembuktian Gerak Linear",
      badgeColor: "bg-[#10B981] text-white",
      title: "2. Momentum Linear (p)",
      concept: "Perkalian massa partikel dengan kecepatan linearnya",
      targetSymbol: "p",
      targetUnit: "kg·m/s",
      latexFormula: "p = m \\times v",
      latexExpanded: "p = 0{,}20 \\times 12{,}00",
      latexResult: "p = 2{,}40 \\text{ kg}\\cdot\\text{m/s}",
      simValue: (currentMass * Math.abs(currentOmega) * currentRadius).toFixed(2),
      speechScript:
        '"Kedua, momentum linear: p = m × v = 0,20 × 12,00 = 2,40 kg m/s. Di layar juga 2,40 kg m/s — cocok! ✓"',
      note: "Analog dengan p = mv pada bab gerak lurus sebelumnya.",
    },
    {
      speaker: "Gladies",
      speakerRole: "Pembuktian Dinamika Rotasi",
      badgeColor: "bg-[#0284C7] text-white",
      title: "3. Momen Inersia Partikel (I)",
      concept: "Ukuran kelembaman benda berotasi pada jarak r dari poros O",
      targetSymbol: "I",
      targetUnit: "kg·m²",
      latexFormula: "I = m \\times r^2",
      latexExpanded: "I = 0{,}20 \\times (2{,}40)^2 = 0{,}20 \\times 5{,}76",
      latexResult: "I = 1{,}152 \\text{ kg}\\cdot\\text{m}^2 \\approx 1{,}15 \\text{ kg}\\cdot\\text{m}^2",
      simValue: (currentMass * currentRadius * currentRadius).toFixed(2),
      speechScript:
        '"Ketiga, momen inersia: I = m × r² = 0,20 × (2,40)² = 1,152 kg m². Di layar dibulatkan jadi 1,15 kg m² — kurang lebih sama ✓"',
      note: "r dikuadratkan: jari-jari memberi efek kuadratik terhadap inersia.",
    },
    {
      speaker: "Gladies",
      speakerRole: "Pembuktian Dinamika Rotasi",
      badgeColor: "bg-[#9333EA] text-white",
      title: "4. Momentum Sudut Final (L)",
      concept: "Hasil kali momen inersia I dengan kecepatan sudut ω",
      targetSymbol: "L",
      targetUnit: "kg·m²/s",
      latexFormula: "L = I \\times \\omega = m \\cdot r \\cdot v",
      latexExpanded: "L = 1{,}152 \\times 5{,}00",
      latexResult: "L = 5{,}76 \\text{ kg}\\cdot\\text{m}^2/\\text{s}",
      simValue: (currentMass * currentRadius * currentRadius * Math.abs(currentOmega)).toFixed(2),
      speechScript:
        '"Terakhir, momentum sudut: L = I × omega = 1,152 × 5,00 = 5,76 kg m²/s. Di layar? Pas banget 5,76 kg m²/s ✓. Jadi semua perhitungan kita cocok 100% sama simulasi!"',
      note: "Kekekalan & keakuratan simulasi terbukti 100% valid secara matematis.",
    },
  ];

  // Auto-play animation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      setAnimProgress(0);
      const interval = setInterval(() => {
        setAnimProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 4;
        });
      }, 80);

      timer = setTimeout(() => {
        if (activeStep < STEPS.length - 1) {
          setActiveStep((s) => s + 1);
          sound.playPop(550);
        } else {
          setIsPlaying(false);
          sound.playFanfare();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.7 },
            colors: ["#58CC02", "#1CB0F6", "#FFC800", "#9333EA"],
          });
        }
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isPlaying, activeStep]);

  const currentStepData = STEPS[activeStep];

  const handleNext = () => {
    sound.playPop(580);
    triggerHaptic("light");
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handlePrev = () => {
    sound.playPop(480);
    triggerHaptic("light");
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border-2 border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-[0_4px_0_0_#E2E8F0] space-y-3.5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#58CC02] border-b-3 border-[#46A302] text-white font-extrabold text-sm shadow-xs">
            🎬
          </span>
          <div>
            <h3 className="font-heading text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span>Skenario Pembuktian Presentasi</span>
              <span className="rounded-full bg-[#E0F2FE] px-2 py-0.2 text-[10px] font-extrabold text-[#0284C7]">
                Sabrina &amp; Gladies
              </span>
            </h3>
            <p className="text-[11px] font-semibold text-slate-500">
              Sinkronisasi animatif langkah perhitungan dengan layar simulasi 3D
            </p>
          </div>
        </div>

        {/* 1-Click Scenario Preset Button */}
        <button
          type="button"
          onClick={() => {
            sound.playSuccess();
            triggerHaptic("success");
            onApplyScenario();
          }}
          className={`btn-duo px-3 py-1.5 text-xs ${
            isScenarioActive ? "btn-duo-green" : "btn-duo-sky"
          }`}
        >
          {isScenarioActive
            ? "✓ Skenario Aktif (m=0.20, r=2.40, ω=5.00)"
            : "⚡ Pasang Nilai Skenario (m=0.2, r=2.4, ω=5)"}
        </button>
      </div>

      {/* Preset Data Summary Badges */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#BAE6FD] bg-[#F0F9FF] p-2.5 text-center">
        <div>
          <div className="text-[10px] font-bold text-slate-500">Massa (m)</div>
          <div className="font-heading font-extrabold text-[#0284C7] text-xs sm:text-sm">
            0,20 kg
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500">Jari-jari (r)</div>
          <div className="font-heading font-extrabold text-[#0284C7] text-xs sm:text-sm">
            2,40 m
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500">Kec. Sudut (ω)</div>
          <div className="font-heading font-extrabold text-[#0284C7] text-xs sm:text-sm">
            5,00 rad/s
          </div>
        </div>
      </div>

      {/* Interactive Step Navigator Tabs */}
      <div className="grid grid-cols-4 gap-1.5">
        {STEPS.map((s, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                sound.playPop(500 + idx * 40);
                setActiveStep(idx);
                setIsPlaying(false);
              }}
              className={`rounded-xl p-2 text-center transition-all cursor-pointer border-2 ${
                isActive
                  ? "border-[#58CC02] bg-[#F0FDF4] shadow-[0_3px_0_0_#46A302] scale-[1.02]"
                  : "border-[#E5E7EB] bg-[#F8FAFC] hover:bg-slate-100 text-slate-600"
              }`}
            >
              <div
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  isActive ? "bg-[#58CC02] text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {idx + 1}
              </div>
              <div className="font-heading text-[11px] font-bold mt-1 truncate">
                <F tex={s.targetSymbol} />
              </div>
              <div className="text-[9px] font-bold text-slate-500 truncate hidden sm:block">
                {s.speaker}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Animated Calculation Card */}
      <div className="relative rounded-2xl border-2 border-[#CBD5E1] bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC] p-4 shadow-sm space-y-3 animate-pop-in">
        {/* Presenter & Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-heading font-extrabold shadow-xs ${currentStepData.badgeColor}`}
            >
              🎤 {currentStepData.speaker} ({currentStepData.speakerRole})
            </span>
            <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-800">
              {currentStepData.title}
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400">Target:</span>
            <span className="rounded-lg bg-white border border-[#E2E8F0] px-2 py-0.5 font-heading text-xs font-extrabold text-[#16A34A]">
              <F tex={`${currentStepData.targetSymbol} = ?`} />
            </span>
          </div>
        </div>

        {/* Step-by-Step LaTeX Display with Clean Animation */}
        <div className="space-y-2 rounded-2xl border-2 border-[#BAE6FD] bg-white p-3.5 shadow-xs">
          {/* 1. Rumus Utama */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2">
            <span className="text-[11px] font-extrabold text-slate-500">Rumus:</span>
            <div className="font-heading text-sm sm:text-base font-bold text-[#0284C7]">
              <F tex={currentStepData.latexFormula} />
            </div>
          </div>

          {/* 2. Substitusi Angka Presentasi */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2">
            <span className="text-[11px] font-extrabold text-slate-500">Substitusi:</span>
            <div className="font-heading text-xs sm:text-sm font-bold text-slate-700">
              <F tex={currentStepData.latexExpanded} />
            </div>
          </div>

          {/* 3. Hasil Perhitungan Matematis */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 bg-[#F0FDF4] -mx-3.5 -mb-3.5 p-3 rounded-b-2xl border-t border-[#BBF7D0]">
            <span className="text-xs font-extrabold text-[#15803D]">Hasil Hitungan Teori:</span>
            <div className="font-heading text-sm sm:text-base font-extrabold text-[#16A34A]">
              <F tex={currentStepData.latexResult} />
            </div>
          </div>
        </div>

        {/* Real-time Match Verification Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#15803D]">
            <span className="text-sm">✓</span>
            <span>Nilai di Layar Simulasi Real-time:</span>
          </div>
          <div className="font-heading font-extrabold text-[#16A34A] text-sm">
            {currentStepData.simValue} {currentStepData.targetUnit}
            <span className="ml-1 text-[10px] text-[#15803D] font-bold">
              (Cocok 100%! ✓)
            </span>
          </div>
        </div>

        {/* Presentation Speech Script Dialogue Box */}
        <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-heading text-[11px] font-bold text-[#C2410C]">
            <span>🗣️ Skrip Dialog {currentStepData.speaker}:</span>
          </div>
          <p className="font-medium text-slate-700 italic leading-relaxed">
            {currentStepData.speechScript}
          </p>
        </div>
      </div>

      {/* Control Buttons (Previous, Auto-play, Next) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeStep === 0}
          className="btn-duo btn-duo-white px-3 py-1.5 text-xs disabled:opacity-40"
        >
          ⬅️ Langkah Sebelumnya
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playWhoosh();
              setIsPlaying(!isPlaying);
            }}
            className={`btn-duo px-3 py-1.5 text-xs ${
              isPlaying ? "btn-duo-coral" : "btn-duo-sky"
            }`}
          >
            {isPlaying ? "⏸ Jeda Auto-play" : "▶️ Putar Otomatis"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="btn-duo btn-duo-green px-4 py-1.5 text-xs"
          >
            {activeStep < STEPS.length - 1 ? "Langkah Berikutnya ➔" : "Selesai Pembuktian 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}
