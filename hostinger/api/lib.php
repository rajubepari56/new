<?php
declare(strict_types=1);
// Shared helpers: config, SQLite storage, JSON output, admin auth, hashing.

function cfg(string $k, $d = '') {
    static $c = null;
    if ($c === null) { $c = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : []; }
    return $c[$k] ?? $d;
}

function out($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body(int $max = 12000): array {
    $t = file_get_contents('php://input') ?: '';
    if (strlen($t) > $max) out(['ok' => false, 'error' => 'payload_too_large'], 413);
    $j = json_decode($t, true);
    return is_array($j) ? $j : [];
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    // Prefer a folder above public_html so the database is never downloadable; fall back to a protected folder here.
    $dirs = [];
    $root = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($root) $dirs[] = dirname(rtrim($root, '/')) . '/rb-data';
    $dirs[] = __DIR__ . '/_data';
    $dir = null;
    foreach ($dirs as $d) { if (is_dir($d) || @mkdir($d, 0750, true)) { if (is_writable($d)) { $dir = $d; break; } } }
    if (!$dir) out(['ok' => false, 'error' => 'storage_not_writable'], 500);
    if (str_starts_with($dir, __DIR__)) @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    $pdo = new PDO('sqlite:' . $dir . '/rb.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=4000;');
    $pdo->exec("CREATE TABLE IF NOT EXISTS leads(id TEXT PRIMARY KEY, created_at TEXT, data TEXT, forward TEXT);
      CREATE TABLE IF NOT EXISTS lead_meta(id TEXT PRIMARY KEY, status TEXT, notes TEXT, updated TEXT);
      CREATE TABLE IF NOT EXISTS counters(day TEXT, kind TEXT, k TEXT, n INTEGER, PRIMARY KEY(day, kind, k));
      CREATE TABLE IF NOT EXISTS scans(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, url TEXT, host TEXT, type TEXT, platform TEXT, tags_found INTEGER, events_found INTEGER, events_total INTEGER, issues INTEGER, status TEXT, summary TEXT);
      CREATE TABLE IF NOT EXISTS rate(k TEXT PRIMARY KEY, n INTEGER, t INTEGER);");
    return $pdo;
}

function bump(string $day, string $kind, string $k, int $by = 1): void {
    db()->prepare('INSERT INTO counters(day,kind,k,n) VALUES(?,?,?,?) ON CONFLICT(day,kind,k) DO UPDATE SET n=n+?')->execute([$day, $kind, $k, $by, $by]);
}

function ip_hash(): string {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip = trim(explode(',', $ip)[0]);
    return substr(hash('sha256', $ip . cfg('hash_salt', 'salt')), 0, 24);
}

/** Returns true when the visitor is over the limit. Window: one hour. */
function rate_limited(string $bucket, int $max): bool {
    $k = $bucket . ':' . ip_hash() . ':' . gmdate('YmdH');
    $p = db();
    $p->prepare('DELETE FROM rate WHERE t < ?')->execute([time() - 7200]);
    $row = $p->prepare('SELECT n FROM rate WHERE k=?'); $row->execute([$k]); $n = (int)($row->fetchColumn() ?: 0);
    if ($n >= $max) return true;
    $p->prepare('INSERT INTO rate(k,n,t) VALUES(?,1,?) ON CONFLICT(k) DO UPDATE SET n=n+1')->execute([$k, time()]);
    return false;
}

function require_admin(): void {
    $key = (string)cfg('admin_key', '');
    if ($key === '' || strlen($key) < 8) out(['error' => 'not_configured', 'note' => 'Set admin_key in api/config.php'], 503);
    $sent = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
    $user = (string)cfg('admin_user', '');
    $userOk = $user === '' || hash_equals($user, $_SERVER['HTTP_X_ADMIN_USER'] ?? '');
    if (!hash_equals($key, $sent) || !$userOk) { usleep(400000); out(['error' => 'unauthorised'], 401); }
}

function clean_str($v, int $max): string {
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', (string)($v ?? ''));
    return mb_substr(trim($s), 0, $max);
}

function post_json(string $url, array $data, array $headers = [], int $timeout = 8): int {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($data), CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers)]);
    curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    return $code;
}
