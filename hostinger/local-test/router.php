<?php
// Local test server for the Hostinger version. Mimics what .htaccess does on Hostinger.
// Put this file next to the unzipped "site" folder (the contents of raju-bepari-hostinger.zip) and run:
//   php -S localhost:8000 router.php
$root = __DIR__ . '/site';
$u = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (preg_match('~^/api/(lead|leads|lead-update|track|activity|scan|scans)/?$~', $u, $m)) { $_SERVER['DOCUMENT_ROOT'] = $root; require "$root/api/{$m[1]}.php"; return true; }
if (preg_match('~^/(blog|privacy)/?$~', $u, $m)) { header('Location: ' . ($m[1] === 'blog' ? '/insights/' : '/privacy-policy/'), true, 301); return true; }
$f = $root . $u; if (is_dir($f)) $f = rtrim($f, '/') . '/index.html';
if (is_file($f) && !preg_match('~\.php$~', $f)) {
    $mime = ['css' => 'text/css', 'js' => 'application/javascript', 'svg' => 'image/svg+xml', 'webp' => 'image/webp', 'jpg' => 'image/jpeg', 'png' => 'image/png', 'ico' => 'image/x-icon',
        'html' => 'text/html; charset=utf-8', 'xml' => 'application/xml', 'json' => 'application/json', 'txt' => 'text/plain', 'woff2' => 'font/woff2'][pathinfo($f, PATHINFO_EXTENSION)] ?? 'application/octet-stream';
    header("Content-Type: $mime"); readfile($f); return true;
}
http_response_code(404); readfile("$root/404.html"); return true;
