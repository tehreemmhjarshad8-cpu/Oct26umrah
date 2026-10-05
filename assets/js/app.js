/*
  October Umrah 2026: live companion.
  One page built on the February 2026 app (same sections, tabs and look), plus a live layer:
  what's happening now and next, live flight status, journey progress, next prayer,
  lap counter, taxi card and calendar reminders.
  All trip content lives in assets/js/data.js.
  Preview any moment of the trip with ?now=2026-10-23T18:00 (Saudi time).
*/
(function () {
  'use strict';

  const T = window.TRIP;
  const P = window.PrayerTimes;
  const mainEl = document.getElementById('main');

  if (!T || !P) {
    mainEl.innerHTML = '<div class="card"><h2>Something went wrong</h2><p>The trip details could not be loaded. If you have just edited <code>assets/js/data.js</code>, check it for a missing comma or quote.</p></div>';
    return;
  }

  /* ================= Helpers ================= */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ESC[c]);
  const pad = (n) => String(n).padStart(2, '0');
  const mapUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  const badgeTBC = (on) => (on ? ' <span class="badge badge-tbc">TBC</span>' : '');

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('oct26:' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem('oct26:' + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  const ICONS = {
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/>',
    printer: '<path d="M6 9V2.5h12V9M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7.5" rx="1"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };
  const icon = (name, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  /* ================= Time ================= */

  const MIN = 60e3;
  const HOUR = 3600e3;

  // `?now=2026-10-27T16:00` (Saudi time) previews the app at any moment of the trip.
  const clockOffset = (() => {
    let p = null;
    try { p = new URLSearchParams(location.search).get('now'); } catch (e) { /* very old browser */ }
    if (!p) return 0;
    let s = p.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T09:00';
    if (/T\d{2}:\d{2}$/.test(s)) s += ':00';
    const t = Date.parse(s + '+03:00');
    return isNaN(t) ? 0 : t - Date.now();
  })();
  const now = () => Date.now() + clockOffset;

  function saudiParts(t) {
    const s = new Date(t + 3 * HOUR);
    return { ymd: s.toISOString().slice(0, 10), mins: s.getUTCHours() * 60 + s.getUTCMinutes() };
  }
  const asDate = (ymd) => new Date(ymd + 'T12:00:00Z');
  const addDays = (ymd, n) => new Date(asDate(ymd).getTime() + n * 864e5).toISOString().slice(0, 10);
  const fmtCache = {};
  function fmtDate(ymd, opts) {
    const key = JSON.stringify(opts);
    if (!fmtCache[key]) fmtCache[key] = new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: 'UTC' }, opts));
    return fmtCache[key].format(asDate(ymd));
  }
  // Built from parts so every browser shows "Wednesday 21 October" (some add a comma otherwise).
  const longDate = (ymd) => `${fmtDate(ymd, { weekday: 'long' })} ${fmtDate(ymd, { day: 'numeric' })} ${fmtDate(ymd, { month: 'long' })}`;
  const shortDate = (ymd) => `${fmtDate(ymd, { weekday: 'short' })} ${fmtDate(ymd, { day: 'numeric' })} ${fmtDate(ymd, { month: 'short' })}`;

  const hijriFormat = (() => {
    try {
      return new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return null;
    }
  })();
  // The "II" months come first so "Jumada I" doesn't match inside "Jumada II".
  const HIJRI_NAMES = [['Jumada II', 'Jumada al-Akhirah'], ['Jumada I', 'Jumada al-Ula'], ['Rabiʻ II', 'Rabi’ al-Thani'], ['Rabiʻ I', 'Rabi’ al-Awwal']];
  function hijri(ymd) {
    if (!hijriFormat) return '';
    try {
      let s = hijriFormat.format(asDate(ymd));
      if (!/14\d\d/.test(s)) return ''; // calendar unsupported: it fell back to Gregorian
      HIJRI_NAMES.forEach(([a, b]) => { s = s.replace(a, b); });
      return s;
    } catch (e) {
      return '';
    }
  }

  // UK offset from UTC on a given date (1 in summer time, 0 in winter).
  function ukOffset(ymd) {
    try {
      const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hourCycle: 'h23' }).format(new Date(ymd + 'T12:00:00Z')));
      return (h - 12 + 24) % 24;
    } catch (e) {
      return ymd >= '2026-03-29' && ymd < '2026-10-25' ? 1 : 0;
    }
  }
  const tzHours = (tz, ymd) => (tz === 'uk' ? ukOffset(ymd) : 3); // Saudi and Amman are UTC+3
  const TZ_LABEL = { uk: 'UK', amman: 'Amman' };
  const tzSuffix = (tz) => (TZ_LABEL[tz] ? ' ' + TZ_LABEL[tz] : '');
  const toStamp = (ymd, mins, tz) => Date.parse(ymd + 'T00:00:00Z') + (mins - tzHours(tz, ymd) * 60) * MIN;
  const parseHM = (s) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const shiftTo = (t, tz) => new Date(t + tzHours(tz, new Date(t).toISOString().slice(0, 10)) * HOUR);
  function localClock(t, tz) {
    const d = shiftTo(t, tz);
    return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
  }
  const localYmd = (t, tz) => shiftTo(t, tz).toISOString().slice(0, 10);
  function fmtLeft(ms) {
    if (ms < MIN) return 'now';
    const m = Math.round(ms / MIN);
    const d = Math.floor(m / 1440);
    const h = Math.floor((m % 1440) / 60);
    const mm = m % 60;
    if (d) return `${d}d ${h}h`;
    if (h) return `${h}h ${pad(mm)}m`;
    return `${mm} min`;
  }

  /* ================= Trip model ================= */

  const CITY = {
    travel: { label: 'Travel', place: null },
    makkah: { label: 'Makkah', place: 'makkah' },
    madinah: { label: 'Madinah', place: 'madinah' },
    'makkah-madinah': { label: 'Makkah → Madinah', place: 'makkah' },
  };
  const cityOf = (key) => CITY[key] || CITY.travel;
  const DAY_INDEX = {};
  T.days.forEach((d, i) => { DAY_INDEX[d.date] = i; });
  const dayOf = (ymd) => T.days[DAY_INDEX[ymd]];

  const SEGS = {};
  T.flights.forEach((f) => f.segments.forEach((s) => {
    s.start = toStamp(s.from.date, parseHM(s.from.time), s.from.tz);
    s.end = toStamp(s.to.date, parseHM(s.to.time), s.to.tz);
    s.dir = f.dir;
    s.airline = f.airline;
    SEGS[s.no] = s;
  }));
  const PROG = {};
  T.programme.items.forEach((p) => { PROG[p.id] = p; });
  const DUAS = {};
  T.duas.forEach((d) => { DUAS[d.id] = d; });
  const STEPS = {};
  T.guide.steps.forEach((s) => { STEPS[s.id] = s; });
  const HOTELS = {};
  T.hotels.forEach((h) => { HOTELS[h.id] = h; });

  const prayerCache = {};
  function prayersFor(ymd, place) {
    const k = ymd + '|' + place;
    if (!prayerCache[k]) prayerCache[k] = P.forDay(ymd, T.places[place]);
    return prayerCache[k];
  }
  const PRAYER_LABEL = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
  // A travel day can name a `place` for its prayer times (e.g. Madinah before the flight home).
  const datePlace = (ymd) => {
    const d = dayOf(ymd);
    return d ? d.place || cityOf(d.city).place : null;
  };

  // Rough positions for wording like "Morning", used only to keep the order of the day.
  const PARTS = [
    [/^before you fly/i, 8 * 60], [/^before leaving/i, 9 * 60], [/^early/i, 5 * 60], [/^late morning/i, 11 * 60],
    [/^morning/i, 9 * 60], [/^all day/i, 8 * 60], [/^today/i, 7 * 60], [/^afternoon/i, 14 * 60 + 30],
    [/^late evening/i, 22 * 60 + 30], [/^evening/i, 20 * 60], [/^night/i, 22 * 60],
  ];

  // Turns `at` into a label, an approximate clock and a start (minutes, local) when it can be known.
  function resolveTime(at, ymd, tz) {
    if (!at) return { label: '', clock: '', mins: null, timed: false };
    const exact = parseHM(at);
    if (exact != null) return { label: at + tzSuffix(tz), clock: '', mins: exact, timed: true };
    const place = datePlace(ymd);
    const at0 = /^(fajr|dhuhr|asr|maghrib|isha)$/.exec(at);
    if (at0) {
      const label = PRAYER_LABEL[at0[1]];
      if (!place) return { label, clock: '', mins: null, timed: false };
      const pm = prayersFor(ymd, place)[at0[1]];
      return { label, clock: '~' + P.format(pm), mins: pm, timed: true };
    }
    const rel = /^(after|before):(fajr|dhuhr|asr|maghrib|isha)$/.exec(at);
    if (rel) {
      const label = (rel[1] === 'after' ? 'After ' : 'Before ') + PRAYER_LABEL[rel[2]];
      if (!place) return { label, clock: '', mins: null, timed: false };
      const pm = prayersFor(ymd, place)[rel[2]];
      return { label, clock: '~' + P.format(pm), mins: rel[1] === 'after' ? pm + 15 : pm - 30, timed: true };
    }
    if (at === 'jumuah') {
      if (!place) return { label: 'Jumu’ah', clock: '', mins: null, timed: false };
      const pm = prayersFor(ymd, place).dhuhr;
      return { label: 'Jumu’ah', clock: '~' + P.format(pm), mins: pm, timed: true };
    }
    if (at === 'TBC') return { label: 'Time TBC', clock: '', mins: null, timed: false };
    for (const [re, m] of PARTS) if (re.test(at)) return { label: at, clock: '', mins: m, timed: false };
    return { label: at, clock: '', mins: null, timed: false };
  }

  const TYPE_ICON = { flight: '✈️', travel: '🚌', hotel: '🏨', ibadah: '🕋', programme: '⭐', ziyarah: '📍', free: '🤲', info: 'ℹ️' };
  const DEFAULT_DUR = { flight: 120, travel: 60, hotel: 30, ibadah: 45, programme: 90, ziyarah: 120, free: 60, info: 0 };

  function buildItem(raw, d, di, ii) {
    const base = { id: 'i-' + d.date + '-' + ii, date: d.date, dayIndex: di, link: raw.link || '', tbc: !!raw.tbc, note: raw.note || '', meet: raw.meet || '' };
    if (raw.flight) {
      const s = SEGS[raw.flight];
      if (!s) return null;
      return Object.assign(base, {
        type: 'flight', icon: '✈️', seg: s, timed: true, start: s.start, end: s.end, tz: s.from.tz,
        label: s.from.time + tzSuffix(s.from.tz), clock: '',
        title: `${s.no}: ${s.from.name.split(' ')[0]} → ${s.to.name.split(' ')[0]}`,
        sub: `${s.duration} · ${s.aircraft} · lands ${s.to.time}${tzSuffix(s.to.tz)}`,
        link: raw.link || 'flights',
      });
    }
    if (raw.programme) {
      const p = PROG[raw.programme];
      if (!p) return null;
      const r = resolveTime(p.at, d.date, p.tz);
      const start = r.timed ? toStamp(d.date, r.mins, p.tz) : null;
      return Object.assign(base, {
        type: 'programme', icon: p.icon || '⭐', prog: p, progId: p.id, kind: p.kind,
        label: r.label, clock: r.clock, timed: r.timed, start, end: start != null ? start + (p.dur || 90) * MIN : null,
        partMins: r.timed ? null : r.mins, tz: p.tz,
        title: p.title, note: p.text, meet: p.meet || '', tbc: !!p.tbc, link: raw.link || 'programme/' + p.id,
      });
    }
    const r = resolveTime(raw.at, d.date, raw.tz);
    const start = r.timed ? toStamp(d.date, r.mins, raw.tz) : null;
    const dur = raw.dur != null ? raw.dur : (DEFAULT_DUR[raw.type] != null ? DEFAULT_DUR[raw.type] : 60);
    return Object.assign(base, {
      type: raw.type || 'info', icon: raw.icon || TYPE_ICON[raw.type] || '•',
      label: r.label, clock: r.clock, timed: r.timed, start, end: start != null ? start + dur * MIN : null,
      partMins: r.timed ? null : r.mins, tz: raw.tz, title: raw.title || '',
    });
  }

  // Items keep the order they are written in data.js; `order` is used to tell what came before what.
  const ITEMS = [];
  T.days.forEach((d, di) => {
    d.items.forEach((raw, ii) => {
      const it = buildItem(raw, d, di, ii);
      if (!it) return;
      it.order = ITEMS.length;
      ITEMS.push(it);
    });
  });
  const TIMED = ITEMS.filter((i) => i.timed && i.type !== 'info').sort((a, b) => a.start - b.start);
  const ITEM_BY_PROG = {};
  ITEMS.forEach((i) => { if (i.progId) ITEM_BY_PROG[i.progId] = i; });
  const ITEM_BY_ID = {};
  ITEMS.forEach((i) => { ITEM_BY_ID[i.id] = i; });

  const TRIP_START = Date.parse(T.meta.tripStart);
  const DEPARTURE = Date.parse(T.meta.departure);
  const HOME = Date.parse(T.meta.homeArrival);
  const KEY_TYPES = { programme: 1, travel: 1, hotel: 1, ibadah: 1, ziyarah: 1 };

  // An untimed item counts as done once its day is over, or a later timed item that day has started.
  function untimedDone(i, t) {
    const today = saudiParts(t).ymd;
    if (i.date < today) return true;
    if (i.date > today) return false;
    return ITEMS.some((j) => j.date === i.date && j.order > i.order && j.timed && j.start <= t);
  }

  function computeLive(t) {
    const phase = t < TRIP_START ? 'before' : t < HOME + 6 * HOUR ? 'during' : 'after';
    const s = saudiParts(t);
    let dayIndex = DAY_INDEX[s.ymd];
    if (dayIndex == null) dayIndex = s.ymd < T.days[0].date ? 0 : T.days.length - 1;
    let nowItem = null;
    TIMED.forEach((i) => { if (i.start <= t && t < i.end) nowItem = i; });
    const nextItem = TIMED.find((i) => i.start > t) || null;
    let todayKey = null;
    if (phase === 'during') {
      const open = ITEMS.filter((i) => i.date === s.ymd && !i.timed && KEY_TYPES[i.type] && !untimedDone(i, t));
      todayKey = open.find((i) => i.type === 'programme') || open[0] || null;
    }
    return { t, phase, s, dayIndex, day: T.days[dayIndex], nowItem, nextItem, todayKey };
  }

  function stateOf(i, L) {
    if (i.timed) {
      if (L.t >= i.end) return 'done';
      if (L.t >= i.start) return 'now';
      if (L.nextItem === i) return 'next';
      return '';
    }
    if (L.phase === 'before') return '';
    if (untimedDone(i, L.t)) return 'done';
    if (L.todayKey === i) return 'today';
    return '';
  }

  function whenText(i, t) {
    const today = localYmd(t, i.tz); // "today" where the item happens (UK items use the UK date)
    const time = i.label + (i.clock ? ' ' + i.clock : '');
    if (i.date === today) return time;
    if (i.date === addDays(today, 1)) return 'Tomorrow · ' + time;
    return shortDate(i.date) + ' · ' + time;
  }
  function untilText(i) {
    if (i.seg) return 'lands ' + i.seg.to.time + tzSuffix(i.seg.to.tz);
    return 'until ~' + localClock(i.end, i.tz);
  }

  // Where prayer times apply right now: switches to Madinah once the coach arrives, and
  // on a travel day with a `place` it applies until that day's first flight takes off.
  function livePlace(t) {
    const d = dayOf(saudiParts(t).ymd);
    if (!d) return null;
    if (d.city === 'makkah-madinah') {
      const coach = ITEMS.find((i) => i.date === d.date && i.type === 'travel' && i.timed);
      return coach && t >= coach.end ? 'madinah' : 'makkah';
    }
    if (d.place) {
      const flight = ITEMS.find((i) => i.date === d.date && i.type === 'flight');
      return flight && t >= flight.start ? null : d.place;
    }
    return cityOf(d.city).place;
  }
  const currentHotel = (t) => (t < Date.parse(HOTELS.makkah.until) ? HOTELS.makkah : HOTELS.madinah);
  const emergencyContacts = () => {
    const out = [];
    T.contacts.forEach((g) => g.items.forEach((c) => { if (c.emergency) out.push(c); }));
    return out;
  };

  function linkLabel(link) {
    const [root, id] = link.split('/');
    if (root === 'duas' && DUAS[id]) return DUAS[id].title;
    if (root === 'steps') return id && STEPS[id] ? 'How-To: ' + STEPS[id].title : 'How to perform Umrah';
    if (root === 'maps') return id ? 'Ziyarat sites' : 'Hotel and map';
    if (root === 'flights') return 'Flight details';
    if (root === 'video') return 'Watch the seminar';
    if (root === 'apps') return 'Get the Nusuk app';
    if (root === 'programme') return 'Programme and notes';
    if (root === 'day') return 'Itinerary';
    return 'More';
  }

  /* ================= Header ================= */

  const headerEl = document.getElementById('top');
  let headerMode = '';

  function modeFor(t) {
    if (t < DEPARTURE) return 'countdown';
    if (t < HOME) return 'trip';
    return 'done';
  }

  function renderHeader(L) {
    const mode = modeFor(L.t);
    headerMode = mode;
    const m = T.meta;
    const title = esc(m.title).replace(/(January|February|March|April|May|June|July|August|September|October|November|December|Ramadan)/, '<span class="hl">$1</span>');
    const range = `${fmtDate(m.startDate, { day: 'numeric', month: 'short' })} – ${fmtDate(m.endDate, { day: 'numeric', month: 'short' })} 2026`;
    let status = '';
    if (mode === 'countdown') {
      const first = TIMED[0];
      status = `<div class="status" data-status>
        <p class="status-label">Countdown to Departure</p>
        <div class="countdown">${['days', 'hours', 'mins', 'secs'].map((u) => `<div class="cd-unit"><b data-cd="${u}">--</b><span>${u[0].toUpperCase() + u.slice(1)}</span></div>`).join('')}</div>
        ${first ? `<p class="status-sub">${esc(first.seg ? first.seg.no : first.title)} · ${esc(shortDate(first.date))} · ${esc(first.label)} from ${esc(first.seg ? first.seg.from.name : '')}</p>` : ''}
      </div>`;
    } else if (mode === 'trip') {
      status = `<div class="status is-trip" data-status>
        <p class="status-label">Your Journey Progress</p>
        <div class="day-dots" data-dots>${T.days.map((d, i) => `<a class="day-dot" href="#day/${d.date}" data-dot="${i}" aria-label="Day ${i + 1}, ${esc(shortDate(d.date))}">${i + 1}</a>`).join('')}</div>
        <div class="bar"><span data-progress style="width:0%"></span></div>
        <p class="status-sub" data-progress-text></p>
      </div>`;
    } else {
      status = '<div class="status" data-status><p class="status-done">Alhamdulillah! May your Umrah be accepted.</p></div>';
    }
    headerEl.className = 'hero' + (mode === 'trip' ? ' is-compact' : '');
    headerEl.innerHTML = `
      <div class="hero-tools no-print">
        <span class="offline-chip" role="status">Offline</span>
        <button type="button" class="hero-btn" data-action="theme" id="themeBtn" aria-label="Switch light or dark">${icon('moon')}</button>
        <button type="button" class="hero-btn" data-action="share" aria-label="Share this app">${icon('share')}</button>
        <button type="button" class="hero-btn" data-action="print" aria-label="Save as PDF">${icon('printer')}</button>
      </div>
      ${m.logo ? `<img class="hero-logo" src="${esc(m.logo)}" alt="${esc(m.organiser)}">` : ''}
      <div class="date-pill">${esc(range)}</div>
      <h1>${title}</h1>
      <p class="hero-org">${esc(m.organiser)}</p>
      ${status}
      ${mode === 'trip' ? '' : `<div class="guide-pill"><span class="gp-label">Guide:</span> <span>${esc(m.scholar)}</span></div>
      <div class="hotel-badge">${T.hotels.map((h) => `<a href="#maps"><span>${esc(h.city)} (${esc(h.dates)})</span><b>${esc(h.name)}</b></a>`).join('')}</div>`}`;
    applyThemeIcon();
    updateHeaderLive(L);
  }

  function updateCountdown(t) {
    const cells = $$('[data-cd]', headerEl);
    if (!cells.length) return;
    let left = Math.max(0, DEPARTURE - t);
    const d = Math.floor(left / 864e5); left -= d * 864e5;
    const h = Math.floor(left / HOUR); left -= h * HOUR;
    const m = Math.floor(left / MIN); left -= m * MIN;
    const vals = { days: d, hours: pad(h), mins: pad(m), secs: pad(Math.floor(left / 1000)) };
    cells.forEach((c) => { c.textContent = vals[c.dataset.cd]; });
  }

  function updateHeaderLive(L) {
    if (headerMode !== modeFor(L.t)) {
      renderHeader(L);
      return;
    }
    updateCountdown(L.t);
    const bar = $('[data-progress]', headerEl);
    if (bar) {
      const pct = Math.max(0, Math.min(100, ((L.t - DEPARTURE) / (HOME - DEPARTURE)) * 100));
      bar.style.width = pct.toFixed(1) + '%';
      $$('[data-dot]', headerEl).forEach((dot) => {
        const i = Number(dot.dataset.dot);
        dot.classList.toggle('completed', i < L.dayIndex);
        dot.classList.toggle('current', i === L.dayIndex);
      });
      $('[data-progress-text]', headerEl).textContent = `Day ${L.dayIndex + 1} of ${T.days.length} · ${shortDate(L.day.date)} · ${cityOf(L.day.city).label}`;
    }
  }

  /* ================= Navigation + live strip ================= */

  const navEl = document.getElementById('nav');
  const SECTIONS = [
    { id: 'today', label: '📍 Today' },
    { id: 'video', label: '▶ Video' },
    { id: 'flights', label: '✈️ Flights' },
    { id: 'itinerary', label: '📅 Itinerary' },
    { id: 'programme', label: '🕌 Programme' },
    { id: 'maps', label: '🗺️ Maps' },
    { id: 'apps', label: '📱 Apps' },
    { id: 'steps', label: '🕋 How-To' },
    { id: 'duas', label: '🤲 Duas' },
    { id: 'prayer', label: '🕰️ Prayer' },
    { id: 'packing', label: '🎒 Packing' },
    { id: 'tips', label: '💡 Tips' },
    { id: 'contacts', label: '📞 Contacts' },
  ];

  let navPhase = '';
  function renderNav(L) {
    navPhase = L.phase;
    stripHTMLCache = '';
    navEl.innerHTML = `<ul class="nav-list" id="navList">${SECTIONS.map((s) => {
      const label = s.id === 'today' && L.phase !== 'during' ? '🏠 Home' : s.label;
      return `<li><a class="nav-link" href="#${s.id}" data-nav="${s.id}">${esc(label)}${s.id === 'today' ? '<span class="dot" data-update-dot hidden></span>' : ''}</a></li>`;
    }).join('')}</ul><div data-strip></div>`;
  }

  function liveSummary(L) {
    if (L.phase === 'after') return null;
    if (L.nowItem) return { tag: 'Now', item: L.nowItem, meta: untilText(L.nowItem), left: '' };
    const n = L.nextItem;
    if (n && n.start - L.t < 12 * HOUR) return { tag: 'Next', item: n, meta: whenText(n, L.t), left: 'in ' + fmtLeft(n.start - L.t) };
    if (L.todayKey) return { tag: 'Today', item: L.todayKey, meta: L.todayKey.label + (L.todayKey.meet ? ' · ' + L.todayKey.meet : ''), left: '' };
    if (n) return { tag: 'Next', item: n, meta: whenText(n, L.t), left: fmtLeft(n.start - L.t) };
    return null;
  }

  let stripHTMLCache = '';
  function renderStrip(L) {
    const box = $('[data-strip]', navEl);
    if (!box) return;
    const s = liveSummary(L);
    const html = s
      ? `<button type="button" class="live live-${s.tag.toLowerCase()}" data-action="goto" data-target="today" aria-label="${esc(s.tag + ': ' + s.item.title)}">
          <span class="live-tag${L.phase === 'during' ? ' is-live' : ''}"><i></i>${esc(s.tag.toUpperCase())}</span>
          <span class="live-text"><span class="live-title">${esc(s.item.icon)} ${esc(s.item.title)}</span><span class="live-meta">${esc(s.meta)}</span></span>
          ${s.left ? `<span class="live-left">${esc(s.left)}</span>` : ''}
        </button>`
      : '';
    if (html !== stripHTMLCache) {
      stripHTMLCache = html;
      box.innerHTML = html;
      polishText(box);
      measureNav();
    }
  }

  function measureNav() {
    document.documentElement.style.setProperty('--nav-h', navEl.offsetHeight + 'px');
  }

  let activeSection = '';
  function setActive(id, force) {
    if (id === activeSection && !force) return;
    activeSection = id;
    $$('.nav-link', navEl).forEach((a) => {
      const on = a.dataset.nav === id;
      a.classList.toggle('active', on);
      if (on) {
        a.setAttribute('aria-current', 'true');
        const list = $('#navList');
        const li = a.parentElement;
        list.scrollTo({ left: li.offsetLeft - list.clientWidth / 2 + li.clientWidth / 2, behavior: 'smooth' });
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  // Highlights the section under the sticky bar: the last one whose top has scrolled past it.
  function spy() {
    const line = navEl.getBoundingClientRect().bottom + 24;
    let current = SECTIONS[0].id;
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= line) current = s.id;
    });
    const doc = document.documentElement;
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) current = SECTIONS[SECTIONS.length - 1].id;
    setActive(current);
  }
  function initScrollSpy() {
    let queued = false;
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; spy(); });
    }, { passive: true });
  }

  /* ================= Sections ================= */

  const secHead = (emoji, title, extra) =>
    `<div class="sec-head"><h2><span class="sec-emoji" aria-hidden="true">${emoji}</span>${esc(title)}</h2>${extra || ''}</div>`;

  // ---- Today ----
  function todaySection() {
    return `<section class="sec" id="today">
      <div data-today></div>
      <div class="stack" style="margin-top:14px">
        ${updatesCard()}
        ${tbcCard()}
      </div>
    </section>`;
  }

  function spotHTML(L) {
    const s = liveSummary(L);
    if (!s) return '';
    const i = s.item;
    let count = '';
    if (s.tag === 'Now') {
      const pct = Math.max(0, Math.min(100, ((L.t - i.start) / (i.end - i.start)) * 100));
      count = `<div class="bar"><span style="width:${pct.toFixed(1)}%"></span></div><p class="spot-when">${esc(untilText(i))} · ${esc(fmtLeft(i.end - L.t))} to go</p>`;
    } else if (s.left) {
      count = `<p class="spot-count"><b>${esc(fmtLeft(i.start - L.t))}</b> to go</p>`;
    }
    const tagText = s.tag === 'Now' ? 'Happening now' : s.tag === 'Today' ? 'Today' : (L.phase === 'before' ? 'First up' : 'Next up');
    const actions = [];
    if (i.seg) actions.push(`<a class="btn btn-primary btn-sm" href="${trackUrl(i.seg)}" target="_blank" rel="noopener">Track ${esc(i.seg.no)} live ↗</a>`);
    if (i.link) actions.push(`<a class="btn btn-sm" href="#${esc(i.link)}">${esc(linkLabel(i.link))}</a>`);
    actions.push(`<a class="btn btn-sm" href="#day/${i.date}">Full day</a>`);
    // What comes before or after, in the order of the day (untimed steps like "Coach to Makkah" included).
    let then = '';
    const line = (label, x) => `<p class="spot-then">${label} <b>${esc(x.icon)} ${esc(x.title)}</b>${badgeTBC(x.tbc)} · ${esc(whenText(x, L.t))}</p>`;
    if (s.tag === 'Now') {
      const after = ITEMS.find((x) => x.order > i.order && x.type !== 'info');
      if (after) then = line('Then:', after);
    } else if (s.tag === 'Next' && L.todayKey && L.todayKey.order < i.order) {
      then = line('Before that:', L.todayKey);
    }
    return `<div class="spot">
      <p class="spot-tag"><i></i>${esc(tagText)}</p>
      <p class="spot-title">${esc(i.icon)} ${esc(i.title)}${badgeTBC(i.tbc)}</p>
      <p class="spot-when">🕐 ${esc(whenText(i, L.t))}</p>
      ${i.meet ? `<p class="spot-meet">📍 ${esc(i.meet)}</p>` : ''}
      ${count}
      <div class="spot-actions">${actions.join('')}</div>
      ${then}
    </div>`;
  }

  function nextPrayerHTML(place, t) {
    const s = saudiParts(t);
    const times = prayersFor(s.ymd, place);
    const order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let next = order.find((k) => times[k] > s.mins);
    let nextMins;
    let tomorrow = false;
    if (next) nextMins = times[next];
    else {
      next = 'fajr';
      nextMins = prayersFor(addDays(s.ymd, 1), place).fajr + 1440;
      tomorrow = true;
    }
    const friday = asDate(s.ymd).getUTCDay() === 5;
    const name = (k) => (k === 'dhuhr' && friday ? 'Jumu’ah' : P.NAMES[k]);
    return `<div class="card np-card">
      <div class="np-top"><span class="np-label">🕰️ Next prayer · ${esc(T.places[place].name)}</span><a class="small" href="#prayer">All times</a></div>
      <div class="np-main"><span class="np-name">${esc(name(next))}</span><span class="np-time">~${P.format(nextMins)}</span><span class="np-left">in ${fmtLeft((nextMins - s.mins) * MIN)}</span></div>
      <ul class="np-strip">${P.ORDER.map((k) => `<li class="${k === next && !tomorrow ? 'is-next' : times[k] <= s.mins ? 'is-past' : ''}">${esc(name(k))}<b>${P.format(times[k])}</b></li>`).join('')}</ul>
    </div>`;
  }

  function quickActions(L) {
    const hotel = currentHotel(L.t);
    const em = emergencyContacts()[0];
    return `<div class="qa-grid">
      <button type="button" class="qa" data-action="taxi" data-hotel="${hotel.id}"><span aria-hidden="true">🚕</span>Taxi card</button>
      ${em ? `<a class="qa" href="tel:${esc(em.tel)}"><span aria-hidden="true">📞</span>Call ${esc(em.value.split(' ')[0])}</a>` : ''}
      <button type="button" class="qa" data-action="counter"><span aria-hidden="true">🔁</span>Lap counter</button>
      <a class="qa" href="#prayer"><span aria-hidden="true">🕰️</span>Prayer times</a>
      <a class="qa" href="#duas"><span aria-hidden="true">🤲</span>Du’as</a>
      <a class="qa" href="${mapUrl(hotel.mapQuery)}" target="_blank" rel="noopener"><span aria-hidden="true">🗺️</span>Hotel map</a>
    </div>`;
  }

  function dayPlanHTML(d, L) {
    const items = ITEMS.filter((i) => i.date === d.date && i.type !== 'info');
    return `<ul class="mini-list">${items.map((i) => {
      const st = stateOf(i, L);
      return `<li class="${st ? 'is-' + st : ''}"><span class="mt">${esc(i.label || '')}${i.clock ? ' ' + esc(i.clock) : ''}</span><span>${esc(i.icon)} ${esc(i.title)}${st === 'now' ? ' <span class="chip chip-now">Now</span>' : ''}</span></li>`;
    }).join('')}</ul>`;
  }

  function checklistProgress() {
    const ticked = store.get('checks', {});
    let total = 0;
    let done = 0;
    T.checklist.forEach((g) => g.items.forEach((i) => { total++; if (ticked[i.id]) done++; }));
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function readyCard() {
    const p = checklistProgress();
    const row = (emoji, href, title, sub, extra) =>
      `<a class="ready-row" href="${href}"><span class="ready-emoji" aria-hidden="true">${emoji}</span><span class="ready-text"><b>${title}</b><small>${sub}</small></span>${extra || icon('chevronRight')}</a>`;
    return `<div class="card">
      ${row('🎒', '#packing', 'Packing checklist', `${p.done} of ${p.total} packed`, `<span class="meter" aria-hidden="true"><span style="width:${p.pct}%"></span></span>`)}
      ${row('▶️', '#video', 'Watch the essential seminar', 'Covers the essentials and common questions')}
      ${row('📱', '#apps', 'Install Nusuk', 'Mandatory for booking your Rawdah slot')}
      ${row('🗺️', '#maps', 'Download offline maps', 'Makkah and Madinah, before you fly')}
      ${row('🕋', '#steps', 'Read the Umrah guide', 'Ihram in Amman, intention before the miqat')}
      <div class="ready-row" data-install-row>${installRowHTML()}</div>
    </div>`;
  }

  let weather = null;
  function weatherHTML() {
    if (!weather) return '';
    return `<span class="weather" title="Temperature now">🌡️ Makkah ${Math.round(weather.makkah)}° · Madinah ${Math.round(weather.madinah)}°</span>`;
  }

  let todayCache = '';
  function renderToday(L) {
    const box = $('[data-today]');
    if (!box) return;
    let html = '';
    if (L.phase === 'before') {
      html = `${secHead('🏠', 'Getting ready')}
        <p class="today-meta">${esc(longDate(saudiParts(L.t).ymd))} ${weatherHTML()}</p>
        <div class="stack">${spotHTML(L)}${readyCard()}${quickActions(L)}</div>`;
    } else if (L.phase === 'during') {
      const d = L.day;
      const place = livePlace(L.t);
      const h = hijri(d.date);
      const tomorrow = T.days[L.dayIndex + 1];
      html = `${secHead('📍', 'Today')}
        <p class="today-meta"><span>Day ${L.dayIndex + 1} of ${T.days.length} · ${esc(longDate(d.date))}${h ? ' · ' + esc(h) : ''}</span><span class="tag ${d.city === 'travel' ? 'tag-travel' : 'tag-city'}">${esc(cityOf(d.city).label)}</span>${weatherHTML()}</p>
        <div class="stack">
          ${spotHTML(L)}
          ${place ? nextPrayerHTML(place, L.t) : ''}
          <div class="card"><div class="np-top"><span class="np-label">📅 Today’s plan · ${esc(d.title)}</span><a class="small" href="#day/${d.date}">Full day</a></div>${dayPlanHTML(d, L)}</div>
          ${quickActions(L)}
          ${tomorrow ? `<a class="card ready-row" href="#day/${tomorrow.date}" style="padding:16px 18px"><span class="ready-emoji" aria-hidden="true">🌙</span><span class="ready-text"><b>Tomorrow · ${esc(tomorrow.title)}${badgeTBC(tomorrow.tbc)}</b><small>${esc(shortDate(tomorrow.date))} · ${esc(tomorrow.summary)}</small></span>${icon('chevronRight')}</a>` : ''}
        </div>`;
    } else {
      html = `${secHead('🏠', 'Welcome home')}
        <div class="stack"><div class="video" style="text-align:left"><h2>Alhamdulillah!</h2><p style="margin:8px 0 0">May Allah accept your Umrah, your du’as and your efforts, and invite us back to His House again and again. Taqabbal Allahu minna wa minkum.</p></div>
        <div class="row-btns"><a class="btn" href="#programme">Your programme notes</a><a class="btn" href="#duas/travel">Du’a for returning</a></div></div>`;
    }
    if (html !== todayCache) {
      todayCache = html;
      box.innerHTML = html;
      polishText(box);
    }
  }

  function updateKey(u) { return u.date + '|' + u.title; }
  function updatesCard() {
    const seen = new Set(store.get('seenUpdates', []));
    return `<div class="card" id="updates">
      <div class="np-top" style="margin-bottom:4px"><span class="np-label">📢 Latest updates</span><span class="small muted">Updated ${esc(fmtDate(T.meta.lastUpdated, { day: 'numeric', month: 'short' }))}</span></div>
      <ul class="updates">${T.updates.map((u) => `<li><b>${esc(u.title)}</b>${badgeTBC(u.tbc)}${seen.has(updateKey(u)) ? '' : ' <span class="badge badge-new" data-new>NEW</span>'}<p>${esc(u.text)}</p></li>`).join('')}</ul>
    </div>`;
  }
  function tbcCard() {
    if (!T.tbc || !T.tbc.length) return '';
    return `<details class="card fold"><summary><span>⏳ Still to be confirmed (${T.tbc.length})</span>${icon('chevronDown', 'chev')}</summary>
      <ul class="tbc-list">${T.tbc.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
  }

  // ---- Video ----
  function videoSection() {
    const s = T.seminar;
    if (!s) return '';
    return `<section class="sec" id="video"><div class="video">
      <h2>${esc(s.title)}</h2>
      <p>${esc(s.text)}</p>
      ${s.url ? `<a class="watch" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">▶ Watch Seminar Now</a><p class="note">Clicking opens the video in a new tab</p>` : '<p class="note">Recording link coming soon</p>'}
    </div></section>`;
  }

  // ---- Flights ----
  const trackUrl = (s) => 'https://www.flightradar24.com/data/flights/' + s.no.replace(/\s+/g, '').toLowerCase();
  function flightsSection() {
    const cards = T.flights.map((f) => {
      const segs = f.segments.map((s, i) => `
        <div class="seg" data-seg="${esc(s.no)}">
          <div class="seg-top"><span class="seg-no">${esc(s.no)}</span><span class="seg-status" data-seg-status>Scheduled</span><a class="seg-track" href="${trackUrl(s)}" target="_blank" rel="noopener">Track live ↗</a></div>
          <div class="seg-route">
            <div class="seg-end"><p class="t">${esc(s.from.time)}</p><p class="code">${esc(s.from.code)}</p><p class="city">${esc(s.from.name)}${s.from.tz === 'uk' ? ' · UK time' : ''}</p></div>
            <div class="seg-mid"><div class="line"></div><div class="seg-mid-c">${icon('plane')}<p>${esc(s.duration)}</p><p class="ns">Non-stop</p></div><div class="line"></div></div>
            <div class="seg-end"><p class="t">${esc(s.to.time)}</p><p class="code">${esc(s.to.code)}</p><p class="city">${esc(s.to.name)}${s.to.tz === 'uk' ? ' · UK time' : ''}</p></div>
          </div>
          <div class="seg-progress" data-seg-progress hidden><span></span></div>
          <div class="tiles">
            <div><p>Flight No.</p><b>${esc(s.no)}</b></div>
            <div><p>Aircraft</p><b>${esc(s.aircraft)}</b></div>
            <div><p>Cabin</p><b>${esc(s.cabin)}</b></div>
            <div><p>Departs</p><b>${esc(shortDate(s.from.date))}</b></div>
          </div>
        </div>
        ${f.layovers && f.layovers[i] ? `<div class="layover">⏱️ ${esc(f.layovers[i])}</div>` : ''}`).join('');
      return `<div class="card flight card-hover">
        <div class="flight-hd"><div><span class="eyebrow">${esc(f.dir)} Flight</span><h3>${esc(shortDate(f.date))} 2026</h3></div><span class="airline">${esc(f.airline)}</span></div>
        ${segs}
      </div>`;
    }).join('');
    const bag = T.baggage && T.baggage.length ? `<div class="bag-box"><h3>🧳 Baggage Allowance</h3><div class="bag-grid">${T.baggage.map((b) => `<div class="bag"><span class="e" aria-hidden="true">${esc(b.emoji)}</span><div><b>${esc(b.title)}</b><small>${esc(b.detail)}</small></div><strong>${esc(b.value)}</strong></div>`).join('')}</div>${T.baggageNote ? `<p class="small muted" style="margin-top:10px">${esc(T.baggageNote)}</p>` : ''}</div>` : '';
    const transfers = `<div class="card"><h3 class="sub-head" style="margin-top:0">🚌 Transfers</h3><ul class="list">${T.transfers.map((x) => `<li><b>${esc(x.title)}${badgeTBC(x.tbc)}</b><small>${esc(x.when)}</small><p>${esc(x.note)}</p></li>`).join('')}</ul></div>`;
    return `<section class="sec" id="flights">${secHead('✈️', 'Flight Details')}<div class="stack">${cards}${bag}${transfers}</div></section>`;
  }

  function segStatus(s, t) {
    if (t >= s.end) return { cls: 'is-landed', text: 'Landed ✓', pct: null };
    if (t >= s.start) return { cls: 'is-air', text: 'In the air · lands in ' + fmtLeft(s.end - t), pct: Math.round(((t - s.start) / (s.end - s.start)) * 100) };
    const left = s.start - t;
    if (left <= 3 * HOUR) return { cls: 'is-soon', text: 'Departs in ' + fmtLeft(left), pct: null };
    if (left <= 48 * HOUR) return { cls: '', text: 'Departs in ' + fmtLeft(left), pct: null };
    return { cls: '', text: 'Scheduled', pct: null };
  }
  function updateFlights(L) {
    $$('[data-seg]').forEach((el) => {
      const s = SEGS[el.dataset.seg];
      const st = segStatus(s, L.t);
      const tag = $('[data-seg-status]', el);
      tag.className = 'seg-status ' + st.cls;
      tag.textContent = st.text;
      const prog = $('[data-seg-progress]', el);
      prog.hidden = st.pct == null;
      if (st.pct != null) prog.firstElementChild.style.width = st.pct + '%';
    });
  }

  // ---- Itinerary ----
  function itemHTML(i) {
    const time = i.label ? `<strong>${esc(i.label)}${i.clock ? ` <span class="item-clock">${esc(i.clock)}</span>` : ''}:</strong> ` : '';
    return `<li class="item type-${i.type}" data-item="${i.id}">
      <span class="item-emoji" aria-hidden="true">${esc(i.icon)}</span>
      <div class="item-main">
        <p class="item-head">${time}<span class="t">${esc(i.title)}</span>${badgeTBC(i.tbc)}<span data-chip></span></p>
        ${i.sub ? `<p class="item-sub">${esc(i.sub)}</p>` : ''}
        ${i.note ? `<p class="item-note">${esc(i.note)}</p>` : ''}
        ${i.meet ? `<p class="item-meet">📍 ${esc(i.meet)}</p>` : ''}
        ${i.link ? `<a class="item-link" href="#${esc(i.link)}">${esc(linkLabel(i.link))} →</a>` : ''}
      </div>
    </li>`;
  }
  function itinerarySection() {
    const days = T.days.map((d, di) => {
      const h = hijri(d.date);
      const items = ITEMS.filter((i) => i.dayIndex === di);
      return `<article class="day day-${d.city === 'travel' ? 'travel' : 'city'}" id="day-${d.date}" data-day="${d.date}">
        <button type="button" class="day-toggle" data-action="toggle-day" aria-expanded="true" aria-controls="db-${d.date}">
          <span class="day-main">
            <span class="day-date">${esc(shortDate(d.date))}<span class="today-pill" hidden>Today</span>${badgeTBC(d.tbc)}</span>
            <span class="day-title">Day ${di + 1} · ${esc(d.title)}</span>
            ${h ? `<span class="day-hijri">${esc(h)}</span>` : ''}
          </span>
          <span class="day-side"><span class="tag ${d.city === 'travel' ? 'tag-travel' : 'tag-city'}">${esc(cityOf(d.city).label)}</span>${icon('chevronDown', 'chev')}</span>
        </button>
        <div class="day-body" id="db-${d.date}">
          ${d.summary ? `<p class="day-summary">${esc(d.summary)}</p>` : ''}
          <ul class="items">${items.map(itemHTML).join('')}</ul>
        </div>
      </article>`;
    }).join('');
    const tools = `<div class="row-btns no-print">
      <button type="button" class="btn btn-sm" data-action="collapse-all"><span data-collapse-label>Collapse All</span></button>
      <button type="button" class="btn btn-sm" data-action="jump-today" data-jump-today hidden>📍 Jump to today</button>
      <button type="button" class="btn btn-sm" data-action="ics">📅 Add to calendar</button>
      <button type="button" class="btn btn-sm" data-action="print">🖨️ Save as PDF</button>
    </div>`;
    return `<section class="sec" id="itinerary">${secHead('📅', 'Daily Itinerary')}
      <p class="sec-lead">Times are Saudi time unless marked UK or Amman. Prayer-based times (~) are approximate.</p>
      ${tools}<div class="days" style="margin-top:14px">${days}</div></section>`;
  }

  const collapsed = new Set();
  const touched = new Set();
  let lastDayIndex = -1;
  function setDayCollapsed(dayEl, on) {
    dayEl.classList.toggle('is-collapsed', on);
    const body = $('.day-body', dayEl);
    body.hidden = on;
    $('.day-toggle', dayEl).setAttribute('aria-expanded', String(!on));
    if (on) collapsed.add(dayEl.dataset.day);
    else collapsed.delete(dayEl.dataset.day);
    const label = $('[data-collapse-label]');
    if (label) label.textContent = collapsed.size === T.days.length ? 'Expand All' : 'Collapse All';
  }
  function updateDays(L) {
    const today = L.phase === 'during' ? L.day.date : null;
    const dayChanged = L.dayIndex !== lastDayIndex;
    lastDayIndex = L.dayIndex;
    $$('.day').forEach((el) => {
      const date = el.dataset.day;
      const isToday = date === today;
      const isPast = L.phase === 'after' || (today && date < today);
      el.classList.toggle('is-today', isToday);
      el.classList.toggle('is-past', !!isPast);
      $('.today-pill', el).hidden = !isToday;
      // Live default: finished days fold away, today stays open. Days the reader toggled are left alone.
      if (dayChanged && !touched.has(date)) setDayCollapsed(el, L.phase === 'during' && !!isPast);
    });
    const jump = $('[data-jump-today]');
    if (jump) jump.hidden = !today;
  }

  function chipHTML(i, st, L) {
    if (st === 'now') return ' <span class="chip chip-now">Now</span>';
    if (st === 'next') return ` <span class="chip chip-next">Next${i.start - L.t < 24 * HOUR ? ' · in ' + fmtLeft(i.start - L.t) : ''}</span>`;
    if (st === 'today') return ' <span class="chip chip-next">Today</span>';
    if (st === 'done') return ' <span class="chip chip-done">✓</span>';
    return '';
  }
  function applyStates(L) {
    ITEMS.forEach((i) => {
      const st = stateOf(i, L);
      $$(`[data-item="${i.id}"]`).forEach((el) => {
        el.classList.toggle('is-done', st === 'done');
        el.classList.toggle('is-now', st === 'now');
        el.classList.toggle('is-next', st === 'next' || st === 'today');
        const chip = $('[data-chip]', el);
        if (chip) chip.innerHTML = chipHTML(i, st, L);
      });
    });
  }

  // ---- Programme ----
  function programmeSection() {
    const notes = store.get('notes', {});
    const groups = [['Makkah', (p) => p.date < '2026-10-27'], ['Madinah', (p) => p.date >= '2026-10-27']];
    const card = (p) => {
      const it = ITEM_BY_PROG[p.id];
      const r = it || { label: resolveTime(p.at, p.date, p.tz).label, clock: '' };
      const note = notes[p.id] || '';
      const has = !!note.trim();
      return `<article class="prog card-hover" id="prog-${esc(p.id)}" data-item="${it ? it.id : ''}">
        <div class="prog-date" aria-hidden="true"><span>${esc(fmtDate(p.date, { weekday: 'short' }))}</span><b>${esc(fmtDate(p.date, { day: 'numeric' }))}</b><span>${esc(fmtDate(p.date, { month: 'short' }))}</span></div>
        <div class="prog-body">
          <p class="prog-kind">${esc(p.icon || '⭐')} ${esc(p.kind)}${badgeTBC(p.tbc)}<span data-chip></span></p>
          <h3>${esc(p.title)}</h3>
          <p class="prog-when">🕐 ${esc(longDate(p.date))} · ${esc(r.label)}${r.clock ? ' ' + esc(r.clock) : ''}</p>
          ${p.meet ? `<p class="prog-meet">📍 ${/meeting point/i.test(p.meet) ? '' : 'Meeting point: '}${esc(p.meet)}</p>` : ''}
          <p class="prog-text">${esc(p.text)}</p>
          ${p.link ? `<a class="item-link" href="#${esc(p.link)}">${esc(linkLabel(p.link))} →</a>` : ''}
          <details class="notes no-print"${has ? ' open' : ''}><summary>✏️ My notes${has ? ' <span class="dot-note"></span>' : ''}</summary>
            <textarea data-note="${esc(p.id)}" rows="3" placeholder="Key points, reminders, du’as…" aria-label="Notes for ${esc(p.title)}">${esc(note)}</textarea>
            <p class="save-state" data-save="${esc(p.id)}" aria-live="polite"></p>
          </details>
        </div>
      </article>`;
    };
    const body = groups.map(([name, f]) => {
      const list = T.programme.items.filter(f);
      return list.length ? `<h3 class="sub-head">${esc(name)}</h3>${list.map(card).join('')}` : '';
    }).join('');
    return `<section class="sec" id="programme">${secHead('🕌', 'Programme with the Shaykh')}
      <p class="sec-lead">${esc(T.programme.intro)}</p>${body}
      <div class="row-btns no-print" style="margin-top:16px"><button type="button" class="btn btn-sm" data-action="share-notes">✏️ Share my notes</button></div>
    </section>`;
  }

  function bindNotes() {
    const pending = {};
    const save = (ta) => {
      const id = ta.dataset.note;
      clearTimeout(pending[id]);
      const all = store.get('notes', {});
      if (ta.value.trim()) all[id] = ta.value;
      else delete all[id];
      const ok = store.set('notes', all);
      const el = $(`[data-save="${id}"]`);
      if (el) el.textContent = ok ? 'Saved on this phone' : 'Could not save. Storage may be turned off.';
    };
    $$('textarea[data-note]').forEach((ta) => {
      ta.addEventListener('input', () => {
        clearTimeout(pending[ta.dataset.note]);
        pending[ta.dataset.note] = setTimeout(() => save(ta), 400);
      });
      ta.addEventListener('blur', () => save(ta));
    });
  }
  function shareNotes() {
    const all = store.get('notes', {});
    const parts = T.programme.items.filter((p) => all[p.id] && all[p.id].trim()).map((p) => `${p.title} (${shortDate(p.date)})\n${all[p.id].trim()}`);
    if (!parts.length) { toast('No notes yet'); return; }
    shareText(`My notes: ${T.meta.fullTitle}\n\n${parts.join('\n\n')}`, 'Notes copied');
  }

  // ---- Maps ----
  function mapsSection() {
    const hotels = T.hotels.map((h) => `<div class="card hotel card-hover">
      <div class="hotel-hd"><div><h3>${esc(h.name)}</h3><p>${esc(h.area)}</p></div><span class="tag tag-city">${esc(h.city)}</span></div>
      <ul class="hotel-facts"><li>🗓️ ${esc(h.dates)}${h.aka ? ` · also called ${esc(h.aka)}` : ''}</li><li>🛎️ Check in: ${esc(h.checkIn)}</li><li>🧳 Check out: ${esc(h.checkOut)}</li><li>🚶 ${esc(h.distance)}</li></ul>
      <a class="btn btn-primary btn-block" href="${mapUrl(h.mapQuery)}" target="_blank" rel="noopener">📍 Open Google Maps</a>
      <button type="button" class="btn btn-block" data-action="taxi" data-hotel="${esc(h.id)}">🚕 Show taxi card</button>
    </div>`).join('');
    const groups = T.ziyarat.map((z) => `<details class="zgroup fold" id="zg-${esc(z.id)}">
      <summary><span>${esc(z.title)}${badgeTBC(z.tbc)}<small>${esc(z.when)} · ${z.sites.length} places</small></span>${icon('chevronDown', 'chev')}</summary>
      <div class="zsites">${z.sites.map((s) => `<div class="zsite"${s.id ? ` id="site-${esc(s.id)}"` : ''}>
        <div class="zsite-hd"><h4>${esc(s.name)}</h4>${s.ar ? `<span class="ar-name" lang="ar" dir="rtl">${esc(s.ar)}</span>` : ''}</div>
        <p>${esc(s.about)}</p>
        ${s.tip ? `<p class="ztip">💡 ${esc(s.tip)}</p>` : ''}
        ${s.map ? `<a href="${mapUrl(s.map)}" target="_blank" rel="noopener">📍 Open in Maps</a>` : ''}
      </div>`).join('')}</div>
    </details>`).join('');
    return `<section class="sec" id="maps">${secHead('🗺️', 'Maps & Locations')}
      <div class="grid-2">${hotels}</div>
      <div class="tip-box" style="margin-top:14px"><span aria-hidden="true">💡</span><div><b>Pro tip: </b>${esc(T.mapsTip)}</div></div>
      <h3 class="sub-head">Ziyarat sites</h3>${groups}
    </section>`;
  }

  // ---- Apps ----
  function appsSection() {
    return `<section class="sec" id="apps">${secHead('📱', 'Required Apps')}<div class="stack">${(T.apps || []).map((a) => `<div class="card app-card card-hover">
      <h3>${esc(a.name)}${a.tag ? ` (${esc(a.tag)})` : ''}</h3>
      <p>${esc(a.text)}</p>
      ${a.steps ? `<div class="app-steps">${a.steps.map((s) => `<div><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div>`).join('')}</div>` : ''}
      <div class="store-btns">${a.ios ? `<a href="${esc(a.ios)}" target="_blank" rel="noopener">Download iOS</a>` : ''}${a.android ? `<a href="${esc(a.android)}" target="_blank" rel="noopener">Download Android</a>` : ''}</div>
    </div>`).join('')}</div></section>`;
  }

  // ---- How-To ----
  function duaMini(d) {
    if (!d) return '';
    return `<div class="dua-mini"><b>${esc(d.title)}</b><p class="ar" lang="ar" dir="rtl">${esc(d.ar)}</p><p class="tr">${esc(d.tr)}</p><p class="en">${esc(d.en)}</p></div>`;
  }
  function stepsSection() {
    const g = T.guide;
    const steps = g.steps.map((s, i) => `<details class="step" id="step-${esc(s.id)}">
      <summary><span class="step-num">${i + 1}</span><span class="step-t"><b>${esc(s.title)}</b><small>${esc(s.where)}</small></span>${icon('chevronDown', 'chev')}</summary>
      <div class="step-body">
        <ul class="points">${s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        ${s.tool ? `<button type="button" class="btn btn-primary" data-action="counter" data-mode="${esc(s.tool)}">🔁 Open the ${s.tool === 'tawaf' ? 'tawaf' : 'sa’i'} counter</button>` : ''}
        ${(s.duas || []).map((id) => duaMini(DUAS[id])).join('')}
      </div>
    </details>`).join('');
    const r = g.restrictions;
    const md = g.madinah;
    return `<section class="sec" id="steps">${secHead('🕋', 'How to Perform Umrah')}
      <div class="info-box" style="margin-bottom:14px">${esc(g.intro)}</div>
      <button type="button" class="counter-cta no-print" data-action="counter"><span aria-hidden="true">🔁</span><span><b>Tawaf &amp; Sa’i lap counter</b><small>Big buttons, keeps count if your screen locks</small></span>${icon('chevronRight')}</button>
      <div style="margin-top:14px">${steps}</div>
      <details class="callout fold" style="margin-top:14px" id="step-restrictions"><summary><span>⚠️ ${esc(r.title)}</span>${icon('chevronDown', 'chev')}</summary>
        <ul class="points">${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul><p>${esc(r.note)}</p></details>
      <details class="step" style="margin-top:12px" id="step-madinah"><summary><span class="step-num">🕌</span><span class="step-t"><b>${esc(md.title)}</b><small>Masjid an-Nabawi, the Rawdah, Quba and al-Baqi’</small></span>${icon('chevronDown', 'chev')}</summary>
        <div class="step-body"><ul class="points">${md.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${(md.duas || []).map((id) => duaMini(DUAS[id])).join('')}</div></details>
    </section>`;
  }

  // ---- Du’as ----
  const AR_SIZES = [0.85, 1, 1.15, 1.3, 1.5];
  const getPrefs = () => Object.assign({ ar: 1, tr: true, en: true, cat: 'umrah' }, store.get('prefs', {}));
  function applyPrefs(p) {
    const r = document.documentElement;
    r.style.setProperty('--ar-scale', String(AR_SIZES[Math.min(AR_SIZES.length - 1, Math.max(0, p.ar))]));
    r.classList.toggle('hide-tr', !p.tr);
    r.classList.toggle('hide-en', !p.en);
  }
  function setPrefs(p) {
    store.set('prefs', p);
    applyPrefs(p);
  }
  function duaCard(d) {
    const extra = d.extra
      ? `<div class="dua-extra"><p class="dua-extra-label">${esc(d.extra.label)}</p><p class="ar" lang="ar" dir="rtl">${esc(d.extra.ar)}</p><p class="tr">${esc(d.extra.tr)}</p><p class="en">${esc(d.extra.en)}</p></div>`
      : '';
    return `<article class="dua card-hover" id="dua-${esc(d.id)}" data-cat="${esc(d.category)}">
      <div class="dua-hd"><div><h3>${esc(d.title)}</h3>${d.when ? `<p class="dua-when">${esc(d.when)}</p>` : ''}</div>
        <button type="button" class="icon-btn no-print" data-action="copy-dua" data-id="${esc(d.id)}" aria-label="Copy: ${esc(d.title)}">${icon('copy')}</button></div>
      <p class="ar" lang="ar" dir="rtl">${esc(d.ar)}</p>
      <p class="tr">${esc(d.tr)}</p>
      <p class="en">“${esc(d.en)}”</p>
      ${extra}
      ${d.src ? `<p class="src">${esc(d.src)}</p>` : ''}
    </article>`;
  }
  function duasSection() {
    const prefs = getPrefs();
    const cats = T.dua_categories.concat([{ id: 'mine', label: '❤️ My du’a list' }]);
    return `<section class="sec" id="duas">${secHead('🤲', 'Essential Duas')}
      <div class="chips no-print" role="group" aria-label="Du’a categories">${cats.map((c) => `<button type="button" class="chip-btn" data-action="dua-cat" data-cat="${esc(c.id)}" aria-pressed="${c.id === prefs.cat}">${esc(c.label)}</button>`).join('')}</div>
      <div class="dua-tools no-print">
        <span class="seg-ctl" role="group" aria-label="Arabic text size"><button type="button" data-action="ar-size" data-step="-1" aria-label="Smaller Arabic">A−</button><button type="button" data-action="ar-size" data-step="1" aria-label="Larger Arabic">A+</button></span>
        <label class="toggle"><input type="checkbox" data-pref="tr"${prefs.tr ? ' checked' : ''}> Transliteration</label>
        <label class="toggle"><input type="checkbox" data-pref="en"${prefs.en ? ' checked' : ''}> Translation</label>
      </div>
      <div data-dua-list>${T.duas.map(duaCard).join('')}</div>
      <div class="card" data-mylist-card hidden>
        <p class="muted small">Family and friends will ask to be remembered. Keep their names and requests here and tick them off once you have made du’a. Saved on this phone only.</p>
        <form class="add-row" data-mylist-form><input type="text" name="text" maxlength="160" placeholder="e.g. Mum: good health" aria-label="Add a du’a request" autocomplete="off"><button class="btn btn-primary" type="submit">Add</button></form>
        <p class="small muted" data-mylist-count style="margin-top:8px"></p>
        <ul class="my-list" data-mylist></ul>
      </div>
    </section>`;
  }
  function setDuaCat(cat) {
    const p = getPrefs();
    p.cat = cat;
    setPrefs(p);
    $$('[data-action="dua-cat"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
    $$('[data-dua-list] .dua').forEach((el) => { el.hidden = cat === 'mine' || el.dataset.cat !== cat; });
    $('[data-mylist-card]').hidden = cat !== 'mine';
  }
  function refreshMyList() {
    const list = store.get('myDuas', []);
    $('[data-mylist]').innerHTML = list.map((x) => `<li data-id="${esc(x.id)}" class="${x.done ? 'is-done' : ''}">
      <label><input type="checkbox" data-mylist-done${x.done ? ' checked' : ''}><span>${esc(x.text)}</span></label>
      <button type="button" class="icon-btn" data-mylist-del aria-label="Remove ${esc(x.text)}">${icon('x')}</button></li>`).join('');
    $('[data-mylist-count]').textContent = list.length ? `${list.filter((x) => x.done).length} of ${list.length} made` : 'Your list is empty.';
  }
  function bindDuas() {
    const form = $('[data-mylist-form]');
    const ul = $('[data-mylist]');
    refreshMyList();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.elements.text;
      const text = input.value.trim();
      if (!text) return;
      const list = store.get('myDuas', []);
      list.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false });
      if (!store.set('myDuas', list)) toast('Could not save. Storage may be turned off.');
      input.value = '';
      refreshMyList();
    });
    ul.addEventListener('change', (e) => {
      if (!e.target.matches('[data-mylist-done]')) return;
      const id = e.target.closest('li').dataset.id;
      const list = store.get('myDuas', []);
      const item = list.find((x) => x.id === id);
      if (item) item.done = e.target.checked;
      store.set('myDuas', list);
      refreshMyList();
    });
    ul.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mylist-del]');
      if (!btn) return;
      const id = btn.closest('li').dataset.id;
      store.set('myDuas', store.get('myDuas', []).filter((x) => x.id !== id));
      refreshMyList();
    });
    $$('[data-pref]').forEach((cb) => cb.addEventListener('change', () => {
      const p = getPrefs();
      p[cb.dataset.pref] = cb.checked;
      setPrefs(p);
    }));
    setDuaCat(getPrefs().cat);
  }
  function copyDua(id) {
    const d = DUAS[id];
    if (!d) return;
    copyText([d.title, d.ar, d.tr, d.en, d.src ? `(${d.src})` : ''].filter(Boolean).join('\n\n')).then((ok) => toast(ok ? 'Du’a copied' : 'Could not copy'));
  }

  // ---- Prayer ----
  let prayerCity = null;
  function prayerSection() {
    return `<section class="sec" id="prayer">${secHead('🕰️', 'Prayer Times')}
      <div class="np-row no-print"><span class="seg-ctl" role="group" aria-label="City"><button type="button" data-action="prayer-city" data-city="makkah">Makkah</button><button type="button" data-action="prayer-city" data-city="madinah">Madinah</button></span></div>
      <div data-prayer-table></div>
      <p class="small muted" style="margin-top:10px">Calculated with the Umm al-Qura method used in Saudi Arabia (Fajr at 18.5°, Isha 90 minutes after Maghrib). Times may differ by a minute or two, so always follow the adhan of the Haram. Fridays are marked in cyan: Jumu’ah is at Dhuhr time.</p>
    </section>`;
  }
  function renderPrayer(L) {
    const city = prayerCity || livePlace(L.t) || 'makkah';
    $$('[data-action="prayer-city"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.city === city)));
    const dates = T.days.filter((d) => cityOf(d.city).place === city || d.place === city || (city === 'madinah' && d.city === 'makkah-madinah')).map((d) => d.date);
    const s = saudiParts(L.t);
    const today = L.phase === 'during' ? s.ymd : null;
    const rows = dates.map((ymd) => {
      const t = prayersFor(ymd, city);
      const nextKey = ymd === today ? ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].find((k) => t[k] > s.mins) : null;
      const fri = asDate(ymd).getUTCDay() === 5;
      return `<tr class="${ymd === today ? 'is-today' : ''}"><th scope="row" aria-label="${esc(longDate(ymd))}"><b>${esc(fmtDate(ymd, { day: 'numeric' }))}</b><small${fri ? ' class="fri"' : ''}>${esc(fmtDate(ymd, { weekday: 'short' }))}</small></th>${P.ORDER.map((k) => `<td class="${k === nextKey ? 'is-next' : ''}">${P.format(t[k])}</td>`).join('')}</tr>`;
    }).join('');
    $('[data-prayer-table]').innerHTML = `<div class="table-wrap"><table class="ptable"><thead><tr><th scope="col">Date</th>${P.ORDER.map((k) => `<th scope="col">${esc(P.NAMES[k])}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  // ---- Packing ----
  function packingSection() {
    const ticked = store.get('checks', {});
    const p = checklistProgress();
    return `<section class="sec" id="packing">${secHead('🎒', 'Packing List', `<div class="pack-progress no-print"><span><span data-pack-done>${p.done}</span>/${p.total} packed</span><button type="button" class="btn btn-sm" data-action="reset-checks">Reset</button></div>`)}
      <div class="meter pack-bar no-print"><span data-pack-bar style="width:${p.pct}%"></span></div>
      <div class="pack-grid">${T.checklist.map((g) => `<div class="pack-group" id="pack-${esc(g.id)}">
        <h3>${esc(g.title)}<span data-pack-group="${esc(g.id)}">${g.items.filter((i) => ticked[i.id]).length}/${g.items.length}</span></h3>
        <ul class="checks">${g.items.map((i) => `<li><label class="check"><input type="checkbox" data-check="${esc(i.id)}" data-group="${esc(g.id)}"${ticked[i.id] ? ' checked' : ''}><span>${esc(i.text)}</span></label></li>`).join('')}</ul>
      </div>`).join('')}</div>
    </section>`;
  }
  function bindPacking() {
    $('#packing').addEventListener('change', (e) => {
      const cb = e.target.closest('[data-check]');
      if (!cb) return;
      const ticked = store.get('checks', {});
      if (cb.checked) ticked[cb.dataset.check] = 1;
      else delete ticked[cb.dataset.check];
      store.set('checks', ticked);
      updatePacking();
      if (checklistProgress().pct === 100) toast('All packed. Alhamdulillah!');
    });
  }
  function refreshToday() {
    renderToday(computeLive(now()));
  }
  function updatePacking() {
    const ticked = store.get('checks', {});
    const p = checklistProgress();
    const done = $('[data-pack-done]');
    if (done) done.textContent = p.done;
    const bar = $('[data-pack-bar]');
    if (bar) bar.style.width = p.pct + '%';
    T.checklist.forEach((g) => {
      const el = $(`[data-pack-group="${g.id}"]`);
      if (el) el.textContent = `${g.items.filter((i) => ticked[i.id]).length}/${g.items.length}`;
    });
    $$('[data-check]').forEach((cb) => { cb.checked = !!ticked[cb.dataset.check]; });
    refreshToday(); // the "Getting ready" card shows packing progress
  }

  // ---- Tips ----
  function tipsSection() {
    return `<section class="sec" id="tips">${secHead('💡', 'Essential Tips')}${T.info.map((i) => `<details class="faq fold" id="tip-${esc(i.id)}">
      <summary><span>${esc(i.title)}</span>${icon('chevronDown', 'chev')}</summary>
      <div class="faq-body">${i.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </details>`).join('')}</section>`;
  }

  // ---- Contacts ----
  function contactsSection() {
    const em = emergencyContacts();
    const others = T.contacts.filter((g) => !g.items.every((c) => c.emergency));
    const row = (c) => {
      let action = '';
      if (c.type === 'phone') action = `<a class="btn btn-sm" href="tel:${esc(c.tel || c.value.replace(/\s+/g, ''))}">📞 Call</a>`;
      if (c.type === 'email') action = `<a class="btn btn-sm" href="mailto:${esc(c.value)}">✉️ Email</a>`;
      if (c.type === 'address') action = `<a class="btn btn-sm" href="${mapUrl(c.value)}" target="_blank" rel="noopener">📍 Map</a>`;
      return `<li class="contact"><div><small>${esc(c.label)}</small><b>${esc(c.value)}${badgeTBC(c.tbc)}</b></div>${action}</li>`;
    };
    return `<section class="sec" id="contacts">${secHead('📞', 'Emergency Contacts')}
      <div class="call-grid">${em.map((c) => `<a class="call card-hover" href="tel:${esc(c.tel)}"><div><b>${esc(c.value)}</b><small>${esc(c.label)}</small></div><span class="ph" aria-hidden="true">📞</span></a>`).join('')}</div>
      ${others.map((g) => `<h3 class="sub-head">${esc(g.title)}</h3><div class="card" style="padding:4px 16px"><ul class="contacts">${g.items.filter((c) => !c.emergency).map(row).join('')}</ul></div>`).join('')}
    </section>`;
  }

  // ---- Footer ----
  function renderFooter() {
    $('#footer').innerHTML = `<p class="f1">May Allah accept your Umrah.</p>
      <p class="f2">${esc(T.meta.footer)}</p>
      <div class="row-btns no-print"><button type="button" class="btn btn-sm" data-action="share">Share this app</button><span data-install-row class="footer-install">${installRowHTML(true)}</span></div>
      <p class="f3">Last updated ${esc(fmtDate(T.meta.lastUpdated, { day: 'numeric', month: 'long', year: 'numeric' }))} · Your ticks, notes and du’a list stay on this phone.</p>`;
  }

  /* ================= Overlays: lap counter and taxi card ================= */

  const overlaysEl = document.getElementById('overlays');
  let overlayOpen = null;
  let overlayPushed = false;
  let lastFocus = null;
  // Overlays add a history entry, so the phone's Back button closes them.
  function openOverlay(name, html, onMount) {
    const switching = !!overlayOpen;
    if (switching) releaseWakeLock();
    else lastFocus = document.activeElement;
    overlaysEl.innerHTML = html;
    const ov = overlaysEl.firstElementChild;
    document.body.style.overflow = 'hidden';
    overlayOpen = name;
    try {
      if (switching && overlayPushed) history.replaceState({ overlay: name }, '', '#' + name);
      else {
        history.pushState({ overlay: name }, '', '#' + name);
        overlayPushed = true;
      }
    } catch (e) {
      overlayPushed = false;
    }
    polishText(ov);
    if (onMount) onMount(ov);
    const close = $('.ov-close', ov);
    if (close) close.focus();
  }
  function closeOverlay(silent) {
    if (!overlayOpen) return;
    overlaysEl.innerHTML = '';
    document.body.style.overflow = '';
    overlayOpen = null;
    releaseWakeLock();
    if (!silent && overlayPushed) history.back();
    else if (!silent) history.replaceState(null, '', location.pathname + location.search);
    overlayPushed = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.addEventListener('popstate', () => { if (overlayOpen) closeOverlay(true); });

  const COUNTER = {
    tawaf: {
      unit: 'Circuit',
      start: 'Begin at the Black Stone: raise your right hand towards it and say “Bismillahi wallahu akbar”.',
      done: 'Tawaf complete! Men cover the right shoulder again. Now pray two rak’ahs and drink Zamzam.',
      duas: ['tawaf-start', 'rabbana-atina'],
    },
    sai: {
      unit: 'Lap',
      start: 'Begin at Safa: face the Ka’bah, raise your hands and say the dhikr of Safa.',
      done: 'Sa’i complete at Marwah! Now shave or trim your hair to finish your Umrah.',
      duas: ['safa-marwah', 'green-markers'],
    },
  };
  const counterState = () => Object.assign({ mode: 'tawaf', tawaf: 0, sai: 0 }, store.get('counter', {}));
  function counterStatus(mode, c) {
    if (c === 0) return COUNTER[mode].start;
    if (c >= 7) return COUNTER[mode].done;
    if (mode === 'tawaf') return `Circuit ${c + 1} of 7.${c < 3 ? ' Men: walk briskly (ramal) if you can.' : ''} Say “Rabbana atina…” between the Yemeni Corner and the Black Stone.`;
    return `Lap ${c + 1} of 7: ${c % 2 === 0 ? 'Safa → Marwah' : 'Marwah → Safa'}. Men jog lightly between the green lights.`;
  }
  function arcPath(cx, cy, r, a0, a1) {
    const pt = (a) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return (cx + r * Math.cos(rad)).toFixed(2) + ' ' + (cy + r * Math.sin(rad)).toFixed(2);
    };
    return `M ${pt(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)}`;
  }
  function openCounter(mode) {
    if (mode === 'tawaf' || mode === 'sai') {
      const st = counterState();
      st.mode = mode;
      store.set('counter', st);
    }
    let ring = '';
    for (let i = 0; i < 7; i++) ring += `<path data-seg-i="${i}" d="${arcPath(100, 100, 84, (i * 360) / 7 + 7.5, ((i + 1) * 360) / 7 - 7.5)}"/>`;
    const wake = 'wakeLock' in navigator ? '<label class="toggle"><input type="checkbox" data-wakelock> Keep the screen on</label>' : '';
    openOverlay('counter', `<div class="overlay" role="dialog" aria-modal="true" aria-label="Lap counter">
      <div class="ov-hd"><h2>🔁 Lap counter</h2><button type="button" class="ov-close" data-action="close-overlay" aria-label="Close">${icon('x')}</button></div>
      <div class="ov-body counter" data-counter>
        <span class="seg-ctl" role="group" aria-label="Counting"><button type="button" data-action="count-mode" data-mode="tawaf">Tawaf</button><button type="button" data-action="count-mode" data-mode="sai">Sa’i</button></span>
        <div class="ring-wrap"><svg class="ring" viewBox="0 0 200 200" aria-hidden="true">${ring}</svg><div class="ring-c" aria-live="polite"><b data-count>0</b><span>of 7</span></div></div>
        <p class="counter-status" data-count-status></p>
        <button type="button" class="count-btn" data-action="count-inc"></button>
        <div class="counter-row"><button type="button" class="btn" data-action="count-undo">${icon('undo')}Undo</button><button type="button" class="btn" data-action="count-reset">${icon('rotate')}Reset</button></div>
        ${wake}
        <div data-count-duas style="text-align:left;margin-top:18px"></div>
      </div></div>`, (ov) => {
      updateCounter(ov);
      const cb = $('[data-wakelock]', ov);
      if (cb) cb.addEventListener('change', () => (cb.checked ? requestWakeLock() : releaseWakeLock()));
    });
  }
  function updateCounter(ov) {
    const st = counterState();
    const c = Math.min(7, Math.max(0, st[st.mode] || 0));
    $$('[data-action="count-mode"]', ov).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === st.mode)));
    $('[data-count]', ov).textContent = c;
    $$('[data-seg-i]', ov).forEach((p) => {
      const i = Number(p.dataset.segI);
      p.setAttribute('class', i < c ? 'done' : i === c ? 'current' : '');
    });
    $('[data-count-status]', ov).textContent = counterStatus(st.mode, c);
    const inc = $('[data-action="count-inc"]', ov);
    inc.disabled = c >= 7;
    inc.textContent = c >= 7 ? '✓ Complete' : `${COUNTER[st.mode].unit} ${c + 1} done`;
    $('[data-action="count-undo"]', ov).disabled = c === 0;
    $('[data-count-duas]', ov).innerHTML = COUNTER[st.mode].duas.map((id) => duaMini(DUAS[id])).join('');
  }
  function counterAction(action, el) {
    const ov = $('[data-counter]');
    if (!ov) return;
    const st = counterState();
    const c = st[st.mode] || 0;
    if (action === 'count-mode') st.mode = el.dataset.mode;
    if (action === 'count-inc' && c < 7) {
      st[st.mode] = c + 1;
      buzz(c + 1 === 7 ? [70, 60, 70] : 30);
    }
    if (action === 'count-undo' && c > 0) st[st.mode] = c - 1;
    if (action === 'count-reset') {
      if (c > 0 && !window.confirm(`Reset the ${st.mode === 'tawaf' ? 'tawaf' : 'sa’i'} count to zero?`)) return;
      st[st.mode] = 0;
    }
    store.set('counter', st);
    updateCounter(ov.closest('.overlay'));
  }
  const buzz = (pattern) => {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* not supported */ }
  };
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch (e) {
      wakeLock = null;
      const cb = $('[data-wakelock]');
      if (cb) cb.checked = false;
      toast('This phone could not keep the screen on');
    }
  }
  function releaseWakeLock() {
    if (wakeLock) wakeLock.release().catch(() => {});
    wakeLock = null;
  }
  document.addEventListener('visibilitychange', () => {
    const cb = $('[data-wakelock]');
    if (document.visibilityState === 'visible' && cb && cb.checked && !wakeLock) requestWakeLock();
  });

  function openTaxi(id) {
    const h = HOTELS[id] || currentHotel(now());
    const em = emergencyContacts()[0];
    openOverlay('taxi', `<div class="overlay taxi" role="dialog" aria-modal="true" aria-label="Taxi card">
      <div class="ov-hd"><h2>🚕 Show this to the driver</h2><button type="button" class="ov-close" data-action="close-overlay" aria-label="Close">${icon('x')}</button></div>
      <div class="ov-body">
        <p class="taxi-say">Please take me to:</p>
        <p class="taxi-say-ar" lang="ar">من فضلك خذني إلى</p>
        ${h.ar ? `<p class="taxi-ar" lang="ar">${esc(h.ar)}</p>` : ''}
        ${h.arArea ? `<p class="taxi-ar-area" lang="ar">${esc(h.arArea)}</p>` : ''}
        <p class="taxi-en">${esc(h.name)}</p>
        <p class="taxi-en-area">${esc(h.area)}, ${esc(h.city)}</p>
        <div class="row-btns">
          <a class="btn btn-primary" href="${mapUrl(h.mapQuery)}" target="_blank" rel="noopener">📍 Open in Maps</a>
          ${em ? `<a class="btn" href="tel:${esc(em.tel)}">📞 Call ${esc(em.value.split(' ')[0])}</a>` : ''}
          ${T.hotels.filter((x) => x.id !== h.id).map((x) => `<button type="button" class="btn" data-action="taxi" data-hotel="${esc(x.id)}">${esc(x.city)} hotel</button>`).join('')}
        </div>
      </div></div>`);
  }

  /* ================= Calendar export (with reminders) ================= */

  const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const icsUTC = (t) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function foldICS(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = [];
    let cur = '';
    let bytes = 0;
    for (const ch of line) {
      const b = enc.encode(ch).length;
      if (bytes + b > (out.length ? 74 : 75)) {
        out.push(cur);
        cur = '';
        bytes = 0;
      }
      cur += ch;
      bytes += b;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  function downloadICS() {
    const stamp = icsUTC(Date.now());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//As-Suffa Tours//October Umrah 2026//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsText(T.meta.fullTitle)];
    const event = (uid, when, summary, desc, location, alarmMins) => {
      lines.push('BEGIN:VEVENT', `UID:${uid}@oct26tours`, 'DTSTAMP:' + stamp);
      if (when.allDay) lines.push('DTSTART;VALUE=DATE:' + when.allDay.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + addDays(when.allDay, 1).replace(/-/g, ''));
      else lines.push('DTSTART:' + icsUTC(when.start), 'DTEND:' + icsUTC(when.end));
      lines.push('SUMMARY:' + icsText(summary), 'DESCRIPTION:' + icsText(desc));
      if (location) lines.push('LOCATION:' + icsText(location));
      if (alarmMins && !when.allDay) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(summary), `TRIGGER:-PT${alarmMins}M`, 'END:VALARM');
      lines.push('END:VEVENT');
    };
    ITEMS.filter((i) => i.type === 'flight').forEach((i) => {
      const s = i.seg;
      event('flight-' + s.no.replace(/\s+/g, ''), { start: s.start, end: s.end }, `✈️ ${s.no} ${s.from.code} → ${s.to.code}`,
        `${s.airline} ${s.no}: ${s.from.name} ${s.from.time}${tzSuffix(s.from.tz)} → ${s.to.name} ${s.to.time}${tzSuffix(s.to.tz)}. ${s.aircraft}, ${s.cabin}.`, s.from.name, 180);
    });
    T.programme.items.forEach((p) => {
      const i = ITEM_BY_PROG[p.id];
      const desc = [p.text, p.meet ? 'Meeting point: ' + p.meet : '', i && i.clock ? `Approximate time: ${i.label} ${i.clock} (Saudi time)` : '', p.tbc ? 'To be confirmed by the group leaders.' : ''].filter(Boolean).join('\n');
      if (i && i.timed) event('prog-' + p.id, { start: i.start, end: i.end }, `${p.icon || ''} ${p.title}`.trim(), desc, p.meet || cityOf(dayOf(p.date).city).label, 30);
      else event('prog-' + p.id, { allDay: p.date }, `${p.icon || ''} ${p.title} (time TBC)`.trim(), desc, cityOf(dayOf(p.date).city).label, 0);
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.map(foldICS).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'october-umrah-2026.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Calendar file ready: flights and programme, with reminders');
  }

  /* ================= Install, share, theme, toast ================= */

  let deferredInstall = null;
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function installRowHTML(compact) {
    if (isStandalone()) return compact ? '' : `<span class="ready-emoji" aria-hidden="true">✅</span><span class="ready-text"><b>Installed on this phone</b><small>Opens from your home screen and works offline</small></span>`;
    if (deferredInstall) return compact ? '<button type="button" class="btn btn-sm" data-action="install">Install app</button>' : `<span class="ready-emoji" aria-hidden="true">📲</span><span class="ready-text"><b>Install the app</b><small>Opens from your home screen and works offline</small></span><button type="button" class="btn btn-sm btn-primary" data-action="install">Install</button>`;
    if (compact) return '';
    const how = isIOS() ? 'In Safari tap Share, then “Add to Home Screen”' : 'Browser menu → “Install app” or “Add to Home screen”';
    return `<span class="ready-emoji" aria-hidden="true">📲</span><span class="ready-text"><b>Add to your home screen</b><small>${how}. Works offline.</small></span>`;
  }
  function refreshInstallUI() {
    $$('[data-install-row]').forEach((el) => { el.innerHTML = installRowHTML(el.classList.contains('footer-install')); });
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstall = e;
    refreshInstallUI();
  });
  window.addEventListener('appinstalled', () => {
    deferredInstall = null;
    refreshInstallUI();
    toast('Installed. Open it from your home screen.');
  });
  async function promptInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    try { await deferredInstall.userChoice; } catch (e) { /* dismissed */ }
    deferredInstall = null;
    refreshInstallUI();
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }
  async function shareText(text, copiedMessage) {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    toast((await copyText(text)) ? copiedMessage : 'Could not copy');
  }
  async function shareApp() {
    const url = location.origin + location.pathname;
    if (navigator.share) {
      try {
        await navigator.share({ title: T.meta.fullTitle, text: `${T.meta.fullTitle} with ${T.meta.scholar}: live itinerary, programme, du’as and more.`, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    toast((await copyText(url)) ? 'Link copied' : url);
  }

  const darkQuery = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function effectiveTheme() {
    const t = store.get('theme', 'auto');
    if (t === 'light' || t === 'dark') return t;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }
  function applyThemeIcon() {
    const btn = $('#themeBtn');
    const dark = effectiveTheme() === 'dark';
    if (btn) {
      btn.innerHTML = icon(dark ? 'sun' : 'moon');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#020617' : '#111827');
  }
  function applyTheme() {
    const t = store.get('theme', 'auto');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    applyThemeIcon();
  }
  if (darkQuery) {
    const onChange = () => applyTheme();
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onChange);
    else if (darkQuery.addListener) darkQuery.addListener(onChange);
  }

  let toastTimer = null;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ================= Weather (Open-Meteo, no key needed) ================= */

  async function loadWeather() {
    const cached = store.get('weather', null);
    if (cached && Date.now() - cached.t < 30 * MIN) {
      weather = cached.data;
      return;
    }
    if (navigator.onLine === false || !window.fetch) return;
    try {
      const pl = T.places;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${pl.makkah.lat},${pl.madinah.lat}&longitude=${pl.makkah.lng},${pl.madinah.lng}&current=temperature_2m&timezone=Asia%2FRiyadh`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      const arr = Array.isArray(json) ? json : [json];
      if (arr.length < 2 || !arr[0].current || !arr[1].current) return;
      weather = { makkah: arr[0].current.temperature_2m, madinah: arr[1].current.temperature_2m };
      store.set('weather', { t: Date.now(), data: weather });
      todayCache = '';
      liveUpdate();
    } catch (e) {
      /* offline or blocked: the chip simply stays hidden */
    }
  }

  /* ================= Typography polish ================= */

  // Keep "al-Madani", "an-Nabawi" etc. on one line, and show ﷺ in the Arabic font so it is legible.
  const NAME_RE = /(^|[\s(“"‘])((?:al|an|as|ar|ad|at|az|ash|adh|ath)-[^\s,.;:!?)”"]+)/gi;
  function polishText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const v = n.nodeValue;
      if ((v.indexOf('ﷺ') >= 0 || /(?:al|an|as|ar|ad|at|az|ash|adh|ath)-/i.test(v)) && n.parentElement && !n.parentElement.closest('textarea, .ar, .nw, .saw, .taxi-ar, .taxi-ar-area, .ar-name')) nodes.push(n);
    }
    nodes.forEach((n) => {
      const s = n.nodeValue;
      const marks = [];
      let m;
      NAME_RE.lastIndex = 0;
      while ((m = NAME_RE.exec(s))) marks.push({ start: m.index + m[1].length, end: m.index + m[0].length, cls: 'nw' });
      for (let i = s.indexOf('ﷺ'); i >= 0; i = s.indexOf('ﷺ', i + 1)) {
        if (!marks.some((k) => i >= k.start && i < k.end)) marks.push({ start: i, end: i + 1, cls: 'saw' });
      }
      if (!marks.length) return;
      marks.sort((a, b) => a.start - b.start);
      const frag = document.createDocumentFragment();
      let last = 0;
      marks.forEach((k) => {
        if (k.start < last) return;
        frag.appendChild(document.createTextNode(s.slice(last, k.start)));
        const span = document.createElement('span');
        span.className = k.cls;
        span.textContent = s.slice(k.start, k.end);
        frag.appendChild(span);
        last = k.end;
      });
      frag.appendChild(document.createTextNode(s.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  /* ================= Links ================= */

  const LEGACY = { home: 'today', itinerary: 'itinerary', halaqah: 'programme', guide: 'steps', counter: 'counter', trip: 'flights', ziyarat: 'maps', checklist: 'packing', info: 'tips', contacts: 'contacts', duas: 'duas', prayer: 'prayer', more: 'today' };
  function normaliseHash(h) {
    let s = (h || '').replace(/^#/, '');
    try { s = decodeURIComponent(s); } catch (e) { /* keep as is */ }
    if (s.indexOf('/') === 0) { // links from the first version of the app, e.g. #/itinerary/2026-10-27
      const [a, b] = s.slice(1).split('/');
      if (a === 'itinerary' && b) return 'day/' + b;
      if (a === 'duas' && b) return 'duas/' + b;
      return LEGACY[a] || 'today';
    }
    return s;
  }
  function go(target, instant) {
    const [sec, sub] = target.split('/');
    if (sec === 'counter') { openCounter(sub); return; }
    if (sec === 'taxi') { openTaxi(sub); return; }
    let el = null;
    if (sec === 'duas' && sub && DUAS[sub]) {
      setDuaCat(DUAS[sub].category);
      el = document.getElementById('dua-' + sub);
    } else if (sec === 'steps' && sub) {
      el = document.getElementById('step-' + sub);
      if (el) el.open = true;
    } else if (sec === 'maps' && sub) {
      el = document.getElementById('zg-' + sub);
      if (el) el.open = true;
    } else if (sec === 'programme' && sub) {
      el = document.getElementById('prog-' + sub);
    } else if (sec === 'day' && sub) {
      el = document.getElementById('day-' + sub);
      if (el) { touched.add(sub); setDayCollapsed(el, false); }
    } else if (sec === 'tips' && sub) {
      el = document.getElementById('tip-' + sub);
      if (el) el.open = true;
    }
    if (!el) el = document.getElementById(sec);
    if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: instant ? 'auto' : 'smooth' });
    lastTarget = target;
    try { history.replaceState(null, '', '#' + target); } catch (e) { /* ignore */ }
  }
  // A link opened while the app is already showing (e.g. from WhatsApp) only changes the hash.
  // Closing an overlay returns to the previous hash, which equals lastTarget, so that is ignored.
  let lastTarget = '';
  window.addEventListener('hashchange', () => {
    const target = normaliseHash(location.hash);
    if (!target || target === lastTarget || overlayOpen) return;
    go(target);
  });

  /* ================= Events ================= */

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && !e.target.closest('[data-action]')) {
      e.preventDefault();
      const target = normaliseHash(link.getAttribute('href'));
      if (target) go(target);
      return;
    }
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case 'goto': go(el.dataset.target); break;
      case 'theme': store.set('theme', effectiveTheme() === 'dark' ? 'light' : 'dark'); applyTheme(); break;
      case 'share': shareApp(); break;
      case 'print': window.print(); break;
      case 'install': promptInstall(); break;
      case 'ics': downloadICS(); break;
      case 'taxi': openTaxi(el.dataset.hotel); break;
      case 'counter': openCounter(el.dataset.mode); break;
      case 'close-overlay': closeOverlay(); break;
      case 'count-mode':
      case 'count-inc':
      case 'count-undo':
      case 'count-reset':
        counterAction(action, el);
        break;
      case 'toggle-day': {
        const day = el.closest('.day');
        touched.add(day.dataset.day);
        setDayCollapsed(day, !day.classList.contains('is-collapsed'));
        break;
      }
      case 'collapse-all': {
        const all = $$('.day');
        const collapse = collapsed.size < T.days.length;
        all.forEach((d) => { touched.add(d.dataset.day); setDayCollapsed(d, collapse); });
        break;
      }
      case 'jump-today': go('day/' + computeLive(now()).day.date); break;
      case 'dua-cat': setDuaCat(el.dataset.cat); break;
      case 'ar-size': {
        const p = getPrefs();
        p.ar = Math.min(AR_SIZES.length - 1, Math.max(0, p.ar + Number(el.dataset.step)));
        setPrefs(p);
        break;
      }
      case 'copy-dua': copyDua(el.dataset.id); break;
      case 'share-notes': shareNotes(); break;
      case 'prayer-city': prayerCity = el.dataset.city; renderPrayer(computeLive(now())); break;
      case 'reset-checks':
        if (window.confirm('Untick every item on the packing list?')) {
          store.set('checks', {});
          updatePacking();
        }
        break;
      default:
        break;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayOpen) closeOverlay();
  });

  const setOnline = () => document.documentElement.classList.toggle('is-offline', navigator.onLine === false);
  window.addEventListener('online', () => { setOnline(); loadWeather(); });
  window.addEventListener('offline', setOnline);

  /* ================= Live loop ================= */

  function liveUpdate() {
    const L = computeLive(now());
    if (L.phase !== navPhase) {
      renderNav(L);
      setActive(activeSection || 'today', true);
    }
    updateHeaderLive(L);
    renderStrip(L);
    renderToday(L);
    updateDays(L);
    applyStates(L);
    updateFlights(L);
    renderPrayer(L);
  }

  function watchUpdatesSeen() {
    const card = $('#updates');
    const dot = $('[data-update-dot]');
    const seen = new Set(store.get('seenUpdates', []));
    const unseen = T.updates.filter((u) => !seen.has(updateKey(u)));
    if (dot) dot.hidden = !unseen.length;
    if (!unseen.length || !card || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      setTimeout(() => {
        store.set('seenUpdates', T.updates.map(updateKey));
        if (dot) dot.hidden = true;
      }, 2500);
    }, { threshold: 0.4 });
    io.observe(card);
  }

  /* ================= Start ================= */

  function init() {
    applyTheme();
    applyPrefs(getPrefs());
    setOnline();
    const L = computeLive(now());
    renderHeader(L);
    renderNav(L);
    mainEl.innerHTML = [
      todaySection(), videoSection(), flightsSection(), itinerarySection(), programmeSection(), mapsSection(),
      appsSection(), stepsSection(), duasSection(), prayerSection(), packingSection(), tipsSection(), contactsSection(),
    ].join('');
    renderFooter();
    polishText(mainEl);
    polishText(headerEl);
    bindNotes();
    bindDuas();
    bindPacking();
    liveUpdate();
    measureNav();
    initScrollSpy();
    watchUpdatesSeen();
    window.addEventListener('resize', measureNav);
    setInterval(() => updateCountdown(now()), 1000);
    setInterval(liveUpdate, 20000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) liveUpdate(); });
    loadWeather();

    const start = normaliseHash(location.hash);
    setActive('today');
    if (!start) return;
    if (/^(counter|taxi)/.test(start)) {
      // Opened (or refreshed) on an overlay: open it over a clean URL so Back still works.
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
      go(start);
      return;
    }
    requestAnimationFrame(() => {
      go(start, true);
      // Web fonts can shift the layout after the first jump; re-align if the reader hasn't moved.
      const y = window.scrollY;
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (Math.abs(window.scrollY - y) < 2) go(start, true); });
      }
    });
  }

  init();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
    });
  }
})();
