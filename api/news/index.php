<?php
// /api/news/index.php — news articles + user-proposed submissions (moderation).
// Actions (POST { action, ... }):
//   createNewsArticle, updateNewsArticle, deleteNewsArticle   (editor / site_admin)
//   createNewsSubmission                                      (any user — propose)
//   updateNewsSubmission                                      (owner, while pending)
//   reviewNewsSubmission                                      (editor / site_admin)
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';
$myId = userPublicId($me);

/** Insert a full news article (row + normalized tags/sources/gallery/specialty). */
$insertNews = static function (PDO $pdo, array $a, string $id, ?string $authorUserId): void {
    $pdo->prepare(
        'INSERT INTO news
           (id, title, summary, body, category, specialization, audience, author, author_user_id,
            published_at, is_public, organization_id, cover_image_url, video_url, guest_preview, registered_only, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, current_timestamp())'
    )->execute([
        $id, $a['title'] ?? '', $a['summary'] ?? '', json_encode($a['body'] ?? [], JSON_UNESCAPED_UNICODE),
        $a['category'] ?? '', $a['specialization'] ?? null, $a['audience'] ?? 'Все', $a['author'] ?? '', $authorUserId,
        $a['publishedAt'] ?? date('Y-m-d'), !empty($a['isPublic']) ? 1 : 0, $a['organizationId'] ?? null,
        $a['coverImageUrl'] ?? null, $a['videoUrl'] ?? null, $a['guestPreview'] ?? null, $a['registeredOnly'] ?? null,
    ]);
    foreach (($a['tags'] ?? []) as $tag) {
        $pdo->prepare('INSERT IGNORE INTO news_tags (news_id, tag) VALUES (?,?)')->execute([$id, (string) $tag]);
    }
    foreach (($a['sources'] ?? []) as $i => $src) {
        $pdo->prepare('INSERT INTO news_sources (news_id, label, url, sort) VALUES (?,?,?,?)')
            ->execute([$id, $src['label'] ?? '', $src['url'] ?? '', $i]);
    }
    foreach (($a['galleryImageUrls'] ?? []) as $i => $url) {
        $pdo->prepare('INSERT INTO news_gallery (news_id, url, sort) VALUES (?,?,?)')->execute([$id, (string) $url, $i]);
    }
    foreach (($a['specialtyTagIds'] ?? []) as $tag) {
        $pdo->prepare('INSERT IGNORE INTO news_specialty_tags (news_id, tag_id) VALUES (?,?)')->execute([$id, (string) $tag]);
    }
};

switch ($action) {
    case 'createNewsArticle': {
        requireRole(['editor', 'site_admin']);
        $a = is_array($body['article'] ?? null) ? $body['article'] : $body;
        validateRequiredFields($a, ['title']);
        $id = (string) ($a['id'] ?? $body['id'] ?? newId('news'));
        $insertNews($pdo, $a, $id, $myId);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'updateNewsArticle': {
        requireRole(['editor', 'site_admin']);
        validateRequiredFields($body, ['articleId']);
        $id = (string) $body['articleId'];
        $patch = is_array($body['patch'] ?? null) ? $body['patch'] : $body;
        $map = [
            'title' => 'title', 'summary' => 'summary', 'category' => 'category', 'specialization' => 'specialization',
            'audience' => 'audience', 'author' => 'author', 'publishedAt' => 'published_at',
            'organizationId' => 'organization_id', 'coverImageUrl' => 'cover_image_url', 'videoUrl' => 'video_url',
            'guestPreview' => 'guest_preview', 'registeredOnly' => 'registered_only',
        ];
        $sets = ['editor_user_id = ?'];
        $args = [$myId];
        foreach ($map as $in => $col) {
            if (array_key_exists($in, $patch)) { $sets[] = "`$col` = ?"; $args[] = $patch[$in]; }
        }
        if (array_key_exists('body', $patch)) { $sets[] = '`body` = ?'; $args[] = json_encode($patch['body'], JSON_UNESCAPED_UNICODE); }
        if (array_key_exists('isPublic', $patch)) { $sets[] = 'is_public = ?'; $args[] = !empty($patch['isPublic']) ? 1 : 0; }
        $args[] = $id;
        $pdo->prepare('UPDATE news SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($args);
        // replace normalized lists when provided
        if (array_key_exists('tags', $patch)) {
            $pdo->prepare('DELETE FROM news_tags WHERE news_id = ?')->execute([$id]);
            foreach (($patch['tags'] ?? []) as $tag) $pdo->prepare('INSERT IGNORE INTO news_tags (news_id, tag) VALUES (?,?)')->execute([$id, (string) $tag]);
        }
        if (array_key_exists('sources', $patch)) {
            $pdo->prepare('DELETE FROM news_sources WHERE news_id = ?')->execute([$id]);
            foreach (($patch['sources'] ?? []) as $i => $src) $pdo->prepare('INSERT INTO news_sources (news_id, label, url, sort) VALUES (?,?,?,?)')->execute([$id, $src['label'] ?? '', $src['url'] ?? '', $i]);
        }
        if (array_key_exists('galleryImageUrls', $patch)) {
            $pdo->prepare('DELETE FROM news_gallery WHERE news_id = ?')->execute([$id]);
            foreach (($patch['galleryImageUrls'] ?? []) as $i => $url) $pdo->prepare('INSERT INTO news_gallery (news_id, url, sort) VALUES (?,?,?)')->execute([$id, (string) $url, $i]);
        }
        if (array_key_exists('specialtyTagIds', $patch)) {
            $pdo->prepare('DELETE FROM news_specialty_tags WHERE news_id = ?')->execute([$id]);
            foreach (($patch['specialtyTagIds'] ?? []) as $tag) $pdo->prepare('INSERT IGNORE INTO news_specialty_tags (news_id, tag_id) VALUES (?,?)')->execute([$id, (string) $tag]);
        }
        jsonResponse(['success' => true]);
    }

    case 'deleteNewsArticle': {
        requireRole(['editor', 'site_admin']);
        validateRequiredFields($body, ['articleId']);
        $pdo->prepare('DELETE FROM news WHERE id = ?')->execute([(string) $body['articleId']]); // cascades junctions
        jsonResponse(['success' => true]);
    }

    case 'createNewsSubmission': {
        $a = is_array($body['article'] ?? null) ? $body['article'] : [];
        validateRequiredFields($a, ['title']);
        $id = (string) ($body['id'] ?? newId('sub'));
        $pdo->prepare(
            'INSERT INTO news_submissions (id, title, article, submitted_by_user_id, submitted_at, status)
             VALUES (?,?,?,?, current_timestamp(), "pending")'
        )->execute([$id, $a['title'] ?? '', json_encode($a, JSON_UNESCAPED_UNICODE), $myId]);
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'updateNewsSubmission': {
        validateRequiredFields($body, ['submissionId']);
        $sid = (string) $body['submissionId'];
        $stmt = $pdo->prepare('SELECT submitted_by_user_id, status FROM news_submissions WHERE id = ?');
        $stmt->execute([$sid]);
        $sub = $stmt->fetch();
        if (!$sub) jsonResponse(['error' => 'Предложение не найдено'], 404);
        if ($sub['submitted_by_user_id'] !== $myId && !canModerateContent($me)) {
            jsonResponse(['error' => 'Можно редактировать только своё предложение'], 403);
        }
        $a = is_array($body['article'] ?? null) ? $body['article'] : [];
        $pdo->prepare('UPDATE news_submissions SET title = ?, article = ? WHERE id = ?')
            ->execute([$a['title'] ?? '', json_encode($a, JSON_UNESCAPED_UNICODE), $sid]);
        jsonResponse(['success' => true]);
    }

    case 'reviewNewsSubmission': {
        requireRole(['editor', 'site_admin']);
        validateRequiredFields($body, ['submissionId']);
        $sid = (string) $body['submissionId'];
        $stmt = $pdo->prepare('SELECT * FROM news_submissions WHERE id = ?');
        $stmt->execute([$sid]);
        $sub = $stmt->fetch();
        if (!$sub || $sub['status'] !== 'pending') jsonResponse(['error' => 'Предложение не найдено или уже обработано.'], 404);
        $approve = !empty($body['approve']);
        $comment = trim((string) ($body['comment'] ?? ''));
        $pdo->beginTransaction();
        try {
            $pdo->prepare('UPDATE news_submissions SET status = ?, reviewed_at = current_timestamp(), reviewed_by_user_id = ?, reviewer_comment = ? WHERE id = ?')
                ->execute([$approve ? 'approved' : 'rejected', $myId, $comment ?: null, $sid]);
            $newsId = null;
            if ($approve) {
                $article = jsonColumn($sub['article'], []);
                $article['isPublic'] = $article['isPublic'] ?? true;
                $newsId = newId('news');
                $insertNews($pdo, $article, $newsId, $sub['submitted_by_user_id']);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
        jsonResponse(['success' => true, 'newsId' => $newsId]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
