import { F, FBlock } from "./Formula";

export function SummaryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs animate-pop-in">
      <div className="relative flex w-full max-w-3xl flex-col max-h-[90vh] overflow-hidden rounded-3xl border-2 border-[#E5E7EB] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#F1F5F9] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-800">
                Peta Rumus Momentum Sudut (Fisika XI)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kamus rumus lengkap, besaran fisika, satuan SI, dan arti sederhananya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700">
          {/* Section 1 */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] p-4 bg-[#F8FAFC]">
            <h3 className="font-heading text-base font-bold text-[#0284C7] mb-2 flex items-center gap-2">
              <span>🎯 1. Momentum Sudut Partikel & Benda Tegar</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FBlock
                tex="\vec L = \vec r \times \vec p = m(\vec r \times \vec v)"
                label="Partikel"
                explanation="Vektor L tegak lurus terhadap bidang putar (r dan v), arahnya ditentukan Kaidah Tangan Kanan."
              />
              <FBlock
                tex="L = I\omega"
                label="Benda Tegar"
                explanation="I adalah momen inersia (kg·m²), ω adalah kecepatan sudut putaran (rad/s)."
              />
            </div>
            <div className="mt-3 text-xs bg-white p-3 rounded-xl border border-[#E2E8F0] space-y-1">
              <div className="font-bold text-slate-800">Keterangan Besaran & Satuan:</div>
              <div>• <F tex="L" /> = Momentum sudut (<F tex="\text{kg}\cdot\text{m}^2/\text{s}" /> atau <F tex="\text{J}\cdot\text{s}" />)</div>
              <div>• <F tex="I" /> = Momen inersia (<F tex="\text{kg}\cdot\text{m}^2" />) — ukuran kemalasan benda untuk berputar</div>
              <div>• <F tex="\omega" /> = Kecepatan sudut (<F tex="\text{rad/s}" />)</div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] p-4 bg-[#F8FAFC]">
            <h3 className="font-heading text-base font-bold text-[#CA8A04] mb-2 flex items-center gap-2">
              <span>🔧 2. Hubungan Torsi & Perubahan Momentum Sudut (Hukum II Rotasi)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FBlock
                tex="\vec\tau = \dfrac{d\vec L}{dt} \approx \dfrac{\Delta\vec L}{\Delta t}"
                label="Hukum II Rotasi"
                explanation="Torsi adalah laju perubahan momentum sudut terhadap waktu (analog dengan F = dp/dt)."
              />
              <FBlock
                tex="\Delta\vec L = \vec\tau \cdot \Delta t"
                label="Impuls Sudut"
                explanation="Impuls sudut yang diberikan gaya luar sama dengan pertambahan momentum sudut benda."
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] p-4 bg-[#F8FAFC]">
            <h3 className="font-heading text-base font-bold text-[#16A34A] mb-2 flex items-center gap-2">
              <span>🩰 3. Hukum Kekekalan Momentum Sudut</span>
            </h3>
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs text-[#15803D] font-medium mb-3">
              <strong>Syarat Mutlak:</strong> Jika resultan momen gaya luar pada sistem sama dengan nol (<F tex="\Sigma\tau_{\text{luar}} = 0" />), maka total momentum sudut sistem <strong>KEKAL (konstan)</strong>.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FBlock
                tex="\vec L_{\text{awal}} = \vec L_{\text{akhir}}"
                label="Bentuk Umum"
                explanation="Jumlah vektor momentum sudut sebelum dan sesudah interaksi nilainya sama."
              />
              <FBlock
                tex="I_1 \omega_1 = I_2 \omega_2"
                label="Aplikasi Balet & Kursi"
                explanation="Jika I mengecil (tangan ditarik ke dada), maka ω harus membesar agar perkalian I·ω tetap sama!"
              />
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl border-2 border-[#E2E8F0] p-4 bg-[#F8FAFC]">
            <h3 className="font-heading text-base font-bold text-[#9333EA] mb-2 flex items-center gap-2">
              <span>🪐 4. Aplikasi: Hukum II Kepler & Orbit Planet</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FBlock
                tex="\vec\tau = \vec r \times \vec F_g = 0"
                label="Gaya Sentral"
                explanation="Gaya gravitasi selalu mengarah tepat ke pusat Matahari, sehingga torsinya nol terhadap Matahari."
              />
              <FBlock
                tex="\dfrac{dA}{dt} = \dfrac{L}{2m} = \text{konstan}"
                label="Kecepatan Luas"
                explanation="Garis khayal yang menghubungkan planet ke matahari menyapu luas yang sama dalam selang waktu yang sama."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#F1F5F9] bg-[#FBFBFC] px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-duo btn-duo-green px-6 py-2.5 text-sm"
          >
            Paham, Ayo Eksplorasi! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
