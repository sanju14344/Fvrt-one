/**
 * js/main.js — Jayaprakash's Birthday Universe 🤍
 * Personalised for JP / Potta / Thangameyyy / En Thambi / Uyiree / Fvrt One 🤍
 */

/* ================================================================
   UTILITIES
================================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');
const cfg = window.BirthdayConfig || {};

/* ================================================================
   STAR CANVAS (background cosmic layer)
================================================================ */
function hexToRgba(hex, alpha) {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16) || 0xffffff;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function initStarCanvas() {
  const canvas = $('#starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shooters = [];
  let nebulaClouds = [];
  let raf;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  const STAR_COLORS = [
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    '#dde4ff', '#c8b5ff', '#fffae8', '#cceeff', '#f5d78e'
  ];

  function createStars() {
    const base = prefersReduced ? 60 : Math.min(400, Math.floor(window.innerWidth * window.innerHeight / 3200));
    stars = [];
    // Layer 1: Distant tiny dim stars
    for (let i = 0; i < base * 0.5; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 0.5 + 0.1,
        alpha: Math.random() * 0.35 + 0.05,
        twinkleSpeed: Math.random() * 0.004 + 0.001,
        twinkleDir: Math.random() < 0.5 ? 1 : -1,
        color: '#aaccff',
        layer: 0
      });
    }
    // Layer 2: Mid stars
    for (let i = 0; i < base * 0.35; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.0 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.007 + 0.003,
        twinkleDir: Math.random() < 0.5 ? 1 : -1,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        layer: 1
      });
    }
    // Layer 3: Close bright stars with glow
    for (let i = 0; i < base * 0.15; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.8 + 0.55,
        twinkleSpeed: Math.random() * 0.012 + 0.005,
        twinkleDir: Math.random() < 0.5 ? 1 : -1,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        glowRadius: Math.random() * 6 + 3,
        layer: 2
      });
    }

    // Nebula soft cloud patches
    if (!prefersReduced) {
      nebulaClouds = [
        { x: canvas.width * 0.15, y: canvas.height * 0.3, rx: canvas.width * 0.28, ry: canvas.height * 0.22, r: 72, g: 57, b: 180, a: 0.045, drift: 0 },
        { x: canvas.width * 0.8,  y: canvas.height * 0.6, rx: canvas.width * 0.24, ry: canvas.height * 0.18, r: 50, g: 160, b: 220, a: 0.03, drift: Math.PI },
        { x: canvas.width * 0.5,  y: canvas.height * 0.8, rx: canvas.width * 0.35, ry: canvas.height * 0.15, r: 200, g: 180, b: 100, a: 0.025, drift: Math.PI / 2 },
        { x: canvas.width * 0.65, y: canvas.height * 0.15, rx: canvas.width * 0.2,  ry: canvas.height * 0.12, r: 118, g: 87, b: 255, a: 0.05, drift: Math.PI * 1.5 }
      ];
    }
  }

  function spawnShooter() {
    if (prefersReduced) return;
    const fromRight = Math.random() < 0.4;
    const x = fromRight ? canvas.width * (0.6 + Math.random() * 0.4) : Math.random() * canvas.width * 0.5;
    const y = Math.random() * canvas.height * 0.45;
    const angle = fromRight
      ? (Math.random() * 20 + 150) * Math.PI / 180
      : (Math.random() * 30 + 25) * Math.PI / 180;
    const speed = Math.random() * 10 + 7;
    const baseColor = Math.random() < 0.6 ? '255,255,255' : (Math.random() < 0.5 ? '180,160,255' : '200,220,255');
    shooters.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      len: Math.random() * 120 + 70,
      baseColor,
      width: Math.random() * 1.5 + 0.8
    });
  }

  let shooterTimer = 0;
  let nebulaTime = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nebulaTime += 0.0008;

    // Draw nebula clouds (subtle glowing clouds behind stars)
    if (!prefersReduced && nebulaClouds.length) {
      for (const nc of nebulaClouds) {
        const ox = Math.sin(nebulaTime + nc.drift) * 12;
        const oy = Math.cos(nebulaTime * 0.7 + nc.drift) * 8;
        const grad = ctx.createRadialGradient(nc.x + ox, nc.y + oy, 0, nc.x + ox, nc.y + oy, Math.max(nc.rx, nc.ry));
        grad.addColorStop(0, `rgba(${nc.r},${nc.g},${nc.b},${nc.a * 2.5})`);
        grad.addColorStop(0.4, `rgba(${nc.r},${nc.g},${nc.b},${nc.a})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.scale(1, nc.ry / nc.rx);
        ctx.beginPath();
        ctx.arc(nc.x + ox, (nc.y + oy) * (nc.rx / nc.ry), nc.rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw stars
    for (const s of stars) {
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      const max = s.layer === 2 ? 0.98 : s.layer === 1 ? 0.85 : 0.45;
      const min = s.layer === 2 ? 0.35 : s.layer === 1 ? 0.12 : 0.03;
      if (s.alpha > max) { s.alpha = max; s.twinkleDir = -1; }
      if (s.alpha < min) { s.alpha = min; s.twinkleDir = 1; }

      ctx.save();
      // Glow for bright stars
      if (s.layer === 2 && s.glowRadius && !prefersReduced) {
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glowRadius);
        grd.addColorStop(0, hexToRgba(s.color, s.alpha * 0.75));
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw shooting stars
    if (!prefersReduced) {
      shooterTimer++;
      if (shooterTimer > 120 && Math.random() < 0.035) {
        spawnShooter();
        shooterTimer = 0;
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        ctx.save();
        const tailLen = sh.len * sh.life;
        const grad = ctx.createLinearGradient(
          sh.x, sh.y,
          sh.x - sh.vx * (tailLen / (Math.abs(sh.vx) + 0.01)),
          sh.y - sh.vy * (tailLen / (Math.abs(sh.vy) + 0.01))
        );
        grad.addColorStop(0, `rgba(${sh.baseColor},${sh.life * 0.95})`);
        grad.addColorStop(0.3, `rgba(${sh.baseColor},${sh.life * 0.4})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = sh.width || 1.6;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(
          sh.x - sh.vx * (tailLen / (Math.abs(sh.vx) + 0.01)),
          sh.y - sh.vy * (tailLen / (Math.abs(sh.vy) + 0.01))
        );
        ctx.stroke();
        ctx.restore();
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.018;
        if (sh.life <= 0 || sh.x < -100 || sh.x > canvas.width + 100 || sh.y > canvas.height + 100) {
          shooters.splice(i, 1);
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize();
  createStars();
  draw();
}

/* ================================================================
   FLOATING WHITE HEARTS LAYER 🤍
================================================================ */
function initFloatingHearts() {
  const container = $('#floatingHeartsContainer');
  if (!container) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = Math.random() < 0.85 ? '🤍' : '❤️';
    heart.style.left = Math.random() * 100 + '%';
    const size = Math.random() * 0.8 + 0.8;
    heart.style.fontSize = size + 'rem';
    const duration = Math.random() * 10 + 12;
    heart.style.animationDuration = duration + 's';
    heart.style.opacity = (Math.random() * 0.35 + 0.25).toString();

    container.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }

  // Initial batch
  for (let i = 0; i < 6; i++) {
    setTimeout(spawnHeart, i * 1500);
  }
  // Recurring gentle spawn
  setInterval(spawnHeart, 3000);
}

/* ================================================================
   SECTION NAVIGATION
================================================================ */
let currentSection = 'countdown';

function showSection(id) {
  $$('.section').forEach(sec => {
    sec.classList.remove('active-section');
    sec.style.display = 'none';
  });
  const target = $(`#${id}`);
  if (target) {
    target.style.display = 'flex';
    target.classList.add('active-section');
    target.scrollTop = 0;
    currentSection = id;
  }
  $$('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === id);
  });
}

function initNavigation() {
  // Destination and Hub cards
  document.addEventListener('click', e => {
    const targetBtn = e.target.closest('[data-target]');
    if (!targetBtn) return;
    const targetId = targetBtn.dataset.target;
    if (targetId) {
      showSection(targetId);
      onSectionEnter(targetId);
      closeMobileMenu();
    }
  });

  // Nav home — in universe, navigates to nicknames
  const navHome = $('#navHome');
  if (navHome) {
    navHome.addEventListener('click', () => {
      showSection('nicknames');
      onSectionEnter('nicknames');
      closeMobileMenu();
    });
  }

  // Mobile menu
  const toggle = $('#navMenuToggle');
  const navLinks = $('#navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Entrance Countdown Hero Button (shown once unlocked on/after birthday)
  const cdEnterBtn = $('#countdownEnterBtn');
  if (cdEnterBtn) {
    cdEnterBtn.addEventListener('click', () => {
      spawnWhiteHeartBurst(cdEnterBtn);
      setTimeout(() => {
        playCinematicIntro();
      }, 250);
    });
  }

  // Creator Skip Button (ONLY available on desktop to bypass the lock)
  const creatorSkipBtn = $('#creatorSkipBtn');
  if (creatorSkipBtn) {
    creatorSkipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      spawnWhiteHeartBurst(creatorSkipBtn);
      if (cdInterval) {
        clearInterval(cdInterval);
        cdInterval = null;
      }
      playCinematicIntro();
    });
  }
}

function closeMobileMenu() {
  const navLinks = $('#navLinks');
  const toggle = $('#navMenuToggle');
  if (navLinks) navLinks.classList.remove('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function onSectionEnter(id) {
  if (id === 'countdown') startCountdown();
  if (id === 'letter') initLetter();
  if (id === 'loveStory') initLoveStory();
  if (id === 'surprises') initSurprises();
  if (id === 'final') initFinal();
  if (id === 'gallery') initGallery();
}

/* ================================================================
   SECTION 1 — CINEMATIC INTRODUCTION
================================================================ */
function typeText(el, text, speed = 36) {
  return new Promise(resolve => {
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      if (el.dataset.fastForward === 'true') {
        el.textContent = text;
        clearInterval(iv);
        resolve();
        return;
      }
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(iv);
        setTimeout(resolve, 400);
      }
    }, speed);
  });
}

async function playCinematicIntro(onComplete) {
  const overlay   = $('#introOverlay');
  const line1     = $('#introLine1');
  const fvrtEl    = $('#introFvrt');
  const line2     = $('#introLine2');
  const enterBtn  = $('#enterBtn');

  if (!overlay) return;

  // Immediately stop countdown and hide it completely
  if (cdInterval) {
    clearInterval(cdInterval);
    cdInterval = null;
  }
  const cd = $('#countdown');
  if (cd) {
    cd.classList.remove('active-section');
    cd.style.display = 'none';
  }

  // Set nicknames ready behind the overlay so countdown never shows
  showSection('nicknames');
  onSectionEnter('nicknames');

  overlay.classList.remove('intro-fadeout');
  overlay.style.opacity = '';
  show(overlay); // removes .hidden → :not(.hidden) → display:flex

  // Fade in after a tick
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('intro-visible');
    });
  });

  if (line1) {
    line1.textContent = '';
    delete line1.dataset.fastForward;
  }
  if (fvrtEl) {
    fvrtEl.textContent = '';
    fvrtEl.classList.remove('visible');
  }
  if (line2) {
    line2.textContent = '';
    delete line2.dataset.fastForward;
  }
  if (enterBtn) enterBtn.classList.remove('visible');

  const msgs = cfg.introMessages || [
    "Some people become a part of our universe without even realizing it.",
    "MY FVRT ONE 🤍",
    "A little universe, created just for you."
  ];

  // Optional tap anywhere to fast-forward greeting
  const handleFastForward = (e) => {
    if (e.target.closest('#enterBtn')) return;
    if (line1) line1.dataset.fastForward = 'true';
    if (line2) line2.dataset.fastForward = 'true';
    if (fvrtEl) {
      fvrtEl.textContent = msgs[1] || 'MY FVRT ONE 🤍';
      fvrtEl.classList.add('visible');
    }
    if (enterBtn) enterBtn.classList.add('visible');
  };
  overlay.addEventListener('click', handleFastForward, { once: false });

  // 1. First line typing
  await new Promise(r => setTimeout(r, 350));
  await typeText(line1, msgs[0] || '');
  await new Promise(r => setTimeout(r, 250));

  // 2. Reveal "MY FVRT ONE 🤍"
  if (fvrtEl) {
    fvrtEl.textContent = msgs[1] || 'MY FVRT ONE 🤍';
    fvrtEl.classList.add('visible');
    spawnWhiteHeartBurst(fvrtEl);
  }
  await new Promise(r => setTimeout(r, 550));

  // 3. Third line typing
  if (msgs[2]) {
    await typeText(line2, msgs[2]);
  }

  // 4. Reveal Enter button
  await new Promise(r => setTimeout(r, 300));
  if (enterBtn) enterBtn.classList.add('visible');

  function enterUniverse() {
    overlay.removeEventListener('click', handleFastForward);
    document.body.classList.add('universe-entered');
    const cdEl = $('#countdown');
    if (cdEl) {
      cdEl.classList.remove('active-section');
      cdEl.style.display = 'none';
    }
    showSection('nicknames');
    onSectionEnter('nicknames');

    overlay.classList.remove('intro-visible');
    overlay.classList.add('intro-fadeout');
    setTimeout(() => {
      hide(overlay);
      overlay.classList.remove('intro-fadeout');
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, 450);
  }

  if (enterBtn) {
    enterBtn.onclick = (e) => {
      e.stopPropagation();
      spawnWhiteHeartBurst(enterBtn);
      setTimeout(enterUniverse, 250);
    };
  }
}

async function runIntro() {
  const overlay = $('#introOverlay');

  // Entrance page is Countdown timer!
  if (cfg.showIntro === false) {
    hide(overlay);
    show($('#mainApp'));
    showSection('countdown');
    startCountdown();
    initMusicCtrl();
    return;
  }

  // If showIntro was true, play cinematic intro
  playCinematicIntro(() => {
    showSection('nicknames');
    onSectionEnter('nicknames');
  });
}

/* ================================================================
   PARTICLE & HEART BURSTS 🤍
=============================================================== */
function spawnWhiteHeartBurst(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const symbols = ['🤍', '✨', '🤍', '✦', '❤️'];

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'heart-burst';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * 100 + 40;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--tx2', `${Math.cos(angle) * (dist + 30)}px`);
    p.style.left = cx + 'px';
    p.style.top  = cy + 'px';
    p.style.fontSize = (Math.random() * 0.8 + 1) + 'rem';
    p.style.animationDelay = (i * 0.04) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

/* ================================================================
   SECTION 3 — BIRTHDAY COUNTDOWN (October 18, 2026)
================================================================ */
let cdInterval = null;

function startCountdown() {
  if (cdInterval) clearInterval(cdInterval);

  const month = cfg.birthdayMonth || 10;
  const day   = cfg.birthdayDay   || 18;
  const year  = cfg.birthdayYear  || 2026;

  // Build target date string in Asia/Kolkata (IST = UTC+5:30)
  // Target: 18/10/2026 Sunday 00:00:00 (12:00 AM midnight)
  const padded = n => String(n).padStart(2, '0');
  const targetStr = `${year}-${padded(month)}-${padded(day)}T00:00:00+05:30`;
  const target = new Date(targetStr);

  const eyebrow  = $('#cdEyebrow');
  const title    = $('#cdTitle');
  const sub      = $('#cdSubtext');
  const display  = $('#countdownDisplay');
  const lockCard = $('#countdownLockCard');
  const heroCta  = $('#countdownHeroCta');
  const bday     = $('#birthdayMsg');
  const post     = $('#postBdayMsg');

  function tick() {
    const now  = new Date();
    const diff = target - now;

    if (diff > 0) {
      // ── LOCKED STATE (BEFORE 18/10/2026 SUNDAY 12:00 AM) ──
      if (eyebrow) eyebrow.textContent = '✦ TIME IS PRECIOUS ✦';
      if (title)   title.textContent   = 'Birthday Countdown';
      if (sub)     sub.textContent     = 'Counting down to 18/10/2026 Sunday for JP 🤍';

      if (display) show(display);
      if (lockCard) show(lockCard);
      if (heroCta) hide(heroCta);
      if (bday) hide(bday);
      if (post) hide(post);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      const elD = $('#cdDays');
      const elH = $('#cdHours');
      const elM = $('#cdMins');
      const elS = $('#cdSecs');

      if (elD) elD.textContent = padded(d);
      if (elH) elH.textContent = padded(h);
      if (elM) elM.textContent = padded(m);
      if (elS) elS.textContent = padded(s);
    } else {
      // ── UNLOCKED STATE (18/10/2026 SUNDAY 12:00 AM ONWARDS) ──
      if (eyebrow) eyebrow.textContent = '✦ THE STARS HAVE ALIGNED ✦';
      if (title)   title.textContent   = "IT'S UR DAY JP! 🤍";
      if (sub)     sub.textContent     = '18/10/2026 Sunday • Your Universe Has Unlocked ✨';

      if (display) hide(display);
      if (lockCard) hide(lockCard);
      if (heroCta) show(heroCta);
      if (bday) show(bday);
      if (post) show(post);

      if (cdInterval) clearInterval(cdInterval);
    }
  }

  tick();
  cdInterval = setInterval(tick, 1000);
}

/* ================================================================
   SECTION 4 — A LETTER FOR JP
================================================================ */
let letterInitialized = false;
let letterOpened = false;

function initLetter() {
  const envelope       = $('#envelope');
  const envSeal        = $('#envSeal');
  const envelopeScene  = $('#envelopeScene');
  const letterView     = $('#letterView');
  const letterBody     = $('#letterBody');
  const keepBtn        = $('#keepLetterBtn');
  const refoldBtn      = $('#refoldLetterBtn');

  if (letterInitialized) return;
  letterInitialized = true;

  if (envelope) {
    const openEnvelope = () => {
      if (letterOpened) return;
      letterOpened = true;

      // Phase 1: Wax seal pops, flap starts 3D flip upward
      envelope.classList.add('opening');
      spawnWhiteHeartBurst(envSeal || envelope);

      // Phase 2: Letter paper sheet slides out upward (handled by CSS transition at 0.3s)
      // Phase 3: Transition to full parchment letter view
      setTimeout(() => {
        if (envelopeScene) {
          envelopeScene.classList.add('scene-fade-out');
        }

        setTimeout(() => {
          if (envelopeScene) {
            envelopeScene.style.display = 'none';
          }
          if (letterView) {
            show(letterView);
            letterView.classList.remove('hidden');
            letterView.classList.add('unfolding');
            letterView.setAttribute('aria-hidden', 'false');
          }

          if (letterBody) {
            const raw = cfg.letterContent || '';
            const paras = raw.split('\n\n').filter(p => p.trim());
            letterBody.innerHTML = '';
            
            paras.forEach((para, idx) => {
              const p = document.createElement('p');
              p.style.opacity = '0';
              p.style.transform = 'translateY(12px)';
              p.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
              p.innerHTML = para.replace(/\n/g, '<br/>');
              letterBody.appendChild(p);

              setTimeout(() => {
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
              }, 150 + idx * 280);
            });
          }
        }, 450);
      }, 1150);
    };

    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('touchstart', e => {
      // Allows immediate touch response on mobile
      if (!letterOpened) {
        e.preventDefault();
        openEnvelope();
      }
    }, { passive: false });

    envelope.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }

  if (refoldBtn) {
    refoldBtn.addEventListener('click', () => {
      letterOpened = false;
      if (letterView) {
        hide(letterView);
        letterView.classList.remove('unfolding');
        letterView.setAttribute('aria-hidden', 'true');
      }
      if (envelopeScene) {
        envelopeScene.style.display = 'flex';
        void envelopeScene.offsetWidth; // force reflow
        envelopeScene.classList.remove('scene-fade-out');
      }
      if (envelope) {
        envelope.classList.remove('opening', 'open');
      }
      if (envelopeScene) {
        envelopeScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (keepBtn) {
    keepBtn.addEventListener('click', () => {
      spawnWhiteHeartBurst(keepBtn);
    });
  }
}

/* ================================================================
   SECTION 5 — A LITTLE WISH FOR YOUR LOVE STORY 🤍
================================================================ */
let loveStoryInitialized = false;

function initLoveStory() {
  const wishBtn   = $('#wishHeartBtn');
  const reveal    = $('#wishSecretReveal');
  const earthEl   = $('#celestialEarth');
  const moonEl    = $('#celestialMoon');
  const orbitSys  = $('#celestialSystem');

  if (!loveStoryInitialized) {
    loveStoryInitialized = true;

    if (earthEl) {
      earthEl.addEventListener('click', () => {
        spawnWhiteHeartBurst(earthEl);
      });
      earthEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          spawnWhiteHeartBurst(earthEl);
        }
      });
    }

    if (moonEl) {
      moonEl.addEventListener('click', () => {
        spawnWhiteHeartBurst(moonEl);
      });
      moonEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          spawnWhiteHeartBurst(moonEl);
        }
      });
    }
  }

  if (wishBtn && reveal) {
    wishBtn.onclick = () => {
      show(reveal);
      spawnWhiteHeartBurst(wishBtn);
      wishBtn.style.display = 'none';
    };
  }
}

/* ================================================================
   SECTION 6 — THE SECRET MESSAGE
================================================================ */
function initSurprises() {
  const giftBox = $('#giftBox');
  const openBtn = $('#openSurpriseBtn');
  const giftMsg = $('#giftMsg');

  const openGift = () => {
    if (giftBox.classList.contains('open')) return;
    giftBox.classList.add('open');
    spawnWhiteHeartBurst(giftBox);
    setTimeout(() => {
      if (openBtn) openBtn.style.display = 'none';
      if (giftMsg) show(giftMsg);
    }, 450);
  };

  if (giftBox) giftBox.addEventListener('click', openGift);
  if (openBtn) openBtn.addEventListener('click', openGift);
}

/* ================================================================
   SECTION 7 — THE BIRTHDAY SKY: A MAGICAL CELEBRATION FOR JP 🤍
================================================================ */
let skyAnimId = null;
let skyCanvas = null;
let skyCtx = null;
let skyState = 'idle'; // 'idle', 'magic', 'reveal', 'orbit', 'wish', 'finale', 'eternal'
let skyStars = [];
let skyFireworks = [];
let skySparks = [];
let skyHearts = [];
let skyRings = [];
let skyHeartAssembly = [];
let skyTime = 0;

function switchSkyStage(stageNum) {
  $$('.sky-stage').forEach(st => {
    st.classList.remove('active');
  });
  const target = $(`#skyStage${stageNum}`);
  if (target) {
    target.classList.add('active');
  }
}

function initFinal() {
  skyCanvas = $('#skyCelebrationCanvas');
  if (!skyCanvas) return;
  skyCtx = skyCanvas.getContext('2d');

  function resizeSkyCanvas() {
    const parent = skyCanvas.parentElement;
    if (!parent) return;
    skyCanvas.width = parent.clientWidth || window.innerWidth;
    skyCanvas.height = parent.clientHeight || window.innerHeight;
  }
  window.addEventListener('resize', resizeSkyCanvas);
  resizeSkyCanvas();

  // Create stars for the sky canvas
  skyStars = [];
  const starCount = Math.min(220, Math.floor((skyCanvas.width * skyCanvas.height) / 4500));
  for (let i = 0; i < starCount; i++) {
    skyStars.push({
      x: Math.random() * skyCanvas.width,
      y: Math.random() * skyCanvas.height,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * 0.02 + 0.005,
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * Math.max(skyCanvas.width, skyCanvas.height) * 0.5,
      speed: Math.random() * 0.004 + 0.001,
      color: Math.random() < 0.6 ? '#ffffff' : (Math.random() < 0.5 ? '#e8d4a2' : '#c8b5ff')
    });
  }

  // Bind Buttons & Interactive Elements
  const btnStartMagic  = $('#btnStartMagic');
  const btnToNames     = $('#btnToNames');
  const wordFvrtOne    = $('#wordFvrtOne');
  const btnToWish      = $('#btnToWish');
  const skyWishOrb     = $('#skyWishOrb');
  const btnToFinale    = $('#btnToFinale');
  const btnFinaleReplay= $('#btnFinaleReplay');
  const skyReplayBtn   = $('#skyReplayBtn');
  const btnFinaleExit  = $('#btnFinaleExit');
  const skyExitBtn     = $('#skyExitBtn');

  // Helper: Exit Celebration
  const exitCelebration = () => {
    skyState = 'idle';
    showSection('nicknames');
    onSectionEnter('nicknames');
  };
  if (skyExitBtn) skyExitBtn.onclick = exitCelebration;
  if (btnFinaleExit) btnFinaleExit.onclick = exitCelebration;

  // Helper: Reset & Start Scene 1
  const resetToScene1 = () => {
    skyState = 'idle';
    skyFireworks = [];
    skySparks = [];
    skyHearts = [];
    skyRings = [];
    skyHeartAssembly = [];

    // Reset Scene 3
    const pre = $('#skyRevealPre');
    const name = $('#skyRevealName');
    const act3 = $('#skyStage3Actions');
    if (pre) pre.classList.remove('visible');
    if (name) name.classList.remove('visible');
    if (act3) act3.classList.remove('visible');

    // Reset Scene 4
    const wordsWrap = $('#skyOrbitWords');
    const tributeCard = $('#skyHeartTribute');
    const hint = $('#skyOrbitHint');
    if (wordsWrap) wordsWrap.classList.remove('collapsed');
    if (tributeCard) hide(tributeCard);
    if (hint) show(hint);

    // Reset Scene 5
    if (skyWishOrb) skyWishOrb.classList.remove('activated');
    const wishPrompt = $('#skyWishPrompt');
    const wishMsg = $('#skyWishMsg');
    if (wishPrompt) show(wishPrompt);
    if (wishMsg) hide(wishMsg);

    // Reset Scene 6
    const finaleEternal = $('#finaleEternal');
    const finaleActions = $('#finaleActions');
    const finaleTitle = $('#finaleBdayTitle');
    const finaleChorus = $('#finaleChorus');
    const finaleGiantHeart = $('#finaleGiantHeart');
    if (finaleEternal) hide(finaleEternal);
    if (finaleActions) hide(finaleActions);
    if (finaleTitle) show(finaleTitle);
    if (finaleChorus) show(finaleChorus);
    if (finaleGiantHeart) show(finaleGiantHeart);

    switchSkyStage(1);
  };

  if (skyReplayBtn) skyReplayBtn.onclick = resetToScene1;
  if (btnFinaleReplay) btnFinaleReplay.onclick = resetToScene1;

  // ── SCENE 2 & 3: Start Magic Flow ──
  if (btnStartMagic) {
    btnStartMagic.onclick = () => {
      spawnWhiteHeartBurst(btnStartMagic);
      skyState = 'magic';

      // Launch expanding central rings
      const cx = skyCanvas.width / 2;
      const cy = skyCanvas.height / 2;
      skyRings.push({ x: cx, y: cy, r: 10, maxR: Math.max(skyCanvas.width, skyCanvas.height) * 0.75, alpha: 1, color: '#e8d4a2' });
      skyRings.push({ x: cx, y: cy, r: 5, maxR: Math.max(skyCanvas.width, skyCanvas.height) * 0.65, alpha: 1, color: '#7657ff' });

      // Launch fireworks barrage across screen
      for (let i = 0; i < 9; i++) {
        setTimeout(() => {
          const fx = skyCanvas.width * (0.2 + Math.random() * 0.6);
          const fy = skyCanvas.height * (0.18 + Math.random() * 0.45);
          createFireworkBurst(fx, fy);
        }, i * 380);
      }

      // Transition to Scene 3 (The Birthday Reveal)
      setTimeout(() => {
        switchSkyStage(3);
        skyState = 'reveal';

        const pre = $('#skyRevealPre');
        const name = $('#skyRevealName');
        const act3 = $('#skyStage3Actions');

        setTimeout(() => {
          if (pre) pre.classList.add('visible');
        }, 300);

        setTimeout(() => {
          if (name) name.classList.add('visible');
          // Enormous fireworks celebration burst behind the name
          createFireworkBurst(cx, cy * 0.85, 90, '#ffffff');
          createFireworkBurst(cx - 150, cy * 0.75, 60, '#e8d4a2');
          createFireworkBurst(cx + 150, cy * 0.75, 60, '#c8b5ff');
          spawnCanvasFloatingHearts(18);
        }, 1100);

        setTimeout(() => {
          if (act3) act3.classList.add('visible');
        }, 2200);
      }, 3400);
    };
  }

  // ── SCENE 4: To His Special Names ──
  if (btnToNames) {
    btnToNames.onclick = () => {
      spawnWhiteHeartBurst(btnToNames);
      switchSkyStage(4);
      skyState = 'orbit';
    };
  }

  // Word "MY FVRT ONE" clicked -> collapse words into giant glowing white heart
  if (wordFvrtOne) {
    wordFvrtOne.onclick = (e) => {
      e.stopPropagation();
      spawnWhiteHeartBurst(wordFvrtOne);
      const wordsWrap = $('#skyOrbitWords');
      const tributeCard = $('#skyHeartTribute');
      const hint = $('#skyOrbitHint');

      if (wordsWrap) wordsWrap.classList.add('collapsed');
      if (hint) hide(hint);

      // Canvas ring burst
      const cx = skyCanvas.width / 2;
      const cy = skyCanvas.height / 2;
      skyRings.push({ x: cx, y: cy, r: 10, maxR: 280, alpha: 1, color: '#ffffff' });
      createFireworkBurst(cx, cy, 75, '#ffffff');
      spawnCanvasFloatingHearts(16);

      setTimeout(() => {
        if (tributeCard) show(tributeCard);
      }, 700);
    };
  }

  // ── SCENE 5: Make a Wish ──
  if (btnToWish) {
    btnToWish.onclick = () => {
      spawnWhiteHeartBurst(btnToWish);
      switchSkyStage(5);
      skyState = 'wish';
    };
  }

  // Touch the Wishing Orb -> explosion of particles, light rings, and wish message
  if (skyWishOrb) {
    const activateWishOrb = () => {
      if (skyWishOrb.classList.contains('activated')) return;
      skyWishOrb.classList.add('activated');

      const rect = skyWishOrb.getBoundingClientRect();
      const parentRect = skyCanvas.getBoundingClientRect();
      const cx = (rect.left + rect.width / 2) - parentRect.left;
      const cy = (rect.top + rect.height / 2) - parentRect.top;

      // Light rings spreading outward
      skyRings.push({ x: cx, y: cy, r: 10, maxR: skyCanvas.width * 0.9, alpha: 1, color: '#ffffff' });
      skyRings.push({ x: cx, y: cy, r: 20, maxR: skyCanvas.width * 0.75, alpha: 1, color: '#e8d4a2' });
      skyRings.push({ x: cx, y: cy, r: 30, maxR: skyCanvas.width * 0.6, alpha: 1, color: '#7657ff' });

      // Hundreds of rising golden & silver particles
      for (let i = 0; i < 160; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        skySparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3 + 2), // upward drift
          life: 1,
          decay: Math.random() * 0.012 + 0.008,
          color: Math.random() < 0.5 ? '#e8d4a2' : (Math.random() < 0.5 ? '#ffffff' : '#c8b5ff'),
          size: Math.random() * 2.5 + 1.2
        });
      }

      // Fireworks bursting behind
      setTimeout(() => createFireworkBurst(cx - 200, cy - 120, 50, '#e8d4a2'), 250);
      setTimeout(() => createFireworkBurst(cx + 200, cy - 120, 50, '#c8b5ff'), 450);
      setTimeout(() => createFireworkBurst(cx, cy - 220, 70, '#ffffff'), 650);
      spawnCanvasFloatingHearts(20);

      const wishPrompt = $('#skyWishPrompt');
      const wishMsg = $('#skyWishMsg');
      if (wishPrompt) hide(wishPrompt);

      setTimeout(() => {
        if (wishMsg) show(wishMsg);
      }, 900);
    };

    skyWishOrb.addEventListener('click', activateWishOrb);
    skyWishOrb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateWishOrb();
      }
    });
  }

  // ── SCENE 6: The Grand Finale ──
  if (btnToFinale) {
    btnToFinale.onclick = () => {
      spawnWhiteHeartBurst(btnToFinale);
      switchSkyStage(6);
      skyState = 'finale';

      const cx = skyCanvas.width / 2;
      const cy = skyCanvas.height * 0.38;

      // Grand fireworks barrage sequence
      const colors = ['#ffffff', '#e8d4a2', '#c8b5ff', '#ffb6c1', '#66c7ff'];
      for (let i = 0; i < 14; i++) {
        setTimeout(() => {
          const fx = cx + (Math.random() - 0.5) * (skyCanvas.width * 0.6);
          const fy = cy + (Math.random() - 0.5) * 220;
          createFireworkBurst(fx, fy, 55, colors[i % colors.length]);
        }, i * 260);
      }

      // Spawn heart particle assembly
      setTimeout(() => {
        assembleGiantHeartParticles(cx, cy);
      }, 2200);

      // Staggered reveal of eternal love message
      setTimeout(() => {
        const finaleChorus = $('#finaleChorus');
        const finaleTitle  = $('#finaleBdayTitle');
        const finaleHeart  = $('#finaleGiantHeart');
        const finaleEternal= $('#finaleEternal');
        const finaleActions= $('#finaleActions');

        // Fade initial elements gently
        if (finaleTitle) finaleTitle.style.opacity = '0.35';
        if (finaleChorus) finaleChorus.style.opacity = '0.35';
        if (finaleHeart) finaleHeart.style.transform = 'scale(1.2)';

        if (finaleEternal) show(finaleEternal);
        if (finaleActions) show(finaleActions);
        skyState = 'eternal';
      }, 5000);
    };
  }

  // Start Canvas Render Loop
  if (skyAnimId) cancelAnimationFrame(skyAnimId);
  startSkyRenderLoop();
}

// ── CANVAS HELPERS & FIREWORKS SYSTEM ──
function createFireworkBurst(x, y, count = 48, baseColor = null) {
  const colors = baseColor ? [baseColor] : ['#ffffff', '#e8d4a2', '#c8b5ff', '#ff9fbb', '#66c7ff'];
  const particleCount = count;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5.5 + 1.5;
    skyFireworks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.045,
      friction: 0.965,
      life: 1,
      decay: Math.random() * 0.014 + 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 2.2 + 1.2
    });
  }
}

function spawnCanvasFloatingHearts(count = 10) {
  for (let i = 0; i < count; i++) {
    skyHearts.push({
      x: Math.random() * (skyCanvas ? skyCanvas.width : window.innerWidth),
      y: (skyCanvas ? skyCanvas.height : window.innerHeight) + Math.random() * 60,
      vy: -(Math.random() * 1.8 + 0.8),
      vx: (Math.random() - 0.5) * 0.6,
      symbol: Math.random() < 0.8 ? '🤍' : '❤️',
      size: Math.random() * 12 + 14,
      alpha: Math.random() * 0.6 + 0.35,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }
}

// Assemble heart parametric points: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
function assembleGiantHeartParticles(cx, cy) {
  skyHeartAssembly = [];
  const total = 90;
  for (let i = 0; i < total; i++) {
    const t = (i / total) * Math.PI * 2;
    const scale = Math.min(skyCanvas.width, skyCanvas.height) * 0.014;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const targetX = cx + hx * scale;
    const targetY = cy + hy * scale;

    skyHeartAssembly.push({
      x: cx + (Math.random() - 0.5) * 400,
      y: cy + (Math.random() - 0.5) * 400,
      tx: targetX,
      ty: targetY,
      size: Math.random() * 2.5 + 1.5,
      color: Math.random() < 0.7 ? '#ffffff' : '#e8d4a2',
      alpha: 1,
      progress: 0
    });
  }
}

function startSkyRenderLoop() {
  function loop() {
    if (!skyCtx || !skyCanvas) return;
    skyTime += 0.01;

    // Clear with slight trailing fade for cosmic glow
    const fadeAlpha = skyState === 'finale' || skyState === 'eternal' ? 0.32 : 0.25;
    skyCtx.fillStyle = `rgba(3, 5, 15, ${fadeAlpha})`;
    skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

    const cx = skyCanvas.width / 2;
    const cy = skyCanvas.height / 2;
    const speedMult = skyState === 'magic' || skyState === 'reveal' ? 3.5 : (skyState === 'wish' ? 2.2 : 1);

    // 1. Draw Starfield & Galaxy Swirl
    for (const s of skyStars) {
      if (skyState === 'magic' || skyState === 'reveal' || skyState === 'orbit') {
        // Swirl orbit around center
        s.angle += s.speed * speedMult;
        s.x = cx + Math.cos(s.angle) * s.dist;
        s.y = cy + Math.sin(s.angle) * s.dist;
      }
      s.alpha += s.twinkle;
      if (s.alpha > 0.95 || s.alpha < 0.15) s.twinkle = -s.twinkle;

      skyCtx.save();
      skyCtx.fillStyle = s.color;
      skyCtx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      skyCtx.beginPath();
      skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      skyCtx.fill();
      skyCtx.restore();
    }

    // 2. Draw Expanding Rings
    for (let i = skyRings.length - 1; i >= 0; i--) {
      const ring = skyRings[i];
      ring.r += 6;
      ring.alpha -= 0.015;
      if (ring.alpha <= 0 || ring.r >= ring.maxR) {
        skyRings.splice(i, 1);
        continue;
      }
      skyCtx.save();
      skyCtx.strokeStyle = ring.color;
      skyCtx.lineWidth = 2.5;
      skyCtx.globalAlpha = ring.alpha;
      skyCtx.shadowBlur = 12;
      skyCtx.shadowColor = ring.color;
      skyCtx.beginPath();
      skyCtx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      skyCtx.stroke();
      skyCtx.restore();
    }

    // 3. Draw Fireworks
    for (let i = skyFireworks.length - 1; i >= 0; i--) {
      const fw = skyFireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += fw.gravity;
      fw.vx *= fw.friction;
      fw.vy *= fw.friction;
      fw.life -= fw.decay;

      if (fw.life <= 0) {
        skyFireworks.splice(i, 1);
        continue;
      }

      skyCtx.save();
      skyCtx.fillStyle = fw.color;
      skyCtx.globalAlpha = fw.life;
      skyCtx.shadowBlur = 8;
      skyCtx.shadowColor = fw.color;
      skyCtx.beginPath();
      skyCtx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      skyCtx.fill();
      skyCtx.restore();
    }

    // 4. Draw Sparks (Wishing Orb burst)
    for (let i = skySparks.length - 1; i >= 0; i--) {
      const sp = skySparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vx *= 0.98;
      sp.vy *= 0.98;
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        skySparks.splice(i, 1);
        continue;
      }

      skyCtx.save();
      skyCtx.fillStyle = sp.color;
      skyCtx.globalAlpha = sp.life;
      skyCtx.shadowBlur = 6;
      skyCtx.shadowColor = sp.color;
      skyCtx.beginPath();
      skyCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      skyCtx.fill();
      skyCtx.restore();
    }

    // 5. Draw Giant Heart Assembly Particles
    if (skyHeartAssembly.length) {
      for (const hp of skyHeartAssembly) {
        hp.progress = Math.min(1, hp.progress + 0.02);
        // Easing interpolation
        hp.x += (hp.tx - hp.x) * 0.08;
        hp.y += (hp.ty - hp.y) * 0.08;

        skyCtx.save();
        skyCtx.fillStyle = hp.color;
        skyCtx.globalAlpha = 0.9;
        skyCtx.shadowBlur = 10;
        skyCtx.shadowColor = '#ffffff';
        skyCtx.beginPath();
        skyCtx.arc(hp.x, hp.y, hp.size, 0, Math.PI * 2);
        skyCtx.fill();
        skyCtx.restore();
      }
    }

    // 6. Draw Rising Canvas Floating Hearts
    for (let i = skyHearts.length - 1; i >= 0; i--) {
      const h = skyHearts[i];
      h.y += h.vy;
      h.x += h.vx;
      h.rot += h.rotSpeed;

      if (h.y < -40) {
        skyHearts.splice(i, 1);
        continue;
      }

      skyCtx.save();
      skyCtx.font = `${h.size}px serif`;
      skyCtx.globalAlpha = h.alpha;
      skyCtx.translate(h.x, h.y);
      skyCtx.rotate(h.rot);
      skyCtx.fillText(h.symbol, 0, 0);
      skyCtx.restore();
    }

    skyAnimId = requestAnimationFrame(loop);
  }

  skyAnimId = requestAnimationFrame(loop);
}

/* ================================================================
   MEMORIES GALLERY & LIGHTBOX (OPTIONAL / PLACEHOLDER)
================================================================ */
let visibleImages = [];
let currentLbIdx = 0;

function initGallery() {
  const grid  = $('#galleryGrid');
  const empty = $('#galleryEmpty');
  if (!grid) return;

  const images = cfg.galleryImages || [];
  if (images.length === 0) {
    if (empty) show(empty);
    grid.innerHTML = '';
    return;
  }

  if (empty) hide(empty);
  visibleImages = images;
  grid.innerHTML = '';

  images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', img.caption || img.title || 'Memory photo');

    item.innerHTML = `
      <div class="polaroid">
        <img class="polaroid-img" src="${img.src}" alt="${img.title || ''}" loading="lazy" />
        <p class="polaroid-caption">${img.title || ''}</p>
        ${img.date ? `<span class="polaroid-date">${img.date}</span>` : ''}
      </div>
    `;

    item.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(item);
  });
}

function openLightbox(idx) {
  currentLbIdx = idx;
  const lb   = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCaption');
  const lbDate = $('#lbDate');
  if (!lb || !lbImg) return;

  const img = visibleImages[idx];
  if (!img) return;

  lbImg.src = img.src || '';
  lbImg.alt = img.caption || img.title || '';
  lbCap.textContent = img.caption || img.title || '';
  lbDate.textContent = img.date || '';
  show(lb);
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = $('#lightbox');
  if (lb) hide(lb);
  document.body.style.overflow = '';
}

function initLightboxControls() {
  const lbClose = $('#lbClose');
  const lbPrev  = $('#lbPrev');
  const lbNext  = $('#lbNext');
  const backdrop = $('#lightboxBackdrop');

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  if (lbPrev) lbPrev.addEventListener('click', () => {
    currentLbIdx = (currentLbIdx - 1 + visibleImages.length) % visibleImages.length;
    openLightbox(currentLbIdx);
  });
  if (lbNext) lbNext.addEventListener('click', () => {
    currentLbIdx = (currentLbIdx + 1) % visibleImages.length;
    openLightbox(currentLbIdx);
  });

  document.addEventListener('keydown', e => {
    const lb = $('#lightbox');
    if (!lb || lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      currentLbIdx = (currentLbIdx - 1 + visibleImages.length) % visibleImages.length;
      openLightbox(currentLbIdx);
    }
    if (e.key === 'ArrowRight') {
      currentLbIdx = (currentLbIdx + 1) % visibleImages.length;
      openLightbox(currentLbIdx);
    }
  });
}

/* ================================================================
   MUSIC CONTROLLER
================================================================ */
function initMusicCtrl() {
  const ctrl   = $('#musicCtrl');
  const toggle = $('#musicToggle');
  const icon   = $('#musicIcon');
  const vol    = $('#volSlider');

  if (!cfg.showMusicController || !cfg.musicPath) { hide(ctrl); return; }

  const audio = new Audio(cfg.musicPath);
  audio.loop = true;
  audio.volume = 0.5;
  let playing = false;

  show(ctrl);

  toggle.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      playing = false;
      if (icon) icon.classList.add('paused');
    } else {
      audio.play().catch(() => {});
      playing = true;
      if (icon) icon.classList.remove('paused');
    }
  });

  if (vol) {
    vol.addEventListener('input', () => {
      audio.volume = parseFloat(vol.value);
    });
  }
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  try { initStarCanvas(); } catch (e) { console.error('starCanvas:', e); }
  try { initFloatingHearts(); } catch (e) { console.error('floatingHearts:', e); }
  try { initNavigation(); } catch (e) { console.error('navigation:', e); }
  try { initLightboxControls(); } catch (e) { console.error('lightbox:', e); }
  try { initLetter(); } catch (e) { console.error('letter:', e); }
  try { initLoveStory(); } catch (e) { console.error('loveStory:', e); }
  try { initSurprises(); } catch (e) { console.error('surprises:', e); }
  try { initFinal(); } catch (e) { console.error('final:', e); }
  try { runIntro(); } catch (e) { console.error('intro:', e); }
});
