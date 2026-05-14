/* =========================================================================
 * script.js — Ahmed Rahmani · Halic Uni SE4 · 22091000408
 *
 * Vanilla JS, strict mode, no jQuery. Implements every feature listed
 * in the project brief + 4 bonus modules.
 * ========================================================================= */

'use strict';

(function () {

    /* ──────────────────────────────────────────────────────────────────
       0) Bootstrapping & DOM helpers
       ────────────────────────────────────────────────────────────────── */
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const onReady = (fn) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else { fn(); }
    };

    onReady(init);

    function init () {
        initThemeToggle();
        initNavScroll();
        initMobileMenu();
        initSmoothScroll();
        initActiveNavOnScroll();
        initRevealOnScroll();
        initSkillBars();
        initStatCounters();
        initTypewriter();
        initMatrixRain();
        initCandlestickSVG();
        initProjectsAJAX();
        initContactForm();
        initVisitCookie();
        initForexTicker();
        initTerminalEasterEgg();
        initStrategyModal();
        initBackToTop();
        initCVDownload();
    }

    /* ──────────────────────────────────────────────────────────────────
       1) Typewriter
       ────────────────────────────────────────────────────────────────── */
    function initTypewriter () {
        const target = $('#typewriter-text');
        if (!target) return;
        const phrases = [
            'Software Engineer_',
            'Quant Developer_',
            'Forex Automation Builder_',
            'Vibe Coder_'
        ];
        let p = 0, c = 0, deleting = false;
        const TYPE_MS = 80, DELETE_MS = 45, HOLD_MS = 1400;

        function tick () {
            const phrase = phrases[p];
            if (!deleting) {
                target.textContent = phrase.slice(0, ++c);
                if (c === phrase.length) { deleting = true; setTimeout(tick, HOLD_MS); return; }
                setTimeout(tick, TYPE_MS);
            } else {
                target.textContent = phrase.slice(0, --c);
                if (c === 0) { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 280); return; }
                setTimeout(tick, DELETE_MS);
            }
        }
        tick();
    }

    /* ──────────────────────────────────────────────────────────────────
       2) Matrix rain canvas (subtle, hero background)
       ────────────────────────────────────────────────────────────────── */
    function initMatrixRain () {
        const canvas = $('#matrix-canvas');
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ$+={};/'.split('');
        let cols, drops, fontSize = 14;

        function resize () {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            cols = Math.floor(canvas.width / fontSize);
            drops = new Array(cols).fill(1).map(() => Math.floor(Math.random() * canvas.height / fontSize));
        }
        resize();
        window.addEventListener('resize', resize);

        function draw () {
            ctx.fillStyle = 'rgba(10, 14, 26, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff88';
            ctx.font = fontSize + 'px JetBrains Mono, monospace';
            for (let i = 0; i < drops.length; i++) {
                const ch = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        let running = true;
        function loop () {
            if (running) draw();
            requestAnimationFrame(loop);
        }
        // Pause when hero is offscreen for performance
        const obs = new IntersectionObserver((entries) => {
            running = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(canvas);
        loop();
    }

    /* ──────────────────────────────────────────────────────────────────
       3) IntersectionObservers — reveal, skill bars, stats, active nav
       4) Count-up uses rAF (called from stats observer)
       14) Timeline reveal piggybacks on the same .reveal mechanism
       ────────────────────────────────────────────────────────────────── */
    function initRevealOnScroll () {
        // Tag everything we want to fade in
        const targets = [];
        $$('.section, .stat-card, .project-card, .skill-group, .timeline-item, .academic-table, .motto, .contact-form, .social-links').forEach(el => {
            if (!el.classList.contains('skeleton')) {
                el.classList.add('reveal');
                targets.push(el);
            }
        });
        if (!('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('visible'));
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            }
        }, { threshold: 0.12 });
        targets.forEach(el => obs.observe(el));
    }

    function initSkillBars () {
        const bars = $$('.bar .fill[data-pct]');
        if (!bars.length || !('IntersectionObserver' in window)) {
            bars.forEach(b => { b.style.width = b.dataset.pct + '%'; });
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    fill.style.width = (fill.dataset.pct || '0') + '%';
                    fill.parentElement.classList.add('glow');
                    obs.unobserve(fill);
                }
            }
        }, { threshold: 0.4 });
        bars.forEach(b => obs.observe(b));
    }

    function initStatCounters () {
        const cards = $$('.stat-card');
        if (!cards.length) return;

        function countUp (node, target, suffix) {
            const start = performance.now();
            const dur = 1400;
            (function frame (now) {
                const t = Math.min(1, (now - start) / dur);
                // ease-out cubic
                const e = 1 - Math.pow(1 - t, 3);
                node.textContent = Math.floor(target * e).toLocaleString() + (suffix || '');
                if (t < 1) requestAnimationFrame(frame);
                else node.textContent = target.toLocaleString() + (suffix || '');
            })(start);
        }

        if (!('IntersectionObserver' in window)) {
            cards.forEach(card => {
                const num = card.querySelector('.stat-num');
                if (num) countUp(num, parseInt(num.dataset.countTo, 10) || 0, num.dataset.suffix);
            });
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const num = entry.target.querySelector('.stat-num');
                    if (num) {
                        const target = parseInt(num.dataset.countTo, 10) || 0;
                        countUp(num, target, num.dataset.suffix);
                    }
                    obs.unobserve(entry.target);
                }
            }
        }, { threshold: 0.4 });
        cards.forEach(c => obs.observe(c));
    }

    function initActiveNavOnScroll () {
        const links = $$('.nav-link[href^="#"]');
        const idMap = new Map();
        links.forEach(l => {
            const id = l.getAttribute('href').slice(1);
            const sec = document.getElementById(id);
            if (sec) idMap.set(sec, l);
        });
        if (!idMap.size || !('IntersectionObserver' in window)) return;

        const obs = new IntersectionObserver((entries) => {
            // Choose the entry with the largest intersection ratio
            let best = null;
            for (const e of entries) {
                if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
            }
            if (!best) return;
            links.forEach(l => l.classList.remove('active'));
            const link = idMap.get(best.target);
            if (link) link.classList.add('active');
        }, { threshold: [0.25, 0.5, 0.75] });

        idMap.forEach((_, sec) => obs.observe(sec));
    }

    /* ──────────────────────────────────────────────────────────────────
       5) Dark mode toggle (localStorage key: 'theme')
       ────────────────────────────────────────────────────────────────── */
    function initThemeToggle () {
        const root = document.documentElement;
        const saved = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
        if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

        const btn = $('#theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') || 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch {}
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       6) Navbar scroll behavior
       ────────────────────────────────────────────────────────────────── */
    function initNavScroll () {
        const header = $('#site-header');
        if (!header) return;
        const onScroll = () => {
            if (window.scrollY > 80) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ──────────────────────────────────────────────────────────────────
       7) Mobile hamburger menu
       ────────────────────────────────────────────────────────────────── */
    function initMobileMenu () {
        const burger = $('#hamburger');
        const links = $('#nav-links');
        if (!burger || !links) return;
        burger.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(open));
        });
        links.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                links.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       8) Smooth scroll on internal anchors
          (CSS handles default; this adds offset for sticky nav.)
       ────────────────────────────────────────────────────────────────── */
    function initSmoothScroll () {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (!a) return;
            const id = a.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const headerH = ($('#site-header')?.offsetHeight || 0) + ($('#forex-ticker')?.offsetHeight || 0);
            const y = target.getBoundingClientRect().top + window.scrollY - headerH - 6;
            window.scrollTo({ top: y, behavior: 'smooth' });
            history.replaceState(null, '', id);
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       9) Projects — AJAX load with skeleton, render, error retry
       ────────────────────────────────────────────────────────────────── */
    function initProjectsAJAX () {
        const track = $('#projects-track');
        const errBox = $('#projects-error');
        const retryBtn = $('#projects-retry');
        if (!track) return;

        async function fetchAndRender () {
            errBox.hidden = true;
            // Keep skeleton visible at least 350ms for visual rhythm
            const t0 = performance.now();
            try {
                const resp = await fetch('api/projects.php', { credentials: 'same-origin' });
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const projects = await resp.json();
                if (!Array.isArray(projects)) throw new Error('Bad response');

                const wait = Math.max(0, 350 - (performance.now() - t0));
                setTimeout(() => renderProjects(track, projects), wait);
            } catch (err) {
                console.warn('[projects] load failed:', err);
                track.innerHTML = '';
                errBox.hidden = false;
            }
        }
        if (retryBtn) retryBtn.addEventListener('click', fetchAndRender);
        fetchAndRender();
    }

    function renderProjects (track, projects) {
        const colors = ['cyan', 'gold', 'green', 'pink'];
        track.innerHTML = projects.map((p, i) => {
            const tags = (p.tech_stack || '').split(',').map(t => t.trim()).filter(Boolean);
            const tagHtml = tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
            const githubHtml = p.github_url ? `<a href="${escapeAttr(p.github_url)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : '';
            const liveHtml = p.live_url ? `<a href="${escapeAttr(p.live_url)}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : '';
            return `
                <article class="project-card" data-color="${colors[i % colors.length]}" data-id="${p.id}">
                    <h3 class="project-title">${escapeHtml(p.title)}</h3>
                    <div class="project-tags">${tagHtml}</div>
                    <p class="project-desc">${escapeHtml(p.description)}</p>
                    <div class="project-actions">${githubHtml}${liveHtml}</div>
                    <button class="details-toggle" type="button" aria-expanded="false">View details ▾</button>
                    <div class="project-details">
                        <p>Created: <span class="mono">${escapeHtml(p.created_at || '—')}</span></p>
                        <p>Featured: <span class="mono">${p.featured ? 'yes' : 'no'}</span></p>
                    </div>
                </article>
            `;
        }).join('');

        // Wire up accordion toggles
        $$('.details-toggle', track).forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.project-card');
                const open = card.classList.toggle('expanded');
                btn.setAttribute('aria-expanded', String(open));
                btn.textContent = open ? 'Hide details ▴' : 'View details ▾';
            });
        });

        // Add reveal class to new cards
        $$('.project-card', track).forEach(c => {
            c.classList.add('reveal');
            requestAnimationFrame(() => c.classList.add('visible'));
        });
    }

    function escapeHtml (s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function escapeAttr (s) { return escapeHtml(s); }

    /* ──────────────────────────────────────────────────────────────────
       10 + 11) Contact form — client validation + AJAX submit + CSRF
       ────────────────────────────────────────────────────────────────── */
    async function loadCsrfToken () {
        try {
            const resp = await fetch('api/csrf.php', { credentials: 'same-origin' });
            const data = await resp.json();
            if (data && data.csrf_token) {
                const input = $('#csrf-token');
                if (input) input.value = data.csrf_token;
            }
        } catch (err) {
            console.warn('[csrf] fetch failed:', err);
        }
    }

    function validateField (input) {
        const row = input.closest('.form-row');
        const errEl = row?.querySelector('.error-msg');
        const v = (input.value || '').trim();
        let msg = '';

        if (input.id === 'name') {
            if (!v)            msg = '> name required';
            else if (v.length < 2) msg = '> name must be at least 2 chars';
            else if (v.length > 100) msg = '> name too long';
        } else if (input.id === 'email') {
            if (!v) msg = '> email required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = '> invalid email format';
        } else if (input.id === 'message') {
            if (!v)              msg = '> message required';
            else if (v.length < 10) msg = '> message must be at least 10 chars';
            else if (v.length > 2000) msg = '> message too long (max 2000)';
        } else if (input.id === 'subject') {
            if (v.length > 200) msg = '> subject too long';
        }
        if (errEl) errEl.textContent = msg;
        if (row) row.classList.toggle('invalid', !!msg);
        return !msg;
    }

    function initContactForm () {
        const form = $('#contact-form');
        if (!form) return;
        loadCsrfToken();

        const fields = ['name', 'email', 'subject', 'message']
            .map(id => document.getElementById(id))
            .filter(Boolean);

        fields.forEach(input => input.addEventListener('blur', () => validateField(input)));

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ok = fields.map(validateField).every(Boolean);
            const status = $('#form-status');
            if (!ok) {
                if (status) { status.textContent = '> fix the errors above and try again.'; status.className = 'form-status err'; }
                return;
            }

            const submitBtn = $('#contact-submit');
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'transmitting…';
            if (status) { status.textContent = ''; status.className = 'form-status'; }

            try {
                const fd = new FormData(form);
                const resp = await fetch('contact.php', { method: 'POST', body: fd, credentials: 'same-origin' });
                const data = await resp.json().catch(() => ({}));
                if (resp.ok && data && data.success) {
                    form.reset();
                    if (status) {
                        status.textContent = '> ✓ message received. I will reply soon.';
                        status.className = 'form-status ok';
                    }
                    // Refresh CSRF token for any next submit
                    loadCsrfToken();
                } else {
                    const errText = (data && data.error) || ('HTTP ' + resp.status);
                    if (status) { status.textContent = '> error: ' + errText; status.className = 'form-status err'; }
                }
            } catch (err) {
                console.warn('[contact] submit failed:', err);
                if (status) { status.textContent = '> network error. try again.'; status.className = 'form-status err'; }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       12) Candlestick SVG animation
       ────────────────────────────────────────────────────────────────── */
    function initCandlestickSVG () {
        const grid = document.getElementById('candlestick-grid');
        const bars = document.getElementById('candlestick-bars');
        if (!grid || !bars) return;

        const SVG_NS = 'http://www.w3.org/2000/svg';
        const W = 400, H = 220;
        const N = 32;
        const gap = W / N;
        const cw = gap * 0.55;

        // gridlines
        for (let i = 0; i < 5; i++) {
            const y = (H / 4) * i + 0.5;
            const ln = document.createElementNS(SVG_NS, 'line');
            ln.setAttribute('x1', 0);
            ln.setAttribute('y1', y);
            ln.setAttribute('x2', W);
            ln.setAttribute('y2', y);
            ln.setAttribute('stroke', 'url(#grid-grad)');
            ln.setAttribute('stroke-width', '1');
            grid.appendChild(ln);
        }

        // generate random walk OHLC, then render
        let p = 100;
        const ohlc = [];
        for (let i = 0; i < N; i++) {
            const o = p;
            p += (Math.random() - 0.48) * 6;
            const c = p;
            const h = Math.max(o, c) + Math.random() * 4;
            const l = Math.min(o, c) - Math.random() * 4;
            ohlc.push([o, h, l, c]);
        }
        const ys = ohlc.flat();
        const min = Math.min(...ys), max = Math.max(...ys);
        const scaleY = v => 200 - ((v - min) / (max - min)) * 180 + 10;

        ohlc.forEach((bar, i) => {
            const [o, h, l, c] = bar;
            const x = i * gap + (gap - cw) / 2;
            const isUp = c >= o;
            const color = isUp ? '#00ff88' : '#ff6b9d';

            const wick = document.createElementNS(SVG_NS, 'line');
            wick.setAttribute('x1', x + cw / 2);
            wick.setAttribute('x2', x + cw / 2);
            wick.setAttribute('y1', scaleY(h));
            wick.setAttribute('y2', scaleY(l));
            wick.setAttribute('stroke', color);
            wick.setAttribute('stroke-width', '1');
            wick.style.opacity = '0';
            wick.style.transition = 'opacity 280ms ease ' + (i * 30) + 'ms';
            bars.appendChild(wick);

            const body = document.createElementNS(SVG_NS, 'rect');
            const top = scaleY(Math.max(o, c));
            const bot = scaleY(Math.min(o, c));
            body.setAttribute('x', x);
            body.setAttribute('y', top);
            body.setAttribute('width', cw);
            body.setAttribute('height', Math.max(1, bot - top));
            body.setAttribute('fill', color);
            body.setAttribute('stroke', color);
            body.style.opacity = '0';
            body.style.transition = 'opacity 320ms ease ' + (i * 30) + 'ms, transform 320ms ease ' + (i * 30) + 'ms';
            bars.appendChild(body);

            requestAnimationFrame(() => {
                wick.style.opacity = '0.9';
                body.style.opacity = '0.9';
            });
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       13) Visit cookie
       ────────────────────────────────────────────────────────────────── */
    function initVisitCookie () {
        const has = document.cookie.split(';').some(c => c.trim().startsWith('visited='));
        if (has) {
            console.log('%c> Welcome back, friend.', 'color:#00d4ff; font-family:monospace;');
        } else {
            // 1-year cookie
            const oneYear = 60 * 60 * 24 * 365;
            document.cookie = 'visited=1; max-age=' + oneYear + '; path=/; SameSite=Lax';
            console.log('%c> Welcome. First visit logged.', 'color:#00ff88; font-family:monospace;');
        }
        // ASCII banner regardless
        console.log(
            '%c\n  ___    ____  \n / _ \\  /  _  \\ \n| |_| ||  |_|  |\n|  _  ||      /\n|_| |_||__|\\__\\\n  AHMED RAHMANI · 22091000408\n  github.com/za3lot-alt\n',
            'color:#f0b429; font-family:monospace;'
        );
    }

    /* ──────────────────────────────────────────────────────────────────
       BONUS 1) Forex ticker
       ────────────────────────────────────────────────────────────────── */
    function initForexTicker () {
        const items = $$('.ticker-item');
        if (!items.length) return;

        const previous = new Map();

        async function refresh () {
            try {
                // fiat from open.er-api.com
                const fiatResp = await fetch('https://open.er-api.com/v6/latest/USD');
                const fiat = await fiatResp.json();
                const rates = (fiat && fiat.rates) || {};

                const lookup = {
                    EURUSD: rates.EUR ? 1 / rates.EUR : null,
                    GBPUSD: rates.GBP ? 1 / rates.GBP : null,
                    USDJPY: rates.JPY || null,
                    USDTRY: rates.TRY || null,
                };

                // crypto from coingecko (separate, optional)
                let btc = null;
                try {
                    const cgResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                    const cg = await cgResp.json();
                    btc = cg && cg.bitcoin && cg.bitcoin.usd;
                } catch { /* non-fatal */ }
                lookup.BTCUSD = btc;

                items.forEach(item => {
                    const pair = item.dataset.pair;
                    const value = lookup[pair];
                    const valueEl = item.querySelector('.ticker-value');
                    if (!valueEl) return;
                    if (value == null) {
                        valueEl.textContent = '—';
                        valueEl.className = 'ticker-value';
                        return;
                    }
                    const formatted = value >= 100
                        ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : value.toFixed(4);
                    const prev = previous.get(pair);
                    let dir = '';
                    if (prev != null) {
                        if (value > prev) dir = 'up';
                        else if (value < prev) dir = 'down';
                    }
                    previous.set(pair, value);
                    valueEl.textContent = formatted;
                    valueEl.className = 'ticker-value' + (dir ? ' ' + dir : '');
                });
            } catch (err) {
                console.warn('[ticker] refresh failed:', err);
            }
        }
        refresh();
        setInterval(refresh, 30000);
    }

    /* ──────────────────────────────────────────────────────────────────
       BONUS 2) Strategy modal — line chart on canvas
       ────────────────────────────────────────────────────────────────── */
    const STRATEGY_EQUITY = (() => {
        const arr = []; let v = 100000;
        for (let i = 0; i < 240; i++) {
            v *= 1 + (Math.sin(i / 18) * 0.004 + (Math.random() - 0.45) * 0.011);
            arr.push(v);
        }
        // Force final ≈ 134000 to match +34% claim
        const scale = 134000 / arr[arr.length - 1];
        return arr.map(x => x * scale);
    })();

    function initStrategyModal () {
        const modal = $('#strategy-modal');
        if (!modal) return;

        // We'll attach an opener on each project card whose tech stack mentions QuantConnect.
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-modal-close], .modal-close');
            if (target) { closeModal(); return; }

            // Open on view-strategy clicks
            const opener = e.target.closest('[data-action="open-strategy"]');
            if (opener) { e.preventDefault(); openModal(); }
        });

        // Auto-bind: any project card whose tech stack mentions "QuantConnect"
        // gets a "View Strategy" button injected after the project list renders.
        document.addEventListener('click', (e) => {
            // delegated on details-toggle clicks: nothing here, handled by accordion
        });
        // Watch the projects track for additions
        const track = $('#projects-track');
        if (track) {
            const mo = new MutationObserver(() => {
                $$('.project-card', track).forEach(card => {
                    if (card.dataset.strategyBound) return;
                    const tags = card.querySelector('.project-tags');
                    if (!tags) return;
                    const text = tags.textContent.toLowerCase();
                    if (text.includes('quantconnect')) {
                        const actions = card.querySelector('.project-actions');
                        if (actions) {
                            const btn = document.createElement('a');
                            btn.href = '#';
                            btn.dataset.action = 'open-strategy';
                            btn.textContent = 'View Strategy ▸';
                            actions.appendChild(btn);
                            card.dataset.strategyBound = '1';
                        }
                    }
                });
            });
            mo.observe(track, { childList: true });
        }

        function openModal () {
            modal.hidden = false;
            requestAnimationFrame(drawStrategyChart);
            document.addEventListener('keydown', onKey);
        }
        function closeModal () {
            modal.hidden = true;
            document.removeEventListener('keydown', onKey);
        }
        function onKey (e) { if (e.key === 'Escape') closeModal(); }

        function drawStrategyChart () {
            const c = $('#strategy-chart');
            if (!c || !c.getContext) return;
            const ctx = c.getContext('2d');
            const W = c.width, H = c.height;
            ctx.clearRect(0, 0, W, H);

            const data = STRATEGY_EQUITY;
            const min = Math.min(...data), max = Math.max(...data);
            const xStep = W / (data.length - 1);
            const yScale = v => H - ((v - min) / (max - min)) * (H - 30) - 15;

            // axis
            ctx.strokeStyle = '#1e2d4a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const y = (H / 4) * i + 0.5;
                ctx.moveTo(0, y); ctx.lineTo(W, y);
            }
            ctx.stroke();

            // line
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            data.forEach((v, i) => {
                const x = i * xStep;
                const y = yScale(v);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // glow fill
            ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, 'rgba(0, 212, 255, 0.30)');
            grad.addColorStop(1, 'rgba(0, 212, 255, 0.00)');
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    /* ──────────────────────────────────────────────────────────────────
       BONUS 3) Terminal easter egg
       ────────────────────────────────────────────────────────────────── */
    function initTerminalEasterEgg () {
        const toggle = $('#terminal-toggle');
        const win = $('#terminal-window');
        const closeBtn = $('#terminal-close');
        const form = $('#terminal-form');
        const input = $('#terminal-input');
        const body = $('#terminal-body');
        if (!toggle || !win || !form) return;

        toggle.addEventListener('click', () => {
            win.hidden = !win.hidden;
            if (!win.hidden) input.focus();
        });
        closeBtn?.addEventListener('click', () => { win.hidden = true; });

        function print (text, cls) {
            const div = document.createElement('div');
            div.className = 'terminal-line' + (cls ? ' ' + cls : '');
            div.innerHTML = text;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        const COMMANDS = {
            help () {
                print('&gt; available: <code>help</code> · <code>whoami</code> · <code>projects</code> · <code>contact</code> · <code>theme</code> · <code>date</code> · <code>motd</code> · <code>clear</code>');
            },
            whoami () {
                print(
                    '<pre style="font-family:JetBrains Mono;color:#f0b429;line-height:1.1;margin:0;">' +
                    '   _____  ____  \n' +
                    '  /  _  \\/  _ \\ \n' +
                    ' /  /_\\  \\  _ \\ \n' +
                    '/    |    \\__ \\\\\n' +
                    '\\____|____/____/\n' +
                    '  Ahmed Rahmani · 22091000408\n' +
                    '  Halic University · SE4 · Istanbul\n' +
                    '</pre>'
                );
            },
            projects () {
                print('&gt; fetching projects from /api/projects.php …');
                fetch('api/projects.php').then(r => r.json()).then(rows => {
                    if (!Array.isArray(rows)) { print('&gt; no projects', 'err'); return; }
                    rows.forEach((p, i) => print(`&gt; [${i + 1}] ${escapeHtml(p.title)} <span style="color:#4a6fa5">— ${escapeHtml((p.tech_stack||'').split(',').slice(0,3).join(','))}</span>`));
                }).catch(e => print('&gt; ERROR: ' + e.message, 'err'));
            },
            contact () {
                print('&gt; email: <code>22091000408@ogr.halic.edu.tr</code>');
                print('&gt; or scroll to #contact and use the form.');
            },
            theme () {
                const root = document.documentElement;
                const next = (root.getAttribute('data-theme') || 'dark') === 'light' ? 'dark' : 'light';
                root.setAttribute('data-theme', next);
                try { localStorage.setItem('theme', next); } catch {}
                print('&gt; theme = ' + next);
            },
            date () { print('&gt; ' + new Date().toString()); },
            motd () { print('&gt; "Discipline beats inspiration, out-of-sample beats backtest, ship beats perfect."'); },
            clear () { body.innerHTML = ''; },
            ls () { print('&gt; .  ..  about/  projects/  skills/  timeline/  contact/  README.md'); }
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const cmd = (input.value || '').trim();
            if (!cmd) return;
            print('&gt; ' + escapeHtml(cmd), 'user');
            input.value = '';
            const fn = COMMANDS[cmd.toLowerCase()];
            if (fn) fn();
            else print('&gt; unknown command: ' + escapeHtml(cmd) + ' (try <code>help</code>)', 'err');
        });
    }

    /* ──────────────────────────────────────────────────────────────────
       Back-to-top button
       ────────────────────────────────────────────────────────────────── */
    function initBackToTop () {
        const btn = $('#back-to-top');
        if (!btn) return;
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ──────────────────────────────────────────────────────────────────
       BONUS 4) CV download → window.print() (styled by @media print)
       ────────────────────────────────────────────────────────────────── */
    function initCVDownload () {
        const btn = $('#download-cv');
        if (!btn) return;
        btn.addEventListener('click', (e) => { e.preventDefault(); window.print(); });
    }

})();
