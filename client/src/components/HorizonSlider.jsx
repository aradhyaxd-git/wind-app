import { MIN_HORIZON, MAX_HORIZON } from "@/hooks/useForecastData.js";
export default function HorizonSlider({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Forecast horizon
        </span>
        <span className="text-sm font-mono text-sky-400 font-medium">
          {value}h ahead
        </span>
      </div>

      <input
        type="range"
        min={MIN_HORIZON}
        max={MAX_HORIZON}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-500 cursor-pointer"
      />

      <div className="flex justify-between text-[10px] text-slate-600">
        <span>17h</span>
        <span>24h</span>
        <span>36h</span>
        <span>48h</span>
      </div>

      <p className="text-[10px] text-slate-600">
        Day-ahead model — forecasts published at least this many hours before delivery
      </p>
    </div>
  );
}