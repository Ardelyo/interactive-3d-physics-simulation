import { useState } from "react";
import { F } from "./Formula";
import { sound, triggerHaptic } from "../../utils/audio";

interface SpeakerSection {
  number: string;
  name: string;
  role: string;
  avatar: string;
  tagColor: string;
  dialogue: string;
  bullets?: string[];
  keyFormula?: string;
  actionCue?: string;
}

const SCRIPT_SECTIONS: SpeakerSection[] = [
  {
    number: "1",
    name: "Nabila",
    role: "Pembukaan & Pengantar Kelompok",
    avatar: "👩‍💼",
    tagColor: "bg-[#0284C7] text-white",
    dialogue:
      '"Halo teman-teman, selamat pagi/siang ya. Jadi hari ini kami dari kelompok kami mau presentasi tentang Momentum Sudut.\n\nYang di sini ada saya Nabila sebagai pembuka, nanti ada Jahfal yang bakal jelasin konsepnya, terus Lio yang demo simulasinya, Sabrina sama Gladies yang buktiin perhitungannya bener nggak, dan terakhir Cinta yang kasih kesimpulan.\n\nOke langsung aja ya biar nggak lama-lama, saya serahin ke Jahfal dulu."',
    actionCue: "Ucapkan salam dengan ramah, tatap audiens, dan perkenalkan anggota kelompok dengan jelas.",
  },
  {
    number: "2",
    name: "Jahfal",
    role: "Penjelasan Dasar Teori",
    avatar: "👨‍🏫",
    tagColor: "bg-[#10B981] text-white",
    dialogue:
      '"Baik, makasih Nabila. Jadi gini teman-teman, kalian pasti udah tau kan momentum linear di gerak lurus? Nah kalau benda itu berputar, ada yang namanya Momentum Sudut atau biasa ditulis L.\n\nRumusnya simpel kok: L = m × r × v — jadi massa dikali jarak dari pusat dikali kecepatannya.\n\nNah karena benda berputar, kecepatannya bisa kita tulis v = omega × r, jadi rumusnya jadi: L = m × r² × omega.\n\nKalian ingat kan momen inersia? I = m × r². Jadi kalau digabung, rumus finalnya: L = I × omega — simpel kan? Inersia dikali kecepatan sudut.\n\nOh iya, satu lagi yang penting: arahnya ini tegak lurus sama bidang putarannya. Pakai aturan tangan kanan: jari mengikuti putaran, ibu jari nunjukin arah L-nya.\n\nBiar lebih jelas, Lio mau kasih liat visualnya."',
    keyFormula: "L = m \\cdot r \\cdot v = I\\omega \\quad (I = mr^2)",
    actionCue: "Tekankan bahwa momentum sudut (L) adalah analog rotasi dari momentum linear (p = mv).",
  },
  {
    number: "3",
    name: "Lio",
    role: "Demo Simulasi 3D",
    avatar: "👨‍💻",
    tagColor: "bg-[#F59E0B] text-slate-900",
    dialogue:
      '"Oke makasih Jahfal. Coba lihat layar ya teman-teman, ini kita buka simulasi 3D-nya:',
    bullets: [
      "Ada titik O di tengah — itu pusat sumbu putarnya.",
      "Bola oranye ini bendanya, terus batang biru ini jarak jari-jari r-nya.",
      "Panah hijau (v) nunjukin arah kecepatan gerak benda.",
      "Nah yang panah ungu menjulang ke atas ini dia, momentum sudut L-nya!",
    ],
    actionCue:
      'Tunjuk layar simulasi! Klik tombol "Balik Arah Putaran 🔄" di layar, tunjukkan ke audiens bahwa vektor ungu L langsung berbalik menunjuk ke bawah sesuai aturan tangan kanan.',
  },
  {
    number: "4",
    name: "Sabrina & Gladies",
    role: "Pembuktian Numerik (Validasi 100%)",
    avatar: "👭",
    tagColor: "bg-[#9333EA] text-white",
    dialogue:
      'Sabrina:\n"Oke makasih Lio. Jadi kita ambil data dari simulasi tadi ya:\n• Massa = 0,20 kg\n• Jari-jari = 2,40 m\n• Kecepatan sudut = 5,00 rad/s\n\nKita hitung satu-satu:\nPertama, kecepatan linear:\nv = omega × r = 5,00 × 2,40 = 12,00 m/s\nCoba cek di layar... yup, sama persis 12,00 m/s ✓\n\nKedua, momentum linear:\np = m × v = 0,20 × 12,00 = 2,40 kg m/s\nDi layar juga 2,40 kg m/s — cocok! ✓\nNah sisanya saya serahin ke Gladies ya."\n\nGladies:\n"Oke lanjut. Sekarang kita hitung yang rotasinya:\n\nKetiga, momen inersia:\nI = m × r² = 0,20 × (2,40)² = 1,152 kg m²\nDi layar dibulatkan jadi 1,15 kg m² — kurang lebih sama ✓\n\nTerakhir, momentum sudut:\nL = I × omega = 1,152 × 5,00 = 5,76 kg m²/s\nDi layar? Pas banget 5,76 kg m²/s ✓\n\nJadi semua perhitungan kita cocok 100% sama simulasinya. Ini bukti kalau simulasi ini akurat. Cinta tolong kasih penutupnya ya."',
    keyFormula:
      "v = 12{,}00\\text{ m/s} \\;\\checkmark \\quad p = 2{,}40\\text{ kg}\\cdot\\text{m/s} \\;\\checkmark \\quad I = 1{,}15\\text{ kg}\\cdot\\text{m}^2 \\;\\checkmark \\quad L = 5{,}76\\text{ kg}\\cdot\\text{m}^2/\\text{s} \\;\\checkmark",
    actionCue:
      "Gunakan tab '📝 Hitungan' di layar dan tunjukkan kartu hijau bertanda centang (✓) sebagai bukti kecocokan angka.",
  },
  {
    number: "5",
    name: "Cinta",
    role: "Kesimpulan & Penutup",
    avatar: "👩‍🎓",
    tagColor: "bg-[#EC4899] text-white",
    dialogue:
      '"Siap, makasih Gladies. Jadi kesimpulannya:\n\n1. Momentum sudut itu L = I × omega — makin besar inersia dan putarannya, makin besar juga momentum sudutnya.\n\n2. Arahnya selalu tegak lurus sama bidang putaran, sesuai aturan tangan kanan yang tadi dijelasin.\n\n3. Simulasi 3D ini valid dan hasilnya sesuai sama rumus yang ada di buku kita.\n\nOke sekian dari kelompok kami. Kalau ada yang mau tanya, silakan ya. Terima kasih!"',
    actionCue: "Tersenyum, buka sesi tanya jawab ke guru dan teman-teman sekelas.",
  },
];

export function PresentationScriptModal({
  isOpen,
  onClose,
  onApplyScenario,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: () => void;
}) {
  const [selectedSection, setSelectedSection] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-5 backdrop-blur-xs animate-pop-in">
      <div className="relative flex w-full max-w-3xl flex-col max-h-[92vh] overflow-hidden rounded-3xl border-2 border-[#E5E7EB] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#F1F5F9] px-5 py-4 bg-[#FBFBFC]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#58CC02] border-b-3 border-[#46A302] text-xl text-white shadow-xs">
              🎤
            </span>
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-800">
                Skrip Resmi Presentasi Kelompok
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Nabila · Jahfal · Lio · Sabrina · Gladies · Cinta (Fisika XI)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Presenter Tabs */}
        <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] px-4 py-2 overflow-x-auto no-scrollbar flex gap-1.5">
          {SCRIPT_SECTIONS.map((sec, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                sound.playPop(520);
                setSelectedSection(idx);
              }}
              className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-heading font-bold transition border-2 ${
                selectedSection === idx
                  ? "bg-white border-[#58CC02] text-[#15803D] shadow-xs scale-102"
                  : "bg-transparent border-transparent text-slate-600 hover:bg-white"
              }`}
            >
              <span>{sec.avatar}</span>
              <span>{sec.name}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {(() => {
            const sec = SCRIPT_SECTIONS[selectedSection];
            return (
              <div className="space-y-4 animate-pop-in">
                {/* Speaker Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#BAE6FD] bg-[#F0F9FF] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sec.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base sm:text-lg font-bold text-slate-800">
                          {sec.number}. {sec.name}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-heading font-extrabold ${sec.tagColor}`}
                        >
                          {sec.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Tugas: {sec.role}
                      </p>
                    </div>
                  </div>

                  {/* If Sabrina/Gladies section, offer quick scenario button */}
                  {sec.number === "4" && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSuccess();
                        triggerHaptic("success");
                        onApplyScenario();
                        onClose();
                      }}
                      className="btn-duo btn-duo-green px-3.5 py-1.5 text-xs"
                    >
                      🚀 Pasang Parameter Pembuktian Sekarang
                    </button>
                  )}
                </div>

                {/* Speech Text Box */}
                <div className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
                  <div className="font-heading text-xs font-bold text-slate-500 uppercase tracking-wider">
                    📜 Skrip Kata-kata yang Diucapkan:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    {sec.dialogue}
                  </p>

                  {sec.bullets && (
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-medium pt-1">
                      {sec.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {sec.keyFormula && (
                    <div className="mt-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-center overflow-x-auto font-heading font-bold text-[#15803D]">
                      <F tex={sec.keyFormula} />
                    </div>
                  )}
                </div>

                {/* Stage Cue / Tips Card */}
                {sec.actionCue && (
                  <div className="rounded-xl border border-[#FEF08A] bg-[#FEFCE8] p-3 text-xs text-[#854D0E] font-medium flex items-start gap-2">
                    <span className="text-base">💡</span>
                    <div>
                      <strong>Petunjuk Panggung (Action Cue):</strong> {sec.actionCue}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* General Presentation Tips */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs space-y-1.5 text-slate-600">
            <div className="font-heading font-bold text-slate-800 flex items-center gap-1.5">
              <span>🎯 Tips Penting Saat Maju Presentasi:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
              <div>• <strong>Tunjuk Layar:</strong> Saat Lio mendemo simulasi, sesekali tunjuk vektor di layar.</div>
              <div>• <strong>Kontak Mata:</strong> Tatap audiens dan guru, jangan hanya membaca layar.</div>
              <div>• <strong>Tempo Bicara:</strong> Santai, artikulatif, dan beri jeda saat menyebutkan hasil angka.</div>
              <div>• <strong>Kekompakan:</strong> Berikan operan estafet kalimat yang mulus antar anggota kelompok.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#F1F5F9] bg-[#FBFBFC] px-5 py-3.5">
          <button
            type="button"
            onClick={() => {
              sound.playPop(480);
              setSelectedSection((prev) => Math.max(0, prev - 1));
            }}
            disabled={selectedSection === 0}
            className="btn-duo btn-duo-white px-3 py-1.5 text-xs disabled:opacity-40"
          >
            ⬅️ Pembicara Sebelumnya
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                onApplyScenario();
                onClose();
              }}
              className="btn-duo btn-duo-sky px-3 py-1.5 text-xs"
            >
              ⚡ Buka Simulasi Partikel
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop(520);
                if (selectedSection < SCRIPT_SECTIONS.length - 1) {
                  setSelectedSection((prev) => prev + 1);
                } else {
                  onClose();
                }
              }}
              className="btn-duo btn-duo-green px-4 py-1.5 text-xs"
            >
              {selectedSection < SCRIPT_SECTIONS.length - 1 ? "Pembicara Selanjutnya ➔" : "Siap Tampil! 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
