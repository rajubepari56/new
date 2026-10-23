<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
// GET /api/activity?days=30
require_admin();
$days = max(1, min(90, (int)($_GET['days'] ?? 30)));
$from = gmdate('Y-m-d', time() - ($days - 1) * 86400);
$st = db()->prepare('SELECT day, kind, k, n FROM counters WHERE day >= ?'); $st->execute([$from]);
$by = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) { $by[$r['day']][$r['kind']][$r['k']] = (int)$r['n']; }
$res = [];
for ($i = $days - 1; $i >= 0; $i--) {
    $d = gmdate('Y-m-d', time() - $i * 86400); $x = $by[$d] ?? [];
    $res[] = ['day' => $d, 'pv' => (object)($x['pv'] ?? []), 'ev' => (object)($x['ev'] ?? []), 'ref' => (object)($x['ref'] ?? []), 'cc' => (object)($x['cc'] ?? []), 'dev' => (object)($x['dev'] ?? []), 'src' => (object)($x['src'] ?? []), 'sessions' => (int)($x['sessions']['s'] ?? 0)];
}
out(['days' => $res]);
