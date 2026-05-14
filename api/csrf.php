<?php
/**
 * api/csrf.php — GET → JSON {csrf_token: "..."}.
 *
 * Issues (or returns existing) per-session CSRF token so the static
 * index.html contact form can populate its hidden input.
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

echo json_encode(['csrf_token' => csrf_token()]);
