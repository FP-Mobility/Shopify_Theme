/**
 * LumiScent Cart Reservation Timer
 * Shows a countdown on each cart item to create urgency
 * Timer starts when item first appears in cart, persists via localStorage
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'lumiscent_cart_timers';
  const TIMER_DURATION = 15 * 60; // 15 minutes in seconds
  const TICK_INTERVAL = 1000;
  let intervalId = null;

  function getTimers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch(e) {
      return {};
    }
  }

  function saveTimers(timers) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch(e) { /* quota */ }
  }

  function ensureTimerExists(itemKey) {
    const timers = getTimers();
    if (!timers[itemKey]) {
      timers[itemKey] = Date.now();
      saveTimers(timers);
    }
    return timers[itemKey];
  }

  function getSecondsRemaining(startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, TIMER_DURATION - elapsed);
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  function updateTimers() {
    const timerEls = document.querySelectorAll('[data-cart-timer]');
    if (timerEls.length === 0) {
      // No timers visible, stop ticking
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }

    const timers = getTimers();

    timerEls.forEach(function(el, index) {
      const key = 'item_' + index;
      const startTime = ensureTimerExists(key);
      const remaining = getSecondsRemaining(startTime);
      const countdownEl = el.querySelector('[data-cart-timer-countdown]');

      if (countdownEl) {
        countdownEl.textContent = formatTime(remaining);
      }

      // Add urgent class when under 3 minutes
      el.classList.toggle('cart-timer--urgent', remaining > 0 && remaining <= 180);

      if (remaining === 0) {
        el.classList.add('cart-timer--expired');
        if (countdownEl) {
          countdownEl.textContent = '00:00';
        }
        const textEl = el.querySelector('[data-cart-timer-text]');
        if (textEl) {
          textEl.innerHTML = '<svg class="cart-timer__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="8" cy="8" r="7"/><path d="M8 4v4l3 2"/></svg> Reservation expired — checkout now!';
        }
      }
    });
  }

  function cleanupExpiredTimers() {
    const timers = getTimers();
    const now = Date.now();
    const maxAge = (TIMER_DURATION + 3600) * 1000; // Keep for 1 hour past expiry
    let changed = false;
    for (const key in timers) {
      if (now - timers[key] > maxAge) {
        delete timers[key];
        changed = true;
      }
    }
    if (changed) saveTimers(timers);
  }

  function startTicking() {
    if (!intervalId) {
      intervalId = setInterval(updateTimers, TICK_INTERVAL);
    }
  }

  function init() {
    cleanupExpiredTimers();
    updateTimers();
    startTicking();

    // Re-init when cart drawer opens or sections reload
    const observer = new MutationObserver(function(mutations) {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          const hasTimer = document.querySelector('[data-cart-timer]');
          if (hasTimer) {
            updateTimers();
            startTicking();
            break;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for Shopify cart events
    document.addEventListener('cart:refresh', function() {
      setTimeout(updateTimers, 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
