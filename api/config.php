<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'smartlife');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }
    return $pdo;
}

function jsonResponse(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function getJsonInput(): array {
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

function getAuthUserId(): int {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);

    if (empty($token)) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        jsonResponse(['error' => 'Invalid token'], 401);
    }

    $payload = json_decode(base64_decode($parts[0]), true);
    if (!$payload || !isset($payload['user_id'])) {
        jsonResponse(['error' => 'Invalid token'], 401);
    }

    $exp = $payload['exp'] ?? 0;
    if ($exp < time()) {
        jsonResponse(['error' => 'Token expired'], 401);
    }

    return (int) $payload['user_id'];
}

function generateToken(int $userId): string {
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'exp' => time() + 86400 * 7,
    ]));
    $signature = base64_encode(hash_hmac('sha256', $payload, 'smartlife_secret_key_' . DB_NAME));
    return $payload . '.' . $signature;
}
