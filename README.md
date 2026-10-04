# Umrah October 2026 · As-Suffa Tours

A phone-first companion web app for the As-Suffa Tours October 2026 Umrah with
Shaykh Siddiq Rahman al-Madani (Wednesday 21 October – Monday 2 November 2026).
It follows the February 2026 tour app: one link the group can open, add to their
home screen and use offline in Makkah and Madinah.

It is a static site with no build step: plain HTML, CSS and JavaScript.

## What's in it

| Section | What it does |
| --- | --- |
| **Home** | Countdown to departure. During the trip it shows Day *n* of 13, today's plan with the next item highlighted, the next prayer with a countdown, Saudi/UK clocks and tomorrow's preview. Also shows updates and a "still to be confirmed" list. |
| **Itinerary** | All 13 days with a day strip, Hijri dates, filters (worship, halaqah, ziyarat, travel), "after Asr"-style times converted to approximate clock times, *Add to calendar* (.ics) and print. |
| **Halaqah** | The session programme with private notes per session (saved on the phone) and *Share my notes*. |
| **Umrah guide** | Step-by-step from ihram to shaving/trimming, with the du'as for each step, the restrictions of ihram, and visiting Madinah. |
| **Lap counter** | Tawaf and sa'i counter with Safa/Marwah direction, vibration, keep-screen-on and the du'as for each. |
| **Du'as** | 20 du'as with Arabic, transliteration and meaning. Adjustable Arabic size, copy buttons, and a personal du'a request list. |
| **Ziyarat** | Makkah and Madinah sites with background and map links. |
| **Flights & hotels** | Royal Jordanian via Amman, Al Safwah Tower 3 (Makkah), Maden Taibah (Madinah), transfers and package. |
| **Checklist, prayer times, contacts, essential info** | Packing list with progress, Umm al-Qura prayer timetable, tap-to-call contacts, practical tips. |

Light and dark mode, installable (PWA), works offline.

## Updating the content

**Everything lives in [`assets/js/data.js`](assets/js/data.js).** You can edit it on
GitHub in the browser; Netlify redeploys automatically.

- **TBC items.** Anything unconfirmed has `tbc: true` and shows a TBC badge. When it
  is confirmed, update the text and delete `tbc: true`. Also remove the line from
  the `tbc: [...]` list near the top, which feeds the home screen.
- **Times (`at`).** Use `'14:40'` for an exact time, `'after:asr'` (or `fajr`,
  `dhuhr`, `maghrib`, `isha`) for after a prayer, `'jumuah'` for Jumu'ah, or any
  text such as `'Morning'`.
- **Halaqah.** Edit `halaqah.sessions`. The itinerary refers to sessions by `id`,
  so each session is written only once.
- **Flight times.** Once known, also set `meta.countdownTo` to the real departure,
  e.g. `'2026-10-21T14:40:00+01:00'`.
- **Updates.** Add new items to the top of `updates` so they appear first on the home screen.
- After publishing changes, bump `CACHE_VERSION` in [`sw.js`](sw.js) (e.g. `oct26-v2`)
  so installed copies pick up the update.

If the app shows "Something went wrong" after an edit, `data.js` usually has a
missing comma or quote.

## Previewing

```sh
npx serve .          # or any static server, then open http://localhost:3000
```

Add `?now=` to see the app at any moment of the trip (Saudi time):
`http://localhost:3000/?now=2026-10-27T14:00#/home`.

## Deploying on Netlify

In Netlify: **Add new site → Import an existing project → GitHub →** choose this
repository. Leave the build command empty and the publish directory as `.`
([`netlify.toml`](netlify.toml) already sets this). Rename the site in
**Site configuration** (for example `oct26tours`) to get `oct26tours.netlify.app`.

## Sources

- As-Suffa Tours trip page: <https://as-suffa.org/tours/trip/umrah-october-2026/>
- <https://as-suffa.netlify.app/umrah-oct-2026>
- Hotels, transfer day and ziyarat days as confirmed by the organisers (October 2026)

The halaqah programme is provisional, modelled on the February 2026 tour, until
the group leaders confirm times and topics. Prayer times are calculated with the
Umm al-Qura method and are approximate; follow the adhan of the Haram.
