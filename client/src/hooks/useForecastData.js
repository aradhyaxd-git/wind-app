import { useState, useEffect, useCallback, useRef } from "react";
import { fetchData } from "@/utils/api.js";
export const MIN_HORIZON = 17;
export const MAX_HORIZON = 48;

const DEFAULT_FROM = new Date("2024-01-10T00:00:00Z");
const DEFAULT_TO= new Date("2024-01-17T00:00:00Z");
const DEFAULT_HORIZON =24;

export function useForecastData() {
  const [from, setFrom]= useState(DEFAULT_FROM);
  const [to, setTo]= useState(DEFAULT_TO);
  const [horizon, setHorizon] =useState(DEFAULT_HORIZON);

  const [dataPoints, setDataPoints] = useState([]);
  const [metrics, setMetrics]= useState(null);
  const [loading, setLoading]= useState(false);
  const [error, setError]= useState(null);

  const debounceTimer = useRef(null);

  const load = useCallback(async (fromDate, toDate, h) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(
        fromDate.toISOString(),
        toDate.toISOString(),
        h
      );
      setDataPoints(result.dataPoints ?? []);
      setMetrics(result.metrics ?? null);
    } catch (err) {
      setError(err?.response?.data?.error ?? err.message ?? "Request failed");
      setDataPoints([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      load(from, to, horizon);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [from, to, horizon, load]);

  return {
    from, setFrom,
    to, setTo,
    horizon, setHorizon,
    dataPoints,
    metrics,
    loading,
    error,
  };
}