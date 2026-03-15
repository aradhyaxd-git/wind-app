function buildDataPoints({ actuals, forecasts, fromMs, toMs, horizonMs }) {
  const byTarget = new Map();
  for (const f of forecasts) {
    const t = new Date(f.startTime).getTime();
    if (!byTarget.has(t)) byTarget.set(t, []);
    byTarget.get(t).push(f);
  }

  const results = [];

  for (const actual of actuals) {
    const targetMs = new Date(actual.startTime).getTime();

    if (targetMs < fromMs || targetMs > toMs) continue;

    const candidates = byTarget.get(targetMs) ?? [];

    const eligible = candidates.filter(
      (f) => new Date(f.publishTime).getTime() <= targetMs - horizonMs
    );

    if (!eligible.length) continue;

    const best = eligible.reduce((a, b) =>
      new Date(a.publishTime) > new Date(b.publishTime) ? a : b
    );

    const error = best.generation - actual.generation;

    results.push({
      time: actual.startTime,
      actual: actual.generation,
      forecast: best.generation,
      error,
      errorPct:
        actual.generation > 0
          ? parseFloat(((error / actual.generation) * 100).toFixed(2))
          : 0,
    });
  }

  return results.sort((a, b) => new Date(a.time) - new Date(b.time));
}

function computeMetrics(dataPoints) {
  if (!dataPoints.length) {
    return {
      mae: null,
      maxOverForecast: null,
      maxUnderForecast: null,
      p99Error: null,
      biasMW: null,
      count: 0,
    };
  }

  const errors = dataPoints.map((d) => d.error);
  const absErrors = errors.map(Math.abs);

  const mae = absErrors.reduce((s, v) => s + v, 0) / absErrors.length;

  const biasMW = errors.reduce((s, v) => s + v, 0) / errors.length;

  const sortedAbs = [...absErrors].sort((a, b) => a - b);
  const p99Error = sortedAbs[Math.floor(0.99 * sortedAbs.length)];

  return {
    mae: Math.round(mae),
    maxOverForecast: Math.round(Math.max(...errors)),
    maxUnderForecast: Math.round(Math.min(...errors)),
    p99Error: Math.round(p99Error),
    biasMW: Math.round(biasMW),
    count: dataPoints.length,
  };
}

module.exports = { buildDataPoints, computeMetrics };