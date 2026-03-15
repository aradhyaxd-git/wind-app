import { useReliability } from "@/hooks/useReliability.js";
import { formatMW } from "@/utils/formatters.js";

export default function ReliabilityBadge() {
  const { reliability, loading } = useReliability();

  return (
    <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-5 py-4">
      <span className="text-xs uppercase tracking-widest text-emerald-600">
        Reliable floor (p10)
      </span>

      {loading ? (
        <div className="h-8 w-24 rounded bg-emerald-900/30 animate-pulse mt-2" />
      ) : reliability ? (
        <>
          <p className="text-2xl font-mono font-semibold text-emerald-400 mt-1">
            {formatMW(reliability.p10)} MW
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            90% of Jan 2024 slots exceeded this · median {formatMW(reliability.p50)} MW
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-500 mt-1">Unavailable</p>
      )}
    </div>
  );
}