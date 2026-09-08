import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Panel({
  title,
  icon,
  badge,
  children,
  className,
  actions,
}: PropsWithChildren<{
  title?: string;
  icon?: ReactNode;
  badge?: string;
  className?: string;
  actions?: ReactNode;
}>) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-[#E5E7EB] bg-white shadow-[0_4px_0_0_#E5E7EB] transition-all",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-2 border-b-2 border-[#F1F5F9] px-4 py-3 bg-[#FBFBFC] rounded-t-2xl">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <h3 className="font-heading text-sm font-bold text-slate-800 tracking-wide">
              {title}
            </h3>
            {badge && (
              <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-extrabold text-[#0284C7]">
                {badge}
              </span>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  sublabel,
  color = "sky",
}: {
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  color?: "sky" | "emerald" | "amber" | "rose" | "purple" | "slate";
}) {
  const styles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    sky: {
      bg: "bg-[#F0F9FF]",
      border: "border-[#BAE6FD]",
      text: "text-[#0284C7]",
      label: "text-[#0369A1]",
    },
    emerald: {
      bg: "bg-[#F0FDF4]",
      border: "border-[#BBF7D0]",
      text: "text-[#16A34A]",
      label: "text-[#15803D]",
    },
    amber: {
      bg: "bg-[#FEFCE8]",
      border: "border-[#FEF08A]",
      text: "text-[#CA8A04]",
      label: "text-[#854D0E]",
    },
    rose: {
      bg: "bg-[#FFF1F2]",
      border: "border-[#FECDD3]",
      text: "text-[#E11D48]",
      label: "text-[#BE123C]",
    },
    purple: {
      bg: "bg-[#FAF5FF]",
      border: "border-[#E9D5FF]",
      text: "text-[#9333EA]",
      label: "text-[#7E22CE]",
    },
    slate: {
      bg: "bg-[#F8FAFC]",
      border: "border-[#E2E8F0]",
      text: "text-[#334155]",
      label: "text-[#64748B]",
    },
  };

  const current = styles[color] || styles.sky;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-3 transition-transform hover:scale-[1.02]",
        current.bg,
        current.border
      )}
    >
      <p className={cn("text-[11px] font-extrabold uppercase tracking-wider", current.label)}>
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("font-heading text-xl font-bold leading-none tracking-tight", current.text)}>
          {value}
        </span>
        {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
      </div>
      {sublabel && <p className="mt-1 text-[10px] text-slate-500 leading-tight">{sublabel}</p>}
    </div>
  );
}
