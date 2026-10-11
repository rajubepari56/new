# Admin setup: leads dashboard and site editor

Both tools need the site deployed **from GitHub**, not by dragging a ZIP. The ZIP still works for the public site, but it cannot run the dashboard or the editor.

## 1. Deploy from GitHub (one time)
1. Netlify > Add new site > Import an existing project > GitHub > pick `rajubepari56/new`.
2. Branch to deploy: `claude/raju-bepari-website-build-uj8gvc` (or merge it to `main` and use `main`; then change `branch:` in `admin/config.yml`).
3. Build settings are read from `netlify.toml`. Deploy.

## 2. Leads dashboard at /dashboard/
In Netlify > Site configuration > Environment variables, add:
- `ADMIN_KEY`: a long password you choose. You type it on /dashboard/.
- `NETLIFY_API_TOKEN`: User settings > Applications > Personal access tokens > New token.
- `SITE_ID`: Site configuration > General > Site ID.

Redeploy. Open `/dashboard/`, enter the admin key. You see every contact-form submission, charts, status, your private notes, search and CSV export. Statuses and notes are stored in Netlify Blobs.
The form must be detected first: Forms > Enable form detection, then redeploy.

## 3. Site editor at /admin/
1. GitHub > Settings > Developer settings > OAuth Apps > New. Homepage: your site URL. Callback URL: `https://api.netlify.com/auth/done`.
2. Netlify > Site configuration > Access & security > OAuth > Install provider > GitHub, paste Client ID and Secret.
3. Open `/admin/`, log in with GitHub. You can edit blog posts, contact details, tracking IDs, hero bars, social links, reviews, case studies and snapshots. Each save commits to GitHub and Netlify rebuilds in about a minute.

Rules: quote reviews exactly, use real numbers only, no client names, no Google Partner claim unless true.
