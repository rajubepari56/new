// Single source of truth for contact-form validation. The same rules are documented for the n8n workflow in docs/N8N-WORKFLOW.md.
export const BUSINESS_TYPES = ["Local service business", "Ecommerce", "Agency", "Other"];
export const SERVICES = [
  "Google Ads Management", "GA4 Setup & Audit", "Google Tag Manager", "Meta Pixel & Conversions API",
  "Server-Side Tracking (sGTM)", "Enhanced & Offline Conversions", "Google Merchant Center", "Local SEO",
  "Not sure, need an audit",
];
export const BUDGETS = ["Under $1,000", "$1,000-$5,000", "$5,000-$20,000", "$20,000+"];
export const GOALS = ["More leads", "Higher ROAS", "Fix tracking", "Other"];
export const CONTACT_PREFS = ["WhatsApp", "Email"];

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

export function normaliseUrl(v) {
  let s = clean(v, 200);
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return "";
    return u.toString();
  } catch { return ""; }
}

/** Returns { errors: {field: message}, lead } . `lead` only contains whitelisted, cleaned fields. */
export function validateLead(b) {
  const errors = {};
  const lead = {
    name: clean(b.name, 100),
    email: clean(b.email, 254).toLowerCase(),
    website: normaliseUrl(b.website),
    business_type: clean(b.business_type, 40),
    service: clean(b.service, 60),
    budget: clean(b.budget, 30),
    goal: clean(b.goal, 30),
    message: clean(b.message, 3000),
    preferred_contact: clean(b.preferred_contact, 20),
    phone: clean(b.phone, 30),
    source: clean(b.source, 60).replace(/[^a-z0-9_-]/gi, ""),
    page: clean(b.page, 120),
    submission_id: clean(b.submission_id, 64).replace(/[^a-z0-9-]/gi, ""),
    consent: b.consent === true || b.consent === "true" || b.consent === "on",
  };
  if (lead.name.length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL_RE.test(lead.email)) errors.email = "Please enter a valid email address.";
  if (!lead.website) errors.website = "Please enter your website address, for example example.com.";
  if (!BUSINESS_TYPES.includes(lead.business_type)) errors.business_type = "Please choose your business type.";
  if (!SERVICES.includes(lead.service)) errors.service = "Please choose the service you need.";
  if (lead.budget && !BUDGETS.includes(lead.budget)) errors.budget = "Please choose one of the budget ranges, or leave it empty.";
  if (!GOALS.includes(lead.goal)) errors.goal = "Please choose your main goal.";
  if (!CONTACT_PREFS.includes(lead.preferred_contact)) errors.preferred_contact = "Please choose how I should reach you.";
  if (lead.preferred_contact === "WhatsApp" && !/^\+?[0-9 ()\-]{7,20}$/.test(lead.phone)) errors.phone = "Please enter your WhatsApp number with the country code.";
  if (lead.preferred_contact !== "WhatsApp") lead.phone = lead.phone && /^\+?[0-9 ()\-]{7,20}$/.test(lead.phone) ? lead.phone : "";
  if (!lead.consent) errors.consent = "Please tick the box so I may contact you about your enquiry.";
  if (!lead.submission_id) lead.submission_id = "";
  return { errors, lead };
}
