import { F, FBlock } from "./Formula";

export interface StepItem {
  step: string;
  formula: string;
  substitution: string;
  result: string;
  explanation?: string;
}

export function StepCalculation({
  diketahui,
  ditanya,
  langkah,
}: {
  diketahui: { symbol: string; value: string; unit: string; desc: string }[];
  ditanya: { symbol: string; desc: string; unit: string };
  langkah: StepItem[];
}) {
  return (
    <div className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-3.5 sm:p-4 shadow-[0_3px_0_0_#E2E8F0] space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 border-b-2 border-[#F1F5F9] pb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#E0F2FE] text-sm text-[#0284C7] font-extrabold">
          📝
        </span>
        <div>
          <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-800">
            Tata Cara Perhitungan Real-time
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold">
            Format resmi Fisika SMA: Diketahui ➔ Ditanya ➔ Dijawab
          </p>
        </div>
      </div>

      {/* 1. DIKETAHUI */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0369A1] uppercase tracking-wider mb-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
          <span>1. Diketahui (Dari Slider Interaktif):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {diketahui.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-2 text-xs"
            >
              <div className="text-[10px] font-bold text-slate-500 truncate">{item.desc}</div>
              <div className="font-heading font-bold text-[#0284C7] mt-0.5">
                <F tex={`${item.symbol} = `} /> {item.value} {item.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DITANYA */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider mb-1.5">
          <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
          <span>2. Ditanya:</span>
        </div>
        <div className="rounded-xl border border-[#FEF08A] bg-[#FEFCE8] p-2 text-xs flex items-center justify-between">
          <span className="text-slate-700 font-bold">{ditanya.desc}</span>
          <span className="font-heading font-extrabold text-[#A16207]">
            <F tex={ditanya.symbol} /> ({ditanya.unit}) = ?
          </span>
        </div>
      </div>

      {/* 3. DIJAWAB / LANGKAH PERHITUNGAN */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#15803D] uppercase tracking-wider mb-1.5">
          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
          <span>3. Langkah Penyelesaian (Dijawab):</span>
        </div>
        <div className="space-y-2">
          {langkah.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-[#16A34A]">
                  Langkah {idx + 1}: {step.step}
                </span>
                <span className="rounded-md bg-white border border-[#CBD5E1] px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                  Rumus
                </span>
              </div>

              {/* Formula & Substitution */}
              <div className="rounded-lg bg-white p-2 border border-[#E2E8F0] space-y-1">
                <div className="text-slate-800 font-bold overflow-x-auto py-0.5">
                  <F tex={step.formula} />
                </div>
                <div className="text-[11px] font-medium text-slate-600 overflow-x-auto">
                  <span className="text-[#0284C7] font-bold">Substitusi: </span>
                  <F tex={step.substitution} />
                </div>
              </div>

              {/* Step Result */}
              <div className="flex items-center justify-between pt-1">
                {step.explanation && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    💡 {step.explanation}
                  </span>
                )}
                <span className="font-heading font-extrabold text-[#15803D] ml-auto">
                  ➔ {step.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
