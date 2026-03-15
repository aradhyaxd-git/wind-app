import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatAxisTime, formatTooltipTime, formatMW, formatPct } from "@/utils/formatters.js";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const actual = payload.find((p) => p.dataKey === "actual")?.value;
  const forecast = payload.find((p) => p.dataKey === "forecast")?.value;

  if (actual == null || forecast == null) return null;

  const error= forecast - actual;
  const errorPct = actual > 0 ? (error / actual) * 100 : 0;
  const isOver= error > 0;

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0b1120]/95 px-4 py-3 text-xs shadow-xl min-w-[220px]">
      <p className="text-slate-400 mb-3 font-mono text-[11px]">
        {formatTooltipTime(label)}
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#378ADD] inline-block" />
            <span className="text-slate-400">Actual</span>
          </div>
          <span className="font-mono text-slate-200">{formatMW(actual)} MW</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#1D9E75] inline-block" />
            <span className="text-slate-400">Forecast</span>
          </div>
          <span className="font-mono text-slate-200">{formatMW(forecast)} MW</span>
        </div>
        <div className="border-t border-slate-700/60 my-0.5" />
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: isOver ? "#E24B4A" : "#639922" }}
            />
            <span className="text-slate-400">
              {isOver ? "Over-forecast" : "Under-forecast"}
            </span>
          </div>
          <span
            className="font-mono font-semibold"
            style={{ color: isOver ? "#E24B4A" : "#639922" }}
          >
            {isOver ? "+" : ""}{formatMW(Math.round(error))} MW
            <span className="text-slate-500 font-normal ml-1">
              ({formatPct(errorPct)})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}


export default function ForecastChart({ dataPoints = [], loading }) {
  if (loading) {
    return (
      <div className="h-80 rounded-xl bg-[#111827] animate-pulse flex items-center justify-center">
        <span className="text-slate-600 text-sm">Fetching from BMRS…</span>
      </div>
    );
  }

  if (!dataPoints.length) {
    return (
      <div className="h-80 rounded-xl bg-[#111827] flex items-center justify-center border border-slate-800">
        <span className="text-slate-500 text-sm">
          No data — try adjusting the date range or horizon
        </span>
      </div>
    );
  }


  const chartData = dataPoints.map((d) => {
    const isOver = d.forecast > d.actual;
    return {
      ...d,
      overArea:isOver ? [d.actual, d.forecast]:[d.actual, d.actual],
      underArea: !isOver ? [d.forecast, d.actual]: [d.actual, d.actual],
    };
  });

  const allValues = dataPoints.flatMap((d) => [d.actual, d.forecast]);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yPad = (yMax - yMin) * 0.08;
  const yDomainMin = Math.floor((yMin - yPad) / 100) * 100;
  const yDomainMax = Math.ceil((yMax + yPad) / 100) * 100;

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ComposedChart
        data={chartData}
        margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          vertical={false}
        />

        <XAxis
          dataKey="time"
          tickFormatter={formatAxisTime}
          tick={{ fill: "#475569", fontSize: 11, fontFamily: "monospace" }}
          axisLine={{ stroke: "#1e293b" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={100}
        />

        <YAxis
          domain={[yDomainMin, yDomainMax]}
          tickFormatter={(v) => formatMW(Math.round(v))}
          tick={{ fill: "#475569", fontSize: 11, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          width={52}
          unit=" MW"
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#334155", strokeWidth: 1 }}
        />

        <Area
          dataKey="overArea"
          stroke="none"
          fill="#E24B4A"
          fillOpacity={0.25}
          legendType="none"
          isAnimationActive={false}
          connectNulls
        />
        <Area
          dataKey="underArea"
          stroke="none"
          fill="#639922"
          fillOpacity={0.25}
          legendType="none"
          isAnimationActive={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#378ADD"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "#378ADD", stroke: "#0b1120", strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#1D9E75"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 5, fill: "#1D9E75", stroke: "#0b1120", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}