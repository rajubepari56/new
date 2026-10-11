import { getStore } from "@netlify/blobs";
import { authorised, json } from "../lib/auth.mjs";

const STATUSES = ["new", "contacted", "call-booked", "proposal", "won", "lost", "spam"];

// POST /api/lead-update  { id, status, notes }
export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!authorised(req)) return json({ error: "unauthorised" }, 401);
  let b;
  try { b = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  if (!b.id || typeof b.id !== "string" || !/^[a-zA-Z0-9]+$/.test(b.id)) return json({ error: "bad_id" }, 400);
  const status = STATUSES.includes(b.status) ? b.status : "new";
  const notes = String(b.notes || "").slice(0, 4000);
  await getStore("lead-meta").setJSON(b.id, { status, notes, updated: new Date().toISOString() });
  return json({ ok: true });
};

export const config = { path: "/api/lead-update" };
