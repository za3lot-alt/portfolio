<?php
/**
 * api/projects.php — GET → JSON array of projects, sorted by featured/sort_order.
 *
 * Public endpoint, read-only. CORS opened for local dev convenience.
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $stmt = $pdo->query(
        'SELECT id, title, description, tech_stack, github_url, live_url, image_url,
                featured, sort_order, DATE_FORMAT(created_at, "%Y-%m-%d") AS created_at
         FROM projects
         ORDER BY featured DESC, sort_order ASC, created_at DESC'
    );
    $rows = $stmt->fetchAll();

    // Cast types for cleanliness
    foreach ($rows as &$r) {
        $r['id']         = (int) $r['id'];
        $r['featured']   = (bool) $r['featured'];
        $r['sort_order'] = (int) $r['sort_order'];
    }
    unset($r);

    echo json_encode($rows, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log('[api/projects.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
