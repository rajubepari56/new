# Hostinger setup (site + working backend)

The ZIP `raju-bepari-hostinger.zip` contains the whole site plus a PHP backend in `api/`. It replaces the Netlify functions:
contact form, enquiry storage, email alert, visitor counters, the tracking checker and the dashboard.

## 1. Upload
1. hPanel > Websites > Manage > **File Manager** > open `public_html`. Delete the default files.
2. Upload `raju-bepari-hostinger.zip`, right-click > **Extract** (into `public_html` itself). `index.html` must sit directly in `public_html`.
3. Show hidden files (File Manager settings) and confirm `.htaccess` exists in `public_html` and in `public_html/api`.

## 2. Configure (required)
Open `public_html/api/config.php` > Edit and set:
- `admin_key`: a long password (20+ characters). This is what you type on `/dashboard/`.
- `site_url`: your real address, e.g. `https://yourdomain.com` (no trailing slash).
- `notify_email`: where enquiry emails go (already set to rajubepari56@gmail.com).
- `n8n_webhook` / `n8n_secret`: optional. Leads are POSTed there too when set.
- `hash_salt`: any random text.
Never share this file.

## 3. Server settings
- hPanel > Advanced > **PHP Configuration**: PHP 8.1 or newer; make sure `pdo_sqlite`, `sqlite3` and `curl` are ticked.
- hPanel > Security > **SSL**: turn on the free SSL, then in `public_html/.htaccess` remove the `#` from the two `RewriteCond/RewriteRule` https lines.

## 4. Test (5 minutes)
1. Open `/contact/`, send a test enquiry (use "TEST ONLY" in the message). Wait 3+ seconds on the page before sending.
2. Open `/dashboard/`, enter the admin key. The test enquiry appears under **Enquiries**; change its status to Spam to hide it from your numbers.
3. Open `/tracking-checker/`, scan any site. It appears under **Site scans** with the address, type and what was found.
4. Browse a few pages in a normal browser window. After a minute, **Visitor activity** shows the page views.

## 5. Where the data lives
SQLite database `rb.sqlite` in the folder `rb-data` next to `public_html` (not downloadable). Back it up from File Manager now and then.
Enquiries, scans and visitor counters are all in that one file.

## 6. Notes
- Email uses PHP mail(). Check the spam folder on the first test; adding an SPF record in hPanel > Emails helps. The dashboard is the source of truth.
- `/admin` (Decap CMS) is Netlify-only and is not included.
- Each visitor can run 15 scans and send 5 enquiries per hour.
- Visitor counters ignore Do-Not-Track visitors and bots, store no IP addresses.
