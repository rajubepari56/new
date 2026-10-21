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

  /* ---- back to top ---- */
  var tt=d.getElementById('totop');
  if(tt){
    var bar=tt.querySelector('.totop__bar'),tick=false;
    var upd=function(){tick=false;var y=w.pageYOffset||root.scrollTop,h=root.scrollHeight-w.innerHeight;
      tt.classList.toggle('show',y>500);if(bar&&h>0)bar.style.strokeDashoffset=String(100-Math.min(100,y/h*100));};
    w.addEventListener('scroll',function(){if(!tick){tick=true;w.requestAnimationFrame(upd);}},{passive:true});
    upd();
    tt.addEventListener('click',function(){
      w.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
      var s=d.getElementById('skip-top')||d.querySelector('.skip');if(s)setTimeout(function(){tt.blur();},300);
    });
  }

  /* ---- nav ---- */
  var tog=d.querySelector('.nav-toggle'),nav=d.getElementById('nav');
  if(tog)tog.addEventListener('click',function(){var o=nav.classList.toggle('open');tog.setAttribute('aria-expanded',o);});
  d.querySelectorAll('.nav__dd-btn').forEach(function(ddb){
    ddb.addEventListener('click',function(){var o=ddb.parentNode.classList.toggle('open');ddb.setAttribute('aria-expanded',o);});
  });
  d.addEventListener('click',function(e){d.querySelectorAll('.nav__dd.open').forEach(function(x){if(!x.contains(e.target)&&!nav.classList.contains('open')){x.classList.remove('open');var b=x.querySelector('.nav__dd-btn');if(b)b.setAttribute('aria-expanded','false');}});});

  /* ---- scroll reveal (stagger via --i among siblings) ---- */
  var items=d.querySelectorAll('.reveal,.mask');
  items.forEach(function(n){var sib=n.parentNode?[].filter.call(n.parentNode.children,function(c){return c.classList.contains('reveal');}):[n];n.style.setProperty('--i',Math.min(sib.indexOf(n),5));});
  if('IntersectionObserver' in w&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    items.forEach(function(n){io.observe(n);});
  }else items.forEach(function(n){n.classList.add('in');});

  /* ---- service diagram: lights up once, in order, when it scrolls into view ---- */
  d.querySelectorAll('.diagram__nodes').forEach(function(ol){
    var n=[].slice.call(ol.children);if(!n.length||ol.closest('[data-dataflow]'))return;
    if(reduce||!('IntersectionObserver' in w)){n.forEach(function(c){c.classList.add('on');});return;}
    var o=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;o.disconnect();
      n.forEach(function(c,i){setTimeout(function(){c.classList.add('on');},i*320);});},{threshold:.5});
    o.observe(ol);
  });

  /* ---- CTA glow follows cursor ---- */
  if(fine&&!reduce)d.querySelectorAll('[data-glow]').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--gx',(e.clientX-r.left)+'px');el.style.setProperty('--gy',(e.clientY-r.top)+'px');});
  });

  /* ---- magnetic buttons (desktop, subtle) and card spotlight (no tilt) ---- */
  if(fine&&!reduce){
    d.querySelectorAll('.magnetic').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.14).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.22).toFixed(1)+'px)';},{passive:true});
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
    d.querySelectorAll('.tilt').forEach(function(c){
      c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');c.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');},{passive:true});
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
    var running=false;function kick(){if(!running){running=true;requestAnimationFrame(loop);}}
    w.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;kick();if(!on){on=true;d.body.classList.add('cursor-on');rx=mx;ry=my;}
      ring.setAttribute('data-state',stateOf(e.target));});
    d.addEventListener('pointerdown',function(){ring.classList.add('down');});
    d.addEventListener('pointerup',function(){ring.classList.remove('down');});
    d.addEventListener('pointerleave',function(){d.body.classList.remove('cursor-on');on=false;dot.style.opacity=ring.style.opacity=0;});
    d.addEventListener('pointerenter',function(){dot.style.opacity=ring.style.opacity=1;});
    function loop(){rx+=(mx-rx)*.2;ry+=(my-ry)*.2;dot.style.transform='translate3d('+mx+'px,'+my+'px,0)';ring.style.transform='translate3d('+rx+'px,'+ry+'px,0)';if(Math.abs(mx-rx)>.3||Math.abs(my-ry)>.3)requestAnimationFrame(loop);else running=false;}
  }

  /* ---- preloader cleanup ---- */
  var pl=d.getElementById('preloader');
  if(pl)setTimeout(function(){pl.remove();root.classList.remove('has-preloader');},760);

  /* native scrolling only: no smooth-scroll library, no scroll hijacking */
})();
