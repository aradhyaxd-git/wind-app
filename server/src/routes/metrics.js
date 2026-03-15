const express = require("express");
const router= express.Router();
const cache = require("../services/cache");
const bmrs = require("../services/bmrs");
const { buildDataPoints, computeMetrics } = require("../utils/errorEngine");

router.get("/", async (req, res) => {
  const { from, to, horizon = "24" } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "'from' and 'to' are required" });
  }

  const fromMs= new Date(from).getTime();
  const toMs= new Date(to).getTime();
  const horizonMs = parseFloat(horizon) * 3_600_000;

  const cacheKey = cache.makeKey(from, to, horizon);
  const cached= await cache.get(cacheKey);

  if (cached) {
    return res.json({ metrics: cached.metrics });
  }

  try {
    const [actuals, forecasts] = await Promise.all([
      bmrs.fetchActuals(fromMs, toMs),
      bmrs.fetchForecasts(fromMs, toMs),
    ]);
    const dataPoints= buildDataPoints({ actuals, forecasts, fromMs, toMs, horizonMs });
    const metrics= computeMetrics(dataPoints);

    await cache.set(cacheKey, { dataPoints, metrics });
    res.json({ metrics });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch from BMRS", detail: err.message });
  }
});

module.exports = router;