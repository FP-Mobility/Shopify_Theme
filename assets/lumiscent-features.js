/* =====================================================
   LUMISCENT — Smart Features Module
   Referral Markup · Free Shipping Bar · Sticky ATC · Recently Viewed
   ===================================================== */

(function() {
  'use strict';

  var SETTINGS = window.__lumiscent || {};

  function formatMoney(cents) {
    var amount = (cents / 100).toFixed(2).replace('.', ',');
    return amount + '\u00A0\u20AC';
  }

  /* =================================================================
     1. REFERRAL PRICE MARKUP
     Supports multiple referral sources: idealo, google, bing, etc.
     Landing product keeps original price.
     All other products: display + cart + checkout show marked-up price.
     ================================================================= */
  var Idealo = {
    STORAGE_KEY:        'lux_ref_active',
    LANDING_KEY:        'lux_ref_landing',
    MARKUP_KEY:         'lux_ref_markup',
    SOURCE_KEY:         'lux_ref_source',
    SESSION_EXPIRY_KEY: 'lux_ref_expiry',
    SESSION_MINUTES:    30,
    _intercepting:      false,

    /* Returns which referral source matched, or null for direct visitors */
    detectSource: function(referrer) {
      if (!SETTINGS.idealo_enable) return null;
      var patternsRaw = SETTINGS.referral_patterns || SETTINGS.idealo_referrer_pattern || 'idealo';
      var patterns = patternsRaw.split(',').map(function(p) { return p.trim().toLowerCase(); });
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i] && referrer.indexOf(patterns[i]) !== -1) return patterns[i];
      }
      return null;
    },

    init: function() {
      if (!SETTINGS.idealo_enable) return;

      var referrer = (document.referrer || '').toLowerCase();
      var source   = this.detectSource(referrer);

      /* Fresh referral arrival */
      if (source) {
        var expiry = Date.now() + this.SESSION_MINUTES * 60 * 1000;
        sessionStorage.setItem(this.STORAGE_KEY,        '1');
        sessionStorage.setItem(this.LANDING_KEY,        window.location.pathname);
        sessionStorage.setItem(this.MARKUP_KEY,         String(SETTINGS.idealo_markup_cents || 0));
        sessionStorage.setItem(this.SOURCE_KEY,         source);
        sessionStorage.setItem(this.SESSION_EXPIRY_KEY, String(expiry));
      }

      /* Check session expiry */
      var expiry = parseInt(sessionStorage.getItem(this.SESSION_EXPIRY_KEY) || '0', 10);
      if (expiry && Date.now() > expiry) { this.clearSession(); return; }
      if (sessionStorage.getItem(this.STORAGE_KEY) !== '1') return;

      var landingPath  = sessionStorage.getItem(this.LANDING_KEY) || '';
      var currentPath  = window.location.pathname;
      var isLanding    = landingPath && currentPath === landingPath;
      var markupCents  = parseInt(sessionStorage.getItem(this.MARKUP_KEY) || '0', 10) || 0;
      var adjVariantId = parseInt(SETTINGS.idealo_adj_variant_id || '0', 10);

      if (markupCents <= 0) return;

      /* A) DISPLAY: adjust visible prices on non-landing pages */
      if (!isLanding) {
        this.applyMarkup(markupCents);

        document.addEventListener('variant:change', function() {
          setTimeout(function() { Idealo.applyMarkup(markupCents); }, 300);
        });

        if (window.MutationObserver) {
          var debounceTimer;
          var observer = new MutationObserver(function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() { Idealo.applyMarkup(markupCents); }, 200);
          });
          observer.observe(document.body, { childList: true, subtree: true });
          setTimeout(function() { observer.disconnect(); }, 30000);
        }
      }

      /* B) CART: intercept ATC to auto-add Price Adjustment line item */
      if (adjVariantId) {
        this.interceptAddToCart(markupCents, adjVariantId, landingPath);
        this.hideAdjustmentRemoveButton(adjVariantId);
        this.watchCartForRemoval(markupCents, adjVariantId);
      }

      /* C) Tag cart attributes — visible in Shopify Admin on every order */
      this.tagCart(markupCents);
    },

    clearSession: function() {
      var keys = [this.STORAGE_KEY, this.LANDING_KEY, this.MARKUP_KEY, this.SOURCE_KEY, this.SESSION_EXPIRY_KEY];
      keys.forEach(function(k) { sessionStorage.removeItem(k); });
    },

    applyMarkup: function(markupCents) {
      var priceEls = document.querySelectorAll(
        '.price-item--regular:not([data-lux-marked]), ' +
        '.price-item--sale:not([data-lux-marked])'
      );
      priceEls.forEach(function(el) {
        el.setAttribute('data-lux-marked', '1');
        var text = el.textContent.trim();
        var cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.');
        var originalCents = Math.round(parseFloat(cleaned) * 100);
        if (isNaN(originalCents) || originalCents <= 0) return;
        var newCents = originalCents + markupCents;
        el.textContent = formatMoney(newCents);
        el.setAttribute('data-lux-original', originalCents);
        el.setAttribute('data-lux-adjusted', newCents);
      });
    },

    /* Intercept fetch(/cart/add.js) and append Price Adjustment item */
    interceptAddToCart: function(markupCents, adjVariantId, landingPath) {
      if (this._intercepting) return;
      this._intercepting = true;

      var origFetch = window.fetch;
      window.fetch = function(url, opts) {
        var result = origFetch.apply(this, arguments);

        if (typeof url === 'string' && url.indexOf('/cart/add') !== -1 && opts && opts.body) {
          result.then(function(res) {
            res.clone().json().then(function() {
              var addedPath = '';
              if (opts.body instanceof FormData) {
                addedPath = opts.body.get('sections_url') || window.location.pathname;
              }
              var isLandingAdd  = landingPath && addedPath === landingPath;
              var addedVariant  = opts.body instanceof FormData
                ? parseInt(opts.body.get('id') || '0', 10) : 0;
              var isAdjItself   = addedVariant === adjVariantId;

              if (!isLandingAdd && !isAdjItself) {
                Idealo.addAdjustmentItem(markupCents, adjVariantId);
              }
            }).catch(function() {});
          }).catch(function() {});
        }
        return result;
      };
    },

    /* Add/update Price Adjustment — quantity matches total real items in cart */
    addAdjustmentItem: function(markupCents, adjVariantId) {
      var self = this;
      /* Wait 800ms for cart to fully update before reading it */
      setTimeout(function() {
        fetch('/cart.js')
          .then(function(r) { return r.json(); })
          .then(function(cart) {
            /* Count total quantity of real (non-adjustment) items */
            var realQty = 0;
            var adjItem = null;
            (cart.items || []).forEach(function(i) {
              if (i.variant_id === adjVariantId) {
                adjItem = i;
              } else {
                realQty += i.quantity;
              }
            });

            if (realQty <= 0) return;

            if (adjItem) {
              /* Already exists — update quantity if needed */
              if (adjItem.quantity !== realQty) {
                fetch('/cart/change.js', {
                  method:  'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: adjVariantId, quantity: realQty })
                }).catch(function() {});
              }
            } else {
              /* Doesn't exist — add it */
              fetch('/cart/add.js', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id:       adjVariantId,
                  quantity: realQty,
                  properties: {
                    '_adj_type':    'referral_markup',
                    '_adj_cents':   markupCents,
                    '_adj_display': formatMoney(markupCents)
                  }
                })
              }).catch(function() {});
            }
          }).catch(function() {});
      }, 800);
    },

    /* Hide the remove button on the Price Adjustment line item */
    hideAdjustmentRemoveButton: function(adjVariantId) {
      var style = document.createElement('style');
      style.textContent =
        'cart-remove-button[data-variant-id="' + adjVariantId + '"] { display:none !important; }' +
        '.cart-item[data-variant-id="' + adjVariantId + '"] .cart-remove-button { display:none !important; }';
      document.head.appendChild(style);
    },

    /* If the adjustment is removed or quantity is wrong, fix it */
    watchCartForRemoval: function(markupCents, adjVariantId) {
      document.addEventListener('cart:change', function() {
        setTimeout(function() {
          fetch('/cart.js')
            .then(function(r) { return r.json(); })
            .then(function(cart) {
              var hasAdj  = (cart.items || []).some(function(i) { return i.variant_id === adjVariantId; });
              var hasReal = (cart.items || []).some(function(i) { return i.variant_id !== adjVariantId; });
              if (hasReal && !hasAdj) Idealo.addAdjustmentItem(markupCents, adjVariantId);
            }).catch(function() {});
        }, 600);
      });
    },

    /* Tag cart attributes for Shopify Admin order visibility */
    tagCart: function(markupCents) {
      var source = sessionStorage.getItem(this.SOURCE_KEY) || 'unknown';
      fetch('/cart/update.js', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            '_ref_active':       'true',
            '_ref_source':       source,
            '_ref_markup_cents': String(markupCents),
            '_ref_markup_eur':   (markupCents / 100).toFixed(2),
            '_ref_landing':      sessionStorage.getItem('lux_ref_landing') || ''
          }
        })
      }).catch(function() {});
    }
  };

  /* =================================================================
     2. FREE SHIPPING PROGRESS BAR
     ================================================================= */
  var FreeShippingBar = {
    init: function() {
      if (!SETTINGS.free_shipping_enable) return;
      this.threshold      = parseInt(SETTINGS.free_shipping_threshold, 10);
      this.message        = SETTINGS.free_shipping_message || "Kostenloser Versand f\u00fcr alle Bestellungen!";
      this.successMessage = SETTINGS.free_shipping_success_message || "Kostenloser Versand f\u00fcr alle Bestellungen!";
      this.injectBar();
      this.update();
      document.addEventListener('cart:change', this.update.bind(this));
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
      this.barEl  = bar;
      this.textEl = bar.querySelector('.free-shipping-bar__text');
      this.fillEl = bar.querySelector('.free-shipping-bar__fill');

      var targets  = ['cart-drawer .cart-drawer__head','cart-drawer-items','.cart-drawer','.drawer__header'];
      var inserted = false;
      for (var i = 0; i < targets.length; i++) {
        var target = document.querySelector(targets[i]);
        if (target) { target.parentNode.insertBefore(bar, target.nextSibling); inserted = true; break; }
      }
      var cartPageForm = document.querySelector('form[action="/cart"]');
      if (cartPageForm && !inserted) cartPageForm.parentNode.insertBefore(bar.cloneNode(true), cartPageForm);
    },

    update: function() {
      var self = this;
      fetch('/cart.js').then(function(r) { return r.json(); }).then(function(cart) {
        var total = cart.total_price;
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
      }).catch(function() {});
    }
  };

  /* =================================================================
     3. STICKY ADD-TO-CART BAR
     ================================================================= */
  var StickyATC = {
    init: function() {
      var mainBtn = document.querySelector('.product-form__submit');
      if (!mainBtn) return;
      this.createBar();
      this.mainBtn = mainBtn;
      this.visible = false;
      var self = this, ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(function() { self.check(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });
    },

    createBar: function() {
      var productTitle = document.querySelector('.product__title');
      var priceEl      = document.querySelector('.product .price-item--regular, .product .price-item--sale');
      var mainForm     = document.querySelector('.product-form__submit');
      if (!mainForm) return;
      var titleText = productTitle ? productTitle.textContent.trim() : '';
      var priceText = priceEl      ? priceEl.textContent.trim()      : '';
      var btnText   = mainForm.textContent.trim();
      var productImg = document.querySelector('.product__media-item img');
      var imgSrc     = productImg ? productImg.getAttribute('src') : '';
      var bar        = document.createElement('div');
      bar.className  = 'sticky-atc-bar';
      bar.innerHTML  =
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
      bar.querySelector('.sticky-atc-bar__btn').addEventListener('click', function() {
        var realBtn = document.querySelector('.product-form__submit');
        if (realBtn && !realBtn.disabled) {
          realBtn.click();
          this.textContent = '\u2713 Added';
          var self = this;
          setTimeout(function() { self.textContent = btnText; }, 1500);
        }
      });
    },

    check: function() {
      if (!this.bar || !this.mainBtn) return;
      var rect = this.mainBtn.getBoundingClientRect(), shouldShow = rect.bottom < 0;
      if (shouldShow  && !this.visible) { this.bar.classList.add('sticky-atc-bar--visible');    this.visible = true;  }
      if (!shouldShow &&  this.visible) { this.bar.classList.remove('sticky-atc-bar--visible'); this.visible = false; }
    }
  };

  /* =================================================================
     4. RECENTLY VIEWED PRODUCTS
     ================================================================= */
  var RecentlyViewed = {
    KEY: 'lux_recently_viewed',
    MAX: 12,

    init: function() { this.track(); this.render(); },

    track: function() {
      var handle = window.location.pathname.match(/\/products\/([^/?#]+)/);
      if (!handle) return;
      var slug = handle[1], items = this.getItems();
      var title = '', price = '', image = '', url = window.location.pathname;
      var titleEl = document.querySelector('.product__title');
      if (titleEl) title = titleEl.textContent.trim();
      var priceEl = document.querySelector('.product .price-item--regular, .product .price-item');
      if (priceEl) price = priceEl.textContent.trim();
      var imgEl = document.querySelector('.product__media-item img');
      if (imgEl) image = imgEl.getAttribute('src') || '';
      items = items.filter(function(item) { return item.slug !== slug; });
      items.unshift({ slug: slug, title: title, price: price, image: image, url: url });
      items = items.slice(0, this.MAX);
      try { localStorage.setItem(this.KEY, JSON.stringify(items)); } catch(e) {}
    },

    getItems: function() {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch(e) { return []; }
    },

    render: function() {
      var items = this.getItems();
      var currentHandle = (window.location.pathname.match(/\/products\/([^/?#]+)/) || [])[1];
      items = items.filter(function(item) { return item.slug !== currentHandle; });
      if (items.length < 2) return;
      var isProductPage    = /\/products\//.test(window.location.pathname);
      var isCollectionPage = /\/collections\//.test(window.location.pathname);
      if (!isProductPage && !isCollectionPage) return;
      var existing = document.querySelector('.recently-viewed');
      if (existing) existing.remove();

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
      }
      function resizedImageUrl(url, width) {
        if (!url) return '';
        var cleanUrl = url.replace(/([?&])width=\d+/g, '').replace(/[?&]$/, '');
        return cleanUrl + (cleanUrl.indexOf('?') === -1 ? '?' : '&') + 'width=' + width;
      }

      var html =
        '<section class="recently-viewed"><div class="page-width">' +
          '<div class="recently-viewed__header">' +
            '<span class="recently-viewed__eyebrow">Recently Viewed</span>' +
            '<h2 class="recently-viewed__title">Continue Your Journey</h2>' +
          '</div><div class="recently-viewed__scroll">';

      items.forEach(function(item) {
        var safeUrl   = /^\//.test(item.url || '') ? item.url : '/collections/all';
        var safeTitle = escapeHtml(item.title || 'Product');
        var safePrice = escapeHtml(item.price || '');
        var safeImg   = item.image ? resizedImageUrl(item.image, 300) : '';
        html +=
          '<a href="' + safeUrl + '" class="recently-viewed__card">' +
            '<div class="recently-viewed__img-wrap">' +
              (safeImg ? '<img src="' + safeImg + '" alt="' + safeTitle + '" loading="lazy" width="150" height="200">' : '<div class="recently-viewed__placeholder"></div>') +
            '</div>' +
            '<div class="recently-viewed__info">' +
              '<span class="recently-viewed__name">'  + safeTitle + '</span>' +
              '<span class="recently-viewed__price">' + safePrice + '</span>' +
            '</div>' +
          '</a>';
      });

      html += '</div></div></section>';
      var footer = document.querySelector('.footer');
      if (footer) footer.insertAdjacentHTML('beforebegin', html);
    }
  };

  /* =================================================================
     5. LOW STOCK URGENCY INDICATOR
     ================================================================= */
  var StockUrgency = {
    init: function() {
      var info = document.querySelector('product-info');
      if (!info) return;
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
      document.addEventListener('change', function(e) {
        if (!e.target.closest('variant-selects, variant-radios')) return;
        setTimeout(function() {
          var badge = document.querySelector('.product .badge--low-stock, .inventory--low');
          if (badge) {
            container.textContent = '\uD83D\uDD25 Low stock \u2014 order soon!';
            container.style.display = 'block';
          } else {
            container.style.display = 'none';
          }
        }, 400);
      });
    }
  };

  /* =================================================================
     INIT
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