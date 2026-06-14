<?php
require_once __DIR__ . '/config.php';

$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM shopping_items WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $input = getJsonInput();
        $stmt = $db->prepare("INSERT INTO shopping_items (user_id, name, category, quantity, notes) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['name'],
            $input['category'] ?? 'Groceries',
            $input['quantity'] ?? '',
            $input['notes'] ?? '',
        ]);
        jsonResponse(['id' => (int) $db->lastInsertId(), 'message' => 'Item created'], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? 0;
        $stmt = $db->prepare("UPDATE shopping_items SET name=?, category=?, quantity=?, notes=?, purchased=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $input['name'],
            $input['category'] ?? 'Groceries',
            $input['quantity'] ?? '',
            $input['notes'] ?? '',
            $input['purchased'] ?? 0,
            $id,
            $userId,
        ]);
        jsonResponse(['message' => 'Item updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $db->prepare("DELETE FROM shopping_items WHERE id=? AND user_id=?");
        $stmt->execute([$id, $userId]);
        jsonResponse(['message' => 'Item deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
