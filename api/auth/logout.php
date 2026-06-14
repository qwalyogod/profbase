<?php
// /api/auth/logout.php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = currentUser();

if ($user) {
    $pdo = db();
    $stmt = $pdo->prepare('UPDATE users SET api_token = NULL WHERE id = ?');
    $stmt->execute([$user['id']]);
}

jsonResponse(['success' => true]);
