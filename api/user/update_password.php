<?php
// /api/user/update_password.php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = currentUser();

if (!$user) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    jsonResponse(['error' => 'Invalid JSON'], 400);
}

$currentPassword = $input['currentPassword'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (strlen($newPassword) < 6) {
    jsonResponse(['error' => 'Новый пароль должен содержать минимум 6 символов'], 400);
}

// Проверяем текущий пароль
// Если пароль в базе пустой (например, пользователь зарегистрировался через OAuth),
// мы можем либо разрешить установку нового, либо требовать сброса.
// В нашем случае, если пароля нет, разрешим установку сразу.
if (!empty($user['password_hash'])) {
    if (!password_verify($currentPassword, $user['password_hash'])) {
        jsonResponse(['error' => 'Текущий пароль указан неверно'], 400);
    }
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$stmt->execute([$newHash, $user['id']]);

jsonResponse(['success' => true]);
