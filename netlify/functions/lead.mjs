import { getStore } from "@netlify/blobs";
import { validateLead } from "../lib/lead-schema.mjs";
import crypto from "node:crypto";

// POST /api/lead : validates the contact form again on the server, forwards it to your n8n webhook
// (URL kept in the N8N_WEBHOOK_URL environment variable) and keeps a copy for the /dashboard/.
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const MIN_FILL_MS = 3000;       // faster than this is almost certainly a bot
const MAX_PER_HOUR = 5;         // submissions per visitor per hour

export default async (req, context) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  // Same-origin only
  const site = (Netlify.env.get("SITE_URL") || "https://rajubepari.netlify.app").replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin && origin.replace(/\/$/, "") !== site && !/^https?:\/\/localhost(:\d+)?$/.test(origin) && !origin.endsWith(".netlify.app")) {
    return json({ ok: false, error: "forbidden_origin" }, 403);
  }

  let raw;
  try {
    const text = await req.text();
    if (text.length > 12000) return json({ ok: false, error: "payload_too_large" }, 413);
    raw = JSON.parse(text);
  } catch { return json({ ok: false, error: "bad_json" }, 400); }

  // Bot traps: honeypot and minimum fill time. Answer "ok" so bots learn nothing; store nothing.
  if (raw["bot-field"] || raw.bot_field) return json({ ok: true });
  if (!(Number(raw.elapsed_ms) >= MIN_FILL_MS)) return json({ ok: true });

  const { errors, lead } = validateLead(raw);
  if (Object.keys(errors).length) return json({ ok: false, error: "validation", fields: errors }, 422);

  const leads = getStore("leads");
  const id = lead.submission_id || crypto.randomUUID();
  try {
    // Duplicate submissions (double click, retry) with the same id are accepted once
    if (await leads.get(id)) return json({ ok: true, id, duplicate: true });

    // Light rate limit per visitor; only a salted hash of the IP is used, never stored raw
    const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
    const hash = crypto.createHash("sha256").update(ip + (Netlify.env.get("LEAD_HASH_SALT") || "salt")).digest("hex").slice(0, 24);
    const rl = getStore("lead-rate"), key = `${hash}-${new Date().toISOString().slice(0, 13)}`;
    const count = Number(await rl.get(key)) || 0;
    if (count >= MAX_PER_HOUR) return json({ ok: false, error: "rate_limited" }, 429);
    await rl.set(key, String(count + 1));
  } catch (e) { console.error("lead guard store error", e?.name); }

  const payload = { ...lead, submission_id: id, submitted_at: new Date().toISOString() };
  delete payload.consent; payload.consent = true;

  // Forward to n8n (server side only, so the webhook URL is never visible in the browser)
  let delivery = "stored", forward = "not_configured";
  const hook = Netlify.env.get("N8N_WEBHOOK_URL");
  if (hook) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
      const headers = { "content-type": "application/json" };
      const secret = Netlify.env.get("N8N_WEBHOOK_SECRET"); if (secret) headers["x-webhook-secret"] = secret;
      const r = await fetch(hook, { method: "POST", headers, body: JSON.stringify(payload), signal: ctl.signal });
      clearTimeout(t);
      if (r.ok) { delivery = "n8n"; forward = "ok"; } else { forward = "failed_" + r.status; }
    } catch (e) { forward = "failed_" + (e?.name || "error"); }
  }

  // Keep a copy (used by /dashboard/). Without it a failed forward would lose the lead.
  try { await leads.setJSON(id, { ...payload, forward }); }
  catch (e) {
    console.error("lead store error", e?.name);
    if (delivery !== "n8n") return json({ ok: false, error: "could_not_save" }, 502);
  }
  if (forward.startsWith("failed")) console.error("n8n forward failed:", forward);
  return json({ ok: true, id, delivery });
};

export const config = { path: "/api/lead" };
