<?php
// /api/auth/register.php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$name = trim($input['fullName'] ?? '');
$isYoungSpecialist = !empty($input['isYoungSpecialist']) ? 1 : 0;
$isFirstEmployment = !empty($input['isFirstEmployment']) ? 1 : 0;
$specialization = trim($input['specialization'] ?? '');

if (!$email || !$password || !$name) {
    jsonResponse(['error' => 'Email, password and name are required'], 400);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'Email is already registered'], 400);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$newToken = bin2hex(random_bytes(32));

$stmt = $pdo->prepare('SELECT id FROM roles WHERE name = "Пользователь" LIMIT 1');
$stmt->execute();
$roleId = $stmt->fetchColumn() ?: null;

$stmt = $pdo->prepare('INSERT INTO users (email, password_hash, name, role_id, api_token, is_young_specialist, is_first_employment, specialization) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$email, $hash, $name, $roleId, $newToken, $isYoungSpecialist, $isFirstEmployment, $specialization]);

jsonResponse([
    'success' => true,
    'token' => $newToken
]);
