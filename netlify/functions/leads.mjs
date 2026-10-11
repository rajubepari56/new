import { getStore } from "@netlify/blobs";
import { authorised, json } from "../lib/auth.mjs";

// GET /api/leads : form submissions (from Netlify Forms) merged with status and notes saved in Blobs.
export default async (req) => {
  if (!authorised(req)) return json({ error: "unauthorised" }, 401);
  const token = Netlify.env.get("NETLIFY_API_TOKEN");
  const siteId = Netlify.env.get("SITE_ID");
  if (!token || !siteId) return json({ error: "missing_env", detail: "Set NETLIFY_API_TOKEN and SITE_ID." }, 500);

  const headers = { authorization: `Bearer ${token}` };
  const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, { headers });
  if (!formsRes.ok) return json({ error: "netlify_api", status: formsRes.status }, 502);
  const forms = (await formsRes.json()).filter((f) => f.name === "contact");

  const leads = [];
  for (const f of forms) {
    for (let page = 1; page <= 10; page++) {
      const r = await fetch(`https://api.netlify.com/api/v1/forms/${f.id}/submissions?per_page=100&page=${page}`, { headers });
      if (!r.ok) return json({ error: "netlify_api", status: r.status }, 502);
      const rows = await r.json();
      for (const s of rows) {
        const d = s.data || {};
        leads.push({
          id: s.id, created_at: s.created_at,
          name: d.name || s.name || "", email: d.email || s.email || "", phone: d.phone || "",
          country: d.country || "", company: d.company || "", website: d.website || "",
          service: d.service || "", budget: d.budget || "", preferred_contact: d.preferred_contact || "",
          message: d.message || "", source: d.source || "",
        });
      }
      if (rows.length < 100) break;
    }
  }

  const store = getStore("lead-meta");
  await Promise.all(leads.map(async (l) => {
    const m = await store.get(l.id, { type: "json" }).catch(() => null);
    l.status = (m && m.status) || "new";
    l.notes = (m && m.notes) || "";
  }));
  leads.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return json({ leads });
};

export const config = { path: "/api/leads" };
