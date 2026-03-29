/**
 * LumiScent Cart Reservation Timer
 * Shows a prominent countdown banner in the cart drawer / cart page.
 * Timer starts on first add-to-cart and resets when cart becomes empty.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lumiscent_cart_timer';
  var DURATION = 15 * 60; // 15 minutes

  function getStart() {
    try { return parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function setStart(ts) {
    try { localStorage.setItem(STORAGE_KEY, String(ts)); } catch (e) {}
  }
  function clearStart() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function remaining() {
    var s = getStart();
    if (!s) return -1;
    var elapsed = Math.floor((Date.now() - s) / 1000);
    return Math.max(0, DURATION - elapsed);
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* -------- Banner DOM -------- */
  function createBanner() {
    var el = document.createElement('div');
    el.id = 'cart-reservation-banner';
    el.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">' +
        '<circle cx="8" cy="8" r="7"/><path d="M8 4v4l3 2"/>' +
      '</svg>' +
      '<span>Your cart is reserved for <strong id="cart-timer-countdown">15:00</strong></span>';
    return el;
  }

  var style = document.createElement('style');
  style.textContent =
    '#cart-reservation-banner {' +
      'display:flex;align-items:center;justify-content:center;gap:8px;' +
      'padding:10px 16px;' +
      'background:linear-gradient(135deg,#1a1206 0%,#2c1f0e 100%);' +
      'color:#C8A96B;font-size:0.78rem;font-weight:500;letter-spacing:0.06em;' +
      'border-bottom:1px solid rgba(200,169,107,0.2);' +
    '}' +
    '#cart-reservation-banner svg { color:#C8A96B;flex-shrink:0; }' +
    '#cart-reservation-banner strong { font-weight:700;font-variant-numeric:tabular-nums;color:#e8c874; }' +
    '#cart-reservation-banner.timer-urgent { background:linear-gradient(135deg,#2a0a0a 0%,#3d1111 100%);color:#ff6b6b; }' +
    '#cart-reservation-banner.timer-urgent svg { color:#ff6b6b; }' +
    '#cart-reservation-banner.timer-urgent strong { color:#ff4444; }' +
    '#cart-reservation-banner.timer-expired { color:#999; }' +
    '#cart-reservation-banner.timer-expired strong { color:#999; }' +
    '.cart-page-timer {' +
      'max-width:800px;margin:0 auto 20px;border-radius:0;' +
      'border:1px solid rgba(200,169,107,0.25);' +
    '}';
  document.head.appendChild(style);

  /* -------- Injection -------- */
  function injectBanner() {
    // Cart drawer
    var drawerHeader = document.querySelector('cart-drawer .drawer__header');
    if (drawerHeader && !drawerHeader.parentNode.querySelector('#cart-reservation-banner')) {
      var banner = createBanner();
      drawerHeader.parentNode.insertBefore(banner, drawerHeader.nextSibling);
    }
    // Cart page
    var cartForm = document.querySelector('.cart__contents, form[action="/cart"]');
    if (cartForm && !cartForm.parentNode.querySelector('#cart-reservation-banner')) {
      var pageBanner = createBanner();
      pageBanner.classList.add('cart-page-timer');
      cartForm.parentNode.insertBefore(pageBanner, cartForm);
    }
  }

  /* -------- Tick -------- */
  var tickId = null;

  function tick() {
    var banners = document.querySelectorAll('#cart-reservation-banner');
    if (banners.length === 0) return;

    var hasItems = document.querySelector('[data-cart-timer]');
    if (!hasItems) {
      // Cart is empty
      clearStart();
      banners.forEach(function (b) { b.style.display = 'none'; });
      return;
    }

    // Ensure timer is started
    if (!getStart()) {
      setStart(Date.now());
    }

    var secs = remaining();
    banners.forEach(function (b) {
      b.style.display = 'flex';
      var countdown = b.querySelector('#cart-timer-countdown, strong');
      if (countdown) countdown.textContent = fmt(secs);

      b.classList.toggle('timer-urgent', secs > 0 && secs <= 180);
      b.classList.toggle('timer-expired', secs === 0);

      if (secs === 0) {
        var span = b.querySelector('span');
        if (span) span.innerHTML = '⚡ Reservation expired — <strong>checkout now!</strong>';
      }
    });
  }

  function startTick() {
    if (!tickId) tickId = setInterval(tick, 1000);
  }

  /* -------- Init -------- */
  function init() {
    injectBanner();
    tick();
    startTick();

    // Re-inject when cart drawer re-renders
    var observer = new MutationObserver(function () {
      var hasTimer = document.querySelector('[data-cart-timer]');
      if (hasTimer) {
        injectBanner();
        tick();
      }
    });
    var drawer = document.querySelector('cart-drawer');
    if (drawer) observer.observe(drawer, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
