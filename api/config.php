<?php
// /api/config.php
declare(strict_types=1);

// ─── CORS ─────────────────────────────────────────────────────────
// Reflect the request origin when it is one of the allowed dev/prod
// origins. This is what fixes the avatar "Failed to fetch" problem:
// the Vite dev server can run on localhost OR 127.0.0.1, and a single
// hardcoded origin breaks the other one.
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1',
];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($requestOrigin !== '' && in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── Database config ──────────────────────────────────────────────
const DB_HOST = 'localhost';
const DB_NAME = 'profbaza_api';
const DB_USER = 'root';
const DB_PASS = '';

// ─── App config ───────────────────────────────────────────────────
const APP_URL = 'http://localhost/profbase/api';
const FRONTEND_URL = 'http://localhost:5173';
