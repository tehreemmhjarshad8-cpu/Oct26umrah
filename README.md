# Umrah October 2026 · As-Suffa Tours

A live, phone-first companion for the As-Suffa Tours October 2026 Umrah with
Shaykh Siddiq Rahman al-Madani (Wednesday 21 October – Monday 2 November 2026).
It builds on the February 2026 tour app (feb26tours.netlify.app): the same
charcoal-and-cyan look and the same one-page flow with section tabs, plus a live
layer that always shows what is happening now and what comes next.

It is a static site with no build step: plain HTML, CSS and JavaScript. It can be
added to the home screen and works offline in Makkah and Madinah.

## What's in it

| Section | What it does |
| --- | --- |
| **Header** | Before the trip: countdown to departure, guide and hotels. During the trip: journey progress with a dot per day (tap one to jump to it). |
| **Live bar** | Sticks under the tabs on every screen: **NOW**, **NEXT** (with a countdown) or **TODAY**, e.g. "NEXT · Walking tour of the Haram · After Isha ~19:20 · in 5h 35m". |
| **Today** | The live card (what's on, meeting point, countdown, what comes before or after), next prayer for the city we are in, today's plan with done/now/next, quick actions (taxi card, call Tabraz, lap counter, prayer times, du'as, hotel map), tomorrow's preview, latest updates and the "still to be confirmed" list. Before the trip it becomes a "Getting ready" checklist. |
| **Video** | The essential seminar recording. |
| **Flights** | Royal Jordanian via Amman, both ways, with live status per flight (scheduled, departs in…, in the air with progress, landed) and a *Track live* link. Baggage and transfers. |
| **Itinerary** | All 13 days. Finished days fold away during the trip and today is highlighted; items are ticked off as the day goes on. Hijri dates, "after Isha"-style times shown as approximate clock times, *Add to calendar* (flights and programme, with reminders) and *Save as PDF*. |
| **Programme** | Group activities with the Shaykh: Umrah on arrival, Haram walking tour, farewell reminder and café social, Masjid an-Nabawi walk, Quba walk, ziyarat and the Madinah farewell. Private notes per activity and *Share my notes*. |
| **Maps** | Both hotels with Google Maps and a taxi card in Arabic, the offline-maps tip, and the ziyarat sites. |
| **Apps, How-To, Du'as, Prayer, Packing, Tips, Contacts** | Nusuk, the step-by-step Umrah guide with a tawaf/sa'i lap counter, 20 du'as with Arabic size and transliteration controls plus a personal du'a list, Umm al-Qura prayer times, the packing list with progress, practical tips and tap-to-call contacts. |

Light and dark mode. Ticks, notes and the du'a list are saved on each phone.

## Updating the content

**Everything lives in [`assets/js/data.js`](assets/js/data.js).** Edit it on GitHub
in the browser; Netlify publishes the change automatically.

- **TBC items.** Anything unconfirmed has `tbc: true` and shows a TBC badge. When it
  is confirmed, update the text and delete `tbc: true`, and remove the matching line
  from the `tbc: [...]` list near the top.
- **Times (`at`).** `'14:40'` for an exact time (Saudi time; add `tz: 'uk'` or
  `tz: 'amman'` otherwise), `'after:isha'` or `'before:asr'` for around a prayer,
  `'fajr'` for at a prayer, `'jumuah'` for Jumu'ah, or any text such as `'Morning'`.
  Give a time as soon as it is known: the live bar and countdowns use it.
- **`dur`** is how long something lasts, in minutes. It decides how long it shows as **NOW**.
- **Programme.** Edit `programme.items`. The itinerary points at them with
  `{ programme: 'p-quba-walk' }`, so each is written once.
- **Updates.** Add new items to the top of `updates`. Each person sees a NEW badge
  until they have read it.
- **Logo.** Add the As-Suffa logo as `assets/img/as-suffa-logo.png` and set
  `meta.logo: 'assets/img/as-suffa-logo.png'`.
- After publishing changes, bump `CACHE_VERSION` in [`sw.js`](sw.js) (e.g. `oct26-v5`)
  so installed copies pick up the update straight away.

If the app shows "Something went wrong" after an edit, `data.js` usually has a
missing comma or quote.

## Previewing any moment of the trip

Add `?now=` (Saudi time) to the address, for example:

- `https://oct26tours.netlify.app/?now=2026-10-23T18:00`: Friday, before the Haram walk
- `https://oct26tours.netlify.app/?now=2026-10-27T17:00`: on the coach to Madinah
- `https://oct26tours.netlify.app/?now=2026-11-02T03:00`: the morning we fly home

Locally: `npx serve .` (or any static server).

## Hosting

Netlify publishes this repository on every push (no build command; publish
directory `.`, see [`netlify.toml`](netlify.toml)). To hide the "Powered by Netlify"
badge, turn it off in Netlify under **Project configuration → General → Powered by
Netlify badge**. The stylesheet also hides it as a fallback.

## Notes

Prayer times are calculated with the Umm al-Qura method and are approximate; follow
the adhan of the Haram. The weather chip uses Open-Meteo and simply hides when offline.
