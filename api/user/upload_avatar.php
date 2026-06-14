<?php
// /api/user/upload_avatar.php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = currentUser();

if (!$user) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['error' => 'Ошибка загрузки файла'], 400);
}

$file = $_FILES['avatar'];
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$mimeType = mime_content_type($file['tmp_name']);

if (!in_array($mimeType, $allowedMimeTypes)) {
    jsonResponse(['error' => 'Разрешены только изображения (JPG, PNG, GIF, WEBP)'], 400);
}

if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['error' => 'Максимальный размер файла - 5 МБ'], 400);
}

// Генерируем уникальное имя файла
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('avatar_', true) . '.' . $ext;
$uploadDir = __DIR__ . '/../uploads/avatars/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Сохраняем путь в базу данных относительно /api
    $dbPath = 'uploads/avatars/' . $filename;
    $stmt = db()->prepare('UPDATE users SET avatar = ? WHERE id = ?');
    $stmt->execute([$dbPath, $user['id']]);

    jsonResponse([
        'success' => true,
        'avatarUrl' => APP_URL . '/' . $dbPath
    ]);
} else {
    jsonResponse(['error' => 'Не удалось сохранить файл'], 500);
}
