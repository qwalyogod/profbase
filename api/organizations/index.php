<?php
// /api/organizations/index.php — organizations, memberships, invites, requests.
// Replicates the original PortalContext business rules authoritatively so the
// backend is the source of truth. Actions (POST { action, ... }):
//   createOrganization, updateOrganization, deleteOrganization        (site_admin / org_admin)
//   assignOrganizationAdmin, removeOrganizationAdmin                  (site_admin)
//   setMemberRole, assignOrganizationSpecialtyTags,
//   assignMemberSpecialtyTags, generateOrganizationInviteCode        (org_admin / site_admin)
//   submitJoinRequest, submitOrgCreationRequest                      (any user)
//   reviewJoinRequest                                                (org_admin / site_admin)
//   reviewOrgCreationRequest                                         (site_admin)
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';
$myId = userPublicId($me);

/** Recompute & persist a user's site_role + matching legacy role_id. */
$setUserSiteRole = static function (PDO $pdo, string $userId, string $role): void {
    $names = [
        'site_admin' => 'Суперадминистратор', 'organization_admin' => 'Администратор организации',
        'editor' => 'Редактор', 'user' => 'Пользователь',
    ];
    $rid = $pdo->prepare('SELECT id FROM roles WHERE name = ? LIMIT 1');
    $rid->execute([$names[$role] ?? 'Пользователь']);
    $roleId = $rid->fetchColumn() ?: null;
    $pdo->prepare('UPDATE users SET site_role = ?, role_id = ? WHERE public_id = ?')->execute([$role, $roleId, $userId]);
};
/** Add tag ids to a user's specialty tags (union — never removes). */
$addUserTags = static function (PDO $pdo, string $userId, array $tagIds): void {
    $ins = $pdo->prepare('INSERT IGNORE INTO user_specialty_tags (user_id, tag_id) VALUES (?,?)');
    foreach ($tagIds as $t) {
        if ($t !== null && $t !== '') $ins->execute([$userId, (string) $t]);
    }
};
$orgOf = static function (PDO $pdo, string $table, string $idCol, string $id): ?string {
    $stmt = $pdo->prepare("SELECT organization_id FROM `$table` WHERE `$idCol` = ? LIMIT 1");
    $stmt->execute([$id]);
    $v = $stmt->fetchColumn();
    return $v === false ? null : (string) $v;
};

switch ($action) {
    case 'createOrganization': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['shortName', 'fullName']);
        $id = (string) ($body['id'] ?? newId('org'));
        $pdo->prepare(
            'INSERT INTO organizations (id, short_name, full_name, description, is_active, created_at)
             VALUES (?,?,?,?,1, current_timestamp())'
        )->execute([$id, (string) $body['shortName'], (string) $body['fullName'], $body['description'] ?? '']);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'updateOrganization': {
        validateRequiredFields($body, ['organizationId']);
        $orgId = (string) $body['organizationId'];
        requireOrgAdmin($pdo, $orgId);
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;
        $map = ['shortName' => 'short_name', 'fullName' => 'full_name', 'description' => 'description'];
        $sets = [];
        $args = [];
        foreach ($map as $in => $col) {
            if (array_key_exists($in, $patch)) { $sets[] = "`$col` = ?"; $args[] = $patch[$in]; }
        }
        if (array_key_exists('isActive', $patch)) { $sets[] = 'is_active = ?'; $args[] = !empty($patch['isActive']) ? 1 : 0; }
        if ($sets) {
            $args[] = $orgId;
            $pdo->prepare('UPDATE organizations SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($args);
        }
        if (array_key_exists('specialtyTagIds', $patch) && is_array($patch['specialtyTagIds'])) {
            $pdo->prepare('DELETE FROM org_specialty_tags WHERE organization_id = ?')->execute([$orgId]);
            $ins = $pdo->prepare('INSERT IGNORE INTO org_specialty_tags (organization_id, tag_id) VALUES (?,?)');
            foreach ($patch['specialtyTagIds'] as $t) $ins->execute([$orgId, (string) $t]);
        }
        jsonResponse(['success' => true]);
    }

    case 'deleteOrganization': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['organizationId']);
        // FK cascades remove memberships, invite_codes, join_requests, sections, documents.
        $pdo->prepare('DELETE FROM organizations WHERE id = ?')->execute([(string) $body['organizationId']]);
        jsonResponse(['success' => true]);
    }

    case 'assignOrganizationAdmin': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['organizationId', 'userId']);
        $orgId = (string) $body['organizationId'];
        $userId = (string) $body['userId'];
        $exists = $pdo->prepare('SELECT id FROM memberships WHERE organization_id = ? AND user_id = ? LIMIT 1');
        $exists->execute([$orgId, $userId]);
        $mid = $exists->fetchColumn();
        if ($mid) {
            $pdo->prepare('UPDATE memberships SET role = "organization_admin", status = "approved" WHERE id = ?')->execute([$mid]);
        } else {
            $pdo->prepare('INSERT INTO memberships (id, organization_id, user_id, role, status, joined_at)
                           VALUES (?,?,?,"organization_admin","approved", current_timestamp())')
                ->execute([newId('membership'), $orgId, $userId]);
        }
        $setUserSiteRole($pdo, $userId, 'organization_admin');
        jsonResponse(['success' => true]);
    }

    case 'removeOrganizationAdmin': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['organizationId', 'userId']);
        $orgId = (string) $body['organizationId'];
        $userId = (string) $body['userId'];
        $pdo->prepare('UPDATE memberships SET role = "member" WHERE organization_id = ? AND user_id = ? AND role = "organization_admin"')
            ->execute([$orgId, $userId]);
        $still = $pdo->prepare('SELECT 1 FROM memberships WHERE user_id = ? AND role = "organization_admin" AND status = "approved" LIMIT 1');
        $still->execute([$userId]);
        if (!$still->fetchColumn()) {
            $cur = $pdo->prepare('SELECT site_role FROM users WHERE public_id = ?');
            $cur->execute([$userId]);
            if ($cur->fetchColumn() === 'organization_admin') {
                $setUserSiteRole($pdo, $userId, 'user');
            }
        }
        jsonResponse(['success' => true]);
    }

    case 'setMemberRole': {
        validateRequiredFields($body, ['membershipId', 'role']);
        $mid = (string) $body['membershipId'];
        $orgId = $orgOf($pdo, 'memberships', 'id', $mid);
        if (!$orgId) jsonResponse(['error' => 'Участник не найден'], 404);
        requireOrgAdmin($pdo, $orgId);
        $role = (string) $body['role'];
        $stmt = $pdo->prepare('SELECT user_id FROM memberships WHERE id = ?');
        $stmt->execute([$mid]);
        $userId = (string) $stmt->fetchColumn();
        $pdo->prepare('UPDATE memberships SET role = ? WHERE id = ?')->execute([$role, $mid]);
        $tagForRole = $role === 'teacher' ? 'tag-teacher' : ($role === 'general_specialist' ? 'tag-general' : null);
        if ($tagForRole) {
            $pdo->prepare('INSERT IGNORE INTO membership_specialty_tags (membership_id, tag_id) VALUES (?,?)')->execute([$mid, $tagForRole]);
            $addUserTags($pdo, $userId, [$tagForRole]);
        }
        jsonResponse(['success' => true]);
    }

    case 'assignOrganizationSpecialtyTags': {
        validateRequiredFields($body, ['organizationId']);
        $orgId = (string) $body['organizationId'];
        requireOrgAdmin($pdo, $orgId);
        $tags = is_array($body['specialtyTagIds'] ?? null) ? $body['specialtyTagIds'] : [];
        $pdo->prepare('DELETE FROM org_specialty_tags WHERE organization_id = ?')->execute([$orgId]);
        $ins = $pdo->prepare('INSERT IGNORE INTO org_specialty_tags (organization_id, tag_id) VALUES (?,?)');
        foreach ($tags as $t) $ins->execute([$orgId, (string) $t]);
        jsonResponse(['success' => true]);
    }

    case 'assignMemberSpecialtyTags': {
        validateRequiredFields($body, ['membershipId']);
        $mid = (string) $body['membershipId'];
        $orgId = $orgOf($pdo, 'memberships', 'id', $mid);
        if (!$orgId) jsonResponse(['error' => 'Участник не найден'], 404);
        requireOrgAdmin($pdo, $orgId);
        $stmt = $pdo->prepare('SELECT user_id FROM memberships WHERE id = ?');
        $stmt->execute([$mid]);
        $userId = (string) $stmt->fetchColumn();
        $tags = is_array($body['specialtyTagIds'] ?? null) ? $body['specialtyTagIds'] : [];
        $pdo->prepare('DELETE FROM membership_specialty_tags WHERE membership_id = ?')->execute([$mid]);
        $ins = $pdo->prepare('INSERT IGNORE INTO membership_specialty_tags (membership_id, tag_id) VALUES (?,?)');
        foreach ($tags as $t) $ins->execute([$mid, (string) $t]);
        $addUserTags($pdo, $userId, $tags); // propagate to user (union)
        jsonResponse(['success' => true]);
    }

    case 'generateOrganizationInviteCode': {
        validateRequiredFields($body, ['organizationId']);
        $orgId = (string) $body['organizationId'];
        requireOrgAdmin($pdo, $orgId);
        $code = strtoupper((string) ($body['code'] ?? substr(bin2hex(random_bytes(4)), 0, 8)));
        $pdo->prepare('UPDATE invite_codes SET is_active = 0 WHERE organization_id = ?')->execute([$orgId]);
        $pdo->prepare('INSERT INTO invite_codes (id, organization_id, code, created_at, expires_at, is_active)
                       VALUES (?,?,?, current_timestamp(), NULL, 1)')
            ->execute([(string) ($body['id'] ?? newId('invite')), $orgId, $code]);
        jsonResponse(['success' => true, 'code' => $code], 201);
    }

    case 'submitJoinRequest': {
        validateRequiredFields($body, ['inviteCode']);
        $code = strtoupper(trim((string) $body['inviteCode']));
        $inv = $pdo->prepare('SELECT organization_id, code FROM invite_codes WHERE UPPER(code) = ? AND is_active = 1 LIMIT 1');
        $inv->execute([$code]);
        $invite = $inv->fetch();
        if (!$invite) jsonResponse(['error' => 'Код приглашения не найден или уже недействителен.'], 404);
        $orgId = (string) $invite['organization_id'];
        $mem = $pdo->prepare('SELECT 1 FROM memberships WHERE organization_id = ? AND user_id = ? LIMIT 1');
        $mem->execute([$orgId, $myId]);
        if ($mem->fetchColumn()) jsonResponse(['error' => 'Вы уже состоите в этой организации.'], 400);
        $pend = $pdo->prepare('SELECT 1 FROM join_requests WHERE organization_id = ? AND user_id = ? AND status = "pending" LIMIT 1');
        $pend->execute([$orgId, $myId]);
        if ($pend->fetchColumn()) jsonResponse(['error' => 'У вас уже есть активная заявка в эту организацию.'], 400);
        $id = (string) ($body['id'] ?? newId('request'));
        $pdo->prepare('INSERT INTO join_requests (id, organization_id, user_id, invite_code, status, created_at)
                       VALUES (?,?,?,?,"pending", current_timestamp())')
            ->execute([$id, $orgId, $myId, $invite['code']]);
        jsonResponse(['success' => true, 'id' => $id, 'organizationId' => $orgId], 201);
    }

    case 'reviewJoinRequest': {
        validateRequiredFields($body, ['requestId']);
        $reqId = (string) $body['requestId'];
        $stmt = $pdo->prepare('SELECT * FROM join_requests WHERE id = ?');
        $stmt->execute([$reqId]);
        $req = $stmt->fetch();
        if (!$req || $req['status'] !== 'pending') jsonResponse(['error' => 'Заявка не найдена или уже обработана.'], 404);
        requireOrgAdmin($pdo, (string) $req['organization_id']);
        $approve = !empty($body['approve']);
        $pdo->beginTransaction();
        try {
            $pdo->prepare('UPDATE join_requests SET status = ?, reviewed_at = current_timestamp(), reviewed_by_user_id = ? WHERE id = ?')
                ->execute([$approve ? 'approved' : 'rejected', $myId, $reqId]);
            if ($approve) {
                $orgId = (string) $req['organization_id'];
                $userId = (string) $req['user_id'];
                // inherit the org's first specialty tag
                $t = $pdo->prepare('SELECT tag_id FROM org_specialty_tags WHERE organization_id = ? LIMIT 1');
                $t->execute([$orgId]);
                $inherited = $t->fetchColumn();
                $inheritedTags = $inherited ? [(string) $inherited] : [];
                $ex = $pdo->prepare('SELECT id FROM memberships WHERE organization_id = ? AND user_id = ? LIMIT 1');
                $ex->execute([$orgId, $userId]);
                $existing = $ex->fetchColumn();
                if ($existing) {
                    $pdo->prepare('UPDATE memberships SET status = "approved" WHERE id = ?')->execute([$existing]);
                    $mid = (string) $existing;
                } else {
                    $mid = newId('membership');
                    $pdo->prepare('INSERT INTO memberships (id, organization_id, user_id, role, status, joined_at)
                                   VALUES (?,?,?,"teacher","approved", current_timestamp())')->execute([$mid, $orgId, $userId]);
                }
                foreach ($inheritedTags as $tag) {
                    $pdo->prepare('INSERT IGNORE INTO membership_specialty_tags (membership_id, tag_id) VALUES (?,?)')->execute([$mid, $tag]);
                }
                $addUserTags($pdo, $userId, $inheritedTags);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
        jsonResponse(['success' => true]);
    }

    case 'submitOrgCreationRequest': {
        validateRequiredFields($body, ['shortName', 'fullName']);
        $id = (string) ($body['id'] ?? newId('org-req'));
        $pdo->prepare('INSERT INTO org_creation_requests (id, user_id, short_name, full_name, description, status, created_at)
                       VALUES (?,?,?,?,?,"pending", current_timestamp())')
            ->execute([$id, $myId, trim((string) $body['shortName']), trim((string) $body['fullName']), trim((string) ($body['description'] ?? ''))]);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'reviewOrgCreationRequest': {
        requireRole(['site_admin']);
        validateRequiredFields($body, ['requestId']);
        $reqId = (string) $body['requestId'];
        $stmt = $pdo->prepare('SELECT * FROM org_creation_requests WHERE id = ?');
        $stmt->execute([$reqId]);
        $req = $stmt->fetch();
        if (!$req || $req['status'] !== 'pending') jsonResponse(['error' => 'Заявка не найдена или уже обработана.'], 404);
        $approve = !empty($body['approve']);
        $comment = trim((string) ($body['comment'] ?? ''));
        $pdo->beginTransaction();
        try {
            if (!$approve) {
                $pdo->prepare('UPDATE org_creation_requests SET status = "rejected", reviewed_at = current_timestamp(), reviewed_by_user_id = ?, comment = ? WHERE id = ?')
                    ->execute([$myId, $comment ?: null, $reqId]);
                $nid = newId('ntf');
                $pdo->prepare('INSERT INTO notifications (id, title, message, sender_label, organization_id, scope, created_at)
                               VALUES (?,?,?,?,NULL,"users", current_timestamp())')
                    ->execute([$nid, 'Заявка на организацию отклонена: ' . $req['short_name'],
                        $comment ?: 'Заявка на подключение организации отклонена администратором.', 'Администрация сайта']);
                $pdo->prepare('INSERT IGNORE INTO notification_users (notification_id, user_id) VALUES (?,?)')->execute([$nid, $req['user_id']]);
            } else {
                $orgId = newId('org');
                $pdo->prepare('INSERT INTO organizations (id, short_name, full_name, description, is_active, created_at)
                               VALUES (?,?,?,?,1, current_timestamp())')
                    ->execute([$orgId, $req['short_name'], $req['full_name'], $req['description'] ?: 'Описание не заполнено.']);
                foreach (['tag-teacher', 'tag-general'] as $tag) {
                    $pdo->prepare('INSERT IGNORE INTO org_specialty_tags (organization_id, tag_id) VALUES (?,?)')->execute([$orgId, $tag]);
                }
                $pdo->prepare('INSERT INTO memberships (id, organization_id, user_id, role, status, joined_at)
                               VALUES (?,?,?,"organization_admin","approved", current_timestamp())')
                    ->execute([newId('membership'), $orgId, $req['user_id']]);
                $pdo->prepare('INSERT INTO invite_codes (id, organization_id, code, created_at, expires_at, is_active)
                               VALUES (?,?,?, current_timestamp(), NULL, 1)')
                    ->execute([newId('invite'), $orgId, strtoupper(substr(bin2hex(random_bytes(4)), 0, 8))]);
                // promote requester to org admin if they were a plain user
                $cur = $pdo->prepare('SELECT site_role FROM users WHERE public_id = ?');
                $cur->execute([$req['user_id']]);
                if ($cur->fetchColumn() === 'user') {
                    $setUserSiteRole($pdo, (string) $req['user_id'], 'organization_admin');
                }
                $nid = newId('ntf');
                $pdo->prepare('INSERT INTO notifications (id, title, message, sender_label, organization_id, scope, created_at)
                               VALUES (?,?,?,?,?,"users", current_timestamp())')
                    ->execute([$nid, 'Организация подключена: ' . $req['short_name'],
                        $comment ?: 'Ваша заявка одобрена. Вы назначены администратором новой организации.', 'Администрация сайта', $orgId]);
                $pdo->prepare('INSERT IGNORE INTO notification_users (notification_id, user_id) VALUES (?,?)')->execute([$nid, $req['user_id']]);
                $pdo->prepare('UPDATE org_creation_requests SET status = "approved", reviewed_at = current_timestamp(), reviewed_by_user_id = ?, comment = ?, created_organization_id = ? WHERE id = ?')
                    ->execute([$myId, $comment ?: null, $orgId, $reqId]);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
        jsonResponse(['success' => true]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
