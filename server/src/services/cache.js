const Redis = require("ioredis");
const TTL = parseInt(process.env.CACHE_TTL_SECONDS ?? "3600", 10);
const logger= require("../utils/logger");

let client = null;
let connected = false;

function connect() {
  if (client) return;

  client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    lazyConnect:true,
    enableOfflineQueue:false,
    connectTimeout:3000,
    maxRetriesPerRequest: 1,
  });

  client.on("connect", () => {
    connected = true;
    logger.info("Redis connected");
  });

  client.on("error", (err) => {
    if (connected) console.warn("Redis error:", err.message);
    connected = false;
  });

  client.connect().catch(() => {
    logger.warn("Redis unavailable — running without cache");
  });
}


function makeKey(from, to, horizon) {
  const f = new Date(from).toISOString();
  const t = new Date(to).toISOString();
  return `wfm:data:${f}:${t}:h${horizon}`;
}

async function get(key) {
  if (!connected || !client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function set(key, value) {
  if (!connected || !client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", TTL);
  } catch {
  }
}

async function del(key) {
  if (!connected || !client) return;
  try { await client.del(key); } catch {}
}

async function flush() {
  if (!connected || !client) return;
  try {
    const keys = await client.keys("wfm:*");
    if (keys.length) await client.del(...keys);
    logger.info({ count: keys.length }, "Cache flushed");
  } catch {}
}

function isConnected() { return connected; }
module.exports = { connect, makeKey, get, set, del, flush, isConnected };