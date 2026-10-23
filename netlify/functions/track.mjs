import { getStore } from "@netlify/blobs";

// POST /api/track : privacy-friendly visit and click counters.
// Stores only anonymous daily totals (page, event name, referrer host, country code, device type).
// No IP address, cookie, visitor id or user agent is stored. "Do Not Track" and Global Privacy Control are respected.
const EVENTS = ["whatsapp_click", "email_click", "booking_click", "upwork_click", "cta_click", "social_click", "generate_lead", "ai_referral"];
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|node-fetch/i;
const ok = () => new Response(null, { status: 204 });
const clean = (v, n) => String(v || "").replace(/[^\w\-./:@ ]/g, "").slice(0, n);
const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  if (req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return ok();
  if (BOT.test(req.headers.get("user-agent") || "")) return ok();
  let b;
  try { const t = await req.text(); if (t.length > 2000) return ok(); b = JSON.parse(t); } catch { return ok(); }

  const day = new Date().toISOString().slice(0, 10);
  const path = clean(String(b.p || "").split(/[?#]/)[0], 120) || "/";
  if (/^\/(dashboard|admin|api)\b/.test(path)) return ok();
  const store = getStore("activity");
  let d;
  try { d = (await store.get(day, { type: "json" })) || {}; } catch { d = {}; }
  for (const k of ["pv", "ev", "ref", "cc", "dev", "src"]) d[k] = d[k] || {};
  d.sessions = d.sessions || 0;

  if (b.t === "pv") {
    bump(d.pv, path);
    if (b.s) {                                          // first page of a browser-tab session
      d.sessions++;
      bump(d.ref, clean(b.ref, 60) || "(direct)");
      bump(d.dev, b.m ? "mobile" : "desktop");
      const cc = clean(context?.geo?.country?.code, 2).toUpperCase();
      if (cc) bump(d.cc, cc);
      const src = clean(b.u, 40); if (src) bump(d.src, src);
    }
  } else if (b.t === "ev" && EVENTS.includes(b.e)) {
    bump(d.ev, b.e);
    const k = b.e + " @ " + (clean(b.l, 40) || "other");
    bump(d.ev, k);
  } else return ok();

  try { await store.setJSON(day, d); } catch (e) { console.error("track store error", e?.name); }
  return ok();
};

export const config = { path: "/api/track" };
