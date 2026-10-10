(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var btn = document.getElementById('form-submit');
  var KEY = 'rb_form_entries';

  // Preselect a service from ?service=<slug>
  try {
    var slug = new URLSearchParams(location.search).get('service');
    if (slug) {
      var opt = form.querySelector('option[data-slug="' + slug.replace(/[^a-z0-9-]/gi, '') + '"]');
      if (opt) opt.selected = true;
    }
  } catch (e) {}

  var LABELS = {
    name: 'Full name', email: 'Email', phone: 'WhatsApp / phone', country: 'Country',
    company: 'Business or company', website: 'Website', service: 'Service needed',
    preferred_contact: 'Best way to reach you', budget: 'Monthly marketing budget', message: 'Project details', consent: 'Agreed to be contacted'
  };

  function say(msg) { status.textContent = msg; status.hidden = !msg; }
  function labelFor(el) { if (el.type === 'checkbox') return 'the box to agree to be contacted'; var l = form.querySelector('label[for="' + el.id + '"]'); return l ? l.childNodes[0].textContent.trim() : el.name; }

  function validate() {
    var bad = form.querySelector(':invalid');
    if (!bad) return true;
    var msg = bad.type === 'checkbox' ? 'Please tick ' + labelFor(bad) + '.' :
              bad.validity.valueMissing ? 'Please fill in: ' + labelFor(bad) + '.' :
              'Please check: ' + labelFor(bad) + '.';
    say(msg); bad.focus(); return false;
  }

  function showFallback(entries, why) {
    var text = 'New enquiry from the website\n\n' + entries.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n');
    status.textContent = '';
    var msg = document.createElement('span');
    msg.textContent = 'Sorry, the form could not send right now' + (why ? ' (' + why + ')' : '') + '. Your details are safe on this page. Send them in one tap instead: ';
    status.appendChild(msg);
    var mail = document.createElement('a');
    mail.href = 'mailto:' + (form.getAttribute('data-mail') || '') + '?subject=' + encodeURIComponent('Website enquiry') + '&body=' + encodeURIComponent(text);
    mail.textContent = 'Email it';
    var wa = document.createElement('a');
    wa.href = 'https://wa.me/' + (form.getAttribute('data-wa') || '') + '?text=' + encodeURIComponent(text.slice(0, 1500));
    wa.target = '_blank'; wa.rel = 'noopener'; wa.textContent = 'WhatsApp it';
    status.appendChild(mail); status.appendChild(document.createTextNode(' or ')); status.appendChild(wa); status.appendChild(document.createTextNode('.'));
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    say('');
    if (!validate()) return;
    var web = form.elements['website'];
    if (web && web.value.trim() && !/^https?:\/\//i.test(web.value.trim())) web.value = 'https://' + web.value.trim();
    var data = new FormData(form);
    if (data.get('bot-field')) return;          // honeypot filled: silently stop
    var entries = [];
    Object.keys(LABELS).forEach(function (k) {
      var v = data.get(k);
      if (v) entries.push([LABELS[k], String(v)]);
    });
    btn.disabled = true; btn.textContent = 'Sending...';
    var body = new URLSearchParams();
    data.forEach(function (v, k) { body.append(k, v); });
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      .then(function (res) {
        if (!res.ok) throw new Error('error ' + res.status);
        try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), service: data.get('service') || '', entries: entries })); } catch (_) {}
        location.href = '/thank-you/';
      })
      .catch(function (err) {
        btn.disabled = false; btn.textContent = 'Send message';
        showFallback(entries, err && err.message ? err.message : '');
      });
  });
})();
