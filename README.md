# Ahmed Rahmani — Portfolio (Halic Uni · SE4 · 22091000408)

> Single-page portfolio web app with a session-protected admin dashboard,
> AJAX-driven project cards, CSRF-secured contact form, and a dark
> Bloomberg-terminal aesthetic. No framework, no build step.

**Stack:** HTML5 · CSS3 · Vanilla JS (strict mode) · PHP 8 · MySQL 5.7+ · PDO

---

## ⚡ Requirements

| | minimum |
|---|---|
| PHP    | **8.0+** (uses `match` / `str_starts_with` / arrow functions) |
| MySQL  | 5.7+ (or MariaDB 10.3+) |
| Web server | Apache 2.4+ or nginx with PHP-FPM |
| PHP extensions | `pdo_mysql`, `mbstring`, `openssl`, `session` |

> Tested locally on XAMPP 8.2 (Apache + MySQL + PHP 8.2) and on InfinityFree.
> Works out of the box on 000webhost / InfinityFree free tier.

---

## 🚀 Quick start (local — 5 steps)

```bash
# 1. Clone or copy the folder into your htdocs / www root
cd C:\xampp\htdocs
# (or /Applications/XAMPP/htdocs on macOS, /var/www/html on Linux)

# 2. Drop in the project
git clone https://github.com/za3lot-alt/portfolio.git
# OR unzip portfolio.zip into htdocs/portfolio/

# 3. Start MySQL (XAMPP control panel) and import the schema
mysql -u root -p < portfolio/database/portfolio.sql

# 4. Edit DB credentials if your local MySQL has a non-empty root password
nano portfolio/includes/db.php
# change DB_PASS = '' → DB_PASS = 'yourpassword'

# 5. Start Apache and visit
http://localhost/portfolio/
```

The admin console is at **`/portfolio/admin/login.php`**.
Default credentials (CHANGE BEFORE DEPLOY):

```
username: ahmed
password: admin123
```

To change the admin password, log in once, then run the SQL below
(replace `NEW_HASH` with the output of `password_hash('your_new_pass', PASSWORD_DEFAULT)`):

```sql
UPDATE admin_users SET password_hash = 'NEW_HASH' WHERE username = 'ahmed';
```

You can generate the hash via the PHP CLI:

```bash
php -r "echo password_hash('your_new_pass', PASSWORD_DEFAULT) . PHP_EOL;"
```

---

## 📁 Project structure

```
portfolio/
├── index.html                       single-page entry
├── style.css                        all design tokens + 600+ lines of styling
├── script.js                        strict-mode JS (14 features + 4 bonuses)
├── contact.php                      POST → MySQL (CSRF + validation)
├── api/
│   ├── projects.php                 GET → JSON list of projects
│   ├── stats.php                    GET → JSON counts (live + curated)
│   └── csrf.php                     GET → JSON csrf_token (issued per session)
├── admin/
│   ├── login.php                    Session-based admin login
│   ├── logout.php                   session_destroy + redirect
│   ├── dashboard.php                Protected CRUD + paginated messages
│   └── admin.css                    Admin-specific styles
├── includes/
│   └── db.php                       PDO connection + CSRF helpers
├── database/
│   └── portfolio.sql                CREATE + INSERT (5 projects + admin user)
└── README.md                        this file
```

---

## 🔐 Security checklist

| | done |
|---|---|
| All DB queries use **prepared statements** | ✅ |
| **CSRF token** validated on contact form | ✅ |
| **CSRF token** validated on every admin POST | ✅ |
| Passwords hashed with **`password_hash` / `PASSWORD_DEFAULT`** | ✅ |
| Login **regenerates session ID** to prevent fixation | ✅ |
| Logout **wipes** session data and cookie | ✅ |
| All output **htmlspecialchars-escaped** | ✅ |
| Admin routes redirect to login when session unset | ✅ |
| `Cache-Control: no-store` on dynamic API responses | ✅ |
| PDO `ATTR_EMULATE_PREPARES = false` | ✅ |
| SQL `utf8mb4` charset for proper emoji/unicode | ✅ |

---

## 🌐 Deployment notes

### Option A — InfinityFree / 000webhost (recommended for free hosting)

1. Sign up, create a new website, note your assigned subdomain
   (e.g. `ahmed.epizy.com`).
2. In the control panel, open **MySQL Databases**, create one, copy:
   - Database host (`sql###.epizy.com`)
   - Database name (prefixed, e.g. `epiz_12345_portfolio_db`)
   - Username, password
3. Open **phpMyAdmin** for that database → **Import** → upload
   `database/portfolio.sql`. Note: you may need to delete the
   `CREATE DATABASE` line at the top before import on shared hosts.
4. Edit `includes/db.php` with the values from step 2.
5. Upload the whole folder via the file manager (or FTP). Make sure
   `index.html` lives at the web root.
6. Visit your subdomain. Done.

> 000webhost free tier: PHP 7.4–8.x, MySQL 5.7. Storage ~300 MB.
> Sites are auto-suspended if idle for 30 days — log in occasionally.

### Option B — GitHub Pages (frontend only)

GitHub Pages serves **static files only** — it cannot run PHP. If you
want a quick static preview:

- Push the project to a GitHub repo.
- Go to **Settings → Pages**, set source to `main` branch.
- Visit `https://<username>.github.io/<repo>/`.
- The contact form, admin dashboard, and API endpoints will **not work**
  (you'll see "load failed" on the projects section). Use Option A or D
  for the full app.

### Option C — Custom VPS (DigitalOcean, Hetzner)

```bash
# Ubuntu 22.04 + Apache + PHP-FPM + MySQL
sudo apt update
sudo apt install apache2 libapache2-mod-php php-mysql php-mbstring mysql-server unzip
sudo mysql_secure_installation

# Database
sudo mysql -u root <<SQL
CREATE USER 'portfolio'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio'@'localhost';
FLUSH PRIVILEGES;
SQL

mysql -u portfolio -p portfolio_db < database/portfolio.sql

# Deploy
sudo cp -r portfolio /var/www/html/
sudo chown -R www-data:www-data /var/www/html/portfolio
```

Then point Apache's DocumentRoot to `/var/www/html/portfolio` (or
configure a vhost) and edit `includes/db.php` with the new credentials.

### Option D — Local tunnel (demo for your professor in 30s)

If your assignment evaluator wants to see the live PHP/MySQL stack but
you can't deploy yet, expose your local XAMPP via **ngrok**:

```bash
# 1. Start XAMPP locally with portfolio in htdocs
# 2. Install ngrok (https://ngrok.com), then:
ngrok http 80

# Share the temporary https://xxxx.ngrok-free.app URL
```

---

## 🧪 Testing checklist (before submission)

- [ ] Run `mysql -u root -p < database/portfolio.sql` — no errors
- [ ] Visit `/` — page renders, projects load (3 cards visible after skeleton)
- [ ] Toggle dark/light theme — preference survives reload (`localStorage`)
- [ ] Submit contact form with bad data — inline errors per field
- [ ] Submit contact form correctly — green confirmation message
- [ ] Open browser dev console — see "Welcome." or "Welcome back, friend." log
- [ ] Visit `/admin/login.php` — log in with `ahmed` / `admin123`
- [ ] Add a new project from dashboard — appears on home page after refresh
- [ ] Delete a project — confirmation dialog → row disappears
- [ ] Click logout → redirected to login
- [ ] Navigate to `/admin/dashboard.php` while logged out → redirected to login
- [ ] Resize browser to 375px / 768px — layout responsive, hamburger works
- [ ] Click "Download CV" in hero — print dialog opens with CV-styled page
- [ ] Click `>_` button bottom-right — terminal opens; type `whoami`
- [ ] Top ticker bar shows live forex rates (refreshes every 30s)

---

## 🐛 Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| **"Database connection failed"** on every page | wrong creds in `includes/db.php` | Double-check `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` against your hosting panel |
| **Projects section shows skeleton forever, then "Could not load"** | `/api/projects.php` returning 500 | Open it directly in the browser; check the response. Usually a DB connection issue. |
| **Contact form returns "Invalid CSRF token"** | session not started or cookies blocked | Ensure cookies enabled; check that your host honours `session_start()` (some shared hosts disable sessions in `/api/`) |
| **"Class PDO not found"** | `pdo_mysql` extension missing | Install with `sudo apt install php-mysql` then restart Apache |
| **Admin login always says "Invalid credentials"** | password hash mismatch | Re-import `portfolio.sql` (the seed hash is for literal `admin123`) or regenerate via the `php -r` snippet above |
| **Forex ticker shows "—"** | network issue OR CORS block | Check browser console — open.er-api.com may be temporarily down. Falls back gracefully. |
| **Light-mode toggle does nothing** | localStorage disabled (incognito + cookies blocked) | Disable strict tracking protection or test in normal mode |
| **`session_regenerate_id`: writing failed** | `session.save_path` not writable | `chmod 1733 /var/lib/php/sessions` or set custom `session.save_path` in php.ini |

---

## 🎓 Academic context

This is the **Year-4 portfolio assignment for Halic University Software
Engineering**, due **14 May 2026**.

- **Student:** Ahmed Rahmani · 22091000408
- **Supervisor:** TBD (specify in submission cover sheet)
- **Course:** SE 4xx — Web Programming / Software Engineering Project

**Why this build is interesting**

Most student portfolio submissions ship a single static HTML page.
This one demonstrates the full SE-program curriculum end-to-end:

- **Web Programming:** HTML5/CSS3 with custom properties, semantic markup,
  flex + grid + responsive at 375px / 768px / 1280px breakpoints.
- **Database Systems:** normalized 3-table MySQL schema with indexes,
  PDO prepared statements, CSV-friendly export of `portfolio.sql`.
- **Software Engineering:** session-based authentication with CSRF
  protection, separation of concerns (API endpoints, admin module,
  shared `db.php`), README-as-runbook.
- **Quant trading interest:** live forex ticker (open.er-api.com),
  hardcoded equity-curve visualizer, terminal-themed aesthetic that
  reflects the Bloomberg/quant-dev side of the developer's identity.

---

## 🤖 Built with

Vibe coding + Claude AI (Opus 4.7, 1M context).
Treat AI tools as collaborators, not oracles. Every line was reviewed
and understood before being committed.

— Ahmed Rahmani, May 2026

```
> EOF
```
