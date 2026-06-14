<?php
// /api/notifications/index.php
// Actions (POST { action, ... }):
//   createNotification  (site_admin/editor for global; org_admin for org scopes)
//   dismissNotification (self — marks as read/dismissed for current user)
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';

switch ($action) {
    case 'createNotification': {
        validateRequiredFields($body, ['title', 'message']);
        $scope = $body['scope'] ?? 'all';
        $orgId = $body['organizationId'] ?? null;
        // Org-scoped notifications: org admin of that org. Global: editor/site_admin.
        if (in_array($scope, ['organization', 'organization_users'], true)) {
            if (!$orgId) {
                jsonResponse(['error' => 'organizationId обязателен для этой рассылки'], 400);
            }
            requireOrgAdmin($pdo, (string) $orgId);
        } else {
            requireRole(['editor', 'site_admin']);
        }
        $id = (string) ($body['id'] ?? newId('ntf'));
        $stmt = $pdo->prepare(
            'INSERT INTO notifications (id, title, message, sender_label, organization_id, scope, created_at)
             VALUES (?,?,?,?,?,?, current_timestamp())'
        );
        $stmt->execute([
            $id, (string) $body['title'], (string) $body['message'],
            $body['senderLabel'] ?? '', $orgId, $scope,
        ]);
        $insU = $pdo->prepare('INSERT IGNORE INTO notification_users (notification_id, user_id) VALUES (?,?)');
        foreach (($body['userIds'] ?? []) as $uid) {
            $insU->execute([$id, (string) $uid]);
        }
        $insR = $pdo->prepare('INSERT IGNORE INTO notification_roles (notification_id, role) VALUES (?,?)');
        foreach (($body['targetRoles'] ?? []) as $role) {
            $insR->execute([$id, (string) $role]);
        }
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'dismissNotification': {
        validateRequiredFields($body, ['notificationId']);
        // A user can only dismiss for themselves.
        $myId = userPublicId($me);
        $pdo->prepare('INSERT IGNORE INTO notification_dismissals (notification_id, user_id) VALUES (?,?)')
            ->execute([(string) $body['notificationId'], $myId]);
        jsonResponse(['success' => true]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
