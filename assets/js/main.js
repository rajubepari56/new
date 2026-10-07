(function(){
  'use strict';
  var d=document,w=window;
  d.documentElement.classList.add('js');
  w.dataLayer=w.dataLayer||[];
  function push(o){w.dataLayer.push(o);}
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- delegated click tracking (data-* attributes) ---- */
  d.addEventListener('click',function(e){
    var el=e.target.closest('[data-event]');
    if(!el)return;
    var ev=el.getAttribute('data-event'),loc=el.getAttribute('data-link-location')||'',p={event:ev};
    if(ev==='whatsapp_click'){p.link_location=loc;p.service_name=el.getAttribute('data-service')||'General';p.page_path=location.pathname;}
    else if(ev==='email_click'){p.link_location=loc;p.page_path=location.pathname;}
    else if(ev==='upwork_click'){p.link_location=loc;}
    else if(ev==='social_click'){p.platform=el.getAttribute('data-platform')||'';}
    else if(ev==='cta_click'){p.cta_text=el.getAttribute('data-cta-text')||el.textContent.trim();p.link_location=loc;}
    else return;
    push(p);
  });
  /* mailto links without data-event still count */
  d.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="mailto:"]');
    if(a&&!a.hasAttribute('data-event'))push({event:'email_click',link_location:a.getAttribute('data-link-location')||'other',page_path:location.pathname});
  });
  /* FAQ open (fires on open only) */
  d.addEventListener('toggle',function(e){
    var t=e.target;
    if(t.matches&&t.matches('details[data-faq]')&&t.open)push({event:'faq_open',question:t.getAttribute('data-faq')});
  },true);

  /* ---- consent ---- */
  var banner=d.getElementById('consent'),KEY='rb_consent';
  function gtag(){w.dataLayer.push(arguments);}
  function setConsent(v){
    try{localStorage.setItem(KEY,v);}catch(_){}
    var s=v==='granted'?'granted':'denied';
    gtag('consent','update',{ad_storage:s,ad_user_data:s,ad_personalization:s,analytics_storage:s});
    if(banner)banner.hidden=true;
  }
  var saved=null;try{saved=localStorage.getItem(KEY);}catch(_){}
  if(banner&&!saved)banner.hidden=false;
  d.addEventListener('click',function(e){
    var b=e.target.closest('[data-consent]');
    if(b)setConsent(b.getAttribute('data-consent')==='accept'?'granted':'denied');
    if(e.target.closest('[data-consent-open]')&&banner)banner.hidden=false;
  });

  /* ---- nav ---- */
  var tog=d.querySelector('.nav-toggle'),nav=d.getElementById('nav');
  if(tog)tog.addEventListener('click',function(){var o=nav.classList.toggle('open');tog.setAttribute('aria-expanded',o);});
  var ddb=d.querySelector('.nav__dd-btn');
  if(ddb)ddb.addEventListener('click',function(){var o=ddb.parentNode.classList.toggle('open');ddb.setAttribute('aria-expanded',o);});

  /* ---- scroll reveal ---- */
  var items=d.querySelectorAll('.reveal');
  if('IntersectionObserver' in w&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12});
    items.forEach(function(n){io.observe(n);});
  }else items.forEach(function(n){n.classList.add('in');});

  /* ---- service diagram pulse ---- */
  d.querySelectorAll('.diagram__nodes').forEach(function(ol){
    var n=ol.children,i=0;if(reduce||!n.length)return;
    setInterval(function(){if(d.hidden)return;[].forEach.call(n,function(c){c.classList.remove('on');});n[i%n.length].classList.add('on');i++;},900);
  });
})();
