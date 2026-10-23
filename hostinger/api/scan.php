<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
// POST /api/scan { url, type: "leads"|"store" } : read-only tracking checker. Logs each scan for the dashboard.
// Safety: http(s) only, public IPs only (re-checked on every redirect, address pinned), 8 s timeout, 1.5 MB cap.

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(['error' => 'POST only'], 405);

function private_ip(string $ip): bool {
    if (getenv('RB_ALLOW_PRIVATE') === '1') return false;        // used only by the local test script
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
        || (bool)preg_match('~^(100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|169\.254\.|fe80|fc|fd|::1$|::ffff:)~i', $ip);
}
function resolve_public(string $host, int $port): string {
    $host = trim($host, '[]');
    if ($port !== 80 && $port !== 443 && getenv('RB_ALLOW_PRIVATE') !== '1') throw new RuntimeException('Only standard web ports can be checked.');
    if (!str_contains($host, '.') && !filter_var($host, FILTER_VALIDATE_IP)) throw new RuntimeException('Enter a full website address, like example.com.');
    $ips = [];
    if (filter_var($host, FILTER_VALIDATE_IP)) $ips[] = $host;
    else { foreach ((dns_get_record($host, DNS_A) ?: []) as $r) $ips[] = $r['ip']; foreach ((dns_get_record($host, DNS_AAAA) ?: []) as $r) $ips[] = $r['ipv6']; }
    if (!$ips) throw new RuntimeException('load');
    foreach ($ips as $ip) if (private_ip($ip)) throw new RuntimeException('That address is not a public website.');
    return $ips[0];
}
function http_get(string $url, int $max = 1500000, int $hops = 4): array {
    for ($i = 0; $i <= $hops; $i++) {
        $p = parse_url($url);
        if (!$p || !isset($p['host']) || !in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true)) throw new RuntimeException('Only http and https addresses can be checked.');
        $port = $p['port'] ?? (strtolower($p['scheme']) === 'https' ? 443 : 80);
        $ip = resolve_public($p['host'], (int)$port);
        $buf = ''; $loc = '';
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; RajuBepariTrackingChecker/1.0)', CURLOPT_HTTPHEADER => ['Accept: text/html,application/javascript,*/*;q=0.8'],
            CURLOPT_RESOLVE => [$p['host'] . ':' . $port . ':' . (str_contains($ip, ':') ? '[' . $ip . ']' : $ip)],
            CURLOPT_HEADERFUNCTION => function ($c, $h) use (&$loc) { if (stripos($h, 'location:') === 0) $loc = trim(substr($h, 9)); return strlen($h); },
            CURLOPT_WRITEFUNCTION => function ($c, $d) use (&$buf, $max) { $buf .= $d; return strlen($buf) > $max ? 0 : strlen($d); }]);
        curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_errno($ch); curl_close($ch);
        if ($code >= 300 && $code < 400 && $loc !== '') {
            if (!preg_match('~^https?://~i', $loc)) $loc = ($p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '')) . '/' . ltrim($loc, '/');
            $url = $loc; continue;
        }
        if ($code === 0 && $buf === '') throw new RuntimeException('load' . $err);
        return ['status' => $code, 'url' => $url, 'text' => $buf];
    }
    throw new RuntimeException('Too many redirects.');
}
function uniq(array $a): array { return array_values(array_unique($a)); }
function all_m(string $re, string $s, int $g = 1): array { return preg_match_all($re, $s, $m) ? uniq($m[$g]) : []; }
function has_re(string $re, string $s): bool { return (bool)preg_match($re, $s); }

$b = body(4000);
$type = (($b['type'] ?? '') === 'store') ? 'store' : 'leads';
$input = mb_substr(trim((string)($b['url'] ?? '')), 0, 300);
if ($input === '') out(['error' => 'Enter your website address.'], 400);
if (!preg_match('~^https?://~i', $input)) $input = 'https://' . $input;
if (rate_limited('scan', 15)) out(['error' => 'Too many scans from your connection this hour. Please try again later.'], 429);

try { $page = http_get($input); }
catch (Throwable $e) {
    $m = $e->getMessage();
    out(['error' => preg_match('/not a public|Only|Enter a full|redirect/', $m) ? $m : 'I could not load that page. Check the address and that the site is public.'], 422);
}
$html = $page['text'];
$gtmIds = all_m('~GTM-[A-Z0-9]{4,8}~', $html, 0);
$container = '';
foreach (array_slice($gtmIds, 0, 2) as $id) { try { $container .= http_get('https://www.googletagmanager.com/gtm.js?id=' . $id, 800000, 0)['text']; } catch (Throwable $e) {} }
$src = $html . "\n" . $container;
$has = fn(string $re) => has_re($re, $src);

$ga4 = all_m('~\bG-[A-Z0-9]{8,12}\b~', $src, 0);
$ua = all_m('~\bUA-\d{4,10}-\d{1,3}\b~', $src, 0);
$aw = all_m('~\bAW-\d{6,12}\b~', $src, 0);
$fb = all_m('~fbq\(\s*[\'"]init[\'"]\s*,\s*[\'"]?(\d{8,18})~', $src);
$customGtm = has_re('~<script[^>]+src=["\']https?://(?!www\.googletagmanager\.com)[^"\']+/gtm\.js\?id=GTM-~i', $html)
    || has_re('~["\']?(?:server_container_url|transport_url)["\']?\s*[:,]\s*["\']https?://(?!(?:www\.)?(?:google|googletagmanager)\.)[^"\'\s]+~i', $src);
$consentMode = $has('~gtag\(\s*[\'"]consent[\'"]\s*,\s*[\'"]default[\'"]~') || $has('~ad_user_data~') || $has('~"ad_storage"~');
$cmp = '';
foreach (['Cookiebot' => 'cookiebot', 'OneTrust' => 'onetrust|optanon', 'CookieYes' => 'cookieyes', 'iubenda' => 'iubenda', 'Termly' => 'termly', 'Complianz' => 'complianz', 'Usercentrics' => 'usercentrics'] as $n => $re) { if ($has("~$re~i")) { $cmp = $n; break; } }
$platform = '';
foreach (['Shopify' => 'cdn\.shopify\.com|Shopify\.theme', 'WordPress' => 'wp-content|wp-includes', 'Wix' => 'wixstatic|wix\.com', 'Squarespace' => 'squarespace', 'Webflow' => 'webflow', 'WooCommerce' => 'woocommerce', 'BigCommerce' => 'bigcommerce', 'Magento' => 'Magento|mage/|/static/version', 'PrestaShop' => 'prestashop', 'OpenCart' => 'opencart'] as $n => $re) { if (has_re("~$re~i", $html)) { $platform = $n; break; } }
$title = preg_match('~<title[^>]*>([^<]{1,120})~i', $html, $tm) ? trim($tm[1]) : '';

$q = '\\\\?["\']';
$oaiLoader = $has('~bzrcdn\.openai\.com~');
$oaiInit = all_m('~oaiq\(\s*' . $q . 'init' . $q . '\s*,\s*' . $q . '([^"\'\\\\]{6,64})~', $src);
$oaiEv = all_m('~oaiq\(\s*' . $q . 'measure' . $q . '\s*,\s*' . $q . '([a-z_]{3,40})~', $src);
$oaiPixel = $oaiLoader || $oaiInit || $oaiEv;
$oaiMap = ['generate_lead' => 'lead_created', 'purchase' => 'order_created'];
$bare = strlen($html) < 3000 && !$gtmIds;
$incomplete = $page['status'] >= 400 ? 'The site answered my scanner with status ' . $page['status'] . ', so I could not read the real page.'
    : ((has_re('~just a moment|cf-chl|attention required|access denied|captcha|enable javascript~i', substr($html, 0, 6000)) && strlen($html) < 60000) ? 'The site showed a bot-protection or JavaScript check instead of the page, so some or all tags could not be read.'
    : ($bare ? 'The page returned very little HTML, which usually means tags load only after JavaScript runs. Results below may miss tags that are really there.' : ''));
$T = fn($key, $name, $ok, $detail = '') => ['key' => $key, 'name' => $name, 'ok' => (bool)$ok, 'detail' => $detail];
$tags = [
    $T('gtm', 'Google Tag Manager', $gtmIds, implode(', ', $gtmIds)), $T('ga4', 'Google Analytics 4', $ga4, implode(', ', $ga4)), $T('ads', 'Google Ads tag / conversions', $aw, implode(', ', $aw)),
    $T('meta', 'Meta Pixel', $fb || $has('~connect\.facebook\.net/[^"\']*fbevents\.js~'), implode(', ', $fb)), $T('chatgpt', 'ChatGPT Ads pixel (OpenAI)', $oaiPixel, $oaiInit[0] ?? ''),
    $T('tiktok', 'TikTok Pixel', $has('~analytics\.tiktok\.com|ttq\.load~')), $T('linkedin', 'LinkedIn Insight Tag', $has('~snap\.licdn\.com|_linkedin_partner_id~')),
    $T('bing', 'Microsoft Ads (UET)', $has('~bat\.bing\.com~')), $T('clarity', 'Microsoft Clarity', $has('~clarity\.ms~')), $T('hotjar', 'Hotjar', $has('~static\.hotjar\.com|hjid~')),
    $T('consent', 'Consent Mode signals', $consentMode, $cmp ? 'Banner: ' . $cmp : ''), $T('server', 'Server-side tagging (custom GTM domain)', $customGtm),
];
$ga4Ev = uniq(array_merge(
    all_m('~"vtp_eventName"\s*:\s*"([A-Za-z0-9_]{2,40})"~', $src),
    all_m('~gtag\(\s*[\'"]event[\'"]\s*,\s*[\'"]([A-Za-z0-9_]{2,40})[\'"]~', $src),
    all_m('~"arg1"\s*:\s*"([a-z][a-z0-9_]{2,40})"~', $src),
    all_m('~dataLayer\.push\(\s*\{[^}]*?event[\'"]?\s*:\s*[\'"]([A-Za-z0-9_]{2,40})[\'"]~', $html)
));
$metaEv = all_m('~fbq\(\s*[\'"]track(?:Custom)?[\'"]\s*,\s*[\'"]([A-Za-z0-9_]{2,40})[\'"]~', $src);
$ecommerce = $type === 'store';
$plan = $ecommerce
    ? [['view_item', 'ViewContent', 'Product viewed'], ['add_to_cart', 'AddToCart', 'Item added to cart'], ['begin_checkout', 'InitiateCheckout', 'Checkout started'], ['purchase', 'Purchase', 'Order completed (with value and currency)']]
    : [['generate_lead', 'Lead', 'Lead form submitted'], ['phone_call_click', 'Contact', 'Click on a phone number or call button'], ['email_click', 'Contact', 'Click on an email address'], ['whatsapp_click', 'Contact', 'WhatsApp click'], ['booking_click', 'Schedule', 'Booking or appointment started']];
$alias = [
    'generate_lead' => '~(^|_)(generate_lead|lead|leads|form_?(submit|submission|success|sent)|submit_?form|ninja_form\w*|wpforms\w*|cf7\w*|gravity\w*|contact_form\w*)(_|$)~i',
    'phone_call_click' => '~(phone|call|tel)(_|$)|click_to_call|(^|_)tel_~i', 'email_click' => '~(^|_)(email|mailto)(_|$)~i',
    'whatsapp_click' => '~whatsapp|(^|_)wa_click~i', 'booking_click' => '~book|schedul|appointment|calendly~i',
];
$hit = function (array $set, string $name) use ($alias) { foreach ($set as $e) { if (isset($alias[$name]) ? preg_match($alias[$name], $e) : $e === $name) return true; } return false; };
$events = [];
foreach ($plan as [$name, $metaName, $label]) {
    $g = $hit($ga4Ev, $name); $m = in_array($metaName, $metaEv, true) || in_array($name, $metaEv, true);
    $c = isset($oaiMap[$name]) && in_array($oaiMap[$name], $oaiEv, true);
    $events[] = ['name' => $name, 'label' => $label, 'ga4' => $g, 'meta' => $m, 'metaName' => $metaName, 'ok' => $g || in_array($metaName, $metaEv, true) || $c, 'chatgpt' => $c];
}
$matched = function (string $e) use ($plan, $alias) { foreach ($plan as [$n]) { if (isset($alias[$n]) ? preg_match($alias[$n], $e) : $e === $n) return true; } return false; };
$standard = ['page_view', 'gtm.js', 'gtm.dom', 'gtm.load', 'gtm.click', 'gtm.linkClick', 'gtm.formSubmit', 'gtm.historyChange', 'gtm.scrollDepth', 'gtm.timer', 'gtm.video', 'gtm.elementVisibility', 'gtm.triggerGroup', 'gtm.init', 'gtm.init_consent', 'default', 'granted', 'denied'];
$noise = '~^(time|timer|outbound|button_click|history|visibility|scroll_depth|user_engagement|true|false|null|undefined|string|number|object|function|auto|none|gtag|config|set|js|get|consent|update|click|load|ready|submit|scroll|change|input|focus|blur|resize|text|url|path|host|href|name|value|type|id|class|class_name|tag|link|form|page|data|event|events|url_path|hostname)$~i';
$custom = array_slice(array_values(array_filter($ga4Ev, fn($e) => !in_array($e, $standard, true) && !$matched($e) && !str_starts_with($e, 'gtm.') && !preg_match($noise, $e) && preg_match('~^[a-z][a-z0-9_]*$~', $e) && strlen($e) > 3)), 0, 12);
$labels = [];
if (preg_match_all('~(?:"vtp_conversionLabel"\s*:\s*"([\w-]{6,})"|send_to[\'"]?\s*[:=]\s*[\'"]AW-\d+/([\w-]{6,}))~', $src, $lm, PREG_SET_ORDER)) foreach ($lm as $x) $labels[] = $x[1] !== '' ? $x[1] : ($x[2] ?? '');
$labels = uniq(array_filter($labels));
$missing = array_values(array_filter($events, fn($e) => !$e['ok']));
$pvOnlyMeta = $fb && !$metaEv;
$issues = []; $add = function ($level, $title, $text) use (&$issues) { $issues[] = ['level' => $level, 'title' => $title, 'text' => $text]; };
if (!$gtmIds) $add('warn', 'No Tag Manager container', 'Tags may be hard-coded in the theme, which is harder to audit and change safely.');
if (!$ga4 && !$ua) $add('bad', 'No Google Analytics found', 'I found no GA4 ID in the page or the GTM container.');
if ($ua && !$ga4) $add('bad', 'Only legacy Universal Analytics', 'Found ' . $ua[0] . '. Universal Analytics stopped processing data in 2023, so this tag collects nothing useful.');
if (count($ga4) > 1) $add('warn', 'More than one GA4 ID', implode(', ', $ga4) . '. Sometimes intentional, but often it means duplicated page views or conversions.');
$hardGa4 = all_m('~googletagmanager\.com/gtag/js\?id=(G-[A-Z0-9]+)~', $html);
foreach ($hardGa4 as $g) { if ($container !== '' && str_contains($container, $g)) { $add('bad', 'Possible double counting', 'GA4 (' . $g . ') is installed both in the page code and inside Tag Manager. Every event can be counted twice.'); break; } }
if ($ga4 && count($missing) === count($events)) $add('bad', 'GA4 is installed but no conversion events found', 'I could see none of: ' . implode(', ', array_column($events, 'name')) . '. Without them GA4 only records page views, and Google Ads has nothing to optimise on.');
if ($aw && !$labels) $add('bad', 'Google Ads tag without a conversion action', 'The Ads ID ' . $aw[0] . ' is present, but I found no conversion label. Smart Bidding may be learning from nothing.');
if ($pvOnlyMeta) $add('warn', 'Meta Pixel with page views only', 'The pixel loads, but I found no Lead, Purchase or AddToCart event calls.');
if ($fb && !$customGtm) $add('info', 'Meta Conversions API not visible', 'I cannot see from outside whether CAPI also sends events. It protects you from browser and iOS losses.');
if (($aw || $fb || $has('~linkedin|tiktok~')) && !$consentMode) $add('bad', 'No Consent Mode v2 signals', 'Advertising tags are present, but I found no consent signals. For EEA, UK and some other traffic, Google can ignore audience and conversion data without them.');
if ($ga4 && !$aw && !$fb) $add('info', 'No ad conversion tags', 'If you run ads, check that conversions reach Google Ads or Meta, not only GA4.');
if ($oaiPixel && !$oaiEv) $add('bad', 'ChatGPT Ads pixel without conversion events', 'The OpenAI pixel loads, but I found no oaiq("measure", ...) calls, so ChatGPT Ads has no conversions to report or optimise on.');
if ($oaiPixel) $add('info', 'Check the oppref click ID survives', 'ChatGPT Ads attribute clicks with the oppref parameter on your landing URL. Redirects, link shorteners or form pages that drop URL parameters break attribution.');
if ($oaiPixel && (in_array('lead_created', $oaiEv, true) || in_array('order_created', $oaiEv, true)) && !str_contains($src, 'event_id')) $add('warn', 'No event_id found for deduplication', 'If you also send conversions through the Conversions API, both calls need the same event_id or each conversion is counted twice.');
if ($incomplete) $add('warn', 'The scan may be incomplete', $incomplete);
$recommended = array_map(fn($e) => ['name' => $e['name'], 'label' => $e['label']], array_slice($missing, 0, 4));
if (!$oaiPixel && ($aw || $fb)) $recommended[] = ['name' => 'oaiq measure', 'label' => 'ChatGPT Ads conversion tracking (if you advertise there)'];
if (!$consentMode && ($aw || $fb)) $recommended[] = ['name' => 'consent_update', 'label' => 'Consent Mode v2'];
if (!$customGtm && ($aw || $fb)) $recommended[] = ['name' => 'server_side', 'label' => 'Server-side tracking'];

$result = ['ok' => true, 'page' => $page['url'], 'status' => $page['status'], 'title' => $title, 'platform' => $platform, 'cmp' => $cmp, 'tags' => $tags, 'events' => $events, 'custom' => $custom,
    'conversionLabels' => count($labels), 'siteType' => $ecommerce ? 'store' : 'leads', 'incomplete' => $incomplete, 'chatgptEvents' => $oaiEv, 'issues' => $issues, 'recommended' => $recommended, 'ecommerce' => $ecommerce,
    'limits' => 'This reads only what is publicly visible in the page source and the published GTM container. Tags loaded after consent, behind logins, or on other pages can be missed, and a tag being present does not prove it fires correctly.'];

try {   // log the scan so it shows in the dashboard (scanned address, type, what was found)
    $host = parse_url($page['url'], PHP_URL_HOST) ?: '';
    db()->prepare('INSERT INTO scans(created_at,url,host,type,platform,tags_found,events_found,events_total,issues,status,summary) VALUES(?,?,?,?,?,?,?,?,?,?,?)')->execute([
        gmdate('c'), mb_substr($page['url'], 0, 300), $host, $ecommerce ? 'store' : 'leads', $platform,
        count(array_filter($tags, fn($t) => $t['ok'])), count(array_filter($events, fn($e) => $e['ok'])), count($events), count($issues), $incomplete ? 'incomplete' : 'ok',
        json_encode(['tags' => array_values(array_map(fn($t) => $t['name'] . ($t['detail'] ? ' (' . $t['detail'] . ')' : ''), array_filter($tags, fn($t) => $t['ok']))),
            'events_missing' => array_column($missing, 'name'), 'issues' => array_column($issues, 'title')], JSON_UNESCAPED_UNICODE)]);
    bump(gmdate('Y-m-d'), 'ev', 'tracker_scan');
} catch (Throwable $e) { /* logging must never break the checker */ }
out($result);
