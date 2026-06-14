<?php
// /api/auth/demo_login.php
// Demo-only "login as" used by the header role-switcher. Issues a real api_token
// for the chosen demo account so the rest of the app runs through the normal
// authenticated path. Guarded by site_settings.demo_mode and limited to the
// seeded demo users (public_id like 'u-%').
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$body = readJsonBody();
validateRequiredFields($body, ['userId']);
$userId = (string) $body['userId'];

$pdo = db();
$demoMode = (int) ($pdo->query('SELECT demo_mode FROM site_settings WHERE id = 1')->fetchColumn() ?: 0);
if ($demoMode !== 1) {
    jsonResponse(['error' => 'Демонстрационный режим выключен'], 403);
}
// Only the seeded demo accounts can be switched into.
if (!preg_match('/^u-/', $userId)) {
    jsonResponse(['error' => 'Этот аккаунт недоступен для демо-входа'], 403);
}

$stmt = $pdo->prepare('SELECT id, is_banned FROM users WHERE public_id = ? LIMIT 1');
$stmt->execute([$userId]);
$user = $stmt->fetch();
if (!$user) {
    jsonResponse(['error' => 'Пользователь не найден'], 404);
}
if ((int) $user['is_banned'] === 1) {
    jsonResponse(['error' => 'Аккаунт заблокирован. Вход недоступен.'], 403);
}

$token = bin2hex(random_bytes(32));
$pdo->prepare('UPDATE users SET api_token = ? WHERE id = ?')->execute([$token, $user['id']]);

jsonResponse(['success' => true, 'token' => $token]);
