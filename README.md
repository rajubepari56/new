# Raju Bepari: personal-brand website

Jekyll 4 static site (plain HTML, CSS and JavaScript), hosted on Netlify at https://rajubepari.netlify.app.

## Project map
| Path | What it is |
|---|---|
| `index.html`, `services/`, `industries/`, `process/`, `about/`, `contact/`, `insights/`, `privacy-policy/`, `terms/`, `thank-you.html`, `404.html` | Pages |
| `_case_studies/*.md` | One markdown file per case study, published at `/results/<file-name>/` |
| `_posts/*.md` | Insight articles, published at `/blog/<title>/` |
| `_data/settings.yml` | Contact details, tracking IDs, hero numbers, social links |
| `_data/services.yml`, `bento.yml`, `industries.yml`, `reviews.yml`, `snapshots.yml`, `coming_soon.yml`, `medium.yml` | Editable content |
| `_layouts/`, `_includes/` | Templates and components |
| `assets/` | CSS, JS and images |
| `netlify/functions/` | `lead` (form), `leads` and `lead-update` (dashboard) |
| `admin/`, `dashboard/` | Content editor (Decap CMS) and leads dashboard. Need a Git-connected deploy. |

## Build
```
npm install                 # installs esbuild (minifier) and @netlify/blobs (functions)
bundle install              # Jekyll
bash scripts/build.sh       # JEKYLL_ENV=production jekyll build + CSS/JS minify and bundle
```
Output goes to `_site/`. Local preview: `bundle exec jekyll serve`.

## Netlify settings
| Setting | Value |
|---|---|
| Build command | `bash scripts/build.sh` (already in `netlify.toml`) |
| Publish directory | `_site` |
| Ruby | 3.3.6 (set in `netlify.toml`) |
| Functions directory | `netlify/functions` |
| Domain | Currently `rajubepari.netlify.app`. If you add a custom domain, set `url:` in `_config.yml` to it, set `SITE_URL`, then rebuild so canonical URLs, sitemap and schema use the new domain. |

Environment variables: see `.env.example`. Real values go only in Netlify, never in the repo.

## Deploy modes
- **ZIP / drag and drop (what you use today):** static pages work. Functions and `/admin/` do not run. The contact form falls back to Netlify Forms.
- **Git-connected deploy:** also enables `/api/lead` (n8n), `/dashboard/` and `/admin/`. See `ADMIN-SETUP.md`.

## Editing content
Most content is data. Settings: `_data/settings.yml`. Case studies: add a file to `_case_studies/`. Everything is also editable at `/admin/` once the Git-connected deploy and GitHub login are set up.

## Search Console
Put the verification code (the `content` value of the Google meta tag) in `_data/settings.yml` as `google_site_verification`, deploy, verify, then **submit https://rajubepari.netlify.app/sitemap.xml** in Search Console.

## More

## Deployment checklist
1. Approve the release candidate (`QA-REPORT.md`).
2. Decide the deploy mode. For n8n delivery use a **Git-connected** Netlify deploy (or the Netlify CLI), because functions do not run on a ZIP deploy.
3. In Netlify > Site configuration > Environment variables set `N8N_WEBHOOK_URL` to your n8n production webhook URL (keep it out of the repo and out of chat history where possible), plus `N8N_WEBHOOK_SECRET` if you add header auth in n8n. Optional: `SITE_URL`, `LEAD_HASH_SALT`. For the dashboard: `ADMIN_KEY`, `NETLIFY_API_TOKEN`, `SITE_ID`.
4. Build an n8n workflow with a Webhook trigger that accepts the lead JSON, and activate it.
5. Deploy. Check https://rajubepari.netlify.app loads, then send one test enquiry (test.person@example.com, message "TEST ONLY") and confirm the sheet row and email.
6. In GTM (container GTM-TZVTKKVM) create the GA4, Google Ads, Meta and consent tags for the dataLayer events the site pushes (generate_lead, whatsapp_click, booking_click and others), test in Preview with the live URL, then publish.
7. Search Console: add the verification code to `_data/settings.yml`, deploy, verify, and submit `https://rajubepari.netlify.app/sitemap.xml`.
8. Fill the placeholders in `TODO.md` (booking link, legal pages, personal story, case-study numbers).
9. Run Lighthouse on the live URL.

## Free tracking checker (`/tracking-checker/`)
Visitors paste their website address; `netlify/functions/scan.mjs` (`POST /api/scan`) reads the public page plus the published GTM container and reports visible tags (GTM, GA4, Google Ads, Meta, TikTok, LinkedIn, Microsoft, Clarity, Hotjar, Consent Mode, server-side hint). It blocks private/internal addresses (also on redirects), times out at 8 s, and stores nothing. Like the other functions it needs a Git or CLI deploy; on a ZIP-only deploy the page shows a "request a manual check" fallback.
