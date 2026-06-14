<?php
// /api/cabinet/index.php — personal specialist cabinet (per-user).
// Each user only ever reads/writes their OWN cabinet (keyed by token identity).
//   GET                         -> { features: { calendar: [...], notes: [...], ... } }
//   POST { feature, payload }   -> upsert one feature's payload
// Features: calendar, notes, diary, journal, employment-docs, employment-steps.
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['GET', 'POST']);
$me = requireAuth();
$pdo = db();
$myId = userPublicId($me);

$allowed = ['calendar', 'notes', 'diary', 'journal', 'employment-docs', 'employment-steps'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT feature, payload FROM cabinet_entries WHERE user_id = ?');
    $stmt->execute([$myId]);
    $features = [];
    foreach ($stmt->fetchAll() as $row) {
        $features[$row['feature']] = jsonColumn($row['payload'], null);
    }
    jsonResponse(['success' => true, 'features' => $features]);
}

// POST — save one feature
$body = readJsonBody();
validateRequiredFields($body, ['feature']);
$feature = (string) $body['feature'];
if (!in_array($feature, $allowed, true)) {
    jsonResponse(['error' => 'Неизвестный раздел кабинета'], 400);
}
$payload = $body['payload'] ?? null;
$stmt = $pdo->prepare(
    'INSERT INTO cabinet_entries (user_id, feature, payload, updated_at)
     VALUES (?,?,?, current_timestamp())
     ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = current_timestamp()'
);
$stmt->execute([$myId, $feature, jsonStore($payload)]);
jsonResponse(['success' => true]);
