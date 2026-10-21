/* Qualifying contact form. Validates in the browser for a good experience (the server and n8n validate again),
   posts JSON to /api/lead, and falls back to Netlify Forms only if that function is not deployed. */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var summary = document.getElementById('form-summary'), live = document.getElementById('form-live');
  var btn = document.getElementById('form-submit'), label = btn.querySelector('.btn__label');
  var phoneWrap = document.getElementById('phone-wrap'), phone = document.getElementById('f-phone');
  var started = Date.now(), sending = false, TIMEOUT = 12000;
  var KEY = 'rb_form_entries', EVT = 'rb_lead_event';

  var LABELS = { name: 'Full name', email: 'Business email', website: 'Website', business_type: 'Business type', service: 'Service needed', goal: 'Main goal', budget: 'Monthly ad budget', preferred_contact: 'Preferred contact', phone: 'WhatsApp number', message: 'Project details' };
  var EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

  function uuid() { try { return crypto.randomUUID(); } catch (e) { return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } }
  var sid = null;
  try { sid = sessionStorage.getItem('rb_lead_sid'); } catch (e) {}
  if (!sid) { sid = uuid(); try { sessionStorage.setItem('rb_lead_sid', sid); } catch (e) {} }
  form.elements['submission_id'].value = sid;
  form.elements['page'].value = location.pathname;

  try {
    var qp = new URLSearchParams(location.search);
    var slug = qp.get('service');
    if (slug) { var opt = form.querySelector('option[data-slug="' + slug.replace(/[^a-z0-9-]/gi, '') + '"]'); if (opt) opt.selected = true; }
    var src = qp.get('source'); if (src) form.elements['source'].value = src.replace(/[^a-z0-9_-]/gi, '').slice(0, 60);
  } catch (e) {}

  /* WhatsApp number only matters when WhatsApp is the preferred contact */
  function syncPhone() {
    var wa = form.elements['preferred_contact'].value === 'WhatsApp';
    phoneWrap.hidden = !wa; phone.required = wa;
  }
  [].forEach.call(form.querySelectorAll('input[name=preferred_contact]'), function (r) { r.addEventListener('change', syncPhone); });
  syncPhone();

  function field(name) { return form.elements[name]; }
  function errEl(name) { return document.getElementById('e-' + name); }
  function setErr(name, msg) {
    var el = field(name), e = errEl(name); if (!el || !e) return;
    if (msg) { e.textContent = msg; e.hidden = false; el.setAttribute('aria-invalid', 'true'); }
    else { e.textContent = ''; e.hidden = true; el.removeAttribute('aria-invalid'); }
  }
  function checks() {
    var v = function (n) { return (field(n).value || '').trim(); }, e = {};
    if (v('name').length < 2) e.name = 'Please enter your full name.';
    if (!EMAIL.test(v('email'))) e.email = 'Please enter a valid email address, for example name@company.com.';
    var w = v('website').replace(/^https?:\/\//i, '');
    if (!/^[^\s\/]+\.[^\s\/]{2,}/.test(w)) e.website = 'Please enter your website address, for example example.com.';
    if (!v('business_type')) e.business_type = 'Please choose your business type.';
    if (!v('service')) e.service = 'Please choose the service you need.';
    if (!v('goal')) e.goal = 'Please choose your main goal.';
    if (form.elements['preferred_contact'].value === 'WhatsApp' && !/^\+?[0-9 ()\-]{7,20}$/.test(v('phone'))) e.phone = 'Please enter your WhatsApp number with the country code.';
    if (!field('consent').checked) e.consent = 'Please tick the box so I may contact you about your enquiry.';
    return e;
  }
  function showErrors(errs) {
    Object.keys(LABELS).concat(['consent']).forEach(function (n) { setErr(n, errs[n] || ''); });
    var keys = Object.keys(errs);
    if (!keys.length) { summary.hidden = true; summary.textContent = ''; return true; }
    summary.textContent = keys.length === 1 ? 'Please fix one thing before sending.' : 'Please fix ' + keys.length + ' things before sending.';
    summary.hidden = false; summary.className = 'form-summary';
    var first = field(keys[0]); if (first && first.focus) first.focus();
    return false;
  }
  form.addEventListener('input', function (ev) { var n = ev.target.name; if (n && errEl(n) && !errEl(n).hidden) { var e = checks(); setErr(n, e[n] || ''); } });
  form.addEventListener('change', function (ev) { var n = ev.target.name; if (n && errEl(n) && !errEl(n).hidden) { var e = checks(); setErr(n, e[n] || ''); } });

  function setSending(on) {
    sending = on; btn.disabled = on; btn.setAttribute('aria-busy', on ? 'true' : 'false'); form.classList.toggle('is-sending', on);
    label.textContent = on ? 'Sending...' : 'Send enquiry';
    live.textContent = on ? 'Sending your enquiry...' : '';
  }
  function problem(msg, withFallback) {
    summary.className = 'form-summary form-summary--error'; summary.textContent = '';
    summary.appendChild(document.createTextNode(msg));
    if (withFallback) {
      var text = 'Hi Raju, I tried the website form. ' + ['name', 'email', 'website', 'service'].map(function (k) { return LABELS[k] + ': ' + field(k).value; }).join('. ');
      var wa = document.createElement('a'); wa.href = 'https://wa.me/' + (form.getAttribute('data-wa') || '') + '?text=' + encodeURIComponent(text); wa.target = '_blank'; wa.rel = 'noopener'; wa.textContent = 'message me on WhatsApp';
      var mail = document.createElement('a'); mail.href = 'mailto:' + (form.getAttribute('data-mail') || '') + '?subject=' + encodeURIComponent('Website enquiry') + '&body=' + encodeURIComponent(text); mail.textContent = 'email me';
      summary.appendChild(document.createTextNode(' Your answers are still on this page. You can resend, or '));
      summary.appendChild(wa); summary.appendChild(document.createTextNode(' or ')); summary.appendChild(mail); summary.appendChild(document.createTextNode('.'));
    }
    summary.hidden = false; summary.focus();
  }

  function payload() {
    var o = { elapsed_ms: Date.now() - started, 'bot-field': form.elements['bot-field'].value };
    ['name', 'email', 'website', 'business_type', 'service', 'budget', 'goal', 'message', 'phone', 'source', 'page', 'submission_id'].forEach(function (k) { o[k] = field(k).value; });
    o.preferred_contact = form.elements['preferred_contact'].value; o.consent = field('consent').checked;
    o.website = (o.website || '').trim(); if (o.website && !/^https?:\/\//i.test(o.website)) o.website = 'https://' + o.website;
    return o;
  }
  function timed(url, opt) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, TIMEOUT); opt.signal = ctl.signal;
    return fetch(url, opt).finally(function () { clearTimeout(t); });
  }
  function viaNetlifyForms(o) {
    var body = new URLSearchParams(); body.append('form-name', 'contact');
    Object.keys(o).forEach(function (k) { if (k !== 'elapsed_ms') body.append(k, k === 'consent' ? 'on' : o[k]); });
    return timed('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
  }
  function success(o) {
    var entries = []; Object.keys(LABELS).forEach(function (k) { if (o[k]) entries.push([LABELS[k], String(o[k])]); });
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), entries: entries, service: o.service }));
      sessionStorage.setItem(EVT, JSON.stringify({ service_name: o.service, business_type: o.business_type, budget_range: o.budget || 'not_given', form_location: o.page || location.pathname, email: o.email.trim().toLowerCase() }));
      sessionStorage.removeItem('rb_lead_sid');
    } catch (e) {}
    live.textContent = 'Sent. Taking you to the confirmation page.';
    location.href = '/thank-you/';
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (sending) return;                                   // duplicate-click guard
    if (form.elements['bot-field'].value) return;          // honeypot filled: do nothing
    if (!showErrors(checks())) return;
    if (!navigator.onLine) { problem('You appear to be offline. Please reconnect and try again.', false); return; }
    var o = payload(); setSending(true); summary.hidden = true;
    timed('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) })
      .then(function (res) {
        if (res.status === 404 || res.status === 405) {      // function not deployed (for example a ZIP deploy): use Netlify Forms instead
          return viaNetlifyForms(o).then(function (r2) { if (!r2.ok) throw new Error('fallback_' + r2.status); success(o); });
        }
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (res.ok && data.ok) { success(o); return; }
          if (res.status === 422 && data.fields) { setSending(false); showErrors(data.fields); return; }
          if (res.status === 429) { setSending(false); problem('Too many enquiries from this connection. Please wait a little and try again, or message me on WhatsApp.', true); return; }
          throw new Error('server_' + res.status);
        });
      })
      .catch(function (err) {
        setSending(false);
        var timeout = err && err.name === 'AbortError';
        problem(timeout ? 'The request took too long, so I cannot confirm it arrived.' : 'Sorry, your enquiry could not be sent right now.', true);
      });
  });
})();
