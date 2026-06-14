<?php
// /api/user/me.php
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = currentUser();

if (!$user) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

// Map database fields to frontend PortalUser format. Role + ban now come from
// the portal columns (site_role / is_banned) so admin actions on the backend
// are reflected on next load. specialtyTagIds / favoriteItemIds are joined in.
$pdo = db();
$publicId = userPublicId($user);

$tags = $pdo->prepare('SELECT tag_id FROM user_specialty_tags WHERE user_id = ?');
$tags->execute([$publicId]);
$specialtyTagIds = array_map('strval', $tags->fetchAll(PDO::FETCH_COLUMN));

$favs = $pdo->prepare('SELECT item_id FROM user_favorites WHERE user_id = ?');
$favs->execute([$publicId]);
$favoriteItemIds = array_map('strval', $favs->fetchAll(PDO::FETCH_COLUMN));

$portalUser = [
    'id' => $publicId,
    'fullName' => $user['name'],
    'email' => $user['email'] ?? '',
    'role' => userSiteRole($user),
    'subject' => $user['subject'] ?? $user['specialization'],
    'specialtyTagIds' => $specialtyTagIds,
    'favoriteItemIds' => $favoriteItemIds,
    'isYoungSpecialist' => (bool) ($user['is_young_specialist'] ?? false),
    'isFirstEmployment' => (bool) ($user['is_first_employment'] ?? false),
    'isBanned' => (bool) ($user['is_banned'] ?? false),
    'createdAt' => $user['created_at'],
    'avatarUrl' => $user['avatar'] ? APP_URL . '/' . $user['avatar'] : null
];

jsonResponse([
    'success' => true,
    'user' => $portalUser
]);
