<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
// POST /api/track : anonymous counters. No IP, cookie, visitor id or user agent is stored. DNT / GPC respected.
function quiet(): void { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') quiet();
if (($_SERVER['HTTP_DNT'] ?? '') === '1' || ($_SERVER['HTTP_SEC_GPC'] ?? '') === '1') quiet();
if (preg_match('/bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|node-fetch/i', $_SERVER['HTTP_USER_AGENT'] ?? '')) quiet();
$b = body(2000);
if (!$b) quiet();
$clean = fn($v, $n) => mb_substr(preg_replace('/[^\w\-.\/:@ ]/u', '', (string)($v ?? '')), 0, $n);
$day = gmdate('Y-m-d');
$path = $clean(preg_split('/[?#]/', (string)($b['p'] ?? ''))[0], 120) ?: '/';
if (preg_match('~^/(dashboard|admin|api)\b~', $path)) quiet();
$t = $b['t'] ?? '';
if ($t === 'pv') {
    bump($day, 'pv', $path);
    if (!empty($b['s'])) {
        bump($day, 'sessions', 's');
        bump($day, 'ref', $clean($b['ref'] ?? '', 60) ?: '(direct)');
        bump($day, 'dev', !empty($b['m']) ? 'mobile' : 'desktop');
        $cc = strtoupper($clean($_SERVER['HTTP_CF_IPCOUNTRY'] ?? '', 2)); if ($cc !== '' && $cc !== 'XX') bump($day, 'cc', $cc);
        $src = $clean($b['u'] ?? '', 40); if ($src !== '') bump($day, 'src', $src);
    }
} elseif ($t === 'ev' && in_array($b['e'] ?? '', ['whatsapp_click', 'email_click', 'booking_click', 'upwork_click', 'cta_click', 'social_click', 'generate_lead'], true)) {
    bump($day, 'ev', $b['e']);
    bump($day, 'ev', $b['e'] . ' @ ' . ($clean($b['l'] ?? '', 40) ?: 'other'));
}
quiet();
