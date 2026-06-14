<?php
// /api/user/update_profile.php
// Update full name and/or email. Changing email requires the current password.
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
if (!is_array($input)) {
    jsonResponse(['error' => 'Invalid JSON'], 400);
}

$fullName = isset($input['fullName']) ? trim((string) $input['fullName']) : null;
$email = isset($input['email']) ? trim((string) $input['email']) : null;
$currentPassword = (string) ($input['currentPassword'] ?? '');

$pdo = db();
$emailChanged = $email !== null && strtolower($email) !== strtolower((string) $user['email']);

// Changing email requires confirming the current password.
if ($emailChanged) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Укажите корректный email'], 400);
    }
    if (!empty($user['password_hash']) && !password_verify($currentPassword, $user['password_hash'])) {
        jsonResponse(['error' => 'Текущий пароль указан неверно'], 400);
    }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
    $stmt->execute([$email, $user['id']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Этот email уже занят'], 400);
    }
}

if ($fullName !== null && $fullName === '') {
    jsonResponse(['error' => 'Имя не может быть пустым'], 400);
}

$fields = [];
$params = [];
if ($fullName !== null) {
    $fields[] = 'name = ?';
    $params[] = $fullName;
}
if ($emailChanged) {
    $fields[] = 'email = ?';
    $params[] = $email;
}

if (!$fields) {
    jsonResponse(['error' => 'Нет изменений для сохранения'], 400);
}

$params[] = $user['id'];
$stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
$stmt->execute($params);

jsonResponse([
    'success' => true,
    'fullName' => $fullName ?? $user['name'],
    'email' => $emailChanged ? $email : ($user['email'] ?? ''),
]);
