const express = require("express");
const router= express.Router();
const cache = require("../services/cache");
const bmrs = require("../services/bmrs");
const { buildDataPoints } = require("../utils/errorEngine");
const logger= require("../utils/logger");

router.get("/", async (req, res) => {
  const CACHE_KEY = process.env.CACHE_KEY;
  const cached = await cache.get(CACHE_KEY);

  if (cached) {
    logger.info({ hit: true }, "GET /api/analysis");
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  try {
    logger.info({ from: FROM, to: TO, horizon: HORIZON }, "GET /api/analysis — fetching BMRS");
    const fromMs= new Date("2024-01-01T00:00:00Z").getTime();
    const toMs= new Date("2024-01-31T23:59:59Z").getTime();
    const horizonMs = 24 * 3_600_000;

    const [actuals, forecasts] = await Promise.all([
      bmrs.fetchActuals(fromMs, toMs),
      bmrs.fetchForecasts(fromMs, toMs),
    ]);

    const dataPoints = buildDataPoints({
      actuals, forecasts, fromMs, toMs, horizonMs,
    });

    const result = { dataPoints, fetchedAt: new Date().toISOString() };
    await cache.set(CACHE_KEY, result);
    logger.info({ points: dataPoints.length }, "GET /api/analysis — done");

    res.set("X-Cache", "MISS");
    res.json(result);
  } catch (err) {
    logger.error({ err: err.message }, "GET /api/analysis — failed");
    res.status(502).json({
      error: "Failed to fetch analysis data from BMRS",
      detail: err.message,
    });
  }
});

module.exports = router;