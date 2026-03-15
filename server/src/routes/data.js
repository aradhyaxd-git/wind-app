const express= require("express");
const router = express.Router();
const logger= require('../utils/logger')
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

  if (isNaN(fromMs) || isNaN(toMs)) {
    return res.status(400).json({ error: "Invalid date format. Use ISO 8601." });
  }
  if (fromMs >= toMs) {
    return res.status(400).json({ error: "'from' must be before 'to'" });
  }

  const cacheKey = cache.makeKey(from, to, horizon);
  const cached= await cache.get(cacheKey);

  if (cached) {
    logger.info({cacheKey,hit:true},"GET/api/data")
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  try {
    logger.info({from,to,horizon,hit:false},"GET/api/data- fetching BMRS")

    const [actuals, forecasts] = await Promise.all([
      bmrs.fetchActuals(fromMs, toMs),
      bmrs.fetchForecasts(fromMs, toMs),
    ]);

    const dataPoints = buildDataPoints({ actuals, forecasts, fromMs, toMs, horizonMs });
    const metrics = computeMetrics(dataPoints);
    const result= { dataPoints, metrics };

    await cache.set(cacheKey, result);

    logger.info({ from, to, horizon, points: dataPoints.length }, "GET /api/data — done");
    res.set("X-Cache", "MISS");
    res.json(result);

  } catch (err) {
    logger.error({ err: err.message, from, to, horizon }, "GET /api/data — BMRS fetch failed");
    res.status(502).json({
      error: "Failed to fetch data from BMRS",
      detail: err.message,
    });
  }
});

module.exports = router;