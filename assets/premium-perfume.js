/* ============================================
   LUMISCENT - PerfumeBox-Style Theme JavaScript
   ============================================ */

(function () {
  'use strict';

  /* === SCROLL ANIMATIONS === */
  function initScrollAnimations() {
    const elements = document.querySelectorAll(
      '.scroll-animate, .collection-cards-row__card, .shop-by-gender__card, .testimonial-card, .trust-badge, .fragrance-finder__option'
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 0.08 + 's';
      if (!el.classList.contains('scroll-animate')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      }
      observer.observe(el);
    });
  }

  /* === BACK TO TOP === */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    function toggle() {
      btn.classList.toggle('visible', window.scrollY > 500);
    }

    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* === HEADER SCROLL === */
  function initHeaderScroll() {
    const header = document.querySelector('.section-header');
    if (!header) return;

    let lastY = 0;

    function onScroll() {
      const y = window.scrollY;
      header.classList.toggle('header--scrolled', y > 80);
      header.classList.toggle('header--hidden', y > lastY && y > 300);
      lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* === COLLECTION CARDS HORIZONTAL SCROLL DRAG === */
  function initCardRowScroll() {
    document.querySelectorAll('.collection-cards-row__scroll').forEach((row) => {
      let isDown = false;
      let startX, scrollLeft;

      row.addEventListener('mousedown', (e) => {
        isDown = true;
        row.style.cursor = 'grabbing';
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      });
      row.addEventListener('mouseleave', () => { isDown = false; row.style.cursor = 'grab'; });
      row.addEventListener('mouseup', () => { isDown = false; row.style.cursor = 'grab'; });
      row.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - row.offsetLeft;
        row.scrollLeft = scrollLeft - (x - startX) * 1.5;
      });

      row.style.cursor = 'grab';
    });
  }

  /* === COLLECTION TABS === */
  function initCollectionTabs() {
    document.querySelectorAll('.collection-tabs').forEach((section) => {
      const buttons = section.querySelectorAll('.collection-tab__btn');
      const panels = section.querySelectorAll('.collection-tab__panel');

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-tab');

          buttons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          panels.forEach((p) => {
            p.style.display = p.getAttribute('data-tab-id') === target ? '' : 'none';
          });
        });
      });
    });
  }

  /* === PRODUCT CARD HOVER PERF === */
  function initProductCards() {
    document.querySelectorAll('.card--media, .card--standard').forEach((card) => {
      const media = card.querySelector('.media');
      if (!media) return;
      card.addEventListener('mouseenter', () => { media.style.willChange = 'transform'; });
      card.addEventListener('mouseleave', () => { media.style.willChange = 'auto'; });
    });
  }

  /* === COUNTER ANIMATION === */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const end = parseInt(entry.target.getAttribute('data-count-to'), 10);
            const suffix = entry.target.getAttribute('data-count-suffix') || '';
            const start = performance.now();

            (function tick(now) {
              const progress = Math.min((now - start) / 2000, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              entry.target.textContent = Math.floor(end * eased).toLocaleString() + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            })(start);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  /* === INIT === */
  function init() {
    initScrollAnimations();
    initBackToTop();
    initHeaderScroll();
    initCardRowScroll();
    initCollectionTabs();
    initProductCards();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on Shopify section load (theme editor)
  document.addEventListener('shopify:section:load', init);
})();
