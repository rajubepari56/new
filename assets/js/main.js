(function(){
  'use strict';
  var d=document,w=window,root=d.documentElement;
  root.classList.add('js');
  w.dataLayer=w.dataLayer||[];
  function push(o){w.dataLayer.push(o);}
  var mq=function(q){return w.matchMedia(q).matches;};
  var reduce=root.classList.contains('rm');
  var fine=mq('(hover: hover) and (pointer: fine)');
  var CDN='https://cdn.jsdelivr.net/npm/';
  var RB=w.RB={reduce:reduce,fine:fine,mobile:mq('(max-width: 860px)'),CDN:CDN,lenis:null,_cbs:[]};
  RB.onLenis=function(fn){RB.lenis?fn(RB.lenis):RB._cbs.push(fn);};
  var loaded={};
  RB.load=function(src){
    return loaded[src]||(loaded[src]=new Promise(function(res,rej){
      var s=d.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=rej;d.head.appendChild(s);
    }));
  };
  RB.gsap=function(){
    return RB.load(CDN+'gsap@3.13.0/dist/gsap.min.js').then(function(){
      return Promise.all(['ScrollTrigger','MotionPathPlugin','SplitText'].map(function(n){return RB.load(CDN+'gsap@3.13.0/dist/'+n+'.min.js');}));
    }).then(function(){w.gsap.registerPlugin(w.ScrollTrigger,w.MotionPathPlugin,w.SplitText);return w.gsap;});
  };
  function afterPaint(fn){
    w.requestAnimationFrame(function(){w.setTimeout(function(){(w.requestIdleCallback||function(f){return setTimeout(f,150);})(fn);},0);});
  }
  RB.afterPaint=afterPaint;

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
  d.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="mailto:"]');
    if(a&&!a.hasAttribute('data-event'))push({event:'email_click',link_location:a.getAttribute('data-link-location')||'other',page_path:location.pathname});
  });
  d.addEventListener('toggle',function(e){
    var t=e.target;
    if(t.matches&&t.matches('details[data-faq]')&&t.open)push({event:'faq_open',question:t.getAttribute('data-faq')});
  },true);
  RB.push=push;

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

  /* ---- motion switch (overrides the device setting) ---- */
  var mt=d.querySelector('[data-motion-toggle]');
  if(mt){
    mt.textContent=reduce?'Turn animations on':'Reduce animations';
    mt.addEventListener('click',function(){try{localStorage.setItem('rb_motion',reduce?'full':'reduced');}catch(_){}location.reload();});
  }

  /* ---- floating message widget ---- */
  var mw=d.getElementById('msgw'),mb=d.getElementById('msgw-btn'),mp=d.getElementById('msgw-panel');
  if(mw&&mb&&mp){
    var setOpen=function(o,focus){
      mp.hidden=!o;mb.setAttribute('aria-expanded',o?'true':'false');
      if(o){var f=mp.querySelector('a');if(f&&focus)f.focus();}else if(focus)mb.focus();
    };
    mb.addEventListener('click',function(){setOpen(mp.hidden,true);});
    mp.querySelector('.msgw__close').addEventListener('click',function(){setOpen(false,true);});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mp.hidden)setOpen(false,true);});
    d.addEventListener('click',function(e){if(!mp.hidden&&!mw.contains(e.target))setOpen(false,false);});
    mp.addEventListener('click',function(e){if(e.target.closest('a'))setTimeout(function(){setOpen(false,false);},50);});
  }

  /* ---- nav ---- */
  var tog=d.querySelector('.nav-toggle'),nav=d.getElementById('nav');
  if(tog)tog.addEventListener('click',function(){var o=nav.classList.toggle('open');tog.setAttribute('aria-expanded',o);});
  var ddb=d.querySelector('.nav__dd-btn');
  if(ddb)ddb.addEventListener('click',function(){var o=ddb.parentNode.classList.toggle('open');ddb.setAttribute('aria-expanded',o);});

  /* ---- scroll reveal (stagger via --i among siblings) ---- */
  var items=d.querySelectorAll('.reveal');
  items.forEach(function(n){var sib=n.parentNode?[].filter.call(n.parentNode.children,function(c){return c.classList.contains('reveal');}):[n];n.style.setProperty('--i',Math.min(sib.indexOf(n),6));});
  if('IntersectionObserver' in w&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12});
    items.forEach(function(n){io.observe(n);});
  }else items.forEach(function(n){n.classList.add('in');});

  /* ---- counters ---- */
  d.querySelectorAll('[data-count]').forEach(function(el){
    var end=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'';
    if(reduce||!('IntersectionObserver' in w))return;
    var o=new IntersectionObserver(function(es){
      if(!es[0].isIntersecting)return;o.disconnect();
      var t0=performance.now(),dur=1200;
      (function step(t){var k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,3);el.textContent=Math.round(end*k)+(k===1?suf:'');if(k<1)requestAnimationFrame(step);})(t0);
    },{threshold:.6});
    el.textContent='0';o.observe(el);
  });

  /* ---- service diagram pulse ---- */
  d.querySelectorAll('.diagram__nodes').forEach(function(ol){
    var n=ol.children,i=0;if(reduce||!n.length||ol.closest('[data-dataflow]'))return;
    setInterval(function(){if(d.hidden)return;[].forEach.call(n,function(c){c.classList.remove('on');});n[i%n.length].classList.add('on');i++;},900);
  });

  /* ---- CTA glow follows cursor ---- */
  if(fine&&!reduce)d.querySelectorAll('[data-glow]').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--gx',(e.clientX-r.left)+'px');el.style.setProperty('--gy',(e.clientY-r.top)+'px');});
  });

  /* ---- magnetic buttons + tilt cards (desktop only) ---- */
  if(fine&&!reduce){
    d.querySelectorAll('.magnetic').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)';});
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
    d.querySelectorAll('.tilt').forEach(function(c){
      c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        c.style.setProperty('--ry',((x-.5)*10)+'deg');c.style.setProperty('--rx',((.5-y)*10)+'deg');c.style.setProperty('--mx',(x*100)+'%');c.style.setProperty('--my',(y*100)+'%');});
      c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');});
    });
  }

  /* ---- custom cursor (desktop only) ---- */
  if(fine&&!reduce){
    var dot=d.createElement('div'),ring=d.createElement('div');dot.className='cursor-dot';ring.className='cursor-ring';
    dot.setAttribute('aria-hidden','true');ring.setAttribute('aria-hidden','true');
    d.body.appendChild(ring);d.body.appendChild(dot);
    var mx=-100,my=-100,rx=-100,ry=-100,on=false;
    var TEXT='input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),textarea';
    var PICK='select,input[type=checkbox],input[type=radio],input[type=submit]';
    function stateOf(t){
      if(!t||!t.closest)return 'default';
      if(t.closest(TEXT))return 'text';
      if(t.closest('select'))return 'select';
      var a=t.closest('a,button,summary,[role=button],label,'+PICK);
      if(a)return (a.tagName==='A'&&(a.target==='_blank'||/^https?:/i.test(a.getAttribute('href')||'')&&a.host!==location.host))?'ext':'link';
      if(t.closest('.card'))return 'card';
      return 'default';
    }
    w.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;if(!on){on=true;d.body.classList.add('cursor-on');rx=mx;ry=my;}
      ring.setAttribute('data-state',stateOf(e.target));});
    d.addEventListener('pointerdown',function(){ring.classList.add('down');});
    d.addEventListener('pointerup',function(){ring.classList.remove('down');});
    d.addEventListener('pointerleave',function(){d.body.classList.remove('cursor-on');on=false;dot.style.opacity=ring.style.opacity=0;});
    d.addEventListener('pointerenter',function(){dot.style.opacity=ring.style.opacity=1;});
    (function loop(){rx+=(mx-rx)*.2;ry+=(my-ry)*.2;dot.style.transform='translate('+mx+'px,'+my+'px)';ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop);})();
  }

  /* ---- page transitions (indigo wipe) ---- */
  var wipe=d.getElementById('wipe');
  if(wipe&&!reduce){
    if(root.classList.contains('wipe-cover')){
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        wipe.classList.add('out');root.classList.remove('wipe-cover');
        setTimeout(function(){wipe.style.transition='none';wipe.classList.remove('out');void wipe.offsetWidth;wipe.style.transition='';},520);
      });});
    }
    d.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');
      if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      if(a.target&&a.target!=='_self'||a.hasAttribute('download'))return;
      var u;try{u=new URL(a.href,location.href);}catch(_){return;}
      if(u.origin!==location.origin||u.protocol.indexOf('http')!==0)return;
      if(u.pathname===location.pathname&&u.search===location.search)return;
      e.preventDefault();
      try{sessionStorage.setItem('rb_wipe','1');}catch(_){}
      wipe.classList.add('in');
      setTimeout(function(){location.href=u.href;},460);
    });
    w.addEventListener('pageshow',function(e){if(e.persisted){wipe.classList.remove('in');}});
  }

  /* ---- preloader cleanup ---- */
  var pl=d.getElementById('preloader');
  if(pl)setTimeout(function(){pl.remove();root.classList.remove('has-preloader');},1250);

  /* ---- Lenis smooth scroll (after first paint, desktop) ---- */
  if(fine&&!reduce){
    afterPaint(function(){
      RB.load(CDN+'lenis@1.1.20/dist/lenis.min.js').then(function(){
        var l=new w.Lenis({autoRaf:true,lerp:.1});RB.lenis=l;
        RB._cbs.forEach(function(f){f(l);});
        d.addEventListener('click',function(e){
          var a=e.target.closest('a[href^="#"]');if(!a||a.getAttribute('href').length<2)return;
          var t=d.querySelector(a.getAttribute('href'));if(t){e.preventDefault();l.scrollTo(t,{offset:-120});}
        });
      }).catch(function(){});
    });
  }
})();
