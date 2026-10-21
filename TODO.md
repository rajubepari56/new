# TODO: placeholders to fill

## Must do before launch
- [ ] `_config.yml` hero_stats: add your real "Client revenue generated" figure (hidden until set); confirm 200+ projects and 180 five-star reviews
- [x] WhatsApp number set (8801710992866)
- [x] `url` set to https://rajubepari.netlify.app (repo must be named rajubepari56.github.io)
- [ ] `_config.yml`: set `reply_time` (shown on /contact/)
- [x] Photos added (hero, avatar, og-image generated)
- [ ] `_config.yml`: `gtm_id`, `ga4_id`, `google_site_verification` (optional)

## Content placeholders (search for `TODO:`)
- [ ] Home `index.html`: 2 case study cards ("Coming soon")
- [ ] `results/index.html`: 3 case studies + Upwork reviews (exact text)
- [ ] `about/index.html`: personal story in your own words; confirm time zone overlap hours
- [ ] `privacy/index.html`: list the tags you actually configure in GTM
- [ ] Optional: real certifications with shareable links

## Case studies on hold (see chat notes; confirm before publishing)
- [ ] Remodeler "2,245% ROAS" and coaching "2,245% ROAS" use identical numbers (EUR 939 / EUR 21,083 / EUR 16.77)
- [ ] Two coach studies have different numbers; the "$12.36 CPL" slide shows $902 / 39 leads (= $23 per lead)
- [ ] Clinic and e-commerce brand studies share the same cost, conversions and CPA
- [ ] Roofing supplier testimonial contains template text ("JDG", "[Your Name]"); not used
- [ ] Testimonials with names (David V., Jenna T.) not used until confirmed real
- [ ] PrintifyPro, global sourcing and DTC coffee slides not yet reviewed in full

## Dad and the Frog (Sydney café) case study
- [ ] Confirm the client agrees to the case study (name is hidden) and that the figures match your reports
- [ ] Unidentified Google Ads screenshot (Oct 25, 2023 – Oct 9, 2026, $24.8K cost) not used: it predates this engagement

## Contact form (Netlify Forms)
- [ ] After deploying, open Netlify > Forms and confirm the form "contact" is detected
- [ ] Netlify > Forms > Settings & usage > Form notifications > Add notification > Email to rajubepari56@gmail.com
- [ ] Add GTM trigger for dataLayer event `generate_lead` (params: form_name, service_name) and mark it a GA4 Key Event

## Junk removal landing page (/google-ads-for-junk-removal/)
- [ ] Add real certifications to `certifications` in _config.yml (never list Google Partner unless you are one)
- [ ] Add a real junk removal case study to _data/case_studies.yml when you have one (the page currently says results come from other industries)
- [ ] Confirm the free strategy call offer and the FAQ answers match how you work

## Contractors landing page (/google-ads-for-contractors/)
- [ ] Add a real contractor case study to _data/case_studies.yml when available (page says results are from other industries)
- [ ] Both landing pages now share _layouts/landing.html; new industries = one new page with front matter + an entry in _data/industries.yml

## Local SEO landing pages
- [ ] /local-seo-for-contractors/ and /local-seo-for-home-service-businesses/ have no Local SEO case studies yet (the pages say so). Send real Local SEO results (GBP calls, rankings, Search Console) to add them
- [ ] Confirm the free strategy call offer, FAQ answers and the "Manager access" requirement match how you work

## July 2026 Google Ads snapshots (Results page)
- [ ] Tell me the industry and country of each of the 4 snapshots (and whether you can say it) so I can add context
- [ ] The "Feb 21, 2002 - Jun 16, 2025 / 12.2M clicks" screenshot was NOT used (impossible start date, duplicated Clicks tile)
- [ ] "Clark Boyd Consulting" account screenshot (Apr 2015 - Feb 2025, $1.65M, 455.62% ROAS) NOT used: it is not your account name and starts before your engagement. If it is a client account you manage, tell me since when, what you did and whether the client allows it (name and email would be cropped)
- [ ] Café case study: replace/add the all-time screenshots with engagement-period ones (Jul 23 - Oct 10, 2026) when available

## Blog (/blog/) and /admin
- [ ] Read the 7 posts once and edit anything that does not match how you work (they are general guides, no client numbers)
- [ ] /admin (Decap CMS) needs: Netlify site deployed from GitHub + GitHub OAuth app set in Netlify > Site configuration > Access & security > OAuth. Until then, ask me to add or edit posts

## Admin tools (leads dashboard + editor)
- Deploy from GitHub, set ADMIN_KEY, NETLIFY_API_TOKEN, SITE_ID, create the GitHub OAuth app (see ADMIN-SETUP.md). Not testable from the build sandbox: dashboard UI was tested with mocked API responses only; functions pass a syntax check only.

## Homepage rebuild (personal-brand version)
- Booking link: set `booking_url` in /admin > Site settings (Cal.com or Calendly). Until then, the "Get a Free Tracking Audit" buttons open WhatsApp with a prefilled message. Booking clicks fire the `booking_click` event.
- Hero photo `raju-hero.webp` is only 500 px; it is shown at about 92 px so it is sharp, but a full-resolution glasses photo is needed before using it larger.
- Threads stays removed (earlier instruction). Tell me if you want it back.
- "Agency" is not used anywhere on the home page; white-label work is described as "marketing businesses".
- Revenue bar stays hidden until a real figure is entered.
- Minimum monthly ad budget for the "not a fit" list is not set (not provided). Add one if you want it shown.
- No verified 5X/10X case yet. The only multiplier shown is the real "4x average ROAS" case (with its period and context).
- Home page no longer includes the blog strip or About block (listed in the nav and footer instead). Service pages, About and other pages still use the previous design and will be restyled in a later step.

## Homepage services bento
- The bento shows the 8 services you listed. "AI Search Optimization" (the ninth) is linked under the grid and stays on the services page, nav and footer. Tell me if it should be hidden or removed.
- Bento copy and grouping live in `_data/bento.yml`.
- The card illustrations are abstract concept diagrams with no numbers (no fake metrics).
