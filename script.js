'use strict';

/* ================================================================
   Modi Mania Cafe 24x7 — Main JavaScript
   ES6+ · No external dependencies
   ================================================================ */

/* ─────────────────────────────────────────
   1. NAVBAR SCROLL BEHAVIOUR
───────────────────────────────────────── */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ─────────────────────────────────────────
   2. HAMBURGER MENU
───────────────────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ─────────────────────────────────────────
   3. HERO IMAGE LOAD → KEN-BURNS
───────────────────────────────────────── */
(function initHeroImageLoad() {
  const heroSection = document.querySelector('.hero');
  const heroBgImg   = document.querySelector('.hero-bg-img');
  if (!heroSection || !heroBgImg) return;

  function markLoaded() {
    heroSection.classList.add('loaded');
  }

  if (heroBgImg.complete && heroBgImg.naturalWidth > 0) {
    markLoaded();
  } else {
    heroBgImg.addEventListener('load', markLoaded);
    heroBgImg.addEventListener('error', markLoaded); // fallback
  }
})();

/* ─────────────────────────────────────────
   4. SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Stagger siblings — find index among sibling .reveal elements
          const siblings = Array.from(
            el.parentElement.querySelectorAll(':scope > .reveal')
          );
          const idx = siblings.indexOf(el);
          const delay = idx >= 0 ? idx * 90 : 0;

          setTimeout(function () {
            el.classList.add('visible');
          }, delay);

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ─────────────────────────────────────────
   5. MENU FILTER PILLS
───────────────────────────────────────── */
(function initMenuFilter() {
  const pills    = document.querySelectorAll('.pill');
  const cards    = document.querySelectorAll('.menu-card');
  if (!pills.length || !cards.length) return;

  function filterMenu(category) {
    cards.forEach(function (card) {
      const cat = card.dataset.cat;
      const show = (category === 'all' || cat === category);

      if (show) {
        card.classList.remove('hidden');
        // Re-trigger reveal if needed
        card.classList.remove('visible');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            card.classList.add('visible');
          });
        });
      } else {
        card.classList.add('hidden');
        card.classList.remove('visible');
      }
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      filterMenu(filter);
    });
  });
})();

/* ─────────────────────────────────────────
   6. REVIEWS SLIDER
───────────────────────────────────────── */
(function initReviewsSlider() {
  const wrap   = document.getElementById('reviewsSliderWrap');
  const track  = document.getElementById('reviewsTrack');
  const prevBtn= document.getElementById('revPrev');
  const nextBtn= document.getElementById('revNext');
  const dotsEl = document.getElementById('revDots');
  if (!wrap || !track || !prevBtn || !nextBtn || !dotsEl) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  const total = cards.length;
  let currentIndex = 0;
  let autoTimer    = null;
  let isHovered    = false;

  // Determine how many cards are visible based on viewport
  function getVisible() {
    const w = window.innerWidth;
    if (w > 1024) return 3;
    if (w > 480)  return 2;
    return 1;
  }

  // Total "pages"
  function getPages() {
    return total - getVisible() + 1;
  }

  // Clamp index
  function clamp(idx) {
    const pages = getPages();
    return Math.max(0, Math.min(idx, pages - 1));
  }

  // Build dots
  function buildDots() {
    dotsEl.innerHTML = '';
    const pages = getPages();
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('span');
      dot.className = 'rev-dot' + (i === currentIndex ? ' active' : '');
      dot.addEventListener('click', function () {
        goTo(i);
      });
      dotsEl.appendChild(dot);
    }
  }

  // Update dot active state
  function updateDots() {
    const dots = dotsEl.querySelectorAll('.rev-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  // Calculate card width (including gap)
  function getCardStep() {
    if (!cards[0]) return 0;
    const style   = window.getComputedStyle(track);
    const gap     = parseFloat(style.gap) || 24;
    const cardW   = cards[0].getBoundingClientRect().width;
    return cardW + gap;
  }

  // Move to index
  function goTo(idx) {
    currentIndex = clamp(idx);
    const step   = getCardStep();
    track.style.transform = 'translateX(-' + (currentIndex * step) + 'px)';
    updateDots();
  }

  // Auto-advance
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () {
      if (!isHovered) {
        const pages = getPages();
        goTo(currentIndex + 1 >= pages ? 0 : currentIndex + 1);
      }
    }, 5000);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Prev / Next
  prevBtn.addEventListener('click', function () {
    const pages = getPages();
    goTo(currentIndex - 1 < 0 ? pages - 1 : currentIndex - 1);
    stopAuto(); startAuto();
  });

  nextBtn.addEventListener('click', function () {
    const pages = getPages();
    goTo(currentIndex + 1 >= pages ? 0 : currentIndex + 1);
    stopAuto(); startAuto();
  });

  // Pause on hover
  wrap.addEventListener('mouseenter', function () {
    isHovered = true;
  });

  wrap.addEventListener('mouseleave', function () {
    isHovered = false;
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX   = 0;

  wrap.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  wrap.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > 50) {
      const pages = getPages();
      if (delta > 0) {
        goTo(currentIndex + 1 >= pages ? 0 : currentIndex + 1);
      } else {
        goTo(currentIndex - 1 < 0 ? pages - 1 : currentIndex - 1);
      }
      stopAuto(); startAuto();
    }
  }, { passive: true });

  // Re-init on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      buildDots();
      goTo(clamp(currentIndex));
    }, 200);
  });

  // Init
  buildDots();
  goTo(0);
  startAuto();
})();

/* ─────────────────────────────────────────
   7. ADD BUTTON MICRO-INTERACTION
───────────────────────────────────────── */
(function initAddButtons() {
  const addBtns = document.querySelectorAll('.add-btn');
  if (!addBtns.length) return;

  addBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.classList.contains('added')) return;

      const originalHTML = btn.innerHTML;

      // Change icon to checkmark
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
      btn.classList.add('added');

      // Spawn floating +1 particle
      const rect = btn.getBoundingClientRect();
      const particle = document.createElement('span');
      particle.className = 'add-particle';
      particle.textContent = '+1';
      particle.style.left = (rect.left + rect.width / 2 - 12) + 'px';
      particle.style.top  = (rect.top + window.scrollY - 8) + 'px';
      document.body.appendChild(particle);

      // Remove particle after animation
      setTimeout(function () {
        particle.remove();
      }, 1200);

      // Reset button after 1.5s
      setTimeout(function () {
        btn.innerHTML = originalHTML;
        btn.classList.remove('added');
      }, 1500);
    });
  });
})();

/* ─────────────────────────────────────────
   8. BACK TO TOP
───────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ─────────────────────────────────────────
   9. ACTIVE NAV LINK ON SCROLL
───────────────────────────────────────── */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' }
  );

  sections.forEach(function (s) {
    observer.observe(s);
  });
})();

/* ─────────────────────────────────────────
   10. NUMBER COUNTER ANIMATION
───────────────────────────────────────── */
(function initCounterAnimation() {
  const nums = document.querySelectorAll('.hs-num[data-target]');
  if (!nums.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const duration = 1400;
          const start    = performance.now();
          const startVal = 0;

          function update(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(startVal + (target - startVal) * ease);
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target;
            }
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.8 }
  );

  nums.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ─────────────────────────────────────────
   11. TICKER PAUSE ON HOVER
───────────────────────────────────────── */
(function initTickerPause() {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;

  // Handled purely via CSS (.ticker-wrap:hover .ticker-content)
  // No extra JS needed — CSS already pauses on hover.
  // This IIFE is intentionally left as a no-op anchor.
})();

/* ─────────────────────────────────────────
   UTILITY: Smooth scroll for anchor links
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      const offset = 70;
      const top    = targetEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});
