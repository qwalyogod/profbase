<?php
// /api/users/index.php — user management + personal preferences.
// Actions (POST { action, ... }):
//   updateUser        (site_admin)  — patch a user's profile/role
//   deleteUser        (site_admin)
//   setUserBanState   (site_admin)
//   toggleFavoriteItem (self)        — add/remove a saved knowledge item
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';

$roleNameFor = [
    'site_admin' => 'Суперадминистратор',
    'organization_admin' => 'Администратор организации',
    'editor' => 'Редактор',
    'user' => 'Пользователь',
];

switch ($action) {
    case 'updateUser': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['userId']);
        $userId = (string) $body['userId'];
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;

        $sets = [];
        $args = [];
        $map = [
            'fullName' => 'name',
            'email' => 'email',
            'subject' => 'subject',
        ];
        foreach ($map as $in => $col) {
            if (array_key_exists($in, $patch)) {
                $sets[] = "`$col` = ?";
                $args[] = $patch[$in];
            }
        }
        if (array_key_exists('isYoungSpecialist', $patch)) {
            $sets[] = '`is_young_specialist` = ?';
            $args[] = !empty($patch['isYoungSpecialist']) ? 1 : 0;
        }
        if (array_key_exists('isFirstEmployment', $patch)) {
            $sets[] = '`is_first_employment` = ?';
            $args[] = !empty($patch['isFirstEmployment']) ? 1 : 0;
        }
        if (array_key_exists('isBanned', $patch)) {
            $sets[] = '`is_banned` = ?';
            $args[] = !empty($patch['isBanned']) ? 1 : 0;
        }
        if (array_key_exists('role', $patch)) {
            $role = (string) $patch['role'];
            $sets[] = '`site_role` = ?';
            $args[] = $role;
            $rid = $pdo->prepare('SELECT id FROM roles WHERE name = ? LIMIT 1');
            $rid->execute([$roleNameFor[$role] ?? 'Пользователь']);
            $roleId = $rid->fetchColumn();
            if ($roleId) {
                $sets[] = '`role_id` = ?';
                $args[] = $roleId;
            }
        }
        if ($sets) {
            $args[] = $userId;
            $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE public_id = ?');
            $stmt->execute($args);
        }
        if (array_key_exists('specialtyTagIds', $patch) && is_array($patch['specialtyTagIds'])) {
            $pdo->prepare('DELETE FROM user_specialty_tags WHERE user_id = ?')->execute([$userId]);
            $ins = $pdo->prepare('INSERT IGNORE INTO user_specialty_tags (user_id, tag_id) VALUES (?,?)');
            foreach ($patch['specialtyTagIds'] as $tagId) {
                $ins->execute([$userId, (string) $tagId]);
            }
        }
        jsonResponse(['success' => true, 'id' => $userId]);
    }

    case 'deleteUser': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['userId']);
        $userId = (string) $body['userId'];
        // Cascades clean portal-owned rows that FK to users.public_id.
        $pdo->prepare('DELETE FROM users WHERE public_id = ?')->execute([$userId]);
        jsonResponse(['success' => true]);
    }

    case 'setUserBanState': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['userId']);
        $stmt = $pdo->prepare('UPDATE users SET is_banned = ? WHERE public_id = ?');
        $stmt->execute([!empty($body['isBanned']) ? 1 : 0, (string) $body['userId']]);
        jsonResponse(['success' => true]);
    }

    case 'toggleFavoriteItem': {
        validateRequiredFields($body, ['itemId']);
        $itemId = (string) $body['itemId'];
        $myId = userPublicId($me);
        $exists = $pdo->prepare('SELECT 1 FROM user_favorites WHERE user_id = ? AND item_id = ?');
        $exists->execute([$myId, $itemId]);
        if ($exists->fetchColumn()) {
            $pdo->prepare('DELETE FROM user_favorites WHERE user_id = ? AND item_id = ?')->execute([$myId, $itemId]);
            jsonResponse(['success' => true, 'favorited' => false]);
        }
        $pdo->prepare('INSERT IGNORE INTO user_favorites (user_id, item_id) VALUES (?,?)')->execute([$myId, $itemId]);
        jsonResponse(['success' => true, 'favorited' => true]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
