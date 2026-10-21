import { getStore } from "@netlify/blobs";
import { authorised, json } from "../lib/auth.mjs";

// GET /api/leads : form submissions (from Netlify Forms) merged with status and notes saved in Blobs.
export default async (req) => {
  if (!authorised(req)) return json({ error: "unauthorised" }, 401);
  const token = Netlify.env.get("NETLIFY_API_TOKEN");
  const siteId = Netlify.env.get("SITE_ID");
  const leads = [];

  // 1) Leads received through /api/lead (kept in Netlify Blobs)
  try {
    const ls = getStore("leads");
    const { blobs } = await ls.list();
    await Promise.all(blobs.map(async (b) => {
      const d = await ls.get(b.key, { type: "json" }).catch(() => null);
      if (!d) return;
      leads.push({
        id: b.key, created_at: d.submitted_at, name: d.name || "", email: d.email || "", phone: d.phone || "",
        country: "", company: "", website: d.website || "", service: d.service || "", budget: d.budget || "",
        preferred_contact: d.preferred_contact || "", message: d.message || "", source: d.source || d.page || "",
        business_type: d.business_type || "", goal: d.goal || "", forward: d.forward || "",
      });
    }));
  } catch (e) { console.error("blob list error", e?.name); }

  // 2) Leads received through Netlify Forms (older form, or the fallback when the function is unavailable)
  if (token && siteId) {
    const headers = { authorization: `Bearer ${token}` };
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, { headers });
    if (formsRes.ok) {
      const forms = (await formsRes.json()).filter((f) => f.name === "contact");
      for (const f of forms) {
        for (let page = 1; page <= 10; page++) {
          const r = await fetch(`https://api.netlify.com/api/v1/forms/${f.id}/submissions?per_page=100&page=${page}`, { headers });
          if (!r.ok) break;
          const rows = await r.json();
          for (const s of rows) {
            const d = s.data || {};
            if (d.submission_id && leads.some((l) => l.id === d.submission_id)) continue;
            leads.push({
              id: s.id, created_at: s.created_at, name: d.name || s.name || "", email: d.email || s.email || "", phone: d.phone || "",
              country: d.country || "", company: d.company || "", website: d.website || "", service: d.service || "", budget: d.budget || "",
              preferred_contact: d.preferred_contact || "", message: d.message || "", source: d.source || "",
              business_type: d.business_type || "", goal: d.goal || "", forward: "netlify-forms",
            });
          }
          if (rows.length < 100) break;
        }
      }
    }
  } else if (!leads.length) {
    return json({ leads: [], note: "Set NETLIFY_API_TOKEN and SITE_ID to also read Netlify Forms submissions." });
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
