<?php
// Settings for the Hostinger backend. Edit this file in hPanel > File Manager (public_html/api/config.php).
// This folder is not listed by the web server and only the PHP endpoints are reachable from the browser.
return [
    // REQUIRED: the password you type on /dashboard/. Use a long random phrase, 20+ characters.
    'admin_key'      => '',
    // Where new enquiries are emailed. Leave empty to turn email off.
    'notify_email'   => 'rajubepari56@gmail.com',
    // Optional: your n8n webhook. Leads are POSTed here as JSON as well.
    'n8n_webhook'    => '',
    'n8n_secret'     => '',
    // Your site address with no trailing slash (used to accept form posts from your own pages only).
    'site_url'       => 'https://yourdomain.com',
    // Any random text. Used to hash IP addresses for rate limiting. IPs are never stored.
    'hash_salt'      => 'change-me-to-random-text',
];
