/* Anonymous activity counters for my own dashboard. Sends only: page path, event name, referrer host, device type.
   No cookies, no visitor id, no personal data. Skipped when Do Not Track or Global Privacy Control is on. */
(function () {
  'use strict';
  var n = navigator, w = window, d = document;
  if (n.doNotTrack === '1' || n.globalPrivacyControl === true) return;
  if (/^\/(dashboard|admin)/.test(location.pathname)) return;
  function send(o) {
    try { var blob = new Blob([JSON.stringify(o)], { type: 'application/json' }); if (!(n.sendBeacon && n.sendBeacon('/api/track', blob))) fetch('/api/track', { method: 'POST', body: JSON.stringify(o), keepalive: true }); } catch (e) {}
  }
  var first = false;
  try { first = !sessionStorage.getItem('rb_s'); sessionStorage.setItem('rb_s', '1'); } catch (e) {}
  var ref = ''; try { var r = new URL(d.referrer); if (r.host !== location.host) ref = r.host.replace(/^www\./, ''); } catch (e) {}
  var utm = ''; try { utm = new URLSearchParams(location.search).get('utm_source') || ''; } catch (e) {}
  send({ t: 'pv', p: location.pathname, s: first ? 1 : 0, ref: ref, u: utm, m: w.matchMedia('(max-width: 860px)').matches ? 1 : 0 });
  /* every business event pushed to the dataLayer is counted once */
  var EV = { whatsapp_click: 1, email_click: 1, booking_click: 1, upwork_click: 1, cta_click: 1, social_click: 1, generate_lead: 1, ai_referral: 1 };
  w.dataLayer = w.dataLayer || [];
  var orig = w.dataLayer.push.bind(w.dataLayer);
  w.dataLayer.push = function () {
    for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; if (a && EV[a.event]) send({ t: 'ev', e: a.event, l: a.link_location || a.form_location || '', p: location.pathname }); }
    return orig.apply(null, arguments);
  };
  /* visits that arrive from an AI assistant (ChatGPT adds utm_source=chatgpt.com to links it shows) are labelled once per session */
  var AI = /chatgpt\.com|chat\.openai\.com|openai|perplexity|gemini\.google|bard\.google|copilot\.microsoft|claude\.ai|you\.com|phind|poe\.com|meta\.ai|grok/i, src = AI.test(ref) ? ref : (AI.test(utm) ? utm : '');
  if (src && first) w.dataLayer.push({ event: 'ai_referral', ai_source: src.toLowerCase().replace(/^www\./, ''), landing_page: location.pathname });
})();
