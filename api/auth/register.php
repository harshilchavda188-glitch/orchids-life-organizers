<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? '');

if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(['error' => 'Name, email, and password are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Invalid email format'], 400);
}

if (strlen($password) < 6) {
    jsonResponse(['error' => 'Password must be at least 6 characters'], 400);
}

try {
    $db = getDB();

    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'An account with this email already exists'], 409);
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (name, email, password, phone, auth_method) VALUES (?, ?, ?, ?, 'email')");
    $stmt->execute([$name, $email, $hashed, $phone]);

    $userId = (int) $db->lastInsertId();
    $token = generateToken($userId);

    jsonResponse([
        'token' => $token,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'authMethod' => 'email',
        ],
    ], 201);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Registration failed'], 500);
}
