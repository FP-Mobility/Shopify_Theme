/* =====================================================
   LUMISCENT — Smart Features Module v2.0
   Idealo Markup · Free Shipping Bar · Sticky ATC · Recently Viewed
   ===================================================== */

(function() {
  'use strict';

  var SETTINGS = window.__lumiscent || {};

  function formatMoney(cents) {
    var amount = (cents / 100).toFixed(2).replace('.', ',');
    return amount + '\u00A0\u20AC';
  }

  /* =================================================================
     1. IDEALO REFERRER PRICE MARKUP
     ─────────────────────────────────────────────────────────────────
     FULL CHECKOUT-SAFE IMPLEMENTATION:

     DISPLAY  → visually adjusts .price-item elements on all pages
                (landing product kept at original price)

     CART     → intercepts every /cart/add.js call; if it's NOT the
                landing product, auto-adds a hidden "Price Adjustment"
                line item so the checkout total matches the display.

     LOCK     → hides the remove button on the Price Adjustment item
                via CSS + re-adds it if removed via cart API watch.

     SESSION  → 30-min sessionStorage window; clears on tab close.
  ================================================================= */

  var Idealo = {
    STORAGE_KEY:        'lux_ref_active',
    LANDING_KEY:        'lux_ref_landing',
    MARKUP_KEY:         'lux_ref_markup',
    SOURCE_KEY:         'lux_ref_source',
    SESSION_EXPIRY_KEY: 'lux_ref_expiry',
    SESSION_MINUTES:    30,
    ADJ_TITLE:          'Price Adjustment',
    _intercepting:      false,

    /* ── Detect which referral source matched (returns source name or null) ── */
    detectSource: function(referrer) {
      if (!SETTINGS.idealo_enable) return null;
      /* patterns is a comma-separated string from Theme Settings
         e.g. "idealo, google, bing, facebook" */
      var patternsRaw = SETTINGS.referral_patterns || 'idealo';
      var patterns    = patternsRaw.split(',').map(function(p) { return p.trim().toLowerCase(); });
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i] && referrer.indexOf(patterns[i]) !== -1) return patterns[i];
      }
      return null;
    },

    init: function() {
      if (!SETTINGS.idealo_enable) return;

      var referrer = (document.referrer || '').toLowerCase();
      var source   = this.detectSource(referrer);

      /* ── Fresh referral arrival ── */
      if (source) {
        var expiry = Date.now() + this.SESSION_MINUTES * 60 * 1000;
        sessionStorage.setItem(this.STORAGE_KEY,        '1');
        sessionStorage.setItem(this.LANDING_KEY,        window.location.pathname);
        sessionStorage.setItem(this.MARKUP_KEY,         String(SETTINGS.idealo_markup_cents || 0));
        sessionStorage.setItem(this.SOURCE_KEY,         source);
        sessionStorage.setItem(this.SESSION_EXPIRY_KEY, String(expiry));
      }

      /* ── Check session expiry ── */
      var expiry = parseInt(sessionStorage.getItem(this.SESSION_EXPIRY_KEY) || '0', 10);
      if (expiry && Date.now() > expiry) { this.clearSession(); return; }
      if (sessionStorage.getItem(this.STORAGE_KEY) !== '1') return;

      var landingPath  = sessionStorage.getItem(this.LANDING_KEY) || '';
      var currentPath  = window.location.pathname;
      var isLanding    = landingPath && currentPath === landingPath;
      var markupCents  = parseInt(sessionStorage.getItem(this.MARKUP_KEY) || '0', 10) || 0;
      var adjVariantId = parseInt(SETTINGS.idealo_adj_variant_id || '0', 10);

      if (markupCents <= 0) return;

      /* ── A) DISPLAY: adjust visible prices on non-landing pages ── */
      if (!isLanding) {
        this.applyMarkup(markupCents);

        document.addEventListener('variant:change', function() {
          setTimeout(function() { Idealo.applyMarkup(markupCents); }, 300);
        });

        if (window.MutationObserver) {
          var debounce;
          var obs = new MutationObserver(function() {
            clearTimeout(debounce);
            debounce = setTimeout(function() { Idealo.applyMarkup(markupCents); }, 200);
          });
          obs.observe(document.body, { childList: true, subtree: true });
          setTimeout(function() { obs.disconnect(); }, 30000);
        }
      }

      /* ── B) CART: intercept ATC to inject Price Adjustment item ── */
      if (adjVariantId) {
        this.interceptAddToCart(markupCents, adjVariantId, landingPath);
        this.hideAdjustmentRemoveButton(adjVariantId);
        this.watchCartForRemoval(markupCents, adjVariantId);
      }

      /* ── C) Tag cart attributes for Admin visibility ── */
      this.tagCart(markupCents);
    },

    clearSession: function() {
      var keys = [this.STORAGE_KEY, this.LANDING_KEY, this.MARKUP_KEY, this.SOURCE_KEY, this.SESSION_EXPIRY_KEY];
      keys.forEach(function(k) { sessionStorage.removeItem(k); });
    },

    /* ── Visually adjust all unmarked price elements ── */
    applyMarkup: function(markupCents) {
      var els = document.querySelectorAll(
        '.price-item--regular:not([data-lux-marked]),' +
        '.price-item--sale:not([data-lux-marked])'
      );
      els.forEach(function(el) {
        el.setAttribute('data-lux-marked', '1');
        var cleaned = el.textContent.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        var orig    = Math.round(parseFloat(cleaned) * 100);
        if (isNaN(orig) || orig <= 0) return;
        el.textContent = formatMoney(orig + markupCents);
        el.setAttribute('data-lux-original', orig);
        el.setAttribute('data-lux-adjusted', orig + markupCents);
      });
    },

    /* ── Intercept fetch(/cart/add.js) and append Price Adjustment ── */
    interceptAddToCart: function(markupCents, adjVariantId, landingPath) {
      if (this._intercepting) return;
      this._intercepting = true;

      var orig = window.fetch;
      window.fetch = function(url, opts) {
        var result = orig.apply(this, arguments);

        if (typeof url === 'string' && url.indexOf('/cart/add') !== -1 && opts && opts.body) {
          result.then(function(res) {
            /* Clone so we don't consume the stream */
            var cloned = res.clone();
            cloned.json().then(function(data) {
              /* Don't add adjustment if this IS the landing product */
              var addedPath = '';
              if (opts.body instanceof FormData) {
                addedPath = opts.body.get('sections_url') || window.location.pathname;
              }
              var isLandingAdd = landingPath && addedPath === landingPath;

              /* Also skip if the item being added IS already the adjustment */
              var addedVariant = opts.body instanceof FormData
                ? parseInt(opts.body.get('id') || '0', 10)
                : 0;
              var isAdjItself = addedVariant === adjVariantId;

              if (!isLandingAdd && !isAdjItself) {
                Idealo.addAdjustmentItem(markupCents, adjVariantId);
              }
            }).catch(function() {});
          }).catch(function() {});
        }

        return result;
      };
    },

    /* ── Add (or update) the Price Adjustment line item ── */
    addAdjustmentItem: function(markupCents, adjVariantId) {
      /* First check if it's already in cart — update qty instead of adding */
      fetch('/cart.js')
        .then(function(r) { return r.json(); })
        .then(function(cart) {
          var existing = null;
          (cart.items || []).forEach(function(item) {
            if (item.variant_id === adjVariantId) existing = item;
          });

          if (existing) {
            /* Already there — nothing to do (one adjustment per session) */
            return;
          }

          /* Add fresh adjustment item */
          fetch('/cart/add.js', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id:         adjVariantId,
              quantity:   1,
              properties: {
                '_adj_type':    'idealo_markup',
                '_adj_cents':   markupCents,
                '_adj_display': formatMoney(markupCents)
              }
            })
          })
          .then(function() {
            /* Refresh cart UI */
            document.dispatchEvent(new CustomEvent('cart:change', { bubbles: true }));
            /* Trigger Dawn cart refresh */
            var cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer && cartDrawer.renderContents) {
              fetch('/?sections=cart-drawer')
                .then(function(r) { return r.json(); })
                .then(function(sections) {
                  if (sections['cart-drawer']) {
                    var tmp = document.createElement('div');
                    tmp.innerHTML = sections['cart-drawer'];
                    var newDrawer = tmp.querySelector('#CartDrawer');
                    var oldDrawer = document.querySelector('#CartDrawer');
                    if (newDrawer && oldDrawer) oldDrawer.innerHTML = newDrawer.innerHTML;
                  }
                }).catch(function() {});
            }
          })
          .catch(function() {});
        })
        .catch(function() {});
    },

    /* ── Hide the remove "×" button on the adjustment item via CSS ── */
    hideAdjustmentRemoveButton: function(adjVariantId) {
      var style = document.createElement('style');
      style.textContent =
        'cart-remove-button[data-variant-id="' + adjVariantId + '"],' +
        'cart-remove-button button[data-variant-id="' + adjVariantId + '"] { display:none !important; }' +
        '.cart-item[data-variant-id="' + adjVariantId + '"] .cart-remove-button { display:none !important; }';
      document.head.appendChild(style);
    },

    /* ── If user somehow removes the adjustment, re-add it ── */
    watchCartForRemoval: function(markupCents, adjVariantId) {
      var self = this;
      document.addEventListener('cart:change', function() {
        setTimeout(function() {
          fetch('/cart.js')
            .then(function(r) { return r.json(); })
            .then(function(cart) {
              var hasAdj  = (cart.items || []).some(function(i) { return i.variant_id === adjVariantId; });
              var hasReal = (cart.items || []).some(function(i) { return i.variant_id !== adjVariantId; });
              /* Only re-add if cart has real items but adj is missing */
              if (hasReal && !hasAdj) {
                self.addAdjustmentItem(markupCents, adjVariantId);
              }
            }).catch(function() {});
        }, 600);
      });
    },

    /* ── Tag cart attributes (visible in Shopify Admin on every order) ── */
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
      this.message        = SETTINGS.free_shipping_message || 'Kostenloser Versand f\u00fcr alle Bestellungen!';
      this.successMessage = SETTINGS.free_shipping_success_message || 'Kostenloser Versand f\u00fcr alle Bestellungen!';
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
          '<div class="free-shipping-bar__track"><div class="free-shipping-bar__fill"></div></div>' +
        '</div>';
      this.barEl  = bar;
      this.textEl = bar.querySelector('.free-shipping-bar__text');
      this.fillEl = bar.querySelector('.free-shipping-bar__fill');
      var targets  = ['cart-drawer .cart-drawer__head','cart-drawer-items','.cart-drawer','.drawer__header'];
      var inserted = false;
      for (var i = 0; i < targets.length; i++) {
        var t = document.querySelector(targets[i]);
        if (t) { t.parentNode.insertBefore(bar, t.nextSibling); inserted = true; break; }
      }
      var form = document.querySelector('form[action="/cart"]');
      if (form && !inserted) form.parentNode.insertBefore(bar.cloneNode(true), form);
    },

    update: function() {
      var self = this;
      fetch('/cart.js').then(function(r) { return r.json(); }).then(function(cart) {
        var total = cart.total_price;
        if (self.threshold <= 0) {
          self.fillEl.style.width = '100%';
          self.textEl.textContent = self.successMessage;
          self.barEl.classList.add('free-shipping-bar--success');
          self.fillEl.style.background = 'var(--lux-green,#27ae60)';
          return;
        }
        var pct = Math.min((total / self.threshold) * 100, 100);
        self.fillEl.style.width = pct + '%';
        if (total >= self.threshold) {
          self.textEl.textContent = self.successMessage;
          self.barEl.classList.add('free-shipping-bar--success');
          self.fillEl.style.background = 'var(--lux-green,#27ae60)';
        } else {
          var rem = ((self.threshold - total) / 100).toFixed(2).replace('.', ',');
          self.textEl.textContent = self.message.replace('AMOUNT', rem);
          self.barEl.classList.remove('free-shipping-bar--success');
          self.fillEl.style.background = 'var(--lux-gold,#C8A96B)';
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
      var titleEl  = document.querySelector('.product__title');
      var priceEl  = document.querySelector('.product .price-item--regular,.product .price-item--sale');
      var mainForm = document.querySelector('.product-form__submit');
      if (!mainForm) return;
      var titleText = titleEl  ? titleEl.textContent.trim()  : '';
      var priceText = priceEl  ? priceEl.textContent.trim()  : '';
      var btnText   = mainForm.textContent.trim();
      var imgEl     = document.querySelector('.product__media-item img');
      var imgSrc    = imgEl ? imgEl.getAttribute('src') : '';
      var bar       = document.createElement('div');
      bar.className = 'sticky-atc-bar';
      bar.innerHTML =
        '<div class="sticky-atc-bar__inner page-width">' +
        (imgSrc ? '<img class="sticky-atc-bar__img" src="' + imgSrc + '" alt="" width="48" height="48">' : '') +
        '<div class="sticky-atc-bar__info">' +
        '<span class="sticky-atc-bar__title">' + titleText + '</span>' +
        '<span class="sticky-atc-bar__price">' + priceText + '</span>' +
        '</div><button type="button" class="sticky-atc-bar__btn">' + btnText + '</button></div>';
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
      var rect = this.mainBtn.getBoundingClientRect(), show = rect.bottom < 0;
      if (show  && !this.visible) { this.bar.classList.add('sticky-atc-bar--visible');    this.visible = true;  }
      if (!show &&  this.visible) { this.bar.classList.remove('sticky-atc-bar--visible'); this.visible = false; }
    }
  };

  /* =================================================================
     4. RECENTLY VIEWED PRODUCTS
  ================================================================= */
  var RecentlyViewed = {
    KEY: 'lux_recently_viewed', MAX: 12,
    init: function() { this.track(); this.render(); },

    track: function() {
      var h = window.location.pathname.match(/\/products\/([^/?#]+)/);
      if (!h) return;
      var slug = h[1], items = this.getItems();
      var title = '', price = '', image = '', url = window.location.pathname;
      var tEl = document.querySelector('.product__title');
      if (tEl) title = tEl.textContent.trim();
      var pEl = document.querySelector('.product .price-item--regular,.product .price-item');
      if (pEl) price = pEl.textContent.trim();
      var iEl = document.querySelector('.product__media-item img');
      if (iEl) image = iEl.getAttribute('src') || '';
      items = items.filter(function(i) { return i.slug !== slug; });
      items.unshift({ slug:slug, title:title, price:price, image:image, url:url });
      items = items.slice(0, this.MAX);
      try { localStorage.setItem(this.KEY, JSON.stringify(items)); } catch(e) {}
    },

    getItems: function() {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch(e) { return []; }
    },

    render: function() {
      var items = this.getItems();
      var cur   = (window.location.pathname.match(/\/products\/([^/?#]+)/) || [])[1];
      items = items.filter(function(i) { return i.slug !== cur; });
      if (items.length < 2) return;
      if (!/\/products\/|\/collections\//.test(window.location.pathname)) return;
      var ex = document.querySelector('.recently-viewed');
      if (ex) ex.remove();

      function esc(s) {
        return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
      }
      function resized(url, w) {
        if (!url) return '';
        var c = url.replace(/([?&])width=\d+/g,'').replace(/[?&]$/,'');
        return c + (c.indexOf('?') === -1 ? '?' : '&') + 'width=' + w;
      }

      var html = '<section class="recently-viewed"><div class="page-width">' +
        '<div class="recently-viewed__header"><span class="recently-viewed__eyebrow">Recently Viewed</span>' +
        '<h2 class="recently-viewed__title">Continue Your Journey</h2></div>' +
        '<div class="recently-viewed__scroll">';

      items.forEach(function(item) {
        var u = /^\//.test(item.url||'') ? item.url : '/collections/all';
        html += '<a href="'+u+'" class="recently-viewed__card">' +
          '<div class="recently-viewed__img-wrap">' +
          (item.image ? '<img src="'+resized(item.image,300)+'" alt="'+esc(item.title)+'" loading="lazy" width="150" height="200">'
                      : '<div class="recently-viewed__placeholder"></div>') +
          '</div><div class="recently-viewed__info">' +
          '<span class="recently-viewed__name">'  + esc(item.title) + '</span>' +
          '<span class="recently-viewed__price">' + esc(item.price) + '</span>' +
          '</div></a>';
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
      if (!document.querySelector('product-info')) return;
      if (!document.querySelectorAll('variant-selects,variant-radios').length) return;
      this.injectContainer();
      this.observe();
    },
    injectContainer: function() {
      var p = document.querySelector('.product .price');
      if (!p) return;
      var c = document.createElement('div');
      c.className = 'stock-urgency'; c.style.display = 'none';
      p.parentNode.insertBefore(c, p.nextSibling);
      this.container = c;
    },
    observe: function() {
      var c = this.container; if (!c) return;
      document.addEventListener('change', function(e) {
        if (!e.target.closest('variant-selects,variant-radios')) return;
        setTimeout(function() {
          var badge = document.querySelector('.product .badge--low-stock,.inventory--low');
          c.textContent = badge ? '\uD83D\uDD25 Low stock \u2014 order soon!' : '';
          c.style.display = badge ? 'block' : 'none';
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
