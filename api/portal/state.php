<?php
// /api/portal/state.php
// Assembles the full PortalDatabase (the shape in src/app/types/portal.ts) from
// the normalized tables and returns it as JSON. Replaces the old localStorage
// loadDatabase(). Requires a valid token.
//
// Read scoping: catalog data (news, incidents, organizations, documents,
// sections, specialty tags, notifications, memberships, settings, users) is
// returned in full — the UI filters it, exactly as the old client DB did.
// The genuinely-private collections (support tickets, org-creation requests,
// join requests) are scoped: a normal user sees only their own; site admins see
// all; org admins additionally see their organizations' join requests.
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['GET']);
// Public read: guests (no token) get the public catalog so the logged-out
// home/news/knowledge pages and the demo role-switcher keep working. A valid
// token unlocks the user's scoped private data (tickets, requests, ...).
$me = getCurrentUser();
$pdo = db();

$isGuest = $me === null;
$myId = $isGuest ? '' : userPublicId($me);
$myRole = $isGuest ? '' : userSiteRole($me);
$isAdmin = $myRole === 'site_admin';
$isEditor = in_array($myRole, ['editor', 'site_admin'], true);

// organizations this user administers (for join-request visibility)
$adminOrgIds = [];
if (!$isAdmin && !$isGuest) {
    $stmt = $pdo->prepare('SELECT organization_id FROM memberships WHERE user_id = ? AND role = "organization_admin" AND status = "approved"');
    $stmt->execute([$myId]);
    $adminOrgIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
}

// ─── helpers ────────────────────────────────────────────────────────────────
$iso = static function (?string $dt): ?string {
    if (!$dt) return null;
    $ts = strtotime($dt);
    return $ts ? gmdate('Y-m-d\TH:i:s.000\Z', $ts) : $dt;
};
$rows = static fn (string $sql): array => db()->query($sql)->fetchAll();
/** Group a two-column result into [key => [values...]] */
$group = static function (string $sql) use ($pdo): array {
    $out = [];
    foreach ($pdo->query($sql)->fetchAll(PDO::FETCH_NUM) as [$k, $v]) {
        $out[$k][] = $v;
    }
    return $out;
};

// ─── junction maps (one query each) ─────────────────────────────────────────
$userTags = $group('SELECT user_id, tag_id FROM user_specialty_tags');
$userFavs = $group('SELECT user_id, item_id FROM user_favorites');
$orgTags = $group('SELECT organization_id, tag_id FROM org_specialty_tags');
$memTags = $group('SELECT membership_id, tag_id FROM membership_specialty_tags');
$docRoles = $group('SELECT document_id, role FROM document_access_roles');
$docTags = $group('SELECT document_id, tag_id FROM document_access_tags');
$docSubjects = $group('SELECT document_id, subject FROM document_access_subjects');
$docUsers = $group('SELECT document_id, user_id FROM document_access_users');
$newsTags = $group('SELECT news_id, tag FROM news_tags');
$newsSpec = $group('SELECT news_id, tag_id FROM news_specialty_tags');
$notifUsers = $group('SELECT notification_id, user_id FROM notification_users');
$notifRoles = $group('SELECT notification_id, role FROM notification_roles');
$notifDismiss = $group('SELECT notification_id, user_id FROM notification_dismissals');

$newsSources = [];
foreach ($pdo->query('SELECT news_id, label, url FROM news_sources ORDER BY news_id, sort')->fetchAll() as $r) {
    $newsSources[$r['news_id']][] = ['label' => $r['label'], 'url' => $r['url']];
}
$newsGallery = [];
foreach ($pdo->query('SELECT news_id, url FROM news_gallery ORDER BY news_id, sort')->fetchAll() as $r) {
    $newsGallery[$r['news_id']][] = $r['url'];
}
$ticketAtts = [];
foreach ($pdo->query('SELECT ticket_id, name, type, data_url FROM support_attachments ORDER BY id')->fetchAll() as $r) {
    $ticketAtts[$r['ticket_id']][] = ['name' => $r['name'], 'type' => $r['type'], 'dataUrl' => $r['data_url']];
}

// ─── users (guests get only the demo accounts, for the role-switcher) ────────
$users = [];
$usersSql = 'SELECT u.id, u.public_id, u.name, u.email, u.site_role, r.name AS role_name, u.subject, u.specialization, u.is_young_specialist, u.is_first_employment, u.is_banned, u.created_at, u.avatar FROM users u LEFT JOIN roles r ON r.id = u.role_id';
$usersSql .= $isGuest ? " WHERE u.public_id LIKE 'u-%'" : '';
$usersSql .= ' ORDER BY u.created_at';
foreach ($pdo->query($usersSql)->fetchAll() as $u) {
    $pid = ($u['public_id'] !== null && $u['public_id'] !== '') ? (string) $u['public_id'] : (string) $u['id'];
    $users[] = [
        'id' => $pid,
        'fullName' => $u['name'],
        'email' => $u['email'] ?? '',
        'role' => $u['site_role'] ?: userSiteRole($u),
        'subject' => $u['subject'] ?? $u['specialization'] ?? null,
        'specialtyTagIds' => array_map('strval', $userTags[$pid] ?? []),
        'favoriteItemIds' => array_map('strval', $userFavs[$pid] ?? []),
        'isYoungSpecialist' => (bool) $u['is_young_specialist'],
        'isFirstEmployment' => (bool) $u['is_first_employment'],
        'isBanned' => (bool) $u['is_banned'],
        'createdAt' => $iso($u['created_at']),
        'avatarUrl' => $u['avatar'] ? (preg_match('#^https?://#', $u['avatar']) ? $u['avatar'] : APP_URL . '/' . $u['avatar']) : null,
    ];
}

// ─── specialty tags ─────────────────────────────────────────────────────────
$specialtyTags = [];
foreach ($rows('SELECT * FROM specialty_tags ORDER BY created_at') as $t) {
    $specialtyTags[] = [
        'id' => $t['id'],
        'organizationId' => $t['organization_id'],
        'name' => $t['name'],
        'description' => $t['description'],
        'color' => $t['color'],
        'features' => jsonColumn($t['features'], new stdClass()),
        'createdAt' => $iso($t['created_at']),
    ];
}

// ─── organizations ──────────────────────────────────────────────────────────
$organizations = [];
foreach ($rows('SELECT * FROM organizations ORDER BY created_at') as $o) {
    $organizations[] = [
        'id' => $o['id'],
        'shortName' => $o['short_name'],
        'fullName' => $o['full_name'],
        'description' => $o['description'],
        'specialtyTagIds' => array_map('strval', $orgTags[$o['id']] ?? []),
        'isActive' => (bool) $o['is_active'],
        'createdAt' => $iso($o['created_at']),
    ];
}

// ─── memberships ────────────────────────────────────────────────────────────
$memberships = [];
foreach ($rows('SELECT * FROM memberships') as $m) {
    $memberships[] = [
        'id' => $m['id'],
        'organizationId' => $m['organization_id'],
        'userId' => $m['user_id'],
        'role' => $m['role'],
        'specialtyTagIds' => array_map('strval', $memTags[$m['id']] ?? []),
        'status' => $m['status'],
        'joinedAt' => $iso($m['joined_at']),
    ];
}

// ─── invite codes ───────────────────────────────────────────────────────────
$inviteCodes = [];
foreach ($rows('SELECT * FROM invite_codes') as $c) {
    $inviteCodes[] = [
        'id' => $c['id'],
        'organizationId' => $c['organization_id'],
        'code' => $c['code'],
        'createdAt' => $iso($c['created_at']),
        'expiresAt' => $iso($c['expires_at']),
        'isActive' => (bool) $c['is_active'],
    ];
}

// ─── join requests (scoped) ─────────────────────────────────────────────────
$joinRequests = [];
$jrSql = 'SELECT * FROM join_requests';
if (!$isAdmin) {
    $params = [$myId];
    $orgClause = '';
    if ($adminOrgIds) {
        $orgClause = ' OR organization_id IN (' . implode(',', array_fill(0, count($adminOrgIds), '?')) . ')';
        $params = array_merge($params, $adminOrgIds);
    }
    $stmt = $pdo->prepare("SELECT * FROM join_requests WHERE user_id = ?$orgClause");
    $stmt->execute($params);
    $jrRows = $stmt->fetchAll();
} else {
    $jrRows = $rows($jrSql);
}
foreach ($jrRows as $r) {
    $joinRequests[] = [
        'id' => $r['id'],
        'organizationId' => $r['organization_id'],
        'userId' => $r['user_id'],
        'inviteCode' => $r['invite_code'],
        'status' => $r['status'],
        'createdAt' => $iso($r['created_at']),
        'reviewedAt' => $iso($r['reviewed_at']),
        'reviewedByUserId' => $r['reviewed_by_user_id'],
        'comment' => $r['comment'],
    ];
}

// ─── document sections ──────────────────────────────────────────────────────
$sections = [];
foreach ($rows('SELECT * FROM sections') as $s) {
    $sections[] = [
        'id' => $s['id'],
        'organizationId' => $s['organization_id'],
        'name' => $s['name'],
        'description' => $s['description'],
        'kind' => $s['kind'],
    ];
}

// ─── documents (+ access) ───────────────────────────────────────────────────
$documents = [];
foreach ($rows('SELECT * FROM documents') as $d) {
    $doc = [
        'id' => $d['id'],
        'organizationId' => $d['organization_id'],
        'sectionId' => $d['section_id'],
        'title' => $d['title'],
        'type' => $d['type'],
        'subject' => $d['subject'],
        'description' => $d['description'],
        'size' => $d['size'],
        'updatedAt' => $iso($d['updated_at']),
        'access' => [
            'mode' => $d['access_mode'],
            'roles' => array_map('strval', $docRoles[$d['id']] ?? []),
            'specialtyTagIds' => array_map('strval', $docTags[$d['id']] ?? []),
            'subjects' => array_map('strval', $docSubjects[$d['id']] ?? []),
            'userIds' => array_map('strval', $docUsers[$d['id']] ?? []),
        ],
    ];
    if ($d['file_url']) $doc['fileUrl'] = $d['file_url'];
    if ($d['file_name']) $doc['fileName'] = $d['file_name'];
    $documents[] = $doc;
}

// ─── news ───────────────────────────────────────────────────────────────────
$news = [];
foreach ($rows('SELECT * FROM news ORDER BY published_at DESC') as $n) {
    $article = [
        'id' => $n['id'],
        'title' => $n['title'],
        'summary' => $n['summary'],
        'body' => jsonColumn($n['body'], []),
        'category' => $n['category'],
        'specialization' => $n['specialization'],
        'audience' => $n['audience'],
        'author' => $n['author'],
        'publishedAt' => $n['published_at'],
        'tags' => array_map('strval', $newsTags[$n['id']] ?? []),
        'sources' => $newsSources[$n['id']] ?? [],
        'isPublic' => (bool) $n['is_public'],
        'organizationId' => $n['organization_id'],
        'specialtyTagIds' => array_map('strval', $newsSpec[$n['id']] ?? []),
        'galleryImageUrls' => $newsGallery[$n['id']] ?? [],
    ];
    if ($n['cover_image_url']) $article['coverImageUrl'] = $n['cover_image_url'];
    if ($n['video_url']) $article['videoUrl'] = $n['video_url'];
    if ($n['guest_preview']) $article['guestPreview'] = $n['guest_preview'];
    if ($n['registered_only']) $article['registeredOnly'] = $n['registered_only'];
    $news[] = $article;
}

// ─── news submissions ───────────────────────────────────────────────────────
$newsSubmissions = [];
foreach ($rows('SELECT * FROM news_submissions ORDER BY submitted_at DESC') as $s) {
    $newsSubmissions[] = [
        'id' => $s['id'],
        'article' => jsonColumn($s['article'], new stdClass()),
        'submittedByUserId' => $s['submitted_by_user_id'],
        'submittedAt' => $iso($s['submitted_at']),
        'status' => $s['status'],
        'reviewedAt' => $iso($s['reviewed_at']),
        'reviewedByUserId' => $s['reviewed_by_user_id'],
        'reviewerComment' => $s['reviewer_comment'],
    ];
}

// ─── notifications ──────────────────────────────────────────────────────────
$notifications = [];
foreach ($rows('SELECT * FROM notifications ORDER BY created_at DESC') as $n) {
    $notifications[] = [
        'id' => $n['id'],
        'title' => $n['title'],
        'message' => $n['message'],
        'createdAt' => $iso($n['created_at']),
        'senderLabel' => $n['sender_label'],
        'organizationId' => $n['organization_id'],
        'scope' => $n['scope'],
        'userIds' => array_map('strval', $notifUsers[$n['id']] ?? []),
        'targetRoles' => array_map('strval', $notifRoles[$n['id']] ?? []),
        'dismissedByUserIds' => array_map('strval', $notifDismiss[$n['id']] ?? []),
    ];
}

// ─── support tickets (scoped) ───────────────────────────────────────────────
$supportTickets = [];
if ($isEditor) {
    $stRows = $rows('SELECT * FROM support_tickets ORDER BY created_at DESC');
} else {
    $stmt = $pdo->prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$myId]);
    $stRows = $stmt->fetchAll();
}
foreach ($stRows as $t) {
    $supportTickets[] = [
        'id' => $t['id'],
        'userId' => $t['user_id'],
        'organizationId' => $t['organization_id'],
        'subject' => $t['subject'],
        'message' => $t['message'],
        'attachments' => $ticketAtts[$t['id']] ?? [],
        'status' => $t['status'],
        'createdAt' => $iso($t['created_at']),
        'reviewedAt' => $iso($t['reviewed_at']),
        'reviewedByUserId' => $t['reviewed_by_user_id'],
        'adminResponse' => $t['admin_response'],
    ];
}

// ─── org creation requests (scoped) ─────────────────────────────────────────
$orgCreationRequests = [];
if ($isAdmin) {
    $ocrRows = $rows('SELECT * FROM org_creation_requests ORDER BY created_at DESC');
} else {
    $stmt = $pdo->prepare('SELECT * FROM org_creation_requests WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$myId]);
    $ocrRows = $stmt->fetchAll();
}
foreach ($ocrRows as $r) {
    $orgCreationRequests[] = [
        'id' => $r['id'],
        'userId' => $r['user_id'],
        'shortName' => $r['short_name'],
        'fullName' => $r['full_name'],
        'description' => $r['description'],
        'status' => $r['status'],
        'createdAt' => $iso($r['created_at']),
        'reviewedAt' => $iso($r['reviewed_at']),
        'reviewedByUserId' => $r['reviewed_by_user_id'],
        'comment' => $r['comment'],
        'createdOrganizationId' => $r['created_organization_id'],
    ];
}

// ─── incidents ──────────────────────────────────────────────────────────────
$incidents = [];
foreach ($rows('SELECT * FROM incidents ORDER BY created_at DESC') as $i) {
    $inc = [
        'id' => $i['id'],
        'title' => $i['title'],
        'category' => $i['category'],
        'level' => $i['level'],
        'audience' => $i['audience'],
        'summary' => $i['summary'],
        'firstSteps' => $i['first_steps'],
        'documents' => $i['documents'],
        'owner' => $i['owner'],
        'createdAt' => $iso($i['created_at']),
    ];
    if ($i['attachment_name']) $inc['attachmentName'] = $i['attachment_name'];
    if ($i['attachment_url']) $inc['attachmentUrl'] = $i['attachment_url'];
    $incidents[] = $inc;
}

// ─── site settings ──────────────────────────────────────────────────────────
$s = $pdo->query('SELECT * FROM site_settings WHERE id = 1')->fetch() ?: [];
$siteSettings = [
    'portalName' => $s['portal_name'] ?? 'ПрофБаза',
    'importantNoteTitle' => $s['important_note_title'] ?? '',
    'firstLoginHelpTitle' => $s['first_login_help_title'] ?? '',
    'supportEmail' => $s['support_email'] ?? '',
];

jsonResponse([
    'users' => $users,
    'specialtyTags' => $specialtyTags,
    'organizations' => $organizations,
    'memberships' => $memberships,
    'inviteCodes' => $inviteCodes,
    'joinRequests' => $joinRequests,
    'sections' => $sections,
    'documents' => $documents,
    'notifications' => $notifications,
    'supportTickets' => $supportTickets,
    'orgCreationRequests' => $orgCreationRequests,
    'news' => $news,
    'newsSubmissions' => $newsSubmissions,
    'incidents' => $incidents,
    'siteSettings' => $siteSettings,
    'currentUserId' => $myId,
]);
