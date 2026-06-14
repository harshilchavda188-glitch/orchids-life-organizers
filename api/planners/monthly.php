<?php
require_once __DIR__ . '/../config.php';

$userId = getAuthUserId();
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM monthly_events WHERE user_id = ? ORDER BY year DESC, FIELD(month, 'January','February','March','April','May','June','July','August','September','October','November','December'), event_date");
        $stmt->execute([$userId]);
        $events = $stmt->fetchAll();
        foreach ($events as &$e) {
            $e['id'] = (int) $e['id'];
        }
        jsonResponse($events);
        break;

    case 'POST':
        $input = getJsonInput();
        $stmt = $db->prepare("INSERT INTO monthly_events (user_id, month, year, title, event_date, notes, type) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['month'],
            $input['year'],
            $input['title'],
            $input['event_date'] ?? null,
            $input['notes'] ?? '',
            $input['type'] ?? 'event',
        ]);
        jsonResponse(['id' => (int) $db->lastInsertId(), 'message' => 'Event created'], 201);
        break;

    case 'PUT':
        $input = getJsonInput();
        $id = $input['id'] ?? 0;
        $stmt = $db->prepare("UPDATE monthly_events SET month=?, year=?, title=?, event_date=?, notes=?, type=? WHERE id=? AND user_id=?");
        $stmt->execute([
            $input['month'],
            $input['year'],
            $input['title'],
            $input['event_date'] ?? null,
            $input['notes'] ?? '',
            $input['type'] ?? 'event',
            $id,
            $userId,
        ]);
        jsonResponse(['message' => 'Event updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $db->prepare("DELETE FROM monthly_events WHERE id=? AND user_id=?");
        $stmt->execute([$id, $userId]);
        jsonResponse(['message' => 'Event deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
