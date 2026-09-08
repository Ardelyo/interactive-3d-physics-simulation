import { BlockMath, InlineMath } from "react-katex";
import { cn } from "../../utils/cn";

export function F({ tex }: { tex: string }) {
  return <InlineMath math={tex} />;
}

export function FBlock({
  tex,
  label,
  explanation,
  className,
}: {
  tex: string;
  label?: string;
  explanation?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-3 text-slate-800 shadow-[0_2px_0_0_#E2E8F0] transition hover:border-[#CBD5E1]",
        className
      )}
    >
      <div className="overflow-x-auto py-1">
        <BlockMath math={tex} />
      </div>
      {label && (
        <span className="absolute right-3 top-2 rounded-md bg-[#EDF2F7] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500">
          Rumus {label}
        </span>
      )}
      {explanation && (
        <p className="mt-1.5 border-t border-[#E2E8F0] pt-1.5 text-xs text-slate-600 font-medium">
          💡 {explanation}
        </p>
      )}
    </div>
  );
}
