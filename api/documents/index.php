<?php
// /api/documents/index.php — organization document sections + documents.
// All write actions require org-admin rights over the owning organization.
// Actions (POST { action, ... }):
//   createSection, updateSection, deleteSection
//   createDocument, updateDocument, deleteDocument
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';

/** Resolve the organization that owns a section / document. */
$orgOf = static function (PDO $pdo, string $table, string $id): ?string {
    $stmt = $pdo->prepare("SELECT organization_id FROM `$table` WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $v = $stmt->fetchColumn();
    return $v === false ? null : (string) $v;
};
/** Replace a document's normalized access rules from an access object. */
$writeAccess = static function (PDO $pdo, string $docId, array $access): void {
    foreach (['document_access_roles', 'document_access_tags', 'document_access_subjects', 'document_access_users'] as $t) {
        $pdo->prepare("DELETE FROM `$t` WHERE document_id = ?")->execute([$docId]);
    }
    foreach (($access['roles'] ?? []) as $r) {
        $pdo->prepare('INSERT IGNORE INTO document_access_roles (document_id, role) VALUES (?,?)')->execute([$docId, (string) $r]);
    }
    foreach (($access['specialtyTagIds'] ?? []) as $t) {
        $pdo->prepare('INSERT IGNORE INTO document_access_tags (document_id, tag_id) VALUES (?,?)')->execute([$docId, (string) $t]);
    }
    foreach (($access['subjects'] ?? []) as $s) {
        $pdo->prepare('INSERT IGNORE INTO document_access_subjects (document_id, subject) VALUES (?,?)')->execute([$docId, (string) $s]);
    }
    foreach (($access['userIds'] ?? []) as $u) {
        $pdo->prepare('INSERT IGNORE INTO document_access_users (document_id, user_id) VALUES (?,?)')->execute([$docId, (string) $u]);
    }
};

switch ($action) {
    case 'createSection': {
        validateRequiredFields($body, ['organizationId', 'name']);
        $orgId = (string) $body['organizationId'];
        requireOrgAdmin($pdo, $orgId);
        $id = (string) ($body['id'] ?? newId('section'));
        $pdo->prepare('INSERT INTO sections (id, organization_id, name, description, kind) VALUES (?,?,?,?,?)')
            ->execute([$id, $orgId, (string) $body['name'], $body['description'] ?? '', $body['kind'] ?? 'common']);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'updateSection': {
        validateRequiredFields($body, ['sectionId']);
        $sectionId = (string) $body['sectionId'];
        $orgId = $orgOf($pdo, 'sections', $sectionId);
        if (!$orgId) jsonResponse(['error' => 'Раздел не найден'], 404);
        requireOrgAdmin($pdo, $orgId);
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;
        $map = ['name' => 'name', 'description' => 'description', 'kind' => 'kind'];
        $sets = [];
        $args = [];
        foreach ($map as $in => $col) {
            if (array_key_exists($in, $patch)) { $sets[] = "`$col` = ?"; $args[] = $patch[$in]; }
        }
        if ($sets) {
            $args[] = $sectionId;
            $pdo->prepare('UPDATE sections SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($args);
        }
        jsonResponse(['success' => true]);
    }

    case 'deleteSection': {
        validateRequiredFields($body, ['sectionId']);
        $sectionId = (string) $body['sectionId'];
        $orgId = $orgOf($pdo, 'sections', $sectionId);
        if (!$orgId) jsonResponse(['error' => 'Раздел не найден'], 404);
        requireOrgAdmin($pdo, $orgId);
        $pdo->prepare('DELETE FROM sections WHERE id = ?')->execute([$sectionId]); // cascades documents
        jsonResponse(['success' => true]);
    }

    case 'createDocument': {
        validateRequiredFields($body, ['organizationId', 'sectionId', 'title']);
        $orgId = (string) $body['organizationId'];
        requireOrgAdmin($pdo, $orgId);
        $id = (string) ($body['id'] ?? newId('doc'));
        $access = is_array($body['access'] ?? null) ? $body['access'] : ['mode' => 'all'];
        $pdo->prepare(
            'INSERT INTO documents (id, organization_id, section_id, title, type, subject, description, size, file_url, file_name, access_mode, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?, current_timestamp())'
        )->execute([
            $id, $orgId, (string) $body['sectionId'], (string) $body['title'], $body['type'] ?? 'PDF',
            $body['subject'] ?? null, $body['description'] ?? '', $body['size'] ?? '',
            $body['fileUrl'] ?? null, $body['fileName'] ?? null, $access['mode'] ?? 'all',
        ]);
        $writeAccess($pdo, $id, $access);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'updateDocument': {
        validateRequiredFields($body, ['documentId']);
        $docId = (string) $body['documentId'];
        $orgId = $orgOf($pdo, 'documents', $docId);
        if (!$orgId) jsonResponse(['error' => 'Документ не найден'], 404);
        requireOrgAdmin($pdo, $orgId);
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;
        $map = [
            'title' => 'title', 'type' => 'type', 'subject' => 'subject', 'description' => 'description',
            'size' => 'size', 'sectionId' => 'section_id', 'fileUrl' => 'file_url', 'fileName' => 'file_name',
        ];
        $sets = [];
        $args = [];
        foreach ($map as $in => $col) {
            if (array_key_exists($in, $patch)) { $sets[] = "`$col` = ?"; $args[] = $patch[$in]; }
        }
        if (array_key_exists('access', $patch) && is_array($patch['access'])) {
            $sets[] = 'access_mode = ?';
            $args[] = $patch['access']['mode'] ?? 'all';
        }
        $sets[] = 'updated_at = current_timestamp()';
        $args[] = $docId;
        $pdo->prepare('UPDATE documents SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($args);
        if (array_key_exists('access', $patch) && is_array($patch['access'])) {
            $writeAccess($pdo, $docId, $patch['access']);
        }
        jsonResponse(['success' => true]);
    }

    case 'deleteDocument': {
        validateRequiredFields($body, ['documentId']);
        $docId = (string) $body['documentId'];
        $orgId = $orgOf($pdo, 'documents', $docId);
        if (!$orgId) jsonResponse(['error' => 'Документ не найден'], 404);
        requireOrgAdmin($pdo, $orgId);
        $pdo->prepare('DELETE FROM documents WHERE id = ?')->execute([$docId]);
        jsonResponse(['success' => true]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
