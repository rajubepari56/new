<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
require __DIR__ . '/schema.php';
// POST /api/lead : validate, store in SQLite, email you, optionally forward to n8n.

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(['ok' => false, 'error' => 'method_not_allowed'], 405);

$site = rtrim((string)cfg('site_url', ''), '/');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $oh = parse_url($origin, PHP_URL_HOST); $sh = parse_url($site, PHP_URL_HOST) ?: ($_SERVER['HTTP_HOST'] ?? '');
    $same = $oh && (strcasecmp($oh, (string)$sh) === 0 || strcasecmp($oh, 'www.' . $sh) === 0 || strcasecmp('www.' . $oh, (string)$sh) === 0 || strcasecmp($oh, $_SERVER['HTTP_HOST'] ?? '') === 0);
    if (!$same && !preg_match('~^https?://localhost(:\d+)?$~', $origin)) out(['ok' => false, 'error' => 'forbidden_origin'], 403);
}

$raw = body();
if (!empty($raw['bot-field']) || !empty($raw['bot_field'])) out(['ok' => true]);           // honeypot
if (!((float)($raw['elapsed_ms'] ?? 0) >= 3000)) out(['ok' => true]);                       // too fast = bot

[$errors, $lead] = validate_lead($raw);
if ($errors) out(['ok' => false, 'error' => 'validation', 'fields' => $errors], 422);

$id = $lead['submission_id'] ?: bin2hex(random_bytes(16));
$p = db();
$dup = $p->prepare('SELECT 1 FROM leads WHERE id=?'); $dup->execute([$id]);
if ($dup->fetchColumn()) out(['ok' => true, 'id' => $id, 'duplicate' => true]);
if (rate_limited('lead', 5)) out(['ok' => false, 'error' => 'rate_limited'], 429);

$payload = $lead; $payload['submission_id'] = $id; $payload['submitted_at'] = gmdate('c'); $payload['consent'] = true;

$forward = 'not_configured';
$hook = (string)cfg('n8n_webhook', '');
if ($hook !== '') {
    $h = []; if (cfg('n8n_secret', '') !== '') $h[] = 'x-webhook-secret: ' . cfg('n8n_secret');
    $code = post_json($hook, $payload, $h);
    $forward = ($code >= 200 && $code < 300) ? 'ok' : 'failed_' . $code;
}

try {
    $p->prepare('INSERT INTO leads(id,created_at,data,forward) VALUES(?,?,?,?)')->execute([$id, $payload['submitted_at'], json_encode($payload, JSON_UNESCAPED_UNICODE), $forward]);
} catch (Throwable $e) {
    if ($forward !== 'ok') out(['ok' => false, 'error' => 'could_not_save'], 502);
}

$to = (string)cfg('notify_email', '');
if ($to !== '') {
    $lines = [];
    foreach (['name', 'email', 'phone', 'website', 'business_type', 'service', 'budget', 'goal', 'preferred_contact', 'message', 'source', 'page'] as $k) $lines[] = ucfirst(str_replace('_', ' ', $k)) . ': ' . ($payload[$k] ?? '');
    $host = parse_url($site, PHP_URL_HOST) ?: ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $hdr = "From: Website <no-reply@{$host}>\r\nReply-To: " . str_replace(["\r", "\n"], '', $payload['email']) . "\r\nContent-Type: text/plain; charset=UTF-8";
    @mail($to, 'New enquiry from ' . str_replace(["\r", "\n"], ' ', $payload['name']), implode("\n", $lines), $hdr);
}
out(['ok' => true, 'id' => $id, 'delivery' => $forward === 'ok' ? 'n8n' : 'stored']);
