<?php
// /api/incidents/index.php — incident guides / reports.
// Actions (POST { action, ... }):
//   createIncident  (any authenticated user — "report"); records reporter
//   updateIncident  (editor / site_admin)
//   deleteIncident  (editor / site_admin)
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';

$cols = [
    'title' => 'title', 'category' => 'category', 'level' => 'level', 'audience' => 'audience',
    'summary' => 'summary', 'firstSteps' => 'first_steps', 'documents' => 'documents',
    'owner' => 'owner', 'attachmentName' => 'attachment_name', 'attachmentUrl' => 'attachment_url',
];

switch ($action) {
    case 'createIncident': {
        validateRequiredFields($body, ['title']);
        $id = (string) ($body['id'] ?? newId('inc'));
        $stmt = $pdo->prepare(
            'INSERT INTO incidents
               (id, title, category, level, audience, summary, first_steps, documents, owner,
                attachment_name, attachment_url, reported_by_user_id, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?, current_timestamp())'
        );
        $stmt->execute([
            $id, (string) $body['title'], $body['category'] ?? '', $body['level'] ?? 'Средний',
            $body['audience'] ?? '', $body['summary'] ?? '', $body['firstSteps'] ?? '',
            $body['documents'] ?? '', $body['owner'] ?? 'Редакция',
            $body['attachmentName'] ?? null, $body['attachmentUrl'] ?? null, userPublicId($me),
        ]);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'updateIncident': {
        requireRole(['editor', 'site_admin']);
        validateRequiredFields($body, ['incidentId']);
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;
        $sets = [];
        $args = [];
        foreach ($cols as $in => $col) {
            if (array_key_exists($in, $patch)) {
                $sets[] = "`$col` = ?";
                $args[] = $patch[$in];
            }
        }
        if ($sets) {
            $args[] = (string) $body['incidentId'];
            $pdo->prepare('UPDATE incidents SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($args);
        }
        jsonResponse(['success' => true]);
    }

    case 'deleteIncident': {
        requireRole(['editor', 'site_admin']);
        validateRequiredFields($body, ['incidentId']);
        $pdo->prepare('DELETE FROM incidents WHERE id = ?')->execute([(string) $body['incidentId']]);
        jsonResponse(['success' => true]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
