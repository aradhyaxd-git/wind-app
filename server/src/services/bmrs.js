const BASE = process.env.BMRS_BASE ?? "https://data.elexon.co.uk/bmrs/api/v1";
async function bmrsFetch(endpoint, params) {
  const url = `${BASE}${endpoint}?${new URLSearchParams(params)}`;
  const res  = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`BMRS ${res.status} — ${url}\n${body}`);
  }

  const json  = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
}

function toDateStr(d)
{ 
    return new Date(d).toISOString().slice(0, 10); 
}
function dayStart(d)   
{ 
    return toDateStr(d) + "T00:00:00Z"; 
}
function dayEnd(d)
     { 
        return toDateStr(d) + "T23:59:59Z"; 
     }

function eachDay(fromMs, toMs) {
  const days = [];
  const cur  = new Date(fromMs);
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(toMs);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}


function aggregateToHourly(records) {
  const buckets = new Map();
  for (const r of records) {
    const t = new Date(r.startTime);
    t.setUTCMinutes(0, 0, 0);
    const key = t.toISOString();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(r.generation);
  }
  return Array.from(buckets.entries())
    .map(([startTime, vals]) => ({
      startTime,
      generation: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
    }))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}


async function fetchActuals(fromMs, toMs) {
  const rows = await bmrsFetch("/datasets/FUELHH/stream", {
    settlementDateFrom: toDateStr(fromMs),
    settlementDateTo:toDateStr(toMs),
    fuelType:"WIND",
  });
  return aggregateToHourly(rows);
}


async function fetchForecasts(fromMs, toMs) {
  const publishFrom = new Date(fromMs);
  publishFrom.setUTCDate(publishFrom.getUTCDate() - 3);

  const days = eachDay(publishFrom.getTime(), toMs);
  const all  = [];

  for (const day of days) {
    const rows = await bmrsFetch("/datasets/WINDFOR", {
      publishDateTimeFrom: dayStart(day),
      publishDateTimeTo:   dayEnd(day),
    });
    all.push(...rows);
  }

  return all
    .filter((r) => {
      const t = new Date(r.startTime).getTime();
      return t >= fromMs && t <= toMs;
    })
    .map((r) => ({
      startTime:r.startTime,
      publishTime: r.publishTime,
      generation:r.generation,
    }));
}

module.exports = { fetchActuals, fetchForecasts };