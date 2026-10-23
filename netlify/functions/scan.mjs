import dns from "node:dns/promises";
import net from "node:net";

// POST /api/scan { url } : read-only tracking checker.
// Fetches the public HTML of a site (and the public GTM container script it references) and reports which tracking tags are visible there.
// Safety: http(s) only, public IPs only (re-checked on every redirect), 8 s timeout, 1.5 MB cap, nothing is stored.
const UA = "Mozilla/5.0 (compatible; RajuBepariTrackingChecker/1.0; +https://rajubepari.netlify.app/tracking-checker/)";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function privateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return privateIp(v.slice(7));
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
}
async function assertPublic(u) {
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http and https addresses can be checked.");
  if (u.port && !["80", "443"].includes(u.port)) throw new Error("Only standard web ports can be checked.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") && !net.isIP(host)) throw new Error("Enter a full website address, like example.com.");
  const ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(privateIp)) throw new Error("That address is not a public website.");
}
async function get(url, max = 1.5e6, hops = 4) {
  let u = new URL(url);
  for (let i = 0; i <= hops; i++) {
    await assertPublic(u);
    const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "user-agent": UA, accept: "text/html,application/javascript,*/*;q=0.8" } });
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { u = new URL(r.headers.get("location"), u); continue; }
    const reader = r.body.getReader(); const chunks = []; let n = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; n += value.length; chunks.push(value); if (n > max) { reader.cancel(); break; } }
    return { status: r.status, url: u.href, text: Buffer.concat(chunks).toString("utf8") };
  }
  throw new Error("Too many redirects.");
}
const uniq = (a) => [...new Set(a)];
const all = (re, s) => uniq([...s.matchAll(re)].map((m) => m[1]));

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let input;
  try { input = JSON.parse(await req.text()).url; } catch { return json({ error: "Send a website address." }, 400); }
  input = String(input || "").trim().slice(0, 300);
  if (!input) return json({ error: "Enter your website address." }, 400);
  if (!/^https?:\/\//i.test(input)) input = "https://" + input;
  let page;
  try { new URL(input); page = await get(input); } catch (e) {
    const m = String(e.message || "");
    return json({ error: /not a public|Only|Enter a full|redirect/.test(m) ? m : "I could not load that page. Check the address and that the site is public." }, 422);
  }
  const html = page.text, found = { page: page.url, status: page.status };

  const gtmIds = all(/GTM-[A-Z0-9]{4,8}/g, html).length ? uniq(html.match(/GTM-[A-Z0-9]{4,8}/g)) : [];
  let container = "";
  for (const id of gtmIds.slice(0, 2)) {                       // the public container script lists the tags published in it
    try { container += (await get(`https://www.googletagmanager.com/gtm.js?id=${id}`, 800000, 0)).text; } catch { /* container unreachable */ }
  }
  const src = html + "\n" + container;
  const has = (re) => re.test(src);

  const ga4 = uniq(src.match(/\bG-[A-Z0-9]{8,12}\b/g) || []);
  const ua = uniq(src.match(/\bUA-\d{4,10}-\d{1,3}\b/g) || []);
  const aw = uniq(src.match(/\bAW-\d{6,12}\b/g) || []);
  const fb = uniq([...src.matchAll(/fbq\(\s*['"]init['"]\s*,\s*['"]?(\d{8,18})/g)].map((m) => m[1]));
  const customGtm = /<script[^>]+src=["']https?:\/\/(?!www\.googletagmanager\.com)[^"']+\/gtm\.js\?id=GTM-/i.test(html) || /server_container_url|transport_url/.test(src);
  const consentMode = has(/gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/) || has(/ad_user_data/) || has(/"ad_storage"/);
  const cmp = (/cookiebot/i.test(src) && "Cookiebot") || (/onetrust|optanon/i.test(src) && "OneTrust") || (/cookieyes/i.test(src) && "CookieYes") || (/iubenda/i.test(src) && "iubenda") || (/termly/i.test(src) && "Termly") || (/complianz/i.test(src) && "Complianz") || (/usercentrics/i.test(src) && "Usercentrics") || "";
  const platform = (/cdn\.shopify\.com|Shopify\.theme/i.test(html) && "Shopify") || (/wp-content|wp-includes/i.test(html) && "WordPress") || (/wixstatic|wix\.com/i.test(html) && "Wix") || (/squarespace/i.test(html) && "Squarespace") || (/webflow/i.test(html) && "Webflow") || (/woocommerce/i.test(html) && "WooCommerce") || "";
  const title = (html.match(/<title[^>]*>([^<]{1,120})/i) || [])[1] || "";

  const tags = [
    { key: "gtm", name: "Google Tag Manager", ok: gtmIds.length > 0, detail: gtmIds.join(", ") },
    { key: "ga4", name: "Google Analytics 4", ok: ga4.length > 0, detail: ga4.join(", ") },
    { key: "ads", name: "Google Ads tag / conversions", ok: aw.length > 0, detail: aw.join(", ") },
    { key: "meta", name: "Meta Pixel", ok: fb.length > 0 || has(/connect\.facebook\.net\/[^"']*fbevents\.js/), detail: fb.join(", ") },
    { key: "tiktok", name: "TikTok Pixel", ok: has(/analytics\.tiktok\.com|ttq\.load/), detail: "" },
    { key: "linkedin", name: "LinkedIn Insight Tag", ok: has(/snap\.licdn\.com|_linkedin_partner_id/), detail: "" },
    { key: "bing", name: "Microsoft Ads (UET)", ok: has(/bat\.bing\.com/), detail: "" },
    { key: "clarity", name: "Microsoft Clarity", ok: has(/clarity\.ms/), detail: "" },
    { key: "hotjar", name: "Hotjar", ok: has(/static\.hotjar\.com|hjid/), detail: "" },
    { key: "consent", name: "Consent Mode signals", ok: consentMode, detail: cmp ? "Banner: " + cmp : "" },
    { key: "server", name: "Server-side tagging (custom GTM domain)", ok: customGtm, detail: "" },
  ];
  const notes = [];
  if (!gtmIds.length) notes.push("No Google Tag Manager container is visible. Tags may be hard-coded in the theme, which is harder to audit and change safely.");
  if (!ga4.length && !ua.length) notes.push("No Google Analytics ID was found in the page source or the GTM container.");
  if (ua.length && !ga4.length) notes.push("Only a legacy Universal Analytics ID (" + ua[0] + ") was found. Universal Analytics stopped processing data in 2023, so this tag is not collecting anything useful.");
  if (ga4.length > 1) notes.push("More than one GA4 ID is present (" + ga4.join(", ") + "). That is sometimes intentional, but it often means duplicated page views or conversions.");
  if ((aw.length || fb.length || has(/linkedin|tiktok/)) && !consentMode) notes.push("Advertising tags are present but no Consent Mode v2 signals were found. For EEA, UK and some other traffic, Google can ignore audience and conversion data without them.");
  if (fb.length && !customGtm) notes.push("A Meta Pixel is present. I cannot see from outside whether the Conversions API is also sending events, which is what protects you from browser and iOS losses.");
  if (aw.length === 0 && (fb.length || ga4.length)) notes.push("I could not see a Google Ads conversion tag. If you run Google Ads, check that conversions are tracked and imported correctly.");
  return json({ ok: true, ...found, title: title.trim(), platform, cmp, tags, notes,
    limits: "This reads only what is publicly visible in the page source and the published GTM container. Tags loaded after consent, behind logins, or on other pages can be missed, and a tag being present does not prove it fires correctly." });
};

export const config = { path: "/api/scan" };
