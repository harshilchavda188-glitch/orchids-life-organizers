<?php
require_once __DIR__ . '/../config.php';

$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM weekly_tasks WHERE user_id = ? ORDER BY FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), id");
        $stmt->execute([$userId]);
        $tasks = $stmt->fetchAll();
        foreach ($tasks as &$t) {
            $t['id'] = (int) $t['id'];
            $t['completed'] = (bool) $t['completed'];
        }
        jsonResponse($tasks);
        break;

    case 'POST':
        $input = getJsonInput();
        $stmt = $db->prepare("INSERT INTO weekly_tasks (user_id, day, task) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $input['day'], $input['task']]);
        jsonResponse(['id' => (int) $db->lastInsertId(), 'message' => 'Task created'], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? 0;
        $stmt = $db->prepare("UPDATE weekly_tasks SET day=?, task=?, completed=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $input['day'],
            $input['task'],
            $input['completed'] ?? 0,
            $id,
            $userId,
        ]);
        jsonResponse(['message' => 'Task updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $db->prepare("DELETE FROM weekly_tasks WHERE id=? AND user_id=?");
        $stmt->execute([$id, $userId]);
        jsonResponse(['message' => 'Task deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
