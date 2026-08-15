/**
 * hero-slideshow.js
 * Swiggy-style auto-cycling hero showcase slideshow — Protein-Pot index page.
 **/

(function () {
    'use strict';

    // ── Slide data ──────────────────────────────────────────────────
    var SLIDES = [
        { emoji: '\uD83C\uDFC6', priceHtml: '<s style="opacity:0.55;font-weight:600">₹199</s> ₹119 ONLY', label: 'Trial Box' },
        { emoji: '\uD83E\uDD57', priceHtml: '<s style="opacity:0.55;font-weight:600">₹199</s> ₹119 ONLY', label: 'Trial Box' },
        { emoji: '\uD83D\uDCBC', priceHtml: '<s style="opacity:0.55;font-weight:600">₹119</s> ₹69 ONLY',  label: 'All Users'  },
        { emoji: '\uD83E\uDE7A', priceHtml: '<s style="opacity:0.55;font-weight:600">₹119</s> ₹69 ONLY',  label: 'All Users'  }
    ];

    // ── Image preloading — cache all slide images before first transition ──
    var SLIDE_IMAGES = [
        'menu/supreme-weight-gain-pot.webp',
        'menu/supreme-weight-loss-pot.webp',
        'menu/healthy-workday-pot.webp',
        'menu/diabetic-menu-pot.webp'
    ];

    SLIDE_IMAGES.forEach(function (src) {
        var img = new Image();
        img.src = src;
    });

    var AUTOPLAY_MS = 4000;

    // ── DOM references ───────────────────────────────────────────────
    var slideEls    = Array.from(document.querySelectorAll('.hero-slide'));
    var dotEls      = Array.from(document.querySelectorAll('.hero-dot'));
    var prevBtn     = document.getElementById('hero-prev');
    var nextBtn     = document.getElementById('hero-next');
    var badgeEmoji  = document.getElementById('hero-badge-emoji');
    var badgePrice  = document.getElementById('hero-badge-price');
    var badgeLabel  = document.getElementById('hero-badge-label');
    var progressBar = document.getElementById('hero-progress-bar');
    var wrapper     = document.getElementById('hero-slideshow-wrapper');

    if (!slideEls.length || !progressBar) return;

    // ── State ────────────────────────────────────────────────────────
    var current    = 0;
    var timer      = null;
    var startTs    = null;
    var paused     = false;
    var touchStartX = 0;

    // ── Go to slide ──────────────────────────────────────────────────
    function goTo(index) {
        if (index === current) return;
        var prev = current;
        current = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;

        // Simply swap active — CSS handles the crossfade via opacity/transform
        slideEls[prev].classList.remove('active');
        slideEls[current].classList.add('active');

        // Sync dots
        dotEls.forEach(function (d, i) {
            d.classList.toggle('active', i === current);
        });

        updateBadge(current);
        resetProgress();
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    // ── Badge ────────────────────────────────────────────────────────
    function updateBadge(index) {
        var s = SLIDES[index];
        badgeEmoji.textContent = s.emoji;
        badgePrice.innerHTML   = s.priceHtml; // innerHTML to render <s> strikethrough
        badgeLabel.textContent = s.label;

        // Mini pop on badge
        var badge = document.getElementById('hero-slide-badge');
        if (badge) {
            badge.style.transform = 'translateY(-8px) scale(1.07)';
            setTimeout(function () { badge.style.transform = ''; }, 320);
        }
    }

    // ── Progress bar ─────────────────────────────────────────────────
    function resetProgress() {
        clearTimeout(timer);
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        if (paused) return;
        void progressBar.offsetWidth; // reflow
        startTs = performance.now();
        progressBar.style.transition = 'width ' + AUTOPLAY_MS + 'ms linear';
        progressBar.style.width = '100%';
        timer = setTimeout(nextSlide, AUTOPLAY_MS);
    }

    // ── Pause / Resume ───────────────────────────────────────────────
    function pause() {
        if (paused) return;
        paused = true;
        clearTimeout(timer);
        progressBar.style.transition = 'none';
        var elapsed = startTs ? performance.now() - startTs : 0;
        var pct = Math.min((elapsed / AUTOPLAY_MS) * 100, 100);
        progressBar.style.width = pct + '%';
    }

    function resume() {
        if (!paused) return;
        paused = false;
        var currentPct = parseFloat(progressBar.style.width) || 0;
        var remaining  = AUTOPLAY_MS * ((100 - currentPct) / 100);
        startTs = performance.now() - (currentPct / 100) * AUTOPLAY_MS;
        void progressBar.offsetWidth;
        progressBar.style.transition = 'width ' + remaining + 'ms linear';
        progressBar.style.width = '100%';
        clearTimeout(timer);
        timer = setTimeout(nextSlide, remaining);
    }

    // ── Events ───────────────────────────────────────────────────────
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    dotEls.forEach(function (dot) {
        dot.addEventListener('click', function () {
            goTo(parseInt(dot.dataset.dot, 10));
        });
    });

    if (wrapper) {
        wrapper.addEventListener('mouseenter', pause);
        wrapper.addEventListener('mouseleave', resume);
        wrapper.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        wrapper.addEventListener('touchend', function (e) {
            var delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) {
                if (delta < 0) nextSlide(); else prevSlide();
            }
        }, { passive: true });
    }

    // ── Init ─────────────────────────────────────────────────────────
    function init() {
        slideEls.forEach(function (s, i) { s.classList.toggle('active', i === 0); });
        dotEls.forEach(function (d, i)   { d.classList.toggle('active', i === 0); });
        updateBadge(0);
        setTimeout(function () {
            startTs = performance.now();
            resetProgress();
        }, 600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
