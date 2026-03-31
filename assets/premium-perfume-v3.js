/* =====================================================
   LUMISCENT — World-Class Luxury Theme JavaScript v3
   Ultra-Premium Interactions & Animations
   ===================================================== */

(function () {
  'use strict';

  /* === PRELOADER === */
  function initPreloader() {
    const preloader = document.querySelector('.site-preloader');
    if (!preloader) return;

    function hidePreloader() {
      preloader.classList.add('loaded');
      document.body.classList.add('page-loaded');
      setTimeout(() => {
        if (preloader.parentNode) preloader.remove();
      }, 800);
    }

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 400);
    } else {
      window.addEventListener('load', () => setTimeout(hidePreloader, 400));
      setTimeout(hidePreloader, 4000);
    }
  }

  /* === SCROLL REVEAL WITH STAGGER === */
  function initScrollReveal() {
    const selectors = [
      '.scroll-animate',
      '.reveal-up',
      '.collection-cards-row__card',
      '.shop-by-gender__card',
      '.testimonial-card',
      '.trust-badge',
      '.brand-item',
      '.fragrance-finder__option',
      '.value-props__item',
      '.section-featured-collection .card-wrapper',
      '.article-card',
      '.lux-section-header'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const parent = el.parentElement;
          const allSiblings = selectors.join(', ');
          const siblings = parent
            ? Array.from(parent.children).filter((s) => s.matches(allSiblings))
            : [];
          const index = siblings.indexOf(el);
          const delay = Math.max(0, index) * 100;

          setTimeout(() => {
            el.classList.add('animate-in', 'revealed');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
          }, delay);

          observer.unobserve(el);
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((el) => {
      if (!el.classList.contains('scroll-animate') && !el.classList.contains('reveal-up')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition =
          'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      observer.observe(el);
    });
  }

  /* === HEADING REVEAL === */
  function initHeadingReveal() {
    const headings = document.querySelectorAll(
      '.slideshow .banner__heading, .section-featured-collection .title, .testimonials-header h2, .brand-showcase .section-title, .blog-posts .title, .rich-text__heading, .trust-badges-section .section-heading h2, .newsletter-perfume__title'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('heading-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    headings.forEach((h) => {
      h.style.opacity = '0';
      h.style.transform = 'translateY(24px)';
      h.style.transition =
        'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(h);
    });
  }

  /* === BACK TO TOP === */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          btn.classList.toggle('visible', window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* === HEADER SCROLL BEHAVIOR === */
  function initHeaderScroll() {
    const header = document.querySelector('.section-header');
    if (!header) return;

    let lastY = 0;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          header.classList.toggle('header--scrolled', y > 80);
          header.classList.toggle('header--hidden', y > lastY && y > 400);
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* === COLLECTION CARDS DRAG SCROLL === */
  function initCardRowScroll() {
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return;

    document.querySelectorAll('.collection-cards-row__scroll').forEach((row) => {
      let isDown = false;
      let startX;
      let scrollLeft;

      const isScrollable = () => row.scrollWidth > row.clientWidth + 2;
      const updateCursor = () => {
        row.style.cursor = isScrollable() ? 'grab' : 'default';
      };

      updateCursor();
      window.addEventListener('resize', updateCursor, { passive: true });

      row.addEventListener('mousedown', (e) => {
        if (!isScrollable()) return;
        isDown = true;
        row.style.cursor = 'grabbing';
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      });
      row.addEventListener('mouseleave', () => {
        isDown = false;
        updateCursor();
      });
      row.addEventListener('mouseup', () => {
        isDown = false;
        updateCursor();
      });
      row.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - row.offsetLeft;
        row.scrollLeft = scrollLeft - (x - startX) * 1.5;
      });
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
            const isTarget = p.getAttribute('data-tab-id') === target;
            p.style.opacity = '0';
            setTimeout(() => {
              p.style.display = isTarget ? '' : 'none';
              if (isTarget) requestAnimationFrame(() => { p.style.opacity = '1'; });
            }, 250);
          });
        });
      });
    });
  }

  /* === PRODUCT CARD PERFORMANCE === */
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
            const duration = 2200;
            const start = performance.now();

            (function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
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

  /* === PARALLAX ON HERO IMAGES === */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('.slideshow-component .banner__media img');
    if (!parallaxElements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              el.style.transform = 'translateY(' + (scrollY * 0.12) + 'px) scale(1.05)';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* === SMOOTH NEWSLETTER FOCUS GLOW === */
  function initNewsletterFocus() {
    document.querySelectorAll('.newsletter-perfume__input').forEach((input) => {
      const form = input.closest('.newsletter-perfume__form');
      if (!form) return;
      input.addEventListener('focus', () => form.classList.add('form--focused'));
      input.addEventListener('blur', () => form.classList.remove('form--focused'));
    });
  }

  /* === GOLD LINE ANIMATIONS ON SECTION ENTRY === */
  function initGoldLines() {
    const goldLines = document.querySelectorAll('.gold-line, .gold-sep');
    if (!goldLines.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transform = 'scaleX(1)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    goldLines.forEach((line) => {
      line.style.transform = 'scaleX(0)';
      line.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      line.style.transformOrigin = 'center';
      observer.observe(line);
    });
  }

  /* === IMAGE LAZY LOAD FADE-IN === */
  function initImageFadeIn() {
    if (!('IntersectionObserver' in window)) return;

    const images = document.querySelectorAll(
      '.collection-cards-row__image, .shop-by-gender__image, .brand-logo img, .article-card__image'
    );

    images.forEach((img) => {
      if (img.complete) return;
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.6s ease';
      img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
    });
  }

  /* === HEADING REVEALED STYLE INJECTION === */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .heading-revealed { opacity: 1 !important; transform: translateY(0) !important; }
      .newsletter-perfume__form.form--focused { box-shadow: 0 0 0 2px var(--lux-gold, #C8A96B); }
    `;
    document.head.appendChild(style);
  }

  /* === INIT ALL === */
  function init() {
    injectStyles();
    initPreloader();
    initScrollReveal();
    initHeadingReveal();
    initBackToTop();
    initHeaderScroll();
    initCardRowScroll();
    initCollectionTabs();
    initProductCards();
    initCounters();
    initParallax();
    initNewsletterFocus();
    initGoldLines();
    initImageFadeIn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


