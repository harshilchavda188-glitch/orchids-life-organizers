<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'Email and password are required'], 400);
}

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['error' => 'Invalid email or password'], 401);
    }

    $token = generateToken($user['id']);

    jsonResponse([
        'token' => $token,
        'user' => [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'authMethod' => 'email',
        ],
    ]);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Login failed'], 500);
}
