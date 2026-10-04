/*
  Prayer-time calculation (Umm al-Qura method, as used in Saudi Arabia).
  Fajr: sun 18.5° below the horizon. Isha: 90 minutes after Maghrib.
  Asr: standard (shadow = object length + noon shadow).
  Based on the well-known PrayTimes.org astronomical formulas.
  The results are approximate; always follow the adhan of the Haram.
*/
(function (global) {
  'use strict';

  var rad = function (d) { return (d * Math.PI) / 180; };
  var deg = function (r) { return (r * 180) / Math.PI; };
  var sin = function (d) { return Math.sin(rad(d)); };
  var cos = function (d) { return Math.cos(rad(d)); };
  var tan = function (d) { return Math.tan(rad(d)); };
  var asin = function (x) { return deg(Math.asin(x)); };
  var acos = function (x) { return deg(Math.acos(x)); };
  var atan2 = function (y, x) { return deg(Math.atan2(y, x)); };
  var acot = function (x) { return deg(Math.atan(1 / x)); };
  var fix = function (a, b) { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  var FAJR_ANGLE = 18.5;
  var ISHA_MINUTES = 90;
  var RISE_SET_ANGLE = 0.833;

  function julian(year, month, day) {
    if (month <= 2) { year -= 1; month += 12; }
    var a = Math.floor(year / 100);
    var b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
  }

  function sunPosition(jd) {
    var d = jd - 2451545.0;
    var g = fix(357.529 + 0.98560028 * d, 360);
    var q = fix(280.459 + 0.98564736 * d, 360);
    var l = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
    var e = 23.439 - 0.00000036 * d;
    var ra = atan2(cos(e) * sin(l), cos(l)) / 15;
    return { declination: asin(sin(e) * sin(l)), equation: q / 15 - fix(ra, 24) };
  }

  // ymd: 'YYYY-MM-DD'. Returns local clock times as fractional hours.
  function compute(ymd, lat, lng, tz) {
    var parts = ymd.split('-').map(Number);
    var jDate = julian(parts[0], parts[1], parts[2]) - lng / (15 * 24);

    var midDay = function (t) { return fix(12 - sunPosition(jDate + t).equation, 24); };
    var angleTime = function (angle, t, before) {
      var decl = sunPosition(jDate + t).declination;
      var x = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
      return midDay(t) + (before ? -x : x);
    };
    var asrTime = function (factor, t) {
      var decl = sunPosition(jDate + t).declination;
      return angleTime(-acot(factor + tan(Math.abs(lat - decl))), t);
    };

    // Two passes refine the sun position for each prayer's approximate time.
    var t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18 };
    for (var i = 0; i < 2; i++) {
      t = {
        fajr: angleTime(FAJR_ANGLE, t.fajr / 24, true),
        sunrise: angleTime(RISE_SET_ANGLE, t.sunrise / 24, true),
        dhuhr: midDay(t.dhuhr / 24),
        asr: asrTime(1, t.asr / 24),
        maghrib: angleTime(RISE_SET_ANGLE, t.maghrib / 24),
      };
    }

    var shift = tz - lng / 15;
    var out = {};
    Object.keys(t).forEach(function (k) { out[k] = t[k] + shift; });
    out.isha = out.maghrib + ISHA_MINUTES / 60;
    return out;
  }

  // Minutes after local midnight, rounded to the nearest minute.
  function minutes(hours) { return Math.round(hours * 60); }

  function format(mins) {
    var m = ((mins % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  global.PrayerTimes = {
    ORDER: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
    NAMES: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
    // Returns { fajr: minutes, sunrise: …, … } for a place { lat, lng, tz }.
    forDay: function (ymd, place) {
      var h = compute(ymd, place.lat, place.lng, place.tz);
      var res = {};
      this.ORDER.forEach(function (k) { res[k] = minutes(h[k]); });
      return res;
    },
    format: format,
  };
})(typeof window !== 'undefined' ? window : globalThis);
