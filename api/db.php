<?php
// /api/db.php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

// Never leak raw PHP errors/HTML into API responses — they break the frontend
// JSON parser. Convert any uncaught error into a clean JSON payload instead.
ini_set('display_errors', '0');

set_exception_handler(function (Throwable $e): void {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['error' => 'Ошибка сервера: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
});

register_shutdown_function(function (): void {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode(['error' => 'Внутренняя ошибка сервера.'], JSON_UNESCAPED_UNICODE);
    }
});

// Функция подключения к БД
function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_NAME
    );

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'База данных недоступна. Убедитесь, что MySQL (XAMPP) запущен и база profbaza_api создана.'], 503);
    }

    return $pdo;
}

// Отправка JSON ответа
function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Извлечение Bearer токена
function getBearerToken(): ?string
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}

// Получение текущего пользователя по api_token
function currentUser(): ?array
{
    $token = getBearerToken();
    if (!$token) {
        return null;
    }

    $stmt = db()->prepare('
        SELECT u.*, r.name as role_name 
        FROM users u 
        LEFT JOIN roles r ON r.id = u.role_id 
        WHERE u.api_token = ? 
        LIMIT 1
    ');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if ($user) {
        return $user;
    }

    return null;
}
