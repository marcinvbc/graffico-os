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
    ['', '', 'BHP', '3 montażystom wygasają uprawnienia do pracy na wysokości (do 14.11).']
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

  /* ---------- widoki ---------- */
  var VIEWS = {};

  VIEWS.start = {
    title: 'Graffico OS', sub: 'DEMO · WYBIERZ ROLĘ',
    html: function () {
      var r = function (go, ic, t, s) { return '<button class="role" data-go="' + go + '"><span class="ic">' + I[ic].replace('<svg', '<svg width="24" height="24"') + '</span><span><b>' + t + '</b><span>' + s + '</span></span></button>'; };
      return '<section class="hero"><span class="eyebrow">System zarządzania firmą · prototyp</span><h1>Jeden system od zapytania do protokołu odbioru</h1><p class="t-muted" style="margin:0;max-width:60ch">Wybierz, kim jesteś. Każda rola widzi swoje ekrany. Dane w demo są przykładowe.</p></section>' +
        '<div class="roles">' +
        r('pulpit', 'grid', 'Zarząd', 'Pulpit: zadania, alerty, wynik zleceń') +
        r('crm', 'crm', 'Handlowiec', 'Lejek sprzedaży, AI Gate, follow-upy') +
        r('zlecenie', 'doc', 'Kierownik projektu', 'Karta zlecenia 2155 – plan vs wykonanie') +
        r('plan', 'fab', 'Kierownik produkcji', 'Gantt gniazd i propozycje AI') +
        r('tablet', 'tab', 'Pracownik produkcji', 'Tablet: PIN, maszyna, czas, model 3D') +
        r('monter', 'pin', 'Montażysta', 'Plan na mapie, instrukcja krok po kroku') +
        r('hala', 'tv', 'Monitor na hali', 'Priorytety, komunikaty, ranking') +
        '</div>' +
        '<div class="coinrow"><img src="' + COIN + '" alt=""><span>Grafficoiny – punkty za zadania wykonane w czasie. Widoczne na tablecie i monitorach hali.</span></div>';
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
        '<section class="card"><div class="h-row"><h2>Alerty systemu</h2><span class="chip c-pink">5 wymaga reakcji</span></div><div class="grid">' +
        ALERTS.map(function (a) { return '<div class="alert ' + a[0] + '"><span class="chip ' + a[1] + '">' + a[2] + '</span><span>' + a[3] + '</span></div>'; }).join('') +
        '</div></section></div>' +
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
    }
  };

  VIEWS.crm = {
    title: 'CRM – lejek sprzedaży', sub: 'HANDLOWIEC',
    html: function () {
      return '<div class="kpis"><div class="kpi"><small>Wartość lejka</small><b>6,20 mln zł</b></div><div class="kpi"><small>Ważona</small><b>2,31 mln zł</b></div><div class="kpi"><small>Wygrane / przegrane</small><b class="tab">342 / 186</b></div><div class="kpi"><small>Najlepsze źródło</small><b style="font-size:17px">Polecenie · 41%</b></div><div class="kpi" style="border-color:rgba(255,153,0,.4)"><small class="t-orange">Follow-up po terminie</small><b>12</b></div></div>' +
        '<p class="t-dim" style="margin:0;font-size:13px">Przesuń w bok, aby zobaczyć etapy. Dotknij karty, aby otworzyć lead.</p>' +
        '<div class="scroll-x"><div class="kan">' + COLS.map(function (c, i) {
          return '<div class="col"><div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 4px 4px"><span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + c[1] + ';margin-right:6px"></i>' + c[0] + '</span><span class="t-dim">' + c[2] + '</span></div>' +
            LEADS.filter(function (l) { return l.col === i; }).map(function (l) {
              return '<button class="lead" data-act="lead" data-id="' + l.id + '" aria-pressed="' + (ui.lead === l.id) + '"><b style="font-size:14px;display:block">' + l.title + '</b><small class="t-muted">' + l.client + '</small><span style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><b>' + l.value + '</b><span class="chip">' + l.source + '</span></span><small class="' + (l.late ? 't-orange' : 't-dim') + '" style="display:block;margin-top:8px">Kontakt: ' + l.contact + '</small></button>';
            }).join('') + '</div>';
        }).join('') + '</div></div>';
    },
    on: function (act, el) {
      if (act === 'lead') { ui.lead = +el.dataset.id; ui.ai = false; openSheet(leadSheet()); }
      if (act === 'ai') { ui.ai = true; openSheet(leadSheet()); }
      if (act === 'win') { closeSheet(); toast('Lead przekazany do PM – utworzono zlecenie'); go('zlecenie'); }
    }
  };
  function leadSheet() {
    var l = LEADS.filter(function (x) { return x.id === ui.lead; })[0];
    return '<div class="grab"></div><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><small class="t-dim">Lead #' + l.id + ' · ' + COLS[l.col][0] + '</small><h2 style="font-size:20px">' + l.title + '</h2></div><span class="chip c-pink">Szansa ' + l.prob + '</span></div>' +
      '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));font-size:14px">' +
      [['Klient', l.client], ['Wartość', l.value], ['Źródło', l.source], ['Opiekun', 'Agnieszka W.'], ['Zamknięcie', l.close], ['Ostatni kontakt', l.contact]].map(function (p) { return '<div><small class="t-dim">' + p[0] + '</small><div>' + p[1] + '</div></div>'; }).join('') + '</div>' +
      '<button class="btn g full" data-act="ai">' + I.spark + 'AI Gate: kwalifikuj i wyceń</button>' +
      (ui.ai ? '<div class="alert a-green" style="flex-direction:column;gap:6px"><b class="t-green">Agent „Kwalifikacja leadów”</b><span>Potencjał <b>wysoki</b>. Podobne realizacje: 2090, 2136 (średnia marża 34%). Szacunek: 72–88 tys. zł netto, 210–240 h produkcji, 2 dni montażu. Ryzyko: fundament po stronie klienta – dopytaj.</span></div>' : '') +
      '<div class="alert a-orange"><span class="chip c-orange">NASTĘPNY KROK</span><span>Telefon – decyzja po wizualizacji · pon. 26.10, 10:00</span></div>' +
      '<div class="list"><div class="row"><span>Oferta 2026/10/118 wysłana</span><span class="t-dim">19.10</span></div><div class="row"><span>Wizualizacja v2 (PDF)</span><span class="t-dim">17.10</span></div><div class="row"><span>NDA podpisane</span><span class="t-green">ważne do 2027</span></div></div>' +
      '<button class="btn p full" data-act="win">Wygrana → przekaż do PM</button><button class="btn full" data-act="close">Zamknij</button>';
  }

  VIEWS.zlecenie = {
    title: 'Zlecenie 2155', sub: 'AMIC POLSKA · PYLON CENOWY',
    html: function () {
      var S = [['Sprzedaż', 'umowa 12.10', 2], ['PM', '13.10', 2], ['Projekt', 'rys. v3', 2], ['Magazyn', '3 z 4 poz.', 1], ['Produkcja', '86%', 1], ['Montaż', '29.10', 0], ['Odbiór', 'protokół', 0], ['Faktura', 'II i III', 0]];
      var O = [['Cięcie gilotyna', 12, 10.5], ['Gięcie', 16, 14], ['Frezowanie CNC', 24, 23], ['Spawanie', 64, 71.5], ['Szlifowanie', 30, 26], ['Malowanie', 40, 38], ['Elektryka LED', 30, 22], ['Pakowanie', 6, 0]];
      var tabs = ['Rozliczenie', 'Materiały', 'Jakość', 'Rozmowa'];
      var body = [
        '<div class="grid g2"><section class="card"><div class="h-row"><h2>Plan vs wykonanie</h2><small class="t-dim">szary = plan</small></div>' + O.map(function (o) { var over = o[2] > o[1]; return '<div class="op"><span>' + o[0] + '</span><span><i class="p" style="display:block;width:' + (o[1] / 72 * 100) + '%"></i><i class="r" style="display:block;width:' + (o[2] / 72 * 100) + '%;background:' + (over ? 'var(--red)' : 'var(--pink)') + '"></i></span><span class="tab ' + (over ? 't-red' : 't-muted') + '" style="text-align:right">' + String(o[2]).replace('.', ',') + ' / ' + o[1] + ' h</span></div>'; }).join('') + '</section>' +
        '<section class="card"><h2 style="font-size:17px;margin-bottom:6px">Płatności</h2><div class="list"><div class="row"><span>Zaliczka I · 30%</span><span class="t-green tab">20 520 zł ✓</span></div><div class="row"><span>II · 40% (po zdjęciach)</span><span class="t-orange tab">27 360 zł · do wystawienia</span></div><div class="row"><span>III · 30% (po odbiorze)</span><span class="t-dim tab">20 520 zł</span></div><div class="row"><span>Domówienie: blacha LPG</span><span class="t-pink tab">4 200 zł</span></div></div></section></div>',
        '<section class="card"><h2 style="font-size:17px;margin-bottom:6px">Materiały i rezerwacje (Wapro)</h2><div class="list"><div class="row"><span>Blacha Al 3 mm · 6 ark.<br><small class="t-dim">R2 / półka 4</small></span><span class="chip c-green">wydane</span></div><div class="row"><span>Profil 80×80×4 · 48 mb<br><small class="t-dim">Plac B</small></span><span class="chip c-green">wydane</span></div><div class="row"><span>Moduły LED · 220 szt.<br><small class="t-dim">Magazyn 1</small></span><span class="chip c-pink">zarezerwowane</span></div><div class="row"><span>Wyświetlacze cen LED · 4 szt.<br><small class="t-dim">dostawca</small></span><span class="chip c-orange">dostawa 26.10</span></div></div></section>',
        '<div class="grid g2"><section class="card"><h2 style="font-size:17px;margin-bottom:6px">Punkty kontroli jakości</h2><div class="list"><div class="row"><span>Cięcie i gięcie</span><span class="t-green">✓ Damian, 19.10</span></div><div class="row"><span>Spawanie konstrukcji</span><span class="t-green">✓ Artur, 21.10</span></div><div class="row"><span>Malowanie – RAL</span><span class="t-green">✓ Krzysztof, 22.10</span></div><div class="row"><span>Test LED 24 h</span><span class="t-orange">w toku</span></div></div></section>' +
        '<section class="card" style="border-color:rgba(255,90,90,.3)"><h2 style="font-size:17px;margin-bottom:6px">Karta zdarzeń krytycznych</h2><p style="margin:0;font-size:14px">Pliki do malarni wysłane w złej wersji. Działanie: blokada wysyłki plików bez statusu „aktualny”.</p><p class="t-red" style="margin:8px 0 0;font-size:14px">Koszt: 5 000 zł · zamknięte</p></section></div>',
        '<section class="card grid"><div><small class="t-dim">Karol (technolog) · 18.10</small><div>Technologia gotowa: P1 cięcie/gięcie, P2 spawanie, malarnia, P3 elektryka.</div></div><div><small class="t-dim">Kierownik produkcji · 22.10</small><div>Konstrukcja pomalowana, czekamy na wyświetlacze cen.</div></div><div><small class="t-dim">Agnieszka W. · dziś</small><div>Klient domówił blachę LPG (+4 200 zł). Dopisane do rozliczenia.</div></div><form data-form="msg" style="display:flex;gap:8px"><label for="msgIn" class="t-dim" style="position:absolute;left:-9999px">Wiadomość</label><input id="msgIn" class="in" placeholder="Napisz do zespołu zlecenia…"><button class="btn p">Wyślij</button></form></section>'
      ];
      return '<section style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span class="num" style="font-size:56px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">2155</span><div style="min-width:0;flex:1"><h1 style="font-size:22px">Pylon cenowy 6 m – AMIC Łódź</h1><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><span class="chip c-green">Montaż 29.10</span><span class="chip">PM: Robert Ś.</span><span class="chip c-orange">Zdjęcia wymagane</span></div></div></section>' +
        '<section class="card scroll-x"><div class="steps">' + S.map(function (s) { return '<div><i style="background:' + (s[2] === 2 ? 'var(--green)' : s[2] === 1 ? 'var(--grad)' : 'rgba(255,255,255,.1)') + '"></i><b style="' + (s[2] === 0 ? 'color:var(--dim)' : '') + '">' + (s[2] === 2 ? '✓ ' : '') + s[0] + '</b><small>' + s[1] + '</small></div>'; }).join('') + '</div></section>' +
        '<div class="kpis"><div class="kpi"><small>Wartość netto</small><b>68 400 zł</b><em class="t-dim">+ 4 200 zł domówienie</em></div><div class="kpi"><small>Godziny plan / real</small><b class="tab">240 / 226 h</b><em class="t-green">94% budżetu</em></div><div class="kpi"><small>Koszt do dziś</small><b>41 870 zł</b></div><div class="kpi"><small>Prognoza marży</small><b class="t-green">32,6%</b><em class="t-dim">plan 34%</em></div><div class="kpi"><small>Termin montażu</small><b>29.10</b><em class="t-green">za 6 dni</em></div></div>' +
        '<div class="seg">' + tabs.map(function (t, i) { return '<button data-act="otab" data-i="' + i + '" aria-pressed="' + (ui.otab === i) + '">' + t + '</button>'; }).join('') + '</div>' + body[ui.otab] +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-go="monter">Zlecenie montażu</button><button class="btn" data-act="share">Udostępnij klientowi</button></div>';
    },
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
        '<section class="card"><div class="h-row"><h2>Ludzie · poniedziałek</h2><small class="t-orange">brak 1 spawacza</small></div><div class="grid g2">' +
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
      if (act === 'sendprot') { if (!mt.signed) return toast('Poproś klienta o podpis w polu powyżej'); toast('Protokół wysłany – zlecenie 2155 zamknięte'); mt.screen = 'plan'; mt.signed = false; render(); }
    },
    photo: function (kind, url) { if (kind === 'step') { mt.photos[mt.step] = url; render(); } }
  };
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

  /* ---------- powłoka ---------- */
  var NAV = [['pulpit', 'Pulpit', 'grid'], ['crm', 'CRM', 'crm'], ['plan', 'Produkcja', 'fab'], ['tablet', 'Tablet', 'tab'], ['monter', 'Montaż', 'pin'], ['hala', 'Hala', 'tv']];
  var cur = 'start';
  function render() {
    var V = VIEWS[cur];
    $('#viewTitle').textContent = V.title; $('#viewSub').textContent = V.sub;
    $('#view').innerHTML = V.html();
    $('#nav').innerHTML = NAV.map(function (n) { return '<button data-go="' + n[0] + '"' + (cur === n[0] || (cur === 'zlecenie' && n[0] === 'pulpit') ? ' aria-current="page"' : '') + '>' + I[n[2]] + n[1] + '</button>'; }).join('');
    if (V.mount) V.mount();
    if (V.tick) V.tick();
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
    if (act === 'toggle') { a.classList.toggle('on'); a.querySelector('.box').textContent = a.classList.contains('on') ? '✓' : ''; return; }
    if (act === 'okqc') { closeSheet(); return toast('Kontrola jakości zapisana i podpisana'); }
    if (act === 'sendissue') { if (!$('#issuePhoto').classList.contains('ok')) return toast('Dodaj zdjęcie – bez niego zgłoszenie nie zostanie wysłane'); closeSheet(); return toast('Zgłoszenie wysłane – powiadomiono odpowiedzialne osoby'); }
    if (VIEWS[cur].on) VIEWS[cur].on(act, a);
  });
  document.addEventListener('change', function (e) {
    var inp = e.target; if (!inp.dataset || !inp.dataset.photo || !inp.files || !inp.files[0]) return;
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image(); img.onload = function () { var c = document.createElement('canvas'), s = Math.min(1, 900 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); var url = c.toDataURL('image/jpeg', .8);
        if (inp.dataset.photo === 'issue') { var l = $('#issuePhoto'); l.classList.add('ok'); l.querySelector('span').textContent = '✓ Zdjęcie dodane'; } else if (VIEWS[cur].photo) VIEWS[cur].photo(inp.dataset.photo, url); };
      img.src = fr.result;
    };
    fr.readAsDataURL(inp.files[0]);
  });
  document.addEventListener('submit', function (e) { e.preventDefault(); if (VIEWS[cur].submit) VIEWS[cur].submit(e.target); });
  $('#homeBtn').addEventListener('click', function () { go('start'); });
  $('#bellBtn').addEventListener('click', function () { openSheet('<div class="grab"></div><h2>Powiadomienia</h2><div class="grid">' + ALERTS.map(function (a) { return '<div class="alert ' + a[0] + '"><span class="chip ' + a[1] + '">' + a[2] + '</span><span>' + a[3] + '</span></div>'; }).join('') + '</div><button class="btn full" data-act="close">Zamknij</button>'); });
  setInterval(function () { var V = VIEWS[cur]; if (V.tick) V.tick(); }, 500);
  var h = (location.hash || '').replace('#', '');
  go(VIEWS[h] ? h : 'start');
})();
