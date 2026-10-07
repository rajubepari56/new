# PROJECT BRIEF

## Who I am
- Name: Raju Bepari (personal brand, no logo; create an "RB" monogram SVG inside a thin 4-color ring)
- Title: Google Ads, Conversion Tracking & Web Analytics Specialist
- Experience wording: "7+ years of hands-on digital marketing experience"
- Based in Bangladesh, UTC+6; works with US/UK/AU clients
- Target clients: local service businesses, ecommerce stores (Shopify, WooCommerce, Wix), and agencies (white-label)
- Contact: WhatsApp 8801XXXXXXXXX (primary CTA), email rajubepari56@gmail.com
- Socials: Upwork https://www.upwork.com/freelancers/~016342bc13e6f8ffb5 | LinkedIn https://www.linkedin.com/in/rajubepari0-seo-expert/ | Facebook https://www.facebook.com/rajubepari0/ | Instagram https://www.instagram.com/rajubepari0 | X https://x.com/Raju_seo_ | Threads https://www.threads.com/@rajubepari0 | Medium https://medium.com/@rajubepari56
- Site URL: https://YOUR-USERNAME.github.io (GitHub Pages user site)
- Photos are in the repo root: raju-hero.jpg (hero), raju-avatar.png (about, favicon, og image). Move them to assets/images/ and create optimized WebP versions.

## Services (one subpage each)
1. Google Ads Management — /services/google-ads/
2. GA4 Setup & Audit — /services/ga4/
3. Google Tag Manager — /services/google-tag-manager/
4. Meta Pixel & Conversions API — /services/meta-pixel-capi/
5. Server-Side Tracking (sGTM) — /services/server-side-tracking/
6. Enhanced & Offline Conversions — /services/enhanced-offline-conversions/
7. Google Merchant Center — /services/merchant-center/
8. Local SEO — /services/local-seo/
Other pages: / (home), /services/, /results/, /about/, /contact/, /privacy/, /404.html
Each service page targets ONE primary keyword; no two pages compete for the same keyword.

## Tech
- Jekyll on GitHub Pages (no custom build step). Plugins: jekyll-sitemap, jekyll-seo-tag only.
- Plain HTML/CSS/vanilla JS. No React, no npm build.
- CDN libraries with pinned versions: Three.js, GSAP + ScrollTrigger + MotionPathPlugin + SplitText, Lenis.
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (event names/code).
- All editable settings (name, WhatsApp, email, GTM ID, GA4 ID, socials, Search Console tag) live in _config.yml. Services list lives in _data/services.yml.
- Clean URLs via folder/index or permalinks.

## Design
- Dark theme. Tokens: --bg #0A0B1E, --bg-2 #12143A, --indigo #2B2FC7, --indigo-deep #1E2390, --blue #4285F4, --red #EA4335, --yellow #FBBC05, --green #34A853, --text #F5F6FF, --muted #A7A9D6.
- The 4 bright colors are DATA accents, used sparingly. Never use Google logos or a "Google Partner" badge.
- Glass cards (16px radius), pill buttons, magnetic buttons, 3D tilt on cards (desktop only).
- Fully responsive, mobile first. Floating WhatsApp button on mobile.

## Animation level: bold
1. Preloader: RB monogram stroke-draw + ring fill, max 1.2s, once per session.
2. Home hero background: Three.js particle network (data nodes + connecting lines, mouse parallax, nodes pulse in the 4 data colors).
3. Hero headline: SplitText letter reveal + rotating words (Google Ads / GA4 / Server-Side Tracking / Meta CAPI).
4. Hero photo floats; orbiting pill chips: GA4, GTM, Google Ads, Meta.
5. Data-flow section: scroll-drawn SVG path Website -> Web GTM -> Server GTM -> GA4 / Google Ads / Meta CAPI. Glowing dots labeled page_view, generate_lead, purchase travel along the path (MotionPath).
6. Animated mock dashboard: line chart draws in, KPI counters, "Tracking before / after" toggle. Label it "Illustrative demo".
7. Services grid stagger reveal + tilt + glow.
8. Stat counters (real numbers only: 7+ years, 8 services).
9. Process: Audit -> Plan -> Implement -> QA -> Report, pinned horizontal scroll on desktop, vertical stack on mobile.
10. Tools marquee: Google Ads, GA4, GTM, Meta, Shopify, WooCommerce, Wix, WordPress (text pills, not logos).
11. Final CTA: magnetic WhatsApp button + cursor-following gradient glow.
12. Page transitions: indigo overlay wipe.
13. Lenis smooth scroll; custom cursor on desktop only.
14. 404: "Event not found" with a lost data dot animation.
Performance rules: respect prefers-reduced-motion (disable Three.js and heavy motion, show a static gradient); 60% fewer particles on mobile; load Three.js only on home and after first paint; pause the render loop when the tab is hidden; targets PageSpeed mobile >= 85, Accessibility >= 95, SEO 100.

## Content rules
- English only. Short sentences, problem -> result language, no jargon walls.
- NEVER invent testimonials, client names, logos, statistics or results. Where real data is missing, insert a clearly marked placeholder: <!-- TODO: real case study --> and a visible "Coming soon" card. Keep a TODO.md list of every placeholder.
- Every page ends with a WhatsApp CTA. WhatsApp links use https://wa.me/8801XXXXXXXXX?text=... with a prefilled message that names the page's service.
- Service page template: Hero (H1 + one-line outcome + WhatsApp) -> Who it's for -> Problems I solve -> What's included (checklist) -> small animated diagram -> Process & timeline -> FAQ (4-5, specific to the service) -> Related services (2-3 internal links) -> CTA.
- Home: Hero -> Problem -> Data-flow -> Services grid -> Dashboard -> Process -> Results (placeholders) -> Tools marquee -> About teaser -> FAQ -> Final CTA.
- About: story, 7+ years, values (on-time delivery, transparent pricing, open communication, high workmanship), time-zone overlap with US/UK, all socials.
- Contact: WhatsApp, email, Upwork hire link. No form (static hosting).

## Tracking (code only pushes to dataLayer; I configure GTM myself)
- Load GTM only if gtm_id is set in _config.yml.
- Consent Mode v2 defaults BEFORE GTM: ad_storage, ad_user_data, ad_personalization, analytics_storage = denied. Small banner (Accept / Reject / Privacy link); save choice; on accept push consent update granted. Footer "Cookie settings" link reopens it.
- dataLayer events: whatsapp_click {link_location, service_name, page_path}, email_click {link_location, page_path}, upwork_click {link_location}, social_click {platform}, cta_click {cta_text, link_location}, faq_open {question}, dashboard_toggle {state}. Use data-* attributes on elements and one delegated click listener in main.js.

## SEO
- Unique title (<= 60 chars) and meta description (<= 155) per page, one H1, canonical with full absolute URL, Open Graph + Twitter card, og-image 1200x630.
- JSON-LD: Person + ProfessionalService on home (sameAs = all socials), Service on service pages, FAQPage where FAQs exist, BreadcrumbList everywhere.
- sitemap.xml (jekyll-sitemap), robots.txt pointing to it, Search Console verification meta from _config.yml.
- Descriptive alt text, WebP images with width/height, lazy loading below the fold.

## Phases
1. Foundation: Jekyll config, layouts, includes, design tokens, header (with services dropdown), footer, consent banner, tracking scaffolding, ALL pages created with real copy (placeholders only where data is missing). Basic scroll reveals only.
2. Home animations: preloader, Three.js hero, SplitText headline, orbit chips, data-flow, dashboard, process, marquee, final CTA, page transitions, Lenis, cursor.
3. Service pages: polish copy, one small animated diagram per service, FAQs, related links.
4. Tracking + SEO: verify every event fires with correct parameters, schema, sitemap, meta, 404.
5. QA: performance, accessibility, mobile, reduced-motion, broken links; write QA-REPORT.md.

# END OF BRIEF
