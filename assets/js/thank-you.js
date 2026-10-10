(function () {
  'use strict';
  var KEY = 'rb_form_entries', box = document.getElementById('ty-box'), empty = document.getElementById('ty-empty');
  var list = document.getElementById('ty-entries'), saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!saved || !saved.entries || !saved.entries.length) { if (empty) empty.hidden = false; return; }
  saved.entries.forEach(function (pair) {
    var dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = pair[0]; dd.textContent = pair[1];
    list.appendChild(dt); list.appendChild(dd);
  });
  box.hidden = false;
  var first = saved.entries.filter(function (p) { return p[0] === 'Full name'; })[0];
  if (first) document.getElementById('ty-title').textContent = 'Thank you, ' + first[1].split(' ')[0] + '. Your message was sent';
  // lead event, once per submission
  try {
    if (!saved.sent) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'generate_lead', form_name: 'contact', service_name: saved.service || '' });
      saved.sent = true; sessionStorage.setItem(KEY, JSON.stringify(saved));
    }
  } catch (e) {}
})();
