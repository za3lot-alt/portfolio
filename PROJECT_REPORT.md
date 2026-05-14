# Project Report — Personal Portfolio Web Application

**Student:** Ahmed Rahmani
**Student ID:** 22091000408
**University:** Haliç University, Istanbul
**Department:** Software Engineering
**Submission Date:** 14 May 2026

---

## Project title

**Ahmed Rahmani — Portfolio & Admin Console**
A single-page personal portfolio with a session-protected admin dashboard, AJAX-driven project showcase, and CSRF-secured contact form.

## Description

A full-stack web application built end-to-end without any framework, build step, or third-party JavaScript library. The public site presents the developer's profile, academic timeline, skills, and dynamically loaded projects, while a private admin console (sessions + bcrypt + CSRF) allows full CRUD over the project catalogue and read access to incoming contact submissions. The project demonstrates the complete arc of the Software Engineering curriculum: semantic markup, responsive design, vanilla DOM scripting, AJAX, relational schema design, prepared-statement database access, and authenticated state management.

## Features mapped to the rubric

| Rubric requirement | Implementation |
|---|---|
| **Semantic HTML5** | `index.html` uses `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<figure>`, `<figcaption>` throughout (32 semantic tags). |
| **At least one HTML `<table>`** | Academic Timeline table in the About section; Messages table in `admin/dashboard.php`. |
| **HTML forms** | Public contact form (`index.html`), admin login (`admin/login.php`), inline add/edit project forms (`admin/dashboard.php`). |
| **Responsive CSS (Flexbox + Grid)** | `style.css` uses Flexbox for nav/cards and CSS Grid for the about and skills layouts; breakpoints at 375 px, 768 px, 1280 px. |
| **Consistent branding** | Single CSS design-token palette (`--accent-cyan`, `--accent-gold`, `--text-primary`), JetBrains Mono + Syne typography across all pages. |
| **JavaScript dark-mode toggle** | `initThemeToggle()` in `script.js` — preference persisted to `localStorage`, applied via `data-theme` attribute. |
| **JS form validation before submit** | `validateField()` checks name, email regex, subject, and message length on `blur` and on submit; submission blocked until valid. |
| **AJAX (Fetch API)** | `initProjectsAJAX()` calls `api/projects.php`, renders cards into the DOM without page reload; contact form posts to `contact.php` via Fetch. |
| **PHP + MySQL contact storage** | `contact.php` validates CSRF + input, then inserts into `contacts` via PDO prepared statement. |
| **Projects loaded from database** | `api/projects.php` returns JSON from the `projects` table; zero hardcoded project HTML. |
| **PHP `$_SESSION`** | `admin/login.php` sets `$_SESSION['admin']` after `password_verify`; `dashboard.php` redirects to login when unset. |
| **Cookies** | Visit-counter cookie set in `initVisitCookie()` (client-side `document.cookie`); PHP session cookie issued by `session_start()`. |
| **Hashed passwords** | `password_hash(PASSWORD_DEFAULT)` for storage, `password_verify()` for comparison — no plaintext passwords anywhere. |
| **Prepared statements** | Every SQL query in the project uses PDO named placeholders (`:name`) with `ATTR_EMULATE_PREPARES = false`. |
| **CSRF protection** | Per-session token generated in `includes/db.php`, embedded in every form, verified via `hash_equals()` on every POST. |
| **Session security** | `session_regenerate_id(true)` after successful login to prevent session fixation; logout wipes session data and cookie. |

## Tech stack

- **Frontend:** HTML5, CSS3 (custom properties, Flexbox, Grid, `@media` queries), Vanilla JavaScript (strict mode, Fetch API, ES2020+).
- **Backend:** PHP 8 with PDO (MySQL driver), `password_hash`, `random_bytes`, `hash_equals`.
- **Database:** MySQL 5.7+ / MariaDB 10.3+, InnoDB engine, `utf8mb4_unicode_ci` collation.
- **No frameworks, no npm, no build step.**

## Setup (XAMPP)

1. Copy the `portfolio/` folder into `C:\xampp\htdocs\`.
2. Start **Apache** and **MySQL** from the XAMPP control panel.
3. Open phpMyAdmin → **Import** → upload `database/portfolio.sql`.
4. (Optional) Edit `includes/db.php` if your MySQL root password is non-empty.
5. Visit `http://localhost/portfolio/` for the public site.
6. Visit `http://localhost/portfolio/admin/login.php` for the admin console.

## Default admin login

```
username: ahmed
password: admin123
```

(Change immediately after first deployment — see `README.md` for the SQL update + `password_hash()` regeneration command.)

## File overview

```
portfolio/
├── index.html              public single-page site
├── style.css               design tokens + responsive layout
├── script.js               dark mode, validation, AJAX, DOM events
├── contact.php             POST → MySQL (CSRF + PDO insert)
├── api/projects.php        GET → JSON projects
├── api/csrf.php            GET → JSON CSRF token
├── api/stats.php           GET → JSON live counts
├── admin/login.php         session login
├── admin/dashboard.php     protected CRUD + messages table
├── admin/logout.php        session destroy
├── includes/db.php         PDO + CSRF helpers
├── database/portfolio.sql  schema + seed data
├── README.md               full setup + deployment guide
└── PROJECT_REPORT.md       this file
```

---

*Submitted in fulfilment of the Year-4 Web Programming / Software Engineering Project requirement, Haliç University Software Engineering Department.*
