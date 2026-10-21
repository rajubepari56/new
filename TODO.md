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

## Results and case studies
- Add case studies as one markdown file each in `_case_studies/` (or in /admin > Case studies). Fields: title, industry, country, headline result, baseline, challenge, steps, architecture diagram, tools, timeline, metrics (value, before, timeframe, multiplier tick), screenshots, real quote. Pages appear at /results/[file-name]/.
- Roofing supplier case: baseline (before) figures are missing, so the page shows the improvement only. Add the starting ROAS, sales and CPA if you have them. No client quote yet.
- Sydney café case: the quote is the real Sep 2026 Upwork review with the name hidden. Add the client's name and role only if they give permission.
- "Case study coming soon" cards (edit in /admin or `_data/coming_soon.yml`): lead tracking for a home-services business, server-side tracking for an e-commerce store, Local SEO for a service-area business. These are placeholder topics, not claims. Replace or delete them when you have real projects, with verified before/after numbers and client permission.
- No 5X-10X multiplier is shown anywhere except the real "4x average ROAS" (roofing supplier) and the client-reported "1.5x weekday daily revenue" (café), each with its source.
- Screenshots on case pages: I used the café account screenshots already on the site (all-time totals, labelled). Add anonymized (blurred) screenshots for other cases.

## Full site build and contact form
- **Form delivery is not live until you set it up.** The form posts to `/api/lead`, a Netlify Function that needs a Git-connected deploy (see ADMIN-SETUP.md). With a ZIP deploy it falls back to Netlify Forms (enable form detection and the email notification). n8n is NOT called in ZIP mode.
- **n8n:** build the workflow in `docs/N8N-WORKFLOW.md`, then set `N8N_WEBHOOK_URL` (and `N8N_WEBHOOK_SECRET`) in Netlify. I could not test your n8n, Google Sheets, email or WhatsApp alert. Only the website side was tested, with mocks.
- **GTM:** set `gtm_id` in Site settings, then create the tags, triggers and variables in `docs/TRACKING.md`. Nothing is connected until you do.
- **Legal pages:** /privacy-policy/ and /terms/ are drafts with yellow placeholders: legal/business name, address, date, retention period, payment terms, liability, governing law, which integrations are active. Have them reviewed.
- **About page:** add your personal story (how you started, a defining project) and your exact time-zone overlap hours (marked with TODO comments in `about/index.html`).
- **Medium:** only your profile link is shown. Add real article links to `_data/medium.yml`.
- **Service pages:** unique copy written for 9 services (each targets one keyword: Google Ads specialist, GA4 consultant, Google Tag Manager expert, Meta Conversions API setup, server-side tracking expert, offline conversion tracking for Google Ads, Google Merchant Center specialist, local SEO freelancer, AI search optimization consultant). Only Google Ads and Merchant Center have a connected case study; the rest show an honest "no published case study yet" message. Please review the wording for accuracy.
- **Services count:** the site still has the ninth service (AI Search Optimization). Tell me if it should be hidden.
- **Hosting:** unchanged (Netlify). Nothing was moved.

## Production readiness (final QA)
- Approve the release, then deploy (see the end of QA-REPORT.md and README.md). I did not publish anything to your live site.
- After the first live deploy: verify the site in Search Console and submit https://rajubepari.netlify.app/sitemap.xml.
- Set real values in Netlify (see `.env.example`): `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, optional `SITE_URL`, `LEAD_HASH_SALT`, and for the dashboard `ADMIN_KEY`, `NETLIFY_API_TOKEN`, `SITE_ID`.
- `google_site_verification`, `gtm_id`, `booking_url`, `reply_time` in `_data/settings.yml` are empty on purpose.
- After deploying, test the form once with safe test data (for example test.person@example.com, message "TEST ONLY") and confirm the email or sheet row arrives.
- Run Lighthouse on the live URL, because hosting and network change the scores.
