/* ═══════════════════════════════════════════════════════════
   MODI MANIA CAFE — Premium JavaScript
   Scroll animations · Navbar · Reviews Slider · Interactions
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── DOM READY ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initRevealObserver();
  initHeroLoad();
  initReviewsSlider();
  initMenuBtns();
  initBackToTop();
  initSmoothScroll();
  initCounterAnimations();
});


/* ════════════════════════════════════════════════════════════
   1. NAVBAR — sticky + scroll styling
   ════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ════════════════════════════════════════════════════════════
   2. HAMBURGER MENU — mobile nav toggle
   ════════════════════════════════════════════════════════════ */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on any nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}


/* ════════════════════════════════════════════════════════════
   3. REVEAL ON SCROLL — IntersectionObserver
   ════════════════════════════════════════════════════════════ */
function initRevealObserver() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}


/* ════════════════════════════════════════════════════════════
   4. HERO IMAGE — cinematic pan on load
   ════════════════════════════════════════════════════════════ */
function initHeroLoad() {
  const hero    = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero-bg-img');
  if (!hero) return;

  const activate = () => hero.classList.add('loaded');

  if (heroImg) {
    if (heroImg.complete) {
      activate();
    } else {
      heroImg.addEventListener('load', activate);
      heroImg.addEventListener('error', activate); // fallback
    }
  } else {
    activate();
  }
}


/* ════════════════════════════════════════════════════════════
   5. REVIEWS SLIDER — 3-per-view on desktop, 1 on mobile
   ════════════════════════════════════════════════════════════ */
function initReviewsSlider() {
  const track   = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');
  const dotsWrap = document.getElementById('revDots');
  if (!track || !prevBtn || !nextBtn) return;

  const cards      = Array.from(track.querySelectorAll('.review-card'));
  let currentPage  = 0;
  let perPage      = getPerPage();
  let totalPages   = Math.ceil(cards.length / perPage);
  let autoTimer    = null;

  function getPerPage() {
    return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'rev-dot' + (i === currentPage ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.rev-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentPage);
    });
  }

  function goTo(page) {
    currentPage = ((page % totalPages) + totalPages) % totalPages;

    // Hide all, show current page's cards
    cards.forEach((card, idx) => {
      const pageIdx = Math.floor(idx / perPage);
      if (pageIdx === currentPage) {
        card.style.display = '';
        // Re-trigger reveal
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 30);
      } else {
        card.style.display = 'none';
      }
    });

    // Grid layout fix — only show perPage columns
    track.style.gridTemplateColumns = `repeat(${perPage}, 1fr)`;

    updateDots();
  }

  function next() { goTo(currentPage + 1); }
  function prev() { goTo(currentPage - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 4500);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      stopAuto();
      dx < 0 ? next() : prev();
      startAuto();
    }
  }, { passive: true });

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newPer = getPerPage();
      if (newPer !== perPage) {
        perPage    = newPer;
        totalPages = Math.ceil(cards.length / perPage);
        currentPage = 0;
        buildDots();
        goTo(0);
      }
    }, 200);
  });

  // Init
  buildDots();
  goTo(0);
  startAuto();
}


/* ════════════════════════════════════════════════════════════
   6. MENU ADD BUTTONS — satisfying micro-interaction
   ════════════════════════════════════════════════════════════ */
function initMenuBtns() {
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const icon = this.querySelector('i');
      if (!icon) return;

      // Pulse effect
      this.style.transform = 'scale(1.35)';
      this.style.background = 'var(--orange-deep)';
      icon.classList.replace('fa-plus', 'fa-check');

      setTimeout(() => {
        this.style.transform = '';
        this.style.background = '';
      }, 200);

      setTimeout(() => {
        icon.classList.replace('fa-check', 'fa-plus');
      }, 1800);

      // Spawn floating "+1" particle
      spawnParticle(this);
    });
  });
}

function spawnParticle(origin) {
  const rect    = origin.getBoundingClientRect();
  const particle = document.createElement('div');

  particle.textContent = '+1';
  Object.assign(particle.style, {
    position:   'fixed',
    left:       rect.left + rect.width  / 2 + 'px',
    top:        rect.top  + rect.height / 2 + 'px',
    transform:  'translate(-50%, -50%)',
    fontFamily: 'var(--font-display, sans-serif)',
    fontWeight: '800',
    fontSize:   '.9rem',
    color:      'var(--orange, #E8500A)',
    pointerEvents: 'none',
    zIndex:     '9999',
    transition: 'transform .7s cubic-bezier(.22,.6,.36,1), opacity .7s ease',
  });

  document.body.appendChild(particle);

  requestAnimationFrame(() => {
    particle.style.transform  = 'translate(-50%, -220%) scale(1.2)';
    particle.style.opacity    = '0';
  });

  setTimeout(() => particle.remove(), 750);
}


/* ════════════════════════════════════════════════════════════
   7. BACK TO TOP BUTTON
   ════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ════════════════════════════════════════════════════════════
   8. SMOOTH SCROLL — offset for fixed navbar
   ════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  const OFFSET = 80;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ════════════════════════════════════════════════════════════
   9. COUNTER ANIMATIONS — hero stats
   ════════════════════════════════════════════════════════════ */
function initCounterAnimations() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const targets = { '24': 24, '50': 50, '4.8': 4.8 };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const rawText = el.textContent.trim();
      const small   = el.querySelector('small');
      const suffix  = small ? small.textContent : '';

      // Find target value
      const match = rawText.replace(suffix, '').trim();
      const end   = parseFloat(match);
      if (isNaN(end)) return;

      const isDecimal = String(end).includes('.');
      const duration  = 1400;
      const start     = performance.now();

      const animate = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current  = end * ease;
        const display  = isDecimal ? current.toFixed(1) : Math.round(current);

        el.childNodes[0].textContent = display;
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.7 });

  stats.forEach(el => observer.observe(el));
}


/* ════════════════════════════════════════════════════════════
   10. ACTIVE NAV LINK — highlight based on scroll position
   ════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id], footer[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const OFFSET    = 120;

  const onScroll = () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - OFFSET;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color     = href === current ? 'var(--white)'              : '';
      link.style.background = href === current ? 'rgba(255,255,255,.1)'     : '';
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ════════════════════════════════════════════════════════════
   11. PARALLAX — hero image subtle depth
   ════════════════════════════════════════════════════════════ */
(function initParallax() {
  const heroImg = document.querySelector('.hero-bg-img');
  if (!heroImg) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const onScroll = () => {
    const scrollY  = window.scrollY;
    const maxShift = 80;
    const shift    = Math.min(scrollY * 0.22, maxShift);
    heroImg.style.transform = `scale(1.06) translateY(${shift}px)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ════════════════════════════════════════════════════════════
   12. TICKER PAUSE ON HOVER
   ════════════════════════════════════════════════════════════ */
(function initTickerPause() {
  const ticker = document.querySelector('.ticker-track');
  if (!ticker) return;
  ticker.addEventListener('mouseenter', () => { ticker.style.animationPlayState = 'paused'; });
  ticker.addEventListener('mouseleave', () => { ticker.style.animationPlayState = 'running'; });
})();
