export default function KpiCard({ label, value, sub, variant = "neutral", loading = false }) {
  const accentMap = {
    neutral: "border-slate-700",
    danger:"border-red-500/60",
    success: "border-emerald-500/60",
    warning: "border-amber-500/60",
  };

  const valueColorMap = {
    neutral: "text-slate-100",
    danger:"text-red-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
  };

  return (
    <div
      className={`
        rounded-xl border ${accentMap[variant]}
        bg-[#111827] px-5 py-4
        flex flex-col gap-1 min-w-0
      `}
    >
      <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
        {label}
      </span>

      {loading ? (
        <div className="h-8 w-24 rounded bg-slate-800 animate-pulse mt-1" />
      ) : (
        <span className={`text-2xl font-mono font-semibold ${valueColorMap[variant]}`}>
          {value ?? "—"}
        </span>
      )}

      {sub && (
        <span className="text-xs text-slate-500 truncate">{sub}</span>
      )}
    </div>
  );
}