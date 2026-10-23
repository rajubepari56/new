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
  let siteType = "leads";
  try { const body = JSON.parse(await req.text()); input = body.url; if (body.type === "store") siteType = "store"; } catch { return json({ error: "Send a website address." }, 400); }
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
  const customGtm = /<script[^>]+src=["']https?:\/\/(?!www\.googletagmanager\.com)[^"']+\/gtm\.js\?id=GTM-/i.test(html) || /["']?(?:server_container_url|transport_url)["']?\s*[:,]\s*["']https?:\/\/(?!(?:www\.)?(?:google|googletagmanager)\.)[^"'\s]+/i.test(src);
  const consentMode = has(/gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/) || has(/ad_user_data/) || has(/"ad_storage"/);
  const cmp = (/cookiebot/i.test(src) && "Cookiebot") || (/onetrust|optanon/i.test(src) && "OneTrust") || (/cookieyes/i.test(src) && "CookieYes") || (/iubenda/i.test(src) && "iubenda") || (/termly/i.test(src) && "Termly") || (/complianz/i.test(src) && "Complianz") || (/usercentrics/i.test(src) && "Usercentrics") || "";
  const platform = (/cdn\.shopify\.com|Shopify\.theme/i.test(html) && "Shopify") || (/wp-content|wp-includes/i.test(html) && "WordPress") || (/wixstatic|wix\.com/i.test(html) && "Wix") || (/squarespace/i.test(html) && "Squarespace") || (/webflow/i.test(html) && "Webflow") || (/woocommerce/i.test(html) && "WooCommerce") || (/bigcommerce/i.test(html) && "BigCommerce") || (/Magento|mage\/|\/static\/version/i.test(html) && "Magento") || (/prestashop/i.test(html) && "PrestaShop") || (/opencart/i.test(html) && "OpenCart") || "";
  const title = (html.match(/<title[^>]*>([^<]{1,120})/i) || [])[1] || "";

  /* ChatGPT Ads (OpenAI) pixel: loader from bzrcdn.openai.com, oaiq("init", id) and oaiq("measure", event, ...) */
  const q = `\\\\?["']`;
  const oaiLoader = /bzrcdn\.openai\.com/.test(src), oaiInit = [...src.matchAll(new RegExp(`oaiq\\(\\s*${q}init${q}\\s*,\\s*${q}([^"'\\\\]{6,64})`, "g"))].map((m) => m[1]);
  const oaiEv = uniq([...src.matchAll(new RegExp(`oaiq\\(\\s*${q}measure${q}\\s*,\\s*${q}([a-z_]{3,40})`, "g"))].map((m) => m[1]));
  const oaiPixel = oaiLoader || oaiInit.length > 0 || oaiEv.length > 0;
  const oaiMap = { generate_lead: "lead_created", purchase: "order_created" };
  const bare = html.length < 3000 && !gtmIds.length;
  const incomplete = page.status >= 400 ? "The site answered my scanner with status " + page.status + ", so I could not read the real page." : /just a moment|cf-chl|attention required|access denied|captcha|enable javascript/i.test(html.slice(0, 6000)) && html.length < 60000 ? "The site showed a bot-protection or JavaScript check instead of the page, so some or all tags could not be read." : bare ? "The page returned very little HTML, which usually means tags load only after JavaScript runs. Results below may miss tags that are really there." : "";
  const tags = [
    { key: "gtm", name: "Google Tag Manager", ok: gtmIds.length > 0, detail: gtmIds.join(", ") },
    { key: "ga4", name: "Google Analytics 4", ok: ga4.length > 0, detail: ga4.join(", ") },
    { key: "ads", name: "Google Ads tag / conversions", ok: aw.length > 0, detail: aw.join(", ") },
    { key: "meta", name: "Meta Pixel", ok: fb.length > 0 || has(/connect\.facebook\.net\/[^"']*fbevents\.js/), detail: fb.join(", ") },
    { key: "chatgpt", name: "ChatGPT Ads pixel (OpenAI)", ok: oaiPixel, detail: oaiInit[0] || "" },
    { key: "tiktok", name: "TikTok Pixel", ok: has(/analytics\.tiktok\.com|ttq\.load/), detail: "" },
    { key: "linkedin", name: "LinkedIn Insight Tag", ok: has(/snap\.licdn\.com|_linkedin_partner_id/), detail: "" },
    { key: "bing", name: "Microsoft Ads (UET)", ok: has(/bat\.bing\.com/), detail: "" },
    { key: "clarity", name: "Microsoft Clarity", ok: has(/clarity\.ms/), detail: "" },
    { key: "hotjar", name: "Hotjar", ok: has(/static\.hotjar\.com|hjid/), detail: "" },
    { key: "consent", name: "Consent Mode signals", ok: consentMode, detail: cmp ? "Banner: " + cmp : "" },
    { key: "server", name: "Server-side tagging (custom GTM domain)", ok: customGtm, detail: "" },
  ];
  /* ---- events: only strong signals count (GA4 event tags, custom-event triggers, fbq track calls, dataLayer pushes, gtag events) ---- */
  const ga4Ev = new Set([
    ...[...src.matchAll(/"vtp_eventName"\s*:\s*"([A-Za-z0-9_]{2,40})"/g)].map((m) => m[1]),
    ...[...src.matchAll(/gtag\(\s*['"]event['"]\s*,\s*['"]([A-Za-z0-9_]{2,40})['"]/g)].map((m) => m[1]),
    ...[...src.matchAll(/"arg1"\s*:\s*"([a-z][a-z0-9_]{2,40})"/g)].map((m) => m[1]),
    ...[...html.matchAll(/dataLayer\.push\(\s*\{[^}]*?event['"]?\s*:\s*['"]([A-Za-z0-9_]{2,40})['"]/g)].map((m) => m[1]),
  ]);
  const metaEv = new Set([...src.matchAll(/fbq\(\s*['"]track(?:Custom)?['"]\s*,\s*['"]([A-Za-z0-9_]{2,40})['"]/g)].map((m) => m[1]));
  const ecommerce = siteType === "store";   // the visitor chooses: two separate checks, no guessing
  const typeUsed = "chosen";
  const plan = ecommerce
    ? [["view_item", "ViewContent", "Product viewed"], ["add_to_cart", "AddToCart", "Item added to cart"], ["begin_checkout", "InitiateCheckout", "Checkout started"], ["purchase", "Purchase", "Order completed (with value and currency)"]]
    : [["generate_lead", "Lead", "Lead form submitted"], ["phone_call_click", "Contact", "Click on a phone number or call button"], ["email_click", "Contact", "Click on an email address"], ["whatsapp_click", "Contact", "WhatsApp click"], ["booking_click", "Schedule", "Booking or appointment started"]];
  const alias = {
    generate_lead: /(^|_)(generate_lead|lead|leads|form_?(submit|submission|success|sent)|submit_?form|ninja_form\w*|wpforms\w*|cf7\w*|gravity\w*|contact_form\w*)(_|$)/i,
    phone_call_click: /(phone|call|tel)(_|$)|click_to_call|(^|_)tel_/i,
    email_click: /(^|_)(email|mailto)(_|$)/i,
    whatsapp_click: /whatsapp|(^|_)wa_click/i,
    booking_click: /book|schedul|appointment|calendly/i,
  };
  const hit = (set, name) => [...set].some((e) => (alias[name] ? alias[name].test(e) : e === name));
  const events = plan.map(([name, metaName, label]) => ({ name, label, ga4: hit(ga4Ev, name), meta: metaEv.has(metaName) || metaEv.has(name), metaName, ok: !!(hit(ga4Ev, name) || metaEv.has(metaName) || (oaiMap[name] && oaiEv.includes(oaiMap[name]))), chatgpt: !!(oaiMap[name] && oaiEv.includes(oaiMap[name])) }));
  const matched = (e) => plan.some(([n]) => (alias[n] ? alias[n].test(e) : e === n));
  const standard = new Set(["page_view", "gtm.js", "gtm.dom", "gtm.load", "gtm.click", "gtm.linkClick", "gtm.formSubmit", "gtm.historyChange", "gtm.scrollDepth", "gtm.timer", "gtm.video", "gtm.elementVisibility", "gtm.triggerGroup", "gtm.init", "gtm.init_consent", "default", "granted", "denied"]);
  const custom = [...ga4Ev].filter((e) => !standard.has(e) && !matched(e) && !/^(time|timer|outbound|button_click|history|visibility|scroll_depth|user_engagement)$/i.test(e) && !/^gtm\./.test(e) && !/^(true|false|null|undefined|string|number|object|function|auto|none|gtag|config|set|js|get|consent|update|click|load|ready|submit|scroll|change|input|focus|blur|resize|text|url|path|host|href|name|value|type|id|class|class_name|tag|link|form|page|data|event|events|url_path|hostname)$/i.test(e) && /^[a-z][a-z0-9_]*$/.test(e) && e.length > 3).slice(0, 12);
  const labels = uniq([...src.matchAll(/(?:"vtp_conversionLabel"\s*:\s*"([\w-]{6,})"|send_to['"]?\s*[:=]\s*['"]AW-\d+\/([\w-]{6,}))/g)].map((m) => m[1] || m[2]));
  const missing = events.filter((e) => !e.ok);
  const pvOnlyMeta = fb.length > 0 && metaEv.size === 0;
  const issues = [];
  const add = (level, title, text) => issues.push({ level, title, text });
  if (!gtmIds.length) add("warn", "No Tag Manager container", "Tags may be hard-coded in the theme, which is harder to audit and change safely.");
  if (!ga4.length && !ua.length) add("bad", "No Google Analytics found", "I found no GA4 ID in the page or the GTM container.");
  if (ua.length && !ga4.length) add("bad", "Only legacy Universal Analytics", "Found " + ua[0] + ". Universal Analytics stopped processing data in 2023, so this tag collects nothing useful.");
  if (ga4.length > 1) add("warn", "More than one GA4 ID", ga4.join(", ") + ". Sometimes intentional, but often it means duplicated page views or conversions.");
  const hardGa4 = uniq([...html.matchAll(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/g)].map((m) => m[1]));
  if (hardGa4.some((g) => container.includes(g))) add("bad", "Possible double counting", "GA4 (" + hardGa4.find((g) => container.includes(g)) + ") is installed both in the page code and inside Tag Manager. Every event can be counted twice.");
  if (ga4.length && missing.length === events.length) add("bad", "GA4 is installed but no conversion events found", "I could see none of: " + events.map((e) => e.name).join(", ") + ". Without them GA4 only records page views, and Google Ads has nothing to optimise on.");
  if (aw.length && labels.length === 0) add("bad", "Google Ads tag without a conversion action", "The Ads ID " + aw[0] + " is present, but I found no conversion label. Smart Bidding may be learning from nothing.");
  if (pvOnlyMeta) add("warn", "Meta Pixel with page views only", "The pixel loads, but I found no Lead, Purchase or AddToCart event calls.");
  if (fb.length && !customGtm) add("info", "Meta Conversions API not visible", "I cannot see from outside whether CAPI also sends events. It protects you from browser and iOS losses.");
  if ((aw.length || fb.length || has(/linkedin|tiktok/)) && !consentMode) add("bad", "No Consent Mode v2 signals", "Advertising tags are present, but I found no consent signals. For EEA, UK and some other traffic, Google can ignore audience and conversion data without them.");
  if (ga4.length && !aw.length && !fb.length) add("info", "No ad conversion tags", "If you run ads, check that conversions reach Google Ads or Meta, not only GA4.");
  if (oaiPixel && oaiEv.length === 0) add("bad", "ChatGPT Ads pixel without conversion events", "The OpenAI pixel loads, but I found no oaiq(\"measure\", ...) calls, so ChatGPT Ads has no conversions to report or optimise on.");
  if (oaiPixel) add("info", "Check the oppref click ID survives", "ChatGPT Ads attribute clicks with the oppref parameter on your landing URL. Redirects, link shorteners or form pages that drop URL parameters break attribution.");
  if (oaiPixel && (oaiEv.includes("lead_created") || oaiEv.includes("order_created")) && !/event_id/.test(src)) add("warn", "No event_id found for deduplication", "If you also send conversions through the Conversions API, both calls need the same event_id or each conversion is counted twice.");
  if (incomplete) add("warn", "The scan may be incomplete", incomplete);
  const recommended = missing.slice(0, 4).map((e) => ({ name: e.name, label: e.label }));
  if (!oaiPixel && (aw.length || fb.length)) recommended.push({ name: "oaiq measure", label: "ChatGPT Ads conversion tracking (if you advertise there)" });
  if (!consentMode && (aw.length || fb.length)) recommended.push({ name: "consent_update", label: "Consent Mode v2" });
  if (!customGtm && (aw.length || fb.length)) recommended.push({ name: "server_side", label: "Server-side tracking" });
  return json({ ok: true, ...found, title: title.trim(), platform, cmp, tags, events, custom, conversionLabels: labels.length, siteType: ecommerce ? "store" : "leads",  incomplete, chatgptEvents: oaiEv, issues, recommended, ecommerce,
    limits: "This reads only what is publicly visible in the page source and the published GTM container. Tags loaded after consent, behind logins, or on other pages can be missed, and a tag being present does not prove it fires correctly." });
};

export const config = { path: "/api/scan" };
