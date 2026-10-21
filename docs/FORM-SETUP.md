# Contact form setup

The form posts JSON to `/api/lead` (Netlify Function in `netlify/functions/lead.mjs`).

| Deployment | What happens |
|---|---|
| Git-connected Netlify deploy (see `ADMIN-SETUP.md`) | `/api/lead` runs, validates, forwards to n8n (if `N8N_WEBHOOK_URL` is set), and stores a copy for `/dashboard/`. |
| ZIP / drag-and-drop deploy | Functions do not run. The form detects this (404) and uses **Netlify Forms** instead. You must enable form detection and add the email notification in Netlify. n8n is **not** called in this mode. |

Hosting stays on Netlify. I have not changed it. To use n8n you need the Git-connected deploy.

Test with safe data only, for example `test.person@example.com` and the message "TEST ONLY".
