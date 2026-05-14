<?php
/**
 * admin/login.php — Session-based admin login.
 *
 * GET  → render login form with CSRF token.
 * POST → validate CSRF, look up admin by username, password_verify(),
 *        regenerate session id, set $_SESSION['admin'], redirect to dashboard.
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../includes/db.php';

// If already logged in, send straight to dashboard.
if (!empty($_SESSION['admin'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token    = (string) ($_POST['csrf_token'] ?? '');
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!csrf_check($token)) {
        $error = 'Invalid CSRF token. Reload the page and try again.';
    } elseif ($username === '' || $password === '') {
        $error = 'Username and password are required.';
    } else {
        try {
            $stmt = $pdo->prepare(
                'SELECT id, username, password_hash FROM admin_users WHERE username = :u LIMIT 1'
            );
            $stmt->execute([':u' => $username]);
            $row = $stmt->fetch();

            if ($row && password_verify($password, $row['password_hash'])) {
                // Login success — rotate session id to prevent fixation
                session_regenerate_id(true);
                $_SESSION['admin']    = ['id' => (int) $row['id'], 'username' => $row['username']];
                $_SESSION['csrf_token'] = bin2hex(random_bytes(16));

                // Update last_login (best-effort)
                try {
                    $pdo->prepare('UPDATE admin_users SET last_login = NOW() WHERE id = :id')
                        ->execute([':id' => (int) $row['id']]);
                } catch (PDOException $e) { /* ignore */ }

                header('Location: dashboard.php');
                exit;
            }
            $error = 'Invalid credentials.';
        } catch (PDOException $e) {
            error_log('[admin/login.php] ' . $e->getMessage());
            $error = 'Server error — please try again.';
        }
    }
}

$csrf = csrf_token();
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>&gt; admin · login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body admin-login-page">
    <main class="admin-login-wrap">
        <section class="admin-login-card">
            <h1 class="admin-login-title"><span class="prompt">&gt;</span> ADMIN_LOGIN</h1>
            <p class="admin-login-sub">Restricted area &mdash; portfolio management console.</p>

            <?php if ($error): ?>
                <p class="admin-login-error">&gt; <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
            <?php endif; ?>

            <form method="POST" action="login.php" novalidate>
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>">

                <div class="form-row">
                    <label for="username">username</label>
                    <input type="text" id="username" name="username" required autocomplete="username"
                           value="<?= htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
                </div>

                <div class="form-row">
                    <label for="password">password</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password">
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">authenticate <span aria-hidden="true">→</span></button>
                    <a href="../index.html" class="btn btn-ghost btn-sm">← back to site</a>
                </div>
            </form>

            <p class="admin-login-footer">
                Default: <code>ahmed</code> / <code>admin123</code> &mdash;
                <span style="color:var(--accent-pink)">CHANGE THIS BEFORE DEPLOY</span>.
            </p>
        </section>
    </main>
</body>
</html>
