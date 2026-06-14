<?php
require_once __DIR__ . '/../config.php';

$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM yearly_events WHERE user_id = ? ORDER BY year DESC, FIELD(month, 'January','February','March','April','May','June','July','August','September','October','November','December')");
        $stmt->execute([$userId]);
        $events = $stmt->fetchAll();
        foreach ($events as &$e) {
            $e['id'] = (int) $e['id'];
        }
        jsonResponse($events);
        break;

    case 'POST':
        $input = getJsonInput();
        $stmt = $db->prepare("INSERT INTO yearly_events (user_id, year, title, month, description, type) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['year'],
            $input['title'],
            $input['month'] ?? null,
            $input['description'] ?? '',
            $input['type'] ?? 'other',
        ]);
        jsonResponse(['id' => (int) $db->lastInsertId(), 'message' => 'Event created'], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? 0;
        $stmt = $db->prepare("UPDATE yearly_events SET year=?, title=?, month=?, description=?, type=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $input['year'],
            $input['title'],
            $input['month'] ?? null,
            $input['description'] ?? '',
            $input['type'] ?? 'other',
            $id,
            $userId,
        ]);
        jsonResponse(['message' => 'Event updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $db->prepare("DELETE FROM yearly_events WHERE id=? AND user_id=?");
        $stmt->execute([$id, $userId]);
        jsonResponse(['message' => 'Event deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
