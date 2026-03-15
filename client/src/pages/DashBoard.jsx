import { useForecastData } from "@/hooks/useForecastData.js";
import { formatMW, formatError } from "@/utils/formatters.js";
import { format } from "date-fns";

import DateRangePicker from "@/components/DateRangePicker.jsx";
import HorizonSlider from "@/components/HorizonSlider.jsx";
import KpiCard from "@/components/KpiCard.jsx";
import ForecastChart from "@/components/ForecastChart.jsx";
import ReliabilityBadge from "@/components/ReliabilityBadge.jsx";

export default function Dashboard() {
  const {
    from, setFrom,
    to, setTo,
    horizon, setHorizon,
    dataPoints, metrics,
    loading, error,
  } = useForecastData();


  const rangeLabel = from && to
    ? `${format(from, "d MMM yyyy")} – ${format(to, "d MMM yyyy")}`
    : "UK national wind generation";

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 px-4 py-6 md:px-8 lg:px-12">

      <header className="mb-8">
        <h1 className="text-xl font-mono font-semibold tracking-tight text-slate-100">
          Wind Forecast Monitor
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {rangeLabel}
        </p>
      </header>


      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DateRangePicker
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </div>
        <div>
          <HorizonSlider value={horizon} onChange={setHorizon} />
        </div>
      </div>

     
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="MAE"
          value={metrics?.mae != null ? `${formatMW(metrics.mae)} MW` : null}
          sub="Mean absolute error"
          variant="neutral"
          loading={loading}
        />
        <KpiCard
          label="Max over-forecast"
          value={metrics?.maxOverForecast != null ? `+${formatMW(metrics.maxOverForecast)} MW` : null}
          sub="Forecast exceeded actual"
          variant="danger"
          loading={loading}
        />
        <KpiCard
          label="Max under-forecast"
          value={metrics?.maxUnderForecast != null ? `${formatError(metrics.maxUnderForecast)}` : null}
          sub="Actual exceeded forecast"
          variant="success"
          loading={loading}
        />
        <KpiCard
          label="P99 error"
          value={metrics?.p99Error != null ? `${formatMW(metrics.p99Error)} MW` : null}
          sub={metrics?.count ? `${metrics.count} data points` : "—"}
          variant="warning"
          loading={loading}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-[#378ADD]" />
            <span className="text-xs text-slate-400">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-[#1D9E75]" />
            <span className="text-xs text-slate-400">Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500/40" />
            <span className="text-xs text-slate-400">Over-forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-600/40" />
            <span className="text-xs text-slate-400">Under-forecast</span>
          </div>
          {loading && (
            <span className="text-xs text-slate-600 ml-auto animate-pulse">
              Fetching…
            </span>
          )}
        </div>

        <ForecastChart dataPoints={dataPoints} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReliabilityBadge />
      </div>

    </div>
  );
}