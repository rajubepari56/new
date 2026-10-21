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
| `docs/` | n8n workflow, tracking (GTM) checklist, form setup, sample payload |
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
`docs/TRACKING.md` (GTM checklist), `docs/N8N-WORKFLOW.md`, `docs/FORM-SETUP.md`, `MOTION.md`, `QA-REPORT.md`, `TODO.md`.
