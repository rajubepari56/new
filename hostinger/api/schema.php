<?php
declare(strict_types=1);
// Contact form validation. Mirrors netlify/lib/lead-schema.mjs.
const BUSINESS_TYPES = ['Local service business', 'Ecommerce', 'Agency', 'Other'];
const SERVICES = ['Google Ads Management', 'GA4 Setup & Audit', 'Google Tag Manager', 'Meta Pixel & Conversions API', 'Server-Side Tracking (sGTM)', 'Enhanced & Offline Conversions', 'Google Merchant Center', 'Local SEO', 'Not sure, need an audit'];
const BUDGETS = ['Under $1,000', '$1,000-$5,000', '$5,000-$20,000', '$20,000+'];
const GOALS = ['More leads', 'Higher ROAS', 'Fix tracking', 'Other'];
const CONTACT_PREFS = ['WhatsApp', 'Email'];

function normalise_url($v): string {
    $s = clean_str($v, 200);
    if ($s === '') return '';
    if (!preg_match('~^https?://~i', $s)) $s = 'https://' . $s;
    $p = parse_url($s);
    if (!$p || empty($p['host']) || !in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true) || !str_contains($p['host'], '.')) return '';
    return $s;
}

function validate_lead(array $b): array {
    $e = [];
    $consent = ($b['consent'] ?? false);
    $l = [
        'name' => clean_str($b['name'] ?? '', 100),
        'email' => strtolower(clean_str($b['email'] ?? '', 254)),
        'website' => normalise_url($b['website'] ?? ''),
        'business_type' => clean_str($b['business_type'] ?? '', 40),
        'service' => clean_str($b['service'] ?? '', 60),
        'budget' => clean_str($b['budget'] ?? '', 30),
        'goal' => clean_str($b['goal'] ?? '', 30),
        'message' => clean_str($b['message'] ?? '', 3000),
        'preferred_contact' => clean_str($b['preferred_contact'] ?? '', 20),
        'phone' => clean_str($b['phone'] ?? '', 30),
        'source' => preg_replace('/[^a-z0-9_-]/i', '', clean_str($b['source'] ?? '', 60)),
        'page' => clean_str($b['page'] ?? '', 120),
        'submission_id' => preg_replace('/[^a-z0-9-]/i', '', clean_str($b['submission_id'] ?? '', 64)),
        'consent' => $consent === true || $consent === 'true' || $consent === 'on',
    ];
    if (mb_strlen($l['name']) < 2) $e['name'] = 'Please enter your full name.';
    if (!preg_match('/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/', $l['email'])) $e['email'] = 'Please enter a valid email address.';
    if ($l['website'] === '') $e['website'] = 'Please enter your website address, for example example.com.';
    if (!in_array($l['business_type'], BUSINESS_TYPES, true)) $e['business_type'] = 'Please choose your business type.';
    if (!in_array($l['service'], SERVICES, true)) $e['service'] = 'Please choose the service you need.';
    if ($l['budget'] !== '' && !in_array($l['budget'], BUDGETS, true)) $e['budget'] = 'Please choose one of the budget ranges, or leave it empty.';
    if (!in_array($l['goal'], GOALS, true)) $e['goal'] = 'Please choose your main goal.';
    if (!in_array($l['preferred_contact'], CONTACT_PREFS, true)) $e['preferred_contact'] = 'Please choose how I should reach you.';
    $phoneOk = (bool)preg_match('/^\+?[0-9 ()\-]{7,20}$/', $l['phone']);
    if ($l['preferred_contact'] === 'WhatsApp' && !$phoneOk) $e['phone'] = 'Please enter your WhatsApp number with the country code.';
    if ($l['preferred_contact'] !== 'WhatsApp') $l['phone'] = $phoneOk ? $l['phone'] : '';
    if (!$l['consent']) $e['consent'] = 'Please tick the box so I may contact you about your enquiry.';
    return [$e, $l];
}
