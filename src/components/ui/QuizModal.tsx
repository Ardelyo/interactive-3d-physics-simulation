import { useState } from "react";
import { sound, triggerHaptic } from "../../utils/audio";
import confetti from "canvas-confetti";
import { F } from "./Formula";

interface Question {
  id: number;
  scenario: string;
  question: string;
  options: { label: string; text: string; correct: boolean }[];
  explanation: string;
  formula?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    scenario: "🩰 Arena Es: Penari Balet Berputar",
    question: "Saat penari balet menarik kedua lengannya rapat ke dada, apa yang terjadi pada putarannya dan mengapa?",
    options: [
      {
        label: "A",
        text: "Putaran melambat karena gesekan es bertambah",
        correct: false,
      },
      {
        label: "B",
        text: "Putaran makin cepat karena momen inersia (I) mengecil sedangkan momentum sudut (L) kekal",
        correct: true,
      },
      {
        label: "C",
        text: "Putaran tetap sama karena massa penari tidak berubah",
        correct: false,
      },
      {
        label: "D",
        text: "Momen inersia membesar sehingga kecepatan sudut bertambah",
        correct: false,
      },
    ],
    explanation:
      "Tangan ditarik ke dada membuat distribusi massa mendekati sumbu putar (r mengecil). Momen inersia I turun! Karena tidak ada torsi luar (es licin, τ = 0), maka L = I·ω tetap kekal. Akibatnya ω harus melesat naik!",
    formula: "I_1\\omega_1 = I_2\\omega_2",
  },
  {
    id: 2,
    scenario: "🚲 Praktikum Kursi Putar & Roda Sepeda",
    question:
      "Kamu duduk diam di kursi putar memegang roda sepeda yang berputar searah jarum jam (L ke atas). Jika kamu membalik roda 180° (L ke bawah), apa yang terjadi pada kursimu?",
    options: [
      {
        label: "A",
        text: "Kursi ikut berputar searah semula untuk mempertahankan momentum sudut total",
        correct: true,
      },
      {
        label: "B",
        text: "Kursi tetap diam karena kamu tidak mendorong lantai",
        correct: false,
      },
      {
        label: "C",
        text: "Roda sepeda langsung berhenti seketika",
        correct: false,
      },
      {
        label: "D",
        text: "Kursi berputar ke bawah",
        correct: false,
      },
    ],
    explanation:
      "Awalnya L_total = +L_roda. Ketika roda dibalik jadi -L_roda, agar total L tetap +L_roda, tubuh dan kursimu harus berputar menghasilkan L_kursi = +2L_roda! Ini bukti nyata vektor L kekal!",
    formula: "\\vec L_{awal} = \\vec L_{akhir} \\Rightarrow +L = -L + L_{kursi} \\Rightarrow L_{kursi} = 2L",
  },
  {
    id: 3,
    scenario: "🤸 Kolam Renang: Loncat Indah 10 Meter",
    question:
      "Mengapa atlet loncat indah meringkuk rapat (posisi tuck) saat berada di udara?",
    options: [
      {
        label: "A",
        text: "Agar hambatan udara berkurang",
        correct: false,
      },
      {
        label: "B",
        text: "Memperkecil momen inersia agar dapat melakukan salto banyak sebelum jatuh ke air",
        correct: true,
      },
      {
        label: "C",
        text: "Memperbesar gaya gravitasi bumi",
        correct: false,
      },
      {
        label: "D",
        text: "Agar tidak sakit saat membentur air",
        correct: false,
      },
    ],
    explanation:
      "Di udara bebas, gaya gravitasi bekerja tepat di pusat massa (torsi luar τ = 0). Meringkuk (tuck) memangkas I dari ~11 kg·m² menjadi hanya ~2.4 kg·m², melipatgandakan kecepatan putaran salto!",
    formula: "\\tau = 0 \\Rightarrow L = I\\omega = \\text{konstan}",
  },
  {
    id: 4,
    scenario: "🪐 Tata Surya: Hukum II Kepler",
    question:
      "Mengapa planet bergerak paling cepat saat berada di titik perihelion (terdekat ke Matahari)?",
    options: [
      {
        label: "A",
        text: "Gaya gravitasi matahari adalah gaya sentral radial (lengan torsi = 0), sehingga momentum sudut orbital kekal",
        correct: true,
      },
      {
        label: "B",
        text: "Massa planet bertambah saat dekat matahari",
        correct: false,
      },
      {
        label: "C",
        text: "Matahari memancarkan angin surya yang mendorong planet",
        correct: false,
      },
      {
        label: "D",
        text: "Torsi matahari maksimal di titik terdekat",
        correct: false,
      },
    ],
    explanation:
      "Gaya gravitasi selalu sejajar dengan vektor posisi r (menuju pusat Matahari), sehingga torsi τ = r × F = 0. Momentum sudut L = m·r·v = konstan! Karena r mengecil di perihelion, maka kelajuan orbital v harus bertambah!",
    formula: "\\vec\\tau = \\vec r \\times \\vec F_g = 0 \\Rightarrow L = mrv = \\text{konstan}",
  },
  {
    id: 5,
    scenario: "🔧 Mesin: Torsi & Impuls Sudut",
    question:
      "Jika sebuah roda gila diberi momen gaya (torsi) sebesar 10 N·m selama 3 detik, berapakah pertambahan momentum sudutnya?",
    options: [
      {
        label: "A",
        text: "3.33 kg·m²/s",
        correct: false,
      },
      {
        label: "B",
        text: "13 kg·m²/s",
        correct: false,
      },
      {
        label: "C",
        text: "30 kg·m²/s",
        correct: true,
      },
      {
        label: "D",
        text: "300 kg·m²/s",
        correct: false,
      },
    ],
    explanation:
      "Impuls sudut adalah perkalian torsi dan selang waktu: ΔL = τ · Δt = 10 N·m × 3 s = 30 kg·m²/s (atau N·m·s).",
    formula: "\\Delta L = \\tau \\cdot \\Delta t = 10 \\times 3 = 30\\text{ kg}\\cdot\\text{m}^2/\\text{s}",
  },
];

export function QuizModal({
  isOpen,
  onClose,
  onEarnXp,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEarnXp: (amount: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + (quizFinished ? 1 : 0)) / QUESTIONS.length) * 100);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    sound.playPop(520);
    setSelectedOpt(idx);
  };

  const handleCheck = () => {
    if (selectedOpt === null || isAnswered) return;
    setIsAnswered(true);

    const isCorrect = currentQ.options[selectedOpt].correct;
    if (isCorrect) {
      sound.playSuccess();
      triggerHaptic("success");
      setScore((s) => s + 1);
      onEarnXp(20);
    } else {
      sound.playPop(300);
      triggerHaptic("medium");
    }
  };

  const handleNext = () => {
    sound.playPop(480);
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      sound.playFanfare();
      triggerHaptic("success");
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#58CC02", "#FFC800", "#1CB0F6", "#CE82FF"],
      });
    }
  };

  const handleRestart = () => {
    sound.playPop(480);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs animate-pop-in">
      <div className="relative flex w-full max-w-xl flex-col max-h-[92vh] overflow-hidden rounded-3xl border-2 border-[#E5E7EB] bg-white shadow-2xl">
        {/* Header with Progress Bar */}
        <div className="border-b-2 border-[#F1F5F9] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h2 className="font-heading text-lg font-bold text-slate-800">
                Tantangan Kilat Fisika
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          {/* Duolingo Progress Bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full bg-[#58CC02] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-heading text-xs font-bold text-[#16A34A]">
              {currentIdx + 1}/{QUESTIONS.length}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!quizFinished ? (
            <>
              {/* Question Card */}
              <div className="rounded-2xl border-2 border-[#BAE6FD] bg-[#F0F9FF] p-4 text-slate-800">
                <span className="rounded-md bg-[#BAE6FD] px-2 py-0.5 text-[10px] font-extrabold text-[#0369A1] uppercase">
                  {currentQ.scenario}
                </span>
                <h3 className="mt-2 text-sm sm:text-base font-extrabold text-slate-800 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  let cardStyle = "border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50";

                  if (isAnswered) {
                    if (opt.correct) {
                      cardStyle = "border-[#46A302] bg-[#F0FDF4] text-[#15803D]";
                    } else if (isSelected) {
                      cardStyle = "border-[#EA2B2B] bg-[#FFF1F2] text-[#BE123C]";
                    }
                  } else if (isSelected) {
                    cardStyle = "border-[#1CB0F6] bg-[#F0F9FF] text-[#0369A1] shadow-[0_2px_0_0_#1899D6]";
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${cardStyle}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-heading text-xs font-bold ${
                          isSelected
                            ? "bg-[#1CB0F6] text-white"
                            : "bg-[#F1F5F9] text-slate-600"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {isAnswered && (
                <div
                  className={`rounded-2xl border-2 p-4 text-xs animate-pop-in ${
                    currentQ.options[selectedOpt!].correct
                      ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]"
                      : "border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]"
                  }`}
                >
                  <div className="font-heading text-sm font-bold flex items-center gap-1.5">
                    {currentQ.options[selectedOpt!].correct ? "🎉 Jawaban Tepat!" : "💡 Kurang Tepat, Ini Penjelasannya:"}
                  </div>
                  <p className="mt-1 font-medium leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  {currentQ.formula && (
                    <div className="mt-2 rounded-lg bg-white/80 p-2 text-slate-800 font-bold border border-current/20">
                      <F tex={currentQ.formula} />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Quiz Completed Celebration */
            <div className="text-center py-6 space-y-4 animate-pop-in">
              <div className="text-6xl animate-bounce">🥇</div>
              <h3 className="font-heading text-2xl font-bold text-slate-800">
                Luar Biasa, Kamu Juara!
              </h3>
              <p className="text-sm font-semibold text-slate-600 max-w-sm mx-auto">
                Kamu berhasil menyelesaikan kuis tantangan Momentum Sudut dengan skor:
              </p>
              <div className="inline-block rounded-2xl border-2 border-[#FEF08A] bg-[#FEFCE8] px-6 py-3 shadow-[0_4px_0_0_#FEF08A]">
                <span className="font-heading text-3xl font-extrabold text-[#A16207]">
                  {score} / {QUESTIONS.length}
                </span>
                <span className="ml-2 font-heading text-sm font-bold text-[#CA8A04]">
                  (+{score * 20} XP ⚡)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Pemahaman fisikamu tentang $L = I\omega$ dan $\tau = \Delta L/\Delta t$ sudah semakin matang!
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t-2 border-[#F1F5F9] bg-[#FBFBFC] px-5 py-3.5">
          {!quizFinished ? (
            <div className="flex justify-end gap-2">
              {!isAnswered ? (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={selectedOpt === null}
                  className="btn-duo btn-duo-green w-full sm:w-auto px-6 py-2.5 text-sm disabled:opacity-40"
                >
                  Periksa Jawaban
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-duo btn-duo-sky w-full sm:w-auto px-6 py-2.5 text-sm"
                >
                  Lanjut ➔
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="btn-duo btn-duo-white px-5 py-2.5 text-sm"
              >
                Ulangi Kuis 🔄
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-duo btn-duo-green px-6 py-2.5 text-sm"
              >
                Kembali ke Lab 🧪
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
