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

  function activate(i) {
    current = (i + cards.length) % cards.length;
    cards.forEach(function (c, idx) { c.classList.toggle('is-active', idx === current); });
    progress.style.width = ((current + 1) / cards.length * 100) + '%';
    // sačekaj da se kartica proširi pa je pomeri u vidno polje
    setTimeout(function () {
      track.scrollTo({ left: cards[current].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }, 60);
  }

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
    var revealEls = document.querySelectorAll('.section-title, .split__media, .feature, .banner, .loc-grid, .reviews__track, .faq, .contact-cta, .checks');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
