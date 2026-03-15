const express = require("express");
const router = express.Router();
const cache = require("../services/cache");
const bmrs = require("../services/bmrs");
const logger= require("../utils/logger");

router.get("/", async (req, res) => {
  const CACHE_KEY = process.env.CACHE_KEY;
  const cached = await cache.get(CACHE_KEY);
  if (cached) {
    logger.info({ hit: true }, "GET /api/reliability");
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  try {
    logger.info({ from: FROM, to: TO }, "GET /api/reliability — fetching BMRS");
    const fromMs = new Date("2024-01-01T00:00:00Z").getTime();
    const toMs= new Date("2024-01-31T23:59:59Z").getTime();

    const actuals = await bmrs.fetchActuals(fromMs, toMs);
    const values  = actuals
      .map((a) => a.generation)
      .filter((v) => typeof v === "number" && !isNaN(v) && v >= 0)
      .sort((a, b) => a - b);

    const pct  = (p) => Math.round(values[Math.floor((p / 100) * values.length)]);
    const mean = Math.round(values.reduce((s, v) => s + v, 0) / values.length);

    const result = {
      p5: pct(5), p10: pct(10), p25: pct(25),
      p50: pct(50), p90: pct(90), mean,
      totalSlots: values.length,
    };

    
    await cache.set(CACHE_KEY, result);
    logger.info({ totalSlots: values.length }, "GET /api/reliability — done");
    res.set("X-Cache", "MISS");
    res.json(result);
  } catch (err) {
    logger.error({ err: err.message }, "GET /api/reliability — failed");
    res.status(502).json({ error: "Failed to fetch reliability data", detail: err.message });
  }
});

module.exports = router;