# QA report

Date: 2026-10-21. Branch `claude/raju-bepari-website-build-uj8gvc`. Everything below was actually executed unless it is listed under "Not tested".

## Summary
- Production build succeeds (`JEKYLL_ENV=production jekyll build` + `scripts/minify.mjs`), 61 files, 2.2 MB, no warnings. `jekyll doctor`: no issues.
- 34 pages checked over HTTP, all load; one H1 each; absolute canonical URLs; titles 60 characters or fewer; descriptions 155 or fewer; no duplicate titles or descriptions.
- Automated accessibility (axe-core) found no violations on 25 representative routes at 1440 px and 390 px.
- No horizontal overflow at 360, 768 and 1440 px on 13 representative pages.
- Console: no errors or warnings on 13 pages when fonts were allowed and GSAP was served from a local copy of the same pinned version (see "Sandbox notes").
- Contact form, server function, consent order and dataLayer events pass the tests listed below.
- **Not live until you configure them:** n8n delivery, Google Sheets, email and WhatsApp alerts, GTM tags, Search Console. I could not test those services.

## Checks and results

| # | Check | Result |
|---|---|---|
| 1 | Lint / type check | The project has no linter or TypeScript. I ran `node --check` on 6 browser scripts, 3 functions, 2 shared modules and the build script (all pass) and parsed 51 YAML data and front-matter files (all pass). |
| 2 | Production build | Passes (see summary). Build command: `bash scripts/build.sh`. |
| 3 | Pages and routes | 34 full URLs listed below. 96 distinct internal links found on 25 pages, none broken. |
| 4 | Navigation, buttons, WhatsApp | All 7 header links and 14 dropdown links resolve. 9 distinct WhatsApp links all point to `https://wa.me/8801710992866?text=...` with a prefilled message. Forms: see 12. |
| 5 | Keyboard and focus | The first Tab stop is the skip link. 70 consecutive Tab stops on the home page all showed a focus indicator. The services dropdown opens with Enter (`aria-expanded` true, then false on a second Enter) and Tab moves into it. The message widget opens, and Escape closes it and returns focus to its button. A combined test script reported a failure for the dropdown because of a bug in the test itself. A separate script confirmed the behaviour. |
| 6 | Mobile, tablet, desktop | 360, 768 and 1440 px: no horizontal overflow on 13 pages. Interactive targets are at least 24 x 24 px (WCAG 2.5.8). I fixed footer links and dropdown toggles that were smaller. I reviewed screenshots of home and contact at 360 and 768 px. |
| 7 | Images, fonts, animation | 21 images on all pages: all have `alt`, `width` and `height`, and all are WebP or SVG. Below-the-fold images are `loading="lazy"`; the hero and About photos are eager with `fetchpriority="high"`. The social image is a 42 KB JPG (was a 327 KB PNG). Fonts: 3 families (Space Grotesk, Inter, JetBrains Mono) in one request, `font-display: swap`, loaded without blocking rendering. Animations use transform and opacity only. The hero loop is coded to pause when the tab or section is not visible (not measured). Reduced motion is honoured. |
| 8 | Core Web Vitals | See the Lighthouse table. Changes: removed the preloader, cut the font families from five to three, bundled 4 CSS files into one and minified CSS and JS, made the font stylesheet non-blocking, dropped an unused GSAP plugin. |
| 9 | SEO | Unique titles and descriptions within limits. Open Graph and Twitter card tags on every page. `sitemap.xml` lists 32 URLs (no thank-you, 404, admin or dashboard). `robots.txt` allows the site, disallows `/dashboard/` and `/admin/` and points to the sitemap. |
| 10 | Schema (JSON-LD) | All JSON parses. Home: WebSite, Person and ProfessionalService (`sameAs` = all 6 profiles), FAQPage, BreadcrumbList. Service pages and the 4 industry landing pages: Service, FAQPage, BreadcrumbList. Process: FAQPage. Posts: BlogPosting. Case studies: Article. Every page has a BreadcrumbList. |
| 11 | Search Console tag | With a test code in settings the build outputs `<meta name="google-site-verification" content="...">`. With the code empty, no tag is output. **Reminder: after verifying, submit https://rajubepari.netlify.app/sitemap.xml in Search Console.** |
| 12 | Loading, success, error states | Form tested with mocked responses: validation, sending, success redirect, server error with WhatsApp and email fallback, field-level server errors, timeout after 12 s, offline message, Netlify Forms fallback. Empty states: services without case studies, empty Medium list, no form data on the thank-you page. |
| 13 | Secrets | No tokens, webhook URLs or keys found in `_site` or in the last 50 commits (pattern scan). The n8n URL is read only from `N8N_WEBHOOK_URL` inside the function. |
| 14 | Consent and dataLayer | See below. |
| 15 | Webhook behaviour | See below. |
| 16 | WCAG 2.2 AA (where applicable) | Automated: axe-core clean. 1.4.3 contrast, 2.4.1 skip link, 2.4.7 focus visible, 2.5.8 target size and 3.3.1 / 3.3.3 error identification (form tests) were checked. 2.4.11 focus not obscured is handled with `scroll-padding-top` for the sticky header, but I did not verify it with a reliable test. Not covered: manual screen-reader testing, 200% zoom review, cognitive review. |
| 17 | Agency language | Whole built site scanned for agency, agencies, studio, firm, staff, we, our, team. All real hits were rewritten to first person. Remaining intentional uses: client review quotes (verbatim), "Looker Studio" (product name), "your team" (the client's team), "no junior staff" (your positioning wording), "in-house team" in the not-a-fit list, and the "Agency" choice in the form (your required field option). |
| 18 | Console | See summary. |
| 19 | This report | Done. |

### Consent Mode and dataLayer (tested on a build with a test GTM ID, GTM stubbed)
- GTM is requested only when `gtm_id` is set. With it empty, the built page contains no `googletagmanager.com` reference.
- `consent default` (ad_storage, ad_user_data, ad_personalization, analytics_storage = denied) is `dataLayer[0]`, before `gtm.js`.
- No consent update before the visitor chooses. Accept sends one update with all four granted. Reject sends one update with all four denied. A returning visitor gets default, then update, then `gtm.js`.
- Each event fired exactly once with the right parameters: `whatsapp_click` (link_location, service_name, page_path), `booking_click` (link_location), `cta_click` (cta_text, link_location), `upwork_click` (link_location), `email_click` (link_location, page_path), `social_click` (platform), `faq_open` (question). Closing an FAQ fires nothing. The widget WhatsApp link fires once.
- `generate_lead` {service_name, business_type, budget_range, form_location}: fires once on the thank-you page, not again on refresh, and includes `user_data.email` (lower-case) only when consent is granted.

### Webhook behaviour (test data only)
- `lead.mjs` was run in Node with an in-memory stand-in for Netlify Blobs and a real local HTTP server in place of n8n. 19 of 19 checks pass: valid lead forwarded with the `x-webhook-secret` header and a clean, normalised body; duplicate id not forwarded twice; honeypot and under-3-second submissions accepted silently and not forwarded; validation errors return 422; WhatsApp requires a phone number; n8n returning 500 or hanging past 8 seconds keeps the lead and reports `delivery: stored`; bad JSON 400; foreign origin 403; oversize 413; GET 405; the 6th submission within an hour from one visitor returns 429; with no `N8N_WEBHOOK_URL` the lead is stored and not reported as delivered.

## Lighthouse (local, simulated throttling)
Local static server with gzip compression. Scores are Performance / Accessibility / Best Practices / SEO.

| Page | Mobile P / A / BP / SEO | FCP | LCP | TBT | CLS | Desktop P / A / BP / SEO |
|---|---|---|---|---|---|---|
| / | 98 / 100 / 96 / 100 | 1.0s | 1.4s | 150ms | 0 | 99 / 100 / 96 / 100 |
| /services/google-ads/ | 100 / 100 / 100 / 100 | 0.9s | 0.9s | 0ms | 0 | 100 / 100 / 100 / 100 |
| /results/ | 100 / 100 / 100 / 100 | 0.9s | 1.1s | 50ms | 0.01 | 100 / 100 / 100 / 100 |
| /contact/ | 100 / 100 / 100 / 100 | 0.9s | 1.1s | 0ms | 0.026 | 100 / 100 / 100 / 100 |
| /about/ | 100 / 100 / 100 / 100 | 1.0s | 1.4s | 0ms | 0.002 | 100 / 100 / 100 / 100 |
| /blog/server-side-tracking-worth-it/ | 100 / 100 / 100 / 100 | 0.9s | 0.9s | 0ms | 0 | 100 / 100 / 100 / 100 |

The one lost Best Practices point on the home page is a console error because the sandbox blocks the GSAP CDN. On a normal connection that request succeeds. A first run without compression and with blocking fonts scored 82 to 86 on mobile, so the gain comes from the changes in check 8. Real-world scores depend on your hosting, network and devices.

## URLs checked (34)
| URL | HTTP | H1 | Title chars | Description chars |
|---|---|---|---|---|
| https://rajubepari.netlify.app/results/roofing-supplier-4x-roas/ | 200 | 1 | 50 | 154 |
| https://rajubepari.netlify.app/results/sydney-cafe-local-google-ads/ | 200 | 1 | 54 | 137 |
| https://rajubepari.netlify.app/blog/google-ads-conversion-tracking-checklist/ | 200 | 1 | 54 | 135 |
| https://rajubepari.netlify.app/blog/google-ads-vs-ga4-numbers-dont-match/ | 200 | 1 | 56 | 125 |
| https://rajubepari.netlify.app/blog/meta-pixel-vs-conversions-api/ | 200 | 1 | 54 | 133 |
| https://rajubepari.netlify.app/blog/server-side-tracking-worth-it/ | 200 | 1 | 51 | 130 |
| https://rajubepari.netlify.app/blog/send-crm-sales-back-to-google-ads/ | 200 | 1 | 54 | 134 |
| https://rajubepari.netlify.app/blog/google-business-profile-fixes/ | 200 | 1 | 60 | 135 |
| https://rajubepari.netlify.app/blog/aeo-geo-get-mentioned-in-ai-answers/ | 200 | 1 | 54 | 135 |
| https://rajubepari.netlify.app/services/ai-search-optimization/ | 200 | 1 | 56 | 139 |
| https://rajubepari.netlify.app/services/enhanced-offline-conversions/ | 200 | 1 | 48 | 142 |
| https://rajubepari.netlify.app/services/ga4/ | 200 | 1 | 56 | 129 |
| https://rajubepari.netlify.app/services/google-ads/ | 200 | 1 | 55 | 146 |
| https://rajubepari.netlify.app/services/google-tag-manager/ | 200 | 1 | 55 | 138 |
| https://rajubepari.netlify.app/industries/ | 200 | 1 | 36 | 142 |
| https://rajubepari.netlify.app/services/ | 200 | 1 | 46 | 147 |
| https://rajubepari.netlify.app/process/ | 200 | 1 | 45 | 147 |
| https://rajubepari.netlify.app/google-ads-for-contractors/ | 200 | 1 | 40 | 122 |
| https://rajubepari.netlify.app/local-seo-for-contractors/ | 200 | 1 | 39 | 136 |
| https://rajubepari.netlify.app/privacy-policy/ | 200 | 1 | 28 | 113 |
| https://rajubepari.netlify.app/results/ | 200 | 1 | 38 | 119 |
| https://rajubepari.netlify.app/contact/ | 200 | 1 | 59 | 132 |
| https://rajubepari.netlify.app/terms/ | 200 | 1 | 30 | 103 |
| https://rajubepari.netlify.app/google-ads-for-junk-removal/ | 200 | 1 | 51 | 129 |
| https://rajubepari.netlify.app/local-seo-for-home-service-businesses/ | 200 | 1 | 51 | 126 |
| https://rajubepari.netlify.app/about/ | 200 | 1 | 52 | 129 |
| https://rajubepari.netlify.app/insights/ | 200 | 1 | 60 | 136 |
| https://rajubepari.netlify.app/ | 200 | 1 | 57 | 138 |
| https://rajubepari.netlify.app/services/local-seo/ | 200 | 1 | 49 | 138 |
| https://rajubepari.netlify.app/services/merchant-center/ | 200 | 1 | 51 | 146 |
| https://rajubepari.netlify.app/services/meta-pixel-capi/ | 200 | 1 | 53 | 155 |
| https://rajubepari.netlify.app/services/server-side-tracking/ | 200 | 1 | 52 | 139 |
| https://rajubepari.netlify.app/thank-you/ | 200 | 1 | 23 | 96 |
| https://rajubepari.netlify.app/404.html | 200 | 1 | 28 | 62 |

The 404 page returned 200 from my local test server, which serves it for every missing path. Netlify returns a real 404.

## Sandbox notes
- Tests ran in headless Chromium (Playwright) against a local build. The sandbox blocks the public CDN used for GSAP, so those scripts were served from a local copy of the same pinned version (3.13.0). Google Fonts were blocked in the first crawl, which produced only a "failed to load font" message that is not a site error. A second run with fonts allowed had no console messages.
- Only Chromium was tested.

## Not tested
- n8n, Google Sheets, email notification and WhatsApp alert (not connected).
- The Netlify runtime for functions and Blobs (tested with a Node stand-in), the Netlify Forms fallback against real Netlify (tested with a mock), `/admin/` login with GitHub, and the leads dashboard against real data (tested with mock responses).
- GTM tags, GA4, Google Ads and Meta (no containers or accounts to test).
- Firefox, Safari and real phones. Page transitions use the browser's view-transition support (Chrome, Edge, Safari 18.2+); other browsers navigate normally.
- Manual screen-reader testing.

## Known limitations
- Lead delivery to n8n needs the Git-connected Netlify deploy. A ZIP deploy uses the Netlify Forms fallback and never calls n8n.
- Cross-document page transitions, `color-mix()` link underlines and `:has()` card accents need a recent browser. Older browsers show the same content without those effects.
- The hero data-flow animation and counters use GSAP from the jsDelivr CDN. If the CDN is unreachable, the page still works but the flow dots do not animate.
- Case-study and service copy states only what you provided. Several pages show an honest "no published case study yet" message.
- Legal pages are drafts with placeholders, not legal advice.
- The leads dashboard shows what is stored in Netlify Blobs and Netlify Forms. It is not a CRM.

## Addendum: re-run after the font change and GTM ID (2026-10-21)
After switching the display font to Space Grotesk (per your brief), removing the italic serif accent and setting `gtm_id` to GTM-TZVTKKVM, I rebuilt and re-ran these checks on the production build:
- 34 URLs: 0 issues (one H1, canonical, title and description limits, no duplicates).
- axe-core on 25 routes at 1440 and 390 px: no violations. No broken internal links.
- Overflow and 24 px target size at 360, 768 and 1440 px on 13 pages: pass. Hero headline lines are not clipped at 1440 or 360 px.
- Keyboard checks (skip link, 70 Tab stops, widget, Escape): pass.
- Consent defaults before GTM with the real container ID (GTM stubbed, so GTM itself was not contacted): pass, including Accept, Reject and returning-visitor order.
- Form: 18 of 18 browser tests pass.
- Lighthouse home page: mobile 98 / 100 / 96 / 100 (LCP 1.4 s, CLS 0), desktop 99 / 100 / 96 / 100.
Not re-run: the event-by-event click test (events code did not change) and the function tests (function code did not change).
I have **not** sent any request to your n8n webhook URL.
