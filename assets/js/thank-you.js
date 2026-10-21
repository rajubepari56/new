(function () {
  'use strict';
  var KEY = 'rb_form_entries', EVT = 'rb_lead_event';
  var box = document.getElementById('ty-box'), list = document.getElementById('ty-entries'), empty = document.getElementById('ty-empty');
  var data = null, evt = null;
  try { data = JSON.parse(sessionStorage.getItem(KEY) || 'null'); evt = JSON.parse(sessionStorage.getItem(EVT) || 'null'); } catch (e) {}

  if (data && data.entries && data.entries.length && Date.now() - data.t < 6 * 3600 * 1000) {
    data.entries.forEach(function (p) {
      var dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = p[0]; dd.textContent = p[1]; list.appendChild(dt); list.appendChild(dd);
    });
    box.hidden = false;
  } else if (empty) empty.hidden = false;

  /* generate_lead: pushed once, here, so a successful enquiry is counted exactly once even if the page is refreshed.
     The email (for Google Ads Enhanced Conversions) is added ONLY when ad_user_data consent has been granted. */
  if (evt) {
    try { sessionStorage.removeItem(EVT); } catch (e) {}
    var consent = false; try { consent = localStorage.getItem('rb_consent') === 'granted'; } catch (e) {}
    var ev = { event: 'generate_lead', service_name: evt.service_name, business_type: evt.business_type, budget_range: evt.budget_range, form_location: evt.form_location };
    if (consent && evt.email) ev.user_data = { email: evt.email };
    window.dataLayer = window.dataLayer || []; window.dataLayer.push(ev);
  }
})();
