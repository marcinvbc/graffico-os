/* Graffico OS – demo aplikacji (biuro, produkcja, montaż). Działa bez serwera;
   jeśli obok działa serwer (server/main.py), sesje tabletu są wspólne dla wszystkich urządzeń. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('gos.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('gos.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var LOGO = '<svg viewBox="12 6 120 120" aria-hidden="true"><path fill="#fff" d="M21.5 59A51 51 0 0 1 98 21L90 36A34 34 0 0 0 38.7 59Z"/><path fill="#fff" d="M122.5 59A51 51 0 0 1 47 110L56 97A34 34 0 0 0 105 74H68L77 59Z"/><circle cx="37" cy="91" r="9" fill="#E3006F"/></svg>';
  var COIN = 'assets/grafficoin-96.png', COIN_BIG = 'assets/grafficoin.png', MAP = 'assets/mapa-polski.webp';
  var I = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    crm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 11l2 2 4-4"/></svg>',
    fab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 20h18M5 20V9l5 3V9l5 3V5h4v15"/></svg>',
    tab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M11 18h2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/></svg>',
    cam: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#88FF58" stroke-width="2" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>',
    warn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF7A7A" stroke-width="2" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c3 .2 5.5 2.3 5.5 5.8"/></svg>',
    home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
    spark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z"/></svg>'
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(msg) { var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmt(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }

  /* ---------- opcjonalny serwer (FastAPI) ---------- */
  var server = false;
  function api(method, path, body) {
    return fetch('api/' + path, { method: method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  api('GET', 'health').then(function (j) { if (j && j.ok) { server = true; pullSessions(); setInterval(pullSessions, 3000); } }).catch(function () {});

  /* ---------- dane demo ---------- */
  var ORDERS = [
    { nr: '2155', client: 'AMIC Polska', product: 'Pylon cenowy 6 m, stacja Łódź', stage: 'Montaż', g: 'mont', pct: 86, date: '29.10', left: 'za 6 dni', hours: '240 / 226 h', ok: 1 },
    { nr: '2161', client: 'Port Kopytkowo', product: 'Litery przestrzenne 3D', stage: 'Produkcja', g: 'prod', pct: 58, date: '27.10', left: 'za 4 dni', hours: '42 / 49,5 h', ok: -1 },
    { nr: '2169', client: 'Park Handlowy Parczew', product: 'Oznakowanie + witacz', stage: 'Produkcja', g: 'prod', pct: 34, date: '06.11', left: 'za 14 dni', hours: '310 / 104 h', ok: 0 },
    { nr: '2129', client: 'Trefl', product: 'Kasetony LED × 12', stage: 'Produkcja', g: 'prod', pct: 64, date: '20.10', left: 'spóźnienie 3 dni', late: true, hours: '96 / 88 h', ok: 1 },
    { nr: '2170', client: 'Fabryka Ostrów', product: 'Logo na budynku, litery 3D', stage: 'Projekt', g: 'proj', pct: 15, date: '20.11', left: 'za 28 dni', hours: '64 / 6 h', ok: 0 },
    { nr: '2167', client: 'Toruń – Urząd Miasta', product: 'Witacze 5 szt.', stage: 'Montaż', g: 'mont', pct: 92, date: '24.10', left: 'jutro', hours: '180 / 171 h', ok: 1 }
  ];
  var ALERTS = [
    ['a-red', 'c-red', 'CZAS', 'Zlecenie <a href="#zlecenie" data-go="zlecenie">2161</a> przekroczyło kalkulowany czas o 18% (spawanie, +7,5 h).'],
    ['a-orange', 'c-orange', 'PLAN', 'Wtorek: konflikt na frezarce CNC (2169 i 2090). <a href="#plan" data-go="plan">Zobacz propozycje AI</a>'],
    ['a-orange', 'c-orange', 'LUDZIE', 'P2 poniedziałek: brakuje spawacza. System proponuje Artura K. (spawanie + malowanie).'],
    ['a-green', 'c-green', 'FV', 'Zlecenie 2129 przekroczyło 60% – wystaw fakturę częściową II (40%).'],
    ['', '', 'BHP', 'Montażystom wygasają uprawnienia (praca na wysokości, UDT) w ciągu 30 dni. <a href="#kadry" data-go="kadry">Zobacz w module Pracownicy</a>']
  ];
  var TASKS = [
    ['Oddzwoń do AMIC – akceptacja wizualizacji', 'CRM · ostatni kontakt 4 dni temu'],
    ['Zatwierdź kalkulację 2170 (litery 3D)', 'Dział projektowy · od Karola'],
    ['Decyzja: nadgodziny na frezarce w sobotę', 'Produkcja · ścieżka krytyczna'],
    ['Podpisz protokół odbioru 2140', 'Montaże · zdjęcia od ekipy D'],
    ['Przegląd karty zdarzeń krytycznych', 'Jakość · 2 nowe wpisy, ok. 11 tys. zł']
  ];
  var LEADS = [
    { id: 388, col: 0, title: 'Myjnia – wycena oznakowania', client: 'Ostrów Wlkp.', value: '35 tys. zł', source: 'Formularz www', contact: 'dziś', prob: '20%', close: '30.11' },
    { id: 387, col: 0, title: 'Zadaszenie między budynkiem a wiatą', client: 'Stalprofil', value: '58 tys. zł', source: 'Telefon', contact: 'wczoraj', prob: '20%', close: '15.12' },
    { id: 385, col: 1, title: 'Pylony reklamowe do przychodni', client: 'SALUS Toruń', value: '84 tys. zł', source: 'Polecenie', contact: '3 dni temu', prob: '40%', close: '20.11' },
    { id: 386, col: 1, title: 'Litery dla Urzędu', client: 'UM Słubice', value: '27 tys. zł', source: 'Przetarg', contact: '9 dni temu', late: true, prob: '30%', close: '10.11' },
    { id: 382, col: 2, title: 'Pylon reklamowy 24 m', client: 'Sela Logistics', value: '410 tys. zł', source: 'Agent AI', contact: '2 dni temu', prob: '50%', close: '12.12' },
    { id: 383, col: 3, title: 'Blacha do linii cenowej LPG', client: 'AMIC 069 Łódź', value: '18 tys. zł', source: 'Klient stały', contact: '4 dni temu', late: true, prob: '70%', close: '30.10' },
    { id: 379, col: 3, title: 'Oznakowanie Parku Handlowego', client: 'Parczew Retail', value: '265 tys. zł', source: 'Targi', contact: 'wczoraj', prob: '60%', close: '05.11' },
    { id: 381, col: 4, title: 'Litery przestrzenne PORT', client: 'Port Kopytkowo', value: '96 tys. zł', source: 'LinkedIn', contact: 'dziś', prob: '85%', close: '28.10' }
  ];
  var COLS = [['Nowe', '#8F8882', '93 tys.'], ['Kwalifikacja', '#FF69B2', '111 tys.'], ['Kalkulacja', '#FF9900', '410 tys.'], ['Oferta wysłana', '#E8622A', '283 tys.'], ['Negocjacje', '#88FF58', '96 tys.']];

  var ui = { filter: 'all', done: store.get('done', { 1: true }), lead: 388, ai: false, otab: 0, fix: null };

  /* ---------- dziennik zdarzeń (co zrobił system) ---------- */
  var closed = store.get('closed2155', null);   // { at, photos:[thumb…], note }
  var events = store.get('events', []);
  function nowTxt() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function logEvent(kind, who, text) { events.unshift({ kind: kind, who: who, text: text, t: nowTxt() }); events = events.slice(0, 40); store.set('events', events); }
  var KIND = { ok: ['c-green', 'ODBIÓR'], status: ['c-pink', 'STATUS'], fv: ['c-green', 'FAKTURA'], info: ['', 'POWIAD.'], coin: ['c-orange', 'NAGRODA'], doc: ['', 'DOKUM.'] };
  function eventsHtml(limit) {
    if (!events.length) return '<p class="t-dim" style="margin:0">Brak zdarzeń. Zamknij montaż w aplikacji montażysty, a tutaj pojawi się wszystko, co system zrobił automatycznie.</p>';
    return '<div class="list">' + events.slice(0, limit || 40).map(function (e) { var k = KIND[e.kind] || KIND.info; return '<div class="row" style="align-items:flex-start;justify-content:flex-start"><span class="chip ' + k[0] + '" style="flex:none;min-width:74px;justify-content:center">' + k[1] + '</span><span style="flex:1;min-width:0">' + e.text + '<br><small class="t-dim">' + e.who + '</small></span><small class="t-dim tab" style="flex:none">' + e.t + '</small></div>'; }).join('') + '</div>';
  }
  function closeOrder(photos, note) {
    closed = { at: nowTxt(), photos: photos, note: note };
    store.set('closed2155', closed);
    var o = ORDERS[0]; o.stage = 'Zamknięte'; o.pct = 100; o.left = 'zamknięte dziś';
    logEvent('doc', 'System → dokumentacja zlecenia, portal klienta', photos.length + ' zdjęć z montażu i protokół PDF dołączone do zlecenia 2155 i udostępnione klientowi AMIC.');
    logEvent('coin', 'System → Ekipa A (Paweł, Łukasz, Tomek)', 'Montaż w czasie: +60 Grafficoinów dla ekipy, ranking zaktualizowany.');
    logEvent('info', 'System → PM Robert Ś., handlowiec Agnieszka W.', 'Powiadomienie: montaż 2155 zakończony, klient podpisał protokół („' + esc(note || 'Bez uwag') + '”).');
    logEvent('fv', 'System → księgowość', 'Można wystawić fakturę III (30%) – 20 520 zł netto. Dodano zadanie dla księgowej.');
    logEvent('status', 'System', 'Status zlecenia 2155: Montaż → Odbiór ✓ → Do rozliczenia. Wynik zlecenia przeliczony: marża 32,6%.');
    logEvent('ok', 'Ekipa A · aplikacja montażysty', 'Protokół odbioru 2155 podpisany przez klienta na miejscu.');
  }
  if (closed) { ORDERS[0].stage = 'Zamknięte'; ORDERS[0].pct = 100; ORDERS[0].left = 'zamknięte dziś'; }

  /* ---------- widoki ---------- */
  var VIEWS = {};

  VIEWS.start = {
    title: 'GRAFFI Flow', sub: 'DEMO · WYBIERZ ROLĘ',
    html: function () {
      var r = function (go, ic, t, s) { return '<button class="role" data-go="' + go + '"><span class="ic">' + I[ic].replace('<svg', '<svg width="24" height="24"') + '</span><span><b>' + t + '</b><span>' + s + '</span></span></button>'; };
      return '<section class="hero"><span class="eyebrow">System zarządzania firmą · prototyp</span><span style="display:block;width:clamp(64px,16vw,96px);margin:4px 0 6px">' + LOGO + '</span><h1 style="font-size:clamp(40px,12vw,72px);font-weight:700;letter-spacing:.04em;line-height:1">GRAFFI <span style="background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">FLOW</span></h1></section>' +
        '<div class="roles">' +
        r('pulpit', 'grid', 'Zarząd', 'Pulpit: zadania, alerty, wynik zleceń') +
        r('crm', 'crm', 'Handlowiec', 'Szanse, kreator oferty, umowa, przekazanie do realizacji') +
        r('zlecenie', 'doc', 'Kierownik projektu', 'Karta zlecenia 2155 – plan vs wykonanie') +
        r('plan', 'fab', 'Kierownik produkcji', 'Gantt gniazd i propozycje AI') +
        r('tablet', 'tab', 'Pracownik produkcji', 'Tablet: PIN, maszyna, czas, model 3D') +
        r('monter', 'pin', 'Montażysta', 'Plan na mapie, instrukcja krok po kroku') +
        r('hala', 'tv', 'Monitor na hali', 'Priorytety, komunikaty, ranking') +
        r('kadry', 'people', 'Kadry / HR', 'Pracownicy, kompetencje, uprawnienia') +
        r('ustawienia', 'gear', 'Administrator', 'Ustawienia: agenci AI, modele LLM, integracje') +
        '</div>' +
        
        '<button class="btn" data-act="reset" style="align-self:flex-start">Resetuj demo (przed kolejną prezentacją)</button>';
    },
    on: function (act) {
      if (act === 'reset') { try { ['done', 'sessions', 'coins', 'closed2155', 'events', 'empdata', 'skills', 'deal', 'sources', 'firms', 'models', 'agents'].forEach(function (k) { localStorage.removeItem('gos.' + k); }); } catch (e) {} location.hash = 'start'; location.reload(); }
    }
  };

  VIEWS.pulpit = {
    title: 'Pulpit', sub: 'PIĄTEK 23.10 · ZARZĄD',
    html: function () {
      var done = ui.done, cnt = Object.keys(done).filter(function (k) { return done[k]; }).length;
      var rows = ORDERS.filter(function (o) { return ui.filter === 'all' || (ui.filter === 'late' ? (o.late || o.ok < 0) : o.g === ui.filter); });
      var stc = { mont: 'c-green', prod: 'c-orange', proj: 'c-pink' };
      return '<section class="hero"><h1>Dzień dobry, Marcin</h1></section>' +
        '<div class="kpis">' +
        '<div class="kpi"><small>Oferty otwarte</small><b>6,20 mln zł</b><em class="t-green">38 aktywnych</em></div>' +
        '<div class="kpi"><small>Sprzedaż – październik</small><b>568 tys. zł</b><div class="bar" style="margin-top:8px"><i style="width:71%"></i></div><em class="t-muted">71% planu</em></div>' +
        '<div class="kpi"><small>Zlecenia w realizacji</small><b>37</b><em class="t-orange">4 po terminie</em></div>' +
        '<div class="kpi"><small>Obciążenie hali</small><b>92%</b><em class="t-orange">CNC 118% – konflikt</em></div>' +
        '<div class="kpi"><small>Wynik zleceń (m-c)</small><b>31,4%</b><em class="t-red">przepał godzin 18,6 tys. zł</em></div>' +
        '</div>' +
        '<div class="grid g2">' +
        '<section class="card"><div class="h-row"><h2>Twoje zadania na dziś</h2><span class="chip tab">' + cnt + ' / 5</span></div><div class="list">' +
        TASKS.map(function (t, i) { return '<button class="check' + (done[i] ? ' on' : '') + '" data-act="task" data-i="' + i + '" aria-pressed="' + !!done[i] + '"><span class="box">' + (done[i] ? '✓' : '') + '</span><span class="lbl"><span style="display:block">' + t[0] + '</span><small class="t-dim">' + t[1] + '</small></span></button>'; }).join('') +
        '</div></section>' +
        '<section class="card"><div class="h-row"><h2>Alerty systemu</h2><span class="chip c-pink">' + allAlerts().length + ' wymaga reakcji</span></div><div class="grid">' +
        allAlerts().map(function (a) { return '<div class="alert ' + a[0] + '"><span class="chip ' + a[1] + '">' + a[2] + '</span><span>' + a[3] + '</span></div>'; }).join('') +
        '</div></section></div>' +
        (events.length ? '<section class="card"><div class="h-row"><h2>Ostatnie zdarzenia</h2><a href="#zlecenie" data-act="history" style="font-size:13px">Historia zlecenia 2155 →</a></div>' + eventsHtml(6) + '</section>' : '') +
        '<section class="card"><div class="h-row" style="flex-wrap:wrap"><h2>Zlecenia w realizacji</h2><div class="seg">' +
        [['all', 'Wszystkie'], ['proj', 'Projekt'], ['prod', 'Produkcja'], ['mont', 'Montaż'], ['late', 'Ryzyko']].map(function (f) { return '<button data-act="filter" data-f="' + f[0] + '" aria-pressed="' + (ui.filter === f[0]) + '">' + f[1] + '</button>'; }).join('') +
        '</div></div><div class="list">' +
        rows.map(function (o) {
          return '<a class="order" href="#zlecenie" data-go="zlecenie"><span class="num">' + o.nr + '</span><span style="min-width:0"><b style="font-weight:600">' + o.client + '</b> <span class="chip ' + stc[o.g] + '">' + o.stage + '</span><br><small class="t-dim">' + o.product + '</small></span>' +
            '<span style="text-align:right;font-size:13px"><span class="tab">' + o.date + '</span><br><small class="' + (o.late ? 't-red' : 't-dim') + '">' + o.left + '</small></span>' +
            '<span style="grid-column:2/4;display:flex;gap:10px;align-items:center"><span class="bar" style="flex:1"><i style="width:' + o.pct + '%;' + (o.late ? 'background:var(--red)' : '') + '"></i></span><small class="tab t-muted">' + o.hours + '</small><span class="chip ' + (o.ok > 0 ? 'c-green' : o.ok < 0 ? 'c-red' : '') + '">' + (o.ok > 0 ? 'w budżecie' : o.ok < 0 ? 'przekroczone' : 'w toku') + '</span></span></a>';
        }).join('') + '</div></section>' +
        '<div class="grid g2"><section class="card"><div class="h-row"><h2>Ekipy montażowe – teraz</h2><a href="#monter" data-go="monter" style="font-size:13px">Plan ekipy →</a></div>' + mapHtml(teamsSvg(), '<span>4 ekipy w trasie</span><span class="t-green">1 usterka zgłoszona</span>') + '</section>' +
        '<section class="card"><h2 style="font-size:17px;margin-bottom:12px">Handlowcy – październik</h2>' +
        [['Agnieszka W.', '246 tys. zł · 9 umów', 82], ['Robert Ś.', '198 tys. zł · 6 umów', 66], ['Michał W.', '124 tys. zł · 4 umowy', 41]].map(function (h) { return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:14px"><span>' + h[0] + '</span><span class="t-muted">' + h[1] + '</span></div><div class="bar" style="margin-top:6px"><i style="width:' + h[2] + '%;background:var(--pink)"></i></div></div>'; }).join('') +
        '<p class="t-orange" style="font-size:13px;margin:0">904 kontakty bez aktualizacji ponad 30 dni</p></section></div>';
    },
    on: function (act, el) {
      if (act === 'task') { var i = el.dataset.i; ui.done[i] = !ui.done[i]; store.set('done', ui.done); render(); }
      if (act === 'filter') { ui.filter = el.dataset.f; render(); }
      if (act === 'history') { ui.otab = 4; go('zlecenie'); }
    }
  };
  function allAlerts() {
    var bx = (typeof EMPX !== 'undefined') ? EMPX.filter(function (x) { return expiredBad(x).length; }) : [];
    var extra = bx.length ? [['a-red', 'c-red', 'BADANIA', 'Nieaktualne badania lekarskie: ' + bx.map(function (x) { return '<a href="#kadry" data-act="emp" data-nr="' + x.nr + '">' + x.name + '</a>'; }).join(', ') + ' – nie wolno dopuścić do pracy.']] : [];
    return extra.concat(closed ? [['a-green', 'c-green', 'FV', 'Zlecenie <a href="#zlecenie" data-act="history">2155</a> zamknięte, protokół podpisany – wystaw fakturę III (30%): 20 520 zł.']].concat(ALERTS) : ALERTS);
  }

  /* ================= CRM: szanse, lejek, kreator oferty, umowa, realizacja ================= */
  var STAGES = [['Nowe zapytanie', 10, '#8F8882'], ['Kwalifikacja', 20, '#FF69B2'], ['Wizja lokalna / analiza', 30, '#C77DFF'], ['Kalkulacja', 40, '#FF9900'], ['Oferta wysłana', 60, '#E8622A'], ['Negocjacje', 80, '#88FF58'], ['Wygrana', 100, '#88FF58'], ['Przegrana', 0, '#FF5A5A'], ['Zawieszona', 0, '#8F8882']];
  var SOURCES = store.get('sources', ['Formularz www', 'Agent AI (czat na stronie)', 'Telefon', 'E-mail', 'Polecenie', 'Klient stały', 'Przetarg', 'Targi', 'LinkedIn', 'Google Ads', 'Wizyta handlowca (Tourplan)']);
  var DEAL_ID = 385;
  var LEAD_STAGE = { 0: 0, 1: 1, 2: 3, 3: 4, 4: 5 };
  LEADS.forEach(function (l) { l.stage = LEAD_STAGE[l.col]; });
  LEADS.push({ id: 377, stage: 6, title: 'Oznakowanie fabryki – litery 3D', client: 'Wiremet', value: '142 tys. zł', source: 'Klient stały', contact: '12 dni temu', prob: '100%', close: '08.10' });
  LEADS.push({ id: 370, stage: 7, title: 'Napis 3D na elewacji', client: 'Hotel Pod Orłem', value: '38 tys. zł', source: 'Google Ads', contact: '20 dni temu', prob: '0%', close: '02.10' });
  var DEAL0 = { stage: 1, step: 0, cfg: { h: 6, sides: 2, led: true, panels: 4, ral: 'RAL 9016 biały + RAL 4010 magenta', km: 25, proj: true, fund: true, elec: true, dem: false, margin: 32, disc: 0, term: '6 tygodni od akceptacji projektu', pay: '30% zaliczki / 40% po wykonaniu konstrukcji / 30% po odbiorze', warranty: '24 miesiące (konstrukcja), 12 miesięcy (LED)', valid: '30 dni', place: 'ul. Szosa Chełmińska 120, 87-100 Toruń (parking przy wejściu głównym)', special: 'Fundament po stronie Graffico. Zgłoszenie robót do starostwa – po stronie Zamawiającego.' },
    offerNr: '', offerAt: '', contractNr: '', contractAt: '', handed: false, lostReason: '', next: [['Telefon – potwierdzenie wymiarów i lokalizacji', '26.10.2026, 10:00', 'Agnieszka W.'], ['Wizja lokalna z technikiem (Karol)', '28.10.2026, 13:00', 'Karol P.']],
    hist: [['12.10.2026', 'Zapytanie z formularza www: „Pylon przy wejściu do przychodni, podświetlany, z listą poradni”.', 'Formularz www'], ['13.10.2026', 'Lead zakwalifikowany przez AI Gate: potencjał wysoki, podobne realizacje 2090, 2136.', 'AI Gate'], ['14.10.2026', 'Rozmowa telefoniczna z p. Ewą (kierownik administracji). Budżet ok. 80 tys. zł netto.', 'Agnieszka W.'], ['17.10.2026', 'Wysłano wizualizację v2 (PDF) – klient prosi o 4 panele z nazwami poradni.', 'Ula (grafik)']] };
  var deal = store.get('deal', null) || JSON.parse(JSON.stringify(DEAL0));
  function saveDeal() { store.set('deal', deal); }
  var crm = { screen: 'lejek', lead: null, src: false };
  function zl(n) { return Math.round(n).toLocaleString('pl-PL') + ' zł'; }
  function today() { return '23.10.2026'; }

  /* --- receptura produktu i kalkulacja --- */
  function calc(c) {
    var H = { 4: [6800, 90], 6: [9400, 120], 8: [12600, 160] }[c.h];
    var rate = 85, L = [];
    var matK = H[0] * (c.sides === 2 ? 1 : .85), hrs = H[1] * (c.sides === 2 ? 1 : .85);
    L.push({ g: 'p', name: 'Konstrukcja pylonu ' + c.h + ' m, ' + (c.sides === 2 ? 'dwustronnego' : 'jednostronnego') + ' – stal ocynkowana + poszycie z kompozytu Al 3 mm, malowanie proszkowe ' + c.ral, qty: 1, unit: 'kpl', mat: matK, h: hrs });
    if (c.led) L.push({ g: 'p', name: 'Podświetlenie LED (moduły 3-diodowe, zasilacze IP67, sterownik zmierzchowy)', qty: 1, unit: 'kpl', mat: 650 * c.h, h: 4 * c.h });
    L.push({ g: 'p', name: 'Kaseton z logo – lico plexi opal z folią translucentną', qty: c.sides, unit: 'szt.', mat: 1200, h: 6 });
    if (c.panels) L.push({ g: 'p', name: 'Panele informacyjne wymienne (nazwy poradni), Al + folia', qty: c.panels * c.sides, unit: 'szt.', mat: 190, h: 1 });
    if (c.proj) L.push({ g: 's', name: 'Projekt wykonawczy i wizualizacja 3D (do 2 poprawek)', qty: 1, unit: 'usł.', cost: 900, h: 0 });
    if (c.fund) L.push({ g: 's', name: 'Fundament prefabrykowany z kotwami M24 + roboty ziemne', qty: 1, unit: 'usł.', cost: 3200, h: 0 });
    L.push({ g: 's', name: 'Transport HDS (Toruń → miejsce montażu, ' + c.km + ' km)', qty: 1, unit: 'usł.', cost: 350 + 4.5 * c.km * 2, h: 0 });
    L.push({ g: 's', name: 'Montaż pylonu – ekipa 3 os. + podnośnik / dźwig, ' + (c.h >= 8 ? '2 dni' : '1 dzień'), qty: 1, unit: 'usł.', cost: c.h >= 8 ? 5200 : 2600, h: 0 });
    if (c.elec && c.led) L.push({ g: 's', name: 'Przyłącze elektryczne do 30 m z rozdzielni obiektu + pomiary', qty: 1, unit: 'usł.', cost: 900, h: 0 });
    if (c.dem) L.push({ g: 's', name: 'Demontaż i utylizacja istniejącego nośnika', qty: 1, unit: 'usł.', cost: 1200, h: 0 });
    var m = c.margin / 100, tot = { cost: 0, net: 0, h: 0, mat: 0 };
    L.forEach(function (l) { var unitCost = l.g === 'p' ? (l.mat + l.h * rate) : l.cost; l.unitCost = unitCost; l.cost = unitCost * l.qty; l.price = Math.round(unitCost / (1 - m) * (1 - c.disc / 100) / 10) * 10; l.net = l.price * l.qty; tot.cost += l.cost; tot.net += l.net; tot.h += (l.h || 0) * l.qty; tot.mat += (l.mat || 0) * l.qty; });
    tot.vat = Math.round(tot.net * .23); tot.gross = tot.net + tot.vat; tot.margin = tot.net - tot.cost; tot.mp = tot.margin / tot.net * 100; tot.rate = rate;
    return { lines: L, tot: tot };
  }
  function bom(c) {
    var k = c.h / 6, s = c.sides === 2 ? 1 : .85;
    return [
      ['MAT-PROF-80', 'Profil stalowy 80×80×4 ocynk', Math.round(54 * k * s), 'mb', 62, 'Plac B', 18.4],
      ['MAT-PROF-40', 'Profil stalowy 40×40×3 ocynk', Math.round(80 * k * s), 'mb', 140, 'Plac B', 9.1],
      ['MAT-KOMP-3', 'Płyta kompozytowa Al 3 mm 1500×3050', Math.ceil(9 * k * s), 'ark.', 4, 'R2 / półka 1', 286],
      ['MAT-LED-M3', 'Moduły LED 3-diodowe 1,2 W', c.led ? Math.round(160 * k * s) : 0, 'szt.', 220, 'Magazyn 1', 3.9],
      ['MAT-ZAS-150', 'Zasilacz LED 150 W IP67', c.led ? Math.ceil(3 * k * s) : 0, 'szt.', 1, 'Magazyn 1', 189],
      ['MAT-PLEX-OP', 'Plexi opal 5 mm 2050×3050', c.sides, 'ark.', 0, '—', 710],
      ['MAT-FOL-TR', 'Folia translucentna Oracal 8500 (RAL 4010)', 6, 'mb', 25, 'Magazyn 3', 48],
      ['MAT-FARBA-P', 'Farba proszkowa RAL 9016', 12, 'kg', 40, 'Malarnia', 31],
      ['MAT-KOTWA-24', 'Kotwa fundamentowa M24 z nakrętkami', 4, 'kpl', 2, 'Magazyn 1', 96],
      ['MAT-FUND-P', 'Fundament prefabrykowany 1,2×1,2 m', c.fund ? 1 : 0, 'szt.', 0, '—', 1650]
    ].filter(function (r) { return r[2] > 0; });
  }
  function stageBar(i) {
    return '<div class="scroll-x"><div style="display:grid;grid-template-columns:repeat(7,minmax(86px,1fr));gap:6px;min-width:640px">' + STAGES.slice(0, 7).map(function (s, k) {
      var st = k < i ? 2 : k === i ? 1 : 0;
      return '<button data-act="setstage" data-i="' + k + '" style="background:none;border:0;padding:0;text-align:left;color:var(--fg)" aria-pressed="' + (k === i) + '"><i style="display:block;height:7px;border-radius:7px;margin-bottom:6px;background:' + (st === 2 ? 'var(--green)' : st === 1 ? 'var(--grad)' : 'rgba(255,255,255,.1)') + '"></i><b style="font-size:12px;display:block;' + (st ? '' : 'color:var(--dim)') + '">' + s[0] + '</b><small class="t-dim tab">' + s[1] + '%</small></button>';
    }).join('') + '</div></div>';
  }

  VIEWS.crm = {
    title: 'CRM – szanse sprzedaży', sub: 'HANDLOWIEC · AGNIESZKA W.',
    html: function () {
      if (crm.screen === 'szansa') return dealHtml();
      if (crm.screen === 'kreator') return wizardHtml();
      if (crm.screen === 'realizacja') return realHtml();
      if (crm.tab === 'firmy') return crmTabs() + firmsHtml();
      if (crm.tab === 'zrodla') return crmTabs() + sourcesHtml();
      LEADS.forEach(function (l) { if (l.id === DEAL_ID) { l.stage = deal.stage; l.prob = STAGES[deal.stage][1] + '%'; if (deal.offerNr) l.value = zl(calc(deal.cfg).tot.net).replace(' zł', '') + ' zł'; } });
      var val = function (l) { return parseFloat(String(l.value).replace(/\s/g, '').replace(',', '.')) * (String(l.value).indexOf('tys') > -1 ? 1000 : 1); };
      var open = LEADS.filter(function (l) { return l.stage < 6; });
      var sum = 0, wsum = 0; open.forEach(function (l) { sum += val(l); wsum += val(l) * STAGES[l.stage][1] / 100; });
      var srcStats = {}; LEADS.forEach(function (l) { srcStats[l.source] = (srcStats[l.source] || 0) + 1; });
      return crmTabs() + '<div class="kpis"><div class="kpi"><small>Otwarte szanse</small><b>' + open.length + '</b><em class="t-dim">w lejku demo</em></div><div class="kpi"><small>Wartość lejka</small><b>' + zl(sum) + '</b></div><div class="kpi"><small>Ważona (× %)</small><b>' + zl(wsum) + '</b><em class="t-dim">wartość × prawdopodobieństwo etapu</em></div><div class="kpi"><small>Wygrane / przegrane (rok)</small><b class="tab">342 / 186</b></div><div class="kpi" style="border-color:rgba(255,153,0,.4)"><small class="t-orange">Follow-up po terminie</small><b>' + LEADS.filter(function (l) { return l.late; }).length + '</b></div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn p" data-act="addlead">+ Dodaj lead</button><button class="btn g" data-act="opendeal">Pokaż pełną ścieżkę: szansa ' + DEAL_ID + ' →</button></div>' +
        '<p class="t-dim" style="margin:0;font-size:13px">Etapy lejka mają przypisane prawdopodobieństwo. Przesuń w bok, dotknij karty, aby otworzyć szansę.</p>' +
        '<div class="scroll-x"><div class="kan" style="grid-auto-columns:minmax(230px,74vw)">' + STAGES.slice(0, 7).map(function (st, i) {
          var ls = LEADS.filter(function (l) { return l.stage === i; }), s = 0; ls.forEach(function (l) { s += val(l); });
          return '<div class="col"><div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 4px 4px;gap:6px"><span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + st[2] + ';margin-right:6px"></i>' + st[0] + ' <span class="t-dim">· ' + st[1] + '%</span></span><span class="t-dim tab">' + (s ? Math.round(s / 1000) + ' tys.' : '') + '</span></div>' +
            ls.map(function (l) { var demo = l.id === DEAL_ID; return '<button class="lead" data-act="lead" data-id="' + l.id + '"' + (demo ? ' style="border-color:rgba(136,255,88,.5)"' : '') + '><b style="font-size:14px;display:block">' + l.title + '</b><small class="t-muted">' + l.client + '</small><span style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><b>' + l.value + '</b><span class="chip">' + l.source + '</span></span><small class="' + (l.late ? 't-orange' : 't-dim') + '" style="display:block;margin-top:8px">Kontakt: ' + l.contact + '</small>' + (demo ? '<span class="chip c-green" style="margin-top:8px">pełna ścieżka demo</span>' : '') + '</button>'; }).join('') + '</div>';
        }).join('') + '</div></div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip c-red">Przegrane: ' + LEADS.filter(function (l) { return l.stage === 7; }).length + '</span><span class="chip">Zawieszone: ' + LEADS.filter(function (l) { return l.stage === 8; }).length + '</span></div>';
    },
    on: function (act, el) {
      if (act === 'lead') { var id = +el.dataset.id; if (id === DEAL_ID) { crm.screen = 'szansa'; render(); window.scrollTo(0, 0); return; } ui.lead = id; ui.ai = false; openSheet(leadSheet()); }
      if (act === 'crmtab') { crm.tab = el.dataset.t; render(); return; }
      if (act === 'firm') { openSheet(firmCard(firmById(el.dataset.id))); return; }
      if (act === 'addlead') { crm.lf = { firm: el.dataset.firm ? +el.dataset.firm : null, q: '', owner: 'Agnieszka W.', src: SOURCES[0], prod: 'Pylon', person: 0 }; openSheet(leadForm()); return; }
      if (act === 'pickfirm') { crm.lf.firm = +el.dataset.id; crm.lf.person = firmById(el.dataset.id).contacts.length ? 0 : 'new'; reSheet(leadForm()); return; }
      if (act === 'lfclear') { crm.lf.firm = null; reSheet(leadForm()); return; }
      if (act === 'lfset') { crm.lf[el.dataset.k] = el.dataset.v; reSheet(leadForm()); return; }
      if (act === 'leadback') { reSheet(leadForm()); return; }
      if (act === 'newfirm') { crm.ff = { name: '', nip: '', branza: 'Usługi', owner: 'Agnieszka W.', _back: el.dataset.back || '' }; openSheet(firmForm()); return; }
      if (act === 'editfirm') { var ef = firmById(el.dataset.id); crm.ff = JSON.parse(JSON.stringify(ef)); crm.ff._back = ''; openSheet(firmForm()); return; }
      if (act === 'ffset') { crm.ff[el.dataset.k] = el.dataset.v; reSheet(firmForm()); return; }
      if (act === 'gus') {
        var n = String(crm.ff.nip || '').replace(/[^\d]/g, '');
        if (!nipOk(n)) { toast('Wpisz poprawny 10-cyfrowy NIP'); return; }
        var g = GUS_DEMO[n];
        if (g) { Object.keys(g).forEach(function (k) { if (g[k] !== undefined) crm.ff[k] = g[k]; }); crm.ff._gus = 'Pobrano z GUS: ' + g.full + ', ' + g.addr + ', ' + g.zip + ' ' + g.city + ' (symulacja).'; }
        else crm.ff._gus = 'Symulacja: dla tego NIP w wersji docelowej rejestr GUS uzupełni nazwę, REGON i adres. W demo działają NIP 123-456-32-18 i 527-171-11-06.';
        crm.ff.nip = n; reSheet(firmForm()); return;
      }
      if (act === 'usefirm') { if (crm.ff._back === 'lead') { crm.lf.firm = +el.dataset.id; reSheet(leadForm()); } else openSheet(firmCard(firmById(el.dataset.id))); return; }
      if (act === 'savefirm') {
        var ff = crm.ff, nn = String(ff.nip || '').replace(/[^\d]/g, '');
        if (!String(ff.name || '').trim()) return toast('Podaj nazwę kontrahenta');
        if (nn && !nipOk(nn)) return toast('NIP jest nieprawidłowy – popraw albo zostaw puste');
        if (nn && FIRMS.some(function (x) { return x.nip === nn && x.id !== ff.id; })) return toast('Kontrahent z tym NIP już istnieje');
        var rec = { id: ff.id || Math.max.apply(null, FIRMS.map(function (x) { return x.id; })) + 1, name: ff.name.trim(), full: ff.full || '', nip: nn, regon: ff.regon || '', addr: ff.addr || '', zip: ff.zip || '', city: ff.city || '', woj: ff.woj || '', branza: ff.branza || '', owner: ff.owner || 'Agnieszka W.', source: ff.source || (crm.lf && crm.lf.src) || '', added: ff.added || '24.10.2026', www: ff.www || '', contacts: ff.contacts || [] };
        var ix = FIRMS.map(function (x) { return x.id; }).indexOf(rec.id); if (ix > -1) FIRMS[ix] = rec; else FIRMS.unshift(rec);
        saveFirms(); render(); toast('Zapisano kontrahenta: ' + rec.name);
        if (ff._back === 'lead') { crm.lf.firm = rec.id; crm.lf.person = 'new'; openSheet(leadForm()); } else openSheet(firmCard(rec));
        return;
      }
      if (act === 'savelead') {
        var d = crm.lf, fm = firmById(d.firm);
        if (!String(d.title || '').trim()) return toast('Wpisz temat zapytania');
        var cl = parsePl(d.close || '2026-11-30');
        if (d.person === 'new' && d.pname) { fm.contacts.push({ name: d.pname, role: d.prole || '', phone: '', email: '' }); saveFirms(); }
        if (d.contact && (d.contact.telefon || d.contact.email) && !fm.contacts.some(function (c) { return c.phone && c.phone === d.contact.telefon; })) { fm.contacts.push({ name: 'Kontakt ogólny firmy', role: 'z publicznego źródła', phone: d.contact.telefon || '', email: d.contact.email || '' }); saveFirms(); }
        var v = +String(d.value || '').replace(/[^\d]/g, '');
        LEADS.unshift({ id: 401 + LEADS.length, stage: 0, title: d.title.trim(), client: fm.name, value: v ? (v >= 1000 ? Math.round(v / 1000) + ' tys. zł' : v + ' zł') : '—', source: d.src, contact: 'dziś', prob: '10%', close: cl ? plDate(cl) : '—', owner: d.owner, prod: lfProds(d).join(', '), note: d.next || '' });
        closeSheet(); crm.tab = 'lejek'; render(); toast('Dodano lead: ' + d.title.trim() + ' – ' + fm.name);
        return;
      }
      if (act === 'opendeal') { crm.screen = 'szansa'; render(); window.scrollTo(0, 0); }
      if (act === 'srcs') { crm.src = !crm.src; render(); }
      if (act === 'newlead') openSheet('<div class="grab"></div><h2>Nowe zapytanie</h2><form data-form="newlead" class="grid"><label class="t-muted" style="font-size:13px">Firma / klient<input id="nlC" class="in" style="margin-top:4px" required placeholder="np. Stacja paliw XYZ"></label><label class="t-muted" style="font-size:13px">Czego dotyczy<input id="nlT" class="in" style="margin-top:4px" required placeholder="np. Pylon cenowy 6 m"></label><label class="t-muted" style="font-size:13px">Źródło<select id="nlS" class="in" style="margin-top:4px">' + SOURCES.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select></label><label class="t-muted" style="font-size:13px">Szacowana wartość (zł netto)<input id="nlV" class="in" inputmode="numeric" style="margin-top:4px" placeholder="np. 45000"></label><button class="btn p full">Dodaj do lejka (Nowe zapytanie, 10%)</button><button type="button" class="btn full" data-act="close">Anuluj</button></form>');
      if (act === 'ai') { ui.ai = true; openSheet(leadSheet()); }
      if (act === 'win') { closeSheet(); toast('Lead przeniesiony do etapu Negocjacje'); }
      if (act === 'back') { crm.screen = crm.screen === 'kreator' ? 'szansa' : crm.screen === 'realizacja' ? 'szansa' : 'lejek'; render(); window.scrollTo(0, 0); }
      if (act === 'setstage') { var i = +el.dataset.i; if (i === 6 && !deal.offerNr) return toast('Najpierw przygotuj i wyślij ofertę (kreator)'); deal.stage = i; deal.hist.unshift([today(), 'Zmiana etapu: ' + STAGES[i][0] + ' (' + STAGES[i][1] + '%).', 'Agnieszka W.']); if (i === 6) winDeal(); saveDeal(); render(); }
      if (act === 'lost') { deal.stage = 7; deal.hist.unshift([today(), 'Szansa oznaczona jako przegrana.', 'Agnieszka W.']); saveDeal(); render(); }
      if (act === 'wizard') { crm.screen = 'kreator'; deal.step = deal.step || 0; if (deal.stage < 3) { deal.stage = 3; deal.hist.unshift([today(), 'Rozpoczęto kalkulację oferty w kreatorze (etap Kalkulacja, 40%).', 'Agnieszka W.']); } saveDeal(); render(); window.scrollTo(0, 0); }
      if (act === 'wstep') { deal.step = +el.dataset.s; saveDeal(); render(); window.scrollTo(0, 0); }
      if (act === 'cfg') { var k = el.dataset.k, v = el.dataset.v; deal.cfg[k] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v; saveDeal(); render(); }
      if (act === 'genoffer') { if (!deal.offerNr) { deal.offerNr = 'OF/2026/10/' + (120 + DEAL_ID % 7); deal.offerAt = today(); } if (deal.stage < 4) deal.stage = 4; deal.hist.unshift([today(), 'Oferta ' + deal.offerNr + ' wygenerowana i wysłana do klienta (' + zl(calc(deal.cfg).tot.net) + ' netto). Etap: Oferta wysłana (60%).', 'Agnieszka W.']); saveDeal(); crm.screen = 'szansa'; render(); crmDoc('Oferta ' + deal.offerNr, offerDoc()); }
      if (act === 'viewoffer') crmDoc('Oferta ' + deal.offerNr, offerDoc());
      if (act === 'win2') { deal.stage = 6; deal.hist.unshift([today(), 'Klient zaakceptował ofertę ' + deal.offerNr + '. Szansa wygrana (100%).', 'Agnieszka W.']); winDeal(); saveDeal(); render(); toast('Szansa wygrana – utworzono projekt umowy'); }
      if (act === 'viewcontract') crmDoc('Umowa ' + deal.contractNr, contractDoc());
      if (act === 'handoff') { deal.handed = true; deal.hist.unshift([today(), 'Przekazano do realizacji: zlecenie produkcyjne 2171, zapotrzebowanie zakupowe do Wapro, zlecenie montażu.', 'System']); if (!ORDERS.some(function (o) { return o.nr === '2171'; })) ORDERS.unshift({ nr: '2171', client: 'Centrum Medyczne SALUS', product: 'Pylon ' + deal.cfg.h + ' m z montażem', stage: 'Projekt', g: 'proj', pct: 5, date: '04.12', left: 'za 6 tyg.', hours: Math.round(calc(deal.cfg).tot.h) + ' / 0 h', ok: 0 }); saveDeal(); crm.screen = 'realizacja'; render(); window.scrollTo(0, 0); toast('Utworzono zlecenie produkcyjne 2171'); }
      if (act === 'openreal') { crm.screen = 'realizacja'; render(); window.scrollTo(0, 0); }
      if (act === 'wapro') toast('Zsynchronizowano z Wapro Mag (iMag API) – stany i ceny aktualne na ' + nowTxt());
      if (act === 'order') { el.disabled = true; el.textContent = 'Zamówiono ✓'; toast('Zamówienie ZAM wysłane do dostawcy i zapisane w Wapro'); }
      if (act === 'sendmont') { toast('Zlecenie montażu wysłane do aplikacji ekipy A'); }
      if (act === 'resetdeal') { deal = JSON.parse(JSON.stringify(DEAL0)); saveDeal(); ORDERS = ORDERS.filter(function (o) { return o.nr !== '2171'; }); crm.screen = 'szansa'; render(); }
    },
    submit: function (f) {
      if (f.dataset.form === 'addcontact') { var cf = firmById(f.dataset.id), pv = $('#ctP').value; cf.contacts.push({ name: $('#ctN').value, role: $('#ctR').value, phone: pv.indexOf('@') < 0 ? pv : '', email: pv.indexOf('@') > -1 ? pv : '' }); saveFirms(); reSheet(firmCard(cf)); toast('Dodano osobę kontaktową'); return; }
      if (f.dataset.form === 'addsrc') { var v = $('#srcIn').value.trim(); if (v && SOURCES.indexOf(v) < 0) { SOURCES.push(v); store.set('sources', SOURCES); toast('Dodano źródło: ' + v); } render(); }
      if (f.dataset.form === 'newlead') { LEADS.unshift({ id: 400 + LEADS.length, stage: 0, title: $('#nlT').value, client: $('#nlC').value, value: ($('#nlV').value ? Math.round(+$('#nlV').value / 1000) + ' tys. zł' : '—'), source: $('#nlS').value, contact: 'dziś', prob: '10%', close: '—' }); closeSheet(); render(); toast('Dodano zapytanie do lejka'); }
      if (f.dataset.form === 'nextstep') { deal.next.push([$('#nsT').value, $('#nsD').value || 'do ustalenia', 'Agnieszka W.']); saveDeal(); render(); toast('Dodano przypomnienie'); }
      if (f.dataset.form === 'note') { var t = $('#noteIn').value.trim(); if (t) { deal.hist.unshift([today(), t, 'Agnieszka W.']); saveDeal(); render(); } }
    }
  };
  function crmDoc(t, h) { kd.doc = null; openDoc(t, h); }
  function winDeal() { if (!deal.contractNr) { deal.contractNr = 'UM/2026/' + (40 + DEAL_ID % 9) + '/GR'; deal.contractAt = today(); } }
  function leadSheet() {
    var l = LEADS.filter(function (x) { return x.id === ui.lead; })[0];
    return '<div class="grab"></div><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><small class="t-dim">Lead #' + l.id + ' · ' + STAGES[l.stage][0] + '</small><h2 style="font-size:20px">' + l.title + '</h2></div><span class="chip c-pink">Szansa ' + STAGES[l.stage][1] + '%</span></div>' +
      '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));font-size:14px">' + [['Klient', l.client], ['Wartość', l.value], ['Źródło', l.source], ['Opiekun', 'Agnieszka W.'], ['Zamknięcie', l.close], ['Ostatni kontakt', l.contact]].map(function (p) { return '<div><small class="t-dim">' + p[0] + '</small><div>' + p[1] + '</div></div>'; }).join('') + '</div>' +
      '<button class="btn g full" data-act="ai">' + I.spark + 'AI Gate: kwalifikuj i wyceń</button>' +
      (ui.ai ? '<div class="alert a-green" style="flex-direction:column;gap:6px"><b class="t-green">Agent „Kwalifikacja leadów”</b><span>Potencjał <b>wysoki</b>. Podobne realizacje: 2090, 2136 (średnia marża 34%). Ryzyko: fundament po stronie klienta – dopytaj.</span></div>' : '') +
      '<p class="t-dim" style="font-size:13px;margin:0">Pełną ścieżkę (kreator oferty, umowa, realizacja) pokazuje szansa ' + DEAL_ID + ' – SALUS Toruń.</p><button class="btn p full" data-act="opendeal">Otwórz szansę ' + DEAL_ID + '</button><button class="btn full" data-act="close">Zamknij</button>';
  }

  /* --- karta szansy --- */
  function dealHtml() {
    var c = calc(deal.cfg), st = STAGES[deal.stage], won = deal.stage === 6;
    var value = deal.offerNr ? c.tot.net : 84000;
    return '<button class="btn" data-act="back" style="align-self:flex-start">‹ Lejek sprzedaży</button>' +
      '<section style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;justify-content:space-between"><div style="min-width:0"><small class="t-dim">Szansa #' + DEAL_ID + ' · źródło: Formularz www → AI Gate</small><h1 style="font-size:24px;margin-top:2px">Pylon reklamowy z montażem – Centrum Medyczne SALUS, Toruń</h1><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><span class="chip ' + (won ? 'c-green' : deal.stage === 7 ? 'c-red' : 'c-pink') + '">' + st[0] + ' · ' + st[1] + '%</span><span class="chip">Opiekun: Agnieszka W.</span><span class="chip">Kontakt: Ewa N. – kierownik administracji</span></div></div></section>' +
      '<section class="card">' + stageBar(Math.min(deal.stage, 6)) + '<small class="t-dim">Dotknij etapu, aby go zmienić. Etap „Wygrana” wymaga wysłanej oferty.</small></section>' +
      '<div class="kpis"><div class="kpi"><small>Wartość szansy (netto)</small><b>' + zl(value) + '</b><em class="t-dim">' + (deal.offerNr ? 'z oferty ' + deal.offerNr : 'szacunek z zapytania') + '</em></div><div class="kpi"><small>Prawdopodobieństwo</small><b>' + st[1] + '%</b></div><div class="kpi"><small>Wartość ważona</small><b>' + zl(value * st[1] / 100) + '</b></div><div class="kpi"><small>Planowane zamknięcie</small><b>20.11.2026</b></div><div class="kpi"><small>Marża z kalkulacji</small><b class="' + (c.tot.mp >= 28 ? 't-green' : 't-orange') + '">' + (deal.offerNr ? c.tot.mp.toFixed(1).replace('.', ',') + '%' : '—') + '</b></div></div>' +
      '<section class="card"><div class="h-row"><h2>Co dalej</h2></div><div class="grid">' +
      (!deal.offerNr ? '<div class="alert a-orange" style="align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:200px">Klient czeka na ofertę. Kreator złoży ją z receptury produktu, usług montażu i kalkulacji marży.</span><button class="btn p" data-act="wizard">Utwórz ofertę w kreatorze</button></div>' : '') +
      (deal.offerNr && !won ? '<div class="alert a-orange" style="align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:200px">Oferta <b>' + deal.offerNr + '</b> wysłana ' + deal.offerAt + ' (' + zl(c.tot.net) + ' netto). Ważna 30 dni.</span><button class="btn" data-act="viewoffer">Podgląd oferty</button><button class="btn" data-act="wizard">Edytuj w kreatorze</button><button class="btn p" data-act="win2">Klient akceptuje → Wygrana</button><button class="btn r" data-act="lost">Przegrana</button></div>' : '') +
      (won ? '<div class="alert a-green" style="align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:200px">Szansa wygrana. Umowa <b>' + deal.contractNr + '</b> przygotowana na podstawie oferty ' + deal.offerNr + '.</span><button class="btn" data-act="viewoffer">Oferta</button><button class="btn" data-act="viewcontract">Podgląd i wydruk umowy</button>' + (deal.handed ? '<button class="btn p" data-act="openreal">Zobacz realizację 2171 →</button>' : '<button class="btn p" data-act="handoff">Przekaż do realizacji →</button>') + '</div>' : '') +
      '</div></section>' +
      '<div class="grid g2"><section class="card"><div class="h-row"><h2>Następne kroki i przypomnienia</h2></div><div class="list">' + deal.next.map(function (n) { return '<div class="row"><span>' + esc(n[0]) + '<br><small class="t-dim">' + esc(n[2]) + '</small></span><span class="chip c-orange" style="align-self:center">' + esc(n[1]) + '</span></div>'; }).join('') + '</div>' +
      '<form data-form="nextstep" class="grid" style="margin-top:10px;grid-template-columns:1fr auto;align-items:end"><label class="t-muted" style="font-size:12px">Nowe przypomnienie<input id="nsT" class="in" style="margin-top:4px" placeholder="np. Zadzwoń po decyzję zarządu" required></label><label class="t-muted" style="font-size:12px">Kiedy<input id="nsD" class="in" style="margin-top:4px;width:130px" placeholder="dd.mm.rrrr"></label><button class="btn p" style="grid-column:1/-1">Dodaj przypomnienie</button></form></section>' +
      '<section class="card"><div class="h-row"><h2>Historia kontaktu</h2></div><form data-form="note" style="display:flex;gap:8px;margin-bottom:8px"><label for="noteIn" style="position:absolute;left:-9999px">Notatka</label><input id="noteIn" class="in" placeholder="Dodaj notatkę z rozmowy…"><button class="btn p">Zapisz</button></form><div class="list">' + deal.hist.map(function (h) { return '<div class="row" style="justify-content:flex-start;align-items:flex-start"><small class="t-dim tab" style="flex:none;width:78px">' + h[0] + '</small><span style="flex:1;min-width:0">' + esc(h[1]) + '<br><small class="t-dim">' + esc(h[2]) + '</small></span></div>'; }).join('') + '</div></section></div>' +
      '<section class="card"><div class="h-row"><h2>Dokumenty przy szansie</h2></div><div class="list"><div class="row"><span>Zapytanie z formularza www + 3 zdjęcia lokalizacji</span><span class="t-dim">12.10</span></div><div class="row"><span>Wizualizacja v2 (PDF)</span><span class="t-dim">17.10</span></div><div class="row"><span>NDA</span><span class="chip c-green">nie wymagane</span></div>' + (deal.offerNr ? '<div class="row"><span>Oferta ' + deal.offerNr + '</span><button class="btn" style="min-height:36px;font-size:12px" data-act="viewoffer">Podgląd</button></div>' : '') + (won ? '<div class="row"><span>Umowa ' + deal.contractNr + '</span><button class="btn" style="min-height:36px;font-size:12px" data-act="viewcontract">Podgląd</button></div>' : '') + '</div></section>' +
      '<button class="btn" data-act="resetdeal" style="align-self:flex-start;font-size:13px">Zacznij ścieżkę od nowa (demo)</button>';
  }

  /* --- kreator oferty --- */
  function wizardHtml() {
    var c = deal.cfg, k = calc(c), s = deal.step;
    var STEPS = ['Klient', 'Produkt', 'Usługi', 'Kalkulacja', 'Warunki'];
    var opt = function (key, vals, labels) { return '<div class="seg">' + vals.map(function (v, i) { return '<button data-act="cfg" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (String(c[key]) === String(v)) + '">' + (labels ? labels[i] : v) + '</button>'; }).join('') + '</div>'; };
    var tog = function (key, label, sub) { return '<button class="check' + (c[key] ? ' on' : '') + '" data-act="cfg" data-k="' + key + '" data-v="' + !c[key] + '" aria-pressed="' + !!c[key] + '" style="border-bottom:1px solid var(--line)"><span class="box">' + (c[key] ? '✓' : '') + '</span><span><span style="display:block">' + label + '</span><small class="t-dim">' + sub + '</small></span></button>'; };
    var body = '';
    if (s === 0) body = '<div class="grid g2"><div class="grid" style="font-size:14px"><div><small class="t-dim">Klient</small><div><b>Centrum Medyczne SALUS sp. z o.o.</b><br>[adres i NIP klienta z karty firmy]</div></div><div><small class="t-dim">Osoba kontaktowa</small><div>Ewa N. – kierownik administracji · [telefon, e-mail z karty kontaktu]</div></div><div><small class="t-dim">Miejsce montażu</small><div>' + esc(c.place) + '</div></div></div><div class="card" style="background:var(--surface2)"><b>Dane pobrane automatycznie</b><p class="t-muted" style="margin:6px 0 0;font-size:14px">Kreator bierze dane z karty firmy i kontaktu w CRM oraz ustalenia z historii szansy (4 panele z nazwami poradni, podświetlenie).</p></div></div>';
    if (s === 1) body = '<div class="grid g2" style="align-items:start"><div class="grid"><div><b>Produkt z katalogu (receptura)</b><p class="t-dim" style="margin:2px 0 8px;font-size:13px">Pylon reklamowy – receptura PYL-STD: konstrukcja, poszycie, oświetlenie, kaseton, panele</p></div>' +
      '<div><small class="t-muted">Wysokość</small>' + opt('h', [4, 6, 8], ['4 m', '6 m', '8 m']) + '</div><div><small class="t-muted">Strony</small>' + opt('sides', [1, 2], ['jednostronny', 'dwustronny']) + '</div><div><small class="t-muted">Panele informacyjne (na stronę)</small>' + opt('panels', [0, 2, 4, 6]) + '</div>' + tog('led', 'Podświetlenie LED', 'moduły 3-diodowe, sterownik zmierzchowy') + '<div><small class="t-muted">Kolorystyka</small><div>' + esc(c.ral) + '</div></div></div>' +
      '<div class="pylon" role="img" aria-label="Podgląd pylonu" style="height:' + (200 + c.h * 12) + 'px"><div class="p" style="height:' + (100 + c.h * 16) + 'px;' + (c.led ? 'box-shadow:0 0 28px rgba(255,105,178,.35)' : '') + '"><div class="lg" style="font-size:12px">SALUS</div>' + Array.apply(null, Array(c.panels)).map(function () { return '<div class="pr" style="font-family:var(--f-body);font-size:9px;color:#ddd;background:#2A2522">PORADNIA</div>'; }).join('') + '</div><span class="chip" style="position:absolute;left:12px;top:12px;background:rgba(0,0,0,.5)">' + c.h + ' m · ' + (c.sides === 2 ? 'dwustronny' : 'jednostronny') + (c.led ? ' · LED' : '') + '</span></div></div>';
    if (s === 2) body = '<div class="list">' + tog('proj', 'Projekt wykonawczy i wizualizacja 3D', 'do 2 poprawek, zatwierdzenie w portalu klienta') + tog('fund', 'Fundament prefabrykowany z robotami ziemnymi', 'kotwy M24, zasypanie, odtworzenie nawierzchni') + tog('elec', 'Przyłącze elektryczne do 30 m', 'wymaga podświetlenia LED; pomiary elektryczne') + tog('dem', 'Demontaż istniejącego nośnika', 'z utylizacją') + '</div>' +
      '<div><small class="t-muted">Odległość z bazy (Toruń) do miejsca montażu</small>' + opt('km', [25, 100, 180, 300], ['25 km', '100 km', '180 km', '300 km']) + '</div><div class="alert"><span class="chip">MONTAŻ</span><span>Montaż w cenie: ekipa 3 os. z uprawnieniami do pracy na wysokości + podnośnik / dźwig (' + (c.h >= 8 ? '2 dni' : '1 dzień') + '). Transport HDS liczony od kilometrów.</span></div>';
    if (s === 3) body = '<div class="scroll-x"><table style="width:100%;min-width:640px;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--dim);text-align:left"><th style="padding:8px 6px;font-weight:500">Pozycja</th><th style="padding:8px 6px;font-weight:500;text-align:right">Ilość</th><th style="padding:8px 6px;font-weight:500;text-align:right">Koszt</th><th style="padding:8px 6px;font-weight:500;text-align:right">Cena netto</th></tr></thead><tbody>' +
      k.lines.map(function (l) { return '<tr style="border-top:1px solid var(--line)"><td style="padding:8px 6px">' + l.name + (l.g === 'p' ? '<br><small class="t-dim">materiał ' + zl(l.mat * l.qty) + ' · ' + Math.round(l.h * l.qty) + ' rbh × ' + k.tot.rate + ' zł</small>' : '') + '</td><td class="tab" style="padding:8px 6px;text-align:right;white-space:nowrap">' + l.qty + ' ' + l.unit + '</td><td class="tab" style="padding:8px 6px;text-align:right;white-space:nowrap">' + zl(l.cost) + '</td><td class="tab" style="padding:8px 6px;text-align:right;white-space:nowrap"><b>' + zl(l.net) + '</b></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="grid g2"><div><small class="t-muted">Marża docelowa</small>' + opt('margin', [25, 28, 32, 36], ['25%', '28%', '32%', '36%']) + '<small class="t-dim">Minimalna marża bez akceptacji zarządu: 28%</small></div><div><small class="t-muted">Rabat dla klienta</small>' + opt('disc', [0, 3, 5, 8], ['0%', '3%', '5%', '8%']) + '</div></div>' +
      '<div class="alert a-green"><span class="chip c-green">AI</span><span>Podobne zlecenia (2090, 2136): średnia marża 34%, przekroczenie godzin spawania +9%. Sugestia: dolicz 10 rbh rezerwy lub trzymaj marżę ≥ 32%.</span></div>';
    if (s === 4) body = '<div class="grid" style="font-size:14px">' + [['Termin realizacji', c.term], ['Płatności', c.pay], ['Gwarancja', c.warranty], ['Ważność oferty', c.valid], ['Warunki szczególne', c.special]].map(function (p) { return '<div class="row"><span class="t-muted" style="flex:none;width:150px">' + p[0] + '</span><span style="flex:1;text-align:right">' + esc(p[1]) + '</span></div>'; }).join('') + '<div class="row"><span class="t-muted">Załączniki</span><span>Wizualizacja v2 · karta techniczna LED</span></div></div>';
    return '<button class="btn" data-act="back" style="align-self:flex-start">‹ Szansa ' + DEAL_ID + '</button><h1 style="font-size:24px">Kreator oferty</h1>' +
      '<div class="seg" role="tablist">' + STEPS.map(function (n, i) { return '<button data-act="wstep" data-s="' + i + '" aria-pressed="' + (s === i) + '">' + (i + 1) + '. ' + n + '</button>'; }).join('') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start"><section class="card grid" style="flex:999 1 520px;min-width:0">' + body + '</section>' +
      '<aside class="card grid" style="flex:1 1 280px;position:sticky;top:76px"><b>Podsumowanie</b><div class="row"><span>Koszt własny</span><span class="tab">' + zl(k.tot.cost) + '</span></div><div class="row"><span>Cena netto</span><b class="tab">' + zl(k.tot.net) + '</b></div><div class="row"><span>VAT 23%</span><span class="tab">' + zl(k.tot.vat) + '</span></div><div class="row"><span>Brutto</span><span class="tab">' + zl(k.tot.gross) + '</span></div><div class="row"><span>Marża</span><b class="tab ' + (k.tot.mp >= 28 ? 't-green' : 't-red') + '">' + zl(k.tot.margin) + ' · ' + k.tot.mp.toFixed(1).replace('.', ',') + '%</b></div><div class="row"><span>Produkcja</span><span class="tab">' + Math.round(k.tot.h) + ' rbh</span></div>' + (k.tot.mp < 28 ? '<div class="alert a-red">Marża poniżej 28% – oferta wymaga akceptacji zarządu.</div>' : '') +
      (s < 4 ? '<button class="btn p full" data-act="wstep" data-s="' + (s + 1) + '">Dalej: ' + STEPS[s + 1] + ' →</button>' : '<button class="btn p full" data-act="genoffer">Generuj ofertę i wyślij</button>') + (s > 0 ? '<button class="btn full" data-act="wstep" data-s="' + (s - 1) + '">← Wstecz</button>' : '') + '</aside></div>';
  }

  /* --- dokumenty: oferta i umowa --- */
  function itemsTable(k, withCost) {
    return '<table class="dt"><thead><tr><th>Lp.</th><th>Opis pozycji</th><th>Ilość</th><th>Cena jedn. netto</th><th>Wartość netto</th></tr></thead><tbody>' + k.lines.map(function (l, i) { return '<tr><td>' + (i + 1) + '.</td><td>' + l.name + '</td><td style="white-space:nowrap">' + l.qty + ' ' + l.unit + '</td><td style="text-align:right;white-space:nowrap">' + zl(l.price) + '</td><td style="text-align:right;white-space:nowrap">' + zl(l.net) + '</td></tr>'; }).join('') +
      '<tr><td></td><td colspan="3" style="text-align:right"><b>Razem netto</b></td><td style="text-align:right;white-space:nowrap"><b>' + zl(k.tot.net) + '</b></td></tr><tr><td></td><td colspan="3" style="text-align:right">VAT 23%</td><td style="text-align:right;white-space:nowrap">' + zl(k.tot.vat) + '</td></tr><tr><td></td><td colspan="3" style="text-align:right"><b>Razem brutto</b></td><td style="text-align:right;white-space:nowrap"><b>' + zl(k.tot.gross) + '</b></td></tr></tbody></table>';
  }
  function docHead(title, nr, date) {
    return '<div class="two" style="align-items:center;border-bottom:3px solid #E3006F;padding-bottom:12px"><div style="display:flex;align-items:center;gap:10px"><span style="width:46px;height:46px;background:#0E0D0C;border-radius:10px;padding:5px;display:block">' + LOGO + '</span><div style="font:700 18px Arial,sans-serif;letter-spacing:.08em">GRAFFICO</div></div><div style="text-align:right;font:12px Arial,sans-serif;color:#444">Twój partner inżynieryjno-brandingowy<br>graffico.pl · [adres siedziby, NIP]</div></div>' +
      '<div class="two" style="margin-top:16px"><div><div style="font:700 20px Arial,sans-serif">' + title + '</div><div style="font:13px Arial,sans-serif;color:#444">nr ' + nr + '</div></div><div style="text-align:right;font:13px Arial,sans-serif">Toruń, ' + date + '</div></div>';
  }
  function offerDoc() {
    var c = deal.cfg, k = calc(c);
    return '<article class="page">' + docHead('OFERTA HANDLOWA', deal.offerNr, deal.offerAt) +
      '<div class="two" style="margin-top:16px;font:13px/1.5 Arial,sans-serif"><div><b>Dla:</b><br>Centrum Medyczne SALUS sp. z o.o.<br>[adres i NIP klienta]<br>Ewa N. – kierownik administracji</div><div style="text-align:right"><b>Przygotowała:</b><br>Agnieszka W. – opiekun klienta<br>[telefon, e-mail]</div></div>' +
      '<p style="margin-top:18px">Dziękujemy za zapytanie. Przedstawiamy ofertę wykonania, dostawy i montażu pylonu reklamowego zgodnie z ustaleniami z 14.10.2026 i wizualizacją v2.</p>' +
      '<div class="two" style="gap:16px;align-items:stretch;margin:12px 0"><div style="flex:1;background:#141211;border-radius:8px;position:relative;min-height:190px;overflow:hidden"><div style="position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:62px;height:' + (90 + c.h * 9) + 'px;background:#2A2522;border-radius:6px 6px 2px 2px;display:flex;flex-direction:column;align-items:center;gap:5px;padding-top:8px;box-sizing:border-box' + (c.led ? ';box-shadow:0 0 22px rgba(255,105,178,.5)' : '') + '"><div style="width:48px;height:26px;border-radius:4px;background:linear-gradient(90deg,#FF69B2,#E3006F);color:#fff;font:700 9px Arial;display:grid;place-items:center">SALUS</div>' + Array.apply(null, Array(c.panels)).map(function () { return '<div style="width:48px;height:12px;background:#444;border-radius:2px"></div>'; }).join('') + '</div><span style="position:absolute;left:8px;top:8px;color:#fff;font:11px Arial">Wizualizacja poglądowa</span></div>' +
      '<div style="flex:1.3;font:13px/1.55 Arial,sans-serif"><b>Pylon reklamowy ' + c.h + ' m, ' + (c.sides === 2 ? 'dwustronny' : 'jednostronny') + '</b><br>Konstrukcja stalowa ocynkowana, poszycie z kompozytu aluminiowego 3 mm, malowanie proszkowe ' + c.ral + '. ' + (c.led ? 'Podświetlenie LED z zasilaczami IP67 i sterownikiem zmierzchowym. ' : '') + 'Kaseton z logo z licem z plexi opal. ' + (c.panels ? c.panels + ' wymiennych paneli informacyjnych na stronę. ' : '') + 'Fundament, transport i montaż z podłączeniem po stronie Graffico.</div></div>' +
      itemsTable(k) +
      '<table class="dt" style="margin-top:14px"><tbody>' + [['Termin realizacji', c.term], ['Warunki płatności', c.pay], ['Gwarancja', c.warranty], ['Ważność oferty', c.valid], ['Miejsce montażu', c.place], ['Warunki szczególne', c.special]].map(function (p) { return '<tr><td style="width:32%;background:#f6f6f6"><b>' + p[0] + '</b></td><td>' + esc(p[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="small" style="margin-top:12px">Stałe elementy oferty (dane Graffico, ogólne warunki współpracy) wstawiane są automatycznie; pozycje, ceny i warunki szczególne pochodzą z receptury produktu i kalkulacji w CRM.</p>' +
      '<div class="two" style="margin-top:26px"><div class="small">Akceptacja klienta:<br><br>………………………………<br>data i podpis</div><div class="small" style="text-align:right">Za Graffico:<br><br>………………………………<br>Agnieszka W.</div></div></article>';
  }
  function contractDoc() {
    var c = deal.cfg, k = calc(c);
    var P = function (n, t, body) { return '<p class="center" style="margin-top:14px"><b>§ ' + n + '. ' + t + '</b></p>' + body; };
    return '<article class="page">' + docHead('UMOWA O WYKONANIE I MONTAŻ', deal.contractNr, deal.contractAt) +
      '<p class="small" style="background:#FFF4D6;padding:6px 10px;border-radius:6px;margin-top:12px">Wzór umowy wygenerowany z oferty ' + deal.offerNr + '. Przed użyciem wzór powinien zatwierdzić prawnik firmy.</p>' +
      '<p>zawarta w dniu ' + deal.contractAt + ' w Toruniu pomiędzy:</p><p><b>Graffico</b> [forma prawna, adres siedziby, NIP, KRS], reprezentowaną przez [imię i nazwisko, funkcja], zwaną dalej <b>Wykonawcą</b>,</p><p>a <b>Centrum Medycznym SALUS sp. z o.o.</b> [adres, NIP, KRS], reprezentowanym przez [imię i nazwisko, funkcja], zwanym dalej <b>Zamawiającym</b>.</p>' +
      P(1, 'Przedmiot umowy', '<p>1. Wykonawca zobowiązuje się wykonać, dostarczyć i zamontować pylon reklamowy ' + c.h + ' m, ' + (c.sides === 2 ? 'dwustronny' : 'jednostronny') + (c.led ? ', podświetlany LED' : '') + ', w miejscu: ' + esc(c.place) + ', zgodnie z ofertą ' + deal.offerNr + ' z dnia ' + deal.offerAt + ' i zaakceptowaną wizualizacją, stanowiącymi załączniki nr 1 i 2.</p><p>2. Zakres prac obejmuje pozycje wymienione w tabeli:</p>' + itemsTable(k)) +
      P(2, 'Termin realizacji', '<p>1. Termin wykonania: ' + esc(c.term) + '. 2. Termin montażu Strony ustalą z wyprzedzeniem co najmniej 5 dni roboczych. 3. Zmiana terminu na wniosek Zamawiającego przesuwa termin realizacji o czas opóźnienia.</p>') +
      P(3, 'Wynagrodzenie i płatności', '<p>1. Wynagrodzenie ryczałtowe wynosi <b>' + zl(k.tot.net) + ' netto</b>, powiększone o VAT 23%, tj. <b>' + zl(k.tot.gross) + ' brutto</b>. 2. Płatności: ' + esc(c.pay) + ', przelewem w terminie 14 dni od wystawienia faktury. 3. Prace dodatkowe zlecone przez Zamawiającego (domówienia) wymagają aneksu lub pisemnego zlecenia i są rozliczane osobno.</p>') +
      P(4, 'Obowiązki Stron', '<p>1. Zamawiający udostępni teren montażu, wskaże przebieg instalacji podziemnych i zapewni punkt zasilania. ' + esc(c.special) + ' 2. Wykonawca wykona prace zgodnie ze sztuką budowlaną, przepisami BHP, przez osoby z wymaganymi uprawnieniami (praca na wysokości, UDT, SEP).</p>') +
      P(5, 'Odbiór', '<p>1. Odbiór nastąpi protokołem odbioru podpisanym w dniu zakończenia montażu, wraz z dokumentacją zdjęciową. 2. Drobne usterki nie wstrzymują odbioru; Wykonawca usunie je w terminie uzgodnionym w protokole.</p>') +
      P(6, 'Gwarancja', '<p>Wykonawca udziela gwarancji: ' + esc(c.warranty) + ', licząc od dnia odbioru. Zgłoszenia gwarancyjne przyjmowane są przez formularz na stronie graffico.pl (ze zdjęciem) lub e-mailem.</p>') +
      P(7, 'Kary umowne', '<p>1. Za opóźnienie w wykonaniu przedmiotu umowy Wykonawca zapłaci karę 0,1% wynagrodzenia netto za każdy dzień, nie więcej niż 10%. 2. Za opóźnienie w udostępnieniu terenu Zamawiający zapłaci karę w tej samej wysokości.</p>') +
      P(8, 'Postanowienia końcowe', '<p>1. Zmiany umowy wymagają formy pisemnej pod rygorem nieważności. 2. W sprawach nieuregulowanych stosuje się przepisy Kodeksu cywilnego. 3. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze Stron.</p><p class="small">Załączniki: 1) Oferta ' + deal.offerNr + '; 2) Wizualizacja v2; 3) Wzór protokołu odbioru.</p>') +
      '<div class="two" style="margin-top:40px"><div class="small center">………………………………<br>Zamawiający</div><div class="small center">………………………………<br>Wykonawca</div></div></article>';
  }

  /* --- realizacja: zlecenie produkcyjne, zakupy (Wapro), rozliczenie, montaż --- */
  function realHtml() {
    var c = deal.cfg, k = calc(c), B = bom(c), toBuy = 0;
    var ops = [['Projekt wykonawczy i technologia', 'Dział projektowy', .06], ['Cięcie (gilotyna, laser)', 'P1', .08], ['Gięcie (prasa krawędziowa)', 'P1', .07], ['Spawanie konstrukcji', 'P2 · Spawalnia', .27], ['Szlifowanie', 'P2', .10], ['Malowanie proszkowe', 'Malarnia', .12], ['Elektryka LED i test 24 h', 'P3', .14], ['Montaż wstępny i kontrola jakości', 'P3', .11], ['Pakowanie i załadunek', 'Logistyka', .05]];
    var real = [1, .9, 1.05, 1.12, .8, 0, 0, 0, 0];
    var crew = EMPX.filter(function (x) { return x.mont; }).map(function (x) { var h = x.certs.filter(function (cc) { return cc.name.indexOf('Praca na wysokości') === 0; })[0]; var ok = h && certState(h)[2] > 0 && !expiredBad(x).length; return [x, ok, h]; }).slice(0, 5);
    var planCost = k.tot.cost, realCost = 0; ops.forEach(function (o, i) { realCost += k.tot.h * o[2] * real[i] * k.tot.rate; }); var matReal = k.tot.mat * .62;
    return '<button class="btn" data-act="back" style="align-self:flex-start">‹ Szansa ' + DEAL_ID + '</button>' +
      '<section style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span class="num" style="font-size:52px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">2171</span><div style="flex:1;min-width:0"><h1 style="font-size:22px">Pylon ' + c.h + ' m z montażem – SALUS Toruń</h1><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><span class="chip c-green">z umowy ' + deal.contractNr + '</span><span class="chip">oferta ' + deal.offerNr + '</span><span class="chip c-pink">' + zl(k.tot.net) + ' netto</span></div></div></section>' +
      '<section class="card scroll-x"><div class="steps">' + [['Szansa', 'wygrana', 2], ['Oferta', deal.offerNr, 2], ['Umowa', deal.contractNr, 2], ['Zakupy', 'Wapro', 1], ['Produkcja', 'zlecenie 2171', 1], ['Rozliczenie', 'na bieżąco', 1], ['Montaż', 'planowany', 0], ['Faktura', '30/40/30', 0]].map(function (s) { return '<div><i style="background:' + (s[2] === 2 ? 'var(--green)' : s[2] === 1 ? 'var(--grad)' : 'rgba(255,255,255,.1)') + '"></i><b>' + (s[2] === 2 ? '✓ ' : '') + s[0] + '</b><small>' + s[1] + '</small></div>'; }).join('') + '</div></section>' +
      '<section class="card"><div class="h-row" style="flex-wrap:wrap"><h2>1. Zlecenie produkcyjne – technologia</h2><a href="#plan" data-go="plan" style="font-size:13px">Plan hali →</a></div><p class="t-muted" style="margin:0 0 8px;font-size:14px">Operacje i normy czasu przeniesione z kalkulacji oferty (' + Math.round(k.tot.h) + ' rbh). Pracownicy widzą je na tabletach.</p><div class="list">' +
      ops.map(function (o, i) { var p = Math.round(k.tot.h * o[2]); return '<div class="row"><span>' + o[0] + '<br><small class="t-dim">' + o[1] + '</small></span><span class="tab" style="text-align:right">' + p + ' rbh<br><small class="' + (real[i] > 1 ? 't-red' : real[i] ? 't-green' : 't-dim') + '">' + (real[i] ? 'wykonano ' + Math.round(p * real[i]) + ' rbh' : 'oczekuje') + '</small></span></div>'; }).join('') + '</div></section>' +
      '<section class="card"><div class="h-row" style="flex-wrap:wrap"><h2>2. Zapotrzebowanie i zakupy</h2><button class="btn g" data-act="wapro" style="min-height:40px">⟳ Synchronizuj z Wapro Mag</button></div>' +
      '<div class="alert" style="margin-bottom:10px"><span class="chip c-pink">WAPRO</span><span>Integracja przez iMag API: system czyta stany i ceny z Wapro Mag, rezerwuje materiał pod zlecenie 2171 i zapisuje zamówienia do dostawców (ZAM) oraz wydania na produkcję (RW). Ostatnia synchronizacja: dziś 06:00.</span></div>' +
      '<div class="scroll-x"><table style="width:100%;min-width:680px;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--dim);text-align:left"><th style="padding:8px 6px;font-weight:500">Indeks Wapro</th><th style="padding:8px 6px;font-weight:500">Materiał</th><th style="padding:8px 6px;font-weight:500;text-align:right">Potrzeba</th><th style="padding:8px 6px;font-weight:500;text-align:right">Stan</th><th style="padding:8px 6px;font-weight:500">Status</th></tr></thead><tbody>' +
      B.map(function (r) { var miss = Math.max(0, r[2] - r[4]); if (miss) toBuy += miss * r[6]; return '<tr style="border-top:1px solid var(--line)"><td style="padding:8px 6px" class="tab">' + r[0] + '</td><td style="padding:8px 6px">' + r[1] + '<br><small class="t-dim">' + r[5] + '</small></td><td class="tab" style="padding:8px 6px;text-align:right">' + r[2] + ' ' + r[3] + '</td><td class="tab" style="padding:8px 6px;text-align:right">' + r[4] + ' ' + r[3] + '</td><td style="padding:8px 6px">' + (miss ? '<button class="btn" style="min-height:34px;font-size:12px;padding:0 10px;border-color:rgba(255,153,0,.6);color:#FFB84D" data-act="order">Zamów ' + miss + ' ' + r[3] + ' (' + zl(miss * r[6]) + ')</button>' : '<span class="chip c-green">zarezerwowane</span>') + '</td></tr>'; }).join('') + '</tbody></table></div><p class="t-muted" style="margin:8px 0 0;font-size:13px">Do zamówienia: <b>' + zl(toBuy) + '</b> netto. Termin potrzeby: 06.11.2026 (start spawania wg planu).</p></section>' +
      '<section class="card"><div class="h-row"><h2>3. Rozliczenie zlecenia – plan vs wykonanie</h2></div><div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))"><div class="kpi"><small>Przychód (umowa)</small><b>' + zl(k.tot.net) + '</b></div><div class="kpi"><small>Koszt planowany</small><b>' + zl(planCost) + '</b></div><div class="kpi"><small>Koszt do dziś</small><b>' + zl(realCost + matReal) + '</b><em class="t-dim">materiał + robocizna</em></div><div class="kpi"><small>Prognoza marży</small><b class="t-green">' + (k.tot.mp - 1.4).toFixed(1).replace('.', ',') + '%</b><em class="t-orange">spawanie +12% rbh</em></div></div>' +
      '<div class="list" style="margin-top:8px"><div class="row"><span>Faktura zaliczkowa I – 30%</span><span class="t-green tab">' + zl(k.tot.gross * .3) + ' brutto · opłacona</span></div><div class="row"><span>Faktura II – 40% (po wykonaniu konstrukcji)</span><span class="t-dim tab">' + zl(k.tot.gross * .4) + '</span></div><div class="row"><span>Faktura III – 30% (po protokole odbioru)</span><span class="t-dim tab">' + zl(k.tot.gross * .3) + '</span></div></div></section>' +
      '<section class="card"><div class="h-row" style="flex-wrap:wrap"><h2>4. Zlecenie montażu</h2><a href="#monter" data-go="monter" style="font-size:13px">Aplikacja montażysty →</a></div><div class="grid g2" style="font-size:14px"><div><small class="t-dim">Termin</small><div>04.12.2026, 7:00 (1 dzień)</div></div><div><small class="t-dim">Adres</small><div>' + esc(c.place) + '</div></div><div><small class="t-dim">Sprzęt</small><div>HDS 12 t, podnośnik koszowy 12 m, agregat</div></div><div><small class="t-dim">Kontakt na miejscu</small><div>Ewa N. – kierownik administracji</div></div></div>' +
      '<div class="eyebrow" style="margin:12px 0 4px">Ekipa – kontrola uprawnień i badań</div><div class="list">' + crew.map(function (r) { return '<div class="row"><span>' + r[0].name + '<br><small class="t-dim">' + r[0].st + '</small></span><span class="chip ' + (r[1] ? 'c-green' : 'c-red') + '" style="align-self:center">' + (r[1] ? 'może jechać' : 'brak ważnych uprawnień/badań') + '</span></div>'; }).join('') + '</div>' +
      '<button class="btn p full" style="margin-top:10px" data-act="sendmont">Wyślij zlecenie montażu do ekipy A</button></section>';
  }

  /* ================= CRM: kontrahenci, GUS, dodawanie leada, źródła ================= */
  var BRANZE = ['Paliwowa', 'Medyczna', 'Miasta, gminy', 'Handlowa', 'Produkcyjna', 'Hotelarstwo', 'Usługi', 'Nieruchomości', 'Transportowa', 'Bankowa', 'Edukacja', 'Motoryzacyjna', 'Informatyczna', 'Apteczna', 'Pośrednik'];
  var PRODUCTS = ['Pylon', 'Pylon cenowy', 'Witacz', 'Otok', 'Billboard', 'Stacja paliw', 'Stojak', 'Kaseton', 'Litery 3D', 'Rura reklamowa', 'Konstrukcja stalowa', 'Inny'];
  var OWNERS = ['Agnieszka W.', 'Robert Ś.', 'Michał W.'];
  var SRC_IC = { 'Formularz www': 'M4 5h16v14H4zM4 9h16', 'Agent AI (czat na stronie)': 'M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z', 'Telefon': 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2', 'E-mail': 'M3 6h18v12H3zM3 6l9 7 9-7', 'Polecenie': 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6M16 11l2 2 4-4', 'Klient stały': 'M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z', 'Przetarg': 'M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6', 'Targi': 'M3 21V8l9-5 9 5v13M9 21v-6h6v6', 'LinkedIn': 'M4 4h16v16H4zM8 10v6M8 7v.5M12 16v-4a2 2 0 014 0v4', 'Google Ads': 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4', 'Wizyta handlowca (Tourplan)': 'M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 9v.5' };
  var SRC_HIST = { 'Klient stały': [140, 52, 1840], 'Polecenie': [96, 41, 1120], 'Wizyta handlowca (Tourplan)': [70, 30, 610], 'Targi': [22, 27, 240], 'Telefon': [120, 25, 690], 'Agent AI (czat na stronie)': [34, 22, 150], 'E-mail': [88, 20, 410], 'Formularz www': [210, 18, 760], 'Przetarg': [40, 15, 380], 'LinkedIn': [18, 11, 60], 'Google Ads': [64, 9, 170] };
  function srcIcon(s) { var d = SRC_IC[s] || 'M12 3v18M3 12h18'; return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  var FIRMS0 = [
    { id: 1818, name: 'AMIC', full: 'AMIC POLSKA Sp. z o.o.', nip: '5271711106', regon: '', addr: 'ul. Ogrodowa 58', zip: '00-876', city: 'Warszawa', woj: 'mazowieckie', branza: 'Paliwowa', owner: 'Agnieszka W.', source: 'Wizyta handlowca (Tourplan)', added: '23.10.2018', www: 'amicenergy.pl', contacts: [{ name: 'Krzysztof S.', role: 'Prezes Zarządu', phone: '', email: '' }] },
    { id: 2101, name: 'Centrum Medyczne SALUS', full: 'Centrum Medyczne SALUS sp. z o.o.', nip: '', regon: '', addr: 'ul. Szosa Chełmińska 120', zip: '87-100', city: 'Toruń', woj: 'kujawsko-pomorskie', branza: 'Medyczna', owner: 'Agnieszka W.', source: 'Formularz www', added: '12.10.2026', www: '', contacts: [{ name: 'Ewa N.', role: 'Kierownik administracji', phone: '', email: '' }] },
    { id: 1902, name: 'Trefl', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Gdynia', woj: 'pomorskie', branza: 'Produkcyjna', owner: 'Robert Ś.', source: 'Polecenie', added: '04.02.2020', www: '', contacts: [] },
    { id: 2044, name: 'Port Kopytkowo', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Kopytkowo', woj: 'pomorskie', branza: 'Usługi', owner: 'Robert Ś.', source: 'LinkedIn', added: '17.06.2020', www: '', contacts: [] },
    { id: 2077, name: 'Park Handlowy Parczew', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Parczew', woj: 'lubelskie', branza: 'Nieruchomości', owner: 'Agnieszka W.', source: 'Targi', added: '15.06.2020', www: '', contacts: [{ name: 'Zarządca obiektu', role: 'Property manager', phone: '', email: '' }] },
    { id: 2110, name: 'Fabryka Ostrów', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Ostrów Wlkp.', woj: 'wielkopolskie', branza: 'Produkcyjna', owner: 'Michał W.', source: 'Klient stały', added: '08.06.2020', www: '', contacts: [] },
    { id: 1550, name: 'Urząd Miasta Toruń', full: '', nip: '', regon: '', addr: '', zip: '87-100', city: 'Toruń', woj: 'kujawsko-pomorskie', branza: 'Miasta, gminy', owner: 'Michał W.', source: 'Przetarg', added: '02.06.2020', www: '', contacts: [{ name: 'Wydział Promocji', role: 'Zamawiający', phone: '', email: '' }] },
    { id: 2120, name: 'Stalprofil (myjnia Ostrów)', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Ostrów Wlkp.', woj: 'wielkopolskie', branza: 'Usługi', owner: 'Agnieszka W.', source: 'Telefon', added: '24.06.2020', www: '', contacts: [] },
    { id: 2121, name: 'Sela Logistics', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Stryków', woj: 'łódzkie', branza: 'Transportowa', owner: 'Robert Ś.', source: 'Agent AI (czat na stronie)', added: '17.06.2020', www: '', contacts: [] },
    { id: 1777, name: 'UM Słubice', full: '', nip: '', regon: '', addr: '', zip: '', city: 'Słubice', woj: 'lubuskie', branza: 'Miasta, gminy', owner: 'Michał W.', source: 'Przetarg', added: '23.06.2020', www: '', contacts: [] }
  ];
  var FIRMS = store.get('firms', null) || JSON.parse(JSON.stringify(FIRMS0));
  function saveFirms() { store.set('firms', FIRMS); }
  function firmById(id) { return FIRMS.filter(function (f) { return f.id === +id; })[0]; }
  function completeness(f) { var k = ['full', 'nip', 'regon', 'addr', 'zip', 'city', 'woj', 'branza', 'www', 'source']; var n = k.filter(function (x) { return f[x]; }).length + (f.contacts.length ? 2 : 0); return Math.round(n / 12 * 100); }
  function nipOk(n) { n = String(n || '').replace(/[^\d]/g, ''); if (n.length !== 10) return false; var w = [6, 5, 7, 2, 3, 4, 5, 6, 7], s = 0; for (var i = 0; i < 9; i++) s += w[i] * +n[i]; return s % 11 === +n[9]; }
  function nipFmt(n) { n = String(n || '').replace(/[^\d]/g, ''); return n.length === 10 ? n.slice(0, 3) + '-' + n.slice(3, 6) + '-' + n.slice(6, 8) + '-' + n.slice(8) : n; }
  var GUS_DEMO = { '5271711106': { name: 'AMIC', full: 'AMIC POLSKA Sp. z o.o.', regon: '[REGON z GUS]', addr: 'ul. Ogrodowa 58', zip: '00-876', city: 'Warszawa', woj: 'mazowieckie' }, '1234563218': { name: 'Stacja Paliw DEMO', full: 'PRZYKŁADOWA STACJA PALIW „DEMO” sp. z o.o. (dane fikcyjne)', regon: '000000000', addr: 'ul. Testowa 1', zip: '87-100', city: 'Toruń', woj: 'kujawsko-pomorskie', www: '' } };
  crm.tab = 'lejek'; crm.lf = null; crm.ff = null; crm.fq = '';

  function crmTabs() {
    return '<div class="seg" role="tablist" aria-label="CRM">' + [['lejek', 'Lejek sprzedaży'], ['firmy', 'Kontrahenci (' + FIRMS.length + ')'], ['zrodla', 'Źródła leadów']].map(function (t) { return '<button data-act="crmtab" data-t="' + t[0] + '" aria-pressed="' + (crm.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>';
  }

  /* --- katalog kontrahentów --- */
  function firmsHtml() {
    var q = crm.fq.toLowerCase();
    var list = FIRMS.filter(function (f) { return !q || (f.name + ' ' + f.full + ' ' + f.nip + ' ' + f.city + ' ' + f.branza).toLowerCase().indexOf(q) > -1; });
    var incomplete = FIRMS.filter(function (f) { return completeness(f) < 60; }).length;
    return '<div class="kpis"><div class="kpi"><small>Kontrahenci w systemie</small><b>1 785</b><em class="t-dim">w demo ' + FIRMS.length + '</em></div><div class="kpi"><small>Kontakty</small><b>1 805</b></div><div class="kpi" style="border-color:rgba(255,153,0,.4)"><small class="t-orange">Karty do uzupełnienia</small><b>' + incomplete + '</b><em class="t-dim">kompletność &lt; 60%</em></div><div class="kpi"><small>Bez aktualizacji &gt; rok</small><b>605</b></div></div>' +
      '<section class="card"><div class="h-row" style="flex-wrap:wrap"><h2>Kontrahenci</h2><div style="display:flex;gap:8px;flex-wrap:wrap"><label for="fq" style="position:absolute;left:-9999px">Szukaj kontrahenta</label><input id="fq" class="in" style="width:220px;padding:8px 12px" placeholder="Szukaj: nazwa, NIP, miasto" value="' + esc(crm.fq) + '"><button class="btn p" data-act="newfirm">+ Dodaj kontrahenta</button></div></div><div class="list" id="firmList">' + firmRows(list) + '</div></section>';
  }
  function firmRows(list) {
    if (!list.length) return '<p class="t-dim" style="margin:8px 0">Brak wyników. Dodaj kontrahenta ręcznie albo pobierz dane z GUS po numerze NIP.</p>';
    return list.map(function (f) {
      var c = completeness(f), deals = LEADS.filter(function (l) { return l.client.indexOf(f.name.split(' ')[0]) > -1 || f.name.indexOf(l.client.split(' ')[0]) > -1; }).length;
      return '<button class="order" data-act="firm" data-id="' + f.id + '" style="background:none;border:0;border-bottom:1px solid var(--line);width:100%;text-align:left;font:inherit"><span style="width:44px;height:44px;border-radius:12px;background:var(--surface3);display:grid;place-items:center;font-weight:700;grid-row:span 2">' + esc(f.name.slice(0, 2).toUpperCase()) + '</span><span style="min-width:0"><b style="font-weight:600">' + esc(f.name) + '</b><br><small class="t-muted">' + esc(f.branza) + ' · ' + esc(f.city) + ' · opiekun: ' + esc(f.owner) + '</small></span><span style="text-align:right;font-size:12px" class="tab">' + (f.nip ? 'NIP ' + nipFmt(f.nip) : '<span class="t-orange">brak NIP</span>') + '</span>' +
        '<span style="grid-column:2/4;display:flex;gap:8px;align-items:center"><span class="bar" style="flex:1;max-width:160px"><i style="width:' + c + '%;' + (c < 60 ? 'background:var(--orange)' : '') + '"></i></span><small class="t-dim">karta ' + c + '%</small>' + (deals ? '<span class="chip c-pink">' + deals + ' szans' + (deals === 1 ? 'a' : 'e') + '</span>' : '') + '</span></button>';
    }).join('');
  }
  function firmCard(f) {
    var c = completeness(f);
    var leads = LEADS.filter(function (l) { return l.client.indexOf(f.name.split(' ')[0]) > -1 || f.name.indexOf(l.client.split(' ')[0]) > -1; });
    var orders = ORDERS.filter(function (o) { return o.client.indexOf(f.name.split(' ')[0]) > -1 || f.name.indexOf(o.client.split(' ')[0]) > -1; });
    var row = function (k, v) { return '<div><small class="t-dim">' + k + '</small><div>' + (v ? esc(v) : '<span class="t-orange">uzupełnij</span>') + '</div></div>'; };
    return '<div class="grab"></div><div style="display:flex;gap:12px;align-items:center"><span style="width:52px;height:52px;border-radius:14px;background:var(--grad);display:grid;place-items:center;font-weight:700;flex:none">' + esc(f.name.slice(0, 2).toUpperCase()) + '</span><div style="flex:1;min-width:0"><h2 style="font-size:20px">' + esc(f.name) + '</h2><small class="t-muted">ID ' + f.id + ' · dodano ' + esc(f.added) + ' · karta uzupełniona w ' + c + '%</small></div></div>' +
      (c < 60 ? '<div class="alert a-orange" style="align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:180px">Karta niekompletna. Uzupełnij dane jednym kliknięciem z rejestru GUS (wymaga NIP).</span><button class="btn" data-act="editfirm" data-id="' + f.id + '">Uzupełnij</button></div>' : '') +
      '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));font-size:14px">' + row('Pełna nazwa', f.full) + row('NIP', f.nip ? nipFmt(f.nip) : '') + row('REGON', f.regon) + row('Adres', [f.addr, [f.zip, f.city].join(' ')].filter(function (x) { return x.trim(); }).join(', ')) + row('Województwo', f.woj) + row('Branża', f.branza) + row('Opiekun', f.owner) + row('Źródło pozyskania', f.source) + row('Strona www', f.www) + '</div>' +
      '<div><div class="eyebrow" style="margin:6px 0">Osoby kontaktowe · ' + f.contacts.length + '</div><div class="list">' + (f.contacts.length ? f.contacts.map(function (p) { return '<div class="row"><span>' + esc(p.name) + '<br><small class="t-dim">' + esc(p.role) + '</small></span><small class="t-dim" style="align-self:center">' + esc([p.phone, p.email].filter(Boolean).join(' · ') || '[telefon, e-mail]') + '</small></div>'; }).join('') : '<p class="t-dim" style="margin:6px 0">Brak kontaktów.</p>') + '</div>' +
      '<form data-form="addcontact" data-id="' + f.id + '" class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:8px"><label style="position:absolute;left:-9999px" for="ctN">Imię i nazwisko</label><input id="ctN" class="in" placeholder="Imię i nazwisko" required><label style="position:absolute;left:-9999px" for="ctR">Stanowisko</label><input id="ctR" class="in" placeholder="Stanowisko"><label style="position:absolute;left:-9999px" for="ctP">Telefon lub e-mail</label><input id="ctP" class="in" placeholder="Telefon lub e-mail"><button class="btn">+ Dodaj osobę</button></form></div>' +
      '<div><div class="eyebrow" style="margin:6px 0">Szanse sprzedaży · ' + leads.length + '</div><div class="list">' + (leads.length ? leads.map(function (l) { return '<div class="row"><span>' + esc(l.title) + '<br><small class="t-dim">' + STAGES[l.stage][0] + ' · ' + STAGES[l.stage][1] + '%</small></span><b class="tab" style="align-self:center">' + esc(l.value) + '</b></div>'; }).join('') : '<p class="t-dim" style="margin:6px 0">Brak szans.</p>') + '</div></div>' +
      '<div><div class="eyebrow" style="margin:6px 0">Zlecenia · ' + orders.length + '</div><div class="list">' + (orders.length ? orders.map(function (o) { return '<div class="row"><span><b class="num">' + o.nr + '</b> ' + esc(o.product) + '</span><span class="chip" style="align-self:center">' + esc(o.stage) + '</span></div>'; }).join('') : '<p class="t-dim" style="margin:6px 0">Brak zleceń.</p>') + '</div></div>' +
      '<button class="btn p full" data-act="addlead" data-firm="' + f.id + '">+ Dodaj lead dla tego kontrahenta</button><button class="btn full" data-act="editfirm" data-id="' + f.id + '">Edytuj dane</button><button class="btn full" data-act="close">Zamknij</button>';
  }

  /* --- formularz kontrahenta (ręcznie lub z GUS) --- */
  function firmForm() {
    var f = crm.ff, back = f._back === 'lead';
    var inp = function (k, label, ph, extra) { return '<label class="t-muted" style="font-size:13px">' + label + '<input class="in" style="margin-top:4px" data-ff="' + k + '" value="' + esc(f[k] || '') + '" placeholder="' + (ph || '') + '"' + (extra || '') + '></label>'; };
    var nipState = f.nip ? (nipOk(f.nip) ? '<small class="t-green">NIP poprawny</small>' : '<small class="t-red">Nieprawidłowy NIP – sprawdź cyfry</small>') : '';
    var dup = f.nip && nipOk(f.nip) ? FIRMS.filter(function (x) { return x.nip === String(f.nip).replace(/[^\d]/g, '') && x.id !== f.id; })[0] : null;
    return '<div class="grab"></div><h2>' + (f.id ? 'Edycja kontrahenta' : 'Nowy kontrahent') + '</h2>' +
      '<section class="card" style="background:var(--surface2);display:grid;gap:8px"><b>Pobierz dane z rejestru GUS</b><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start"><label style="flex:1;min-width:180px;font-size:13px" class="t-muted">NIP<input class="in" style="margin-top:4px" data-ff="nip" inputmode="numeric" value="' + esc(f.nip || '') + '" placeholder="np. 527-171-11-06"></label><button type="button" class="btn g" style="margin-top:22px" data-act="gus">Pobierz z GUS</button></div><div id="nipState">' + nipState + '</div>' +
      (dup ? '<div class="alert a-red" style="align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:180px">Kontrahent z tym NIP już istnieje: <b>' + esc(dup.name) + '</b>. System blokuje duplikat.</span><button type="button" class="btn" data-act="usefirm" data-id="' + dup.id + '">' + (back ? 'Wybierz go do leada' : 'Otwórz kartę') + '</button></div>' : '') +
      (f._gus ? '<div class="alert a-green"><span class="chip c-green">GUS</span><span>' + f._gus + '</span></div>' : '') +
      '<small class="t-dim">W docelowym systemie przez usługę GUS BIR (REGON). W demo symulacja – wpisz 123-456-32-18 (fikcyjna firma) albo 527-171-11-06 (AMIC, już w bazie).</small></section>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:10px">' + inp('name', 'Nazwa skrócona *', 'np. SALUS Toruń', ' required') + inp('full', 'Pełna nazwa', 'np. Centrum Medyczne SALUS sp. z o.o.') + inp('regon', 'REGON') + inp('www', 'Strona www') + inp('addr', 'Ulica i numer') + inp('zip', 'Kod pocztowy', '00-000') + inp('city', 'Miejscowość') + inp('woj', 'Województwo') + '</div>' +
      '<div><small class="t-muted">Branża</small><div class="seg" style="margin-top:4px">' + BRANZE.map(function (b) { return '<button type="button" data-act="ffset" data-k="branza" data-v="' + esc(b) + '" aria-pressed="' + (f.branza === b) + '">' + b + '</button>'; }).join('') + '</div></div>' +
      '<div><small class="t-muted">Opiekun</small><div class="seg" style="margin-top:4px">' + OWNERS.map(function (o) { return '<button type="button" data-act="ffset" data-k="owner" data-v="' + o + '" aria-pressed="' + (f.owner === o) + '">' + o + '</button>'; }).join('') + '</div></div>' +
      '<button class="btn p full" data-act="savefirm">' + (back ? 'Zapisz i wybierz do leada' : 'Zapisz kontrahenta') + '</button><button class="btn full" data-act="' + (back ? 'leadback' : 'close') + '">' + (back ? '← Wróć do leada' : 'Anuluj') + '</button>';
  }

  /* --- Dodaj lead --- */
  /* --- podpowiedzi AI w leadzie: typowe zamówienia branży, wycena AI Gate, kontakt --- */
  var TYPICAL = {
    'Paliwowa': [['Pylon cenowy', 92], ['Stacja paliw', 64], ['Kaseton', 41]], 'Medyczna': [['Pylon', 71], ['Litery 3D', 58], ['Kaseton', 44]],
    'Handlowa': [['Pylon', 68], ['Kaseton', 62], ['Litery 3D', 47]], 'Miasta, gminy': [['Witacz', 83], ['Pylon', 39], ['Litery 3D', 31]],
    'Nieruchomości': [['Pylon', 77], ['Kaseton', 69], ['Litery 3D', 38]], 'Produkcyjna': [['Litery 3D', 74], ['Pylon', 45], ['Konstrukcja stalowa', 22]],
    'Hotelarstwo': [['Pylon', 66], ['Witacz', 48], ['Litery 3D', 81]], 'Apteczna': [['Kaseton', 88], ['Otok', 42], ['Pylon', 27]],
    'Usługi': [['Kaseton', 55], ['Litery 3D', 49], ['Pylon', 33]], 'Transportowa': [['Litery 3D', 52], ['Pylon', 47], ['Konstrukcja stalowa', 30]]
  };
  var PRICE = { 'Pylon': [35, 90], 'Pylon cenowy': [60, 140], 'Witacz': [36, 75], 'Otok': [20, 60], 'Billboard': [15, 40], 'Stacja paliw': [150, 400], 'Stojak': [3, 8], 'Kaseton': [8, 30], 'Litery 3D': [15, 60], 'Rura reklamowa': [5, 15], 'Konstrukcja stalowa': [30, 120], 'Inny': [10, 40] };
  var CONTACT_PROMPT = 'Jesteś agentem weryfikacji danych kontaktowych firm dla działu sprzedaży Graffico.\n\nZadanie: znajdź OGÓLNY telefon i e-mail firmy lub instytucji podanej w zapytaniu.\n\nZasady bezwzględne:\n- korzystaj wyłącznie z wyników wyszukiwania; nie wymyślaj, nie zgaduj i nie składaj numerów ani adresów z fragmentów;\n- akceptuj tylko dane opublikowane przez samą firmę lub w rejestrach (strona www firmy, BIP, KRS/CEIDG, oficjalna wizytówka);\n- tylko kontakty firmowe (centrala, biuro, sekretariat) – nigdy prywatne numery i adresy osób fizycznych;\n- każda podana wartość musi mieć URL strony, na której dosłownie występuje;\n- jeśli nie znalazłeś pewnej informacji, wpisz null – brak danych jest poprawną odpowiedzią.\n\nFormat: wyłącznie JSON w bloku ```json: {"telefon": string|null, "email": string|null, "zrodlo_url": string|null, "uwagi": string}.';
  function lfProds(d) { if (!d.prods) d.prods = d.prod ? [d.prod] : []; return d.prods; }
  function aiGate(d, f) {
    var ps = lfProds(d); if (!ps.length) return null;
    var lo = 0, hi = 0; ps.forEach(function (p) { var r = PRICE[p] || [10, 40]; lo += r[0]; hi += r[1]; });
    var km = (f && /Toruń|Bydgoszcz|Lubicz|Chełmża|Włocławek|Inowrocław|Grudziądz|Brodnica/.test(f.city || '')) ? 0 : 1;
    if (km) { lo += 3; hi += 6; }
    var mid = Math.round((lo + hi) / 2) * 1000, pot = mid >= 100000 ? 'wysoki' : mid >= 40000 ? 'średni' : 'niski';
    return { lo: lo * 1000, hi: hi * 1000, mid: mid, pot: pot, km: km, txt: 'Szacunek z receptur produktów i podobnych zleceń: ' + zl(lo * 1000) + ' – ' + zl(hi * 1000) + ' netto. ' + (km ? 'Doliczono transport i montaż poza regionem. ' : '') + 'Wpisano wartość środkową.', risks: (f && f.branza === 'Miasta, gminy' ? 'Zamówienie publiczne – sprawdź tryb i termin przetargu. ' : '') + (ps.indexOf('Stacja paliw') > -1 ? 'Rebranding stacji – zwykle wymaga zgody operatora sieci. ' : '') + 'Brak potwierdzonego budżetu klienta.' };
  }
  function contactBox(d) {
    var c = d.contact;
    if (d.cbusy) return '<div class="card" style="background:var(--surface2);display:flex;gap:12px;align-items:center"><span class="spin" aria-hidden="true"></span><span>Agent szuka telefonu i e-maila w opublikowanych źródłach…</span></div>';
    if (!c) return '<button type="button" class="btn g full" data-act="findcontact">' + I.spark + 'Znajdź kontakt do firmy (AI)</button>';
    if (!c.telefon && !c.email) return '<div class="alert a-orange" style="flex-direction:column;gap:4px"><b>Kontakt nie ustalony na podstawie dostępnych danych</b><span style="font-size:13px">Agent nie znalazł telefonu ani e-maila opublikowanego przez tę firmę' + (c.demo ? ' (tryb demo – firma przykładowa)' : '') + '. Nic nie zostało wpisane na zgadywanie. Ustal kontakt ręcznie, np. przez stronę inwestycji lub BIP.</span><button type="button" class="btn" style="align-self:flex-start;min-height:36px;font-size:13px" data-act="findcontact">Szukaj ponownie</button></div>';
    return '<div class="alert a-green" style="flex-direction:column;gap:4px"><b>Kontakt znaleziony w źródłach</b>' + (c.telefon ? '<span>Telefon: <b class="tab">' + esc(c.telefon) + '</b></span>' : '<span class="t-muted">Telefon: nie ustalono</span>') + (c.email ? '<span>E-mail: <b>' + esc(c.email) + '</b></span>' : '<span class="t-muted">E-mail: nie ustalono</span>') + (c.zrodlo_url ? '<a href="' + esc(c.zrodlo_url) + '" target="_blank" rel="noopener" style="font-size:12px;word-break:break-all">Źródło: ' + esc(c.zrodlo_url) + '</a>' : '') + '</div>';
  }
  function findContact() {
    var d = crm.lf, f = firmById(d.firm), ag = agentById('kontakt') || agentById('leady'), m = modelById(ag.model);
    d.cbusy = true; reSheet(leadForm());
    var finish = function (c) { d.cbusy = false; d.contact = c; if (c && (c.telefon || c.email)) d.next = 'Zadzwonić z pytaniem o planowane oznakowanie' + (c.telefon ? ' – tel. ' + c.telefon : '') + (c.email ? ' / ' + c.email : ''); reSheet(leadForm()); };
    if (!m.key) { setTimeout(function () { finish({ telefon: null, email: null, zrodlo_url: null, demo: true }); }, 1300); return; }
    callModel(m, ag.prompt, 'Firma: ' + f.name + (f.full ? ' (' + f.full + ')' : '') + '\nMiejscowość: ' + (f.city || 'nieznana') + (f.nip ? '\nNIP: ' + f.nip : '') + (d.srcUrl ? '\nŹródło leada: ' + d.srcUrl : ''), true, 1500).then(function (j) {
      var text = (j.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join('\n');
      var mt = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/), o = {};
      try { o = JSON.parse(mt ? mt[1] : text); } catch (e) { o = {}; }
      var tel = o.telefon && /^[+\d][\d\s\-()]{6,}$/.test(String(o.telefon).trim()) ? String(o.telefon).trim() : null;
      var em = o.email && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(o.email).trim()) ? String(o.email).trim() : null;
      finish({ telefon: tel, email: em, zrodlo_url: (tel || em) && o.zrodlo_url ? o.zrodlo_url : null });
    }).catch(function () { finish({ telefon: null, email: null, zrodlo_url: null }); });
  }
  function leadForm() {
    var d = crm.lf, f = d.firm ? firmById(d.firm) : null, ps = lfProds(d);
    var firmPart = f
      ? '<div class="card" style="background:var(--surface2);display:flex;gap:12px;align-items:center"><span style="width:42px;height:42px;border-radius:12px;background:var(--grad);display:grid;place-items:center;font-weight:700;flex:none">' + esc(f.name.slice(0, 2).toUpperCase()) + '</span><span style="flex:1;min-width:0"><b>' + esc(f.name) + '</b><br><small class="t-muted">' + esc(f.branza) + ' · ' + esc(f.city) + (f.nip ? ' · NIP ' + nipFmt(f.nip) : '') + '</small></span><button type="button" class="btn" data-act="lfclear" style="min-height:40px">Zmień</button></div>'
      : '<label class="t-muted" style="font-size:13px">Wyszukaj w katalogu kontrahentów<input id="lfQ" class="in" style="margin-top:4px" placeholder="Nazwa, NIP lub miasto" value="' + esc(d.q || '') + '" autocomplete="off"></label><div id="lfRes" class="list">' + lfResults(d.q || '') + '</div>';
    var people = f ? f.contacts : [];
    var typ = f ? (TYPICAL[f.branza] || []) : [], typNames = typ.map(function (t) { return t[0]; });
    var g = d.gate;
    return '<div class="grab"></div><h2>Dodaj lead</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"><button type="button" class="btn g" data-act="leadgen">' + I.spark + 'Generator leadów (AI)</button><button type="button" class="btn" data-act="newfirm" data-back="lead">+ Dodaj kontrahenta</button></div>' +
      (d.signal ? '<div class="alert a-green" style="flex-direction:column;gap:4px"><b class="t-green">Lead od Agenta AI</b><span style="font-size:14px">' + esc(d.signal) + '</span>' + (d.srcUrl ? '<a href="' + esc(d.srcUrl) + '" target="_blank" rel="noopener" style="font-size:12px;word-break:break-all">' + esc(d.srcUrl) + '</a>' : '<small class="t-dim">Tryb demo – sygnał przykładowy, bez linku do źródła.</small>') + '</div>' : '') +
      '<div><div class="eyebrow" style="margin-bottom:6px">1. Kontrahent</div>' + firmPart + '</div>' +
      (f ? '<div><div class="eyebrow" style="margin-bottom:6px">2. Osoba kontaktowa</div><div class="seg">' + people.map(function (p, i) { return '<button type="button" data-act="lfset" data-k="person" data-v="' + i + '" aria-pressed="' + (String(d.person) === String(i)) + '">' + esc(p.name) + ' · ' + esc(p.role) + '</button>'; }).join('') + '<button type="button" data-act="lfset" data-k="person" data-v="new" aria-pressed="' + (d.person === 'new') + '">+ Nowa osoba</button></div>' + (d.person === 'new' ? '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px"><input class="in" data-lf="pname" value="' + esc(d.pname || '') + '" placeholder="Imię i nazwisko" aria-label="Imię i nazwisko"><input class="in" data-lf="prole" value="' + esc(d.prole || '') + '" placeholder="Stanowisko" aria-label="Stanowisko"></div>' : '') + '</div>' +
        '<div><div class="eyebrow" style="margin-bottom:6px">3. Czego dotyczy</div><label class="t-muted" style="font-size:13px">Temat zapytania *<input class="in" style="margin-top:4px" data-lf="title" value="' + esc(d.title || '') + '" placeholder="np. Pylon przy wejściu do przychodni"></label>' +
        (typ.length ? '<div class="alert a-green" style="margin-top:8px;align-items:center;flex-wrap:wrap"><span class="chip c-green">AI</span><span style="flex:1;min-width:180px;font-size:13px">Branża <b>' + esc(f.branza) + '</b> zwykle zamawia: ' + typ.map(function (t) { return '<b>' + t[0] + '</b> (' + t[1] + '% zleceń)'; }).join(', ') + '.</span><button type="button" class="btn" style="min-height:36px;font-size:12px" data-act="lfrecom">Zaznacz polecane</button></div>' : '') +
        '<div class="seg" style="margin-top:8px">' + PRODUCTS.map(function (p) { var on = ps.indexOf(p) > -1, rec = typNames.indexOf(p) > -1; return '<button type="button" data-act="lfprod" data-v="' + p + '" aria-pressed="' + on + '"' + (rec && !on ? ' style="border-color:rgba(136,255,88,.7);box-shadow:0 0 0 1px rgba(136,255,88,.35) inset"' : '') + '>' + (rec ? '<span class="t-green" aria-label="polecane przez AI">★ </span>' : '') + p + '</button>'; }).join('') + '</div><small class="t-dim">★ polecane przez AI dla tej branży · można zaznaczyć kilka</small></div>' +
        '<div><div class="eyebrow" style="margin-bottom:6px">4. Źródło pozyskania</div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">' + SOURCES.map(function (s) { var on = d.src === s; return '<button type="button" data-act="lfset" data-k="src" data-v="' + esc(s) + '" aria-pressed="' + on + '" style="display:flex;gap:10px;align-items:center;text-align:left;padding:10px;border-radius:12px;min-height:52px;border:1px solid ' + (on ? 'var(--magenta)' : 'var(--line2)') + ';background:' + (on ? 'rgba(227,0,111,.16)' : 'var(--surface2)') + ';color:var(--fg);font-size:13px"><span style="color:' + (on ? 'var(--pink)' : 'var(--muted)') + ';flex:none">' + srcIcon(s) + '</span>' + esc(s) + '</button>'; }).join('') + '</div></div>' +
        '<div><div class="eyebrow" style="margin-bottom:6px">5. Wartość i termin</div>' +
        '<button type="button" class="btn g full" data-act="lfgate" style="margin-bottom:8px">' + I.spark + 'AI Gate: kwalifikuj i wyceń</button>' +
        (g ? '<div class="alert a-green" style="flex-direction:column;gap:4px;margin-bottom:8px"><span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b class="t-green">AI Gate</b><span class="chip ' + (g.pot === 'wysoki' ? 'c-green' : g.pot === 'średni' ? '' : 'c-orange') + '">potencjał: ' + g.pot + '</span></span><span style="font-size:13px">' + esc(g.txt) + '</span><small class="t-dim">Ryzyka: ' + esc(g.risks) + '</small></div>' : '') +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px"><label class="t-muted" style="font-size:13px">Szacowana wartość (zł netto)<input class="in" style="margin-top:4px" inputmode="numeric" data-lf="value" value="' + esc(d.value || '') + '" placeholder="np. 45000"></label><label class="t-muted" style="font-size:13px">Planowane zamknięcie' + dateField('data-lf="close"', d.close || '2026-11-30', 'Planowane zamknięcie') + '</label></div><div style="margin-top:8px"><small class="t-muted">Opiekun</small><div class="seg" style="margin-top:4px">' + OWNERS.map(function (o) { return '<button type="button" data-act="lfset" data-k="owner" data-v="' + o + '" aria-pressed="' + (d.owner === o) + '">' + o + '</button>'; }).join('') + '</div></div></div>' +
        '<div><div class="eyebrow" style="margin-bottom:6px">6. Następny krok</div>' + contactBox(d) + '<label class="t-muted" style="font-size:13px;display:block;margin-top:8px">Przypomnienie<input class="in" style="margin-top:4px" data-lf="next" value="' + esc(d.next || '') + '" placeholder="np. Zadzwonić z pytaniem o budżet – pon. 10:00"></label></div>' +
        '<button class="btn p full" data-act="savelead">Dodaj lead do lejka (Nowe zapytanie · 10%)</button>' : '') +
      '<button class="btn full" data-act="close">Anuluj</button>';
  }
  function lfResults(q) {
    q = (q || '').toLowerCase();
    var r = FIRMS.filter(function (f) { return !q || (f.name + ' ' + f.full + ' ' + f.nip + ' ' + f.city).toLowerCase().indexOf(q) > -1; }).slice(0, 6);
    if (!r.length) return '<p class="t-dim" style="margin:6px 0">Nie ma takiego kontrahenta. Dodaj nowego poniżej.</p>';
    return r.map(function (f) { return '<button type="button" class="row" data-act="pickfirm" data-id="' + f.id + '" style="background:none;border:0;border-bottom:1px solid var(--line);width:100%;text-align:left;color:var(--fg)"><span><b style="font-weight:500">' + esc(f.name) + '</b><br><small class="t-dim">' + esc(f.branza) + ' · ' + esc(f.city) + '</small></span><small class="t-dim tab" style="align-self:center">' + (f.nip ? nipFmt(f.nip) : 'brak NIP') + '</small></button>'; }).join('');
  }

  /* --- źródła leadów --- */
  function sourcesHtml() {
    var rows = SOURCES.map(function (s) { var h = SRC_HIST[s] || [0, 0, 0]; var cur = LEADS.filter(function (l) { return l.source === s && l.stage < 6; }).length; return [s, h[0], h[1], h[2], cur]; }).sort(function (a, b) { return b[3] - a[3]; });
    var maxN = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    var best = rows.slice().sort(function (a, b) { return b[2] - a[2]; })[0];
    return '<div class="kpis"><div class="kpi"><small>Leady (12 mies.)</small><b>' + rows.reduce(function (a, r) { return a + r[1]; }, 0) + '</b></div><div class="kpi"><small>Najwyższa skuteczność</small><b style="font-size:18px">' + esc(best[0]) + '</b><em class="t-green">' + best[2] + '% wygranych</em></div><div class="kpi"><small>Najwięcej sprzedaży</small><b style="font-size:18px">' + esc(rows[0][0]) + '</b><em class="t-dim">' + rows[0][3] + ' tys. zł</em></div><div class="kpi"><small>Aktywne źródła</small><b>' + SOURCES.length + '</b></div></div>' +
      '<section class="card"><div class="h-row" style="flex-wrap:wrap"><h2>Skuteczność źródeł</h2><small class="t-dim">ostatnie 12 miesięcy · sortowanie: wartość wygranych</small></div><div class="scroll-x"><table style="width:100%;min-width:340px;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--dim);text-align:left"><th style="padding:8px 6px;font-weight:500">Źródło · liczba leadów</th><th style="padding:8px 6px;font-weight:500;text-align:right">Wygrane</th><th style="padding:8px 6px;font-weight:500;text-align:right">Sprzedaż</th><th style="padding:8px 6px;font-weight:500;text-align:right">W lejku</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr style="border-top:1px solid var(--line)"><td style="padding:10px 6px;width:55%"><span style="display:flex;gap:10px;align-items:center"><span style="width:34px;height:34px;border-radius:10px;background:rgba(227,0,111,.12);color:var(--pink);display:grid;place-items:center;flex:none">' + srcIcon(r[0]) + '</span><span style="flex:1;min-width:0">' + esc(r[0]) + '<span style="display:flex;gap:8px;align-items:center;margin-top:5px"><span class="bar" style="flex:1;height:6px"><i style="width:' + (r[1] / maxN * 100) + '%;background:var(--pink)"></i></span><small class="tab t-muted">' + r[1] + '</small></span></span></span></td><td style="padding:10px 6px;text-align:right"><span class="chip tab ' + (r[2] >= 30 ? 'c-green' : r[2] >= 18 ? '' : 'c-orange') + '">' + r[2] + '%</span></td><td class="tab" style="padding:10px 6px;text-align:right;white-space:nowrap">' + (r[3] ? r[3] + ' tys.' : '—') + '</td><td class="tab" style="padding:10px 6px;text-align:right">' + r[4] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="t-dim" style="font-size:13px;margin:10px 0 0">Wnioski AI: polecenia i klienci stali dają 3× wyższą skuteczność niż formularz www. Leady z Google Ads warto kwalifikować przez AI Gate przed kalkulacją.</p></section>' +
      '<section class="card"><div class="h-row"><h2>Dodaj źródło</h2></div><form data-form="addsrc" style="display:flex;gap:8px;flex-wrap:wrap"><label for="srcIn" style="position:absolute;left:-9999px">Nazwa źródła</label><input id="srcIn" class="in" style="flex:1;min-width:200px" placeholder="np. Facebook, Oferteo, Kampania mailowa"><button class="btn p">Dodaj źródło</button></form></section>';
  }

  /* ================= USTAWIENIA: agenci AI i modele LLM + GENERATOR LEADÓW ================= */
  var MODELS0 = [
    { id: 'm1', name: 'Claude Opus 5.5', provider: 'Anthropic', model: 'claude-opus-5-5', endpoint: 'https://api.anthropic.com/v1/messages', key: '', note: 'najdokładniejszy – analizy, kalkulacje' },
    { id: 'm2', name: 'Claude Sonnet 5.5', provider: 'Anthropic', model: 'claude-sonnet-5-5', endpoint: 'https://api.anthropic.com/v1/messages', key: '', note: 'domyślny – wyszukiwanie leadów' },
    { id: 'm3', name: 'Claude Haiku 5.5', provider: 'Anthropic', model: 'claude-haiku-5-5', endpoint: 'https://api.anthropic.com/v1/messages', key: '', note: 'szybki – czat na hali, klasyfikacja' }
  ];
  var LEAD_PROMPT = 'Jesteś agentem wyszukiwania leadów sprzedażowych dla firmy Graffico – producenta reklamy zewnętrznej i oznakowania: pylony reklamowe i cenowe (stacje paliw), kasetony LED, litery 3D, witacze, oznakowanie centrów handlowych, sieci retail i obiektów publicznych, z własną produkcją i montażem w całej Polsce.\n\nZadanie: przeszukaj publiczne źródła w internecie (BIP i przetargi, informacje o nowych inwestycjach i pozwoleniach na budowę, otwarciach stacji paliw, sklepów, przychodni, hoteli, centrów handlowych, rebrandingach sieci, przeprowadzkach firm) i znajdź firmy lub instytucje, które w najbliższych 3–12 miesiącach mogą potrzebować oznakowania.\n\nZasady:\n- podawaj wyłącznie publicznie dostępne dane firm i instytucji, bez danych prywatnych osób;\n- każdy lead musi mieć źródło (adres URL), z którego wynika sygnał zakupowy;\n- pomijaj firmy, które już są w bazie Graffico (lista w zapytaniu);\n- nie zgaduj – jeśli brak pewności, oznacz potencjał jako niski.\n\nZakaz zmyślania (najważniejsze):\n- każda firma, sygnał i liczba musi wynikać z konkretnej strony znalezionej w wyszukiwaniu – podaj jej URL; bez źródła nie zwracaj leada;\n- nie wymyślaj nazw firm, inwestycji, dat ani wartości; jeśli źródło nie uzasadnia szacunku wartości – wpisz null;\n- kontakt: wyłącznie ogólny telefon i e-mail firmy opublikowane przez nią samą (strona www, BIP, KRS/CEIDG); nigdy prywatne dane osób; jeśli nie znalazłeś – null;\n- lepiej zwrócić mniej leadów niż jeden niepewny.\n\nFormat odpowiedzi: wyłącznie JSON w bloku ```json – tablica obiektów z polami: firma, miasto, wojewodztwo, branza, sygnal (1–2 zdania), produkt (z oferty Graffico), potencjal (wysoki | średni | niski), wartosc_szac (zł netto lub null), zrodlo_url, kontakt_telefon (lub null), kontakt_email (lub null), kontakt_zrodlo_url (lub null).';
  var AGENTS0 = [
    { id: 'leady', name: 'Agent leadów', desc: 'Przeszukuje internet i proponuje nowe szanse sprzedaży z uzasadnieniem i źródłem.', model: 'm2', temp: 0.3, max: 8, web: true, prompt: LEAD_PROMPT },
    { id: 'kontakt', name: 'Agent kontaktów (weryfikacja)', desc: 'Szuka ogólnego telefonu i e-maila firmy w opublikowanych źródłach. Gdy nie znajdzie – zwraca brak, nie zgaduje.', model: 'm2', temp: 0, max: 1, web: true, prompt: CONTACT_PROMPT },
    { id: 'kwal', name: 'AI Gate – kwalifikacja leadów', desc: 'Ocenia potencjał zapytania, porównuje z podobnymi realizacjami, sugeruje wycenę.', model: 'm2', temp: 0.2, max: 1, web: false, prompt: 'Oceniasz zapytania ofertowe dla Graffico. Na podstawie opisu zapytania, zaznaczonych produktów, receptur i historii podobnych zleceń oceń potencjał (wysoki/średni/niski), wskaż ryzyka, brakujące informacje i widełki ceny netto. Nie wymyślaj faktów o kliencie – jeśli czegoś nie wiesz, napisz, że brak danych. Odpowiadaj zwięźle po polsku.' },
    { id: 'kalk', name: 'Asystent kalkulacji ofert', desc: 'Podpowiada normy czasu i marżę na podstawie zleceń historycznych.', model: 'm1', temp: 0.1, max: 1, web: false, prompt: 'Jesteś asystentem kalkulacji ofert Graffico. Na podstawie receptury produktu i danych z podobnych zleceń (czas, materiał, przekroczenia) zaproponuj normy roboczogodzin, rezerwy i minimalną marżę. Podawaj liczby i uzasadnienie.' },
    { id: 'instr', name: 'Instrukcje stanowiskowe (czat hali)', desc: 'Odpowiada pracownikom na tabletach na pytania o technologię i BHP.', model: 'm3', temp: 0.2, max: 1, web: false, prompt: 'Odpowiadasz pracownikom produkcji Graffico na tabletach. Korzystaj wyłącznie z technologii zlecenia, instrukcji stanowiskowych i zasad BHP. Odpowiadaj krótko, konkretnie, po polsku. Gdy nie masz pewności – każ zapytać technologa.' }
  ];
  var MODELS = store.get('models', null) || JSON.parse(JSON.stringify(MODELS0));
  var AGENTS = store.get('agents', null) || JSON.parse(JSON.stringify(AGENTS0));
  AGENTS0.forEach(function (d0) { var cur0 = AGENTS.filter(function (x) { return x.id === d0.id; })[0]; if (!cur0) AGENTS.push(JSON.parse(JSON.stringify(d0))); else if ((d0.id === 'leady' || d0.id === 'kwal') && cur0.prompt.indexOf('wymyśl') < 0) cur0.prompt = d0.prompt; });
  function saveAI() { store.set('models', MODELS); store.set('agents', AGENTS); }
  function modelById(id) { return MODELS.filter(function (m) { return m.id === id; })[0] || MODELS[0]; }
  function agentById(id) { return AGENTS.filter(function (a) { return a.id === id; })[0]; }
  var st = { tab: 'agenci', agent: 'leady', model: null, newModel: false };

  VIEWS.ustawienia = {
    title: 'Ustawienia', sub: 'ADMINISTRATOR · SYSTEM',
    html: function () {
      var tabs = '<div class="seg">' + [['agenci', 'Agenci AI (' + AGENTS.length + ')'], ['modele', 'Modele LLM (' + MODELS.length + ')'], ['integracje', 'Integracje']].map(function (t) { return '<button data-act="sttab" data-t="' + t[0] + '" aria-pressed="' + (st.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>';
      if (st.tab === 'modele') return tabs + modelsHtml();
      if (st.tab === 'integracje') return tabs + integrHtml();
      var a = agentById(st.agent) || AGENTS[0];
      return tabs + '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start"><section class="card" style="flex:1 1 260px;display:grid;gap:8px"><b>Agenci</b>' + AGENTS.map(function (x) { var on = x.id === a.id; return '<button data-act="stagent" data-id="' + x.id + '" style="text-align:left;padding:12px;border-radius:12px;border:1px solid ' + (on ? 'var(--magenta)' : 'var(--line)') + ';background:' + (on ? 'rgba(227,0,111,.12)' : 'var(--surface2)') + ';color:var(--fg)"><b style="display:block">' + esc(x.name) + '</b><small class="t-muted">' + esc(modelById(x.model).name) + (x.web ? ' · wyszukiwanie w sieci' : '') + '</small></button>'; }).join('') + '</section>' +
        '<section class="card" style="flex:999 1 480px;min-width:0;display:grid;gap:12px"><div class="h-row" style="margin:0"><h2>' + esc(a.name) + '</h2><span class="chip ' + (modelById(a.model).key ? 'c-green' : 'c-orange') + '">' + (modelById(a.model).key ? 'połączony z API' : 'tryb demo – brak klucza') + '</span></div><p class="t-muted" style="margin:0">' + esc(a.desc) + '</p>' +
        '<form data-form="agent" data-id="' + a.id + '" class="grid" style="gap:12px"><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px"><label class="t-muted" style="font-size:13px">Model<select id="agM" class="in" style="margin-top:4px">' + MODELS.map(function (m) { return '<option value="' + m.id + '"' + (m.id === a.model ? ' selected' : '') + '>' + esc(m.name) + '</option>'; }).join('') + '</select></label><label class="t-muted" style="font-size:13px">Temperatura<input id="agT" class="in" style="margin-top:4px" inputmode="decimal" value="' + a.temp + '"></label><label class="t-muted" style="font-size:13px">Maks. wyników<input id="agX" class="in" style="margin-top:4px" inputmode="numeric" value="' + a.max + '"></label></div>' +
        '<button type="button" class="check' + (a.web ? ' on' : '') + '" data-act="agweb" data-id="' + a.id + '" aria-pressed="' + a.web + '" style="border:1px solid var(--line);border-radius:12px;padding:10px"><span class="box">' + (a.web ? '✓' : '') + '</span><span><span style="display:block">Narzędzie: wyszukiwanie w sieci</span><small class="t-dim">web_search w API Claude – agent sam wykonuje zapytania i cytuje źródła</small></span></button>' +
        '<label class="t-muted" style="font-size:13px">Prompt systemowy (definicja agenta)<textarea id="agP" class="in" rows="14" style="margin-top:4px;font:13px/1.5 ui-monospace,Menlo,monospace">' + esc(a.prompt) + '</textarea></label>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn p">Zapisz agenta</button><button type="button" class="btn" data-act="agreset" data-id="' + a.id + '">Przywróć domyślny prompt</button>' + (a.id === 'leady' ? '<button type="button" class="btn g" data-act="leadgen">Uruchom generator leadów →</button>' : '') + '</div></form></section></div>';
    },
    on: function (act, el) {
      if (act === 'sttab') { st.tab = el.dataset.t; render(); }
      if (act === 'stagent') { st.agent = el.dataset.id; render(); }
      if (act === 'agweb') { var a = agentById(el.dataset.id); a.web = !a.web; saveAI(); render(); }
      if (act === 'agreset') { var d = AGENTS0.filter(function (x) { return x.id === el.dataset.id; })[0]; agentById(el.dataset.id).prompt = d.prompt; saveAI(); render(); toast('Przywrócono domyślny prompt'); }
      if (act === 'mdel') { MODELS = MODELS.filter(function (m) { return m.id !== el.dataset.id; }); saveAI(); render(); }
      if (act === 'mnew') { st.newModel = !st.newModel; render(); }
      if (act === 'mtest') testModel(modelById(el.dataset.id), el);
    },
    submit: function (f) {
      if (f.dataset.form === 'agent') { var a = agentById(f.dataset.id); a.model = $('#agM').value; a.temp = parseFloat(String($('#agT').value).replace(',', '.')) || 0; a.max = +$('#agX').value || 5; a.prompt = $('#agP').value; saveAI(); toast('Zapisano: ' + a.name); render(); }
      if (f.dataset.form === 'model') { var m = modelById(f.dataset.id); m.key = $('#mk-' + m.id).value.trim(); m.endpoint = $('#me-' + m.id).value.trim(); saveAI(); toast('Zapisano ustawienia modelu ' + m.name); render(); }
      if (f.dataset.form === 'mnew') { MODELS.push({ id: 'm' + Date.now(), name: $('#mnN').value, provider: $('#mnP').value, model: $('#mnM').value, endpoint: $('#mnE').value, key: $('#mnK').value, note: '' }); st.newModel = false; saveAI(); render(); toast('Dodano model'); }
    }
  };
  function modelsHtml() {
    return '<div class="alert a-orange"><span class="chip c-orange">KLUCZE</span><span>W demo klucz API zapisuje się tylko w tej przeglądarce. W systemie docelowym klucze trzyma serwer, a aplikacja nigdy ich nie pokazuje.</span></div>' +
      MODELS.map(function (m) { return '<section class="card"><form data-form="model" data-id="' + m.id + '" class="grid" style="gap:10px"><div class="h-row" style="margin:0;flex-wrap:wrap"><div><h2>' + esc(m.name) + '</h2><small class="t-muted">' + esc(m.provider) + ' · <span class="tab">' + esc(m.model) + '</span>' + (m.note ? ' · ' + esc(m.note) : '') + '</small></div><span class="chip ' + (m.key ? 'c-green' : 'c-orange') + '">' + (m.key ? 'klucz zapisany' : 'brak klucza') + '</span></div>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px"><label class="t-muted" style="font-size:13px">Adres API (endpoint)<input id="me-' + m.id + '" class="in" style="margin-top:4px" value="' + esc(m.endpoint) + '"></label><label class="t-muted" style="font-size:13px">Klucz API<input id="mk-' + m.id + '" class="in" type="password" autocomplete="off" style="margin-top:4px" value="' + esc(m.key) + '" placeholder="sk-ant-…"></label></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn p">Zapisz</button><button type="button" class="btn g" data-act="mtest" data-id="' + m.id + '">Testuj połączenie</button><button type="button" class="btn" data-act="mdel" data-id="' + m.id + '">Usuń</button></div></form></section>'; }).join('') +
      (st.newModel ? '<section class="card"><form data-form="mnew" class="grid" style="gap:10px"><h2>Nowy model</h2><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px"><label class="t-muted" style="font-size:13px">Nazwa<input id="mnN" class="in" style="margin-top:4px" required placeholder="np. Claude Sonnet 5.5 (zapasowy)"></label><label class="t-muted" style="font-size:13px">Dostawca<select id="mnP" class="in" style="margin-top:4px"><option>Anthropic</option><option>OpenAI-compatible</option><option>Azure</option><option>Lokalny (Ollama)</option></select></label><label class="t-muted" style="font-size:13px">Identyfikator modelu<input id="mnM" class="in" style="margin-top:4px" required placeholder="np. claude-sonnet-5-5"></label><label class="t-muted" style="font-size:13px">Adres API<input id="mnE" class="in" style="margin-top:4px" value="https://api.anthropic.com/v1/messages"></label><label class="t-muted" style="font-size:13px">Klucz API<input id="mnK" class="in" type="password" autocomplete="off" style="margin-top:4px"></label></div><div style="display:flex;gap:8px"><button class="btn p">Dodaj model</button><button type="button" class="btn" data-act="mnew">Anuluj</button></div></form></section>' : '<button class="btn g" data-act="mnew" style="align-self:flex-start">+ Dodaj model i API</button>');
  }
  function integrHtml() {
    var row = function (n, d, s, c) { return '<div class="row" style="align-items:center"><span><b style="font-weight:500">' + n + '</b><br><small class="t-dim">' + d + '</small></span><span class="chip ' + c + '">' + s + '</span></div>'; };
    return '<section class="card"><div class="list">' + row('Wapro Mag (iMag API)', 'stany, ceny, rezerwacje, ZAM, RW', 'do konfiguracji', 'c-orange') + row('GUS BIR (REGON)', 'dane kontrahentów po NIP – wymaga klucza z GUS', 'symulacja', 'c-orange') + row('Księgowość', 'faktury częściowe, płatności, domówienia', 'do ustalenia', '') + row('Bank (wyciągi)', 'potwierdzanie wpłat 30/40/30', 'do ustalenia', '') + row('Lokalizacja ekip (GPS)', 'obecny system – integracja lub zastąpienie', 'do ustalenia', '') + row('Formularz www / czat AI', 'zgłoszenia i leady prosto do CRM', 'gotowe w demo', 'c-green') + '</div></section>';
  }

  /* --- wywołanie modelu (prawdziwe API, gdy jest klucz) --- */
  function callModel(m, system, user, web, maxTok) {
    if (!m.key) return Promise.reject(new Error('Brak klucza API dla modelu ' + m.name));
    if (m.provider !== 'Anthropic') return Promise.reject(new Error('Demo obsługuje wywołania API Anthropic'));
    var body = { model: m.model, max_tokens: maxTok || 4000, system: system, messages: [{ role: 'user', content: user }] };
    if (web) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }];
    return fetch(m.endpoint, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': m.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); });
  }
  function testModel(m, el) {
    var t = el.textContent; el.textContent = 'Testuję…'; el.disabled = true;
    callModel(m, 'Odpowiadaj jednym słowem.', 'Napisz: działa', false, 20).then(function (j) { toast('Połączenie OK: ' + m.name + ' odpowiada'); }).catch(function (e) { toast('Błąd: ' + e.message + (location.hostname.indexOf('claude') > -1 ? ' (w podglądzie Claude połączenia zewnętrzne są zablokowane – użyj wersji z GitHuba)' : '')); }).then(function () { el.textContent = t; el.disabled = false; });
  }

  /* --- generator leadów --- */
  var gen = { region: 'kujawsko-pomorskie', branza: [], prod: [], mode: 'rozszerz', q: '', busy: false, res: null, err: '', cites: [], live: false, showPrompt: false };
  var REGIONS = ['kujawsko-pomorskie', 'pomorskie', 'wielkopolskie', 'mazowieckie', 'łódzkie', 'cała Polska'];
  function genPrompt() {
    var a = agentById('leady');
    var u = 'Region: ' + gen.region + '.\nBranże: ' + (gen.branza.length ? gen.branza.join(', ') : 'dowolne') + '.\nProdukty Graffico: ' + (gen.prod.length ? gen.prod.join(', ') : 'dowolne z oferty') + '.\nLiczba leadów: do ' + a.max + '.\nFirmy już w bazie (pomiń): ' + FIRMS.map(function (f) { return f.name; }).join(', ') + '.';
    if (gen.q.trim()) u += '\n\n' + (gen.mode === 'rozszerz' ? 'DODATKOWE WSKAZÓWKI (rozszerz poszukiwania): ' : 'OGRANICZENIA (zawęź wyniki – stosuj ściśle): ') + gen.q.trim();
    return { system: a.prompt, user: u };
  }
  function genSheet() {
    var a = agentById('leady'), m = modelById(a.model), p = genPrompt();
    var chips = function (key, arr, multi) { return '<div class="seg">' + arr.map(function (v) { var on = multi ? gen[key].indexOf(v) > -1 : gen[key] === v; return '<button type="button" data-act="gset" data-k="' + key + '" data-v="' + esc(v) + '" data-multi="' + (multi ? 1 : 0) + '" aria-pressed="' + on + '">' + v + '</button>'; }).join('') + '</div>'; };
    var res = '';
    if (gen.busy) res = '<div class="card" style="background:var(--surface2);display:flex;gap:12px;align-items:center"><span class="spin" aria-hidden="true"></span><span>Agent przeszukuje sieć' + (gen.live ? ' (' + esc(m.name) + ' + web_search)' : ' (tryb demo)') + '…</span></div>';
    else if (gen.err) res = '<div class="alert a-red">' + esc(gen.err) + '</div>';
    if (gen.res && !gen.busy) res += '<div class="h-row" style="margin:0"><b>Znalezione leady · ' + gen.res.length + (gen.found > gen.res.length ? ' z ' + gen.found : '') + '</b><span class="chip ' + (gen.live ? 'c-green' : 'c-orange') + '">' + (gen.live ? 'wyniki z internetu' : 'przykładowe wyniki – tryb demo') + '</span></div>' + (gen.crit && !gen.live ? '<div style="display:flex;gap:6px;flex-wrap:wrap"><small class="t-dim" style="width:100%">Zastosowane kryteria:</small>' + gen.crit.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' : '') + (gen.res.length ? '' : '<div class="alert a-orange">Brak leadów dla tych kryteriów. Poszerz region, usuń część branż lub produktów albo złagodź zawężenie.</div>') + gen.res.map(function (r, i) {
      var pot = { wysoki: 'c-green', 'średni': '', niski: 'c-orange' }[r.potencjal] || '';
      return '<div class="card" style="background:var(--surface2);display:grid;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><b>' + esc(r.firma) + '</b><span class="chip ' + pot + '">potencjał: ' + esc(r.potencjal || '—') + '</span></div><small class="t-muted">' + esc([r.miasto, r.wojewodztwo, r.branza].filter(Boolean).join(' · ')) + '</small><span style="font-size:14px">' + esc(r.sygnal || '') + '</span><small class="t-dim">Sugerowany produkt: ' + esc(r.produkt || '—') + (r.wartosc_szac ? ' · szac. ' + zl(+r.wartosc_szac) : '') + '</small>' + ((r.kontakt_telefon || r.kontakt_email) ? '<small class="t-green">Kontakt: ' + esc([r.kontakt_telefon, r.kontakt_email].filter(Boolean).join(' · ')) + '</small>' : '<small class="t-orange">Kontakt nie ustalony na podstawie dostępnych danych</small>') + (r.zrodlo_url ? '<a href="' + esc(r.zrodlo_url) + '" target="_blank" rel="noopener" style="font-size:12px;word-break:break-all">' + esc(r.zrodlo_url) + '</a>' : '') +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (r._added ? '<span class="chip c-green">dodano do lejka</span>' : '<button type="button" class="btn p" style="min-height:40px;font-size:13px" data-act="gadd" data-i="' + i + '">Utwórz lead →</button><button type="button" class="btn" style="min-height:40px;font-size:13px" data-act="gdrop" data-i="' + i + '">Odrzuć</button>') + '</div></div>';
    }).join('');
    return '<div class="grab"></div><div class="h-row" style="margin:0"><h2>Generator leadów</h2><span class="chip ' + (m.key ? 'c-green' : 'c-orange') + '">' + esc(m.name) + (m.key ? '' : ' · demo') + '</span></div>' +
      '<p class="t-muted" style="margin:0;font-size:14px">Agent leadów przeszukuje publiczne źródła (BIP, przetargi, nowe inwestycje, otwarcia obiektów) i proponuje szanse z uzasadnieniem i linkiem do źródła.</p>' +
      '<div><small class="t-muted">Region</small>' + chips('region', REGIONS, false) + '</div><div><small class="t-muted">Branże (opcjonalnie)</small>' + chips('branza', ['Paliwowa', 'Medyczna', 'Handlowa', 'Miasta, gminy', 'Nieruchomości', 'Produkcyjna', 'Hotelarstwo'], true) + '</div><div><small class="t-muted">Produkty (opcjonalnie)</small>' + chips('prod', ['Pylon cenowy', 'Pylon', 'Litery 3D', 'Kaseton', 'Witacz', 'Oznakowanie CH'], true) + '</div>' +
      '<div><small class="t-muted">Twoje zapytanie do agenta</small><div class="seg" style="margin:4px 0 6px"><button type="button" data-act="gset" data-k="mode" data-v="rozszerz" data-multi="0" aria-pressed="' + (gen.mode === 'rozszerz') + '">Rozszerz prompt</button><button type="button" data-act="gset" data-k="mode" data-v="zawez" data-multi="0" aria-pressed="' + (gen.mode === 'zawez') + '">Zawęź wyniki</button></div><label for="genQ" style="position:absolute;left:-9999px">Zapytanie</label><textarea id="genQ" class="in" rows="3" placeholder="' + (gen.mode === 'rozszerz' ? 'np. Szukaj też nowych przychodni i aptek otwieranych w 2027, sprawdź przetargi gmin na witacze' : 'np. Tylko inwestycje powyżej 50 tys. zł, tylko do 100 km od Torunia, bez przetargów publicznych') + '">' + esc(gen.q) + '</textarea></div>' +
      '<button type="button" class="btn p full" data-act="grun"' + (gen.busy ? ' disabled' : '') + '>' + I.spark + 'Szukaj leadów</button>' + res +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-act="addlead">← Wróć do Dodaj lead</button><button type="button" class="btn" data-act="close">Zamknij</button></div>';
  }
  var DEMO_LEADS = [
    { firma: 'Nowa stacja paliw przy S10 – Lubicz (przykład)', miasto: 'Lubicz', wojewodztwo: 'kujawsko-pomorskie', branza: 'Paliwowa', sygnal: 'Wydane pozwolenie na budowę stacji paliw z myjnią; otwarcie planowane na II kwartał 2027.', produkt: 'Pylon cenowy 8 m + oznakowanie wiaty', potencjal: 'wysoki', wartosc_szac: 120000, zrodlo_url: '' },
    { firma: 'Przychodnia specjalistyczna – rozbudowa (przykład)', miasto: 'Toruń', wojewodztwo: 'kujawsko-pomorskie', branza: 'Medyczna', sygnal: 'Ogłoszony przetarg na rozbudowę budynku; w zakresie oznakowanie zewnętrzne i system informacji wizualnej.', produkt: 'Pylon informacyjny + litery 3D', potencjal: 'średni', wartosc_szac: 45000, zrodlo_url: '' },
    { firma: 'Gmina – nowe witacze przy drogach wjazdowych (przykład)', miasto: 'Chełmża', wojewodztwo: 'kujawsko-pomorskie', branza: 'Miasta, gminy', sygnal: 'W budżecie na 2027 zapisano zadanie „witacze i tablice promocyjne”.', produkt: 'Witacze 4 szt.', potencjal: 'średni', wartosc_szac: 60000, zrodlo_url: '' },
    { firma: 'Park handlowy – rebranding najemców (przykład)', miasto: 'Bydgoszcz', wojewodztwo: 'kujawsko-pomorskie', branza: 'Nieruchomości', sygnal: 'Komunikat zarządcy o modernizacji parku i nowych najemcach od wiosny 2027.', produkt: 'Pylon totem + kasetony LED najemców', potencjal: 'wysoki', wartosc_szac: 180000, zrodlo_url: '' },
    { firma: 'Hotel przy autostradzie A1 – otwarcie (przykład)', miasto: 'Włocławek', wojewodztwo: 'kujawsko-pomorskie', branza: 'Hotelarstwo', sygnal: 'Inwestycja w trakcie budowy, otwarcie zapowiedziane na jesień 2027.', produkt: 'Litery 3D na elewacji + pylon przy zjeździe', potencjal: 'niski', wartosc_szac: 70000, zrodlo_url: '' }
  ];
  /* --- tryb demo: wyniki budowane z wyborów użytkownika (region, branże, produkty, zapytanie) --- */
  var DEMO_CITIES = {
    'kujawsko-pomorskie': [['Toruń', 0], ['Bydgoszcz', 48], ['Włocławek', 60], ['Grudziądz', 65], ['Inowrocław', 40], ['Chełmża', 15], ['Lubicz', 10], ['Brodnica', 70]],
    'pomorskie': [['Gdańsk', 170], ['Gdynia', 190], ['Tczew', 140], ['Starogard Gdański', 120], ['Kwidzyn', 100], ['Słupsk', 280]],
    'wielkopolskie': [['Poznań', 150], ['Konin', 110], ['Gniezno', 110], ['Piła', 150], ['Kalisz', 190], ['Ostrów Wlkp.', 200]],
    'mazowieckie': [['Płock', 110], ['Ciechanów', 150], ['Warszawa', 210], ['Pruszków', 220], ['Radom', 290], ['Siedlce', 300]],
    'łódzkie': [['Kutno', 110], ['Stryków', 165], ['Zgierz', 170], ['Łódź', 180], ['Skierniewice', 200], ['Piotrków Trybunalski', 220]]
  };
  var DEMO_TPL = [
    { b: 'Paliwowa', f: 'Nowa stacja paliw przy drodze krajowej – {c}', s: 'Wydane pozwolenie na budowę stacji paliw z myjnią (BIP starostwa); otwarcie planowane na {q} 2027.', p: 'Pylon cenowy 8 m + oznakowanie wiaty', tag: ['Pylon cenowy', 'Pylon'], v: [90, 160], src: 'pozwolenie' },
    { b: 'Paliwowa', f: 'Stacja paliw – zmiana sieci i rebranding, {c}', s: 'Operator ogłosił przejęcie stacji i zmianę marki do {q} 2027.', p: 'Pylon cenowy + rebranding wiaty i dystrybutorów', tag: ['Pylon cenowy', 'Kaseton'], v: [70, 140], src: 'komunikat' },
    { b: 'Medyczna', f: 'Przychodnia specjalistyczna – rozbudowa, {c}', s: 'Ogłoszony przetarg na rozbudowę budynku; w zakresie oznakowanie zewnętrzne i informacja wizualna.', p: 'Pylon informacyjny + litery 3D', tag: ['Pylon', 'Litery 3D'], v: [35, 80], src: 'przetarg' },
    { b: 'Medyczna', f: 'Nowe centrum medyczne – {c}', s: 'Inwestor rozpoczął budowę; otwarcie zapowiedziane na {q} 2027.', p: 'Litery 3D + kasetony LED + pylon przy wjeździe', tag: ['Litery 3D', 'Kaseton', 'Pylon'], v: [50, 110], src: 'pozwolenie' },
    { b: 'Handlowa', f: 'Nowy market sieci handlowej – {c}', s: 'Pozwolenie na budowę marketu z parkingiem; otwarcie {q} 2027.', p: 'Pylon reklamowy + kasetony LED', tag: ['Pylon', 'Kaseton'], v: [60, 130], src: 'pozwolenie' },
    { b: 'Miasta, gminy', f: 'Gmina {c} – witacze przy drogach wjazdowych', s: 'W budżecie na 2027 zapisano zadanie „witacze i tablice promocyjne”; przetarg planowany w I kwartale.', p: 'Witacze 4 szt. z podświetleniem', tag: ['Witacz'], v: [40, 90], src: 'przetarg' },
    { b: 'Miasta, gminy', f: 'Urząd – oznakowanie nowego budynku, {c}', s: 'Zakończenie budowy siedziby urzędu w {q} 2027; zapytanie ofertowe na oznakowanie.', p: 'Litery 3D na elewacji + tablice informacyjne', tag: ['Litery 3D'], v: [25, 60], src: 'przetarg' },
    { b: 'Nieruchomości', f: 'Park handlowy – modernizacja i nowi najemcy, {c}', s: 'Zarządca ogłosił modernizację i nowych najemców od wiosny 2027.', p: 'Pylon totem + kasetony LED najemców', tag: ['Oznakowanie CH', 'Pylon', 'Kaseton'], v: [120, 220], src: 'komunikat' },
    { b: 'Produkcyjna', f: 'Nowa hala produkcyjna – {c}', s: 'Inwestor kończy budowę hali; przeprowadzka zakładu w {q} 2027.', p: 'Litery 3D na elewacji + pylon przy wjeździe', tag: ['Litery 3D', 'Pylon'], v: [45, 95], src: 'pozwolenie' },
    { b: 'Hotelarstwo', f: 'Hotel – otwarcie, {c}', s: 'Obiekt w budowie, otwarcie zapowiedziane na {q} 2027.', p: 'Litery 3D + pylon przy zjeździe', tag: ['Litery 3D', 'Pylon'], v: [55, 100], src: 'komunikat' },
    { b: 'Apteczna', f: 'Sieć aptek – nowe punkty, {c}', s: 'Sieć ogłosiła otwarcie kolejnych aptek w regionie w 2027.', p: 'Kasetony LED + krzyże apteczne', tag: ['Kaseton'], v: [15, 40], src: 'komunikat' }
  ];
  var KEYWORDS = [[/apte/i, 'Apteczna'], [/przychod|klinik|medycz|szpital/i, 'Medyczna'], [/hotel/i, 'Hotelarstwo'], [/stacj|paliw/i, 'Paliwowa'], [/gmin|witacz|urz[ąa]d|miast/i, 'Miasta, gminy'], [/galeri|park handl|centr(um|a) handl/i, 'Nieruchomości'], [/market|sklep|dyskont/i, 'Handlowa'], [/fabryk|hal[ai] produk|zak[łl]ad/i, 'Produkcyjna']];
  function demoSearch() {
    var a = agentById('leady'), q = gen.q || '', crit = [];
    var regions = gen.region === 'cała Polska' ? Object.keys(DEMO_CITIES) : [gen.region];
    crit.push('region: ' + gen.region);
    var br = gen.branza.slice();
    var boost = [];
    if (gen.mode === 'rozszerz') KEYWORDS.forEach(function (k) { if (k[0].test(q)) { boost.push(k[1]); if (br.length && br.indexOf(k[1]) < 0) br.push(k[1]); crit.push((gen.branza.length ? 'dodano z zapytania: ' : 'priorytet z zapytania: ') + k[1]); } });
    if (gen.mode === 'zawez' && !br.length) KEYWORDS.forEach(function (k) { if (k[0].test(q) && /tylko/i.test(q)) { br.push(k[1]); crit.push('tylko: ' + k[1]); } });
    if (br.length) crit.push('branże: ' + br.join(', '));
    if (gen.prod.length) crit.push('produkty: ' + gen.prod.join(', '));
    var minV = 0, maxKm = 0, noTender = false, m;
    if ((m = q.match(/(powy[żz]ej|ponad|min\.?|minimum|od|>)\s*(\d+[\s\d]*)\s*(tys|k|000)?/i))) { minV = +m[2].replace(/\s/g, ''); if (m[3] || minV < 1000) minV *= minV < 1000 ? 1000 : 1; crit.push('wartość ≥ ' + zl(minV)); }
    if ((m = q.match(/do\s*(\d+)\s*km/i))) { maxKm = +m[1]; crit.push('do ' + maxKm + ' km od Torunia'); }
    if (/bez\s+przetarg/i.test(q)) { noTender = true; crit.push('bez przetargów'); }
    var pool = [], n = 0;
    regions.forEach(function (r) {
      DEMO_CITIES[r].forEach(function (c, ci) {
        DEMO_TPL.forEach(function (t, ti) {
          n++; var sd = seed(ci * 31 + ti * 7 + r.length, 3);
          if (sd < .3) return;
          var val = Math.round((t.v[0] + (t.v[1] - t.v[0]) * seed(ci + ti, 5)) * 1000 / 1000) * 1000;
          var pot = val >= 100000 ? 'wysoki' : val >= 50000 ? 'średni' : 'niski';
          var qtr = ['I kwartał', 'II kwartał', 'III kwartał', 'IV kwartał'][Math.floor(seed(ci, ti) * 4)];
          pool.push({ firma: t.f.replace('{c}', c[0]) + ' (przykład)', miasto: c[0], wojewodztwo: r, branza: t.b, sygnal: t.s.replace('{q}', qtr), produkt: t.p, potencjal: pot, wartosc_szac: val, zrodlo_url: '', _km: c[1], _tag: t.tag, _src: t.src });
        });
      });
    });
    var res = pool.filter(function (x) {
      if (br.length && br.indexOf(x.branza) < 0) return false;
      if (gen.prod.length && !gen.prod.some(function (p) { return x._tag.indexOf(p) > -1; })) return false;
      if (minV && x.wartosc_szac < minV) return false;
      if (maxKm && x._km > maxKm) return false;
      if (noTender && x._src === 'przetarg') return false;
      if (FIRMS.some(function (f) { return f.name === x.firma; })) return false;
      return true;
    });
    var rank = { wysoki: 0, 'średni': 1, niski: 2 };
    res.sort(function (a1, b1) { var ba = boost.indexOf(a1.branza) > -1 ? 0 : 1, bb = boost.indexOf(b1.branza) > -1 ? 0 : 1; return ba - bb || rank[a1.potencjal] - rank[b1.potencjal] || b1.wartosc_szac - a1.wartosc_szac; });
    if (boost.length) { var top = res.slice(0, a.max), mixed = top.filter(function (x) { return boost.indexOf(x.branza) > -1; }).slice(0, Math.ceil(a.max * .6)); res = mixed.concat(res.filter(function (x) { return mixed.indexOf(x) < 0 && boost.indexOf(x.branza) < 0; })); }
    gen.crit = crit; gen.found = res.length;
    return res.slice(0, a.max);
  }
  function runGen() {
    var a = agentById('leady'), m = modelById(a.model), p = genPrompt();
    gen.busy = true; gen.err = ''; gen.res = null; gen.live = !!m.key; reSheet(genSheet());
    var done = function () { gen.busy = false; reSheet(genSheet()); };
    if (!m.key) { setTimeout(function () { gen.res = demoSearch(); done(); }, 1400); return; }
    callModel(m, p.system, p.user, a.web, 6000).then(function (j) {
      var text = (j.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join('\n');
      var mt = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/);
      var arr = []; try { arr = JSON.parse(mt ? mt[1] : text); } catch (e) { throw new Error('Model nie zwrócił poprawnego JSON. Odpowiedź: ' + text.slice(0, 300)); }
      gen.res = arr.slice(0, a.max); done();
    }).catch(function (e) { gen.err = 'Nie udało się uruchomić agenta: ' + e.message + (location.hostname.indexOf('claude') > -1 ? ' W podglądzie Claude połączenia zewnętrzne są zablokowane – uruchom generator w wersji z GitHuba.' : ''); done(); });
  }
  function genAdd(i) {
    var r = gen.res[i], f = FIRMS.filter(function (x) { return x.name === r.firma; })[0];
    if (!f) { f = { id: Math.max.apply(null, FIRMS.map(function (x) { return x.id; })) + 1, name: r.firma, full: '', nip: '', regon: '', addr: '', zip: '', city: r.miasto || '', woj: r.wojewodztwo || '', branza: r.branza || '', owner: 'Agnieszka W.', source: 'Agent AI (generator leadów)', added: '24.10.2026', www: '', contacts: [] }; FIRMS.unshift(f); saveFirms(); }
    if (SOURCES.indexOf('Agent AI (generator leadów)') < 0) { SOURCES.push('Agent AI (generator leadów)'); store.set('sources', SOURCES); }
    var typ = (TYPICAL[f.branza] || []).map(function (t) { return t[0]; });
    var ct = (r.kontakt_telefon || r.kontakt_email) ? { telefon: r.kontakt_telefon || null, email: r.kontakt_email || null, zrodlo_url: r.kontakt_zrodlo_url || r.zrodlo_url || null } : null;
    r._added = true;
    crm.lf = { firm: f.id, q: '', owner: 'Agnieszka W.', src: 'Agent AI (generator leadów)', person: 'new', title: r.produkt || '', prods: typ.slice(0, 2), value: r.wartosc_szac ? String(r.wartosc_szac) : '', signal: r.sygnal, srcUrl: r.zrodlo_url || '', contact: ct, next: ct ? 'Zadzwonić z pytaniem o planowane oznakowanie' + (ct.telefon ? ' – tel. ' + ct.telefon : '') : 'Zadzwonić z pytaniem o planowane oznakowanie i termin inwestycji' };
    openSheet(leadForm());
  }


  VIEWS.zlecenie = {
    title: 'Zlecenie 2155', sub: 'AMIC POLSKA · PYLON CENOWY',
    html: function () {
      var S = closed
        ? [['Sprzedaż', 'umowa 12.10', 2], ['PM', '13.10', 2], ['Projekt', 'rys. v3', 2], ['Magazyn', 'wydane', 2], ['Produkcja', '100%', 2], ['Montaż', 'dziś ' + closed.at, 2], ['Odbiór', 'podpisany', 2], ['Faktura', 'III do wyst.', 1]]
        : [['Sprzedaż', 'umowa 12.10', 2], ['PM', '13.10', 2], ['Projekt', 'rys. v3', 2], ['Magazyn', '3 z 4 poz.', 1], ['Produkcja', '86%', 1], ['Montaż', '29.10', 0], ['Odbiór', 'protokół', 0], ['Faktura', 'II i III', 0]];
      var O = [['Cięcie gilotyna', 12, 10.5], ['Gięcie', 16, 14], ['Frezowanie CNC', 24, 23], ['Spawanie', 64, 71.5], ['Szlifowanie', 30, 26], ['Malowanie', 40, 38], ['Elektryka LED', 30, 22], ['Pakowanie', 6, 0]];
      var tabs = ['Rozliczenie', 'Materiały', 'Jakość', 'Rozmowa', 'Historia' + (events.length ? ' (' + events.length + ')' : '')];
      var body = [
        '<div class="grid g2"><section class="card"><div class="h-row"><h2>Plan vs wykonanie</h2><small class="t-dim">szary = plan</small></div>' + O.map(function (o) { var over = o[2] > o[1]; return '<div class="op"><span>' + o[0] + '</span><span><i class="p" style="display:block;width:' + (o[1] / 72 * 100) + '%"></i><i class="r" style="display:block;width:' + (o[2] / 72 * 100) + '%;background:' + (over ? 'var(--red)' : 'var(--pink)') + '"></i></span><span class="tab ' + (over ? 't-red' : 't-muted') + '" style="text-align:right">' + String(o[2]).replace('.', ',') + ' / ' + o[1] + ' h</span></div>'; }).join('') + '</section>' +
        '<section class="card"><h2 style="font-size:17px;margin-bottom:6px">Płatności</h2><div class="list"><div class="row"><span>Zaliczka I · 30%</span><span class="t-green tab">20 520 zł ✓</span></div><div class="row"><span>II · 40% (po zdjęciach)</span><span class="t-orange tab">27 360 zł · do wystawienia</span></div><div class="row"><span>III · 30% (po odbiorze)</span><span class="t-dim tab">20 520 zł</span></div><div class="row"><span>Domówienie: blacha LPG</span><span class="t-pink tab">4 200 zł</span></div></div></section></div>',
        '<section class="card"><h2 style="font-size:17px;margin-bottom:6px">Materiały i rezerwacje (Wapro)</h2><div class="list"><div class="row"><span>Blacha Al 3 mm · 6 ark.<br><small class="t-dim">R2 / półka 4</small></span><span class="chip c-green">wydane</span></div><div class="row"><span>Profil 80×80×4 · 48 mb<br><small class="t-dim">Plac B</small></span><span class="chip c-green">wydane</span></div><div class="row"><span>Moduły LED · 220 szt.<br><small class="t-dim">Magazyn 1</small></span><span class="chip c-pink">zarezerwowane</span></div><div class="row"><span>Wyświetlacze cen LED · 4 szt.<br><small class="t-dim">dostawca</small></span><span class="chip c-orange">dostawa 26.10</span></div></div></section>',
        '<div class="grid g2"><section class="card"><h2 style="font-size:17px;margin-bottom:6px">Punkty kontroli jakości</h2><div class="list"><div class="row"><span>Cięcie i gięcie</span><span class="t-green">✓ Damian, 19.10</span></div><div class="row"><span>Spawanie konstrukcji</span><span class="t-green">✓ Artur, 21.10</span></div><div class="row"><span>Malowanie – RAL</span><span class="t-green">✓ Krzysztof, 22.10</span></div><div class="row"><span>Test LED 24 h</span><span class="t-orange">w toku</span></div></div></section>' +
        '<section class="card" style="border-color:rgba(255,90,90,.3)"><h2 style="font-size:17px;margin-bottom:6px">Karta zdarzeń krytycznych</h2><p style="margin:0;font-size:14px">Pliki do malarni wysłane w złej wersji. Działanie: blokada wysyłki plików bez statusu „aktualny”.</p><p class="t-red" style="margin:8px 0 0;font-size:14px">Koszt: 5 000 zł · zamknięte</p></section></div>',
        '<section class="card grid"><div><small class="t-dim">Karol (technolog) · 18.10</small><div>Technologia gotowa: P1 cięcie/gięcie, P2 spawanie, malarnia, P3 elektryka.</div></div><div><small class="t-dim">Kierownik produkcji · 22.10</small><div>Konstrukcja pomalowana, czekamy na wyświetlacze cen.</div></div><div><small class="t-dim">Agnieszka W. · dziś</small><div>Klient domówił blachę LPG (+4 200 zł). Dopisane do rozliczenia.</div></div><form data-form="msg" style="display:flex;gap:8px"><label for="msgIn" class="t-dim" style="position:absolute;left:-9999px">Wiadomość</label><input id="msgIn" class="in" placeholder="Napisz do zespołu zlecenia…"><button class="btn p">Wyślij</button></form></section>',
        '<section class="card"><div class="h-row"><h2>Co system zrobił automatycznie</h2>' + (closed ? '<span class="chip c-green">zamknięte ' + closed.at + '</span>' : '') + '</div>' +
          (closed && closed.photos && closed.photos.length ? '<div class="thumbs" style="margin-bottom:12px">' + closed.photos.slice(0, 6).map(function (p) { return '<div style="background-image:url(' + p + ')"></div>'; }).join('') + '</div>' : '') +
          eventsHtml() + '</section>'
      ];
      return '<section style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span class="num" style="font-size:56px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">2155</span><div style="min-width:0;flex:1"><h1 style="font-size:22px">Pylon cenowy 6 m – AMIC Łódź</h1><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">' + (closed ? '<span class="chip c-green">Zamknięte · protokół podpisany</span><span class="chip c-orange">Faktura III do wystawienia</span>' : '<span class="chip c-green">Montaż 29.10</span><span class="chip c-orange">Zdjęcia wymagane</span>') + '<span class="chip">PM: Robert Ś.</span></div></div></section>' +
        '<section class="card scroll-x"><div class="steps">' + S.map(function (s) { return '<div><i style="background:' + (s[2] === 2 ? 'var(--green)' : s[2] === 1 ? 'var(--grad)' : 'rgba(255,255,255,.1)') + '"></i><b style="' + (s[2] === 0 ? 'color:var(--dim)' : '') + '">' + (s[2] === 2 ? '✓ ' : '') + s[0] + '</b><small>' + s[1] + '</small></div>'; }).join('') + '</div></section>' +
        '<div class="kpis"><div class="kpi"><small>Wartość netto</small><b>68 400 zł</b><em class="t-dim">+ 4 200 zł domówienie</em></div><div class="kpi"><small>Godziny plan / real</small><b class="tab">240 / 226 h</b><em class="t-green">94% budżetu</em></div><div class="kpi"><small>Koszt do dziś</small><b>41 870 zł</b></div><div class="kpi"><small>Prognoza marży</small><b class="t-green">32,6%</b><em class="t-dim">plan 34%</em></div>' + (closed ? '<div class="kpi"><small>Montaż</small><b>zakończony</b><em class="t-green">dziś ' + closed.at + ' · przed terminem</em></div>' : '<div class="kpi"><small>Termin montażu</small><b>29.10</b><em class="t-green">za 6 dni</em></div>') + '</div>' +
        '<div class="seg">' + tabs.map(function (t, i) { return '<button data-act="otab" data-i="' + i + '" aria-pressed="' + (ui.otab === i) + '">' + t + '</button>'; }).join('') + '</div>' + body[ui.otab] +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-go="monter">Zlecenie montażu</button><button class="btn" data-act="share">Udostępnij klientowi</button></div>';
    },
    mount: function () { if (ui.otab === 4) { var s = $('#view .seg'); if (s) setTimeout(function () { s.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); }, 30); } },
    on: function (act, el) {
      if (act === 'otab') { ui.otab = +el.dataset.i; render(); }
      if (act === 'share') toast('Link do portalu klienta skopiowany (demo)');
    },
    submit: function (form) { var v = $('#msgIn').value.trim(); if (v) toast('Wysłano do zespołu zlecenia'); }
  };

  VIEWS.plan = {
    title: 'Plan hali · tydzień 44', sub: 'PRODUKCJA · GANTT GNIAZD',
    html: function () {
      var f = ui.fix;
      var C = { a: ['rgba(255,105,178,.28)', '#FF69B2'], b: ['rgba(136,255,88,.2)', '#88FF58'], c: ['rgba(255,153,0,.22)', '#FF9900'], x: ['rgba(255,90,90,.28)', '#FF5A5A'] };
      var bar = function (nr, op, d0, d1, k) { return '<div class="g-bar" style="left:' + (d0 / 6 * 100) + '%;width:' + ((d1 - d0) / 6 * 100) + '%;background:' + C[k][0] + ';border-color:' + C[k][1] + (k === 'x' ? ';border-style:dashed' : '') + '"><span class="num">' + nr + '</span>' + op + '</div>'; };
      var cnc = f === 'sat' ? [bar('2169', 'frezowanie', .05, 1.95, 'b'), bar('2090', 'litery', 5.05, 5.95, 'c')] : f === 'ot' ? [bar('2169', 'frezowanie', .05, 1.6, 'b'), bar('2090', 'litery +2 h', 1.62, 2.4, 'c')] : f === 'move' ? [bar('2169', 'frezowanie', .05, 1.95, 'b'), bar('2090', 'litery', 2, 2.95, 'c')] : [bar('2169', 'frezowanie', .05, 1.95, 'b'), bar('2090', 'litery', 1.1, 2, 'x')];
      var R = [['Gilotyna', '62%', [bar('2169', 'cięcie', .05, .9, 'b'), bar('2129', 'cięcie', 2.05, 2.7, 'c')]], ['Prasa krawędziowa', '74%', [bar('2169', 'gięcie', 1.05, 2.9, 'b')]], ['Frezarka CNC', f ? '96%' : '118% konflikt', cnc], ['Spawalnia P2', '88%', [bar('2161', 'litery 3D', .05, 1.5, 'c'), bar('2169', 'rama K3', 3.05, 4.9, 'b')]], ['Szlifiernia', '70%', [bar('2161', 'szlif', 1.55, 2.4, 'c'), bar('2169', 'szlif', 4.95, 5.6, 'b')]], ['Malarnia', '81%', [bar('2129', 'malowanie', .05, 1.4, 'c'), bar('2161', 'lakier', 2.5, 3.6, 'c')]], ['P3 · Elektryka', '66%', [bar('2155', 'test LED', .05, 1.3, 'a'), bar('2129', 'LED', 1.5, 2.9, 'c')]]];
      var names = { ot: 'nadgodziny we wtorek', sat: 'praca w sobotę', move: 'przesunięcie na środę' };
      return '<section class="card" style="border-color:' + (f ? 'rgba(136,255,88,.4)' : 'rgba(255,90,90,.4)') + '"><b class="' + (f ? 't-green' : 't-red') + '">' + (f ? 'Konflikt rozwiązany' : 'Ścieżka krytyczna: frezarka CNC') + '</b><p style="margin:6px 0 0;font-size:14px">' + (f ? 'Zastosowano: ' + names[f] + '. Pracownicy i monitor hali dostali nowy plan.' : 'Wtorek 27.10: zlecenia 2169 i 2090 potrzebują frezarki w tym samym czasie (brakuje 7 h).') + '</p>' +
        (f ? '<button class="btn" style="margin-top:10px" data-act="unfix">Cofnij</button>' : '<div class="grid" style="margin-top:12px"><span class="eyebrow t-green">Propozycje AI</span>' +
          [['ot', 'Nadgodziny +2 h (Kacper K.)', '≈ 140 zł', 'Wtorek do 18:00, Kacper ma kompetencję CNC.'], ['sat', 'Sobota – 2090 na frezarce', '≈ 420 zł', 'Termin 2090: 06.11, zapas 4 dni.'], ['move', 'Przesuń 2090 na środę', '0 zł', 'Szlif 2161 przesuwa się o 4 h, termin bezpieczny.']].map(function (o) { return '<button class="opt" data-act="fix" data-f="' + o[0] + '"><span style="display:flex;justify-content:space-between;gap:8px"><b>' + o[1] + '</b><span class="t-green">' + o[2] + '</span></span><small class="t-muted">' + o[3] + '</small></button>'; }).join('') + '</div>') + '</section>' +
        '<section class="card"><div class="h-row"><h2>Gniazda · 26–31.10</h2><small class="t-dim">przesuń w bok</small></div><div class="scroll-x"><div class="gantt"><div class="g-head"><span>Gniazdo</span><span class="g-days"><span>Pn 26</span><span>Wt 27</span><span>Śr 28</span><span>Czw 29</span><span>Pt 30</span><span class="' + (f === 'sat' ? 't-green' : '') + '">Sob 31</span></span></div>' +
        R.map(function (r) { var bad = r[1].indexOf('konflikt') > -1; return '<div class="g-row"' + (bad ? ' style="background:rgba(255,90,90,.05)"' : '') + '><span><b>' + r[0] + '</b><small class="' + (bad ? 't-red' : 't-dim') + '">' + r[1] + '</small></span><span class="g-track">' + r[2].join('') + '</span></div>'; }).join('') + '</div></div></section>' +
        '<section class="card"><div class="h-row"><h2>Pracownicy · poniedziałek</h2><a href="#kadry" data-go="kadry" style="font-size:13px">Wszyscy pracownicy →</a></div><p class="t-orange" style="margin:0 0 10px;font-size:13px">Brak 1 spawacza – zastępstwo z macierzy kompetencji: Artur K.</p><div class="grid g2">' +
        [['Artur K.', '8 / 8 h', ['spawanie', 'malowanie', 'CNC']], ['Kacper K.', '10 / 8 h', ['CNC', 'pliki']], ['Damian B.', '6 / 8 h', ['frezowanie', 'gięcie']], ['Stanisław O.', '8 / 8 h', ['składanie', 'elektryka']]].map(function (p) { return '<div><div style="display:flex;justify-content:space-between"><span>' + p[0] + '</span><span class="tab ' + (p[1].indexOf('10') === 0 ? 't-orange' : 't-muted') + '">' + p[1] + '</span></div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">' + p[2].map(function (k) { return '<span class="chip">' + k + '</span>'; }).join('') + '</div></div>'; }).join('') + '</div></section>';
    },
    on: function (act, el) { if (act === 'fix') { ui.fix = el.dataset.f; render(); toast('Plan zaktualizowany'); } if (act === 'unfix') { ui.fix = null; render(); } }
  };

  /* ---------- TABLET ---------- */
  var WORKERS = { artur: ['Artur K.', 'AK', 1115], damian: ['Damian B.', 'DB', 1240], kacper: ['Kacper K.', 'KK', 980] };
  var PINS = { '1111': 'artur', '2222': 'damian', '3333': 'kacper' };
  var TASK = { 'Spawarka MIG': 'Spawanie ramy K3 witacza', 'Spawarka TIG': 'Spawanie ramy K3 (TIG)', 'Frezarka CNC': 'Frezowanie kaset K3', 'Prasa krawędziowa': 'Gięcie kaset K3', 'Szlifierka 2': 'Szlif ramy K3', 'Montaż': 'Montaż wstępny K3' };
  var tab = { screen: 'pin', pin: '', cur: null, back: false, done: null, rx: -18, ry: -32, spin: false };
  var sessions = store.get('sessions', null);
  if (!sessions) { sessions = { damian: { machine: 'Frezarka CNC', start: Date.now() - 84 * 60000, acc: 0, paused: false } }; store.set('sessions', sessions); }
  var coins = store.get('coins', { artur: 1115, damian: 1240, kacper: 980 });
  function saveSessions() { store.set('sessions', sessions); if (server) api('PUT', 'sessions', sessions).catch(function () {}); }
  function pullSessions() { api('GET', 'sessions').then(function (s) { sessions = s || {}; if (cur === 'tablet' && tab.screen === 'pin') render(); }).catch(function () {}); }
  function elapsed(s) { return !s ? 0 : s.paused ? (s.pausedAcc || 0) : (s.acc || 0) + (Date.now() - s.start); }

  function cuboid(cx, cy, cz, w, h, d, kind) {
    var pal = { main: ['rgba(227,0,111,', '#FF69B2'], hole: ['rgba(255,153,0,', '#FFB84D'], other: ['rgba(110,124,140,', '#9FB0C2'] }[kind];
    var F = [[w, h, 'rotateY(0deg) translateZ(' + d / 2 + 'px)', .55], [w, h, 'rotateY(180deg) translateZ(' + d / 2 + 'px)', .4], [d, h, 'rotateY(90deg) translateZ(' + w / 2 + 'px)', .45], [d, h, 'rotateY(-90deg) translateZ(' + w / 2 + 'px)', .45], [w, d, 'rotateX(90deg) translateZ(' + h / 2 + 'px)', .75], [w, d, 'rotateX(-90deg) translateZ(' + h / 2 + 'px)', .25]];
    return F.map(function (f) { return '<div class="face" style="width:' + f[0] + 'px;height:' + f[1] + 'px;background:' + pal[0] + f[3] + ');border-color:' + pal[1] + ';transform:translate3d(' + (cx - f[0] / 2) + 'px,' + (cy - f[1] / 2) + 'px,' + cz + 'px) ' + f[2] + '"></div>'; }).join('');
  }
  function modelHtml() {
    return cuboid(0, 150, 0, 300, 2, 220, 'other') + cuboid(-100, 60, 0, 16, 180, 16, 'other') + cuboid(100, 60, 0, 16, 180, 16, 'other') + cuboid(-100, 146, 0, 46, 6, 46, 'other') + cuboid(100, 146, 0, 46, 6, 46, 'other') + cuboid(0, 70, 0, 184, 10, 10, 'other') +
      cuboid(0, -72, 0, 250, 12, 28, 'main') + cuboid(0, -2, 0, 250, 12, 28, 'main') + cuboid(-119, -37, 0, 12, 58, 28, 'main') + cuboid(119, -37, 0, 12, 58, 28, 'main') + cuboid(-40, -37, 0, 8, 58, 20, 'main') + cuboid(40, -37, 0, 8, 58, 20, 'main') +
      cuboid(80, -2, 16, 14, 14, 6, 'hole') + cuboid(0, -37, -12, 226, 58, 2, 'other');
  }

  VIEWS.tablet = {
    title: 'Tablet produkcyjny', sub: 'HALA P2 · TABLET T-07',
    html: function () {
      if (tab.screen === 'pin') {
        var act = Object.keys(sessions);
        return '<div class="grid g2" style="align-items:start"><section class="grid"><div><span class="eyebrow">Zaloguj się</span><h1 style="font-size:28px;margin-top:4px">PIN albo karta QR</h1><p class="t-muted" style="margin:6px 0 0">Masz trwającą pracę? Zaloguj się – zobaczysz swoje zlecenie i zakończysz je jednym kliknięciem.</p></div>' +
          '<section class="card"><div class="eyebrow" style="margin-bottom:10px">Praca w toku na tym tablecie · ' + act.length + (server ? ' · synchronizacja z serwerem' : '') + '</div>' +
          (act.length ? act.map(function (id) { var s = sessions[id], w = WORKERS[id] || [id, '?']; return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0"><span style="width:40px;height:40px;border-radius:50%;background:var(--surface3);display:grid;place-items:center;font-weight:600;flex:none">' + w[1] + '</span><span style="flex:1;min-width:0"><b>' + w[0] + '</b><br><small class="t-muted">' + (TASK[s.machine] || '') + ' · ' + s.machine + '</small></span><span class="chip ' + (s.paused ? 'c-orange' : 'c-green') + ' num" data-clock="' + id + '" style="font-size:16px">' + fmt(elapsed(s)) + '</span></div>'; }).join('') : '<p class="t-dim" style="margin:0">Nikt nie ma teraz otwartej pracy.</p>') +
          '</section></section>' +
          '<section class="card grid" style="gap:14px"><div class="pin-dots" aria-label="Wpisane cyfry">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < tab.pin.length ? 'f' : '') + '"></i>'; }).join('') + '</div>' +
          '<div class="keys">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(function (k) { return '<button data-act="key" data-k="' + k + '" aria-label="' + (k === 'C' ? 'Wyczyść' : k === '⌫' ? 'Usuń cyfrę' : 'Cyfra ' + k) + '">' + k + '</button>'; }).join('') + '</div>' +
          '<button class="btn g full" data-act="qr">Skanuj kartę QR</button><small class="t-dim" style="text-align:center">Demo: 1111 Artur · 2222 Damian · 3333 Kacper</small></section></div>';
      }
      var w = WORKERS[tab.cur], first = w[0].split(' ')[0];
      if (tab.screen === 'mach') {
        var M = [['Spawarka MIG', '2169 · rama K3'], ['Spawarka TIG', '2161 · poprawki (wtorek)'], ['Szlifierka 2', '2129 · szlif kasetonów'], ['Frezarka CNC', '2169 · frezowanie kaset'], ['Prasa krawędziowa', '2169 · gięcie kaset'], ['Kabina lakiernicza', 'serwis do 12:00']];
        var busy = {}; Object.keys(sessions).forEach(function (id) { busy[sessions[id].machine] = WORKERS[id] ? WORKERS[id][0] : id; }); busy['Kabina lakiernicza'] = 'serwis';
        return '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h1 style="font-size:26px">Cześć ' + first + '! Na czym pracujesz?</h1><div style="display:flex;gap:8px;align-items:center"><span class="coinrow" style="padding:6px 14px 6px 6px"><img src="' + COIN + '" alt="" style="width:36px;height:36px"><b class="t-gold tab">' + coins[tab.cur].toLocaleString('pl-PL') + '</b></span><button class="btn" data-act="logout">Wyloguj</button></div></div>' +
          '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">' + M.map(function (m) { var b = busy[m[0]]; return '<button class="mach" data-act="mach" data-m="' + m[0] + '"' + (b ? ' disabled' : '') + '><span class="chip ' + (b ? 'c-orange' : 'c-green') + '">' + (b ? (b === 'serwis' ? 'serwis' : 'zajęta – ' + b) : 'wolna') + '</span><b>' + m[0] + '</b><small class="t-muted">' + m[1] + '</small></button>'; }).join('') + '</div>' +
          '<section class="card"><div class="eyebrow" style="margin-bottom:10px">Twoja kolejka z planu produkcji</div><div class="list"><div class="row"><span><b class="num">2169</b> rama K3 witacza</span><span class="chip c-pink">teraz · 15 h</span></div><div class="row"><span><b class="num">2161</b> poprawki</span><span class="t-dim">wtorek · 3 h</span></div><div class="row"><span><b class="num">2129</b> ramki kasetonów</span><span class="t-dim">środa · 4 h</span></div></div></section>';
      }
      if (tab.screen === 'done') {
        var d = tab.done;
        return '<section style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;padding-top:10px"><img src="' + COIN_BIG + '" alt="Grafficoin" style="width:min(220px,55vw);height:auto"><h1 style="font-size:32px">+25 Grafficoinów, ' + d.first + '!</h1><p class="t-muted" style="margin:0;max-width:46ch">Zapisano ' + d.clock + ' · ' + d.machine + ' · zlecenie 2169. Etap zamknięty, zostałeś wylogowany.</p><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><span class="chip">Terminowość 92%</span><span class="chip">Frekwencja 100% ★</span><span class="chip">Saldo ' + coins[d.id].toLocaleString('pl-PL') + '</span></div><button class="btn p" data-act="tomenu">Gotowe – ekran logowania (<span data-count>8</span> s)</button></section>';
      }
      var s = sessions[tab.cur];
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div style="display:flex;gap:12px;align-items:center;min-width:0"><span class="num t-pink" style="font-size:44px;line-height:1">2169</span><div style="min-width:0"><h1 style="font-size:20px">' + TASK[s.machine] + '</h1><small class="t-muted">' + s.machine + ' · ' + w[0] + '</small></div></div><span class="chip ' + (s.paused ? 'c-orange' : 'c-green') + '" style="font-size:14px;padding:6px 14px">' + (s.paused ? 'Przerwa' : 'Praca trwa') + '</span></div>' +
        '<button class="btn full" data-act="tomenu" style="border-color:rgba(255,105,178,.55)">' + I.home + 'Menu główne · praca trwa dalej</button>' +
        (tab.back ? '<div class="alert a-green">Witaj ponownie, ' + first + '. Twoja praca trwa – „Koniec pracy” zamknie ją i wyloguje Cię.</div>' : '') +
        '<div class="grid g2" style="align-items:start"><section class="card grid" style="gap:10px;padding:12px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><small class="t-muted">Model 3D – przeciągnij, aby obrócić</small><span class="chip c-green">rys. v4</span></div>' +
        '<div class="stage3d" id="stage"><div class="scene" id="scene">' + modelHtml() + '</div><div class="legend"><span><i style="background:#E3006F"></i>Rama K3 – Twój detal</span><span><i style="background:#FF9900"></i>Otwór +40 mm (v4)</span><span><i style="background:#6E7C8C"></i>Reszta witacza</span></div>' +
        '<div class="rots"><button data-act="rot" data-x="-30" aria-label="W lewo">⟲</button><button data-act="rot" data-x="30" aria-label="W prawo">⟳</button><button data-act="rot" data-y="-15" aria-label="W górę">↑</button><button data-act="rot" data-y="15" aria-label="W dół">↓</button><button data-act="spin" aria-pressed="' + tab.spin + '" style="font-size:13px">Auto</button></div></div>' +
        '<div style="display:flex;gap:8px"><button class="btn" style="flex:1" data-act="draw">Rysunek 2D</button><button class="btn g" style="flex:1" data-act="aihelp">Zapytaj AI</button></div></section>' +
        '<section class="grid"><div class="card"><small class="t-muted">Czas tej pracy</small><div class="clock" data-clock="' + tab.cur + '">' + fmt(elapsed(s)) + '</div><div style="display:flex;justify-content:space-between;font-size:14px;margin-top:6px"><span class="t-muted">Budżet: 15 h</span><span class="t-green" data-left>zostało –</span></div><div class="bar" style="margin-top:6px"><i data-used style="width:40%"></i></div></div>' +
        '<div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))"><button class="btn o" data-act="pause">' + (s.paused ? 'Wznów' : 'Przerwa') + '</button><button class="btn" data-act="montaz">Montaż</button><button class="btn p" data-act="finish">Koniec pracy</button></div>' +
        '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button class="btn g" data-act="qc">' + I.shield + 'Kontrola jakości</button><button class="btn r" data-act="issue">' + I.warn + 'Zgłoś problem</button></div>' +
        '<div class="coinrow"><img src="' + COIN + '" alt=""><span>Za ten etap w budżecie czasu: <b>+25 Grafficoinów</b>. Masz ' + coins[tab.cur].toLocaleString('pl-PL') + '.</span></div></section></div>';
    },
    mount: function () {
      var scene = $('#scene'), stage = $('#stage');
      if (scene) {
        var apply = function () { scene.style.transform = 'scale(' + (stage.clientWidth < 420 ? .82 : 1) + ') rotateX(' + tab.rx + 'deg) rotateY(' + tab.ry + 'deg)'; };
        apply();
        var drag = null;
        stage.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; drag = [e.clientX, e.clientY, tab.rx, tab.ry]; tab.spin = false; try { stage.setPointerCapture(e.pointerId); } catch (x) {} });
        stage.addEventListener('pointermove', function (e) { if (!drag) return; tab.ry = drag[3] + (e.clientX - drag[0]) * .5; tab.rx = Math.max(-80, Math.min(30, drag[2] - (e.clientY - drag[1]) * .4)); apply(); });
        var end = function () { drag = null; };
        stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
        VIEWS.tablet.apply = apply;
        var spin = function () { if (cur !== 'tablet' || !$('#scene')) return; if (tab.spin) { tab.ry += .6; apply(); } requestAnimationFrame(spin); };
        requestAnimationFrame(spin);
      }
    },
    tick: function () {
      $$('[data-clock]').forEach(function (el) { var s = sessions[el.dataset.clock]; if (s) el.textContent = fmt(elapsed(s)); });
      var s = sessions[tab.cur];
      if (s && $('[data-left]')) { var used = 6 + elapsed(s) / 3600000, lm = Math.max(0, Math.round((15 - used) * 60)); $('[data-left]').textContent = 'zostało ' + Math.floor(lm / 60) + ' h ' + pad(lm % 60) + ' min'; $('[data-used]').style.width = Math.min(100, used / 15 * 100) + '%'; }
      if (tab.screen === 'done') { var left = 8 - Math.floor((Date.now() - tab.done.at) / 1000); var c = $('[data-count]'); if (c) c.textContent = Math.max(0, left); if (left <= 0) { tab.screen = 'pin'; render(); } }
    },
    on: function (act, el) {
      var login = function (id) { tab.cur = id; tab.pin = ''; tab.back = !!sessions[id]; tab.screen = sessions[id] ? 'work' : 'mach'; render(); };
      if (act === 'key') { var k = el.dataset.k; if (k === 'C') tab.pin = ''; else if (k === '⌫') tab.pin = tab.pin.slice(0, -1); else { tab.pin += k; if (tab.pin.length === 4) return login(PINS[tab.pin] || 'artur'); } render(); }
      if (act === 'qr') login('artur');
      if (act === 'logout' || act === 'tomenu') { tab.screen = 'pin'; tab.cur = null; tab.pin = ''; tab.back = false; render(); }
      if (act === 'mach') { sessions[tab.cur] = { machine: el.dataset.m, start: Date.now(), acc: 0, paused: false }; saveSessions(); tab.screen = 'work'; tab.back = false; render(); }
      var s = sessions[tab.cur];
      if (act === 'pause' && s) { if (s.paused) { s.acc = s.pausedAcc || 0; s.start = Date.now(); s.paused = false; } else { s.pausedAcc = elapsed(s); s.paused = true; } saveSessions(); render(); }
      if (act === 'montaz' && s) { s.machine = 'Montaż'; saveSessions(); render(); }
      if (act === 'finish' && s) { coins[tab.cur] += 25; store.set('coins', coins); tab.done = { id: tab.cur, first: WORKERS[tab.cur][0].split(' ')[0], clock: fmt(elapsed(s)), machine: s.machine, at: Date.now() }; delete sessions[tab.cur]; saveSessions(); tab.cur = null; tab.screen = 'done'; render(); }
      if (act === 'rot') { tab.ry += +(el.dataset.x || 0); tab.rx = Math.max(-80, Math.min(30, tab.rx + +(el.dataset.y || 0))); VIEWS.tablet.apply && VIEWS.tablet.apply(); }
      if (act === 'spin') { tab.spin = !tab.spin; el.setAttribute('aria-pressed', tab.spin); }
      if (act === 'qc') openSheet('<div class="grab"></div><h2>Kontrola jakości – ten etap</h2><p class="t-muted" style="margin:0">Odhacz każdy punkt. Zdjęcie jest wymagane.</p><div class="list">' + ['Wymiary zgodne z rysunkiem v4', 'Spoiny ciągłe, bez porów', 'Otwór w nowym miejscu (+40 mm)', 'Zdjęcie wykonane'].map(function (t, i) { return '<button class="check' + (i === 0 ? ' on' : '') + '" data-act="toggle"><span class="box">' + (i === 0 ? '✓' : '') + '</span><span class="lbl">' + t + '</span></button>'; }).join('') + '</div><button class="btn full" data-act="close">Anuluj</button><button class="btn p full" data-act="okqc">Zatwierdź i podpisz</button>');
      if (act === 'issue') openSheet(issueSheet('Powiadomimy: technologa zlecenia, kierownika P2 i PM.', 'Otwór w ramie K3 nie pasuje do wspornika – różnica ok. 40 mm.', ['Błąd w rysunku', 'Brak materiału', 'Awaria maszyny']));
      if (act === 'aihelp') openSheet('<div class="grab"></div><h2>Instrukcja stanowiskowa</h2><div style="align-self:flex-end;max-width:85%;padding:10px 14px;border-radius:14px 14px 4px 14px;background:rgba(227,0,111,.2)">Jakim drutem spawam ramę K3?</div><div class="alert a-green">Wg technologii 2169: drut SG2 Ø1,0 mm, gaz M21, 140–160 A. Spoiny pachwinowe a=3. Po spawaniu szlif – rama idzie do lakieru na wysoki połysk.</div><button class="btn full" data-act="close">Zamknij</button>');
      if (act === 'draw') openSheet('<div class="grab"></div><h2>Rysunek · rama K3 · v4</h2><div class="scroll-x"><svg viewBox="0 0 600 300" style="width:100%;min-width:480px;background:#F3F1EC;border-radius:12px" role="img" aria-label="Rysunek wykonawczy ramy K3"><defs><pattern id="gp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(30,60,120,.1)"/></pattern></defs><rect width="600" height="300" fill="url(#gp)"/><rect x="70" y="70" width="460" height="180" fill="none" stroke="#1B2A44" stroke-width="3"/><rect x="86" y="86" width="428" height="148" fill="none" stroke="#1B2A44" stroke-width="1.5"/><line x1="70" y1="45" x2="530" y2="45" stroke="#1B2A44"/><text x="300" y="38" text-anchor="middle" font-size="14" fill="#1B2A44">2400</text><line x1="45" y1="70" x2="45" y2="250" stroke="#1B2A44"/><text x="38" y="164" text-anchor="end" font-size="14" fill="#1B2A44">1000</text><circle cx="440" cy="234" r="11" fill="none" stroke="#C4471A" stroke-width="3"/><text x="440" y="275" text-anchor="middle" font-size="13" fill="#C4471A" font-weight="600">Ø22 · +40 mm (v4)</text></svg></div><button class="btn full" data-act="close">Zamknij</button>');
    }
  };
  function issueSheet(who, text, kinds) {
    return '<div class="grab"></div><h2>Zgłoś nieprawidłowość</h2><div style="display:flex;gap:6px;flex-wrap:wrap">' + kinds.map(function (k, i) { return '<button class="btn" style="min-height:40px;font-size:13px' + (i === 0 ? ';border-color:#FF7A7A' : '') + '">' + k + '</button>'; }).join('') + '</div>' +
      '<label class="photo" id="issuePhoto">' + I.cam + '<span>Zrób zdjęcie (wymagane)</span><input type="file" accept="image/*" capture="environment" data-photo="issue"></label>' +
      '<label for="issueTxt" class="t-muted" style="font-size:13px">Opis</label><textarea id="issueTxt" class="in" rows="3">' + text + '</textarea><small class="t-dim">' + who + '</small>' +
      '<button class="btn full" data-act="close">Anuluj</button><button class="btn full" style="background:var(--red);color:#1A0505;border-color:transparent" data-act="sendissue">Wyślij zgłoszenie</button>';
  }

  /* ---------- MONTER ---------- */
  var JOBS = [
    { nr: '2167', title: 'Witacze 5 szt. – Toruń', addr: 'Wjazdy do miasta, 5 lokalizacji', time: '07:00', city: 'Toruń – witacze', km: '12 km', drive: '25 min', depart: '06:30', tags: ['podnośnik', 'fundamenty gotowe'], x: 336, y: 240, route: '317,223 336,240' },
    { nr: '2167', title: 'Witacze – dokończenie', addr: 'ul. Szosa Chełmińska, Toruń', time: '07:30', city: 'Toruń – witacze', km: '8 km', drive: '15 min', depart: '07:10', tags: ['2 szt.', 'zdjęcia wymagane'], x: 336, y: 240, route: '317,223 336,240' },
    { nr: '2140', title: 'Serwis kasetonu', addr: 'Galeria, Bydgoszcz', time: '09:00', city: 'Bydgoszcz', km: '48 km', drive: '50 min', depart: '08:00', tags: ['serwis', 'LED'], x: 278, y: 210, route: '317,223 298,214 278,210', end: true },
    { nr: '2155', title: 'Pylon cenowy 6 m – AMIC', addr: 'ul. Włókniarzy 69, Łódź', time: '08:00', city: 'Łódź · AMIC', km: '178 km', drive: '2 h 05 min (A1)', depart: '05:40', tags: ['dźwig 25 t', 'praca na wysokości'], x: 375, y: 362, route: '317,223 333,240 348,264 360,288 368,310 378,330 385,347 375,362' },
    { nr: '2155', title: 'Pylon – uruchomienie LED', addr: 'ul. Włókniarzy 69, Łódź', time: '07:00', city: 'Łódź · AMIC', km: '3 km z hotelu', drive: '10 min', depart: '06:45', tags: ['elektryk', 'protokół odbioru'], x: 375, y: 362, route: '375,362' }
  ];
  var STEPS = [
    ['Sprawdź fundament i kotwy', ['Rozstaw kotew zgodny z rysunkiem (4 × M24)', 'Poziom fundamentu – maks. 3 mm odchyłki', 'Teren wygrodzony taśmą']],
    ['Rozładunek i kontrola elementów', ['Porównaj elementy z listą wysyłkową', 'Sprawdź powłokę – rysy, wgniecenia', 'Uszkodzenie? Zgłoś od razu ze zdjęciem']],
    ['Ustaw konstrukcję dźwigiem', ['Operator z ważnym UDT', 'Pion w dwóch osiach', 'Dokręć nakrętki momentem 350 Nm']],
    ['Zamontuj kaseton z logo', ['Szelki i praca w parze – wysokość 5,5 m', 'Kaseton wsuń w prowadnice od góry', 'Przykręć 8 śrub nierdzewnych'], 'Sprawdź orientację logo AMIC z wizualizacją, zanim przykręcisz.'],
    ['Wyświetlacze cen i elektryka', ['Kolejność od góry: PB95, ON, LPG', 'Zasilanie 230 V z rozdzielni stacji', 'Test komunikacji z kasą stacji']],
    ['Test świecenia i porządek', ['Wszystkie moduły LED świecą', 'Ceny wyświetlone poprawnie', 'Teren posprzątany, odpady zabrane']]
  ];
  var mt = { screen: 'plan', day: 3, step: 0, photos: {} };
  function teamsSvg() {
    return '<polyline points="317,223 333,240 348,264 360,288 368,310 378,330 385,347 375,362" fill="none" stroke="#88FF58" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round"/>' + baseMark() +
      dot(375, 362, '#88FF58', 'A · Łódź 2155', 395, 372) + dot(321, 74, '#FF69B2', 'B · Gdańsk', 340, 82) + dot(345, 528, '#FF9900', 'C · Katowice · usterka', 365, 536) + dot(480, 308, '#88FF58', 'D · Warszawa', 500, 316);
  }
  function baseMark() { return '<rect x="305" y="211" width="24" height="24" rx="6" fill="#fff" stroke="#0E0D0C" stroke-width="3"/><text x="298" y="214" fill="#fff" font-size="22" font-family="Outfit,sans-serif" font-weight="600" text-anchor="end">Baza Toruń</text>'; }
  function dot(x, y, c, t, tx, ty, anchor) { return '<circle cx="' + x + '" cy="' + y + '" r="12" fill="' + c + '" stroke="#0E0D0C" stroke-width="4"/><text x="' + tx + '" y="' + ty + '" fill="#fff" font-size="24" font-family="Outfit,sans-serif" text-anchor="' + (anchor || 'start') + '">' + t + '</text>'; }
  function mapHtml(svg, foot) { return '<div class="map"><img src="' + MAP + '" alt="Mapa Polski z drogami i rzekami"><svg viewBox="0 0 720 680" aria-hidden="true">' + svg + '</svg>' + (foot ? '<div class="foot">' + foot + '</div>' : '') + '</div>'; }

  VIEWS.monter = {
    title: 'Aplikacja montażysty', sub: 'EKIPA A · PAWEŁ, ŁUKASZ, TOMEK',
    html: function () {
      var j = JOBS[mt.day];
      if (mt.screen === 'plan') {
        var D = [['Pn', '26'], ['Wt', '27'], ['Śr', '28'], ['Czw', '29'], ['Pt', '30']];
        var svg = '<polyline points="' + j.route + '" fill="none" stroke="#FF69B2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 13"/>' + baseMark() +
          '<circle cx="' + j.x + '" cy="' + j.y + '" r="26" fill="rgba(136,255,88,.22)"/>' + dot(j.x, j.y, '#88FF58', j.city, j.end ? j.x - 18 : j.x + 20, j.end ? j.y - 22 : j.y + 34, j.end ? 'end' : 'start');
        return '<div class="alert a-orange">Zmiana od 06:10: montaż 2155 przesunięty przez klienta na czwartek 29.10, 8:00.</div>' +
          '<div class="days" role="group" aria-label="Dzień tygodnia">' + D.map(function (d, i) { return '<button data-act="day" data-i="' + i + '" aria-pressed="' + (mt.day === i) + '">' + d[0] + '<b>' + d[1] + '</b></button>'; }).join('') + '</div>' +
          '<div class="grid g2" style="align-items:start">' + mapHtml(svg, '<span><b>' + j.km + '</b> · ' + j.drive + '</span><span class="t-green">wyjazd ' + j.depart + '</span>') +
          '<div class="grid"><button class="lead" data-act="job" style="padding:16px"><span style="display:flex;justify-content:space-between;align-items:center"><span class="num t-pink" style="font-size:28px">' + j.nr + '</span><span class="chip c-green">' + j.time + '</span></span><b style="display:block;font-size:17px;margin-top:4px">' + j.title + '</b><small class="t-muted">' + j.addr + '</small><span style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">' + j.tags.map(function (t) { return '<span class="chip">' + t + '</span>'; }).join('') + '</span></button>' +
          '<section class="card" style="font-size:14px;color:var(--muted)">Nocleg: Hotel Ambasador, Łódź (z bazy hoteli) · Auto: Iveco, przegląd do 03.2027 · Podnośnik: UDT ważne</section></div></div>';
      }
      if (mt.screen === 'job') {
        return '<button class="btn" data-act="mplan" style="align-self:flex-start">‹ Plan tygodnia</button><div class="grid g2" style="align-items:start"><div class="pylon" role="img" aria-label="Wizualizacja końcowa pylonu AMIC"><div class="p"><div class="lg">AMIC</div><div class="pr" style="color:#FF9900">6.29</div><div class="pr" style="color:#FF9900">6.89</div><div class="pr" style="color:#88FF58">3.19</div></div><span class="chip" style="position:absolute;left:12px;top:12px;background:rgba(0,0,0,.5)">Wizualizacja końcowa · zaakceptowana</span></div>' +
          '<div class="grid"><div><span class="num t-pink" style="font-size:36px">2155</span><h1 style="font-size:22px">Pylon cenowy 6 m – montaż i uruchomienie</h1></div><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));font-size:14px">' + [['Adres', 'ul. Włókniarzy 69, Łódź'], ['Kontakt', 'Kierownik stacji'], ['Dokumentacja', 'Rysunek v3 · 6 kroków'], ['Czas planowany', '2 dni · 3 osoby']].map(function (p) { return '<div class="card" style="padding:12px"><small class="t-dim">' + p[0] + '</small><div>' + p[1] + '</div></div>'; }).join('') + '</div>' +
          '<button class="btn p full" data-act="start">Rozpocznij montaż krok po kroku</button><button class="btn full" data-act="missue">Zgłoś usterkę / problem</button></div></div>';
      }
      if (mt.screen === 'step') {
        var st = STEPS[mt.step], ph = mt.photos[mt.step];
        return '<div style="display:flex;justify-content:space-between;align-items:center"><button class="btn" data-act="job">‹ 2155</button><span class="t-muted">Krok ' + (mt.step + 1) + ' z ' + STEPS.length + '</span></div><div class="prog">' + STEPS.map(function (_, i) { return '<i class="' + (i < mt.step ? 'd' : i === mt.step ? 'c' : '') + '"></i>'; }).join('') + '</div>' +
          '<h1 style="font-size:24px">' + st[0] + '</h1><div class="grid g2" style="align-items:start"><div class="card" style="height:190px;display:grid;place-items:center;position:relative;' + (ph ? 'background:url(' + ph + ') center/cover' : '') + '">' + (ph ? '' : '<span class="num" style="font-size:96px;color:rgba(255,105,178,.25)">' + (mt.step + 1) + '</span>') + '<span class="chip" style="position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,.55)">' + (ph ? 'Twoje zdjęcie etapu' : 'Ilustracja z instrukcji') + '</span></div>' +
          '<div class="grid"><ul style="margin:0;padding-left:20px;display:grid;gap:6px">' + st[1].map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' + (st[2] ? '<div class="alert a-orange">' + st[2] + '</div>' : '') +
          '<label class="photo' + (ph ? ' ok' : '') + '">' + I.cam + '<span>' + (ph ? '✓ Zdjęcie dodane – zmień' : 'Zrób zdjęcie etapu (wymagane)') + '</span><input type="file" accept="image/*" capture="environment" data-photo="step"></label>' +
          '<button class="btn p full" data-act="next"' + (ph ? '' : ' disabled') + '>' + (mt.step === STEPS.length - 1 ? 'Potwierdź i przejdź do odbioru' : 'Potwierdź krok i dalej') + '</button>' +
          (ph ? '' : '<button class="btn full" data-act="demophoto" style="min-height:40px;font-size:13px">Demo: użyj przykładowego zdjęcia</button>') + '</div></div>';
      }
      if (mt.screen === 'done') {
        var ps = Object.keys(mt.photos).map(function (k) { return mt.photos[k]; });
        return '<h1 style="font-size:24px">Protokół odbioru · 2155</h1><div class="alert a-green">Wszystkie ' + STEPS.length + ' kroki potwierdzone · ' + ps.length + ' zdjęć · czas montażu 11 h 40 min</div>' +
          '<div class="thumbs">' + ps.slice(0, 6).map(function (p) { return '<div style="background-image:url(' + p + ')"></div>'; }).join('') + '</div>' +
          '<label for="uwagi" class="t-muted" style="font-size:13px">Uwagi klienta</label><input id="uwagi" class="in" value="Bez uwag">' +
          '<div style="display:flex;justify-content:space-between;align-items:center"><span class="t-muted" style="font-size:13px">Podpis klienta (palcem)</span><button class="btn" style="min-height:36px;font-size:13px" data-act="clearsig">Wyczyść</button></div><canvas class="sig" id="sig" aria-label="Pole podpisu"></canvas>' +
          '<button class="btn p full" data-act="sendprot">Wyślij protokół i zakończ</button><small class="t-dim" style="text-align:center">Księgowość dostanie sygnał: można wystawić fakturę III.</small>';
      }
      return '';
    },
    mount: function () {
      var c = $('#sig'); if (!c) return;
      var r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; c.width = r.width * dpr; c.height = r.height * dpr;
      var g = c.getContext('2d'); g.scale(dpr, dpr); g.lineWidth = 2.6; g.lineCap = 'round'; g.strokeStyle = '#141211';
      var on = false, last = null;
      var p = function (e) { var b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
      c.addEventListener('pointerdown', function (e) { on = true; last = p(e); mt.signed = true; try { c.setPointerCapture(e.pointerId); } catch (x) {} });
      c.addEventListener('pointermove', function (e) { if (!on) return; var q = p(e); g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(q[0], q[1]); g.stroke(); last = q; });
      c.addEventListener('pointerup', function () { on = false; });
    },
    on: function (act, el) {
      if (act === 'day') { mt.day = +el.dataset.i; render(); }
      if (act === 'job') { mt.day = 3; mt.screen = 'job'; render(); }
      if (act === 'mplan') { mt.screen = 'plan'; render(); }
      if (act === 'start') { mt.screen = 'step'; mt.step = 0; mt.photos = {}; render(); }
      if (act === 'next' && mt.photos[mt.step]) { if (mt.step === STEPS.length - 1) mt.screen = 'done'; else mt.step++; render(); }
      if (act === 'demophoto') { mt.photos[mt.step] = demoPhoto(mt.step); render(); }
      if (act === 'missue') openSheet(issueSheet('Trafi do: PM zlecenia, kierownika produkcji i magazynu.', 'Pęknięta szyba wyświetlacza ceny ON po transporcie.', ['Uszkodzone', 'Brak elementu', 'Niezgodne z rysunkiem']));
      if (act === 'clearsig') { var c = $('#sig'); c.getContext('2d').clearRect(0, 0, c.width, c.height); mt.signed = false; }
      if (act === 'sendprot') {
        if (!mt.signed) return toast('Poproś klienta o podpis w polu powyżej');
        var note = ($('#uwagi') || {}).value || 'Bez uwag';
        var srcs = Object.keys(mt.photos).map(function (k) { return mt.photos[k]; });
        Promise.all(srcs.map(thumb)).then(function (th) {
          closeOrder(th, note);
          mt.screen = 'plan'; mt.signed = false; ui.otab = 4;
          go('zlecenie');
          toast('Protokół wysłany – zobacz, co zrobił system');
        });
      }
    },
    photo: function (kind, url) { if (kind === 'step') { mt.photos[mt.step] = url; render(); } }
  };
  function thumb(src) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () { var c = document.createElement('canvas'), s = 220 / Math.max(img.width, img.height); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .7)); };
      img.onerror = function () { res(src); };
      img.src = src;
    });
  }
  function demoPhoto(i) {
    var c = document.createElement('canvas'); c.width = 480; c.height = 320; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, '#7FA6C9'); gr.addColorStop(.7, '#C9D6E2'); gr.addColorStop(.7, '#55524E'); gr.addColorStop(1, '#3B3936'); g.fillStyle = gr; g.fillRect(0, 0, 480, 320);
    g.fillStyle = '#2A2725'; g.fillRect(212, 70, 56, 160); g.fillStyle = '#E3006F'; g.fillRect(200, 60 + i * 2, 80, 46);
    g.fillStyle = '#111'; [118, 146, 174].forEach(function (y, k) { g.fillRect(208, y, 64, 20); g.fillStyle = k === 2 ? '#88FF58' : '#FF9900'; g.font = 'bold 16px sans-serif'; g.fillText(['6.29', '6.89', '3.19'][k], 222, y + 16); g.fillStyle = '#111'; });
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 286, 480, 34); g.fillStyle = '#fff'; g.font = '14px sans-serif'; g.fillText('2155 · krok ' + (i + 1) + ' · 29.10.2026 ' + pad(8 + i) + ':' + pad(10 * i % 60) + ' · GPS 51.76, 19.46', 10, 308);
    return c.toDataURL('image/jpeg', .8);
  }

  VIEWS.hala = {
    title: 'Monitor hali P2', sub: 'SPAWALNIA / SZLIF · ZMIANA I',
    html: function () {
      var job = function (nr, t, pct, right, hot, col) { return '<div class="tvjob' + (hot ? ' hot' : '') + '"><span class="num' + (hot ? ' t-pink' : '') + '">' + nr + '</span><span style="flex:1;min-width:0"><b style="display:block">' + t + '</b><span class="bar" style="display:block;margin-top:8px"><i style="width:' + pct + '%;' + (col ? 'background:' + col : '') + '"></i></span></span><span style="text-align:right">' + right + '</span></div>'; };
      var coinRow = function (n, name, c, st) { return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0"><span>' + n + '. ' + name + '</span><span class="t-gold tab" style="display:flex;align-items:center;gap:6px"><img src="' + COIN + '" alt="" style="width:26px;height:26px">' + c + ' · ' + st + '</span></div>'; };
      return '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap"><div><span class="eyebrow">Obecni 18 z 19 · plan dnia 144 h</span><h1 style="font-size:28px">Wykonanie planu dnia: <span class="t-green">64%</span></h1></div><span class="num" style="font-size:52px;line-height:1" id="tvclock">--:--</span></div>' +
        '<div class="tv"><section class="card grid"><span class="eyebrow">Priorytety · teraz</span>' + job('2161', 'Spawanie liter 3D · Artur K.', 100, '<small class="t-red">przekroczone</small><br><b class="t-red">+7,5 h</b>', true, 'var(--red)') + job('2169', 'Konstrukcja witacza · Marek P.', 40, '<small class="t-dim">zostało</small><br><b>9 h</b>') + job('2129', 'Szlif kasetonów · Zbigniew C.', 78, '<small class="t-dim">zostało</small><br><b>2,5 h</b>') + job('2155', 'Pakowanie pylonu · Stanisław O.', 10, '<small class="t-dim">start</small><br><b>13:00</b>', false, 'var(--green)') + '</section>' +
        '<section class="grid" style="align-content:start"><div class="card" style="border-color:rgba(255,153,0,.45)"><span class="eyebrow t-orange">Uwaga – zlecenie 2169</span><p style="margin:8px 0 0;font-size:17px">Rysunek konstrukcji zmieniony na <b>v4</b> (09:15). Otwór montażowy przesunięty o 40 mm. Pracuj tylko z v4 na tablecie.</p></div>' +
        '<div class="card"><span class="eyebrow">Po terminie</span><div class="list" style="margin-top:6px"><div class="row" style="font-size:16px"><span><b class="num">2129</b> Trefl · kasetony</span><span class="chip c-red">3 dni</span></div><div class="row" style="font-size:16px"><span><b class="num">2152</b> EFL · tablice</span><span class="chip c-red">1 dzień</span></div></div></div></section>' +
        '<section class="card"><span class="eyebrow">Ranking · październik</span><div style="display:flex;align-items:center;gap:12px;padding:12px;margin:10px 0;border-radius:14px;background:rgba(242,210,122,.08);border:1px solid rgba(242,210,122,.35)"><img src="' + COIN_BIG + '" alt="Grafficoin" style="width:64px;height:64px"><div><b style="font-size:20px">Damian B.</b><div class="t-gold">' + coins.damian.toLocaleString('pl-PL') + ' Grafficoinów · ★★★</div></div></div>' +
        coinRow(2, 'Artur K.', coins.artur.toLocaleString('pl-PL'), '★★') + coinRow(3, 'Kacper K.', coins.kacper.toLocaleString('pl-PL'), '★★') + coinRow(4, 'Zbigniew C.', '905', '★') + coinRow(5, 'Marek P.', '870', '★') + '<small class="t-dim">★ terminowość · ★ frekwencja 100% · ★ nadgodziny i soboty</small></section></div>' +
        '<div class="ticker"><span class="chip" style="background:var(--magenta);color:#fff">KOMUNIKAT</span><span>13:30 odprawa przy malarni · Dostawa profili 80×80 jutro 7:00 · Zdjęcie po każdym etapie w tablecie</span></div>';
    },
    tick: function () { var d = new Date(), el = $('#tvclock'); if (el) el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  };

  /* ---------- PRACOWNICY (dane z ekranu „Pracownicy” starego systemu) ---------- */
  // [nr, imię i inicjał, stanowisko, hale, stawka zł/h, dzień wypłaty, pracuje od]
  // hale: S = [BR] Produkcja Stara, G = Hala Góra, D = Hala Dół, M = Montażyści, A = Administracja
  var EMP = [
    [1, 'Bartosz B.', 'niezdefiniowane', 'D', 15, 10, ''], [2, 'Marek M.', 'niezdefiniowane', 'S', 15, 10, ''],
    [93, 'Mariusz W.', 'montażysta brygadzista', 'M', 15, 1, '2018-03-01'], [149, 'Damian Bo.', 'pracownik produkcji', 'S', 15, 10, '2019-05-13'],
    [58, 'Przemysław L.', 'pracownik produkcji', 'S', 15, 10, '2017-09-02'], [89, 'Jarosław B.', 'pracownik produkcji', 'G', 15, 10, '2018-01-25'],
    [168, 'Zbigniew Ch.', 'pracownik produkcji', 'D', 20, 10, '2019-12-03'], [106, 'Adam N.', 'pracownik produkcji', 'G', 15, 10, '2018-12-01'],
    [62, 'Wiesława K.', 'sprzątaczka', 'S', 14, 10, '2017-09-09'], [6, 'Dariusz P.', 'montażysta brygadzista', 'M', 15, 1, ''],
    [94, 'Zbigniew Ś.', 'pracownik produkcji', 'G', 15, 10, '2018-05-10'], [8, 'Tomasz R.', 'niezdefiniowane', 'AS', 15, 10, ''],
    [144, 'Agnieszka Gr.', 'pracownik produkcji', 'G', 15, 10, '2019-05-13'], [113, 'Wojciech T.', 'pracownik produkcji', 'G', 15, 10, '2018-12-14'],
    [90, 'Oleksandr H.', 'ślusarz', 'D', 15, 10, '2018-02-26'], [136, 'Tadeusz J.', 'pracownik produkcji', 'G', 15, 10, '2019-03-11'],
    [9, 'Krzysztof So.', 'montażysta', 'GM', 15, 1, ''], [112, 'Stanisław Os.', 'montażysta', 'M', 15, 1, '2018-12-14'],
    [68, 'Marek P.', 'pracownik produkcji', 'S', 15, 10, '2017-10-24'], [151, 'Kacper Ka.', 'pracownik produkcji', 'S', 15, 10, '2019-05-13'],
    [117, 'Paweł Z.', 'pracownik produkcji', 'D', 15, 10, '2018-12-20'], [139, 'Artur K.', 'pracownik produkcji', 'S', 15, 10, '2019-03-11'],
    [10, 'Dawid M.', 'niezdefiniowane', 'D', 15, 10, ''], [123, 'Krystian L.', 'montażysta', 'M', 15, 1, '2019-02-12'],
    [140, 'Michał D.', 'montażysta', 'M', 15, 1, '2019-03-19'], [88, 'Zbigniew W.', 'montażysta', 'M', 15, 1, '2018-01-17']
  ];
  var HALL = { S: '[BR] Produkcja Stara', G: 'Hala Góra', D: 'Hala Dół', M: 'Montażyści', A: 'Administracja' };
  var SKILLS = ['Spawanie MIG/MAG', 'Spawanie TIG', 'Obsługa CNC', 'Gilotyna / prasa', 'Szlifowanie', 'Malowanie', 'Elektryka LED', 'Składanie', 'Praca na wysokości', 'Podnośnik / UDT', 'Wózek widłowy', 'Prawo jazdy C'];
  var customSkills = store.get('skills', []); customSkills.forEach(function (k) { if (SKILLS.indexOf(k) < 0) SKILLS.push(k); });
  var TYPES = { bad: 'Badania lekarskie', szk: 'Szkolenia', upr: 'Uprawnienia' };
  var PRESETS = {
    bad: ['Badania okresowe (medycyna pracy)', 'Badania do pracy na wysokości powyżej 3 m', 'Badania kierowcy (art. 39j ustawy o transporcie)', 'Badania kontrolne po L4 (powyżej 30 dni)'],
    szk: ['Szkolenie okresowe BHP – stanowiska robotnicze', 'Szkolenie wstępne BHP (instruktaż ogólny i stanowiskowy)', 'Pierwsza pomoc przedmedyczna', 'Szkolenie przeciwpożarowe', 'Bezpieczna praca na wysokości – szkolenie praktyczne'],
    upr: ['Praca na wysokości (szelki, linie asekuracyjne)', 'UDT – podesty ruchome przejezdne (IP)', 'UDT – żurawie przenośne / HDS', 'UDT – wózki jezdniowe podnośnikowe', 'SEP E – eksploatacja do 1 kV', 'SEP D – dozór do 1 kV', 'Spawacz MAG 135 (PN-EN ISO 9606-1)', 'Spawacz TIG 141 (PN-EN ISO 9606-1)', 'Prawo jazdy kat. C + kwalifikacja wstępna']
  };
  var SIZES = [['kurtka', 'Kurtka / bluza', ['S', 'M', 'L', 'XL', '2XL', '3XL']], ['spodnie', 'Spodnie (rozmiar)', ['46', '48', '50', '52', '54', '56', '58', '60']], ['wzrost', 'Wzrost (cm)', ['164', '170', '176', '182', '188', '194']], ['koszulka', 'Koszulka / polo', ['S', 'M', 'L', 'XL', '2XL', '3XL']], ['buty', 'Buty S3 (EU)', ['39', '40', '41', '42', '43', '44', '45', '46', '47']], ['rekawice', 'Rękawice', ['7', '8', '9', '10', '11']], ['kamizelka', 'Kamizelka odblaskowa', ['M', 'L', 'XL', '2XL']]];
  var TODAY = new Date(2026, 9, 23);
  var kd = { hall: 'all', q: '', view: 'list', sel: null, add: null };
  function seed(n, k) { var x = Math.sin(n * 97 + k * 13) * 10000; return x - Math.floor(x); }
  function iso(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function plDate(s) { if (!s) return ''; var p = s.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function addYears(s, n) { var p = s.split('-'); return iso(+p[0] + n, +p[1], +p[2]); }
  function genCerts(nr, st, lv) {
    var mont = st.indexOf('montaż') > -1, c = [], id = 0;
    var mk = function (t, name, from, to, no, issuer) { c.push({ id: nr + '-' + (id++), t: t, name: name, from: from, to: to, nr: no || '', issuer: issuer || '' }); };
    var bFrom = iso(2025, 1 + Math.floor(seed(nr, 3) * 11), 1 + Math.floor(seed(nr, 4) * 27));
    if (nr === 139) bFrom = '2024-11-14';
    mk('bad', PRESETS.bad[0], bFrom, addYears(bFrom, 2), 'orzeczenie nr ' + (100 + nr) + '/MP/' + bFrom.slice(0, 4), 'Przychodnia Medycyny Pracy (przykład)');
    if (mont) { var w = iso(2025, 1 + Math.floor(seed(nr, 7) * 11), 3 + Math.floor(seed(nr, 8) * 20)); if (seed(nr, 7) < .45) w = '2025-11-14'; mk('bad', PRESETS.bad[1], w, addYears(w, 1), '', 'Przychodnia Medycyny Pracy (przykład)'); }
    if (mont && lv[11]) mk('bad', PRESETS.bad[2], '2023-06-12', '2028-06-12');
    var sFrom = iso(2024, 1 + Math.floor(seed(nr, 5) * 11), 2 + Math.floor(seed(nr, 6) * 25));
    mk('szk', PRESETS.szk[0], sFrom, addYears(sFrom, mont ? 1 : 3), 'BHP/' + sFrom.slice(0, 4) + '/' + (300 + nr), 'Ośrodek Szkoleń BHP (przykład)');
    mk('szk', PRESETS.szk[1], '', '', '', 'Graffico – służba BHP');
    if (seed(nr, 15) > .5 || mont) mk('szk', PRESETS.szk[2], '2025-04-10', '2028-04-10', 'PP/2025/' + nr, 'Ośrodek Szkoleń BHP (przykład)');
    if (mont) mk('upr', PRESETS.upr[0], '2024-11-20', seed(nr, 7) < .45 ? '2026-11-14' : '2027-11-20', 'WYS/' + nr, 'Ośrodek Szkoleń BHP (przykład)');
    if (lv[9]) mk('upr', PRESETS.upr[1], '2021-11-02', seed(nr, 9) < .2 ? '2026-11-02' : '2031-11-02', 'IP/' + (4000 + nr), 'Urząd Dozoru Technicznego');
    if (lv[9]) c[c.length - 1].files = [{ id: 'demo-' + nr, name: 'Zaswiadczenie-UDT-IP-przyklad.pdf', size: 41000, at: '02.11.2021', url: 'assets/przyklad-udt.pdf' }];
    if (lv[6] >= 2) mk('upr', PRESETS.upr[4], '2021-11-28', seed(nr, 10) < .3 ? '2026-11-28' : '2029-05-10', 'E/' + (700 + nr) + '/21', 'Komisja kwalifikacyjna SEP');
    if (mont && lv[6] >= 2 && seed(nr, 16) > .5) mk('upr', PRESETS.upr[5], '2022-03-15', '2027-03-15', 'D/' + (200 + nr) + '/22', 'Komisja kwalifikacyjna SEP');
    if (lv[0] >= 2) mk('upr', PRESETS.upr[6], '2024-06-30', '2027-06-30', 'MAG-' + nr, 'Instytut Spawalnictwa (przykład)');
    if (lv[1] >= 2) mk('upr', PRESETS.upr[7], '2025-02-10', '2028-02-10', 'TIG-' + nr, 'Instytut Spawalnictwa (przykład)');
    if (lv[10] >= 1) mk('upr', PRESETS.upr[3], '2019-03-01', '2029-03-01', 'WJO/' + (900 + nr), 'Urząd Dozoru Technicznego');
    if (lv[11] >= 2) mk('upr', PRESETS.upr[8], '2016-05-20', '2031-05-20', '', 'Starostwo Powiatowe');
    return c;
  }
  function genSizes(nr) { var p = function (arr, k) { return arr[Math.min(arr.length - 1, Math.floor(seed(nr, k) * arr.length))]; }; var o = {}; SIZES.forEach(function (s, i) { o[s[0]] = p(s[2].slice(1, -1), 20 + i); }); return o; }
  var empStore = store.get('empdata', {});
  function saveEmp(x) { empStore[x.nr] = { certs: x.certs, sizes: x.sizes, lv: x.lv }; store.set('empdata', empStore); }
  function empX(e) {
    var nr = e[0], st = e[2], mont = st.indexOf('montaż') > -1, prod = st === 'pracownik produkcji' || st === 'ślusarz';
    var lv = SKILLS.map(function (s, k) {
      if (k >= 12) return 0; var base = mont ? [1, 0, 0, 0, 1, 0, 2, 2, 3, 2, 1, 2][k] : prod ? [2, 1, 1, 2, 2, 2, 1, 2, 0, 0, 1, 0][k] : 0;
      var r = seed(nr, k); var v = base === 0 ? (r > .85 ? 1 : 0) : Math.max(1, Math.min(3, base + (r > .7 ? 1 : r < .2 ? -1 : 0)));
      if (nr === 139 && (k === 0 || k === 5 || k === 2)) v = 3; if (nr === 149 && (k === 2 || k === 3)) v = 3; if (nr === 151 && k === 2) v = 3;
      return st === 'sprzątaczka' ? (k === 10 ? 1 : 0) : v;
    });
    if ((empStore[nr] || {}).lv) lv = empStore[nr].lv.slice(); while (lv.length < SKILLS.length) lv.push(0);
    var r = seed(nr, 99), status = r < .1 ? 'urlop' : (mont && r < .55 ? 'delegacja' : (r > .95 ? 'L4' : 'obecny'));
    var saved = empStore[nr] || {};
    var by = 1965 + Math.floor(seed(nr, 30) * 36), bm = 1 + Math.floor(seed(nr, 31) * 12), bd = 1 + Math.floor(seed(nr, 32) * 28);
    var pesel = String(by).slice(2) + pad(bm) + pad(bd) + String(1000 + Math.floor(seed(nr, 33) * 8999)).slice(0, 4);
    var wg = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3], sum = 0; for (var i = 0; i < 10; i++) sum += wg[i] * +pesel[i]; pesel += (10 - sum % 10) % 10;
    var towns = ['87-100 Toruń', '87-140 Chełmża', '87-162 Lubicz', '87-148 Łysomice', '87-134 Zławieś Wielka'];
    return { nr: nr, name: e[1], st: st, halls: e[3].split(''), rate: e[4], pay: e[5], since: e[6], mont: mont, lv: lv, status: status,
      skillsN: lv.filter(function (v) { return v > 0; }).length,
      certs: saved.certs || genCerts(nr, st, lv), sizes: saved.sizes || genSizes(nr),
      dob: iso(by, bm, bd), pesel: pesel, addr: 'ul. Przykładowa ' + (2 + Math.floor(seed(nr, 34) * 60)) + ', ' + towns[Math.floor(seed(nr, 35) * towns.length)],
      coins: st === 'niezdefiniowane' || st === 'sprzątaczka' ? 0 : 400 + Math.floor(seed(nr, 11) * 850), eff: 78 + Math.floor(seed(nr, 12) * 24), ot: Math.floor(seed(nr, 13) * 22), leave: 4 + Math.floor(seed(nr, 14) * 18) };
  }
  var EMPX = EMP.map(empX);
  function byNr(nr) { return EMPX.filter(function (x) { return x.nr === +nr; })[0]; }
  function certState(c) {
    if (!c.to) return ['c-green', 'bezterminowo', 2];
    var p = c.to.split('-'), days = Math.round((new Date(+p[0], +p[1] - 1, +p[2]) - TODAY) / 864e5);
    return days < 0 ? ['c-red', 'nieaktualne od ' + (-days) + ' dni', 0] : days < 31 ? ['c-orange', 'wygasa za ' + days + ' dni', 1] : ['c-green', 'ważne', 2];
  }
  function problems(x) { return x.certs.filter(function (c) { return certState(c)[2] < 2; }); }
  function expiredBad(x) { return x.certs.filter(function (c) { return c.t === 'bad' && certState(c)[2] === 0; }); }
  function expiring() { var n = 0; EMPX.forEach(function (x) { n += problems(x).length; }); return n; }
  function dots(v) { return '<span aria-label="poziom ' + v + ' z 3" style="display:inline-flex;gap:3px">' + [1, 2, 3].map(function (i) { return '<i style="width:9px;height:9px;border-radius:50%;background:' + (i <= v ? (v === 3 ? 'var(--green)' : 'var(--pink)') : 'rgba(255,255,255,.12)') + '"></i>'; }).join('') + '</span>'; }
  function ini(n) { return n.split(' ').map(function (p) { return p[0]; }).join(''); }
  var STC = { obecny: 'c-green', urlop: 'c-orange', delegacja: 'c-pink', L4: 'c-red' };

  VIEWS.kadry = {
    title: 'Pracownicy', sub: 'KADRY · 49 AKTYWNYCH',
    html: function () {
      var list = EMPX.filter(function (x) { return (kd.hall === 'all' || x.halls.indexOf(kd.hall) > -1) && (!kd.q || (x.name + ' ' + x.nr + ' ' + x.st).toLowerCase().indexOf(kd.q.toLowerCase()) > -1); });
      var cnt = function (h) { return EMPX.filter(function (x) { return x.halls.indexOf(h) > -1; }).length; };
      var pres = EMPX.filter(function (x) { return x.status === 'obecny'; }).length, del = EMPX.filter(function (x) { return x.status === 'delegacja'; }).length;
      var badX = EMPX.filter(function (x) { return expiredBad(x).length; });
      var head = (badX.length ? '<div class="alert a-red"><span class="chip c-red">BADANIA</span><span>Nieaktualne badania lekarskie: ' + badX.map(function (x) { return '<a href="#kadry" data-act="emp" data-nr="' + x.nr + '">' + x.name + '</a>'; }).join(', ') + '. Tych osób nie wolno dopuścić do pracy – wygeneruj skierowanie.</span></div>' : '') +
        '<div class="kpis"><div class="kpi"><small>Aktywni pracownicy</small><b>49</b><em class="t-dim">w demo ' + EMPX.length + ' ze starego systemu</em></div><div class="kpi"><small>Dziś obecni</small><b>' + pres + '</b><em class="t-dim">z ' + EMPX.length + ' na liście</em></div><div class="kpi"><small>W delegacji</small><b>' + del + '</b><em class="t-pink">ekipy montażowe</em></div><div class="kpi" style="border-color:rgba(255,153,0,.4)"><small class="t-orange">Terminy do pilnowania</small><b>' + expiring() + '</b><em class="t-dim">nieaktualne lub do 30 dni</em></div><div class="kpi"><small>Bez stanowiska</small><b>' + EMPX.filter(function (x) { return x.st === 'niezdefiniowane'; }).length + '</b><em class="t-orange">uzupełnij w kartach</em></div></div>';
      var seg = '<div class="seg">' + [['all', 'Wszyscy'], ['S', 'Prod. Stara · ' + cnt('S')], ['G', 'Hala Góra · ' + cnt('G')], ['D', 'Hala Dół · ' + cnt('D')], ['M', 'Montażyści · ' + cnt('M')], ['A', 'Administracja · ' + cnt('A')]].map(function (f) { return '<button data-act="khall" data-h="' + f[0] + '" aria-pressed="' + (kd.hall === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>';
      var tabs = '<div class="seg">' + [['list', 'Lista'], ['matrix', 'Macierz kompetencji'], ['certs', 'Badania, szkolenia, uprawnienia'], ['sizes', 'Rozmiary odzieży']].map(function (t) { return '<button data-act="kview" data-v="' + t[0] + '" aria-pressed="' + (kd.view === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>';
      var body;
      if (kd.view === 'matrix') {
        body = '<section class="card"><div class="h-row"><h2>Kto co umie</h2><small class="t-dim">● podstawy ●● samodzielnie ●●● ekspert</small></div><div class="scroll-x"><table style="border-collapse:collapse;font-size:13px;min-width:1000px;width:100%"><thead><tr><th scope="col" style="text-align:left;padding:8px;position:sticky;left:0;background:var(--surface)">Pracownik</th>' + SKILLS.map(function (s) { return '<th scope="col" style="padding:8px 6px;font-weight:500;color:var(--muted);font-size:11px;text-align:center;max-width:80px">' + s + '</th>'; }).join('') + '</tr></thead><tbody>' +
          list.filter(function (x) { return x.skillsN > 0; }).map(function (x) { return '<tr style="border-top:1px solid var(--line)"><th scope="row" style="text-align:left;padding:8px;font-weight:500;white-space:nowrap;position:sticky;left:0;background:var(--surface)"><button data-act="emp" data-nr="' + x.nr + '" style="background:none;border:0;padding:0;color:var(--fg);text-align:left">' + x.name + '<br><small class="t-dim">' + x.st + '</small></button></th>' + x.lv.map(function (v) { return '<td style="text-align:center;padding:6px">' + (v ? dots(v) : '<span class="t-dim">–</span>') + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div><p class="t-dim" style="font-size:13px;margin:10px 0 0">Planowanie produkcji korzysta z tej tabeli: gdy brakuje spawacza, system proponuje osobę z kompetencją ●● lub ●●●.</p></section>';
      } else if (kd.view === 'certs') {
        var rows = []; list.forEach(function (x) { x.certs.forEach(function (c) { var s = certState(c); rows.push([s[2], x, c, s]); }); });
        rows.sort(function (a, b) { return a[0] - b[0] || (a[2].to || '9').localeCompare(b[2].to || '9'); });
        body = '<section class="card"><div class="h-row"><h2>Terminy – najpilniejsze na górze</h2><small class="t-dim">' + rows.length + ' pozycji</small></div><div class="list">' + rows.map(function (r) { return '<button class="row" data-act="emp" data-nr="' + r[1].nr + '" style="background:none;border:0;border-bottom:1px solid var(--line);width:100%;text-align:left;color:var(--fg);align-items:center"><span style="min-width:0"><small class="t-dim">' + TYPES[r[2].t] + '</small><br><b style="font-weight:500">' + r[2].name + '</b><br><small class="t-muted">' + r[1].name + ' · ' + r[1].st + '</small></span><span style="text-align:right;flex:none"><span class="chip ' + r[3][0] + '">' + r[3][1] + '</span><br><small class="t-dim tab">' + (r[2].to ? 'do ' + plDate(r[2].to) : '') + '</small></span></button>'; }).join('') + '</div></section>';
      } else if (kd.view === 'sizes') {
        var tot = {}; SIZES.forEach(function (s) { tot[s[0]] = {}; });
        list.forEach(function (x) { SIZES.forEach(function (s) { var v = x.sizes[s[0]]; tot[s[0]][v] = (tot[s[0]][v] || 0) + 1; }); });
        body = '<section class="card"><div class="h-row"><h2>Zestawienie do zamówienia</h2><small class="t-dim">' + list.length + ' osób</small></div><div class="grid g2">' + SIZES.filter(function (s) { return s[0] !== 'wzrost'; }).map(function (s) { return '<div><b style="font-size:14px">' + s[1] + '</b><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">' + s[2].filter(function (v) { return tot[s[0]][v]; }).map(function (v) { return '<span class="chip tab">' + v + ' × ' + tot[s[0]][v] + '</span>'; }).join('') + '</div></div>'; }).join('') + '</div></section>' +
          '<section class="card"><div class="h-row"><h2>Tabela rozmiarów</h2><small class="t-dim">dotknij osoby, aby zmienić</small></div><div class="scroll-x"><table style="border-collapse:collapse;font-size:13px;min-width:720px;width:100%"><thead><tr><th scope="col" style="text-align:left;padding:8px;position:sticky;left:0;background:var(--surface)">Pracownik</th>' + SIZES.map(function (s) { return '<th scope="col" style="padding:8px;font-weight:500;color:var(--muted);font-size:12px">' + s[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
          list.map(function (x) { return '<tr style="border-top:1px solid var(--line)"><th scope="row" style="text-align:left;padding:8px;font-weight:500;white-space:nowrap;position:sticky;left:0;background:var(--surface)"><button data-act="emp" data-nr="' + x.nr + '" data-sec="sizes" style="background:none;border:0;padding:0;color:var(--fg)">' + x.name + '</button></th>' + SIZES.map(function (s) { return '<td class="tab" style="text-align:center;padding:8px">' + x.sizes[s[0]] + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></section>';
      } else {
        body = '<section class="card"><div class="h-row"><h2>' + list.length + ' na liście</h2><label for="kq" style="position:absolute;left:-9999px">Szukaj pracownika</label><input id="kq" class="in" style="max-width:240px;padding:8px 12px" placeholder="Szukaj: imię, nr, stanowisko" value="' + esc(kd.q) + '"></div><div class="list">' +
          list.map(function (x) {
            var pr = problems(x), eb = expiredBad(x).length;
            return '<button class="order" data-act="emp" data-nr="' + x.nr + '" style="background:none;border:0;border-bottom:1px solid var(--line);width:100%;text-align:left;font:inherit"><span style="width:44px;height:44px;border-radius:50%;background:var(--surface3);display:grid;place-items:center;font-weight:600;grid-row:span 2">' + ini(x.name) + '</span><span style="min-width:0"><b style="font-weight:600">' + x.name + '</b> <small class="t-dim">nr ' + x.nr + '</small><br><small class="t-muted">' + x.st + ' · ' + x.halls.map(function (h) { return HALL[h]; }).join(', ') + '</small></span><span style="text-align:right"><span class="chip ' + STC[x.status] + '">' + x.status + '</span></span>' +
              '<span style="grid-column:2/4;display:flex;gap:6px;flex-wrap:wrap;align-items:center"><small class="t-dim">' + (x.since ? 'od ' + plDate(x.since) : 'data zatrudnienia: brak') + ' · ' + x.skillsN + ' kompetencji</small>' + (eb ? '<span class="chip c-red">nieaktualne badania</span>' : pr.length ? '<span class="chip c-orange">' + pr.length + ' do odnowienia</span>' : '') + (x.coins ? '<span class="chip" style="color:var(--gold)">' + x.coins + ' G</span>' : '') + '</span></button>';
          }).join('') + '</div></section>';
      }
      return head + seg + tabs + body;
    },
    mount: function () { var q = $('#kq'); if (q) { q.addEventListener('input', function () { kd.q = q.value; var pos = q.selectionStart; render(); var n = $('#kq'); n.focus(); n.setSelectionRange(pos, pos); }); } },
    on: function (act, el) {
      if (act === 'khall') { kd.hall = el.dataset.h; render(); }
      if (act === 'kview') { kd.view = el.dataset.v; render(); }
    }
  };

  var CAL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  function dateField(attrs, val, label) {
    return '<span class="datef"><input type="text" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="dd.mm.rrrr" class="in dtxt" value="' + plDate(val) + '" ' + attrs + ' aria-label="' + label + ' (dd.mm.rrrr)"><button type="button" class="calbtn" data-act="cal" aria-label="Wybierz datę z kalendarza">' + CAL + '</button><input type="date" class="dpick" tabindex="-1" aria-hidden="true" value="' + (val || '') + '"></span>';
  }
  function parsePl(v) {
    v = (v || '').trim(); if (!v) return '';
    var m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return v;
    m = v.match(/^(\d{1,2})[.\-\/ ](\d{1,2})[.\-\/ ](\d{4})$/); if (!m) return null;
    var d = +m[1], mo = +m[2], y = +m[3], t = new Date(y, mo - 1, d);
    if (t.getFullYear() !== y || t.getMonth() !== mo - 1 || t.getDate() !== d) return null;
    return iso(y, mo, d);
  }
  function fmtSize(n) { return n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function certRow(x, c) {
    var s = certState(c), doc = '', sm = 'min-height:40px;font-size:12px;padding:0 10px';
    if (c.t === 'bad') doc = '<button class="btn" style="' + sm + '" data-act="docskier" data-nr="' + x.nr + '" data-id="' + c.id + '">Skierowanie</button>';
    if (c.t === 'szk' && c.from) doc = '<button class="btn" style="' + sm + '" data-act="doczasw" data-nr="' + x.nr + '" data-id="' + c.id + '">Zaświadczenie</button>';
    var files = (c.files || []).map(function (f) { return '<div class="filerow"><span class="fic">PDF</span><span style="flex:1;min-width:0"><b style="font-weight:500;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(f.name) + '</b><small class="t-dim">' + fmtSize(f.size) + ' · dodano ' + esc(f.at) + '</small></span><button class="btn" style="' + sm + '" data-act="viewfile" data-nr="' + x.nr + '" data-id="' + c.id + '" data-fid="' + f.id + '">Podgląd</button><button class="btn" style="' + sm + '" data-act="delfile" data-nr="' + x.nr + '" data-id="' + c.id + '" data-fid="' + f.id + '" aria-label="Usuń plik ' + esc(f.name) + '">×</button></div>'; }).join('');
    return '<div style="padding:12px 0;border-bottom:1px solid var(--line);display:grid;gap:8px">' +
      '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><span style="min-width:0"><b style="font-weight:500">' + esc(c.name) + '</b><br><small class="t-dim">' + esc([c.issuer, c.nr].filter(Boolean).join(' · ') || '—') + '</small></span><span class="chip ' + s[0] + '" style="flex:none">' + s[1] + '</span></div>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span style="font-size:12px;color:var(--muted)">' + (c.to ? 'Ważne do' : 'Bezterminowe') + '</span>' + (c.to ? dateField('data-certtxt="' + x.nr + '|' + c.id + '"', c.to, 'Ważne do') : '') + '<span style="flex:1"></span>' + doc + '<label class="btn" style="' + sm + ';position:relative;overflow:hidden">+ PDF<input type="file" accept="application/pdf,image/*" multiple data-attach="' + x.nr + '|' + c.id + '" style="position:absolute;inset:0;opacity:0;cursor:pointer" aria-label="Dodaj plik do ' + esc(c.name) + '"></label><button class="btn" style="' + sm + '" data-act="delcert" data-nr="' + x.nr + '" data-id="' + c.id + '" aria-label="Usuń ' + esc(c.name) + '">Usuń</button></div>' + files + '</div>';
  }
  function empSheet(x, sec) {
    var eb = expiredBad(x), szkX = x.certs.filter(function (c) { return c.t === 'szk' && certState(c)[2] === 0; });
    var uprX = x.certs.filter(function (c) { return c.t === 'upr' && certState(c)[2] === 0; });
    var form = '';
    if (kd.add === x.nr) {
      form = '<form data-form="addcert" data-nr="' + x.nr + '" class="card" style="background:var(--surface2);display:grid;gap:10px"><b>Nowa pozycja</b>' +
        '<label style="font-size:13px" class="t-muted">Rodzaj<select id="acT" class="in" style="margin-top:4px">' + Object.keys(TYPES).map(function (t) { return '<option value="' + t + '">' + TYPES[t] + '</option>'; }).join('') + '</select></label>' +
        '<label style="font-size:13px" class="t-muted">Nazwa (wybierz lub wpisz własną)<input id="acN" class="in" style="margin-top:4px" list="acList" placeholder="np. SEP E – eksploatacja do 1 kV" required><datalist id="acList">' + PRESETS.bad.concat(PRESETS.szk, PRESETS.upr).map(function (p) { return '<option value="' + p + '">'; }).join('') + '</datalist></label>' +
        '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label style="font-size:13px" class="t-muted">Data wydania' + dateField('id="acF"', '2026-10-23', 'Data wydania') + '</label><label style="font-size:13px" class="t-muted">Ważne do (puste = bezterminowo)' + dateField('id="acTo"', '2029-10-23', 'Ważne do') + '</label></div>' +
        '<label style="font-size:13px" class="t-muted">Skan dokumentu (PDF lub zdjęcie, opcjonalnie)<input id="acFile" type="file" accept="application/pdf,image/*" multiple class="in" style="margin-top:4px"></label>' +
        '<label style="font-size:13px" class="t-muted">Numer dokumentu / wystawca<input id="acNr" class="in" style="margin-top:4px" placeholder="np. E/123/26 · Komisja SEP"></label>' +
        '<div style="display:flex;gap:8px"><button type="button" class="btn" data-act="addcancel" style="flex:1">Anuluj</button><button class="btn p" style="flex:1">Zapisz</button></div></form>';
    }
    var section = function (t) { var arr = x.certs.filter(function (c) { return c.t === t; }); return '<div><div class="eyebrow" style="margin-bottom:2px">' + TYPES[t] + ' · ' + arr.length + '</div>' + (arr.length ? arr.map(function (c) { return certRow(x, c); }).join('') : '<p class="t-dim" style="margin:6px 0">Brak wpisów.</p>') + '</div>'; };
    return '<div class="grab"></div><div style="display:flex;gap:14px;align-items:center"><span style="width:56px;height:56px;border-radius:50%;background:var(--grad);display:grid;place-items:center;font-weight:700;font-size:20px;flex:none">' + ini(x.name) + '</span><div style="flex:1;min-width:0"><h2 style="font-size:21px">' + x.name + '</h2><small class="t-muted">nr ' + x.nr + ' · ' + x.st + '</small></div><span class="chip ' + STC[x.status] + '">' + x.status + '</span></div>' +
      (eb.length ? '<div class="alert a-red" style="flex-direction:column;gap:8px"><b class="t-red">Pracownik posiada nieaktualne badania okresowe</b><span>' + eb.map(function (c) { return c.name + ' – ważne były do ' + plDate(c.to); }).join('<br>') + '. Bez aktualnego orzeczenia nie wolno dopuścić go do pracy (art. 229 § 4 Kodeksu pracy). Planowanie produkcji nie przydzieli mu zadań.</span><button class="btn p" data-act="docskier" data-nr="' + x.nr + '" data-id="' + eb[0].id + '">Generuj skierowanie na badania</button></div>' : '') +
      (szkX.length ? '<div class="alert a-orange"><span class="chip c-orange">SZKOLENIE</span><span>Nieaktualne: ' + szkX.map(function (c) { return c.name; }).join(', ') + '. Zapisz pracownika na najbliższy termin szkolenia okresowego.</span></div>' : '') +
      (uprX.length ? '<div class="alert a-orange"><span class="chip c-orange">UPRAWNIENIA</span><span>Wygasły: ' + uprX.map(function (c) { return c.name; }).join(', ') + '. System blokuje przydział do zadań wymagających tych uprawnień.</span></div>' : '') +
      '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));font-size:14px">' + [['Przypisanie', x.halls.map(function (h) { return HALL[h]; }).join(', ')], ['Pracuje od', x.since ? plDate(x.since) : '<span class="t-orange">uzupełnij</span>'], ['Rodzaj umowy', 'Godzinówka (rozliczanie miesięczne)'], ['Wypłata', x.pay + ' dnia każdego miesiąca'], ['Stawka godzinowa', x.rate + ' zł <small class="t-dim">· widzą kadry i zarząd</small>'], ['Urlop do wykorzystania', x.leave + ' dni']].map(function (p) { return '<div><small class="t-dim">' + p[0] + '</small><div>' + p[1] + '</div></div>'; }).join('') + '</div>' +
      '<p class="t-dim" style="font-size:12px;margin:0">Zmień datę „ważne do” na wsteczną, aby zobaczyć komunikat systemu. Zmiany zapisują się w tej przeglądarce (reset na ekranie startowym).</p>' +
      '<button class="btn g full" data-act="addcert" data-nr="' + x.nr + '">+ Dodaj badanie, szkolenie lub uprawnienie</button>' + form +
      section('bad') + section('szk') + section('upr') +
      '<div id="secSizes"><div class="eyebrow" style="margin:6px 0">Rozmiary odzieży roboczej</div><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">' + SIZES.map(function (s) { return '<label style="font-size:13px" class="t-muted">' + s[1] + '<select class="in" style="margin-top:4px" data-size="' + x.nr + '|' + s[0] + '">' + s[2].map(function (v) { return '<option' + (x.sizes[s[0]] === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>'; }).join('') + '</div></div>' +
      '<div><div class="eyebrow" style="margin:6px 0">Wydana odzież i sprzęt BHP</div><div class="list"><div class="row"><span>Ubranie robocze (kurtka ' + x.sizes.kurtka + ', spodnie ' + x.sizes.spodnie + ')</span><span class="t-dim">wymiana 03.2027</span></div><div class="row"><span>Buty S3, rozmiar ' + x.sizes.buty + '</span><span class="t-dim">wydane 04.2026</span></div>' + (x.mont ? '<div class="row"><span>Szelki bezpieczeństwa</span><span class="t-orange">przegląd 11.2026</span></div>' : '<div class="row"><span>Przyłbica spawalnicza, rękawice ' + x.sizes.rekawice + '</span><span class="t-dim">wydane 2026</span></div>') + '</div></div>' +
      (x.skillsN ? '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="kpi"><small>Wydajność</small><b>' + x.eff + '%</b></div><div class="kpi"><small>Nadgodziny – paźdz.</small><b>' + x.ot + ' h</b></div><div class="kpi"><small>Grafficoiny</small><b class="t-gold">' + x.coins + '</b></div></div>' : '') +
      compSection(x) +
      '<button class="btn full" data-act="close">Zamknij</button>';
  }
  /* --- pliki (PDF / zdjęcia) w IndexedDB tej przeglądarki --- */
  var memFiles = {};
  function idb() { return new Promise(function (res, rej) { try { var r = indexedDB.open('graffi-files', 1); r.onupgradeneeded = function () { r.result.createObjectStore('f'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; } catch (e) { rej(e); } }); }
  function putFile(id, blob) { memFiles[id] = blob; return idb().then(function (db) { return new Promise(function (res) { var t = db.transaction('f', 'readwrite'); t.objectStore('f').put(blob, id); t.oncomplete = res; t.onerror = res; }); }).catch(function () {}); }
  function getFile(f) {
    if (f.url) return fetch(f.url).then(function (r) { return r.blob(); });
    if (memFiles[f.id]) return Promise.resolve(memFiles[f.id]);
    return idb().then(function (db) { return new Promise(function (res, rej) { var q = db.transaction('f').objectStore('f').get(f.id); q.onsuccess = function () { q.result ? res(q.result) : rej(new Error('brak')); }; q.onerror = function () { rej(q.error); }; }); });
  }
  function delFile(id) { delete memFiles[id]; return idb().then(function (db) { db.transaction('f', 'readwrite').objectStore('f').delete(id); }).catch(function () {}); }
  function attachFiles(x, c, files) {
    c.files = c.files || [];
    return Promise.all(files.map(function (fl) {
      if (fl.size > 15 * 1048576) { toast('Plik ' + fl.name + ' ma ponad 15 MB – pomijam'); return null; }
      var id = 'f' + Date.now() + Math.floor(Math.random() * 1e6);
      c.files.push({ id: id, name: fl.name, size: fl.size, type: fl.type, at: plDate(iso(TODAY.getFullYear(), TODAY.getMonth() + 1, TODAY.getDate())) });
      return putFile(id, fl);
    }));
  }
  var pdfLib = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfLib) return pdfLib;
    pdfLib = new Promise(function (res, rej) {
      var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; res(window.pdfjsLib); };
      sc.onerror = function () { pdfLib = null; rej(new Error('Nie udało się wczytać przeglądarki PDF')); }; document.head.appendChild(sc);
    });
    return pdfLib;
  }
  function viewFile(x, c, f) {
    kd.doc = x.nr;
    openDoc(f.name, '<p class="t-muted" id="pdfmsg" style="color:#ddd">Wczytuję plik…</p><div id="pdfpages" style="display:flex;flex-direction:column;gap:16px;align-items:center;width:100%"></div>');
    var bar = $('.docbar'); if (bar) bar.querySelector('[data-act="printdoc"]').remove();
    getFile(f).then(function (blob) {
      var url = URL.createObjectURL(blob), box = $('#pdfpages'), msg = $('#pdfmsg');
      if (bar) { var a = document.createElement('a'); a.className = 'btn'; a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Otwórz osobno'; bar.insertBefore(a, bar.lastChild); }
      if ((blob.type || f.type || '').indexOf('image') === 0 || /\.(jpe?g|png|webp|heic)$/i.test(f.name)) { msg.remove(); box.innerHTML = '<img src="' + url + '" alt="' + esc(f.name) + '" style="max-width:min(100%,900px);background:#fff;box-shadow:0 6px 24px rgba(0,0,0,.35)">'; return; }
      return loadPdfJs().then(function (lib) { return blob.arrayBuffer().then(function (buf) { return lib.getDocument({ data: buf }).promise; }); }).then(function (pdf) {
        msg.textContent = c.name + ' · ' + pdf.numPages + ' str. · ' + x.name; msg.style.cssText = 'color:#ddd;margin:0';
        var w = Math.min(box.clientWidth || 360, 900), chain = Promise.resolve();
        for (var i = 1; i <= pdf.numPages; i++) (function (n) { chain = chain.then(function () { return pdf.getPage(n).then(function (pg) {
          var v1 = pg.getViewport({ scale: 1 }), dpr = window.devicePixelRatio || 1, sc = w / v1.width, vp = pg.getViewport({ scale: sc * dpr });
          var cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; cv.style.cssText = 'width:' + w + 'px;max-width:100%;background:#fff;box-shadow:0 6px 24px rgba(0,0,0,.35)';
          cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Strona ' + n + ' – ' + f.name); box.appendChild(cv);
          return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; }); }); })(i);
        return chain;
      });
    }).catch(function (e) { var m = $('#pdfmsg'); if (m) m.textContent = 'Nie udało się otworzyć pliku (' + e.message + '). Pliki są zapisane tylko w tej przeglądarce.'; });
  }
  function compSection(x) {
    var have = SKILLS.map(function (n, k) { return [n, k, x.lv[k] || 0]; }).filter(function (r) { return r[2] > 0; });
    var free = SKILLS.map(function (n, k) { return [n, k]; }).filter(function (r) { return !(x.lv[r[1]] > 0); });
    var lvlNames = ['', 'podstawy', 'samodzielnie', 'ekspert'];
    var rows = have.map(function (r) { return '<div class="comp"><span class="nm">' + esc(r[0]) + '<br><small class="t-dim">' + lvlNames[r[2]] + '</small></span><span class="lvl' + (r[2] === 3 ? ' l3' : '') + '" role="group" aria-label="Poziom: ' + esc(r[0]) + '">' + [1, 2, 3].map(function (v) { return '<button class="' + (v <= r[2] ? 'on' : '') + '" data-act="setlvl" data-nr="' + x.nr + '" data-k="' + r[1] + '" data-v="' + v + '" aria-label="' + lvlNames[v] + '" aria-pressed="' + (v === r[2]) + '"><i></i></button>'; }).join('') + '</span><button class="btn" style="min-height:34px;padding:0 10px;font-size:12px" data-act="setlvl" data-nr="' + x.nr + '" data-k="' + r[1] + '" data-v="0" aria-label="Usuń kompetencję ' + esc(r[0]) + '">×</button></div>'; }).join('');
    var add = kd.comp === x.nr
      ? '<form data-form="addcomp" data-nr="' + x.nr + '" class="card" style="background:var(--surface2);display:grid;gap:10px;margin-top:8px"><label class="t-muted" style="font-size:13px">Kompetencja<select id="cpS" class="in" style="margin-top:4px">' + free.map(function (r) { return '<option value="' + r[1] + '">' + esc(r[0]) + '</option>'; }).join('') + '<option value="new">+ Nowa kompetencja (wpisz poniżej)…</option></select></label>' +
        '<label class="t-muted" style="font-size:13px">Nazwa nowej kompetencji (opcjonalnie)<input id="cpN" class="in" style="margin-top:4px" placeholder="np. Obsługa plotera tnącego, Klejenie liter 3D"></label>' +
        '<label class="t-muted" style="font-size:13px">Poziom<select id="cpL" class="in" style="margin-top:4px"><option value="1">● podstawy</option><option value="2" selected>●● samodzielnie</option><option value="3">●●● ekspert</option></select></label>' +
        '<div style="display:flex;gap:8px"><button type="button" class="btn" data-act="compcancel" style="flex:1">Anuluj</button><button class="btn p" style="flex:1">Dodaj</button></div></form>'
      : '<button class="btn g full" style="margin-top:8px" data-act="addcomp" data-nr="' + x.nr + '">+ Dodaj kompetencję</button>';
    return '<div id="secComp"><div class="eyebrow" style="margin-bottom:2px">Kompetencje · ' + have.length + '</div>' + (rows || '<p class="t-dim" style="margin:6px 0">Brak przypisanych kompetencji.</p>') + add + '<small class="t-dim" style="display:block;margin-top:6px">Dotknij kropek, aby zmienić poziom. Macierz kompetencji i planowanie produkcji korzystają z tych danych.</small></div>' +
      '';
  }
  function showEmp(nr, keepScroll, sec) {
    var sh = $('.sheet'), sc = keepScroll && sh ? sh.scrollTop : 0;
    openSheet(empSheet(byNr(nr)));
    var n = $('.sheet'); if (n) { if (sec === 'sizes') { var t = $('#secSizes'); if (t) n.scrollTop = t.offsetTop - 20; } else n.scrollTop = sc; }
  }

  /* --- dokumenty: wzory urzędowe wypełnione danymi --- */
  var FACT = {
    prod: { opis: 'Praca fizyczna przy produkcji konstrukcji i elementów reklamy zewnętrznej (pylony, kasetony, litery 3D): cięcie i gięcie blach, spawanie MIG/MAG i TIG, szlifowanie, malowanie natryskowe, składanie i pakowanie. Praca 8 h na zmianę, w pozycji stojącej, z przenoszeniem elementów do 30 kg; obsługa gilotyny, prasy krawędziowej, frezarki CNC.',
      f: ['hałas – ekspozycja ok. 86 dB(A) (pomiar z 03.2026); drgania przenoszone przez kończyny górne (szlifierki); promieniowanie optyczne (nadfioletowe, podczerwone) przy spawaniu łukowym', 'pyły spawalnicze; pył metali (stal, aluminium) przy szlifowaniu', 'dymy spawalnicze – tlenki żelaza, mangan i jego związki; rozpuszczalniki organiczne (ksylen, octan butylu) przy malowaniu', 'nie występują', 'obsługa maszyn z ruchomymi elementami; ręczne prace transportowe do 30 kg; prace szczególnie niebezpieczne – spawanie'], n: 9 },
    mont: { opis: 'Montaż i demontaż pylonów, kasetonów, liter przestrzennych i oznakowania obiektów na terenie całego kraju (praca w delegacji): praca na wysokości powyżej 3 m z podestów ruchomych i drabin, wiercenie, kotwienie, podłączanie zasilania do 1 kV, kierowanie samochodem służbowym. Praca na otwartej przestrzeni, zmienny czas pracy.',
      f: ['hałas – ekspozycja ok. 82 dB(A); drgania miejscowe (wiertarki, młoty udarowe); praca na otwartej przestrzeni w zmiennych warunkach atmosferycznych', 'pył cementowy i kwarcowy przy wierceniu w betonie – okresowo', 'nie występują', 'nie występują', 'praca na wysokości powyżej 3 m; obsługa podestów ruchomych; prace przy urządzeniach elektrycznych do 1 kV; kierowanie pojazdem służbowym; ręczne prace transportowe'], n: 9 },
    sprz: { opis: 'Utrzymanie czystości hal produkcyjnych, szatni i pomieszczeń socjalnych; praca 8 h, w ruchu, z użyciem środków czystości.', f: ['nie występują', 'pył ogólny z hali produkcyjnej – okresowo', 'środki czystości i dezynfekcji (zgodnie z kartami charakterystyki)', 'nie występują', 'ręczne prace transportowe do 15 kg; poruszanie się po hali w trakcie pracy maszyn'], n: 4 }
  };
  function factFor(x) { return x.mont ? FACT.mont : x.st === 'sprzątaczka' ? FACT.sprz : FACT.prod; }
  function docSkier(x, c) {
    var F = factFor(x), st = x.st === 'niezdefiniowane' ? 'pracownik produkcji (stanowisko do uzupełnienia w kartotece)' : x.st;
    var line = function (label, val, sub) { return '<p class="dl"><span>' + label + '</span> <u>' + val + '</u></p>' + (sub ? '<p class="sub">' + sub + '</p>' : ''); };
    return '<article class="page"><p class="small" style="margin:0 0 16px">Wzór skierowania na obowiązkowe badania lekarskie</p>' +
      '<div class="two"><div><u>GRAFFICO<br>[adres siedziby, NIP]</u><p class="sub">(oznaczenie pracodawcy)</p></div><div style="text-align:right"><u>Toruń, ' + plDate('2026-10-23') + '</u><p class="sub">(miejscowość, data)</p></div></div>' +
      '<h3 class="dtitle">SKIEROWANIE NA BADANIA LEKARSKIE</h3><p class="center">(<s>wstępne</s>/okresowe/<s>kontrolne</s>*))</p>' +
      '<p>Działając na podstawie art. 229 § 4a ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy (Dz. U. z 2016 r. poz. 1666), kieruję na badania lekarskie:</p>' +
      line(/^(Agnieszka|Wiesława)/.test(x.name) ? '<s>Pana</s>/Panią*)' : 'Pana/<s>Panią</s>*)', x.name.replace(/\.$/, '') + ' [nazwisko z kartoteki]', '(imię i nazwisko)') +
      line('Nr PESEL**)', x.pesel + ' <i class="ex">(przykład)</i>') +
      line(/^(Agnieszka|Wiesława)/.test(x.name) ? '<s>zamieszkałego</s>/zamieszkałą*)' : 'zamieszkałego/<s>zamieszkałą</s>*)', x.addr + ' <i class="ex">(przykład)</i>', '(miejscowość, ulica, nr domu, nr lokalu)') +
      '<p>' + (/^(Agnieszka|Wiesława)/.test(x.name) ? '<s>zatrudnionego</s>/zatrudnioną*)' : 'zatrudnionego/<s>zatrudnioną</s>*)') + ' <s>lub podejmującego/podejmującą*)</s> pracę na stanowisku lub stanowiskach pracy</p><p class="dl"><u>' + st + ' – ' + x.halls.map(function (h) { return HALL[h]; }).join(', ') + '</u></p>' +
      line('określenie stanowiska/stanowisk*) pracy***):', F.opis) +
      '<p>Opis warunków pracy uwzględniający informacje o występowaniu na stanowisku lub stanowiskach pracy czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników uciążliwych i innych wynikających ze sposobu wykonywania pracy, z podaniem wielkości narażenia oraz aktualnych wyników badań i pomiarów czynników szkodliwych dla zdrowia, wykonanych na tym stanowisku/stanowiskach – należy wpisać nazwę czynnika/czynników i wielkość/wielkości narażenia****):</p>' +
      ['I. Czynniki fizyczne:', 'II. Pyły:', 'III. Czynniki chemiczne:', 'IV. Czynniki biologiczne:', 'V. Inne czynniki, w tym niebezpieczne:'].map(function (l, i) { return line(l, F.f[i]); }).join('') +
      line('Łączna liczba czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników uciążliwych', String(F.n)) +
      '<p class="small">Poprzednie orzeczenie: ' + esc(c.nr || '—') + ', ważne do ' + plDate(c.to) + '. Rodzaj badania: ' + esc(c.name) + '.</p>' +
      '<div class="sign"><u>&nbsp;</u><p class="sub">(podpis pracodawcy)</p></div><p class="pn">1</p></article>' +
      '<article class="page small"><p><b>Objaśnienia:</b></p><p>*) Niepotrzebne skreślić.</p><p>**) W przypadku osoby, której nie nadano numeru PESEL – seria, numer i nazwa dokumentu potwierdzającego tożsamość, a w przypadku osoby przyjmowanej do pracy − data urodzenia.</p><p>***) Opisać: rodzaj pracy, podstawowe czynności, sposób i czas ich wykonywania.</p><p>****) Opis warunków pracy uwzględniający w szczególności przepisy wydane na podstawie art. 222 § 3, art. 222¹ § 3, art. 227 § 2 i art. 228 § 3 Kodeksu pracy, art. 25 pkt 1 ustawy – Prawo atomowe oraz załącznika nr 1 do rozporządzenia Ministra Zdrowia i Opieki Społecznej z dnia 30 maja 1996 r. w sprawie przeprowadzania badań lekarskich pracowników (pełna treść objaśnień – wzór z biznes.gov.pl).</p><p class="pn">2</p></article>';
  }
  function docZasw(x, c) {
    var robot = c.name.indexOf('okresowe BHP') > -1;
    var T = robot ? [['Wybrane regulacje prawne z zakresu prawa pracy dotyczące bhp', 1, 0], ['Zagrożenia czynnikami niebezpiecznymi, szkodliwymi i uciążliwymi na stanowiskach pracy (spawanie, obróbka metali, praca na wysokości) oraz środki ochrony', 2, 0], ['Kształtowanie bezpiecznych zachowań w sytuacjach zagrożeń – ćwiczenia', 1, 1], ['Postępowanie w razie wypadku, w tym udzielanie pierwszej pomocy', 1, 1], ['Ochrona przeciwpożarowa – zasady i ćwiczenia', 1, 0]]
      : [['Zasady udzielania pierwszej pomocy, łańcuch przeżycia', 1, 0], ['Resuscytacja krążeniowo-oddechowa, AED', 0, 2], ['Urazy typowe dla zakładu (oparzenia, rany, porażenie prądem)', 1, 2]];
    var th = 0, tp = 0; T.forEach(function (r) { th += r[1]; tp += r[2]; });
    return '<article class="page"><div class="two"><u>Ośrodek Szkoleń BHP (przykład)</u><span class="small">1/2</span></div><p class="sub">(nazwa organizatora szkolenia)</p>' +
      '<h3 class="dtitle" style="margin-top:28px">ZAŚWIADCZENIE<br>o ukończeniu szkolenia w dziedzinie bezpieczeństwa i higieny pracy</h3>' +
      '<p class="dl"><span>Pan(i)</span> <u>' + x.name.replace(/\.$/, '') + ' [nazwisko z kartoteki]</u></p><p class="sub">(imię i nazwisko)</p>' +
      '<p class="dl"><span>urodzony(a) dnia</span> <u>' + plDate(x.dob) + ' <i class="ex">(przykład)</i></u></p>' +
      '<p class="dl"><span>ukończył(a) szkolenie</span> <u>' + esc(c.name) + (robot ? ' – szkolenie okresowe dla pracowników zatrudnionych na stanowiskach robotniczych' : '') + '</u></p><p class="sub">(nazwa formy szkolenia)</p>' +
      '<p class="dl"><span>w formie</span> <u>' + (robot ? 'kursu z wykładami i ćwiczeniami' : 'kursu') + '</u><sup>1)</sup></p>' +
      '<p class="dl"><span>organizowane przez</span> <u>Ośrodek Szkoleń BHP (przykład)</u></p><p class="sub">(nazwa organizatora szkolenia)</p>' +
      '<p class="dl"><span>w dniach</span> <u>' + plDate(c.from) + ' – ' + plDate(c.from) + '</u></p>' +
      '<p class="dl"><span>Celem szkolenia było</span> <u>' + (robot ? 'aktualizacja i ugruntowanie wiedzy oraz umiejętności z zakresu bhp na stanowiskach produkcji i montażu reklamy zewnętrznej' : 'nabycie umiejętności udzielania pierwszej pomocy w typowych sytuacjach zakładowych') + '</u></p>' +
      '<p>Zaświadczenie wydano na podstawie § 16 ust. 3 rozporządzenia Ministra Gospodarki i Pracy z dnia 27 lipca 2004 r. w sprawie szkolenia w dziedzinie bezpieczeństwa i higieny pracy (Dz. U. z 2004 r. poz. 1860, z późn. zm.).</p>' +
      '<div class="two" style="margin-top:28px"><div><u>Toruń, ' + plDate(c.from) + '</u><p class="sub">(miejscowość, data)</p></div><div style="text-align:right"><u>' + esc(c.nr || '—') + '</u><p class="sub">(nr zaświadczenia według rejestru)</p></div></div>' +
      '<div class="sign"><u>&nbsp;</u><p class="sub">(pieczęć i podpis osoby upoważnionej przez organizatora szkolenia)</p></div>' +
      '<p class="small">¹) Należy podać nazwę formy szkolenia zgodnie z § 13 ust. 1 i § 15 ust. 1–2 rozporządzenia.</p>' +
      '<div class="valid ' + certState(c)[0] + '">Ważne do: <b>' + (c.to ? plDate(c.to) : 'bezterminowo') + '</b> · ' + certState(c)[1] + '</div></article>' +
      '<article class="page"><div class="two"><span></span><span class="small">2/2</span></div><h3 class="dtitle" style="font-size:15px">Tematyka szkolenia</h3><table class="dt"><thead><tr><th>Lp.</th><th>Temat szkolenia</th><th>Liczba godzin zajęć teoretycznych (wykładów)</th><th>Liczba godzin zajęć praktycznych (ćwiczeń)</th></tr></thead><tbody>' +
      T.map(function (r, i) { return '<tr><td>' + (i + 1) + '.</td><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '<tr><td></td><td><b>Razem</b></td><td><b>' + th + '</b></td><td><b>' + tp + '</b></td></tr></tbody></table></article>';
  }
  function openDoc(title, html) {
    $('#overlay').innerHTML = '<div class="docv" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="docbar"><b>' + esc(title) + '</b><span style="flex:1"></span><button class="btn" data-act="printdoc">Drukuj / PDF</button><button class="btn p" data-act="closedoc">Zamknij</button></div><div class="docs">' + html + '</div></div>';
  }

  /* ---------- powłoka ---------- */
  var NAV = [['pulpit', 'Pulpit', 'grid'], ['crm', 'CRM', 'crm'], ['plan', 'Produkcja', 'fab'], ['tablet', 'Tablet', 'tab'], ['monter', 'Montaż', 'pin'], ['kadry', 'Pracownicy', 'people'], ['hala', 'Hala', 'tv']];
  var cur = 'start';
  function render() {
    var V = VIEWS[cur];
    $('#viewTitle').textContent = V.title; $('#viewSub').textContent = V.sub;
    $('#view').innerHTML = V.html();
    $('#nav').innerHTML = NAV.map(function (n) { return '<button data-go="' + n[0] + '"' + (cur === n[0] || (cur === 'zlecenie' && n[0] === 'pulpit') ? ' aria-current="page"' : '') + '>' + I[n[2]] + n[1] + '</button>'; }).join('');
    if (V.mount) V.mount();
    if (V.tick) V.tick();
    if (typeof bell === 'function') bell();
  }
  function go(v) { if (!VIEWS[v]) v = 'start'; cur = v; closeSheet(); render(); window.scrollTo(0, 0); try { history.replaceState(null, '', '#' + v); } catch (e) {} }
  function openSheet(html) { $('#overlay').innerHTML = '<div class="sheet-bg" data-act="bg"><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>'; }
  function closeSheet() { $('#overlay').innerHTML = ''; }

  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.dataset.act;
    if (act === 'bg') { if (e.target === a) closeSheet(); return; }
    if (act === 'close') return closeSheet();
    if (act === 'history') { e.preventDefault(); ui.otab = 4; return go('zlecenie'); }
    if (act === 'emp') { e.preventDefault(); if (cur !== 'kadry') { go('kadry'); } kd.add = null; return showEmp(a.dataset.nr, false, a.dataset.sec); }
    if (act === 'docskier' || act === 'doczasw') { var px = byNr(a.dataset.nr), pc = px.certs.filter(function (c) { return c.id === a.dataset.id; })[0]; kd.doc = px.nr; return openDoc(act === 'docskier' ? 'Skierowanie na badania – ' + px.name : 'Zaświadczenie BHP – ' + px.name, act === 'docskier' ? docSkier(px, pc) : docZasw(px, pc)); }
    if (act === 'closedoc') { return kd.doc ? showEmp(kd.doc) : closeSheet(); }
    if (act === 'printdoc') { try { window.print(); } catch (x) {} return; }
    if (act === 'addcert') { kd.add = +a.dataset.nr; showEmp(a.dataset.nr, true); var f = $('#acN'); if (f) f.focus(); return; }
    if (act === 'addcancel') { var nn = kd.add; kd.add = null; return showEmp(nn, true); }
    if (act === 'leadgen') { openSheet(genSheet()); return; }
    if (act === 'lfprod') { var pl = lfProds(crm.lf), pv = a.dataset.v, pi = pl.indexOf(pv); if (pi > -1) pl.splice(pi, 1); else pl.push(pv); crm.lf.gate = null; reSheet(leadForm()); return; }
    if (act === 'lfrecom') { var rf = firmById(crm.lf.firm), rp = lfProds(crm.lf); (TYPICAL[rf.branza] || []).forEach(function (t) { if (rp.indexOf(t[0]) < 0) rp.push(t[0]); }); crm.lf.gate = null; reSheet(leadForm()); return; }
    if (act === 'lfgate') { var gg = aiGate(crm.lf, firmById(crm.lf.firm)); if (!gg) return toast('Zaznacz produkty w kroku 3 – AI Gate wycenia na ich podstawie'); crm.lf.gate = gg; crm.lf.value = String(gg.mid); reSheet(leadForm()); toast('AI Gate: szacunek ' + zl(gg.mid) + ' netto'); return; }
    if (act === 'findcontact') { findContact(); return; }
    if (act === 'gset') { var gk = a.dataset.k, gv = a.dataset.v; if (a.dataset.multi === '1') { var ix = gen[gk].indexOf(gv); if (ix > -1) gen[gk].splice(ix, 1); else gen[gk].push(gv); } else gen[gk] = gv; reSheet(genSheet()); return; }
    if (act === 'gprompt') { gen.showPrompt = !gen.showPrompt; reSheet(genSheet()); return; }
    if (act === 'grun') { runGen(); return; }
    if (act === 'gadd') { genAdd(+a.dataset.i); return; }
    if (act === 'gdrop') { gen.res.splice(+a.dataset.i, 1); reSheet(genSheet()); return; }
    if (act === 'gsettings') { st.tab = 'agenci'; st.agent = 'leady'; return go('ustawienia'); }
    if (act === 'addlead' && cur !== 'crm') { crm.lf = { firm: null, q: '', owner: 'Agnieszka W.', src: SOURCES[0], prod: 'Pylon', person: 0 }; return openSheet(leadForm()); }
    if (act === 'cal') { var dp = a.parentNode.querySelector('.dpick'); try { if (dp.showPicker) dp.showPicker(); else { dp.focus(); dp.click(); } } catch (x) { dp.focus(); dp.click(); } return; }
    if (act === 'viewfile' || act === 'delfile') { var vx = byNr(a.dataset.nr), vc = vx.certs.filter(function (c) { return c.id === a.dataset.id; })[0], vf = (vc.files || []).filter(function (f) { return f.id === a.dataset.fid; })[0];
      if (act === 'viewfile') return viewFile(vx, vc, vf);
      vc.files = vc.files.filter(function (f) { return f !== vf; }); if (!vf.url) delFile(vf.id); saveEmp(vx); toast('Usunięto plik'); return showEmp(vx.nr, true); }
    if (act === 'setlvl') { var lx = byNr(a.dataset.nr); lx.lv[+a.dataset.k] = +a.dataset.v; lx.skillsN = lx.lv.filter(function (v) { return v > 0; }).length; saveEmp(lx); render(); return showEmp(lx.nr, true); }
    if (act === 'addcomp') { kd.comp = +a.dataset.nr; showEmp(a.dataset.nr, true); return; }
    if (act === 'compcancel') { var cn = kd.comp; kd.comp = null; return showEmp(cn, true); }
    if (act === 'delcert') { var dx = byNr(a.dataset.nr); dx.certs = dx.certs.filter(function (c) { return c.id !== a.dataset.id; }); saveEmp(dx); render(); toast('Usunięto pozycję'); return showEmp(dx.nr, true); }
    if (act === 'toggle') { a.classList.toggle('on'); a.querySelector('.box').textContent = a.classList.contains('on') ? '✓' : ''; return; }
    if (act === 'okqc') { closeSheet(); return toast('Kontrola jakości zapisana i podpisana'); }
    if (act === 'sendissue') { if (!$('#issuePhoto').classList.contains('ok')) return toast('Dodaj zdjęcie – bez niego zgłoszenie nie zostanie wysłane'); closeSheet(); return toast('Zgłoszenie wysłane – powiadomiono odpowiedzialne osoby'); }
    if (VIEWS[cur].on) VIEWS[cur].on(act, a);
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.cert) { var k = t.dataset.cert.split('|'), x = byNr(k[0]); x.certs.forEach(function (c) { if (c.id === k[1] && t.value) c.to = t.value; }); saveEmp(x); render(); showEmp(x.nr, !expiredBad(x).length); if (expiredBad(x).length) toast('Uwaga: pracownik ma nieaktualne badania okresowe'); return; }
    if (t.classList && t.classList.contains('dpick')) { var tx = t.parentNode.querySelector('.dtxt'); if (t.value) { tx.value = plDate(t.value); tx.dispatchEvent(new Event('input', { bubbles: true })); tx.dispatchEvent(new Event('change', { bubbles: true })); } return; }
    if (t.dataset && t.dataset.certtxt) { var v = parsePl(t.value); if (!v) { toast('Wpisz datę w formacie dd.mm.rrrr, np. 01.09.2026'); return; } var kk = t.dataset.certtxt.split('|'), cx = byNr(kk[0]); cx.certs.forEach(function (c) { if (c.id === kk[1]) c.to = v; }); saveEmp(cx); render(); showEmp(cx.nr, !expiredBad(cx).length); toast(expiredBad(cx).length ? 'Uwaga: pracownik ma nieaktualne badania okresowe' : 'Zapisano datę ' + plDate(v)); return; }
    if (t.dataset && t.dataset.attach) { var ak = t.dataset.attach.split('|'), ax = byNr(ak[0]), ac = ax.certs.filter(function (c) { return c.id === ak[1]; })[0], fs = Array.prototype.slice.call(t.files || []); if (!fs.length) return; attachFiles(ax, ac, fs).then(function () { saveEmp(ax); showEmp(ax.nr, true); toast('Dodano ' + fs.length + ' plik(i) do: ' + ac.name); }); return; }
    if (t.dataset && t.dataset.size) { var z = t.dataset.size.split('|'), y = byNr(z[0]); y.sizes[z[1]] = t.value; saveEmp(y); if (cur === 'kadry' && kd.view === 'sizes') render(); toast('Rozmiar zapisany'); return; }
    var inp = e.target; if (!inp.dataset || !inp.dataset.photo || !inp.files || !inp.files[0]) return;
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image(); img.onload = function () { var c = document.createElement('canvas'), s = Math.min(1, 900 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); var url = c.toDataURL('image/jpeg', .8);
        if (inp.dataset.photo === 'issue') { var l = $('#issuePhoto'); l.classList.add('ok'); l.querySelector('span').textContent = '✓ Zdjęcie dodane'; } else if (VIEWS[cur].photo) VIEWS[cur].photo(inp.dataset.photo, url); };
      img.src = fr.result;
    };
    fr.readAsDataURL(inp.files[0]);
  });
  function reSheet(html) { var sh = $('.sheet'), sc = sh ? sh.scrollTop : 0; openSheet(html); var n = $('.sheet'); if (n) n.scrollTop = sc; }
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.lf && crm.lf) crm.lf[t.dataset.lf] = t.value;
    if (t.dataset && t.dataset.ff && crm.ff) { crm.ff[t.dataset.ff] = t.value; if (t.dataset.ff === 'nip') { var st = $('#nipState'), n = t.value.replace(/[^\d]/g, ''); if (st) st.innerHTML = n.length < 10 ? '' : nipOk(n) ? '<small class="t-green">NIP poprawny – możesz pobrać dane z GUS</small>' : '<small class="t-red">Nieprawidłowy NIP – sprawdź cyfry</small>'; } }
    if (t.id === 'genQ') gen.q = t.value;
    if (t.id === 'lfQ' && crm.lf) { crm.lf.q = t.value; var r = $('#lfRes'); if (r) r.innerHTML = lfResults(t.value); }
    if (t.id === 'fq') { crm.fq = t.value; var fl = $('#firmList'); if (fl) { var q = t.value.toLowerCase(); fl.innerHTML = firmRows(FIRMS.filter(function (f) { return !q || (f.name + ' ' + f.full + ' ' + f.nip + ' ' + f.city + ' ' + f.branza).toLowerCase().indexOf(q) > -1; })); } }
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t.classList || !t.classList.contains('dtxt') || e.inputType === 'deleteContentBackward') return;
    var d = t.value.replace(/[^\d]/g, '').slice(0, 8), o = d.slice(0, 2);
    if (d.length > 2) o += '.' + d.slice(2, 4); if (d.length > 4) o += '.' + d.slice(4);
    if (d.length === 2 || d.length === 4) o += '.';
    if (/^\d{4}-/.test(t.value)) return; t.value = o;
  });
  document.addEventListener('keydown', function (e) { var t = e.target; if (e.key === 'Enter' && t.classList && t.classList.contains('dtxt') && t.dataset.certtxt) { e.preventDefault(); t.blur(); } });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    if (f.dataset.form === 'addcomp') {
      var cx = byNr(f.dataset.nr), sel = $('#cpS').value, nm = $('#cpN').value.trim(), k;
      if (sel === 'new' || (nm && sel === 'new')) { if (!nm) return toast('Wpisz nazwę nowej kompetencji'); k = SKILLS.indexOf(nm); if (k < 0) { SKILLS.push(nm); customSkills.push(nm); store.set('skills', customSkills); EMPX.forEach(function (e) { while (e.lv.length < SKILLS.length) e.lv.push(0); }); k = SKILLS.length - 1; } }
      else k = +sel;
      cx.lv[k] = +$('#cpL').value; cx.skillsN = cx.lv.filter(function (v) { return v > 0; }).length; saveEmp(cx); kd.comp = null; render(); showEmp(cx.nr, true); toast('Dodano kompetencję: ' + SKILLS[k]); return;
    }
    if (f.dataset.form === 'addcert') {
      var x = byNr(f.dataset.nr), parts = $('#acNr').value.split('·');
      var fF = parsePl($('#acF').value), fT = parsePl($('#acTo').value);
      if (fF === null || fT === null) return toast('Wpisz datę w formacie dd.mm.rrrr, np. 14.11.2027');
      var nc = { id: x.nr + '-n' + Date.now(), t: $('#acT').value, name: $('#acN').value.trim(), from: fF, to: fT, nr: (parts[0] || '').trim(), issuer: (parts[1] || '').trim(), files: [] };
      x.certs.push(nc);
      var fl = $('#acFile') ? Array.prototype.slice.call($('#acFile').files || []) : [];
      attachFiles(x, nc, fl).then(function () { saveEmp(x); kd.add = null; render(); showEmp(x.nr, true); toast('Dodano: ' + nc.name + (fl.length ? ' + ' + fl.length + ' plik(i)' : '')); });
      return;
    }
    if (VIEWS[cur].submit) VIEWS[cur].submit(f);
  });
  $('#homeBtn').addEventListener('click', function () { go('start'); });
  var gb = $('#gearBtn'); if (gb) gb.addEventListener('click', function () { go('ustawienia'); });
  $('#bellBtn').addEventListener('click', function () { openSheet('<div class="grab"></div><h2>Powiadomienia</h2><div class="grid">' + allAlerts().map(function (a) { return '<div class="alert ' + a[0] + '"><span class="chip ' + a[1] + '">' + a[2] + '</span><span>' + a[3] + '</span></div>'; }).join('') + '</div>' + (events.length ? '<h2 style="font-size:17px;margin-top:6px">Ostatnie zdarzenia</h2>' + eventsHtml(6) : '') + '<button class="btn full" data-act="close">Zamknij</button>'); });
  function bell() { var b = $('#bellBtn .badge'); if (b) b.textContent = allAlerts().length; }
  setInterval(function () { var V = VIEWS[cur]; if (V.tick) V.tick(); }, 500);
  var h = (location.hash || '').replace('#', '');
  go(VIEWS[h] ? h : 'start');
})();
