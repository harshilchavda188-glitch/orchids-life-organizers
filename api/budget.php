<?php
require_once __DIR__ . '/config.php';

$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $txns = $stmt->fetchAll();
        foreach ($txns as &$t) {
            $t['amount'] = (float) $t['amount'];
            $t['id'] = (int) $t['id'];
        }
        jsonResponse($txns);
        break;

    case 'POST':
        $input = getJsonInput();
        $stmt = $db->prepare("INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['type'],
            $input['amount'],
            $input['category'],
            $input['description'],
            $input['date'] ?? date('Y-m-d'),
        ]);
        jsonResponse(['id' => (int) $db->lastInsertId(), 'message' => 'Transaction created'], 201);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $db->prepare("DELETE FROM transactions WHERE id=? AND user_id=?");
        $stmt->execute([$id, $userId]);
        jsonResponse(['message' => 'Transaction deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
