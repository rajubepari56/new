<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
// GET /api/leads : every enquiry with its status and notes (same shape the dashboard already expects).
require_admin();
$rows = db()->query('SELECT l.id, l.created_at, l.data, l.forward, m.status, m.notes FROM leads l LEFT JOIN lead_meta m ON m.id = l.id ORDER BY l.created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
$leads = [];
foreach ($rows as $r) {
    $d = json_decode($r['data'], true) ?: [];
    $leads[] = ['id' => $r['id'], 'created_at' => $r['created_at'], 'name' => $d['name'] ?? '', 'email' => $d['email'] ?? '', 'phone' => $d['phone'] ?? '', 'country' => '', 'company' => '',
        'website' => $d['website'] ?? '', 'service' => $d['service'] ?? '', 'budget' => $d['budget'] ?? '', 'preferred_contact' => $d['preferred_contact'] ?? '', 'message' => $d['message'] ?? '',
        'source' => ($d['source'] ?? '') ?: ($d['page'] ?? ''), 'business_type' => $d['business_type'] ?? '', 'goal' => $d['goal'] ?? '', 'forward' => $r['forward'] ?? '',
        'status' => $r['status'] ?: 'new', 'notes' => $r['notes'] ?: ''];
}
out(['leads' => $leads]);
