/* ============================================================
   MODI MANIA CAFE — COMPLETE JAVASCRIPT
   ============================================================ */

'use strict';

/* ---- UTILITIES ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. NAVBAR — scroll behavior (both pages)
   ============================================================ */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const isMenuPage = document.body.classList.contains('page-menu');

  function updateNav() {
    if (isMenuPage) {
      // Menu page: always solid
      navbar.classList.add('scrolled');
      return;
    }
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  }

  // init
  if (!isMenuPage) navbar.classList.add('transparent');
  updateNav();

  window.addEventListener('scroll', updateNav, { passive: true });
})();

/* ============================================================
   2. HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click (mobile)
  $$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ============================================================
   3. HERO KEN-BURNS — already via CSS, but add class on load
   ============================================================ */
(function initHeroLoad() {
  const heroBg = $('.hero-bg');
  if (!heroBg) return;
  // The animation starts immediately via CSS, nothing extra needed.
  // Optionally add a loaded class after bg image loads:
  const bgImg = new Image();
  bgImg.src = heroBg.style.backgroundImage.replace(/url\(['"]?([^'"]+)['"]?\)/i, '$1');
  bgImg.onload = () => heroBg.classList.add('loaded');
})();

/* ============================================================
   4. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const targets = $$('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. MENU FILTER PILLS (index page — preview section)
   ============================================================ */
(function initMenuFilter() {
  const pills = $$('.menu-filter-pill');
  if (!pills.length) return;
  const cards = $$('.preview-card[data-cat]');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.filter;
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ============================================================
   6. REVIEWS SLIDER
   ============================================================ */
(function initReviewsSlider() {
  const slider = $('#reviewsSlider');
  const dotsContainer = $('#sliderDots');
  const prevBtn = $('#sliderPrev');
  const nextBtn = $('#sliderNext');
  if (!slider || !dotsContainer) return;

  const cards = $$('.review-card', slider);
  const total = cards.length;
  let current = 0;
  let autoInterval = null;
  let perPage = getPerPage();

  function getPerPage() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const pages = Math.ceil(total / perPage);
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Review page ${i + 1}`);
      dot.addEventListener('click', () => goTo(i * perPage));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = $$('.slider-dot', dotsContainer);
    const activePage = Math.floor(current / perPage);
    dots.forEach((d, i) => d.classList.toggle('active', i === activePage));
  }

  function showSlide(index) {
    // Clamp
    const pages = Math.ceil(total / perPage);
    const maxStart = (pages - 1) * perPage;
    current = Math.max(0, Math.min(index, maxStart));

    cards.forEach((card, i) => {
      const visible = i >= current && i < current + perPage;
      card.classList.toggle('visible', visible);
    });
    updateDots();
  }

  function goTo(index) { showSlide(index); }

  function next() {
    const pages = Math.ceil(total / perPage);
    const nextPage = Math.floor(current / perPage) + 1;
    if (nextPage >= pages) goTo(0);
    else goTo(nextPage * perPage);
  }

  function prev() {
    const pages = Math.ceil(total / perPage);
    const prevPage = Math.floor(current / perPage) - 1;
    if (prevPage < 0) goTo((pages - 1) * perPage);
    else goTo(prevPage * perPage);
  }

  function startAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(next, 5000);
  }

  function stopAuto() { clearInterval(autoInterval); }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  // Pause on hover
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  // Touch swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  // Responsive resize
  window.addEventListener('resize', () => {
    const newPer = getPerPage();
    if (newPer !== perPage) {
      perPage = newPer;
      current = 0;
      buildDots();
      showSlide(0);
    }
  });

  // Init
  buildDots();
  showSlide(0);
  startAuto();
})();

/* ============================================================
   7. ADD BUTTON MICRO-INTERACTION
   ============================================================ */
(function initAddButtons() {
  $$('.btn-add').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.classList.contains('added')) return;
      const orig = this.textContent;
      this.textContent = '✓';
      this.classList.add('added');

      // Particle burst
      createParticle(this);

      setTimeout(() => {
        this.textContent = orig;
        this.classList.remove('added');
      }, 1800);
    });
  });

  function createParticle(btn) {
    const rect = btn.getBoundingClientRect();
    const particle = document.createElement('span');
    particle.textContent = '+1';
    Object.assign(particle.style, {
      position: 'fixed',
      left: rect.left + rect.width / 2 + 'px',
      top: rect.top + 'px',
      transform: 'translate(-50%, 0)',
      color: 'var(--primary)',
      fontWeight: '700',
      fontSize: '.85rem',
      pointerEvents: 'none',
      zIndex: '9999',
      animation: 'particleRise .9s ease forwards',
    });
    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }

  // Inject keyframes if not present
  if (!document.getElementById('particle-style')) {
    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = `
      @keyframes particleRise {
        0%   { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -36px); }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ============================================================
   8. BACK TO TOP
   ============================================================ */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   9. ACTIVE NAV LINK (scroll-spy, index page)
   ============================================================ */
(function initScrollSpy() {
  if (document.body.classList.contains('page-menu')) return;

  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          const match = href.includes(entry.target.id);
          if (match) link.classList.add('active');
          else if (!href.includes('menu.html')) link.classList.remove('active');
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   10. MENU PAGE — CATEGORY NAV
   ============================================================ */
(function initMenuCatNav() {
  if (!document.body.classList.contains('page-menu')) return;

  const pills = $$('.cat-pill');
  const sections = $$('.menu-section-block');
  const catNavWrap = $('#catNavWrap');
  if (!pills.length || !sections.length) return;

  const NAV_OFFSET = 140; // px — sticky navbar + cat nav height

  /* Click: smooth scroll to section */
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const target = pill.dataset.target;

      if (target === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActivePill(pill);
        return;
      }

      // Try matching section id directly, or subsection id
      let el = document.getElementById(target);
      if (!el) {
        // Could be a subsection like garlic-bread, cold-coffee, shakes
        el = document.querySelector('[data-section="' + target + '"]');
      }
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
        setActivePill(pill);
      }
    });
  });

  function setActivePill(activePill) {
    pills.forEach(p => p.classList.remove('active'));
    activePill.classList.add('active');
    // Scroll pill into view within nav
    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* Sticky class for cat nav */
  const stickyObserver = new IntersectionObserver(
    ([entry]) => catNavWrap.classList.toggle('stuck', !entry.isIntersecting),
    { threshold: 0, rootMargin: '-70px 0px 0px 0px' }
  );
  const heroBanner = $('.menu-page-hero');
  if (heroBanner) stickyObserver.observe(heroBanner);

  /* IntersectionObserver: highlight active pill on scroll */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id || entry.target.dataset.section;
        const matchingPill = pills.find(
          p => p.dataset.target === sectionId
        );
        if (matchingPill) setActivePill(matchingPill);
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0,
  });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ============================================================
   11. TICKER — pause on hover
   ============================================================ */
(function initTicker() {
  const track = $('#tickerTrack');
  if (!track) return;
  const wrap = track.closest('.ticker-wrap');
  if (!wrap) return;
  // hover is handled via CSS (.ticker-track:hover), but also support touch:
  wrap.addEventListener('touchstart', () => {
    track.style.animationPlayState = 'paused';
  }, { passive: true });
  wrap.addEventListener('touchend', () => {
    track.style.animationPlayState = 'running';
  }, { passive: true });
})();

/* ============================================================
   END OF SCRIPT
   ============================================================ */


/* ============================================================
   12. LOVED CARDS — staggered reveal on scroll
   ============================================================ */
(function initLovedCards() {
  const cards = $$('.loved-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // slight stagger per card
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity .45s ease ${i * 0.06}s, transform .45s ease ${i * 0.06}s`;
    observer.observe(card);
  });
})();

/* ============================================================
   13. STUDENT FAV CARDS — staggered reveal
   ============================================================ */
(function initSfavCards() {
  const cards = $$('.sfav-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(card => observer.observe(card));
})();

/* ============================================================
   14. OPEN STRIP — count-up animation for stats
   ============================================================ */
(function initCountUp() {
  const stats = $$('.os-stat-num');
  if (!stats.length) return;

  // Only animate numbers, skip "24×7", "5★" etc.
  const animateStat = (el) => {
    const raw = el.textContent.trim();
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num > 999) return; // skip non-numeric / 24×7 etc.
    const suffix = raw.replace(/[0-9.]/g, '');
    const duration = 1200;
    const start = performance.now();

    requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(eased * num);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.os-stat-num').forEach(animateStat);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const strip = $('.open-strip');
  if (strip) observer.observe(strip);
})();

/* ============================================================
   15. VIBE TILES — hover parallax tilt (subtle)
   ============================================================ */
(function initVibeTilt() {
  const tiles = $$('.vibe-tile');
  if (!tiles.length) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  tiles.forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
      const rect = tile.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tile.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });
    tile.addEventListener('mouseleave', () => {
      tile.style.transform = '';
    });
  });
})();

/* ============================================================
   16. LATE NIGHT SECTION — animate tag pills on scroll
   ============================================================ */
(function initLateNightTags() {
  const tags = $$('.ln-tag');
  if (!tags.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tags.forEach((tag, i) => {
          setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
          }, i * 80);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  tags.forEach(tag => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(10px)';
    tag.style.transition = 'opacity .35s ease, transform .35s ease';
  });

  const section = $('.late-night');
  if (section) observer.observe(section);
})();

/* ============================================================
   17. SCROLL SPY — update active nav link for new sections
   ============================================================ */
(function extendScrollSpy() {
  // The existing scroll spy in initScrollSpy() handles sections with id.
  // New sections (#most-loved, #late-night, #student-favs, #open247, #cafe-vibes)
  // all have IDs and are <section> elements so they're auto-picked up.
  // No extra code needed — the existing IntersectionObserver covers them.
})();

/* ============================================================
   END OF ADDITIONS
   ============================================================ */
