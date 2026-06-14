<?php
require_once __DIR__ . '/config.php';

$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $recipes = $stmt->fetchAll();
        foreach ($recipes as &$r) {
            $r['ingredients'] = json_decode($r['ingredients'] ?? '[]', true);
            $r['steps'] = json_decode($r['steps'] ?? '[]', true);
            $r['id'] = (int) $r['id'];
        }
        jsonResponse($recipes);
        break;

    case 'POST':
        $input = getJsonInput();
        $stmt = $db->prepare("INSERT INTO recipes (user_id, name, category, ingredients, steps, notes) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['name'],
            $input['category'] ?? 'Lunch',
            json_encode($input['ingredients'] ?? []),
            json_encode($input['steps'] ?? []),
            $input['notes'] ?? '',
        ]);
        jsonResponse(['id' => (int) $db->lastInsertId(), 'message' => 'Recipe created'], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? 0;
        $stmt = $db->prepare("UPDATE recipes SET name=?, category=?, ingredients=?, steps=?, notes=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $input['name'],
            $input['category'] ?? 'Lunch',
            json_encode($input['ingredients'] ?? []),
            json_encode($input['steps'] ?? []),
            $input['notes'] ?? '',
            $id,
            $userId,
        ]);
        jsonResponse(['message' => 'Recipe updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $db->prepare("DELETE FROM recipes WHERE id=? AND user_id=?");
        $stmt->execute([$id, $userId]);
        jsonResponse(['message' => 'Recipe deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
