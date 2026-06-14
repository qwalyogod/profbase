<?php
// /api/lib/helpers.php
// Reusable auth / role / request helpers shared by every portal endpoint.
// Builds on db.php (db(), jsonResponse(), currentUser(), getBearerToken()).
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

// ─── Request body helpers ───────────────────────────────────────────────────

/** Read + decode the JSON request body. Returns [] when empty/invalid. */
function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Ensure all $fields are present and non-empty in $body. Responds 400 and exits
 * otherwise. "0" / 0 / false count as present; only null / '' / missing fail.
 */
function validateRequiredFields(array $body, array $fields): void
{
    $missing = [];
    foreach ($fields as $field) {
        $value = $body[$field] ?? null;
        if ($value === null || (is_string($value) && trim($value) === '')) {
            $missing[] = $field;
        }
    }
    if ($missing) {
        jsonResponse(['error' => 'Не заполнены обязательные поля: ' . implode(', ', $missing)], 400);
    }
}

/** Generate a stable string id with a domain prefix (e.g. org-, news-). */
function newId(string $prefix): string
{
    return $prefix . '-' . bin2hex(random_bytes(8));
}

/** Only allow the given HTTP methods; respond 405 otherwise. */
function requireMethod(array $methods): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $methods, true)) {
        jsonResponse(['error' => 'Метод не разрешён'], 405);
    }
}

// ─── Current user / auth ────────────────────────────────────────────────────

/**
 * The authenticated user row (or null). Adds nothing magic: currentUser() now
 * returns the extended users row including public_id / site_role / is_banned.
 */
function getCurrentUser(): ?array
{
    return currentUser();
}

/** Portal-facing string id of a user row (public_id, falls back to id). */
function userPublicId(array $user): string
{
    $pid = $user['public_id'] ?? null;
    return ($pid !== null && $pid !== '') ? (string) $pid : (string) $user['id'];
}

/** Effective site role of a user row. */
function userSiteRole(array $user): string
{
    $role = $user['site_role'] ?? null;
    if ($role) {
        return (string) $role;
    }
    // Fallback to legacy Russian role taxonomy.
    return match ($user['role_name'] ?? '') {
        'Суперадминистратор'       => 'site_admin',
        'Администратор организации' => 'organization_admin',
        'Редактор', 'Модератор контента' => 'editor',
        default => 'user',
    };
}

/** Require a signed-in, non-banned user. Exits 401/403 otherwise. */
function requireAuth(): array
{
    $user = getCurrentUser();
    if (!$user) {
        jsonResponse(['error' => 'Требуется авторизация'], 401);
    }
    if ((int) ($user['is_banned'] ?? 0) === 1) {
        jsonResponse(['error' => 'Аккаунт заблокирован'], 403);
    }
    return $user;
}

/**
 * Require the authenticated user to hold one of the given site roles.
 * Returns the user row, or exits 403.
 */
function requireRole(array $roles): array
{
    $user = requireAuth();
    if (!in_array(userSiteRole($user), $roles, true)) {
        jsonResponse(['error' => 'Недостаточно прав для этого действия'], 403);
    }
    return $user;
}

/** True when the user is the global site administrator. */
function isSiteAdmin(array $user): bool
{
    return userSiteRole($user) === 'site_admin';
}

/**
 * True when the user administers the given organization: either they are the
 * global site admin, or they hold an approved organization_admin membership.
 */
function isOrgAdmin(PDO $pdo, array $user, string $organizationId): bool
{
    if (isSiteAdmin($user)) {
        return true;
    }
    $stmt = $pdo->prepare(
        'SELECT 1 FROM memberships
          WHERE user_id = ? AND organization_id = ? AND role = "organization_admin" AND status = "approved"
          LIMIT 1'
    );
    $stmt->execute([userPublicId($user), $organizationId]);
    return (bool) $stmt->fetchColumn();
}

/** Require org-admin (or site-admin) rights over $organizationId. Exits 403. */
function requireOrgAdmin(PDO $pdo, string $organizationId): array
{
    $user = requireAuth();
    if (!isOrgAdmin($pdo, $user, $organizationId)) {
        jsonResponse(['error' => 'Нужны права администратора организации'], 403);
    }
    return $user;
}

/** True if the user is an editor or site admin (content moderation rights). */
function canModerateContent(array $user): bool
{
    return in_array(userSiteRole($user), ['editor', 'site_admin'], true);
}

// ─── JSON column helpers ────────────────────────────────────────────────────

/** Decode a JSON text column into a PHP array, tolerating null/garbage. */
function jsonColumn(?string $value, $fallback = [])
{
    if ($value === null || $value === '') {
        return $fallback;
    }
    $decoded = json_decode($value, true);
    return $decoded === null ? $fallback : $decoded;
}

/** Encode a value as JSON for storage (unicode-safe). */
function jsonStore($value): string
{
    return json_encode($value, JSON_UNESCAPED_UNICODE);
}
