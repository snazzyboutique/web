/**
 * SNAZZY BOUTIQUE — script.js
 * All interactions, animations, and UI logic
 */

'use strict';

/* ═══════════════════════════════════════
   UTILITIES
═══════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const isMobile = () => window.matchMedia('(max-width: 779px)').matches;
const isTouch  = () => !window.matchMedia('(pointer: fine)').matches;
const clamp    = (val, min, max) => Math.min(Math.max(val, min), max);

/* ═══════════════════════════════════════
   PRELOADER
═══════════════════════════════════════ */
function initPreloader() {
  const el = $('#preloader');
  if (!el) return;

  const minTime = 2000; // minimum display ms
  const start   = Date.now();

  function hide() {
    const elapsed = Date.now() - start;
    const delay   = Math.max(0, minTime - elapsed);
    setTimeout(() => {
      el.classList.add('hidden');
      document.body.style.overflow = '';
      startHeroAnim();
    }, delay);
  }

  // Hide after window load (or fallback after 4s)
  document.body.style.overflow = 'hidden';
  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
    setTimeout(hide, 4000);
  }
}

/* ═══════════════════════════════════════
   CUSTOM CURSOR (desktop only)
═══════════════════════════════════════ */
function initCursor() {
  if (isTouch()) return;

  const cursor = $('#cursor');
  const dot    = $('.cur-dot', cursor);
  const ring   = $('.cur-ring', cursor);
  const label  = $('.cur-label', cursor);
  if (!cursor) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let raf;

  const lerp = (a, b, t) => a + (b - a) * t;

  function loop() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    ring.style.transform   = `translate(${ringX - mouseX}px, ${ringY - mouseY}px)`;
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!raf) loop();
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '';
    ring.style.opacity = '';
  });

  // Hover states
  document.addEventListener('mouseover', e => {
    const target = e.target.closest('[data-cursor], a, button, .magnetic');
    if (target) {
      cursor.classList.add('cursor-hover');
      const txt = target.dataset.cursor || '';
      label.textContent = txt;
    } else {
      cursor.classList.remove('cursor-hover');
      label.textContent = '';
    }
  });

  loop();
}

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
function initNav() {
  const nav     = $('#nav');
  const burger  = $('#burgerBtn');
  const menu    = $('#mobileMenu');
  const links   = $$('.mm-link, .mm-cta', menu);
  if (!nav) return;

  // Scroll state
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });

  // Mobile menu toggle
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      burger.classList.toggle('active', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }
}

/* ═══════════════════════════════════════
   HERO ANIMATION (runs after preloader)
═══════════════════════════════════════ */
function startHeroAnim() {
  // Animate hero text lines
  $$('.ht-inner').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });

  // Animate other hero elements
  const tag     = $('.hero-tag');
  const sub     = $('.hero-sub');
  const actions = $('.hero-actions');
  const scroll  = $('.hero-scroll');
  const badge   = $('.hero-badge');

  [tag, sub, actions, scroll, badge].forEach((el, i) => {
    if (!el) return;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }, 500 + i * 120);
  });
}

/* ═══════════════════════════════════════
   SCROLL REVEAL (Intersection Observer)
═══════════════════════════════════════ */
function initReveal() {
  // Set initial states for hero elements that we'll animate in
  const heroEls = ['.hero-tag', '.hero-sub', '.hero-actions', '.hero-scroll', '.hero-badge'];
  heroEls.forEach(sel => {
    const el = $(sel);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.style.getPropertyValue('--i') || 0;
      setTimeout(() => {
        el.classList.add('visible');
      }, parseFloat(delay) * 1000);
      observer.unobserve(el);
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  $$('.reveal-up, .reveal-clip').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   GSAP SCROLL ANIMATIONS
═══════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Parallax hero glow
  const heroGlow = $('.hero-glow');
  if (heroGlow) {
    gsap.to(heroGlow, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // About image parallax
  const avInner = $('.av-inner');
  if (avInner) {
    gsap.fromTo(avInner,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about-visual',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  }

  // Service cards stagger
  gsap.from('.svc-card', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 80%',
    }
  });

  // Lookbook parallax
  $$('.lb-img').forEach(el => {
    gsap.fromTo(el,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.lb-item'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  });

  // Process steps stagger
  gsap.from('.ps-step', {
    x: isMobile() ? 0 : -30,
    y: isMobile() ? 30 : 0,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.process-steps',
      start: 'top 80%',
    }
  });
}

/* ═══════════════════════════════════════
   MAGNETIC BUTTONS (desktop)
═══════════════════════════════════════ */
function initMagnetic() {
  if (isTouch()) return;

  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const dist   = Math.sqrt(dx * dx + dy * dy);
      const maxD   = Math.max(rect.width, rect.height);
      const factor = clamp(1 - dist / maxD, 0, 1) * 0.35;
      el.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      el.style.transform  = '';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });
}

/* ═══════════════════════════════════════
   COUNT-UP NUMBERS
═══════════════════════════════════════ */
function initCountUp() {
  const stats = $$('.stat-n[data-target]');
  if (!stats.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  stats.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   TESTIMONIALS SLIDER
═══════════════════════════════════════ */
function initTestimonials() {
  const track  = $('#testiTrack');
  const dots   = $$('.td');
  const prev   = $('#tnPrev');
  const next   = $('#tnNext');
  if (!track) return;

  const slides = $$('.testi-slide', track);
  let current  = 0;
  let timer    = null;

  function goTo(idx) {
    const prev_slide = slides[current];
    prev_slide.classList.remove('active');
    prev_slide.classList.add('exit');
    setTimeout(() => prev_slide.classList.remove('exit'), 600);

    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current);
    });

    // Update track height to match active slide
    const activeSlide = slides[current];
    track.style.minHeight = activeSlide.scrollHeight + 'px';
  }

  function autoPlay() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      goTo(current + 1);
      autoPlay();
    }, 5000);
  }

  // Init height
  setTimeout(() => {
    track.style.minHeight = slides[0].scrollHeight + 'px';
  }, 100);

  // Controls
  if (prev) prev.addEventListener('click', () => { goTo(current - 1); autoPlay(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); autoPlay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); autoPlay(); });
  });

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      goTo(delta < 0 ? current + 1 : current - 1);
      autoPlay();
    }
  }, { passive: true });

  autoPlay();
}

/* ═══════════════════════════════════════
   MARQUEE PAUSE ON HOVER
═══════════════════════════════════════ */
function initMarquee() {
  const rows = $$('.marquee-row');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.animationPlayState = 'paused';
    });
    row.addEventListener('mouseleave', () => {
      row.style.animationPlayState = 'running';
    });
  });
}

/* ═══════════════════════════════════════
   SMOOTH ANCHOR SCROLL
═══════════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH   = $('#nav') ? $('#nav').offsetHeight : 70;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ═══════════════════════════════════════
   LOOKBOOK CURSOR LABELS
═══════════════════════════════════════ */
function initLookbook() {
  $$('.lb-item[data-cursor]').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'img');
    const cap = $('.lb-cap span', item);
    if (cap) {
      item.setAttribute('aria-label', cap.textContent);
    }
  });
}

/* ═══════════════════════════════════════
   LAZY LOAD (performance)
═══════════════════════════════════════ */
function initLazy() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.bg) {
          el.style.backgroundImage = el.dataset.bg;
          delete el.dataset.bg;
        }
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });

  $$('[data-bg]').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   INIT ALL
═══════════════════════════════════════ */
function init() {
  initPreloader();
  initNav();
  initReveal();
  initCursor();
  initMagnetic();
  initCountUp();
  initTestimonials();
  initMarquee();
  initSmoothScroll();
  initLookbook();
  initLazy();

  // GSAP runs after scripts load
  if (typeof gsap !== 'undefined') {
    initGSAP();
  } else {
    // Retry once in case GSAP loaded slightly after
    setTimeout(() => {
      if (typeof gsap !== 'undefined') initGSAP();
    }, 500);
  }
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
