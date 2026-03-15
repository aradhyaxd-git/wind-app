require("dotenv").config();
const express= require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit= require("express-rate-limit");
const path= require("path");
const cache= require("./src/services/cache");

const dataRoutes= require("./src/routes/data");
const metricsRoutes= require("./src/routes/metrics");
const reliabilityRoutes= require("./src/routes/reliability");
const analysisRoutes=require("./src/routes/analysis")

const app = express();
cache.connect();

app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/api", rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true }));

app.use("/api/data",dataRoutes);
app.use("/api/metrics",metricsRoutes);
app.use("/api/reliability",reliabilityRoutes);
app.use("/api/analysis",analysisRoutes);

// ── Health ────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    redis:  cache.isConnected() ? "connected" : "unavailable (running without cache)",
    uptime: process.uptime(),
  });
});

// ── Cache flush — useful during development ───────────────────
app.delete("/api/cache", async (_req, res) => {
  await cache.flush();
  res.json({ ok: true, message: "Cache cleared" });
});

// ── Serve built client in production ─────────────────────────
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../client/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) =>
    res.sendFile(path.join(dist, "index.html"))
  );
}

module.exports = app;