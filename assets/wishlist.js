/**
 * LumiScent Wishlist System
 * Uses localStorage to persist wishlist across sessions
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'lumiscent_wishlist';

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveWishlist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch(e) { /* quota exceeded */ }
  }

  function isInWishlist(productId) {
    return getWishlist().some(item => String(item.id) === String(productId));
  }

  function addToWishlist(data) {
    const list = getWishlist();
    if (!list.some(item => String(item.id) === String(data.id))) {
      list.push({
        id: data.id,
        handle: data.handle,
        title: data.title,
        image: data.image,
        price: data.price,
        url: data.url,
        addedAt: Date.now()
      });
      saveWishlist(list);
    }
    updateAllButtons();
    updateCounter();
  }

  function removeFromWishlist(productId) {
    const list = getWishlist().filter(item => String(item.id) !== String(productId));
    saveWishlist(list);
    updateAllButtons();
    updateCounter();
  }

  function toggleWishlist(btn) {
    const productId = btn.dataset.productId;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      btn.classList.remove('is-wishlisted');
    } else {
      addToWishlist({
        id: productId,
        handle: btn.dataset.productHandle,
        title: btn.dataset.productTitle,
        image: btn.dataset.productImage,
        price: btn.dataset.productPrice,
        url: btn.dataset.productUrl
      });
      btn.classList.add('is-wishlisted', 'just-added');
      setTimeout(() => btn.classList.remove('just-added'), 400);
    }
  }

  function updateAllButtons() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      if (isInWishlist(btn.dataset.productId)) {
        btn.classList.add('is-wishlisted');
      } else {
        btn.classList.remove('is-wishlisted');
      }
    });
  }

  function updateCounter() {
    const count = getWishlist().length;
    document.querySelectorAll('[data-wishlist-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  function init() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('[data-wishlist-btn]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(btn);
      }
    });

    updateAllButtons();
    updateCounter();

    // Re-init after Shopify section renders
    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function() {
        updateAllButtons();
        updateCounter();
      });
    }
  }

  // Expose for wishlist page
  window.LumiscentWishlist = {
    getAll: getWishlist,
    remove: removeFromWishlist,
    isIn: isInWishlist,
    count: function() { return getWishlist().length; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
