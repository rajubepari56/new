<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
// GET /api/scans : how many scans were run, which sites, and what was found.
require_admin();
$p = db();
$now = gmdate('c', time() - 86400); $wk = gmdate('c', time() - 7 * 86400);
$one = fn(string $sql, array $a = []) => (function () use ($p, $sql, $a) { $s = $p->prepare($sql); $s->execute($a); return (int)$s->fetchColumn(); })();
$rows = $p->query('SELECT id, created_at, url, host, type, platform, tags_found, events_found, events_total, issues, status, summary FROM scans ORDER BY id DESC LIMIT 500')->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as &$r) { $r['summary'] = json_decode($r['summary'] ?? '', true) ?: new stdClass(); }
$perDay = $p->query("SELECT substr(created_at,1,10) d, COUNT(*) n FROM scans WHERE created_at >= date('now','-29 day') GROUP BY d ORDER BY d")->fetchAll(PDO::FETCH_KEY_PAIR);
out(['total' => $one('SELECT COUNT(*) FROM scans'), 'last24h' => $one('SELECT COUNT(*) FROM scans WHERE created_at >= ?', [$now]), 'last7d' => $one('SELECT COUNT(*) FROM scans WHERE created_at >= ?', [$wk]),
    'stores' => $one("SELECT COUNT(*) FROM scans WHERE type='store'"), 'services' => $one("SELECT COUNT(*) FROM scans WHERE type='leads'"), 'unique_sites' => $one('SELECT COUNT(DISTINCT host) FROM scans'),
    'per_day' => (object)$perDay, 'scans' => $rows]);
