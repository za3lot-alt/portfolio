<?php
/**
 * api/stats.php — GET → JSON of fun portfolio stats (live counts).
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=120');
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
    $projectsCount = (int) $pdo->query('SELECT COUNT(*) FROM projects')->fetchColumn();
    $messagesCount = (int) $pdo->query('SELECT COUNT(*) FROM contacts')->fetchColumn();
    $featuredCount = (int) $pdo->query('SELECT COUNT(*) FROM projects WHERE featured = 1')->fetchColumn();

    // Static cosmetic stats (curated by Ahmed, refreshed manually)
    $static = [
        'lines_of_code'        => 3247,
        'strategies_backtested'=> 14,
        'commits'              => 847,
        'coffees'              => '∞',
    ];

    echo json_encode([
        'projects'  => $projectsCount,
        'featured'  => $featuredCount,
        'messages'  => $messagesCount,
        'student_id'=> '22091000408',
        'university'=> 'Halic University',
        'curated'   => $static,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log('[api/stats.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
