/*
  Umrah October 2026: companion app.
  All trip content lives in assets/js/data.js; this file only renders it.
  Preview any moment of the trip with ?now=2026-10-27T16:00 (Saudi time).
*/
(function () {
  'use strict';

  const T = window.TRIP;
  const P = window.PrayerTimes;
  const main = document.getElementById('main');

  if (!T || !P) {
    main.innerHTML = '<div class="card error-box"><h1>Something went wrong</h1><p>The trip details could not be loaded. If you have just edited <code>assets/js/data.js</code>, check it for a missing comma or quote.</p></div>';
    return;
  }

  /* ================= Helpers ================= */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ESC[c]);
  const pad = (n) => String(n).padStart(2, '0');

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

  /* ================= Time ================= */

  // Saudi Arabia is UTC+3 all year, so local Saudi time is a fixed offset.
  const SAUDI_OFFSET_MS = 3 * 3600 * 1000;

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
  const now = () => new Date(Date.now() + clockOffset);

  function saudiNow() {
    const s = new Date(now().getTime() + SAUDI_OFFSET_MS);
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
  const HIJRI_NAMES = [['Jumada I', 'Jumada al-Ula'], ['Jumada II', 'Jumada al-Akhirah'], ['Rabiʻ I', 'Rabi’ al-Awwal'], ['Rabiʻ II', 'Rabi’ al-Thani']];
  function hijri(ymd) {
    if (!hijriFormat) return '';
    try {
      let s = hijriFormat.format(asDate(ymd));
      if (!/14\d\d/.test(s)) return ''; // calendar not supported; it fell back to Gregorian
      HIJRI_NAMES.forEach(([a, b]) => { s = s.replace(a, b); });
      return s;
    } catch (e) {
      return '';
    }
  }

  function ukClock() {
    try {
      return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now());
    } catch (e) {
      return '';
    }
  }

  /* ================= Trip model ================= */

  const CITY = {
    travel: { label: 'Travel day', place: null },
    makkah: { label: 'Makkah', place: 'makkah' },
    madinah: { label: 'Madinah', place: 'madinah' },
    'makkah-madinah': { label: 'Makkah → Madinah', place: 'makkah' },
  };
  const cityOf = (key) => CITY[key] || CITY.travel;

  const DAY_INDEX = {};
  T.days.forEach((d, i) => { DAY_INDEX[d.date] = i; });
  const dayOf = (ymd) => T.days[DAY_INDEX[ymd]];

  const SESSIONS = {};
  T.halaqah.sessions.forEach((s) => { SESSIONS[s.id] = s; });
  const DUAS = {};
  T.duas.forEach((d) => { DUAS[d.id] = d; });
  const STEPS = {};
  T.guide.steps.forEach((s) => { STEPS[s.id] = s; });

  function placeKeyOf(ymd) {
    const d = dayOf(ymd);
    return d ? cityOf(d.city).place : null;
  }

  const prayerCache = {};
  function prayersFor(ymd, placeKey) {
    const k = ymd + '|' + placeKey;
    if (!prayerCache[k]) prayerCache[k] = P.forDay(ymd, T.places[placeKey]);
    return prayerCache[k];
  }

  function tripState() {
    const s = saudiNow();
    if (now().getTime() < Date.parse(T.meta.countdownTo)) return { phase: 'before', s };
    if (s.ymd > T.meta.endDate) return { phase: 'after', s };
    const index = Math.max(0, DAY_INDEX[s.ymd] == null ? 0 : DAY_INDEX[s.ymd]);
    return { phase: 'during', s, index, day: T.days[index] };
  }

  const PRAYER_LABEL = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

  // Turns an item's `at` into a label, an approximate clock time and a sort position in minutes.
  function resolveAt(at, ymd) {
    if (!at) return { label: '', time: '', mins: null };
    const exact = /^(\d{1,2}):(\d{2})$/.exec(at);
    if (exact) return { label: at, time: '', mins: Number(exact[1]) * 60 + Number(exact[2]) };
    const place = placeKeyOf(ymd);
    const rel = /^(after|before):(fajr|dhuhr|asr|maghrib|isha)$/.exec(at);
    if (rel) {
      const label = (rel[1] === 'after' ? 'After ' : 'Before ') + PRAYER_LABEL[rel[2]];
      if (!place) return { label, time: '', mins: null };
      const m = prayersFor(ymd, place)[rel[2]];
      return { label, time: '~' + P.format(m), mins: rel[1] === 'after' ? m + 20 : m - 15 };
    }
    if (at === 'jumuah') {
      if (!place) return { label: 'Jumu’ah', time: '', mins: null };
      const m = prayersFor(ymd, place).dhuhr;
      return { label: 'Jumu’ah', time: '~' + P.format(m), mins: m };
    }
    if (at === 'TBC') return { label: 'Time TBC', time: '', mins: null };
    return { label: at, time: '', mins: null };
  }

  // Itinerary entries can point at a halaqah session; expand those into a full item.
  function resolveItem(item) {
    if (!item.halaqah) return item;
    const s = SESSIONS[item.halaqah];
    if (!s) return null;
    return { at: s.at, type: 'halaqah', title: s.title, kind: s.kind, venue: s.venue, note: s.theme, tbc: s.tbc, link: 'halaqah/' + s.id };
  }

  /* ================= Icons ================= */

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>',
    book: '<path d="M2.5 4.5h6A3.5 3.5 0 0 1 12 8v12.5a2.5 2.5 0 0 0-2.5-2.5h-7z"/><path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12.5a2.5 2.5 0 0 1 2.5-2.5h7z"/>',
    kaaba: '<path d="M4 7.2 12 4l8 3.2v10.2L12 21l-8-3.6z"/><path d="M4 7.2l8 3.4 8-3.4M12 10.6V21"/><path d="M4 10.4l8 3.5 8-3.5"/>',
    mosque: '<path d="M2.5 21h19M5 21v-6a5.5 5.5 0 0 1 11 0v6M10.5 9.5V6.5M8.5 21v-3a2 2 0 0 1 4 0v3M18.5 21V9l1.25-2L21 9v12"/><circle cx="10.5" cy="5.5" r="1"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 3v8M16 3v8M6.5 18v2.5M17.5 18v2.5"/><circle cx="8" cy="14.5" r=".9"/><circle cx="16" cy="14.5" r=".9"/>',
    bed: '<path d="M2.5 5v15M2.5 9h16a3 3 0 0 1 3 3v8M2.5 16.5h19M6.5 9v7.5"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    sparkle: '<path d="M12 3l1.9 5.6a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16.5v-5M12 8h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    crescent: '<path d="M15.5 4.6A8 8 0 1 0 19.4 17a6.5 6.5 0 1 1-3.9-12.4Z"/><path d="m18.2 3 .55 1.5 1.6.1-1.25 1 .4 1.55-1.3-.85-1.3.85.4-1.55-1.25-1 1.6-.1z"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    printer: '<path d="M6 9V2.5h12V9M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7.5" rx="1"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    pencil: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    luggage: '<rect x="5" y="7" width="14" height="13" rx="2.5"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M9 11v5M15 11v5M8 20v1.5M16 20v1.5"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
    map: '<path d="M14.1 5.1 9.9 3 3 5.9v15.1l6.9-2.9 4.2 2.1 6.9-2.9V2.2z"/><path d="M9.9 3v15.1M14.1 5.1v15.1"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8"/>',
    play: '<circle cx="12" cy="12" r="9.5"/><path d="m10 8.5 5.5 3.5-5.5 3.5z"/>',
    bag: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M8 14h8M8 18h8"/>',
    smartphone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  };
  const icon = (name, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  /* ================= Shared UI ================= */

  const TYPES = {
    flight: { label: 'Flight', icon: 'plane' },
    travel: { label: 'Travel', icon: 'bus' },
    hotel: { label: 'Hotel', icon: 'bed' },
    ibadah: { label: 'Worship', icon: 'kaaba' },
    halaqah: { label: 'Halaqah', icon: 'book' },
    ziyarah: { label: 'Ziyarah', icon: 'pin' },
    free: { label: 'Free time', icon: 'sparkle' },
    info: { label: 'Good to know', icon: 'info' },
  };
  const FILTERS = [
    { id: 'all', label: 'Everything' },
    { id: 'worship', label: 'Worship', types: ['ibadah', 'free'] },
    { id: 'halaqah', label: 'Halaqah', types: ['halaqah'] },
    { id: 'ziyarah', label: 'Ziyarat', types: ['ziyarah'] },
    { id: 'travel', label: 'Travel & hotels', types: ['flight', 'travel', 'hotel'] },
  ];
  const groupOfType = (type) => (FILTERS.find((f) => f.types && f.types.indexOf(type) >= 0) || { id: 'other' }).id;

  const SECTIONS = [
    { route: 'itinerary', label: 'Itinerary', icon: 'calendar', desc: 'Day by day' },
    { route: 'halaqah', label: 'Halaqah', icon: 'book', desc: 'Sessions and notes' },
    { route: 'guide', label: 'Umrah guide', icon: 'kaaba', desc: 'Step by step' },
    { route: 'counter', label: 'Lap counter', icon: 'repeat', desc: 'Tawaf and sa’i' },
    { route: 'duas', label: 'Du’as', icon: 'crescent', desc: 'Arabic and meaning' },
    { route: 'ziyarat', label: 'Ziyarat', icon: 'pin', desc: 'Makkah and Madinah' },
    { route: 'trip', label: 'Flights & hotels', icon: 'plane', desc: 'Travel details' },
    { route: 'trip/apps', label: 'Apps & maps', icon: 'smartphone', desc: 'Nusuk and offline maps' },
    { route: 'guide/seminar', label: 'Seminar', icon: 'play', desc: 'Watch before you fly' },
    { route: 'checklist', label: 'Checklist', icon: 'luggage', desc: 'What to pack' },
    { route: 'prayer', label: 'Prayer times', icon: 'clock', desc: 'Makkah and Madinah' },
    { route: 'contacts', label: 'Contacts', icon: 'phone', desc: 'Team and emergencies' },
    { route: 'info', label: 'Essential info', icon: 'info', desc: 'Tips and FAQs' },
  ];

  const tbcBadge = (on) => (on ? ' <span class="badge badge-tbc">TBC</span>' : '');
  const mapUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  const pageHead = (title, lead, extra) =>
    `<header class="page-head"><h1>${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}${extra || ''}</header>`;
  const tiles = (list) =>
    `<div class="tiles">${list.map((s) => `<a class="tile" href="#/${s.route}">${icon(s.icon)}<b>${esc(s.label)}</b><span>${esc(s.desc)}</span></a>`).join('')}</div>`;

  function linkLabel(link) {
    const [root, id] = link.split('/');
    if (root === 'duas' && DUAS[id]) return DUAS[id].title;
    if (root === 'guide' && id === 'seminar') return 'Seminar video';
    if (root === 'guide') return id && STEPS[id] ? 'Guide: ' + STEPS[id].title : 'Umrah guide';
    if (root === 'ziyarat') return 'Ziyarat details';
    if (root === 'trip') return { hotels: 'Hotel details', apps: 'Apps & maps', flights: 'Flight details' }[id] || 'Flights & hotels';
    if (root === 'halaqah') return 'Halaqah & notes';
    return 'More';
  }

  function timelineItem(raw, ymd, state) {
    const it = resolveItem(raw);
    if (!it) return '';
    const type = TYPES[it.type] ? it.type : 'info';
    const when = resolveAt(it.at, ymd);
    return `<li class="tl-item type-${type}${state ? ' is-' + state : ''}" data-group="${groupOfType(type)}">
      <div class="tl-when">${esc(when.label)}${when.time ? `<span class="tl-time">${esc(when.time)}</span>` : ''}</div>
      <div class="tl-marker" title="${esc(TYPES[type].label)}">${icon(TYPES[type].icon)}</div>
      <div class="tl-body">
        <h3 class="tl-title">${esc(it.title)}${tbcBadge(it.tbc)}</h3>
        ${it.kind ? `<p class="tl-kind">${esc(it.kind)}${it.venue ? ' · ' + esc(it.venue) : ''}</p>` : ''}
        ${it.note ? `<p class="tl-note">${esc(it.note)}</p>` : ''}
        ${it.link ? `<a class="tl-link" href="#/${esc(it.link)}">${esc(linkLabel(it.link))}${icon('chevronRight')}</a>` : ''}
      </div>
    </li>`;
  }

  function duaCard(d, compact) {
    if (!d) return '';
    const extra = d.extra
      ? `<div class="dua-extra"><p class="dua-extra-label">${esc(d.extra.label)}</p><p class="ar" lang="ar" dir="rtl">${esc(d.extra.ar)}</p><p class="tr">${esc(d.extra.tr)}</p><p class="en">${esc(d.extra.en)}</p></div>`
      : '';
    return `<article class="dua${compact ? ' dua-compact' : ''}"${compact ? '' : ` id="s-${esc(d.id)}"`}>
      <header class="dua-head">
        <div><h3>${esc(d.title)}</h3>${d.when ? `<p class="dua-when">${esc(d.when)}</p>` : ''}</div>
        <button type="button" class="icon-btn" data-action="copy-dua" data-id="${esc(d.id)}" aria-label="Copy: ${esc(d.title)}">${icon('copy')}</button>
      </header>
      <p class="ar" lang="ar" dir="rtl">${esc(d.ar)}</p>
      <p class="tr">${esc(d.tr)}</p>
      <p class="en">${esc(d.en)}</p>
      ${extra}
      ${d.src ? `<p class="src">${esc(d.src)}</p>` : ''}
    </article>`;
  }

  /* ================= Views ================= */

  // ---- Home ----
  function viewHome() {
    const st = tripState();
    let html = homeHero(st);
    if (st.phase === 'during') html += todayCard(st) + nextPrayerCard(st) + tomorrowCard(st);
    if (st.phase === 'before') html += seminarCard() + readyCard();
    if (st.phase === 'after') html += afterCard();
    html += factsGrid() + updatesCard() + tbcCard() + emergencyCard();
    html += `<section><h2 class="section-title">Explore</h2>${tiles(SECTIONS)}</section>`;
    return { html, mount: mountHome };
  }

  function homeHero(st) {
    const m = T.meta;
    const hotels = `<div class="hero-hotels">${T.hotels.map((h) => `<a href="#/trip/hotels"><span>${esc(h.city)}</span><b>${esc(h.name)}</b><small>${esc(h.dates || h.nights + ' nights')}</small></a>`).join('')}</div>`;
    const title = esc(m.title).replace(/(January|February|March|April|May|June|July|August|September|October|November|December|Ramadan)/, '<span class="hl">$1</span>');
    let status;
    if (st.phase === 'before') {
      status = `<div class="countdown" role="timer" aria-label="Time until departure">
          ${['days', 'hours', 'mins', 'secs'].map((u) => `<div class="cd-cell"><b data-cd="${u}">–</b><span>${u}</span></div>`).join('')}
        </div>
        <p class="hero-foot">until we set off from Manchester, in sha’ Allah</p>`;
    } else if (st.phase === 'during') {
      const n = st.index + 1;
      const h = hijri(st.day.date);
      status = `<div class="hero-today">
          <p class="hero-day">Day ${n} of ${T.days.length}</p>
          <p class="hero-date">${esc(longDate(st.day.date))} · ${esc(cityOf(st.day.city).label)}${h ? `<br>${esc(h)}` : ''}</p>
          <div class="progress" aria-hidden="true"><span style="width:${Math.round((n / T.days.length) * 100)}%"></span></div>
        </div>
        <div class="clocks"><div><span>Saudi</span><b data-clock="saudi"></b></div><div><span>UK</span><b data-clock="uk"></b></div></div>`;
    } else {
      status = '<p class="hero-done">Taqabbal Allahu minna wa minkum. May Allah accept your Umrah.</p>';
    }
    return `<section class="hero"><div class="hero-inner">
      ${m.logo ? `<img class="hero-logo" src="${esc(m.logo)}" alt="${esc(m.organiser)}">` : ''}
      <p class="eyebrow">${esc(m.organiser)} · ${esc(fmtDate(m.startDate, { day: 'numeric', month: 'short' }))} – ${esc(fmtDate(m.endDate, { day: 'numeric', month: 'short' }))}</p>
      <h1 class="hero-title">${title}</h1>
      <p class="hero-sub">with ${esc(m.scholar)}</p>
      <p class="hero-range">${icon('calendar')}${esc(shortDate(m.startDate))} – ${esc(shortDate(m.endDate))} 2026 · ${T.days.length} days</p>
      ${st.phase === 'during' ? '' : hotels}
      ${status}
    </div></section>`;
  }

  function itemStates(day, nowMins) {
    let nextFound = false;
    return day.items.map((raw) => {
      const it = resolveItem(raw);
      if (!it) return '';
      const w = resolveAt(it.at, day.date);
      if (w.mins == null) return '';
      if (w.mins < nowMins) return 'past';
      if (!nextFound) {
        nextFound = true;
        return 'next';
      }
      return '';
    });
  }

  function todayCard(st) {
    const d = st.day;
    const states = itemStates(d, st.s.mins);
    return `<section class="card card-today">
      <div class="card-head"><h2>${icon('sun')}Today</h2><a class="more-link" href="#/itinerary/${d.date}">Full day${icon('chevronRight')}</a></div>
      <p class="card-title">${esc(d.title)}${tbcBadge(d.tbc)}</p>
      <ol class="timeline">${d.items.map((it, i) => timelineItem(it, d.date, states[i])).join('')}</ol>
    </section>`;
  }

  function nextPrayerCard(st) {
    const place = placeKeyOf(st.s.ymd);
    if (!place) return '';
    return `<section class="card" data-next-prayer>${nextPrayerInner(place, st.s)}</section>`;
  }

  function nextPrayerInner(place, s) {
    const times = prayersFor(s.ymd, place);
    const order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let next = order.find((k) => times[k] > s.mins);
    let nextMins;
    let tomorrow = false;
    if (next) {
      nextMins = times[next];
    } else {
      next = 'fajr';
      nextMins = prayersFor(addDays(s.ymd, 1), place).fajr + 1440;
      tomorrow = true;
    }
    const left = nextMins - s.mins;
    const leftText = left >= 60 ? `${Math.floor(left / 60)} hr ${left % 60} min` : `${left} min`;
    const friday = asDate(s.ymd).getUTCDay() === 5;
    const name = (k) => (k === 'dhuhr' && friday ? 'Jumu’ah' : P.NAMES[k]);
    return `<div class="card-head"><h2>${icon('clock')}Next prayer · ${esc(T.places[place].name)}</h2><a class="more-link" href="#/prayer/${place}">All times${icon('chevronRight')}</a></div>
      <div class="np-main"><b class="np-name">${esc(name(next))}</b><span class="np-time">~${P.format(nextMins)}</span><span class="np-left">in ${leftText}</span></div>
      <ul class="np-strip">${P.ORDER.map((k) => {
        const cls = k === next && !tomorrow ? 'is-next' : times[k] <= s.mins ? 'is-past' : '';
        return `<li class="${cls}">${esc(name(k))}<b>${P.format(times[k])}</b></li>`;
      }).join('')}</ul>`;
  }

  function tomorrowCard(st) {
    const d = T.days[st.index + 1];
    if (!d) return '';
    return `<a class="card card-link" href="#/itinerary/${d.date}">
      <span class="kicker">Tomorrow · ${esc(shortDate(d.date))}</span>
      <b>${esc(d.title)}${tbcBadge(d.tbc)}</b>
      <span class="muted">${esc(d.summary)}</span>
      ${icon('chevronRight', 'card-link-arrow')}
    </a>`;
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
    return `<section class="card">
      <div class="card-head"><h2>${icon('luggage')}Getting ready</h2></div>
      <a class="ready-row" href="#/checklist"><div><b>Packing checklist</b><span>${p.done} of ${p.total} packed</span></div><div class="meter" aria-hidden="true"><span style="width:${p.pct}%"></span></div></a>
      <a class="ready-row" href="#/guide/ihram"><div><b>Ihram on the way</b><span>Change in Amman; intention before the miqat</span></div>${icon('chevronRight')}</a>
      <a class="ready-row" href="#/trip/apps"><div><b>Install Nusuk</b><span>Mandatory for booking your Rawdah slot</span></div>${icon('chevronRight')}</a>
      <a class="ready-row" href="#/duas/cat-umrah"><div><b>Learn the key du’as</b><span>Talbiyah, tawaf, sa’i and more</span></div>${icon('chevronRight')}</a>
      <div class="ready-row" data-install-row>${installRowHTML()}</div>
    </section>`;
  }

  function afterCard() {
    return `<section class="card">
      <div class="card-head"><h2>${icon('heart')}Welcome home</h2></div>
      <p>May Allah accept your Umrah, your du’as and your efforts, and invite us back to His House again and again.</p>
      <p class="small" style="margin-top:10px"><a href="#/halaqah">Your halaqah notes</a> · <a href="#/duas/travel">Du’a for returning</a></p>
    </section>`;
  }

  function seminarCard() {
    const s = T.seminar;
    if (!s) return '';
    const action = s.url
      ? `<a class="btn btn-accent" href="${esc(s.url)}" target="_blank" rel="noopener">${icon('play')}Watch the seminar</a><p class="sem-note">Opens the video in a new tab</p>`
      : `<p class="sem-soon">${icon('hourglass')}Recording link coming soon</p>`;
    return `<section class="seminar" id="s-seminar"><div class="sem-icon">${icon('play')}</div><div><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>${action}</div></section>`;
  }

  function emergencyCard() {
    const list = [];
    T.contacts.forEach((g) => g.items.forEach((c) => { if (c.emergency) list.push(c); }));
    if (!list.length) return '';
    return `<section class="card">
      <div class="card-head"><h2>${icon('phone')}Emergency contacts</h2><a class="more-link" href="#/contacts">All contacts${icon('chevronRight')}</a></div>
      <div class="em-grid">${list.map((c) => `<a class="em" href="tel:${esc(c.tel)}" aria-label="Call ${esc(c.value)}, ${esc(c.label)}"><div><span>${esc(c.label)}</span><b>${esc(c.value)}</b></div>${icon('phone')}</a>`).join('')}</div>
    </section>`;
  }

  function factsGrid() {
    const [mk, md] = T.hotels;
    const facts = [
      { icon: 'calendar', k: 'Dates', v: `${shortDate(T.meta.startDate)} – ${shortDate(T.meta.endDate)}`, s: `${T.days.length} days`, href: 'itinerary' },
      { icon: 'plane', k: 'Flights', v: T.flights[0].airline, s: 'From Manchester, via Amman', href: 'trip/flights' },
      { icon: 'kaaba', k: 'Makkah', v: mk.name, s: `${mk.nights} nights · ${mk.distance}`, href: 'trip/hotels', tbc: mk.tbc },
      { icon: 'mosque', k: 'Madinah', v: md.name, s: `${md.nights} nights · ${md.distance}`, href: 'trip/hotels', tbc: md.tbc },
      { icon: 'user', k: 'Group scholar', v: T.meta.scholar, s: T.meta.organiser, href: 'halaqah' },
    ];
    return `<section class="facts">${facts.map((f) => `<a class="fact" href="#/${f.href}">${icon(f.icon)}<div><span class="fact-k">${esc(f.k)}</span><b>${esc(f.v)}${tbcBadge(f.tbc)}</b><span class="fact-s">${esc(f.s)}</span></div></a>`).join('')}</section>`;
  }

  function updatesCard() {
    if (!T.updates || !T.updates.length) return '';
    return `<section class="card">
      <div class="card-head"><h2>${icon('bell')}Updates</h2><span class="muted small">${esc(fmtDate(T.meta.lastUpdated, { day: 'numeric', month: 'short' }))}</span></div>
      <ul class="updates">${T.updates.map((u) => `<li><div class="upd-head"><b>${esc(u.title)}</b>${tbcBadge(u.tbc)}</div><p>${esc(u.text)}</p></li>`).join('')}</ul>
    </section>`;
  }

  function tbcCard() {
    if (!T.tbc || !T.tbc.length) return '';
    return `<section class="card card-tbc">
      <div class="card-head"><h2>${icon('hourglass')}Still to be confirmed</h2></div>
      <ul class="tbc-list">${T.tbc.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p class="muted small">The As-Suffa team will confirm these. Anything marked <span class="badge badge-tbc">TBC</span> in the app will be updated.</p>
    </section>`;
  }

  function mountHome(root) {
    const cd = {};
    $$('[data-cd]', root).forEach((el) => { cd[el.dataset.cd] = el; });
    if (cd.days) {
      const target = Date.parse(T.meta.countdownTo);
      const tick = () => {
        let left = target - now().getTime();
        if (left <= 0) {
          render();
          return;
        }
        const d = Math.floor(left / 864e5); left -= d * 864e5;
        const h = Math.floor(left / 36e5); left -= h * 36e5;
        const m = Math.floor(left / 6e4); left -= m * 6e4;
        cd.days.textContent = d;
        cd.hours.textContent = pad(h);
        cd.mins.textContent = pad(m);
        cd.secs.textContent = pad(Math.floor(left / 1000));
      };
      tick();
      every(1000, tick);
    }
    const saudiClock = $('[data-clock="saudi"]', root);
    const ukClockEl = $('[data-clock="uk"]', root);
    if (saudiClock) {
      const tick = () => {
        saudiClock.textContent = P.format(saudiNow().mins);
        ukClockEl.textContent = ukClock();
      };
      tick();
      every(15000, tick);
    }
    const np = $('[data-next-prayer]', root);
    if (np) {
      every(30000, () => {
        const s = saudiNow();
        const place = placeKeyOf(s.ymd);
        if (place) np.innerHTML = nextPrayerInner(place, s);
      });
    }
  }

  // ---- Itinerary ----
  let itinFilter = 'all';
  const collapsedDays = new Set();

  function viewItinerary(param) {
    const st = tripState();
    const today = st.phase === 'during' ? st.s.ymd : null;
    const strip = `<nav class="day-strip" aria-label="Jump to a day">${T.days.map((d) => {
      const cls = (d.date === today ? ' is-today' : '') + (d.date === param ? ' is-current' : '');
      return `<a class="day-pill${cls}" href="#/itinerary/${d.date}" data-city="${esc(d.city)}" aria-label="${esc(longDate(d.date))}"><span>${esc(fmtDate(d.date, { weekday: 'short' }))}</span><b>${esc(fmtDate(d.date, { day: 'numeric' }))}</b></a>`;
    }).join('')}</nav>`;
    const chips = `<div class="chips" role="group" aria-label="Show">${FILTERS.map((f) => `<button type="button" class="chip" data-action="filter" data-filter="${f.id}" aria-pressed="${f.id === itinFilter}">${esc(f.label)}</button>`).join('')}</div>`;
    if (param) collapsedDays.delete(param);
    if (today) collapsedDays.delete(today);
    const days = T.days.map((d, i) => {
      const h = hijri(d.date);
      const collapsed = collapsedDays.has(d.date);
      return `<article class="day${d.date === today ? ' is-today' : ''}${collapsed ? ' is-collapsed' : ''}" id="s-${d.date}" data-date="${d.date}">
        <header class="day-head" data-action="toggle-day">
          <div class="day-badge"><span>Day</span><b>${i + 1}</b></div>
          <div class="day-heading">
            <p class="day-date">${esc(longDate(d.date))}</p>
            <h2>${esc(d.title)}${tbcBadge(d.tbc)}</h2>
            <p class="day-meta"><span class="city city-${esc(d.city)}">${esc(cityOf(d.city).label)}</span>${h ? `<span class="hijri">${esc(h)}</span>` : ''}</p>
          </div>
          <button type="button" class="icon-btn day-toggle" aria-expanded="${!collapsed}" aria-controls="b-${d.date}" aria-label="Show or hide day ${i + 1}">${icon('chevronDown')}</button>
        </header>
        <div class="day-body" id="b-${d.date}"${collapsed ? ' hidden' : ''}>
          ${d.summary ? `<p class="day-summary">${esc(d.summary)}</p>` : ''}
          <ol class="timeline">${d.items.map((it) => timelineItem(it, d.date)).join('')}</ol>
        </div>
      </article>`;
    }).join('');
    const head = pageHead(
      'Itinerary',
      `${T.days.length} days, ${shortDate(T.meta.startDate)} – ${shortDate(T.meta.endDate)} 2026. Times are Saudi time; prayer-based times are approximate.`,
      `<div class="head-actions"><button type="button" class="btn btn-small" data-action="collapse-all">${icon('chevronDown')}<span data-collapse-label>${collapsedDays.size === T.days.length ? 'Expand all' : 'Collapse all'}</span></button><button type="button" class="btn btn-small btn-ghost" data-action="ics">${icon('download')}Add to calendar</button><button type="button" class="btn btn-small btn-ghost" data-action="print">${icon('printer')}Save as PDF</button></div>`
    );
    return {
      html: head + strip + chips + `<div class="days">${days}</div>`,
      mount: applyFilter,
      scrollTo: param ? 's-' + param : today ? 's-' + today : null,
    };
  }

  function setDayCollapsed(day, collapsed) {
    day.classList.toggle('is-collapsed', collapsed);
    const body = $('.day-body', day);
    if (body) body.hidden = collapsed;
    const btn = $('.day-toggle', day);
    if (btn) btn.setAttribute('aria-expanded', String(!collapsed));
    if (collapsed) collapsedDays.add(day.dataset.date);
    else collapsedDays.delete(day.dataset.date);
  }
  function updateCollapseLabel(root) {
    const label = $('[data-collapse-label]', root);
    if (label) label.textContent = collapsedDays.size === T.days.length ? 'Expand all' : 'Collapse all';
  }

  function applyFilter(root) {
    $$('[data-filter]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === itinFilter)));
    $$('.day', root).forEach((day) => {
      let shown = 0;
      $$('.tl-item', day).forEach((li) => {
        const show = itinFilter === 'all' || li.dataset.group === itinFilter;
        li.hidden = !show;
        if (show) shown++;
      });
      day.hidden = shown === 0;
    });
  }

  // ---- Halaqah ----
  function viewHalaqah(param) {
    const notes = store.get('notes', {});
    const groups = [];
    T.halaqah.sessions.forEach((s) => {
      const d = dayOf(s.date);
      const city = d ? d.city : 'travel';
      const name = city === 'travel' ? 'Setting off' : city === 'makkah-madinah' ? 'On the road' : cityOf(city).label;
      let g = groups.find((x) => x.name === name);
      if (!g) groups.push((g = { name, items: [] }));
      g.items.push(s);
    });
    const head = pageHead('Halaqah', T.halaqah.intro, T.halaqah.notice ? `<p class="notice">${icon('info')}<span>${esc(T.halaqah.notice)}</span></p>` : '');
    const body = groups.map((g) => `<section><h2 class="section-title">${esc(g.name)}</h2>${g.items.map((s) => sessionCard(s, notes[s.id])).join('')}</section>`).join('');
    const foot = `<div class="page-foot"><button type="button" class="btn" data-action="share-notes">${icon('share')}Share my notes</button><p class="muted small">Your notes are saved on this phone only.</p></div>`;
    return { html: head + body + foot, mount: mountHalaqah, scrollTo: param ? 's-' + param : null };
  }

  function sessionCard(s, note) {
    const when = resolveAt(s.at, s.date);
    const hasNote = !!(note && note.trim());
    return `<article class="session" id="s-${esc(s.id)}">
      <div class="session-date" aria-hidden="true"><span>${esc(fmtDate(s.date, { weekday: 'short' }))}</span><b>${esc(fmtDate(s.date, { day: 'numeric' }))}</b><span>${esc(fmtDate(s.date, { month: 'short' }))}</span></div>
      <div class="session-body">
        <p class="session-meta"><span class="kind">${esc(s.kind)}</span>${tbcBadge(s.tbc)}</p>
        <h3>${esc(s.title)}</h3>
        <p class="session-when">${icon('clock')}<span>${esc(longDate(s.date))} · ${esc(when.label)}${when.time ? ' ' + esc(when.time) : ''}</span></p>
        <p class="session-when">${icon('pin')}<span>${esc(s.venue)}</span></p>
        <p class="session-theme">${esc(s.theme)}</p>
        <details class="notes"${hasNote ? ' open' : ''}>
          <summary>${icon('pencil')}My notes${hasNote ? ' <span class="dot" title="Has notes"></span>' : ''}</summary>
          <textarea data-note="${esc(s.id)}" rows="4" placeholder="Key points, ayat, reminders…" aria-label="Notes for ${esc(s.title)}">${esc(note || '')}</textarea>
          <p class="save-state muted small" data-save="${esc(s.id)}" aria-live="polite"></p>
        </details>
      </div>
    </article>`;
  }

  function mountHalaqah(root) {
    const pending = {};
    const save = (ta) => {
      const id = ta.dataset.note;
      clearTimeout(pending[id]);
      const all = store.get('notes', {});
      if (ta.value.trim()) all[id] = ta.value;
      else delete all[id];
      const ok = store.set('notes', all);
      const el = $(`[data-save="${id}"]`, root);
      if (el) el.textContent = ok ? 'Saved on this phone' : 'Could not save. Storage may be turned off.';
    };
    $$('textarea[data-note]', root).forEach((ta) => {
      ta.addEventListener('input', () => {
        clearTimeout(pending[ta.dataset.note]);
        pending[ta.dataset.note] = setTimeout(() => save(ta), 400);
      });
      ta.addEventListener('blur', () => save(ta));
    });
    beforeLeave = () => $$('textarea[data-note]', root).forEach(save);
  }

  function shareNotes() {
    const all = store.get('notes', {});
    const parts = T.halaqah.sessions
      .filter((s) => all[s.id] && all[s.id].trim())
      .map((s) => `${s.title} (${shortDate(s.date)})\n${all[s.id].trim()}`);
    if (!parts.length) {
      toast('No notes yet');
      return;
    }
    shareText(`My halaqah notes: ${T.meta.title}\n\n${parts.join('\n\n')}`, 'Notes copied');
  }

  // ---- Umrah guide ----
  function viewGuide(param) {
    const g = T.guide;
    const steps = g.steps.map((s, i) => `<details class="step" id="s-${esc(s.id)}"${param === s.id ? ' open' : ''}>
      <summary><span class="step-num">${i + 1}</span><span class="step-title"><b>${esc(s.title)}</b><small>${esc(s.where)}</small></span>${icon('chevronDown', 'chev')}</summary>
      <div class="step-body">
        <ul class="points">${s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        ${s.tool ? `<a class="btn btn-primary" href="#/counter/${esc(s.tool)}">${icon('repeat')}Open the ${s.tool === 'tawaf' ? 'tawaf' : 'sa’i'} counter</a>` : ''}
        ${(s.duas || []).map((id) => duaCard(DUAS[id], true)).join('')}
      </div>
    </details>`).join('');
    const r = g.restrictions;
    const restrictions = `<section class="callout" id="s-restrictions">
      <h2>${icon('shield')}${esc(r.title)}</h2>
      <ul class="points">${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <p>${esc(r.note)}</p>
    </section>`;
    const md = g.madinah;
    const madinah = `<details class="step" id="s-madinah"${param === 'madinah' ? ' open' : ''}>
      <summary><span class="step-num">${icon('mosque')}</span><span class="step-title"><b>${esc(md.title)}</b><small>Masjid an-Nabawi, the Rawdah, Quba and al-Baqi’</small></span>${icon('chevronDown', 'chev')}</summary>
      <div class="step-body">
        <ul class="points">${md.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        ${(md.duas || []).map((id) => duaCard(DUAS[id], true)).join('')}
      </div>
    </details>`;
    const head = pageHead('Umrah guide', '', `<p class="lead guide-intro">${icon('info')}<span>${esc(g.intro)}</span></p>
      <div class="head-actions"><a class="btn btn-small" href="#/counter">${icon('repeat')}Lap counter</a><a class="btn btn-small btn-ghost" href="#/duas/cat-umrah">${icon('crescent')}Umrah du’as</a></div>`);
    return {
      html: head + seminarCard() + `<div class="steps">${steps}</div>` + restrictions + `<div class="steps">${madinah}</div>`,
      scrollTo: param ? 's-' + param : null,
    };
  }

  // ---- Lap counter ----
  const COUNTER = {
    tawaf: {
      unit: 'Circuit',
      start: 'Begin at the Black Stone: raise your right hand towards it and say “Bismillahi wallahu akbar”.',
      done: 'Tawaf complete! Men cover the right shoulder again. Now pray two rak’ahs and drink Zamzam.',
      next: 'salah',
      duas: ['tawaf-start', 'rabbana-atina'],
    },
    sai: {
      unit: 'Lap',
      start: 'Begin at Safa: face the Ka’bah, raise your hands and say the dhikr of Safa.',
      done: 'Sa’i complete at Marwah! Now shave or trim your hair to finish your Umrah.',
      next: 'hair',
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

  function viewCounter(param) {
    if (param === 'tawaf' || param === 'sai') {
      const st = counterState();
      st.mode = param;
      store.set('counter', st);
    }
    let ring = '';
    for (let i = 0; i < 7; i++) {
      const gap = 15; // degrees; wide enough that the rounded ends never touch
      ring += `<path data-seg="${i}" d="${arcPath(100, 100, 84, (i * 360) / 7 + gap / 2, ((i + 1) * 360) / 7 - gap / 2)}"/>`;
    }
    const wake = 'wakeLock' in navigator
      ? '<label class="ctrl"><span>Keep the screen on</span><input type="checkbox" class="switch" data-wakelock></label>'
      : '';
    // Ring, instruction and the big button all fit on one phone screen, so nothing needs scrolling mid-tawaf.
    const html = `<div class="counter-top"><a class="back" href="#/guide">${icon('chevronLeft')}Umrah guide</a><h1 class="counter-title">Lap counter</h1></div>
      <section class="card counter" data-counter>
        <div class="seg" role="group" aria-label="Counting">
          <button type="button" data-action="count-mode" data-mode="tawaf">Tawaf</button>
          <button type="button" data-action="count-mode" data-mode="sai">Sa’i</button>
        </div>
        <div class="ring-wrap"><svg class="ring" viewBox="0 0 200 200" aria-hidden="true">${ring}</svg>
          <div class="ring-center" aria-live="polite"><b data-count>0</b><span>of 7</span></div></div>
        <p class="counter-status" data-status></p>
        <button type="button" class="btn btn-primary btn-xl" data-action="count-inc"></button>
        <div class="counter-row">
          <button type="button" class="btn btn-ghost" data-action="count-undo">${icon('undo')}Undo</button>
          <button type="button" class="btn btn-ghost" data-action="count-reset">${icon('rotate')}Reset</button>
        </div>
        ${wake}
        <p class="muted small counter-note">Tap once at the end of each circuit or lap. Your count is kept if the screen locks.</p>
      </section>
      <section data-counter-duas></section>`;
    return { html, mount: mountCounter };
  }

  let counterDuasKey = '';
  function updateCounter(root) {
    const st = counterState();
    const c = Math.min(7, Math.max(0, st[st.mode] || 0));
    $$('[data-mode]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === st.mode)));
    $('[data-count]', root).textContent = c;
    $$('[data-seg]', root).forEach((p) => {
      const i = Number(p.dataset.seg);
      p.setAttribute('class', i < c ? 'done' : i === c ? 'current' : '');
    });
    $('[data-status]', root).textContent = counterStatus(st.mode, c);
    const inc = $('[data-action="count-inc"]', root);
    inc.disabled = c >= 7;
    inc.innerHTML = c >= 7 ? `${icon('check')}Complete` : `${COUNTER[st.mode].unit} ${c + 1} done`;
    $('[data-action="count-undo"]', root).disabled = c === 0;
    const key = st.mode + (c >= 7 ? ':done' : '');
    if (key !== counterDuasKey) {
      counterDuasKey = key;
      const next = c >= 7 ? `<a class="btn btn-primary" href="#/guide/${COUNTER[st.mode].next}">Next step in the guide${icon('chevronRight')}</a>` : '';
      $('[data-counter-duas]', root).innerHTML = `<h2 class="section-title">Du’as for ${st.mode === 'tawaf' ? 'tawaf' : 'sa’i'}</h2>${COUNTER[st.mode].duas.map((id) => duaCard(DUAS[id])).join('')}${next ? `<div class="page-foot">${next}</div>` : ''}`;
    }
  }

  function mountCounter(root) {
    counterDuasKey = '';
    updateCounter(root);
    const cb = $('[data-wakelock]', root);
    if (cb) cb.addEventListener('change', () => (cb.checked ? requestWakeLock() : releaseWakeLock()));
  }

  function counterAction(action, el) {
    const root = $('[data-counter]');
    if (!root) return;
    const view = root.closest('.view');
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
    updateCounter(view);
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

  // ---- Ziyarat ----
  function viewZiyarat(param) {
    const sections = T.ziyarat.map((z) => `<section id="s-${esc(z.id)}">
      <h2 class="section-title">${esc(z.title)}</h2>
      <p class="section-sub">${icon('calendar')}${esc(z.when)}${tbcBadge(z.tbc)}</p>
      <div class="sites">${z.sites.map((site) => `<article class="site"${site.id ? ` id="s-${esc(site.id)}"` : ''}>
        <div class="site-head"><h3>${esc(site.name)}</h3>${site.ar ? `<p class="site-ar" lang="ar" dir="rtl">${esc(site.ar)}</p>` : ''}</div>
        <p>${esc(site.about)}</p>
        ${site.tip ? `<p class="tip">${icon('info')}<span>${esc(site.tip)}</span></p>` : ''}
        ${site.map ? `<a class="map-link" href="${mapUrl(site.map)}" target="_blank" rel="noopener">${icon('map')}Open in Maps</a>` : ''}
      </article>`).join('')}</div>
    </section>`).join('');
    return {
      html: pageHead('Ziyarat', 'Visits to the historic sites of Makkah and Madinah with the Shaykh. Days and routes are confirmed nearer the time.') + sections,
      scrollTo: param ? 's-' + param : null,
    };
  }

  // ---- Flights & hotels ----
  function viewTrip(param) {
    const flights = T.flights.map((f) => `<article class="card flight">
      <div class="flight-top"><span class="kicker">${esc(f.leg)} · ${esc(longDate(f.date))}</span>${tbcBadge(f.tbc)}</div>
      <div class="flight-route">${f.stops.map((s, i) => `${i ? `<span class="flight-line" aria-hidden="true">${icon('plane')}</span>` : ''}<div class="stop"><b>${esc(s.code)}</b><span>${esc(s.city)}</span></div>`).join('')}</div>
      <p class="flight-airline">${esc(f.airline)}</p>
      ${f.fields && f.fields.length ? `<dl class="kv">${f.fields.map((x) => `<div><dt>${esc(x.label)}</dt><dd>${esc(x.value)}</dd></div>`).join('')}</dl>` : ''}
      <p class="muted small">${esc(f.details)}</p>
      ${f.notes && f.notes.length ? `<ul class="points small">${f.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    </article>`).join('');
    const hotels = T.hotels.map((h) => `<article class="card hotel">
      <div class="hotel-top"><span class="kicker">${esc(h.city)} · ${h.nights} nights</span>${tbcBadge(h.tbc)}</div>
      <h3>${esc(h.name)}${h.aka ? ` <span class="muted">(${esc(h.aka)})</span>` : ''}</h3>
      ${h.ar ? `<p class="hotel-ar" lang="ar" dir="rtl">${esc(h.ar)}</p>` : ''}
      <dl class="kv">
        ${h.area ? `<div><dt>Where</dt><dd>${esc(h.area)}</dd></div>` : ''}
        ${h.distance ? `<div><dt>To the masjid</dt><dd>${esc(h.distance)}</dd></div>` : ''}
        <div><dt>Check in</dt><dd>${esc(h.checkIn)}</dd></div>
        <div><dt>Check out</dt><dd>${esc(h.checkOut)}</dd></div>
      </dl>
      ${(h.notes || []).map((n) => `<p class="muted small">${esc(n)}</p>`).join('')}
      ${h.mapQuery ? `<a class="btn btn-small" href="${mapUrl(h.mapQuery)}" target="_blank" rel="noopener">${icon('map')}Open in Maps</a>` : ''}
    </article>`).join('');
    const baggage = T.baggage && T.baggage.length
      ? `<h3 class="sub-title">Baggage allowance</h3><div class="baggage">${T.baggage.map((b) => `<div class="bag">${icon(b.icon)}<b>${esc(b.title)}</b><span>${esc(b.detail)}</span><strong>${esc(b.value)}</strong></div>`).join('')}</div>${T.baggageNote ? `<p class="muted small" style="margin-top:8px">${esc(T.baggageNote)}</p>` : ''}`
      : '';
    const apps = (T.apps || []).map((a) => `<article class="card app-card">
      <div class="card-head"><h3>${icon('smartphone')}${esc(a.name)}</h3>${a.tag ? `<span class="app-tag">${esc(a.tag)}</span>` : ''}</div>
      <p>${esc(a.text)}</p>
      <div class="app-links">
        ${a.ios ? `<a class="btn btn-small btn-primary" href="${esc(a.ios)}" target="_blank" rel="noopener">${icon('download')}iPhone</a>` : ''}
        ${a.android ? `<a class="btn btn-small btn-primary" href="${esc(a.android)}" target="_blank" rel="noopener">${icon('download')}Android</a>` : ''}
      </div>
    </article>`).join('');
    const maps = `<div class="card"><div class="card-head"><h3>${icon('map')}Offline maps</h3></div><p class="small" style="color:var(--ink-2)">${esc(T.mapsTip || '')}</p>
      <div class="app-links">${T.hotels.map((h) => `<a class="btn btn-small" href="${mapUrl(h.mapQuery)}" target="_blank" rel="noopener">${icon('pin')}${esc(h.name)}</a>`).join('')}</div></div>`;
    const transfers = `<ul class="list card">${T.transfers.map((t) => `<li><b>${esc(t.title)}${tbcBadge(t.tbc)}</b><span>${esc(t.note)}</span></li>`).join('')}</ul>`;
    const pkg = T.package;
    const pack = `<div class="card">
      <p class="price">${esc(pkg.price)} <span class="muted">· ${esc(pkg.duration)}</span></p>
      <ul class="ticks">${pkg.includes.map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
      <p class="muted small">${esc(T.meta.organiserNote)}</p>
      <p class="small" style="margin-top:8px">Enquiries: <a href="mailto:${esc(pkg.enquiries)}">${esc(pkg.enquiries)}</a></p>
    </div>`;
    const links = `<ul class="list card">${T.meta.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}${icon('external')}</a></li>`).join('')}</ul>`;
    const sec = (id, title, body) => `<section id="s-${id}"><h2 class="section-title">${esc(title)}</h2>${body}</section>`;
    return {
      html: pageHead('Flights & hotels', 'How we get there, where we stay, the apps you need and what’s included.') +
        sec('flights', 'Flights', flights + baggage) + sec('hotels', 'Hotels', hotels) + sec('apps', 'Apps & maps', apps + maps) + sec('transfers', 'Transfers', transfers) +
        sec('package', 'The package', pack) + sec('links', 'Trip pages', links),
      scrollTo: param ? 's-' + param : null,
    };
  }

  // ---- Du’as ----
  const AR_SIZES = [0.85, 1, 1.15, 1.3, 1.5];
  const getPrefs = () => Object.assign({ ar: 1, tr: true, en: true }, store.get('prefs', {}));
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

  function viewDuas(param) {
    const prefs = getPrefs();
    const jump = `<nav class="chips chips-scroll" aria-label="Jump to">${T.dua_categories.map((c) => `<a class="chip" href="#/duas/cat-${esc(c.id)}">${esc(c.label)}</a>`).join('')}<a class="chip" href="#/duas/my-list">My du’a list</a></nav>`;
    const controls = `<div class="card dua-controls">
      <div class="ctrl"><span>Arabic text size</span><div class="stepper">
        <button type="button" class="icon-btn" data-action="ar-size" data-step="-1" aria-label="Smaller Arabic text">A−</button>
        <button type="button" class="icon-btn" data-action="ar-size" data-step="1" aria-label="Larger Arabic text">A+</button>
      </div></div>
      <label class="ctrl"><span>Transliteration</span><input type="checkbox" class="switch" data-pref="tr"${prefs.tr ? ' checked' : ''}></label>
      <label class="ctrl"><span>Translation</span><input type="checkbox" class="switch" data-pref="en"${prefs.en ? ' checked' : ''}></label>
    </div>`;
    const cats = T.dua_categories.map((c) => {
      const list = T.duas.filter((d) => d.category === c.id);
      if (!list.length) return '';
      return `<section id="s-cat-${esc(c.id)}"><h2 class="section-title">${esc(c.label)}</h2>${list.map((d) => duaCard(d)).join('')}</section>`;
    }).join('');
    return {
      html: pageHead('Du’as', 'Arabic, transliteration and meaning for each step of the journey.') + jump + controls + myDuaList() + cats,
      mount: mountDuas,
      scrollTo: param ? 's-' + param : null,
    };
  }

  function myDuaList() {
    return `<section class="card my-duas" id="s-my-list">
      <div class="card-head"><h2>${icon('heart')}My du’a list</h2><span class="muted small" data-mylist-count></span></div>
      <p class="muted small">Family and friends will ask to be remembered. Keep their names and requests here and tick them off once you have made du’a. Saved on this phone only.</p>
      <form class="add-row" data-mylist-form>
        <input type="text" name="text" maxlength="160" placeholder="e.g. Mum: good health" aria-label="Add a du’a request" autocomplete="off">
        <button class="btn btn-primary" type="submit">${icon('plus')}Add</button>
      </form>
      <ul class="my-list" data-mylist></ul>
    </section>`;
  }

  function mountDuas(root) {
    const form = $('[data-mylist-form]', root);
    const ul = $('[data-mylist]', root);
    const count = $('[data-mylist-count]', root);
    const refresh = () => {
      const list = store.get('myDuas', []);
      ul.innerHTML = list.map((x) => `<li data-id="${esc(x.id)}" class="${x.done ? 'is-done' : ''}">
        <label><input type="checkbox" data-mylist-done${x.done ? ' checked' : ''}><span>${esc(x.text)}</span></label>
        <button type="button" class="icon-btn" data-mylist-del aria-label="Remove ${esc(x.text)}">${icon('x')}</button>
      </li>`).join('');
      count.textContent = list.length ? `${list.filter((x) => x.done).length} of ${list.length} made` : '';
    };
    refresh();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.elements.text;
      const text = input.value.trim();
      if (!text) return;
      const list = store.get('myDuas', []);
      list.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false });
      if (!store.set('myDuas', list)) toast('Could not save. Storage may be turned off.');
      input.value = '';
      refresh();
    });
    ul.addEventListener('change', (e) => {
      if (!e.target.matches('[data-mylist-done]')) return;
      const id = e.target.closest('li').dataset.id;
      const list = store.get('myDuas', []);
      const item = list.find((x) => x.id === id);
      if (item) item.done = e.target.checked;
      store.set('myDuas', list);
      refresh();
    });
    ul.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mylist-del]');
      if (!btn) return;
      const id = btn.closest('li').dataset.id;
      store.set('myDuas', store.get('myDuas', []).filter((x) => x.id !== id));
      refresh();
    });
    $$('[data-pref]', root).forEach((cb) => cb.addEventListener('change', () => {
      const p = getPrefs();
      p[cb.dataset.pref] = cb.checked;
      setPrefs(p);
    }));
  }

  function copyDua(id) {
    const d = DUAS[id];
    if (!d) return;
    const text = [d.title, d.ar, d.tr, d.en, d.src ? `(${d.src})` : ''].filter(Boolean).join('\n\n');
    copyText(text).then((ok) => toast(ok ? 'Du’a copied' : 'Could not copy'));
  }

  // ---- Checklist ----
  function viewChecklist() {
    const ticked = store.get('checks', {});
    const p = checklistProgress();
    const progress = `<div class="card progress-card"><div class="progress-top"><b data-progress-text>${p.done} of ${p.total} packed</b><span class="muted" data-progress-pct>${p.pct}%</span></div><div class="meter"><span data-progress-bar style="width:${p.pct}%"></span></div></div>`;
    const groups = T.checklist.map((g) => {
      const n = g.items.filter((i) => ticked[i.id]).length;
      return `<section class="card check-group" id="s-${esc(g.id)}">
        <div class="card-head"><h2>${esc(g.title)}</h2><span class="muted small" data-group-count="${esc(g.id)}">${n}/${g.items.length}</span></div>
        <ul class="checks">${g.items.map((i) => `<li><label class="check"><input type="checkbox" data-check="${esc(i.id)}" data-group="${esc(g.id)}"${ticked[i.id] ? ' checked' : ''}><span class="box" aria-hidden="true">${icon('check')}</span><span class="text">${esc(i.text)}</span></label></li>`).join('')}</ul>
      </section>`;
    }).join('');
    const foot = `<div class="page-foot"><button type="button" class="btn btn-ghost" data-action="reset-checks">${icon('rotate')}Untick everything</button></div>`;
    return { html: pageHead('Packing checklist', 'Tick things off as you pack. Your ticks are saved on this phone.') + progress + groups + foot, mount: mountChecklist };
  }

  function mountChecklist(root) {
    root.addEventListener('change', (e) => {
      const cb = e.target.closest('[data-check]');
      if (!cb) return;
      const ticked = store.get('checks', {});
      if (cb.checked) ticked[cb.dataset.check] = 1;
      else delete ticked[cb.dataset.check];
      store.set('checks', ticked);
      const p = checklistProgress();
      $('[data-progress-text]', root).textContent = `${p.done} of ${p.total} packed`;
      $('[data-progress-pct]', root).textContent = p.pct + '%';
      $('[data-progress-bar]', root).style.width = p.pct + '%';
      const g = T.checklist.find((x) => x.id === cb.dataset.group);
      if (g) $(`[data-group-count="${g.id}"]`, root).textContent = `${g.items.filter((i) => ticked[i.id]).length}/${g.items.length}`;
      if (p.done === p.total) toast('All packed. Alhamdulillah!');
    });
  }

  // ---- Prayer times ----
  function viewPrayer(param) {
    const st = tripState();
    const current = st.phase === 'during' ? placeKeyOf(st.s.ymd) : null;
    const tab = param === 'makkah' || param === 'madinah' ? param : current || 'makkah';
    const dates = T.days
      .filter((d) => cityOf(d.city).place === tab || (tab === 'madinah' && d.city === 'makkah-madinah'))
      .map((d) => d.date);
    const today = st.phase === 'during' ? st.s.ymd : null;
    const rows = dates.map((ymd) => {
      const t = prayersFor(ymd, tab);
      let nextKey = null;
      if (ymd === today) nextKey = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].find((k) => t[k] > st.s.mins) || null;
      const friday = asDate(ymd).getUTCDay() === 5;
      return `<tr class="${ymd === today ? 'is-today' : ''}"><th scope="row" aria-label="${esc(longDate(ymd))}${friday ? ', Jumu’ah' : ''}"><b>${esc(fmtDate(ymd, { day: 'numeric' }))}</b><small${friday ? ' class="fri"' : ''}>${esc(fmtDate(ymd, { weekday: 'short' }))}</small></th>${P.ORDER.map((k) => `<td class="${k === nextKey ? 'is-next' : ''}">${P.format(t[k])}</td>`).join('')}</tr>`;
    }).join('');
    const seg = `<div class="seg" role="group" aria-label="City">${['makkah', 'madinah'].map((k) => `<a href="#/prayer/${k}"${k === tab ? ' aria-current="page"' : ''}>${esc(T.places[k].name)}</a>`).join('')}</div>`;
    const table = `<div class="table-wrap"><table class="ptable"><thead><tr><th scope="col">Date</th>${P.ORDER.map((k) => `<th scope="col">${esc(P.NAMES[k])}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
    const note = '<p class="muted small">Calculated with the Umm al-Qura method used in Saudi Arabia (Fajr at 18.5°, Isha 90 minutes after Maghrib). Times may differ by a minute or two, so always follow the adhan of the Haram. Fridays are marked in green: Jumu’ah is at Dhuhr time.</p>';
    return { html: pageHead('Prayer times', `Approximate times for ${T.places[tab].name} on the days we are there.`) + seg + table + note };
  }

  // ---- Contacts ----
  function viewContacts() {
    const row = (c) => {
      let action = '';
      if (c.type === 'phone') action = `<a class="btn btn-small" href="tel:${esc(c.tel || c.value.replace(/\s+/g, ''))}">${icon('phone')}Call</a>`;
      if (c.type === 'email') action = `<a class="btn btn-small" href="mailto:${esc(c.value)}">${icon('mail')}Email</a>`;
      if (c.type === 'whatsapp') action = `<a class="btn btn-small" href="https://wa.me/${esc(String(c.tel || c.value).replace(/\D/g, ''))}" target="_blank" rel="noopener">${icon('message')}WhatsApp</a>`;
      if (c.type === 'address') action = `<a class="btn btn-small" href="${mapUrl(c.value)}" target="_blank" rel="noopener">${icon('map')}Map</a>`;
      return `<li class="contact"><div><span class="contact-label">${esc(c.label)}</span><b class="contact-value">${esc(c.value)}</b>${tbcBadge(c.tbc)}</div>${action}</li>`;
    };
    const groups = T.contacts.map((g) => `<section><h2 class="section-title">${esc(g.title)}</h2><ul class="contacts card">${g.items.map(row).join('')}</ul></section>`).join('');
    return { html: pageHead('Contacts', 'Tap to call or email. Save the group leaders’ numbers in your phone once they are shared.') + groups };
  }

  // ---- Essential info ----
  function viewInfo(param) {
    const list = T.info.map((i) => `<details class="faq" id="s-${esc(i.id)}"${param === i.id ? ' open' : ''}>
      <summary><b>${esc(i.title)}</b>${icon('chevronDown', 'chev')}</summary>
      <div class="faq-body">${i.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </details>`).join('');
    return { html: pageHead('Essential info', 'Practical tips for the journey.') + `<div class="faqs">${list}</div>`, scrollTo: param ? 's-' + param : null };
  }

  // ---- More ----
  function viewMore() {
    const theme = store.get('theme', 'auto');
    const settings = `<section><h2 class="section-title">App</h2><div class="card settings">
      <div class="setting"><span>${icon('moon')}Appearance</span><div class="seg seg-small" role="group" aria-label="Appearance">${['auto', 'light', 'dark'].map((t) => `<button type="button" data-action="theme" data-theme-value="${t}" aria-pressed="${t === theme}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
      <div class="setting" data-install-setting>${installRowHTML()}</div>
      <div class="setting"><span>${icon('share')}Share this app</span><button type="button" class="btn btn-small" data-action="share">Share</button></div>
    </div>
    <p class="muted small center" style="margin-top:12px">Last updated ${esc(fmtDate(T.meta.lastUpdated, { day: 'numeric', month: 'long', year: 'numeric' }))}. Your ticks, notes and du’a list stay on this phone.</p></section>`;
    const list = SECTIONS.filter((s) => ['itinerary', 'halaqah', 'guide', 'guide/seminar'].indexOf(s.route) < 0);
    return { html: pageHead('More', `${T.meta.title} with ${T.meta.scholar}`) + tiles(list) + settings };
  }

  /* ================= Install, share, theme ================= */

  let deferredInstall = null;
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function installRowHTML() {
    if (isStandalone()) return `<span>${icon('check')}Installed on this phone</span>`;
    if (deferredInstall) return `<div><b>Install the app</b><span>Opens from your home screen and works offline</span></div><button type="button" class="btn btn-small btn-primary" data-action="install">Install</button>`;
    if (isIOS()) return `<div><b>Add to your home screen</b><span>In Safari, tap Share, then “Add to Home Screen”</span></div>`;
    return `<div><b>Add to your home screen</b><span>Use your browser menu: “Install app” or “Add to Home screen”</span></div>`;
  }
  function refreshInstallUI() {
    $$('[data-install-row], [data-install-setting]').forEach((el) => { el.innerHTML = installRowHTML(); });
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
        await navigator.share({ title: T.meta.title, text: `${T.meta.title} with ${T.meta.scholar}: itinerary, halaqah, du’as and more.`, url });
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
  function applyTheme() {
    const t = store.get('theme', 'auto');
    const root = document.documentElement;
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
    else root.removeAttribute('data-theme');
    const dark = effectiveTheme() === 'dark';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#070c17' : '#111827');
    const btn = $('#themeBtn');
    if (btn) {
      btn.innerHTML = icon(dark ? 'sun' : 'moon');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    $$('[data-theme-value]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeValue === t)));
  }
  function setTheme(t) {
    store.set('theme', t);
    applyTheme();
  }
  if (darkQuery) {
    const onChange = () => applyTheme();
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onChange);
    else if (darkQuery.addListener) darkQuery.addListener(onChange);
  }

  /* ================= Calendar export ================= */

  const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
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
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//As-Suffa Tours//Umrah October 2026//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsText(T.meta.title)];
    T.days.forEach((d, i) => {
      const items = d.items.map((raw) => {
        const it = resolveItem(raw);
        if (!it) return null;
        const w = resolveAt(it.at, d.date);
        const when = [w.label, w.time].filter(Boolean).join(' ');
        return `• ${when ? when + ': ' : ''}${it.title}${it.tbc ? ' (TBC)' : ''}`;
      }).filter(Boolean);
      const desc = [d.summary, ''].concat(items, ['', 'Times are Saudi time (UTC+3).']).join('\n');
      lines.push(
        'BEGIN:VEVENT',
        `UID:umrah-oct-2026-day-${i + 1}@as-suffa-tours`,
        'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + d.date.replace(/-/g, ''),
        'DTEND;VALUE=DATE:' + addDays(d.date, 1).replace(/-/g, ''),
        'SUMMARY:' + icsText(`Umrah day ${i + 1}: ${d.title}`),
        'LOCATION:' + icsText(cityOf(d.city).label),
        'DESCRIPTION:' + icsText(desc),
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.map(foldICS).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'umrah-october-2026.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Calendar file downloaded. Open it to add the days.');
  }

  /* ================= Toast ================= */

  let toastTimer = null;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ================= Router ================= */

  const ROUTES = {
    home: { title: 'Home', tab: 'home', view: viewHome },
    itinerary: { title: 'Itinerary', tab: 'itinerary', view: viewItinerary },
    halaqah: { title: 'Halaqah', tab: 'halaqah', view: viewHalaqah },
    guide: { title: 'Umrah guide', tab: 'guide', view: viewGuide },
    counter: { title: 'Lap counter', tab: 'guide', view: viewCounter },
    more: { title: 'More', tab: 'more', view: viewMore },
    ziyarat: { title: 'Ziyarat', tab: 'more', view: viewZiyarat },
    trip: { title: 'Flights & hotels', tab: 'more', view: viewTrip },
    duas: { title: 'Du’as', tab: 'more', view: viewDuas },
    checklist: { title: 'Checklist', tab: 'more', view: viewChecklist },
    prayer: { title: 'Prayer times', tab: 'more', view: viewPrayer },
    contacts: { title: 'Contacts', tab: 'more', view: viewContacts },
    info: { title: 'Essential info', tab: 'more', view: viewInfo },
  };
  const NAV = [
    { route: 'home', label: 'Home', icon: 'home' },
    { route: 'itinerary', label: 'Itinerary', icon: 'calendar' },
    { route: 'halaqah', label: 'Halaqah', icon: 'book' },
    { route: 'guide', label: 'Guide', icon: 'kaaba' },
    { route: 'more', label: 'More', icon: 'grid' },
  ];

  let timers = [];
  const every = (ms, fn) => { timers.push(setInterval(fn, ms)); };
  let beforeLeave = null;
  let firstRender = true;

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    const name = ROUTES[parts[0]] ? parts[0] : 'home';
    let param = '';
    try { param = decodeURIComponent(parts.slice(1).join('/')); } catch (e) { param = ''; }
    return { name, param };
  }

  function render() {
    if (beforeLeave) {
      try { beforeLeave(); } catch (e) { /* ignore */ }
      beforeLeave = null;
    }
    timers.forEach(clearInterval);
    timers = [];
    releaseWakeLock();

    const { name, param } = parseHash();
    const route = ROUTES[name];
    let out;
    try {
      out = route.view(param);
    } catch (err) {
      console.error(err);
      out = { html: '<div class="card error-box"><h2>Sorry, this page could not be shown.</h2><p><a href="#/home">Back to home</a></p></div>' };
    }
    const view = document.createElement('div');
    view.className = 'view view-' + name;
    view.innerHTML = out.html;
    polishText(view);
    main.innerHTML = '';
    main.appendChild(view);
    if (out.mount) out.mount(view);

    document.title = name === 'home' ? T.meta.title : `${route.title} · ${T.meta.title}`;
    $$('[data-tab]').forEach((a) => {
      if (a.dataset.tab === route.tab) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    const target = out.scrollTo ? document.getElementById(out.scrollTo) : null;
    if (target) {
      if (target.tagName === 'DETAILS') target.open = true;
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
        // Web fonts arriving late can reflow the page; re-align unless the reader has scrolled.
        const y = window.scrollY;
        if (document.fonts && document.fonts.status !== 'loaded') {
          document.fonts.ready.then(() => {
            if (target.isConnected && Math.abs(window.scrollY - y) < 2) target.scrollIntoView({ block: 'start' });
          });
        }
      });
    } else {
      window.scrollTo(0, 0);
    }
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;
  }

  // Typography for rendered text: keep "al-Madani", "an-Nabawi" etc. on one line,
  // and show ﷺ in the Arabic font so it is legible.
  const NAME_RE = /(^|[\s(“"‘])((?:al|an|as|ar|ad|at|az|ash|adh|ath)-[^\s,.;:!?)”"]+)/gi;
  function polishText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const v = n.nodeValue;
      if ((v.indexOf('ﷺ') >= 0 || /(?:al|an|as|ar|ad|at|az|ash|adh|ath)-/i.test(v)) && !n.parentElement.closest('textarea, .ar, .nw, .saw')) nodes.push(n);
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

  /* ================= Global events ================= */

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case 'skip':
        e.preventDefault();
        main.focus();
        break;
      case 'share': shareApp(); break;
      case 'theme': setTheme(el.dataset.themeValue); break;
      case 'theme-toggle': setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'); break;
      case 'install': promptInstall(); break;
      case 'ics': downloadICS(); break;
      case 'print': window.print(); break;
      case 'copy-dua': copyDua(el.dataset.id); break;
      case 'share-notes': shareNotes(); break;
      case 'toggle-day': {
        if (e.target.closest('a')) break;
        const day = el.closest('.day');
        if (day) {
          setDayCollapsed(day, !day.classList.contains('is-collapsed'));
          updateCollapseLabel(day.closest('.view'));
        }
        break;
      }
      case 'collapse-all': {
        const view = el.closest('.view');
        const collapse = collapsedDays.size < T.days.length;
        $$('.day', view).forEach((d) => setDayCollapsed(d, collapse));
        updateCollapseLabel(view);
        break;
      }
      case 'filter':
        itinFilter = el.dataset.filter;
        applyFilter(el.closest('.view'));
        break;
      case 'ar-size': {
        const p = getPrefs();
        p.ar = Math.min(AR_SIZES.length - 1, Math.max(0, p.ar + Number(el.dataset.step)));
        setPrefs(p);
        break;
      }
      case 'reset-checks':
        if (window.confirm('Untick every item on the checklist?')) {
          store.set('checks', {});
          render();
        }
        break;
      case 'count-mode':
      case 'count-inc':
      case 'count-undo':
      case 'count-reset':
        counterAction(action, el);
        break;
      default:
        break;
    }
  });

  window.addEventListener('hashchange', () => {
    // Ignore plain in-page anchors; routes always start with "#/".
    if (location.hash && location.hash.indexOf('#/') !== 0) return;
    render();
  });
  window.addEventListener('pagehide', () => { if (beforeLeave) beforeLeave(); });

  const setOnline = () => document.documentElement.classList.toggle('is-offline', navigator.onLine === false);
  window.addEventListener('online', setOnline);
  window.addEventListener('offline', setOnline);

  /* ================= Start ================= */

  $('#topnav').innerHTML = NAV.map((n) => `<a href="#/${n.route}" data-tab="${n.route}">${esc(n.route === 'guide' ? 'Umrah guide' : n.label)}</a>`).join('');
  $('#tabbar').innerHTML = NAV.map((n) => `<a href="#/${n.route}" data-tab="${n.route}">${icon(n.icon)}<span>${esc(n.label)}</span></a>`).join('');
  $('#shareBtn').innerHTML = icon('share');
  if (T.meta.logo) $('.brand-mark').innerHTML = `<img src="${esc(T.meta.logo)}" alt="">`;
  applyTheme();
  applyPrefs(getPrefs());
  setOnline();
  render();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
    });
  }
})();
