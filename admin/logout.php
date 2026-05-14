<?php
/**
 * admin/logout.php — Destroy session and redirect to login.
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

session_start();

// Wipe session data
$_SESSION = [];

// Wipe session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();
header('Location: login.php');
exit;
