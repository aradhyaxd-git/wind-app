import DatePicker from "react-datepicker";

const MIN_DATE = new Date("2023-01-01T00:00:00Z");
const MAX_DATE = new Date("2025-12-31T23:00:00Z");

export default function DateRangePicker({ from, to, onFromChange, onToChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs uppercase tracking-widest text-slate-500">
          Start time
        </label>
        <DatePicker
          selected={from}
          onChange={onFromChange}
          selectsStart
          startDate={from}
          endDate={to}
          minDate={MIN_DATE}
          maxDate={to}
          showTimeSelect
          timeIntervals={60}
          timeFormat="HH:mm"
          dateFormat="dd/MM/yyyy HH:mm"
          className="
            w-full rounded-lg border border-slate-700 bg-[#1a2332]
            px-3 py-2 text-sm text-slate-200
            focus:outline-none focus:border-sky-500
            font-mono cursor-pointer
          "
        />
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs uppercase tracking-widest text-slate-500">
          End time
        </label>
        <DatePicker
          selected={to}
          onChange={onToChange}
          selectsEnd
          startDate={from}
          endDate={to}
          minDate={from}
          maxDate={MAX_DATE}
          showTimeSelect
          timeIntervals={60}
          timeFormat="HH:mm"
          dateFormat="dd/MM/yyyy HH:mm"
          className="
            w-full rounded-lg border border-slate-700 bg-[#1a2332]
            px-3 py-2 text-sm text-slate-200
            focus:outline-none focus:border-sky-500
            font-mono cursor-pointer
          "
        />
      </div>
    </div>
  );
}