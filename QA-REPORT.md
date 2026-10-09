# QA Report

Tested locally with Jekyll 4.4, headless Chromium (Playwright), axe-core and Lighthouse.
Note: the test sandbox blocks the public CDN, so GSAP, Lenis and Three.js (same pinned versions) were served from local copies via request routing. Fonts were blocked, so Lighthouse used fallback fonts.

## What I checked
- **Build:** all 15 pages build with only `jekyll-sitemap` and `jekyll-seo-tag`.
- **SEO:** one H1 per page; titles <= 60 chars and descriptions <= 155 chars; canonical + OG + Twitter tags; JSON-LD parses on every page (BreadcrumbList everywhere, Person + ProfessionalService on Home, Service on service pages, FAQPage where FAQs exist); `sitemap.xml` (14 URLs, 404 excluded) and `robots.txt`.
- **Tracking:** on 8 page types, every element with `data-event` (and every `mailto:`) fires exactly one dataLayer event with the right parameters. `faq_open` and `dashboard_toggle` verified. Consent defaults (all `denied`) are the first dataLayer entry, before GTM. Accept pushes `update: granted`, is saved, and the banner stays hidden on reload. "Cookie settings" reopens it.
- **Layout:** no horizontal scroll at 360, 768 and 1440 px on Home, Services, two service pages, Results, About, Contact, Privacy and 404.
- **Reduced motion (note: animations now always run, by owner's choice; the device "reduce motion" setting is ignored):** Three.js canvas is removed, reveals/orbit/marquee/preloader/wipe are off, and the static gradient shows. Data-flow and dashboard render as static finished graphics.
- **Mobile:** 48 particles instead of 120 (60% fewer), pixel ratio 1, no cursor/tilt/Lenis, vertical data-flow diagram, vertical process steps.
- **Animation:** preloader (CSS only, <= 1.2s, once per session), hero particle network, SplitText letter reveal, rotating words, orbiting chips, scroll-drawn data-flow with travelling dots (MotionPath), animated dashboard with before/after toggle, counters, pinned horizontal process, marquee, magnetic buttons, cursor glow, indigo page wipe, Lenis, custom cursor, 404 lost dot.
- **Render loop:** paused when the tab is hidden or the hero is off-screen. Three.js is imported only on Home and only after first paint.

## Lighthouse (mobile preset, local server, CDN libs blocked)
| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 88 | 100 | 96 | 100 |
| /services/ga4/ | 90 | 100 | 100 | 100 |

Home was measured without GSAP/Three.js loading, so re-run PageSpeed Insights on the live URL for the real number (see below).

## Fixed during QA
- White-on-green WhatsApp button contrast (4.4:1) -> darker green (5.5:1+).
- Brand link had an `aria-label` that hid its visible text; removed and hid the decorative SVG.
- Floating WhatsApp button sat outside any landmark; wrapped in a labelled `aside`.
- `robots.txt` was wrapped in the page layout; now plain text.
- WhatsApp links contained a stray newline; fixed.
- Dashboard KPIs now computed from the chart data, so they always agree.
- Pinned process section had extra padding; removed.
- Service pages shared headings; every service page now has unique section headings.

## Still needs your input
1. **Photos:** upload `raju-hero.jpg` and `raju-avatar.png` to the repo root and run `python3 scripts/optimize_images.py`. Current images are placeholders. Crop the AI watermark off the hero photo first.
2. **`_config.yml`:** replace `YOUR-USERNAME` in `url`; set `reply_time`; set `gtm_id` (and `google_site_verification`) when ready.
3. **Real content:** case studies, Upwork reviews, your story and exact time-zone overlap (see `TODO.md`).
4. **Live PageSpeed check:** after deploy, run PageSpeed Insights on Home. If mobile < 85, first try a lower particle count in `assets/js/hero-3d.js`.
5. **Privacy page:** list the tags you actually add in GTM.

## GTM / GA4 setup you must do yourself
The site only pushes to `dataLayer`. In GTM:
- Add a GA4 Configuration/Google tag (fires on consent-aware triggers; Consent Mode v2 is already set).
- Create Custom Event triggers + GA4 Event tags for: `whatsapp_click` (params `link_location`, `service_name`, `page_path`), `email_click` (`link_location`, `page_path`), `upwork_click` (`link_location`), `social_click` (`platform`), `cta_click` (`cta_text`, `link_location`), `faq_open` (`question`), `dashboard_toggle` (`state`).
- Create Data Layer Variables for each parameter.
- In GA4: register the parameters as custom dimensions, and mark `whatsapp_click` and `email_click` as Key Events.
- `link_location` values used: header, hero, service_page, footer, floating, plus cta, home_cta, home_results, home_about, about, contact, results, services_hub, 404.
