<?php
/**
 * admin/dashboard.php — Protected CRUD console.
 *
 * Features:
 *   - Session check (redirect to login if not authenticated).
 *   - Add new project (form, CSRF, server-side validation).
 *   - Edit existing project (per-row inline form).
 *   - Delete project (CSRF-checked POST).
 *   - View paginated contact submissions (read-only).
 *
 * All DB operations via PDO prepared statements.
 *
 * @author Ahmed Rahmani <22091000408>
 */

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../includes/db.php';

if (empty($_SESSION['admin'])) {
    header('Location: login.php');
    exit;
}

// ---------------------------------------------------------------------------
// Action dispatch (POST handlers — all guarded by CSRF check)
// ---------------------------------------------------------------------------
$flashOk  = '';
$flashErr = '';

function in_post(string $key): string { return trim((string) ($_POST[$key] ?? '')); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token  = (string) ($_POST['csrf_token'] ?? '');
    $action = (string) ($_POST['action'] ?? '');

    if (!csrf_check($token)) {
        $flashErr = 'Invalid CSRF token — try again.';
    } else {
        try {
            if ($action === 'create') {
                $title       = in_post('title');
                $description = in_post('description');
                $tech_stack  = in_post('tech_stack');
                $github_url  = in_post('github_url');
                $live_url    = in_post('live_url');
                $image_url   = in_post('image_url');
                $featured    = (int) (!empty($_POST['featured']));
                $sort_order  = (int) ($_POST['sort_order'] ?? 0);

                if ($title === '' || mb_strlen($title) > 150) {
                    throw new RuntimeException('Title required (1–150 chars)');
                }
                if ($description === '' || mb_strlen($description) > 5000) {
                    throw new RuntimeException('Description required (1–5000 chars)');
                }
                if (mb_strlen($tech_stack) > 255) {
                    throw new RuntimeException('Tech stack too long');
                }
                foreach (['github_url' => $github_url, 'live_url' => $live_url, 'image_url' => $image_url] as $k => $v) {
                    if ($v !== '' && !filter_var($v, FILTER_VALIDATE_URL)) {
                        throw new RuntimeException("Invalid URL: $k");
                    }
                }

                $stmt = $pdo->prepare(
                    'INSERT INTO projects (title, description, tech_stack, github_url, live_url, image_url, featured, sort_order)
                     VALUES (:title, :description, :tech_stack, :github_url, :live_url, :image_url, :featured, :sort_order)'
                );
                $stmt->execute([
                    ':title' => $title, ':description' => $description, ':tech_stack' => $tech_stack,
                    ':github_url' => $github_url ?: null, ':live_url' => $live_url ?: null,
                    ':image_url' => $image_url ?: null,
                    ':featured' => $featured, ':sort_order' => $sort_order,
                ]);
                $flashOk = 'Project added.';
            } elseif ($action === 'update') {
                $id = (int) ($_POST['id'] ?? 0);
                if ($id <= 0) throw new RuntimeException('Invalid id');

                $title       = in_post('title');
                $description = in_post('description');
                $tech_stack  = in_post('tech_stack');
                $github_url  = in_post('github_url');
                $live_url    = in_post('live_url');
                $image_url   = in_post('image_url');
                $featured    = (int) (!empty($_POST['featured']));
                $sort_order  = (int) ($_POST['sort_order'] ?? 0);

                if ($title === '' || mb_strlen($title) > 150) throw new RuntimeException('Title required (1–150)');
                if ($description === '' || mb_strlen($description) > 5000) throw new RuntimeException('Description required');
                foreach (['github_url' => $github_url, 'live_url' => $live_url, 'image_url' => $image_url] as $k => $v) {
                    if ($v !== '' && !filter_var($v, FILTER_VALIDATE_URL)) throw new RuntimeException("Invalid URL: $k");
                }

                $stmt = $pdo->prepare(
                    'UPDATE projects
                     SET title=:title, description=:description, tech_stack=:tech_stack,
                         github_url=:github_url, live_url=:live_url, image_url=:image_url,
                         featured=:featured, sort_order=:sort_order
                     WHERE id=:id'
                );
                $stmt->execute([
                    ':title' => $title, ':description' => $description, ':tech_stack' => $tech_stack,
                    ':github_url' => $github_url ?: null, ':live_url' => $live_url ?: null,
                    ':image_url' => $image_url ?: null,
                    ':featured' => $featured, ':sort_order' => $sort_order, ':id' => $id,
                ]);
                $flashOk = 'Project #' . $id . ' updated.';
            } elseif ($action === 'delete') {
                $id = (int) ($_POST['id'] ?? 0);
                if ($id <= 0) throw new RuntimeException('Invalid id');
                $stmt = $pdo->prepare('DELETE FROM projects WHERE id = :id');
                $stmt->execute([':id' => $id]);
                $flashOk = 'Project #' . $id . ' deleted.';
            } else {
                $flashErr = 'Unknown action.';
            }
        } catch (RuntimeException $e) {
            $flashErr = $e->getMessage();
        } catch (PDOException $e) {
            error_log('[admin/dashboard] ' . $e->getMessage());
            $flashErr = 'Database error.';
        }
    }
}

// ---------------------------------------------------------------------------
// Read data
// ---------------------------------------------------------------------------
$projects = [];
$contacts = [];
try {
    $projects = $pdo->query(
        'SELECT id, title, description, tech_stack, github_url, live_url, image_url, featured, sort_order, created_at
         FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC'
    )->fetchAll();

    // Contacts pagination
    $page    = max(1, (int) ($_GET['page'] ?? 1));
    $perPage = 10;
    $offset  = ($page - 1) * $perPage;

    $totalContacts = (int) $pdo->query('SELECT COUNT(*) FROM contacts')->fetchColumn();
    $totalPages    = max(1, (int) ceil($totalContacts / $perPage));

    $stmt = $pdo->prepare(
        'SELECT id, name, email, subject, LEFT(message, 220) AS preview,
                ip_address, submitted_at
         FROM contacts ORDER BY submitted_at DESC LIMIT :off, :lim'
    );
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->execute();
    $contacts = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log('[admin/dashboard read] ' . $e->getMessage());
    $flashErr = $flashErr ?: 'Could not load data.';
}

$csrf  = csrf_token();
$admin = $_SESSION['admin'];

function h(?string $s): string { return htmlspecialchars((string) ($s ?? ''), ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>&gt; admin · dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">

<header class="admin-header">
    <div class="container admin-header-row">
        <h1 class="admin-brand"><span class="prompt">&gt;</span> AR_admin</h1>
        <nav class="admin-nav">
            <span class="admin-user">@<?= h($admin['username']) ?></span>
            <a href="../index.html" class="btn btn-sm btn-ghost">↗ site</a>
            <a href="logout.php" class="btn btn-sm">logout</a>
        </nav>
    </div>
</header>

<main class="container admin-main">

    <?php if ($flashOk): ?>
        <p class="admin-flash ok">&gt; ✓ <?= h($flashOk) ?></p>
    <?php endif; ?>
    <?php if ($flashErr): ?>
        <p class="admin-flash err">&gt; ⚠ <?= h($flashErr) ?></p>
    <?php endif; ?>

    <!-- ─── New project form ──────────────────────────────────────── -->
    <section class="admin-section">
        <h2 class="section-title"><span class="prompt">&gt;</span> NEW_PROJECT</h2>
        <form method="POST" class="admin-form">
            <input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
            <input type="hidden" name="action" value="create">

            <div class="form-grid">
                <label>title <input type="text" name="title" required maxlength="150"></label>
                <label>tech_stack <span class="dim">/comma-separated</span>
                       <input type="text" name="tech_stack" maxlength="255" placeholder="HTML5,CSS3,JavaScript,PHP"></label>
                <label>github_url <input type="url" name="github_url" maxlength="500" placeholder="https://github.com/…"></label>
                <label>live_url   <input type="url" name="live_url"   maxlength="500" placeholder="https://example.com"></label>
                <label>image_url  <input type="url" name="image_url"  maxlength="500"></label>
                <label>sort_order <input type="number" name="sort_order" value="100"></label>
                <label class="checkbox">
                    <input type="checkbox" name="featured" value="1"> featured?
                </label>
            </div>
            <label>description
                <textarea name="description" required rows="4" maxlength="5000"></textarea>
            </label>
            <button type="submit" class="btn btn-primary">+ create</button>
        </form>
    </section>

    <!-- ─── Existing projects table ───────────────────────────────── -->
    <section class="admin-section">
        <h2 class="section-title"><span class="prompt">&gt;</span> PROJECTS <span class="dim">(<?= count($projects) ?>)</span></h2>
        <div class="admin-projects">
            <?php foreach ($projects as $p): ?>
                <details class="admin-project" data-id="<?= (int) $p['id'] ?>">
                    <summary>
                        <span class="ap-id">#<?= (int) $p['id'] ?></span>
                        <span class="ap-title"><?= h($p['title']) ?></span>
                        <?php if ($p['featured']): ?><span class="ap-tag">★ featured</span><?php endif; ?>
                        <span class="ap-stack"><?= h($p['tech_stack']) ?></span>
                    </summary>
                    <form method="POST" class="admin-form">
                        <input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
                        <input type="hidden" name="action" value="update">
                        <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
                        <div class="form-grid">
                            <label>title       <input type="text" name="title" required maxlength="150" value="<?= h($p['title']) ?>"></label>
                            <label>tech_stack  <input type="text" name="tech_stack" maxlength="255" value="<?= h($p['tech_stack']) ?>"></label>
                            <label>github_url  <input type="url"  name="github_url" maxlength="500" value="<?= h($p['github_url']) ?>"></label>
                            <label>live_url    <input type="url"  name="live_url"   maxlength="500" value="<?= h($p['live_url']) ?>"></label>
                            <label>image_url   <input type="url"  name="image_url"  maxlength="500" value="<?= h($p['image_url']) ?>"></label>
                            <label>sort_order  <input type="number" name="sort_order" value="<?= (int) $p['sort_order'] ?>"></label>
                            <label class="checkbox">
                                <input type="checkbox" name="featured" value="1" <?= $p['featured'] ? 'checked' : '' ?>> featured
                            </label>
                        </div>
                        <label>description
                            <textarea name="description" required rows="4" maxlength="5000"><?= h($p['description']) ?></textarea>
                        </label>
                        <div class="admin-row-actions">
                            <button type="submit" class="btn btn-primary btn-sm">save</button>
                        </div>
                    </form>
                    <form method="POST" class="admin-delete-form"
                          onsubmit="return confirm('Delete project #<?= (int) $p['id'] ?> &quot;<?= h($p['title']) ?>&quot;?');">
                        <input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
                        <input type="hidden" name="action" value="delete">
                        <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
                        <button type="submit" class="btn btn-sm btn-danger">delete</button>
                    </form>
                </details>
            <?php endforeach; ?>

            <?php if (empty($projects)): ?>
                <p class="dim">&gt; no projects yet — add one above.</p>
            <?php endif; ?>
        </div>
    </section>

    <!-- ─── Contact submissions ───────────────────────────────────── -->
    <section class="admin-section">
        <h2 class="section-title"><span class="prompt">&gt;</span> MESSAGES <span class="dim">(<?= (int) ($totalContacts ?? 0) ?>)</span></h2>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>#</th><th>name</th><th>email</th><th>subject</th>
                    <th>preview</th><th>ip</th><th>received</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($contacts as $c): ?>
                    <tr>
                        <td><?= (int) $c['id'] ?></td>
                        <td><?= h($c['name']) ?></td>
                        <td><a href="mailto:<?= h($c['email']) ?>"><?= h($c['email']) ?></a></td>
                        <td><?= h($c['subject']) ?></td>
                        <td><?= h($c['preview']) ?>…</td>
                        <td><span class="mono dim"><?= h($c['ip_address'] ?? '') ?></span></td>
                        <td><span class="mono"><?= h($c['submitted_at']) ?></span></td>
                    </tr>
                <?php endforeach; ?>
                <?php if (empty($contacts)): ?>
                    <tr><td colspan="7" class="dim">&gt; no messages yet</td></tr>
                <?php endif; ?>
            </tbody>
        </table>

        <?php if (($totalPages ?? 1) > 1): ?>
            <nav class="admin-pager" aria-label="Pagination">
                <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                    <a href="?page=<?= $i ?>" class="<?= $i === ($page ?? 1) ? 'active' : '' ?>"><?= $i ?></a>
                <?php endfor; ?>
            </nav>
        <?php endif; ?>
    </section>
</main>

</body>
</html>
