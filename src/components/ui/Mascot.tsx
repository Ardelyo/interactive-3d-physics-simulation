import { useState } from "react";
import { sound, triggerHaptic } from "../../utils/audio";
import confetti from "canvas-confetti";

interface MascotProps {
  mood?: "happy" | "thinking" | "amazed" | "spinning";
  quote: string;
  tip?: string;
  mission?: {
    text: string;
    actionLabel: string;
    onAction: () => void;
  };
}

export function Mascot({ mood = "happy", quote, tip, mission }: MascotProps) {
  const [bouncing, setBouncing] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const handleClickMascot = () => {
    sound.playPop(620);
    triggerHaptic("medium");
    setBouncing(true);
    setTimeout(() => setBouncing(false), 500);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ["#58CC02", "#FFC800", "#1CB0F6"],
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 rounded-2xl border-2 border-[#E5E7EB] bg-white p-4 shadow-[0_4px_0_0_#E5E7EB]">
      {/* Interactive Mascot Avatar */}
      <button
        type="button"
        onClick={handleClickMascot}
        className={`relative shrink-0 transition-transform cursor-pointer focus:outline-none ${
          bouncing ? "scale-115 rotate-6" : "hover:scale-105"
        }`}
        title="Klik aku untuk semangat!"
      >
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-b from-[#58CC02] to-[#46A302] p-1.5 shadow-[0_3px_0_0_#388300] flex items-center justify-center">
          {/* Owl / Prof Piko Mascot Vector SVG */}
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {/* Feathers / Body */}
            <circle cx="50" cy="55" r="38" fill="#58CC02" />
            <path
              d="M30 45 C30 75, 70 75, 70 45 C65 65, 35 65, 30 45 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />

            {/* Belly patch */}
            <ellipse cx="50" cy="62" rx="22" ry="18" fill="#FFFFFF" />

            {/* Glasses frame (Science Owl) */}
            <circle cx="37" cy="44" r="14" fill="#FFFFFF" stroke="#2D3748" strokeWidth="3" />
            <circle cx="63" cy="44" r="14" fill="#FFFFFF" stroke="#2D3748" strokeWidth="3" />
            <line x1="49" y1="44" x2="51" y2="44" stroke="#2D3748" strokeWidth="3" />

            {/* Eyes */}
            <circle cx="38" cy="44" r="6" fill="#1E293B" />
            <circle cx="62" cy="44" r="6" fill="#1E293B" />
            {/* Eye reflections */}
            <circle cx="40" cy="42" r="2.2" fill="#FFFFFF" />
            <circle cx="64" cy="42" r="2.2" fill="#FFFFFF" />

            {/* Orange Beak */}
            <polygon points="46,50 54,50 50,58" fill="#FF9600" />

            {/* Graduation Cap / Propeller */}
            <polygon points="50,14 74,22 50,30 26,22" fill="#1CB0F6" />
            <rect x="42" y="26" width="16" height="6" fill="#0284C7" rx="2" />
            <circle cx="50" cy="22" r="3" fill="#FFC800" />
            <line x1="50" y1="22" x2="68" y2="28" stroke="#FFC800" strokeWidth="2" strokeLinecap="round" />
            <circle cx="68" cy="28" r="2" fill="#FF9600" />

            {/* Cheerful blush */}
            <ellipse cx="28" cy="52" rx="4" ry="2.5" fill="#FF4B4B" opacity="0.35" />
            <ellipse cx="72" cy="52" rx="4" ry="2.5" fill="#FF4B4B" opacity="0.35" />
          </svg>

          {/* Sparkle badge */}
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#FFC800] px-1.5 py-0.2 text-[9px] font-extrabold text-[#78350F] shadow border border-white">
            PRO
          </span>
        </div>
      </button>

      {/* Speech Bubble */}
      <div className="relative flex-1 rounded-2xl border-2 border-[#E5E7EB] bg-[#F8FAFC] p-3 text-slate-800">
        {/* Little triangle arrow pointing to mascot */}
        <div className="hidden sm:block absolute -left-2 top-6 h-3 w-3 rotate-45 border-b-2 border-l-2 border-[#E5E7EB] bg-[#F8FAFC]" />

        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#E2E8F0] pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-xs font-bold text-[#16A34A]">
              🦉 Prof. Piko (Teman Belajarmu)
            </span>
          </div>
          {tip && (
            <button
              type="button"
              onClick={() => {
                sound.playPop(500);
                setShowTip(!showTip);
              }}
              className="text-[11px] font-extrabold text-[#0284C7] hover:underline cursor-pointer"
            >
              {showTip ? "Tutup Tips" : "💡 Ada Tips Rahasia!"}
            </button>
          )}
        </div>

        {/* Main Quote */}
        <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
          {quote}
        </p>

        {/* Secret Tip Reveal */}
        {showTip && tip && (
          <div className="mt-2 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-2 text-xs text-[#0369A1] font-medium animate-pop-in">
            🎯 <strong>Rahasia Fisika:</strong> {tip}
          </div>
        )}

        {/* Interactive Mission */}
        {mission && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2">
            <span className="text-xs font-extrabold text-slate-600">
              ⚡ <strong>Misi Kamu:</strong> {mission.text}
            </span>
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                mission.onAction();
              }}
              className="btn-duo btn-duo-green px-3 py-1 text-xs"
            >
              {mission.actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
