/* =====================================================
   LUMISCENT — Smart Features Module
   Idealo Markup · Free Shipping Bar · Sticky ATC · Recently Viewed
   ===================================================== */

(function() {
  'use strict';

  /* ---------- UTILITY ---------- */
  var SETTINGS = window.__lumiscent || {};

  function formatMoney(cents) {
    var amount = (cents / 100).toFixed(2).replace('.', ',');
    return amount + '\u00A0\u20AC'; /* nbsp + € */
  }

  /* =================================================================
     1. IDEALO REFERRER PRICE MARKUP
     When a visitor arrives from Idealo, the landing product keeps its
     original price. Every OTHER product shows price + X markup.
     The markup amount is set in Theme Settings → Idealo Price Adjustment.
     ================================================================= */
  var Idealo = {
    STORAGE_KEY: 'lux_idealo_ref',
    LANDING_KEY: 'lux_idealo_landing',

    init: function() {
      if (!SETTINGS.idealo_enable) return;

      var pattern = (SETTINGS.idealo_referrer_pattern || 'idealo').toLowerCase();
      var referrer = (document.referrer || '').toLowerCase();

      /* Detect fresh Idealo arrival */
      if (referrer.indexOf(pattern) !== -1) {
        sessionStorage.setItem(this.STORAGE_KEY, '1');
        sessionStorage.setItem(this.LANDING_KEY, window.location.pathname);
      }

      /* If not an Idealo session, nothing to do */
      if (sessionStorage.getItem(this.STORAGE_KEY) !== '1') return;

      var landingPath = sessionStorage.getItem(this.LANDING_KEY) || '';
      var currentPath = window.location.pathname;
      var isLandingProduct = landingPath && currentPath === landingPath;
      var markupCents = parseInt(SETTINGS.idealo_markup_cents, 10) || 0;

      if (markupCents <= 0) return;

      /* Don't apply markup on the landing product page */
      if (isLandingProduct) return;

      /* Apply markup to all visible prices */
      this.applyMarkup(markupCents);

      /* Re-apply after Shopify AJAX events (variant change, quick add) */
      document.addEventListener('variant:change', function() {
        setTimeout(function() { Idealo.applyMarkup(markupCents); }, 300);
      });

      /* Watch for DOM changes (product cards loaded via infinite scroll, etc.) */
      if (window.MutationObserver) {
        var debounceTimer;
        var observer = new MutationObserver(function() {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(function() { Idealo.applyMarkup(markupCents); }, 200);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        /* Stop observing after 30s to avoid overhead */
        setTimeout(function() { observer.disconnect(); }, 30000);
      }

      /* Tag the cart so staff knows this is an Idealo session */
      this.tagCart();
    },

    applyMarkup: function(markupCents) {
      var priceEls = document.querySelectorAll(
        '.price-item--regular:not([data-lux-marked]), ' +
        '.price-item--sale:not([data-lux-marked])'
      );

      priceEls.forEach(function(el) {
        el.setAttribute('data-lux-marked', '1');
        var text = el.textContent.trim();
        /* Parse European price format: "29,99 €" or "€29.99" */
        var cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.');
        var originalCents = Math.round(parseFloat(cleaned) * 100);
        if (isNaN(originalCents) || originalCents <= 0) return;
        var newCents = originalCents + markupCents;
        el.textContent = formatMoney(newCents);
        el.setAttribute('data-lux-original', originalCents);
        el.setAttribute('data-lux-adjusted', newCents);
      });
    },

    tagCart: function() {
      fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: { '_idealo_referral': 'true', '_idealo_markup_cents': String(SETTINGS.idealo_markup_cents || 0) }
        })
      }).catch(function() {});
    }
  };

  /* =================================================================
     2. FREE SHIPPING PROGRESS BAR
     Shows a progress bar in the cart drawer indicating how far the
     customer is from the free shipping threshold.
     ================================================================= */
  var FreeShippingBar = {
    init: function() {
      if (!SETTINGS.free_shipping_enable) return;
      this.threshold = parseInt(SETTINGS.free_shipping_threshold, 10);
      this.message = SETTINGS.free_shipping_message || "Kostenloser Versand f\u00fcr alle Bestellungen!";
      this.successMessage = SETTINGS.free_shipping_success_message || "Kostenloser Versand f\u00fcr alle Bestellungen!";

      this.injectBar();
      this.update();

      /* Listen for cart changes */
      document.addEventListener('cart:change', this.update.bind(this));
      /* Fallback: poll for changes */
      setInterval(this.update.bind(this), 3000);
    },

    injectBar: function() {
      var bar = document.createElement('div');
      bar.className = 'free-shipping-bar';
      bar.innerHTML =
        '<div class="free-shipping-bar__inner">' +
          '<div class="free-shipping-bar__text"></div>' +
          '<div class="free-shipping-bar__track">' +
            '<div class="free-shipping-bar__fill"></div>' +
          '</div>' +
        '</div>';
      this.barEl = bar;
      this.textEl = bar.querySelector('.free-shipping-bar__text');
      this.fillEl = bar.querySelector('.free-shipping-bar__fill');

      /* Try to inject into cart drawer header */
      var targets = [
        'cart-drawer .cart-drawer__head',
        'cart-drawer-items',
        '.cart-drawer',
        '.drawer__header'
      ];
      var inserted = false;
      for (var i = 0; i < targets.length; i++) {
        var target = document.querySelector(targets[i]);
        if (target) {
          target.parentNode.insertBefore(bar, target.nextSibling);
          inserted = true;
          break;
        }
      }
      /* Also inject on /cart page */
      var cartPageForm = document.querySelector('form[action="/cart"]');
      if (cartPageForm && !inserted) {
        cartPageForm.parentNode.insertBefore(bar.cloneNode(true), cartPageForm);
      }
    },

    update: function() {
      var self = this;
      fetch('/cart.js')
        .then(function(r) { return r.json(); })
        .then(function(cart) {
          var total = cart.total_price; /* in cents */

          /* Threshold 0 = free shipping on all orders */
          if (self.threshold <= 0) {
            self.fillEl.style.width = '100%';
            self.textEl.textContent = self.successMessage;
            self.barEl.classList.add('free-shipping-bar--success');
            self.fillEl.style.background = 'var(--lux-green, #27ae60)';
            return;
          }

          var pct = Math.min((total / self.threshold) * 100, 100);
          self.fillEl.style.width = pct + '%';

          if (total >= self.threshold) {
            self.textEl.textContent = self.successMessage;
            self.barEl.classList.add('free-shipping-bar--success');
            self.fillEl.style.background = 'var(--lux-green, #27ae60)';
          } else {
            var remaining = ((self.threshold - total) / 100).toFixed(2).replace('.', ',');
            self.textEl.textContent = self.message.replace('AMOUNT', remaining);
            self.barEl.classList.remove('free-shipping-bar--success');
            self.fillEl.style.background = 'var(--lux-gold, #C8A96B)';
          }
        })
        .catch(function() {});
    }
  };

  /* =================================================================
     3. STICKY ADD-TO-CART BAR (Product Pages)
     A compact bar that slides up from the bottom when the main ATC
     button scrolls out of view.
     ================================================================= */
  var StickyATC = {
    init: function() {
      /* Only on product pages */
      var mainBtn = document.querySelector('.product-form__submit');
      if (!mainBtn) return;

      this.createBar();
      this.mainBtn = mainBtn;
      this.visible = false;

      var self = this;
      var ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(function() {
            self.check();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },

    createBar: function() {
      var productTitle = document.querySelector('.product__title');
      var priceEl = document.querySelector('.product .price-item--regular, .product .price-item--sale');
      var mainForm = document.querySelector('.product-form__submit');
      if (!mainForm) return;

      var titleText = productTitle ? productTitle.textContent.trim() : '';
      var priceText = priceEl ? priceEl.textContent.trim() : '';
      var btnText = mainForm.textContent.trim();
      var productImg = document.querySelector('.product__media-item img');
      var imgSrc = productImg ? productImg.getAttribute('src') : '';

      var bar = document.createElement('div');
      bar.className = 'sticky-atc-bar';
      bar.innerHTML =
        '<div class="sticky-atc-bar__inner page-width">' +
          (imgSrc ? '<img class="sticky-atc-bar__img" src="' + imgSrc + '" alt="" width="48" height="48">' : '') +
          '<div class="sticky-atc-bar__info">' +
            '<span class="sticky-atc-bar__title">' + titleText + '</span>' +
            '<span class="sticky-atc-bar__price">' + priceText + '</span>' +
          '</div>' +
          '<button type="button" class="sticky-atc-bar__btn">' + btnText + '</button>' +
        '</div>';

      document.body.appendChild(bar);
      this.bar = bar;

      /* Click triggers the real ATC button */
      bar.querySelector('.sticky-atc-bar__btn').addEventListener('click', function() {
        var realBtn = document.querySelector('.product-form__submit');
        if (realBtn && !realBtn.disabled) {
          realBtn.click();
          /* Brief feedback */
          this.textContent = '✓ Added';
          var self = this;
          setTimeout(function() { self.textContent = btnText; }, 1500);
        }
      });
    },

    check: function() {
      if (!this.bar || !this.mainBtn) return;
      var rect = this.mainBtn.getBoundingClientRect();
      var shouldShow = rect.bottom < 0;
      if (shouldShow && !this.visible) {
        this.bar.classList.add('sticky-atc-bar--visible');
        this.visible = true;
      } else if (!shouldShow && this.visible) {
        this.bar.classList.remove('sticky-atc-bar--visible');
        this.visible = false;
      }
    }
  };

  
  var RecentlyViewed = {
    KEY: 'lux_recently_viewed',
    MAX: 12,

    init: function() {
      this.track();
      this.render();
    },

    track: function() {
      /* Only on product pages */
      var productJson = document.querySelector('[data-product-json], script[type="application/json"][data-product]');
      var handle = window.location.pathname.match(/\/products\/([^/?#]+)/);
      if (!handle) return;

      var slug = handle[1];
      var items = this.getItems();

      /* Get product info from the page */
      var title = '';
      var price = '';
      var image = '';
      var url = window.location.pathname;

      var titleEl = document.querySelector('.product__title');
      if (titleEl) title = titleEl.textContent.trim();
      var priceEl = document.querySelector('.product .price-item--regular, .product .price-item');
      if (priceEl) price = priceEl.textContent.trim();
      var imgEl = document.querySelector('.product__media-item img');
      if (imgEl) image = imgEl.getAttribute('src') || '';

      /* Remove if already in list */
      items = items.filter(function(item) { return item.slug !== slug; });
      /* Add to front */
      items.unshift({ slug: slug, title: title, price: price, image: image, url: url });
      /* Limit */
      items = items.slice(0, this.MAX);

      try {
        localStorage.setItem(this.KEY, JSON.stringify(items));
      } catch(e) {}
    },

    getItems: function() {
      try {
        return JSON.parse(localStorage.getItem(this.KEY)) || [];
      } catch(e) {
        return [];
      }
    },

    render: function() {
      var items = this.getItems();
      /* Don't show current product */
      var currentHandle = (window.location.pathname.match(/\/products\/([^/?#]+)/) || [])[1];
      items = items.filter(function(item) { return item.slug !== currentHandle; });

      if (items.length < 2) return;

      /* Only inject on product pages and collection pages */
      var isProductPage = /\/products\//.test(window.location.pathname);
      var isCollectionPage = /\/collections\//.test(window.location.pathname);
      if (!isProductPage && !isCollectionPage) return;

      var existing = document.querySelector('.recently-viewed');
      if (existing) existing.remove();

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      var html =
        '<section class="recently-viewed">' +
          '<div class="page-width">' +
            '<div class="recently-viewed__header">' +
              '<span class="recently-viewed__eyebrow">Recently Viewed</span>' +
              '<h2 class="recently-viewed__title">Continue Your Journey</h2>' +
            '</div>' +
            '<div class="recently-viewed__scroll">';

      function resizedImageUrl(url, width) {
        if (!url) return '';
        var cleanUrl = url.replace(/([?&])width=\d+/g, '').replace(/[?&]$/, '');
        return cleanUrl + (cleanUrl.indexOf('?') === -1 ? '?' : '&') + 'width=' + width;
      }

      items.forEach(function(item) {
        var safeUrl = /^\//.test(item.url || '') ? item.url : '/collections/all';
        var safeTitle = escapeHtml(item.title || 'Product');
        var safePrice = escapeHtml(item.price || '');
        var safeImg = item.image ? resizedImageUrl(item.image, 300) : '';

        html +=
          '<a href="' + safeUrl + '" class="recently-viewed__card">' +
            '<div class="recently-viewed__img-wrap">' +
              (safeImg ? '<img src="' + safeImg + '" alt="' + safeTitle + '" loading="lazy" width="150" height="200">' : '<div class="recently-viewed__placeholder"></div>') +
            '</div>' +
            '<div class="recently-viewed__info">' +
              '<span class="recently-viewed__name">' + safeTitle + '</span>' +
              '<span class="recently-viewed__price">' + safePrice + '</span>' +
            '</div>' +
          '</a>';
      });

      html += '</div></div></section>';

      /* Insert before footer */
      var footer = document.querySelector('.footer');
      if (footer) {
        footer.insertAdjacentHTML('beforebegin', html);
      }
    }
  };

  /* =================================================================
     5. LOW STOCK URGENCY INDICATOR
     If a product variant has inventory_quantity ≤ 5, show a message.
     ================================================================= */
  var StockUrgency = {
    init: function() {
      var info = document.querySelector('product-info');
      if (!info) return;
      /* Dawn product-info reads variant JSON */
      var selects = document.querySelectorAll('variant-selects, variant-radios');
      if (!selects.length) return;

      this.injectContainer();
      this.observe();
    },

    injectContainer: function() {
      var priceEl = document.querySelector('.product .price');
      if (!priceEl) return;
      var container = document.createElement('div');
      container.className = 'stock-urgency';
      container.style.display = 'none';
      priceEl.parentNode.insertBefore(container, priceEl.nextSibling);
      this.container = container;
    },

    observe: function() {
      var container = this.container;
      if (!container) return;

      /* Watch for variant change events from Dawn */
      document.addEventListener('change', function(e) {
        if (!e.target.closest('variant-selects, variant-radios')) return;
        setTimeout(function() {
          var pickup = document.querySelector('.pickup-availability-preview');
          var inventoryEl = document.querySelector('[data-selected-variant]');
          /* Check if "Low stock" or specific inventory text is visible */
          var badge = document.querySelector('.product .badge--low-stock, .inventory--low');
          if (badge) {
            container.textContent = '🔥 Low stock — order soon!';
            container.style.display = 'block';
          } else {
            container.style.display = 'none';
          }
        }, 400);
      });
    }
  };

  /* =================================================================
     INIT — Wait for DOM ready
     ================================================================= */
  function initAll() {
    Idealo.init();
    FreeShippingBar.init();
    StickyATC.init();
    RecentlyViewed.init();
    StockUrgency.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
