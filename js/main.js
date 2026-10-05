(function () {
  'use strict';

  /* ---------- Mobilni meni ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var links = document.querySelectorAll('#navLinks a');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Slider usluga ---------- */
  var track = document.getElementById('servicesTrack');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.svc'));
  var progress = document.getElementById('servicesProgress');
  var current = 0;

  // konačna pozicija kartice: sve kartice pre nje su skupljene
  function targetLeft(i) {
    var other = cards[i === 0 ? 1 : 0];
    var collapsed = parseFloat(getComputedStyle(other).flexBasis) || other.offsetWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    return i * (collapsed + gap);
  }

  function activate(i) {
    current = (i + cards.length) % cards.length;
    cards.forEach(function (c, idx) { c.classList.toggle('is-active', idx === current); });
    progress.style.width = ((current + 1) / cards.length * 100) + '%';
    track.scrollTo({ left: targetLeft(current), behavior: 'smooth' });
  }

  // kad se kartica do kraja proširi, poravnaj ako je skrol završio pre vremena
  track.addEventListener('transitionend', function (e) {
    if (e.propertyName !== 'flex-basis' || e.target !== cards[current]) return;
    var left = targetLeft(current);
    if (Math.abs(track.scrollLeft - left) > 2) track.scrollTo({ left: left, behavior: 'smooth' });
  });

  cards.forEach(function (card, idx) {
    card.addEventListener('click', function () { if (idx !== current) activate(idx); });
  });
  document.getElementById('svcPrev').addEventListener('click', function () { activate(current - 1); });
  document.getElementById('svcNext').addEventListener('click', function () { activate(current + 1); });
  progress.style.width = (1 / cards.length * 100) + '%';

  /* ---------- Recenzije ---------- */
  var revTrack = document.getElementById('reviewsTrack');
  function revScroll(dir) {
    var card = revTrack.querySelector('.review');
    var step = card ? card.offsetWidth + 18 : 300;
    var max = revTrack.scrollWidth - revTrack.clientWidth;
    var target = revTrack.scrollLeft + dir * step;
    if (target > max + 5) target = 0;
    if (target < -5) target = max;
    revTrack.scrollTo({ left: target, behavior: 'smooth' });
  }
  document.getElementById('revPrev').addEventListener('click', function () { revScroll(-1); });
  document.getElementById('revNext').addEventListener('click', function () { revScroll(1); });

  // duge recenzije: dugme „Prikaži više“
  revTrack.querySelectorAll('.review p').forEach(function (p) {
    if (p.scrollHeight <= p.clientHeight + 2) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'review__more';
    btn.textContent = 'Prikaži više';
    btn.addEventListener('click', function () {
      var open = p.classList.toggle('is-open');
      btn.textContent = open ? 'Prikaži manje' : 'Prikaži više';
    });
    p.after(btn);
  });

  /* ---------- Tabovi ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- FAQ: samo jedno otvoreno ---------- */
  var faqs = document.querySelectorAll('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Aktivni link u meniju ---------- */
  var sections = ['pocetna', 'usluge', 'zasto-mi', 'o-nama', 'lokacije', 'utisci', 'pitanja', 'kontakt']
    .map(function (id) { return document.getElementById(id); });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });

    /* ---------- Animacija pri skrolu ---------- */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        if (en.target.classList.contains('stagger')) {
          var t = en.target;
          setTimeout(function () { t.classList.add('stagger-done'); }, 600 + t.children.length * 90);
        }
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function reveal(selector, variant) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (el.closest('.tabpanel')) return; // tabovi imaju svoju animaciju
        el.classList.add('reveal');
        if (variant) el.classList.add('reveal--' + variant);
        io.observe(el);
      });
    }
    reveal('.section-title, .eyebrow:not(.hero .eyebrow), .lead, .contact-cta, .banner');
    reveal('.split__text', 'left');
    reveal('.split__media, .feature__text', 'right');
    reveal('.feature__media, .locations__lead', 'zoom');

    // grupe koje se pojavljuju jedna po jedna stavka
    document.querySelectorAll('.services__track, .checks, .loc-grid, .reviews__track, .faq, .footer__grid, .contact-cta__cards').forEach(function (group) {
      group.classList.add('stagger');
      Array.prototype.forEach.call(group.children, function (c, idx) { c.style.setProperty('--i', idx); });
      io.observe(group);
    });

    // brojač „60 min“
    var stat = document.querySelector('.stat-card strong');
    if (stat) { stat.setAttribute('data-count', '60'); io.observe(stat); }
  }

  /* ---------- Brojač ---------- */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var unit = el.querySelector('small');
    var start = performance.now(), dur = 1400;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var val = Math.round(end * (1 - Math.pow(1 - t, 3)));
      el.firstChild.nodeValue = val;
      if (t < 1) requestAnimationFrame(tick);
    }
    if (unit && el.firstChild.nodeType === 3) requestAnimationFrame(tick);
  }

  /* ---------- Traka napretka čitanja ---------- */
  var bar = document.createElement('div');
  bar.className = 'read-progress';
  document.body.appendChild(bar);
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Paralaksa panorame ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pano = document.querySelector('.locations__bg img');
  var locSec = document.getElementById('lokacije');
  if (pano && !reduce) {
    pano.style.transform = 'scale(1.15)';
    window.addEventListener('scroll', function () {
      var r = locSec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      pano.style.transform = 'scale(1.15) translateY(' + (p * 40).toFixed(1) + 'px)';
    }, { passive: true });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
