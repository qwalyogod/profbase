<?php
// /api/support/index.php — support tickets.
// Actions (POST { action, ... }):
//   createSupportTicket (any authenticated user; ticket is owned by them)
//   reviewSupportTicket (editor/site_admin, or org_admin of the ticket's org)
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

requireMethod(['POST']);
$me = requireAuth();
$pdo = db();
$body = readJsonBody();
$action = $body['action'] ?? '';

switch ($action) {
    case 'createSupportTicket': {
        validateRequiredFields($body, ['subject', 'message']);
        $id = (string) ($body['id'] ?? newId('tkt'));
        $myId = userPublicId($me);
        $stmt = $pdo->prepare(
            'INSERT INTO support_tickets (id, user_id, organization_id, subject, message, status, created_at)
             VALUES (?,?,?,?,?, "open", current_timestamp())'
        );
        $stmt->execute([
            $id, $myId, $body['organizationId'] ?? null, (string) $body['subject'], (string) $body['message'],
        ]);
        $insAtt = $pdo->prepare('INSERT INTO support_attachments (ticket_id, name, type, data_url) VALUES (?,?,?,?)');
        foreach (($body['attachments'] ?? []) as $a) {
            $insAtt->execute([$id, $a['name'] ?? '', $a['type'] ?? '', $a['dataUrl'] ?? '']);
        }
        jsonResponse(['success' => true, 'id' => $id], 201);
    }

    case 'reviewSupportTicket': {
        validateRequiredFields($body, ['ticketId']);
        $ticketId = (string) $body['ticketId'];
        $ticket = $pdo->prepare('SELECT organization_id FROM support_tickets WHERE id = ?');
        $ticket->execute([$ticketId]);
        $row = $ticket->fetch();
        if (!$row) {
            jsonResponse(['error' => 'Обращение не найдено'], 404);
        }
        // editor/site_admin always; otherwise org admin of the ticket's org
        if (!canModerateContent($me)) {
            if (!$row['organization_id'] || !isOrgAdmin($pdo, $me, (string) $row['organization_id'])) {
                jsonResponse(['error' => 'Недостаточно прав'], 403);
            }
        }
        $status = !empty($body['approve']) ? 'approved' : 'rejected';
        $stmt = $pdo->prepare(
            'UPDATE support_tickets
                SET status = ?, admin_response = ?, reviewed_by_user_id = ?, reviewed_at = current_timestamp()
              WHERE id = ?'
        );
        $stmt->execute([$status, $body['response'] ?? '', userPublicId($me), $ticketId]);
        jsonResponse(['success' => true, 'status' => $status]);
    }

    default:
        jsonResponse(['error' => 'Неизвестное действие'], 400);
}
