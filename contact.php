<?php
/**
 * contact.php — public contact-form POST handler.
 *
 * - POST only (returns 405 otherwise).
 * - Validates CSRF token against session.
 * - Server-side validation matching the JS rules.
 * - Stores message in `contacts` table via PDO prepared statement.
 * - Always responds with JSON.
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

session_start();

require_once __DIR__ . '/includes/db.php';

header('Content-Type: application/json; charset=utf-8');
// Prevent caching of the JSON response
header('Cache-Control: no-store, no-cache, must-revalidate');

// ---------------------------------------------------------------------------
// 1) Method gate
// ---------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ---------------------------------------------------------------------------
// 2) CSRF check
// ---------------------------------------------------------------------------
$submittedToken = isset($_POST['csrf_token']) ? (string) $_POST['csrf_token'] : null;
if (!csrf_check($submittedToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing CSRF token']);
    exit;
}

// ---------------------------------------------------------------------------
// 3) Validation (mirrors client-side rules)
// ---------------------------------------------------------------------------
$name    = trim((string) ($_POST['name']    ?? ''));
$email   = trim((string) ($_POST['email']   ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$errors = [];
if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    $errors[] = 'Name must be 2–100 characters';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    $errors[] = 'A valid email is required';
}
if (mb_strlen($subject) > 200) {
    $errors[] = 'Subject too long (max 200)';
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) {
    $errors[] = 'Message must be 10–2000 characters';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => implode('; ', $errors)]);
    exit;
}

// ---------------------------------------------------------------------------
// 4) Persist
// ---------------------------------------------------------------------------
try {
    $stmt = $pdo->prepare(
        'INSERT INTO contacts (name, email, subject, message, ip_address)
         VALUES (:name, :email, :subject, :message, :ip)'
    );
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':subject' => $subject !== '' ? $subject : '(no subject)',
        ':message' => $message,
        ':ip'      => $_SERVER['REMOTE_ADDR'] ?? null,
    ]);

    // Rotate the CSRF token after successful submission to avoid replay.
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));

    echo json_encode(['success' => true, 'id' => (int) $pdo->lastInsertId()]);
} catch (PDOException $e) {
    error_log('[contact.php] insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error — please try again']);
}
