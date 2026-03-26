/* =====================================================
   LUMISCENT — Luxury Theme JavaScript
   Premium Interactions & Animations
   ===================================================== */

(function () {
  'use strict';

  /* === PRELOADER === */
  function initPreloader() {
    const preloader = document.querySelector('.site-preloader');
    if (!preloader) return;

    function hidePreloader() {
      preloader.classList.add('loaded');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 600);
    }

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 300);
    } else {
      window.addEventListener('load', function () {
        setTimeout(hidePreloader, 300);
      });
      // Fallback - never show preloader for more than 4 seconds
      setTimeout(hidePreloader, 4000);
    }
  }

  /* === SCROLL REVEAL ANIMATIONS === */
  function initScrollAnimations() {
    const selectors = [
      '.scroll-animate',
      '.reveal-up',
      '.collection-cards-row__card',
      '.shop-by-gender__card',
      '.testimonial-card',
      '.trust-badge',
      '.brand-item',
      '.fragrance-finder__option',
      '.section-featured-collection .card-wrapper',
      '.article-card'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Staggered reveal
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.children).filter(el => elements.length && el.matches(selectors.join(', ')))
              : [];
            const index = siblings.indexOf(entry.target);
            const delay = Math.max(0, index) * 80;

            setTimeout(() => {
              entry.target.classList.add('animate-in', 'revealed');
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => {
      if (!el.classList.contains('scroll-animate') && !el.classList.contains('reveal-up')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      observer.observe(el);
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
          btn.classList.toggle('visible', window.scrollY > 500);
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
          header.classList.toggle('header--scrolled', y > 60);
          header.classList.toggle('header--hidden', y > lastY && y > 300);
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
            const isTarget = p.getAttribute('data-tab-id') === target;
            p.style.opacity = '0';
            setTimeout(() => {
              p.style.display = isTarget ? '' : 'none';
              if (isTarget) {
                requestAnimationFrame(() => { p.style.opacity = '1'; });
              }
            }, 200);
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
            const duration = 2000;
            const start = performance.now();

            (function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
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

  /* === SMOOTH SECTION PARALLAX === */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('.slideshow-component .banner__media img');
    if (!parallaxElements.length) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              const speed = 0.15;
              el.style.transform = 'translateY(' + (scrollY * speed) + 'px) scale(1.05)';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* === TEXT SPLIT ANIMATION FOR HEADINGS === */
  function initHeadingReveal() {
    const headings = document.querySelectorAll(
      '.slideshow .banner__heading, .section-featured-collection .title, .testimonials-header h2, .brand-showcase .section-title'
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
      { threshold: 0.3 }
    );

    headings.forEach((h) => {
      h.style.opacity = '0';
      h.style.transform = 'translateY(20px)';
      h.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(h);
    });
  }

  // Helper for heading reveal
  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = '.heading-revealed { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
  });

  /* === SMOOTH NEWSLETTER FOCUS === */
  function initNewsletterFocus() {
    const inputs = document.querySelectorAll('.newsletter-perfume__input');
    inputs.forEach((input) => {
      const form = input.closest('.newsletter-perfume__form');
      if (!form) return;
      input.addEventListener('focus', () => { form.style.boxShadow = '0 4px 20px rgba(197, 164, 126, 0.15)'; });
      input.addEventListener('blur', () => { form.style.boxShadow = ''; });
    });
  }

  /* === INIT ALL === */
  function init() {
    initPreloader();
    initScrollAnimations();
    initBackToTop();
    initHeaderScroll();
    initCardRowScroll();
    initCollectionTabs();
    initProductCards();
    initCounters();
    initParallax();
    initHeadingReveal();
    initNewsletterFocus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on Shopify section load (theme editor)
  document.addEventListener('shopify:section:load', () => {
    initScrollAnimations();
    initCardRowScroll();
    initCollectionTabs();
    initProductCards();
    initCounters();
    initHeadingReveal();
    initNewsletterFocus();
  });
})();
