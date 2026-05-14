<?php
/**
 * includes/db.php
 *
 * PDO database connection for the portfolio app.
 *
 * - Single shared $pdo instance across all PHP entrypoints.
 * - PDO::ERRMODE_EXCEPTION so failed queries throw, never silently fail.
 * - Prepared statements only (rule enforced in every consumer).
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Connection constants. Override these for your deployment.
// On 000webhost / InfinityFree / shared host, you'll get given:
//   DB_HOST = something like 'sql###.epizy.com'
//   DB_NAME = often prefixed with your account
//   DB_USER, DB_PASS = from cPanel / hosting dashboard
// ---------------------------------------------------------------------------
const DB_HOST = 'localhost';
const DB_NAME = 'portfolio_db';
const DB_USER = 'root';
const DB_PASS = '';
const DB_CHARSET = 'utf8mb4';

// ---------------------------------------------------------------------------
// Build PDO with safe defaults.
// ---------------------------------------------------------------------------
$dsn = sprintf(
    'mysql:host=%s;dbname=%s;charset=%s',
    DB_HOST,
    DB_NAME,
    DB_CHARSET
);

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_PERSISTENT         => false,
];

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // In production, never echo $e->getMessage() to the client.
    // Log it instead and return a safe message.
    error_log('[db.php] PDO connection failed: ' . $e->getMessage());
    http_response_code(500);
    if (PHP_SAPI !== 'cli' && (strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest'
        || str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/api/')
        || str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/contact.php'))) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Database unavailable']);
    } else {
        echo 'Database connection failed. Please try again later.';
    }
    exit;
}

/**
 * CSRF helper — generate-or-fetch a token bound to the current session.
 *
 * @return string 32-hex-char token
 */
function csrf_token(): string
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf_token'];
}

/**
 * CSRF helper — strict validation of submitted token.
 *
 * @param string|null $submitted The value of $_POST['csrf_token']
 * @return bool true if valid
 */
function csrf_check(?string $submitted): bool
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['csrf_token']) || empty($submitted)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $submitted);
}
