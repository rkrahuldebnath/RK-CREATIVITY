/* ============================================================
   VIVEKA DIGITAL HUB - Master JavaScript
   ============================================================ */

'use strict';

// ======================== COUPON SYSTEM ========================
const COUPONS = {
  VIVEKA10:  { discount: 10, expiry: "2099-12-31" },
  STUDENT20: { discount: 20, expiry: "2099-12-31" },
  RK50:      { discount: 50, expiry: "2026-12-31" }
};

let appliedCoupon = null; // { code, discount }

function applyCoupon() {
  const input   = document.getElementById('couponInput');
  const msgEl   = document.getElementById('couponMsg');
  const badgeEl = document.getElementById('activeCouponBadge');
  if (!input || !msgEl) return;

  const code = input.value.trim().toUpperCase();

  if (!code) {
    showCouponMsg(msgEl, '⚠️ Please enter a coupon code.', 'warning');
    return;
  }

  if (!COUPONS[code]) {
    showCouponMsg(msgEl, '❌ Invalid coupon code. Try: VIVEKA10, STUDENT20, RK50', 'error');
    removeCoupon(badgeEl);
    return;
  }

  const coupon = COUPONS[code];
  const today  = new Date().toISOString().split('T')[0];

  if (today > coupon.expiry) {
    showCouponMsg(msgEl, `⏰ Coupon "${code}" has expired.`, 'warning');
    removeCoupon(badgeEl);
    return;
  }

  // Apply coupon
  appliedCoupon = { code, discount: coupon.discount };
  showCouponMsg(msgEl, `✅ Coupon "${code}" applied! ${coupon.discount}% OFF on all products.`, 'success');
  if (badgeEl) {
    badgeEl.innerHTML = `🎟️ <strong>${code}</strong> — ${coupon.discount}% OFF Active`;
    badgeEl.classList.remove('hidden');
  }
  updateAllPrices();
  showToast(`🎉 Coupon "${code}" applied! Enjoy ${coupon.discount}% off!`);
}

function removeCoupon(badgeEl) {
  appliedCoupon = null;
  if (badgeEl) badgeEl.classList.add('hidden');
  updateAllPrices();
}

function showCouponMsg(el, msg, type) {
  el.textContent   = msg;
  el.className     = 'coupon-msg ' + type;
}

// ======================== PRICE UPDATE ========================
function updateAllPrices() {
  document.querySelectorAll('.product-card').forEach(card => {
    const basePrice = parseFloat(card.dataset.basePrice);
    const origPrice = parseFloat(card.dataset.origPrice);
    const priceEl   = card.querySelector('.price-current');
    const discEl    = card.querySelector('.price-discount');
    const origEl    = card.querySelector('.price-original');

    if (!priceEl || isNaN(basePrice)) return;

    let finalPrice = basePrice;
    let totalDiscount = 0;

    // Calculate base saving %
    if (!isNaN(origPrice) && origPrice > 0) {
      const baseSave = Math.round((1 - basePrice / origPrice) * 100);
      totalDiscount = baseSave;
    }

    if (appliedCoupon) {
      finalPrice = basePrice * (1 - appliedCoupon.discount / 100);
      finalPrice = Math.round(finalPrice);
      const effectiveSave = Math.round((1 - finalPrice / origPrice) * 100);
      totalDiscount = effectiveSave;
    } else {
      finalPrice = basePrice;
    }

    priceEl.textContent = `₹${finalPrice}`;
    card.dataset.finalPrice = finalPrice;

    if (discEl && !isNaN(origPrice) && origPrice > 0) {
      discEl.textContent = `${totalDiscount}% OFF`;
    }
  });
}

// ======================== BUY NOW ========================
function buyNow(btn) {
  const card = btn.closest('.product-card');
  if (!card) return;

  const productName = card.dataset.name;
  const productCode = card.dataset.code;
  const finalPrice  = card.dataset.finalPrice || card.dataset.basePrice;
  const phone       = "919362719399";
  const couponText  = appliedCoupon ? appliedCoupon.code : "None";

  const message =
`Hello, I want to buy:

📦 Product: ${productName}
🔖 Code: ${productCode}
💰 Price: ₹${finalPrice}
🎟️ Coupon: ${couponText}

Please confirm my order. Thank you!`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ======================== SEARCH ========================
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    filterProducts(this.value.trim().toLowerCase());
  });
}

function filterProducts(query) {
  const cards     = document.querySelectorAll('.product-card');
  let   visCount  = 0;

  cards.forEach(card => {
    const name = (card.dataset.name   || '').toLowerCase();
    const code = (card.dataset.code   || '').toLowerCase();
    const desc = (card.dataset.desc   || '').toLowerCase();
    const cat  = (card.dataset.cat    || '').toLowerCase();

    const match = !query || name.includes(query) || code.includes(query) || desc.includes(query) || cat.includes(query);
    card.style.display = match ? '' : 'none';
    if (match) visCount++;
  });

  // Handle no-results
  const noRes = document.getElementById('noResults');
  if (noRes) noRes.style.display = visCount === 0 ? '' : 'none';
}

// ======================== CATEGORY FILTER ========================
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const cat = this.dataset.cat || 'all';
      filterByCategory(cat);
    });
  });
}

function filterByCategory(cat) {
  const cards   = document.querySelectorAll('.product-card');
  let   count   = 0;

  cards.forEach(card => {
    const cardCat = (card.dataset.cat || '').toLowerCase();
    const match   = (cat === 'all') || (cardCat === cat.toLowerCase());
    card.style.display = match ? '' : 'none';
    if (match) count++;
  });

  const noRes = document.getElementById('noResults');
  if (noRes) noRes.style.display = count === 0 ? '' : 'none';
}

// ======================== RANDOM SALES COUNT ========================
function initSalesCounters() {
  document.querySelectorAll('.product-sales').forEach(el => {
    const rand = Math.floor(Math.random() * 451) + 50; // 50–500
    el.innerHTML = `🔥 <strong>${rand}</strong> students purchased`;
  });
}

// ======================== NAVBAR MOBILE ========================
function initNavbar() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });

  // Close on link click
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
    });
  });

  // Highlight active page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  menu.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });
}

// ======================== TOAST ========================
function showToast(message, duration = 3500) {
  let toast = document.getElementById('toastNotif');
  if (!toast) {
    toast = document.createElement('div');
    toast.id        = 'toastNotif';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), duration);
}

// ======================== CONTACT FORM ========================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name    = form.querySelector('#contactName').value.trim();
    const message = form.querySelector('#contactMsg').value.trim();

    if (!name || !message) {
      showToast('⚠️ Please fill in all fields.');
      return;
    }

    const phone = "919362719399";
    const text  = `Hello! My name is ${name}.\n\n${message}`;
    const url   = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast('✅ Redirecting to WhatsApp...');
    form.reset();
  });
}

// ======================== COUPON ENTER KEY ========================
function initCouponInput() {
  const input = document.getElementById('couponInput');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyCoupon();
  });
}

// ======================== SCROLL ANIMATIONS ========================
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeUp 0.5s ease both';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .feature-card, .cat-card, .privacy-section').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ======================== INIT ========================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearch();
  initCategoryFilter();
  initSalesCounters();
  initCouponInput();
  initContactForm();
  initScrollAnimations();
  updateAllPrices(); // Set initial prices
});
