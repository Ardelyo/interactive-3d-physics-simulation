import { sound } from "../../utils/audio";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  accent?: "green" | "sky" | "amber" | "rose" | "purple";
  precision?: number;
  disabled?: boolean;
  hint?: string;
  quickPicks?: { label: string; val: number }[];
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = "",
  onChange,
  accent = "green",
  precision = 2,
  disabled = false,
  hint,
  quickPicks,
}: SliderProps) {
  const accentColors = {
    green: "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]",
    sky: "text-[#0284C7] bg-[#F0F9FF] border-[#BAE6FD]",
    amber: "text-[#CA8A04] bg-[#FEFCE8] border-[#FEF08A]",
    rose: "text-[#E11D48] bg-[#FFF1F2] border-[#FECDD3]",
    purple: "text-[#9333EA] bg-[#FAF5FF] border-[#E9D5FF]",
  };

  const handleInput = (newVal: number) => {
    onChange(newVal);
  };

  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-extrabold text-slate-700 tracking-wide">
          {label}
        </label>
        <span
          className={`rounded-xl border-2 px-2.5 py-0.5 font-heading text-xs font-bold ${accentColors[accent]}`}
        >
          {value.toFixed(precision)} {unit}
        </span>
      </div>

      <div className="relative py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => handleInput(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {quickPicks && quickPicks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {quickPicks.map((pick) => (
            <button
              key={pick.label}
              type="button"
              onClick={() => {
                sound.playPop(560);
                onChange(pick.val);
              }}
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition ${
                Math.abs(value - pick.val) < (step || 0.05)
                  ? "bg-[#58CC02] text-white border-[#46A302]"
                  : "bg-white text-slate-600 border-[#E5E7EB] hover:bg-slate-50"
              }`}
            >
              {pick.label}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="text-[11px] leading-tight text-slate-500">{hint}</p>}
    </div>
  );
}
