import { getStore } from "@netlify/blobs";
import { authorised, json } from "../lib/auth.mjs";

// GET /api/activity?days=30 : anonymous visit and click totals for the dashboard.
export default async (req) => {
  if (!authorised(req)) return json({ error: "unauthorised" }, 401);
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days")) || 30));
  const store = getStore("activity");
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    const d = await store.get(day, { type: "json" }).catch(() => null);
    out.push({ day, ...(d || { pv: {}, ev: {}, ref: {}, cc: {}, dev: {}, src: {}, sessions: 0 }) });
  }
  return json({ days: out });
};

export const config = { path: "/api/activity" };
