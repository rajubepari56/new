# n8n workflow for the contact form

Status: **documented only. Nothing here is connected until you build and test it.** The website sends leads to `/api/lead` (a Netlify Function), which forwards them to the webhook URL you store in a server-side environment variable.

```
Website form -> /api/lead (Netlify Function) -> n8n Webhook -> Google Sheets -> Email (-> optional WhatsApp alert)
```

Sample payload: `docs/sample-lead-payload.json` (test data only).

## Nodes to build

1. **Webhook** (POST, "Respond: Immediately", path of your choice, authentication: Header Auth).
   Create a header `x-webhook-secret` with a long random value. Put the same value in Netlify as `N8N_WEBHOOK_SECRET`.
2. **IF** node: `{{ $json.headers['x-webhook-secret'] === 'YOUR-SECRET' }}` (or use the Header Auth credential). If false, stop.
3. **Code** node (validate again, never trust the website). Paste:

```js
const b = $input.first().json.body ?? $input.first().json;
const BUSINESS = ["Local service business","Ecommerce","Agency","Other"];
const SERVICES = ["Google Ads Management","GA4 Setup & Audit","Google Tag Manager","Meta Pixel & Conversions API","Server-Side Tracking (sGTM)","Enhanced & Offline Conversions","Google Merchant Center","Local SEO","Not sure, need an audit"];
const BUDGETS = ["Under $1,000","$1,000-$5,000","$5,000-$20,000","$20,000+"];
const GOALS = ["More leads","Higher ROAS","Fix tracking","Other"];
const PREFS = ["WhatsApp","Email"];
const clean = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n);
const lead = {
  submission_id: clean(b.submission_id, 64),
  submitted_at: new Date().toISOString(),
  name: clean(b.name, 100), email: clean(b.email, 254).toLowerCase(), website: clean(b.website, 200),
  business_type: clean(b.business_type, 40), service: clean(b.service, 60), budget: clean(b.budget, 30),
  goal: clean(b.goal, 30), message: clean(b.message, 3000), preferred_contact: clean(b.preferred_contact, 20),
  phone: clean(b.phone, 30), page: clean(b.page, 120), source: clean(b.source, 60),
};
const errors = [];
if (lead.name.length < 2) errors.push("name");
if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.push("email");
if (!/^https?:\/\/[^\s/]+\.[^\s/]{2,}/i.test(lead.website)) errors.push("website");
if (!BUSINESS.includes(lead.business_type)) errors.push("business_type");
if (!SERVICES.includes(lead.service)) errors.push("service");
if (lead.budget && !BUDGETS.includes(lead.budget)) errors.push("budget");
if (!GOALS.includes(lead.goal)) errors.push("goal");
if (!PREFS.includes(lead.preferred_contact)) errors.push("preferred_contact");
if (lead.preferred_contact === "WhatsApp" && !/^\+?[0-9 ()\-]{7,20}$/.test(lead.phone)) errors.push("phone");
if (b.consent !== true) errors.push("consent");
return [{ json: { ok: errors.length === 0, errors, lead } }];
```

4. **IF** `{{ $json.ok }}` is true. The false branch goes to a "Log invalid" node (do not store personal data, only the list of invalid fields).
5. **Remove Duplicates** (or a Google Sheets "Lookup row" on `submission_id`) so a retry never creates two rows.
6. **Google Sheets: Append row.** Columns: `submitted_at, submission_id, name, email, website, business_type, service, budget, goal, preferred_contact, phone, message, page, source, status`. Set `status` to `new`.
7. **Email (Gmail or SMTP).** To: your address. Subject: `New lead: {{ $json.lead.service }} ({{ $json.lead.business_type }})`. Body: the fields above plus a WhatsApp link `https://wa.me/<digits of phone>`.
8. **Optional WhatsApp alert** (WhatsApp Business Cloud API or a service you already use). Send yourself a short message with name, service and budget. Skip this node if you do not have an approved WhatsApp API number.
9. **Respond** with HTTP 200 and `{ "ok": true }`. (The Netlify Function treats any 2xx as delivered.)

Add an **Error Trigger** workflow that emails you when this workflow fails, so a failed lead is never silent. Leads are also kept in Netlify Blobs and appear in `/dashboard/` (the `forward` field says `ok` or `failed_...`).

## Environment variables (Netlify > Site configuration > Environment variables)

| Name | Purpose |
|---|---|
| `N8N_WEBHOOK_URL` | Your n8n production webhook URL. Never put this in the website code. |
| `N8N_WEBHOOK_SECRET` | Optional but recommended shared secret, sent as `x-webhook-secret`. |
| `SITE_URL` | Optional. Defaults to `https://rajubepari.netlify.app`. Used for the same-origin check. |
| `LEAD_HASH_SALT` | Optional random string used when hashing IP addresses for rate limiting. |

## Rotating the webhook URL if it is abused

1. In n8n, create a new Webhook node path (or regenerate the secret) and activate it.
2. Update `N8N_WEBHOOK_URL` (and `N8N_WEBHOOK_SECRET`) in Netlify, then **redeploy**.
3. Deactivate the old webhook path in n8n.
No website file changes are needed, because the browser never sees the URL.

## If you ever host on static-only hosting (for example GitHub Pages)

Netlify Functions would not run there, so the webhook URL would have to be in the browser. If you move, ask me first. In that case: keep the honeypot and minimum-time check (already in the form), validate every field again in the Code node above, add the secret as a query parameter that you can rotate, and rotate the URL as described when it is abused.

## What is protected today

- Honeypot field and a 3-second minimum fill time (bots get a silent "ok", nothing is stored).
- Validation in the browser, again in the function, and again in n8n.
- Same-origin check, 12 KB payload limit, 5 submissions per visitor per hour (salted IP hash, not stored raw).
- Duplicate protection by `submission_id`.
- No secrets in the browser. Only what the visitor typed is stored or forwarded.
