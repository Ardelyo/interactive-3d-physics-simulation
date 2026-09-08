import { useEffect, useRef } from "react";

export interface ChartSeries {
  data: number[];
  color: string;
  label: string;
  unit?: string;
}

export function LiveChart({
  series,
  height = 110,
  yLabel,
}: {
  series: ChartSeries[];
  height?: number;
  yLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Light Theme Grid
    ctx.strokeStyle = "#F1F5F9";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    let globalMax = 0.0001;
    let globalMin = 0;
    series.forEach((s) => {
      s.data.forEach((v) => {
        if (v > globalMax) globalMax = v;
        if (v < globalMin) globalMin = v;
      });
    });
    const range = globalMax - globalMin || 1;

    // Draw series
    series.forEach((s) => {
      if (s.data.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      s.data.forEach((v, i) => {
        const x = (i / (s.data.length - 1)) * w;
        const y = h - ((v - globalMin) / range) * (h - 14) - 7;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [series]);

  return (
    <div className="relative rounded-2xl border-2 border-[#E2E8F0] bg-white p-3 shadow-[0_2px_0_0_#E2E8F0]">
      {yLabel && (
        <span className="absolute left-3 top-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          {yLabel}
        </span>
      )}
      <div className="pt-4">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height }}
          className="block rounded-xl bg-[#F8FAFC]"
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-[#F1F5F9] pt-2">
        {series.map((s) => {
          const latest = s.data.length > 0 ? s.data[s.data.length - 1] : 0;
          return (
            <div key={s.label} className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span>{s.label}:</span>
              <span className="font-heading text-[#0284C7]">
                {latest.toFixed(2)} {s.unit || ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
