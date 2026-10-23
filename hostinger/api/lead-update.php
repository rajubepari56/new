<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
// POST /api/lead-update { id, status, notes }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(['error' => 'method'], 405);
require_admin();
$b = body(8000);
$id = (string)($b['id'] ?? '');
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $id)) out(['error' => 'bad_id'], 400);
$status = in_array($b['status'] ?? '', ['new', 'contacted', 'call-booked', 'proposal', 'won', 'lost', 'spam'], true) ? $b['status'] : 'new';
$notes = mb_substr((string)($b['notes'] ?? ''), 0, 4000);
db()->prepare('INSERT INTO lead_meta(id,status,notes,updated) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, notes=excluded.notes, updated=excluded.updated')->execute([$id, $status, $notes, gmdate('c')]);
out(['ok' => true]);
