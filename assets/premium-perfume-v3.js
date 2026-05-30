/* =====================================================
   LUMISCENT — World-Class Luxury Theme JavaScript v3
   Ultra-Premium Interactions & Animations
   ===================================================== */

(function () {
  'use strict';

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hidePreloader();
      return;
    }

    const isMobile = window.innerWidth < 750;
    const fastDelay = isMobile ? 250 : 400;
    const fallbackDelay = isMobile ? 1100 : 1800;

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, fastDelay);
    } else {
      window.addEventListener('load', () => setTimeout(hidePreloader, fastDelay));
      setTimeout(hidePreloader, fallbackDelay);
    }
  }

  /* === SCROLL REVEAL WITH STAGGER === */
  function initScrollReveal() {
    if (window.innerWidth < 750) return; // performance on mobile
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
    if (window.innerWidth < 750) return; // performance on mobile
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

  /* === PREMIUM SCROLL PROGRESS === */
  function initScrollProgress() {
    if (document.querySelector('.lux-scroll-progress')) return;

    const progress = document.createElement('div');
    progress.className = 'lux-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');

    const bar = document.createElement('div');
    bar.className = 'lux-scroll-progress__bar';
    progress.appendChild(bar);
    document.body.appendChild(progress);

    let ticking = false;

    function updateProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = 'scaleX(' + value + ')';
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      requestAnimationFrame(updateProgress);
      ticking = true;
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    updateProgress();
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

  /* === PRODUCT CARD PERFORMANCE + PREMIUM MOTION === */
  function initProductCards() {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const canTilt = isFinePointer && !reduceMotion();

    document.querySelectorAll('.card--media, .card--standard').forEach((card) => {
      if (card.dataset.luxCardBound === 'true') return;
      card.dataset.luxCardBound = 'true';
      card.classList.add('lux-dynamic-card');

      const media = card.querySelector('.media');

      card.addEventListener('mouseenter', () => {
        card.classList.add('lux-card-active');
        if (media) media.style.willChange = 'transform';
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('lux-card-active');
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        if (media) media.style.willChange = 'auto';
      });

      card.addEventListener('focusin', () => card.classList.add('lux-card-active'));
      card.addEventListener('focusout', () => card.classList.remove('lux-card-active'));

      if (!canTilt) return;

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const tiltY = (x - 0.5) * 4;
        const tiltX = (0.5 - y) * 3;

        card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
        card.style.setProperty('--shine-x', Math.round(x * 100) + '%');
      });
    });
  }

  /* === DYNAMIC SCENT-LINE AMBIENCE === */
  function initSectionAmbience() {
    const isReducedMotion = reduceMotion();

    const sections = document.querySelectorAll(
      '.section-video-hero, .video-hero, .slideshow .banner, .collection-hero-lux, .brand-story, .brand-showcase, .trust-badges-section, .newsletter-perfume, .fragrance-quiz, .featured-collection-slider'
    );

    sections.forEach((section, sectionIndex) => {
      const alreadyHasLayer = Array.from(section.children).some((child) =>
        child.classList.contains('lux-ambient-layer')
      );
      if (alreadyHasLayer) return;

      const layer = document.createElement('div');
      layer.className = 'lux-ambient-layer';
      layer.setAttribute('aria-hidden', 'true');

      const isHero = section.matches('.section-video-hero, .video-hero, .slideshow .banner, .collection-hero-lux');
      const lineCount = isReducedMotion ? (isHero ? 5 : 3) : (isHero ? 10 : 6);

      for (let i = 0; i < lineCount; i += 1) {
        const line = document.createElement('span');
        line.className = 'lux-scent-line';

        const left = 4 + ((i * 19 + sectionIndex * 11) % 88);
        const top = 10 + ((i * 23 + sectionIndex * 7) % 72);
        const width = 58 + ((i * 17 + sectionIndex * 13) % 92);
        const angle = -18 + ((i * 9 + sectionIndex * 5) % 36);
        const duration = 12 + ((i + sectionIndex) % 6);
        const delay = -1 * ((i * 1.7 + sectionIndex) % 10);

        line.style.setProperty('--line-left', left + '%');
        line.style.setProperty('--line-top', top + '%');
        line.style.setProperty('--line-width', width + 'px');
        line.style.setProperty('--line-angle', angle + 'deg');
        line.style.setProperty('--line-duration', duration + 's');
        line.style.setProperty('--line-delay', delay + 's');
        layer.appendChild(line);
      }

      section.appendChild(layer);
    });
  }

  /* === CAROUSEL MOTION CUES === */
  function initCarouselCues() {
    const rows = document.querySelectorAll(
      '.featured-collection-slider__track.slider, .collection-cards-row__scroll, .recently-viewed__scroll'
    );
    if (!rows.length) return;

    rows.forEach((row) => {
      if (row.dataset.luxCarouselBound === 'true') return;
      row.dataset.luxCarouselBound = 'true';

      const frame =
        row.closest('.featured-collection-slider') ||
        row.closest('.collection-cards-row') ||
        row.closest('.recently-viewed') ||
        row.parentElement;

      if (!frame) return;

      const isScrollable = () => row.scrollWidth > row.clientWidth + 8;

      function updateState() {
        const scrollable = isScrollable();
        frame.classList.toggle('lux-carousel-ready', scrollable);
        row.dataset.luxScrollable = scrollable ? 'true' : 'false';

        if (!scrollable) return;

        const atStart = row.scrollLeft <= 4;
        const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
        frame.classList.toggle('lux-carousel-at-start', atStart);
        frame.classList.toggle('lux-carousel-at-end', atEnd);
      }

      updateState();
      window.addEventListener('resize', updateState, { passive: true });
      row.addEventListener('scroll', updateState, { passive: true });

      if (reduceMotion() || !('IntersectionObserver' in window)) return;

      let userEngaged = false;
      row.addEventListener('pointerdown', () => { userEngaged = true; }, { passive: true });
      row.addEventListener('mouseenter', () => { userEngaged = true; }, { passive: true });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || !isScrollable()) return;
            observer.unobserve(row);

            window.setTimeout(() => {
              if (userEngaged || row.scrollLeft > 4) return;

              const distance = Math.min(96, row.scrollWidth - row.clientWidth);
              row.scrollTo({ left: distance, behavior: 'smooth' });
              window.setTimeout(() => {
                if (!userEngaged) row.scrollTo({ left: 0, behavior: 'smooth' });
              }, 850);
            }, 700);
          });
        },
        { threshold: 0.45 }
      );

      observer.observe(row);
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
    if (window.innerWidth < 750) return; // performance on mobile
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
    initScrollProgress();
    initScrollReveal();
    initHeadingReveal();
    initBackToTop();
    initHeaderScroll();
    initCardRowScroll();
    initCollectionTabs();
    initProductCards();
    initSectionAmbience();
    initCarouselCues();
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


