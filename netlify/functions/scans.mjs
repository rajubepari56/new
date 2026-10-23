import { getStore } from "@netlify/blobs";
import { authorised, json } from "../lib/auth.mjs";

// GET /api/scans : how many tracking-checker scans were run, which sites, and what was found.
export default async (req) => {
  if (!authorised(req)) return json({ error: "unauthorised" }, 401);
  const store = getStore("scans");
  const { blobs } = await store.list();
  const keys = blobs.map((b) => b.key).sort();
  const rows = [];
  await Promise.all(keys.slice(-500).map(async (k) => {
    const d = await store.get(k, { type: "json" }).catch(() => null);
    if (d) rows.push({ id: k, ...d });
  }));
  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const now = Date.now(), within = (ms) => rows.filter((r) => now - Date.parse(r.created_at) < ms).length;
  const perDay = {};
  for (const r of rows) { const d = r.created_at.slice(0, 10); if (now - Date.parse(r.created_at) < 30 * 864e5) perDay[d] = (perDay[d] || 0) + 1; }
  return json({
    total: keys.length, last24h: within(864e5), last7d: within(7 * 864e5),
    stores: rows.filter((r) => r.type === "store").length, services: rows.filter((r) => r.type !== "store").length,
    unique_sites: new Set(rows.map((r) => r.host)).size, per_day: perDay, scans: rows,
  });
};

export const config = { path: "/api/scans" };
