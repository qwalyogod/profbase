<?php
// /api/admin/index.php — site settings + specialty tag administration.
// Actions (POST { action, ... }):
//   updateSiteSettings   (site_admin)
//   createSpecialtyTag   (site_admin, or org_admin when organizationId given)
//   deleteSpecialtyTag   (site_admin)
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';

switch ($action) {
    case 'updateSiteSettings': {
        requireRole(['site_admin']);
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;
        $map = [
            'portalName' => 'portal_name',
            'importantNoteTitle' => 'important_note_title',
            'firstLoginHelpTitle' => 'first_login_help_title',
            'supportEmail' => 'support_email',
        ];
        $sets = [];
        $args = [];
        foreach ($map as $in => $col) {
            if (array_key_exists($in, $patch)) {
                $sets[] = "`$col` = ?";
                $args[] = $patch[$in];
            }
        }
        if ($sets) {
            $stmt = $pdo->prepare('UPDATE site_settings SET ' . implode(', ', $sets) . ' WHERE id = 1');
            $stmt->execute($args);
        }
        jsonResponse(['success' => true]);
    }

    case 'createSpecialtyTag': {
        validateRequiredFields($body, ['name']);
        $orgId = $body['organizationId'] ?? null;
        // org-scoped tags can be created by that org's admin; global tags by site admin
        if ($orgId) {
            requireOrgAdmin($pdo, (string) $orgId);
        } else {
            requireRole(['site_admin']);
        }
        $id = (string) ($body['id'] ?? newId('tag'));
        $features = $body['features'] ?? ['diary' => false, 'calendar' => false, 'notes' => false, 'documents' => false, 'journal' => false];
        $stmt = $pdo->prepare(
            'INSERT INTO specialty_tags (id, organization_id, name, description, color, features, created_at)
             VALUES (?,?,?,?,?,?, current_timestamp())'
        );
        $stmt->execute([
            $id, $orgId, (string) $body['name'], $body['description'] ?? '', $body['color'] ?? '#2563eb', jsonStore($features),
        ]);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'deleteSpecialtyTag': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['tagId']);
        $tagId = (string) $body['tagId'];
        $pdo->prepare('DELETE FROM specialty_tags WHERE id = ?')->execute([$tagId]);
        // remove dangling references (these junctions have no FK to specialty_tags)
        foreach (['user_specialty_tags', 'org_specialty_tags', 'membership_specialty_tags', 'document_access_tags', 'news_specialty_tags'] as $t) {
            $pdo->prepare("DELETE FROM `$t` WHERE tag_id = ?")->execute([$tagId]);
        }
        jsonResponse(['success' => true]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
