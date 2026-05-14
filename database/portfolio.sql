-- ============================================================================
-- portfolio.sql — Full schema + seed data for Ahmed Rahmani's portfolio app.
--
-- Halic University · Software Engineering · Year 4 · Student ID 22091000408
--
-- Usage:
--   mysql -u root -p < portfolio.sql
-- or in phpMyAdmin: Import → choose this file.
--
-- Default admin login (CHANGE BEFORE DEPLOYING):
--   username: ahmed
--   password: admin123
-- ============================================================================

CREATE DATABASE IF NOT EXISTS portfolio_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- ----------------------------------------------------------------------------
-- Drop existing tables for a clean install
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS admin_users;

-- ----------------------------------------------------------------------------
-- projects — public-facing project showcase, edited from admin dashboard
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(150)  NOT NULL,
    description   TEXT          NOT NULL,
    tech_stack    VARCHAR(255)  NOT NULL  COMMENT 'Comma-separated tech tags',
    github_url    VARCHAR(500)  DEFAULT NULL,
    live_url      VARCHAR(500)  DEFAULT NULL,
    image_url     VARCHAR(500)  DEFAULT NULL,
    featured      TINYINT(1)    NOT NULL DEFAULT 0,
    sort_order    INT           NOT NULL DEFAULT 0,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_featured (featured),
    INDEX idx_sort     (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- contacts — incoming messages from the public contact form
-- ----------------------------------------------------------------------------
CREATE TABLE contacts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    subject       VARCHAR(200)  NOT NULL,
    message       TEXT          NOT NULL,
    ip_address    VARCHAR(45)   DEFAULT NULL  COMMENT 'IPv4 or IPv6',
    submitted_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- admin_users — session-protected admin accounts
-- password_hash uses PHP password_hash(PASSWORD_DEFAULT) → bcrypt
-- ----------------------------------------------------------------------------
CREATE TABLE admin_users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    last_login    TIMESTAMP     NULL DEFAULT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Default admin (CHANGE PASSWORD BEFORE DEPLOYING)
-- bcrypt cost-10 hash of literal "admin123"
-- ----------------------------------------------------------------------------
INSERT INTO admin_users (username, password_hash) VALUES
('ahmed', '$2y$10$m4iGn12Dns.nqDKjuxLvV.75msEIYjsbz91eWoVO7wBRx.Y3FHY5e');

-- ----------------------------------------------------------------------------
-- Seed projects (5)
-- ----------------------------------------------------------------------------
INSERT INTO projects (title, description, tech_stack, github_url, live_url, image_url, featured, sort_order) VALUES
('Quant Portfolio Dashboard',
 'Full-stack portfolio web application built with vanilla HTML5/CSS3/JavaScript on the front and PHP/MySQL on the back. Features AJAX-driven project cards, session-protected admin dashboard, CSRF-secured contact form, and a dark Bloomberg-terminal aesthetic. The site you are reading right now.',
 'HTML5,CSS3,JavaScript,PHP,MySQL,AJAX,PDO',
 'https://github.com/ahmedrahmani/portfolio',
 NULL,
 NULL,
 1, 10),

('Forex Signal Bot (QuantConnect)',
 'Algorithmic trading strategy implemented on the QuantConnect LEAN engine. EURUSD H1 moving-average crossover with ATR-based stop-loss and dynamic position sizing. Backtested 2019-2024: +34% cumulative return, Sharpe 1.2, max drawdown 9.4%. Includes walk-forward validation harness.',
 'Python,QuantConnect,LEAN,Pandas,NumPy,Backtesting',
 'https://github.com/ahmedrahmani/forex-signal-bot',
 NULL,
 NULL,
 1, 20),

('Trading Automation Dashboard',
 'Real-time FX dashboard pulling live OANDA streaming rates over WebSocket. Candlestick chart visualization with Chart.js, signal overlay drawn on the same canvas, and a settings panel for choosing symbol/timeframe. Designed for desk-quality monitoring of personal trading bots.',
 'JavaScript,Chart.js,WebSocket,REST APIs,CSS Grid',
 'https://github.com/ahmedrahmani/fx-dashboard',
 NULL,
 NULL,
 0, 30),

('Student Grade Tracker',
 'PHP/MySQL CRUD application for managing student grades across multiple courses. Role-based access (admin / instructor / student), CSV export, GPA calculation engine, and Bootstrap-styled responsive UI. Built as a course project; later refactored to use PDO and prepared statements throughout.',
 'PHP,MySQL,HTML5,CSS3,Bootstrap,PDO',
 'https://github.com/ahmedrahmani/grade-tracker',
 NULL,
 NULL,
 0, 40),

('Vibe Coding Toolkit',
 'A growing collection of AI-assisted development tools: prompt templates for Claude and GitHub Copilot, a code snippet library indexed by language and task, and CLI scripts that automate repetitive dev workflows (git hygiene, log tailing, project scaffolding). Open source, MIT.',
 'JavaScript,Python,Markdown,CLI,Bash',
 'https://github.com/ahmedrahmani/vibe-coding-toolkit',
 NULL,
 NULL,
 0, 50);

-- ----------------------------------------------------------------------------
-- Sample contact entry (so the admin dashboard isn't empty on first run)
-- ----------------------------------------------------------------------------
INSERT INTO contacts (name, email, subject, message, ip_address) VALUES
('Sample Visitor', 'visitor@example.com', 'Loved the portfolio',
 'Hi Ahmed, just wanted to say the dark terminal aesthetic is sharp and the QuantConnect project caught my eye.',
 '127.0.0.1');

-- ============================================================================
-- DONE.
-- Verify with:  USE portfolio_db; SELECT id, title FROM projects; SELECT username FROM admin_users;
-- ============================================================================
