<?php
// /api/migrations/import_seed.php
// Loads the demo dataset (seed_data.json, exported from the TS seeds) into the
// normalized MySQL schema. Idempotent: truncates portal domain tables and the
// demo (u-*) users, then reinserts. Real registered users are never touched.
//
// CLI:   php api/migrations/import_seed.php
// HTTP:  /api/migrations/import_seed.php?key=profbaza-seed  (guarded; dev only)
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

$isCli = PHP_SAPI === 'cli';
if (!$isCli && (($_GET['key'] ?? '') !== 'profbaza-seed')) {
    jsonResponse(['error' => 'Forbidden'], 403);
}

$jsonPath = __DIR__ . '/seed_data.json';
if (!is_file($jsonPath)) {
    $msg = 'seed_data.json not found — run: node api/migrations/export_seed.mjs';
    $isCli ? fwrite(STDERR, $msg . "\n") : jsonResponse(['error' => $msg], 500);
    exit(1);
}

$data = json_decode((string) file_get_contents($jsonPath), true);
if (!is_array($data) || !isset($data['users'])) {
    $msg = 'seed_data.json malformed';
    $isCli ? fwrite(STDERR, $msg . "\n") : jsonResponse(['error' => $msg], 500);
    exit(1);
}

$pdo = db();

// ─── helpers ────────────────────────────────────────────────────────────────
$toDt = static function (?string $iso): ?string {
    if (!$iso) return null;
    $ts = strtotime($iso);
    return $ts ? date('Y-m-d H:i:s', $ts) : null;
};
$nowDt = date('Y-m-d H:i:s');
$j = static fn ($v): string => json_encode($v, JSON_UNESCAPED_UNICODE);

$counts = [];

try {
    $pdo->beginTransaction();
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

    // Wipe portal domain tables (children first is irrelevant with FK checks off).
    $domainTables = [
        'notification_dismissals', 'notification_roles', 'notification_users', 'notifications',
        'support_attachments', 'support_tickets',
        'news_submissions', 'news_gallery', 'news_sources', 'news_tags', 'news_specialty_tags', 'news',
        'document_access_users', 'document_access_subjects', 'document_access_tags', 'document_access_roles',
        'documents', 'sections',
        'join_requests', 'invite_codes', 'org_creation_requests',
        'membership_specialty_tags', 'memberships', 'org_specialty_tags', 'organizations',
        'user_favorites', 'user_specialty_tags', 'specialty_tags',
        'incidents', 'knowledge_articles', 'cabinet_entries',
    ];
    // DELETE (not TRUNCATE) so the wipe stays inside the transaction — TRUNCATE
    // forces an implicit commit in MariaDB and would break atomicity.
    foreach ($domainTables as $t) {
        $pdo->exec("DELETE FROM `$t`");
    }
    // Remove previous demo users (real users have a numeric public_id).
    $pdo->exec("DELETE FROM users WHERE public_id LIKE 'u-%'");

    // ── users ────────────────────────────────────────────────────────────────
    $roleIds = $pdo->query('SELECT name, id FROM roles')->fetchAll(PDO::FETCH_KEY_PAIR);
    $roleNameFor = [
        'site_admin' => 'Суперадминистратор',
        'organization_admin' => 'Администратор организации',
        'editor' => 'Редактор',
        'user' => 'Пользователь',
    ];
    $demoHash = password_hash('password', PASSWORD_DEFAULT);
    $insUser = $pdo->prepare(
        'INSERT INTO users
           (public_id, email, password_hash, name, avatar, email_verified, site_role, role_id,
            subject, specialization, is_young_specialist, is_first_employment, is_banned, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $insUserTag = $pdo->prepare('INSERT IGNORE INTO user_specialty_tags (user_id, tag_id) VALUES (?,?)');
    $insFav = $pdo->prepare('INSERT IGNORE INTO user_favorites (user_id, item_id) VALUES (?,?)');
    foreach ($data['users'] as $u) {
        $pid = (string) $u['id'];
        $roleName = $roleNameFor[$u['role'] ?? 'user'] ?? 'Пользователь';
        $insUser->execute([
            $pid,
            $u['email'] ?? null,
            $demoHash,
            $u['fullName'] ?? '',
            null,
            1,
            $u['role'] ?? 'user',
            $roleIds[$roleName] ?? null,
            $u['subject'] ?? null,
            $u['subject'] ?? null,
            !empty($u['isYoungSpecialist']) ? 1 : 0,
            !empty($u['isFirstEmployment']) ? 1 : 0,
            !empty($u['isBanned']) ? 1 : 0,
            $toDt($u['createdAt'] ?? null) ?? $nowDt,
        ]);
        foreach (($u['specialtyTagIds'] ?? []) as $tagId) {
            $insUserTag->execute([$pid, (string) $tagId]);
        }
        foreach (($u['favoriteItemIds'] ?? []) as $itemId) {
            $insFav->execute([$pid, (string) $itemId]);
        }
    }
    $counts['users'] = count($data['users']);

    // ── specialty tags ────────────────────────────────────────────────────────
    $insTag = $pdo->prepare(
        'INSERT INTO specialty_tags (id, organization_id, name, description, color, features, created_at)
         VALUES (?,?,?,?,?,?,?)'
    );
    foreach (($data['specialtyTags'] ?? []) as $t) {
        $insTag->execute([
            $t['id'], $t['organizationId'] ?? null, $t['name'] ?? '', $t['description'] ?? '',
            $t['color'] ?? '', $j($t['features'] ?? new stdClass()), $toDt($t['createdAt'] ?? null) ?? $nowDt,
        ]);
    }
    $counts['specialtyTags'] = count($data['specialtyTags'] ?? []);

    // ── organizations ─────────────────────────────────────────────────────────
    $insOrg = $pdo->prepare(
        'INSERT INTO organizations (id, short_name, full_name, description, is_active, created_at)
         VALUES (?,?,?,?,?,?)'
    );
    $insOrgTag = $pdo->prepare('INSERT IGNORE INTO org_specialty_tags (organization_id, tag_id) VALUES (?,?)');
    foreach (($data['organizations'] ?? []) as $o) {
        $insOrg->execute([
            $o['id'], $o['shortName'] ?? '', $o['fullName'] ?? '', $o['description'] ?? '',
            !empty($o['isActive']) ? 1 : 0, $toDt($o['createdAt'] ?? null) ?? $nowDt,
        ]);
        foreach (($o['specialtyTagIds'] ?? []) as $tagId) {
            $insOrgTag->execute([$o['id'], (string) $tagId]);
        }
    }
    $counts['organizations'] = count($data['organizations'] ?? []);

    // ── memberships ───────────────────────────────────────────────────────────
    $insMem = $pdo->prepare(
        'INSERT INTO memberships (id, organization_id, user_id, role, status, joined_at)
         VALUES (?,?,?,?,?,?)'
    );
    $insMemTag = $pdo->prepare('INSERT IGNORE INTO membership_specialty_tags (membership_id, tag_id) VALUES (?,?)');
    foreach (($data['memberships'] ?? []) as $m) {
        $insMem->execute([
            $m['id'], $m['organizationId'], $m['userId'], $m['role'] ?? 'member',
            $m['status'] ?? 'approved', $toDt($m['joinedAt'] ?? null) ?? $nowDt,
        ]);
        foreach (($m['specialtyTagIds'] ?? []) as $tagId) {
            $insMemTag->execute([$m['id'], (string) $tagId]);
        }
    }
    $counts['memberships'] = count($data['memberships'] ?? []);

    // ── invite codes ──────────────────────────────────────────────────────────
    $insInvite = $pdo->prepare(
        'INSERT INTO invite_codes (id, organization_id, code, created_at, expires_at, is_active)
         VALUES (?,?,?,?,?,?)'
    );
    foreach (($data['inviteCodes'] ?? []) as $c) {
        $insInvite->execute([
            $c['id'], $c['organizationId'], $c['code'], $toDt($c['createdAt'] ?? null) ?? $nowDt,
            $toDt($c['expiresAt'] ?? null), !empty($c['isActive']) ? 1 : 0,
        ]);
    }
    $counts['inviteCodes'] = count($data['inviteCodes'] ?? []);

    // ── join requests ─────────────────────────────────────────────────────────
    $insJr = $pdo->prepare(
        'INSERT INTO join_requests
           (id, organization_id, user_id, invite_code, status, created_at, reviewed_at, reviewed_by_user_id, comment)
         VALUES (?,?,?,?,?,?,?,?,?)'
    );
    foreach (($data['joinRequests'] ?? []) as $r) {
        $insJr->execute([
            $r['id'], $r['organizationId'], $r['userId'], $r['inviteCode'] ?? '', $r['status'] ?? 'pending',
            $toDt($r['createdAt'] ?? null) ?? $nowDt, $toDt($r['reviewedAt'] ?? null),
            $r['reviewedByUserId'] ?? null, $r['comment'] ?? null,
        ]);
    }
    $counts['joinRequests'] = count($data['joinRequests'] ?? []);

    // ── org creation requests ─────────────────────────────────────────────────
    $insOcr = $pdo->prepare(
        'INSERT INTO org_creation_requests
           (id, user_id, short_name, full_name, description, status, created_at, reviewed_at,
            reviewed_by_user_id, comment, created_organization_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    );
    foreach (($data['orgCreationRequests'] ?? []) as $r) {
        $insOcr->execute([
            $r['id'], $r['userId'], $r['shortName'] ?? '', $r['fullName'] ?? '', $r['description'] ?? '',
            $r['status'] ?? 'pending', $toDt($r['createdAt'] ?? null) ?? $nowDt, $toDt($r['reviewedAt'] ?? null),
            $r['reviewedByUserId'] ?? null, $r['comment'] ?? null, $r['createdOrganizationId'] ?? null,
        ]);
    }
    $counts['orgCreationRequests'] = count($data['orgCreationRequests'] ?? []);

    // ── sections ──────────────────────────────────────────────────────────────
    $insSec = $pdo->prepare(
        'INSERT INTO sections (id, organization_id, name, description, kind) VALUES (?,?,?,?,?)'
    );
    foreach (($data['sections'] ?? []) as $s) {
        $insSec->execute([$s['id'], $s['organizationId'], $s['name'] ?? '', $s['description'] ?? '', $s['kind'] ?? 'common']);
    }
    $counts['sections'] = count($data['sections'] ?? []);

    // ── documents (+ access) ──────────────────────────────────────────────────
    $insDoc = $pdo->prepare(
        'INSERT INTO documents
           (id, organization_id, section_id, title, type, subject, description, size, file_url, file_name, access_mode, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $insDar = $pdo->prepare('INSERT IGNORE INTO document_access_roles (document_id, role) VALUES (?,?)');
    $insDat = $pdo->prepare('INSERT IGNORE INTO document_access_tags (document_id, tag_id) VALUES (?,?)');
    $insDas = $pdo->prepare('INSERT IGNORE INTO document_access_subjects (document_id, subject) VALUES (?,?)');
    $insDau = $pdo->prepare('INSERT IGNORE INTO document_access_users (document_id, user_id) VALUES (?,?)');
    foreach (($data['documents'] ?? []) as $d) {
        $access = $d['access'] ?? ['mode' => 'all', 'roles' => [], 'subjects' => [], 'userIds' => []];
        $insDoc->execute([
            $d['id'], $d['organizationId'], $d['sectionId'], $d['title'] ?? '', $d['type'] ?? 'PDF',
            $d['subject'] ?? null, $d['description'] ?? '', $d['size'] ?? '', $d['fileUrl'] ?? null,
            $d['fileName'] ?? null, $access['mode'] ?? 'all', $toDt($d['updatedAt'] ?? null) ?? $nowDt,
        ]);
        foreach (($access['roles'] ?? []) as $role) $insDar->execute([$d['id'], (string) $role]);
        foreach (($access['specialtyTagIds'] ?? []) as $tag) $insDat->execute([$d['id'], (string) $tag]);
        foreach (($access['subjects'] ?? []) as $subj) $insDas->execute([$d['id'], (string) $subj]);
        foreach (($access['userIds'] ?? []) as $uid) $insDau->execute([$d['id'], (string) $uid]);
    }
    $counts['documents'] = count($data['documents'] ?? []);

    // ── news (+ tags/sources/gallery/specialty) ───────────────────────────────
    $insNews = $pdo->prepare(
        'INSERT INTO news
           (id, title, summary, body, category, specialization, audience, author, published_at, is_public,
            organization_id, cover_image_url, video_url, guest_preview, registered_only, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $insNtag = $pdo->prepare('INSERT IGNORE INTO news_tags (news_id, tag) VALUES (?,?)');
    $insNsrc = $pdo->prepare('INSERT INTO news_sources (news_id, label, url, sort) VALUES (?,?,?,?)');
    $insNgal = $pdo->prepare('INSERT INTO news_gallery (news_id, url, sort) VALUES (?,?,?)');
    $insNst = $pdo->prepare('INSERT IGNORE INTO news_specialty_tags (news_id, tag_id) VALUES (?,?)');
    foreach (($data['news'] ?? []) as $n) {
        $insNews->execute([
            $n['id'], $n['title'] ?? '', $n['summary'] ?? '', $j($n['body'] ?? []), $n['category'] ?? '',
            $n['specialization'] ?? null, $n['audience'] ?? 'Все', $n['author'] ?? '', $n['publishedAt'] ?? '',
            !empty($n['isPublic']) ? 1 : 0, $n['organizationId'] ?? null, $n['coverImageUrl'] ?? null,
            $n['videoUrl'] ?? null, $n['guestPreview'] ?? null, $n['registeredOnly'] ?? null, $nowDt,
        ]);
        foreach (($n['tags'] ?? []) as $tag) $insNtag->execute([$n['id'], (string) $tag]);
        foreach (($n['sources'] ?? []) as $i => $src) $insNsrc->execute([$n['id'], $src['label'] ?? '', $src['url'] ?? '', $i]);
        foreach (($n['galleryImageUrls'] ?? []) as $i => $url) $insNgal->execute([$n['id'], (string) $url, $i]);
        foreach (($n['specialtyTagIds'] ?? []) as $tag) $insNst->execute([$n['id'], (string) $tag]);
    }
    $counts['news'] = count($data['news'] ?? []);

    // ── news submissions ──────────────────────────────────────────────────────
    $insSub = $pdo->prepare(
        'INSERT INTO news_submissions
           (id, title, article, submitted_by_user_id, submitted_at, status, reviewed_at, reviewed_by_user_id, reviewer_comment)
         VALUES (?,?,?,?,?,?,?,?,?)'
    );
    foreach (($data['newsSubmissions'] ?? []) as $s) {
        $article = $s['article'] ?? [];
        $insSub->execute([
            $s['id'], $article['title'] ?? '', $j($article), $s['submittedByUserId'],
            $toDt($s['submittedAt'] ?? null) ?? $nowDt, $s['status'] ?? 'pending',
            $toDt($s['reviewedAt'] ?? null), $s['reviewedByUserId'] ?? null, $s['reviewerComment'] ?? null,
        ]);
    }
    $counts['newsSubmissions'] = count($data['newsSubmissions'] ?? []);

    // ── notifications (+ targets/dismissals) ──────────────────────────────────
    $insNotif = $pdo->prepare(
        'INSERT INTO notifications (id, title, message, sender_label, organization_id, scope, created_at)
         VALUES (?,?,?,?,?,?,?)'
    );
    $insNu = $pdo->prepare('INSERT IGNORE INTO notification_users (notification_id, user_id) VALUES (?,?)');
    $insNr = $pdo->prepare('INSERT IGNORE INTO notification_roles (notification_id, role) VALUES (?,?)');
    $insNd = $pdo->prepare('INSERT IGNORE INTO notification_dismissals (notification_id, user_id) VALUES (?,?)');
    foreach (($data['notifications'] ?? []) as $n) {
        $insNotif->execute([
            $n['id'], $n['title'] ?? '', $n['message'] ?? '', $n['senderLabel'] ?? '',
            $n['organizationId'] ?? null, $n['scope'] ?? 'all', $toDt($n['createdAt'] ?? null) ?? $nowDt,
        ]);
        foreach (($n['userIds'] ?? []) as $uid) $insNu->execute([$n['id'], (string) $uid]);
        foreach (($n['targetRoles'] ?? []) as $role) $insNr->execute([$n['id'], (string) $role]);
        foreach (($n['dismissedByUserIds'] ?? []) as $uid) $insNd->execute([$n['id'], (string) $uid]);
    }
    $counts['notifications'] = count($data['notifications'] ?? []);

    // ── support tickets (+ attachments) ───────────────────────────────────────
    $insTicket = $pdo->prepare(
        'INSERT INTO support_tickets
           (id, user_id, organization_id, subject, message, status, created_at, reviewed_at, reviewed_by_user_id, admin_response)
         VALUES (?,?,?,?,?,?,?,?,?,?)'
    );
    $insAtt = $pdo->prepare('INSERT INTO support_attachments (ticket_id, name, type, data_url) VALUES (?,?,?,?)');
    foreach (($data['supportTickets'] ?? []) as $t) {
        $insTicket->execute([
            $t['id'], $t['userId'], $t['organizationId'] ?? null, $t['subject'] ?? '', $t['message'] ?? '',
            $t['status'] ?? 'open', $toDt($t['createdAt'] ?? null) ?? $nowDt, $toDt($t['reviewedAt'] ?? null),
            $t['reviewedByUserId'] ?? null, $t['adminResponse'] ?? null,
        ]);
        foreach (($t['attachments'] ?? []) as $a) {
            $insAtt->execute([$t['id'], $a['name'] ?? '', $a['type'] ?? '', $a['dataUrl'] ?? '']);
        }
    }
    $counts['supportTickets'] = count($data['supportTickets'] ?? []);

    // ── incidents ─────────────────────────────────────────────────────────────
    $insInc = $pdo->prepare(
        'INSERT INTO incidents
           (id, title, category, level, audience, summary, first_steps, documents, owner,
            attachment_name, attachment_url, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    foreach (($data['incidents'] ?? []) as $i) {
        $insInc->execute([
            $i['id'], $i['title'] ?? '', $i['category'] ?? '', $i['level'] ?? 'Средний', $i['audience'] ?? '',
            $i['summary'] ?? '', $i['firstSteps'] ?? '', $i['documents'] ?? '', $i['owner'] ?? 'Редакция',
            $i['attachmentName'] ?? null, $i['attachmentUrl'] ?? null, $toDt($i['createdAt'] ?? null) ?? $nowDt,
        ]);
    }
    $counts['incidents'] = count($data['incidents'] ?? []);

    // ── site settings ─────────────────────────────────────────────────────────
    if (!empty($data['siteSettings'])) {
        $s = $data['siteSettings'];
        $pdo->prepare(
            'UPDATE site_settings SET portal_name=?, important_note_title=?, first_login_help_title=?, support_email=? WHERE id=1'
        )->execute([
            $s['portalName'] ?? 'ПрофБаза', $s['importantNoteTitle'] ?? '',
            $s['firstLoginHelpTitle'] ?? '', $s['supportEmail'] ?? '',
        ]);
    }

    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $msg = 'Import failed: ' . $e->getMessage();
    $isCli ? fwrite(STDERR, $msg . "\n") : jsonResponse(['error' => $msg], 500);
    exit(1);
}

if ($isCli) {
    echo "Seed import OK\n";
    foreach ($counts as $k => $v) {
        echo str_pad($k, 22) . $v . "\n";
    }
} else {
    jsonResponse(['success' => true, 'counts' => $counts]);
}
