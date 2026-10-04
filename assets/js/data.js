/*
  Umrah October 2026 — trip content
  =================================
  This is the ONLY file you need to edit to update the app.

  • Anything still unconfirmed has `tbc: true` — it shows a "TBC" badge.
    When something is confirmed, update the text and delete the `tbc: true`.
  • Times (`at`) can be:
      '14:40'           an exact time (Saudi time unless the note says otherwise)
      'after:fajr'      after a prayer — fajr, dhuhr, asr, maghrib, isha
      'jumuah'          Jumu’ah prayer (shown with the approximate Dhuhr time)
      any other text    shown as written, e.g. 'Morning', 'TBC', 'On arrival'
    Prayer-based times are calculated (Umm al-Qura method) and shown as approximate.
  • Itinerary halaqah entries point at a session in `halaqah.sessions` by id,
    so each session is written once and appears in both places.
  • Links (`link`) open another part of the app, e.g. 'guide/ihram', 'duas/travel'.
  • After editing, also bump CACHE_VERSION in sw.js so phones fetch the update.
*/
window.TRIP = {
  meta: {
    title: 'Umrah October 2026',
    scholar: 'Shaykh Siddiq Rahman al-Madani',
    organiser: 'As-Suffa Tours',
    organiserNote: 'The travel arm of As-Suffa Trust, Birmingham. Every trip is led by a named scholar and accompanied by the team from departure to return.',
    startDate: '2026-10-21',
    endDate: '2026-11-02',
    // Countdown target. Replace with the real departure time once flights are confirmed,
    // e.g. '2026-10-21T14:40:00+01:00' (UK summer time on 21 October is +01:00).
    countdownTo: '2026-10-21T00:00:00+01:00',
    lastUpdated: '2026-10-04',
    links: [
      { label: 'As-Suffa Tours: trip page', url: 'https://as-suffa.org/tours/trip/umrah-october-2026/' },
      { label: 'As-Suffa: Umrah October 2026', url: 'https://as-suffa.netlify.app/umrah-oct-2026' },
    ],
  },

  // Coordinates for prayer-time calculation (Saudi Arabia is UTC+3 all year).
  places: {
    makkah: { name: 'Makkah', lat: 21.4225, lng: 39.8262, tz: 3 },
    madinah: { name: 'Madinah', lat: 24.4672, lng: 39.6112, tz: 3 },
  },

  // Newest first. Shown on the home screen.
  updates: [
    {
      date: '2026-10-04',
      title: 'Hotels confirmed',
      text: 'Makkah: Al Safwah Tower 3 (Safwa Towers), beside the Haram. Madinah: Maden Taibah Hotel, near the Mövenpick.',
    },
    {
      date: '2026-10-04',
      title: 'Makkah → Madinah',
      text: 'We expect to travel on Tuesday 27 October, leaving Makkah after Asr.',
      tbc: true,
    },
    {
      date: '2026-10-04',
      title: 'Ziyarat days',
      text: 'Makkah ziyarat is most likely on Sunday 25 October, and Madinah ziyarat on Thursday 29 October.',
      tbc: true,
    },
    {
      date: '2026-10-04',
      title: 'UK clocks go back on Sunday 25 October',
      text: 'Until then Saudi time is 2 hours ahead of the UK; from the 25th it is 3 hours ahead.',
    },
    {
      date: '2026-10-04',
      title: 'Welcome to the October 2026 companion',
      text: 'Your itinerary, halaqah programme, Umrah guide, du’as and packing checklist in one place. Add it to your home screen and it works offline.',
    },
  ],

  // Shown on the home screen until confirmed. Remove lines as they are confirmed.
  tbc: [
    'Flight numbers and times, outbound and return',
    'Meeting time and terminal at Manchester Airport',
    'Makkah ziyarat: most likely Sunday 25 October',
    'Makkah → Madinah: Tuesday 27 October, after Asr',
    'Madinah ziyarat: Thursday 29 October',
    'Halaqah times, rooms and topics',
    'Group leaders’ mobile numbers and WhatsApp group',
  ],

  flights: [
    {
      leg: 'Outbound',
      date: '2026-10-21',
      airline: 'Royal Jordanian',
      stops: [
        { code: 'MAN', city: 'Manchester' },
        { code: 'AMM', city: 'Amman' },
        { code: 'JED', city: 'Jeddah' },
      ],
      details: 'Flight numbers and times to be confirmed.',
      notes: [
        'Ihram: men change during the Amman stopover (or wear it from home). The intention is made on the Amman → Jeddah flight, before the miqat.',
        'Expected to land in Jeddah in the early hours of Thursday 22 October (TBC).',
      ],
      tbc: true,
    },
    {
      leg: 'Return',
      date: '2026-11-02',
      airline: 'Royal Jordanian',
      stops: [
        { code: 'TBC', city: 'Madinah or Jeddah' },
        { code: 'AMM', city: 'Amman' },
        { code: 'MAN', city: 'Manchester' },
      ],
      details: 'Departure airport, flight numbers and times to be confirmed.',
      notes: [],
      tbc: true,
    },
  ],

  // `ar` is shown large on the hotel card so it can be shown to a taxi driver.
  hotels: [
    {
      city: 'Makkah',
      name: 'Al Safwah Tower 3',
      aka: 'Safwa Towers',
      ar: 'فندق الصفوة البرج الثالث',
      nights: 6,
      checkIn: 'On arrival, Thursday 22 October',
      checkOut: 'Tuesday 27 October',
      distance: 'A few minutes’ walk to Masjid al-Haram',
      area: 'Ajyad Street, beside the Haram',
      mapQuery: 'Al Safwah Hotel Tower 3 Makkah',
      notes: ['Room allocations, check-in times and meals to be confirmed by the group leaders.'],
    },
    {
      city: 'Madinah',
      name: 'Maden Taibah Hotel',
      aka: 'Maden Taiba',
      nights: 6,
      checkIn: 'Late evening, Tuesday 27 October',
      checkOut: 'Monday 2 November',
      distance: 'About 8–10 minutes’ walk to Masjid an-Nabawi',
      area: 'Near the Mövenpick Hotel',
      mapQuery: 'Maden Taibah Hotel Madinah',
      notes: ['Room allocations and meals to be confirmed by the group leaders.'],
    },
  ],

  transfers: [
    { title: 'Jeddah Airport → Makkah hotel', note: 'Coach on arrival, about 1–1½ hours depending on traffic.' },
    { title: 'Makkah → Madinah', note: 'Coach on Tuesday 27 October after Asr. About 450 km, roughly 5–6 hours with a rest and prayer stop.', tbc: true },
    { title: 'Ziyarat in Makkah and Madinah', note: 'Coach tours to the historic sites, with the Shaykh.' },
    { title: 'Madinah hotel → airport', note: 'Monday 2 November. Timing to be confirmed.', tbc: true },
  ],

  package: {
    price: 'From £1,595 per person',
    duration: '13 days',
    includes: [
      'Return flights with Royal Jordanian from Manchester, via Amman',
      'Umrah visa, arranged by As-Suffa (passport details supplied at booking)',
      '6 nights in Makkah at Al Safwah Tower 3, beside the Haram',
      '6 nights in Madinah at the Maden Taibah Hotel',
      'All transfers in Saudi Arabia',
      'Guided Umrah and ziyarat in Makkah and Madinah',
      'A scholar-led programme with Shaykh Siddiq Rahman al-Madani',
    ],
    enquiries: 'tours@as-suffa.org',
  },

  /* ---------------------------------------------------------------
     ITINERARY. city: 'travel' | 'makkah' | 'madinah' | 'makkah-madinah'
     type: flight | travel | hotel | ibadah | halaqah | ziyarah | free | info
     --------------------------------------------------------------- */
  days: [
    {
      date: '2026-10-21',
      city: 'travel',
      title: 'Bismillah, we set off',
      summary: 'Depart Manchester with Royal Jordanian, via Amman.',
      items: [
        { at: 'TBC', type: 'travel', title: 'Meet the group at Manchester Airport', note: 'Meeting time and terminal to be confirmed. Allow at least 3 hours before departure.', tbc: true },
        { halaqah: 'h01' },
        { at: 'Before leaving home', type: 'ibadah', title: 'Pray two rak’ahs and say the travel du’a', link: 'duas/travel' },
        { at: 'TBC', type: 'flight', title: 'Royal Jordanian: Manchester → Amman', note: 'Flight number and times to be confirmed.', tbc: true },
        { at: 'In Amman', type: 'ibadah', title: 'Get ready for ihram', note: 'Men change into ihram during the stopover, or wear it from home. The intention is made on the next flight, before the miqat.', link: 'guide/ihram' },
        { at: 'TBC', type: 'flight', title: 'Royal Jordanian: Amman → Jeddah', note: 'Make the intention for Umrah and begin the Talbiyah when the miqat is announced.', link: 'duas/talbiyah', tbc: true },
      ],
    },
    {
      date: '2026-10-22',
      city: 'makkah',
      title: 'Arrival and Umrah',
      summary: 'Land in Jeddah, transfer to Makkah and perform Umrah together.',
      items: [
        { at: 'Early hours (TBC)', type: 'flight', title: 'Arrive Jeddah, King Abdulaziz International Airport', tbc: true },
        { at: 'On arrival', type: 'travel', title: 'Coach to Makkah', note: 'About 1–1½ hours. Keep reciting the Talbiyah.' },
        { at: 'On arrival', type: 'hotel', title: 'Check in: Al Safwah Tower 3, Makkah', note: 'On Ajyad Street, a few minutes’ walk from the Haram.', link: 'trip/hotels' },
        { halaqah: 'h02' },
        { at: 'TBC', type: 'ibadah', title: 'Perform Umrah together with the Shaykh', note: 'Tawaf, two rak’ahs, Zamzam, Sa’i, then shaving or trimming the hair. Timing set on arrival, after some rest.', link: 'guide', tbc: true },
      ],
    },
    {
      date: '2026-10-23',
      city: 'makkah',
      title: 'Jumu’ah in Masjid al-Haram',
      summary: 'Our first Friday, in the Haram of Makkah.',
      items: [
        { at: 'Morning', type: 'ibadah', title: 'Sunnahs of Friday', note: 'Ghusl, Surah al-Kahf and plenty of salawat on the Prophet ﷺ.', link: 'duas/salawat' },
        { at: 'jumuah', type: 'ibadah', title: 'Jumu’ah in Masjid al-Haram', note: 'Leave early, as the Haram fills well before the khutbah.' },
        { at: 'Afternoon', type: 'free', title: 'Free for personal ibadah and rest' },
        { halaqah: 'h03' },
      ],
    },
    {
      date: '2026-10-24',
      city: 'makkah',
      title: 'Time with the Ka’bah',
      summary: 'A day for tawaf, Qur’an and du’a.',
      items: [
        { at: 'All day', type: 'free', title: 'Personal ibadah: tawaf, Qur’an, du’a' },
        { at: 'Today', type: 'info', title: 'The white days begin (13 Jumada al-Ula)', note: 'The 13th–15th of the lunar month (Ayyam al-Bid) are sunnah fasting days for those able, by the Umm al-Qura calendar.' },
        { halaqah: 'h04' },
      ],
    },
    {
      date: '2026-10-25',
      city: 'makkah',
      title: 'Makkah ziyarat',
      summary: 'Visiting the historic sites of Makkah. Most likely today.',
      tbc: true,
      items: [
        { at: 'After breakfast (TBC)', type: 'ziyarah', title: 'Makkah ziyarat by coach', note: 'Jabal al-Nur, Jabal Thawr, ’Arafat, Muzdalifah and Mina. Route and timing confirmed nearer the day.', link: 'ziyarat/makkah', tbc: true },
        { at: 'Today', type: 'info', title: 'UK clocks go back one hour', note: 'Saudi time is now 3 hours ahead of the UK. Remember this when calling home.' },
        { halaqah: 'h05' },
      ],
    },
    {
      date: '2026-10-26',
      city: 'makkah',
      title: 'Last full day in Makkah',
      summary: 'Make the most of the Haram.',
      items: [
        { at: 'All day', type: 'free', title: 'Free for ibadah', note: 'If you hope to perform an additional Umrah, speak to the Shaykh first.' },
        { at: 'Evening', type: 'hotel', title: 'Pack for Madinah', note: 'Check-out time and luggage arrangements to be confirmed.', tbc: true },
        { halaqah: 'h06' },
      ],
    },
    {
      date: '2026-10-27',
      city: 'makkah-madinah',
      title: 'Makkah → Madinah',
      summary: 'Farewell to the Ka’bah, then on to the city of the Prophet ﷺ after Asr.',
      tbc: true,
      items: [
        { at: 'Morning', type: 'ibadah', title: 'Farewell tawaf (Tawaf al-Wada’)', note: 'Make it your last act in the Haram before leaving. The Shaykh will advise on timing.' },
        { at: 'TBC', type: 'hotel', title: 'Check out and bring luggage to the coach', tbc: true },
        { at: 'after:asr', type: 'travel', title: 'Coach departs for Madinah', note: 'About 450 km, roughly 5–6 hours with a rest and prayer stop.', tbc: true },
        { halaqah: 'h07' },
        { at: 'Late evening', type: 'hotel', title: 'Arrive in Madinah and check in: Maden Taibah Hotel', note: 'Near the Mövenpick, about 8–10 minutes’ walk to Masjid an-Nabawi.', link: 'trip/hotels' },
      ],
    },
    {
      date: '2026-10-28',
      city: 'madinah',
      title: 'Madinah al-Munawwarah',
      summary: 'Greeting the Prophet ﷺ and settling into Madinah.',
      items: [
        { at: 'after:fajr', type: 'ibadah', title: 'Send salam upon the Prophet ﷺ', note: 'Pray two rak’ahs, then greet the Prophet ﷺ, Abu Bakr and ’Umar (RA), calmly and quietly.', link: 'duas/salam' },
        { at: 'Today', type: 'info', title: 'Book your Rawdah permit in the Nusuk app', note: 'The group leaders will help anyone who needs it.' },
        { at: 'Day', type: 'free', title: 'Free for ibadah in Masjid an-Nabawi' },
        { halaqah: 'h08' },
      ],
    },
    {
      date: '2026-10-29',
      city: 'madinah',
      title: 'Madinah ziyarat',
      summary: 'Quba, Uhud and the historic sites of Madinah. Expected today.',
      tbc: true,
      items: [
        { at: 'After breakfast (TBC)', type: 'ziyarah', title: 'Madinah ziyarat by coach', note: 'Masjid Quba (leave the hotel with wudu), Uhud and its martyrs, Masjid al-Qiblatayn, al-Khandaq and the date farms.', link: 'ziyarat/madinah', tbc: true },
        { halaqah: 'h09' },
        { at: 'Evening', type: 'ibadah', title: 'The night before Jumu’ah', note: 'Increase your salawat on the Prophet ﷺ.', link: 'duas/salawat' },
      ],
    },
    {
      date: '2026-10-30',
      city: 'madinah',
      title: 'Jumu’ah in Masjid an-Nabawi',
      summary: 'Friday in the Prophet’s ﷺ masjid.',
      items: [
        { at: 'Morning', type: 'ibadah', title: 'Sunnahs of Friday', note: 'Ghusl, Surah al-Kahf and plenty of salawat.' },
        { at: 'jumuah', type: 'ibadah', title: 'Jumu’ah in Masjid an-Nabawi', note: 'Go early to find a place inside.' },
        { halaqah: 'h10' },
      ],
    },
    {
      date: '2026-10-31',
      city: 'madinah',
      title: 'Al-Baqi’ and reflection',
      summary: 'Al-Baqi’, ibadah and time to reflect.',
      items: [
        { at: 'after:fajr', type: 'ziyarah', title: 'Visit Jannat al-Baqi’', note: 'Usually open to men after Fajr and after Asr.', link: 'ziyarat/baqi' },
        { at: 'Day', type: 'free', title: 'Free for ibadah, Qur’an and shopping' },
        { halaqah: 'h11' },
      ],
    },
    {
      date: '2026-11-01',
      city: 'madinah',
      title: 'Last full day',
      summary: 'Our last full day in the city of the Prophet ﷺ.',
      items: [
        { at: 'Day', type: 'free', title: 'Free for ibadah, plus last dates and gifts' },
        { halaqah: 'h12' },
        { at: 'Night', type: 'hotel', title: 'Pack and get ready to leave', note: 'Departure time to be confirmed.', tbc: true },
      ],
    },
    {
      date: '2026-11-02',
      city: 'madinah',
      title: 'Return home',
      summary: 'Farewell salam, then Royal Jordanian via Amman to Manchester.',
      items: [
        { at: 'Early (TBC)', type: 'ibadah', title: 'Farewell salam at the Prophet’s ﷺ masjid', tbc: true },
        { at: 'TBC', type: 'travel', title: 'Check out and transfer to the airport', note: 'Departure airport and time to be confirmed.', tbc: true },
        { at: 'TBC', type: 'flight', title: 'Royal Jordanian via Amman → Manchester', tbc: true },
        { at: 'Arrival', type: 'travel', title: 'Arrive Manchester', note: 'Say the du’a for returning from travel. Taqabbal Allahu minna wa minkum!', link: 'duas/travel' },
      ],
    },
  ],

  /* ---------------------------------------------------------------
     HALAQAH. Provisional programme modelled on the February 2026 tour.
     Mark a session confirmed by deleting its `tbc: true`.
     --------------------------------------------------------------- */
  halaqah: {
    intro: 'Daily sessions with Shaykh Siddiq Rahman al-Madani: briefings before the key moments, an evening halaqah, a seerah session after Jumu’ah and reflections after the ziyarat.',
    notice: 'Provisional programme. Times, rooms and topics will be confirmed by the group leaders each day.',
    sessions: [
      { id: 'h01', date: '2026-10-21', at: 'Before check-in (TBC)', venue: 'Manchester Airport', kind: 'Briefing', title: 'Pre-departure briefing', theme: 'Intentions, ihram via Amman, and what to expect on the journey.', tbc: true },
      { id: 'h02', date: '2026-10-22', at: 'Before the group Umrah', venue: 'Hotel lobby, Makkah', kind: 'Briefing', title: 'Umrah walkthrough', theme: 'Step by step through tawaf, sa’i and coming out of ihram, so we perform it together with confidence.', tbc: true },
      { id: 'h03', date: '2026-10-23', at: 'after:isha', venue: 'Al Safwah Tower 3 (room TBC)', kind: 'Halaqah', title: 'The sanctity of Makkah', theme: 'The virtues of the Haram, the Ka’bah and Zamzam, and how to make the most of our days here.', tbc: true },
      { id: 'h04', date: '2026-10-24', at: 'after:isha', venue: 'Al Safwah Tower 3 (room TBC)', kind: 'Seerah', title: 'Seerah: the Makkan years', theme: 'The Prophet ﷺ in Makkah: revelation, patience and the first believers.', tbc: true },
      { id: 'h05', date: '2026-10-25', at: 'after:isha', venue: 'Al Safwah Tower 3 (room TBC)', kind: 'Reflection', title: 'Reflections from the ziyarat', theme: 'Hira, Thawr and ’Arafah: lessons from the places we visited.', tbc: true },
      { id: 'h06', date: '2026-10-26', at: 'after:isha', venue: 'Al Safwah Tower 3 (room TBC)', kind: 'Halaqah', title: 'Du’a and returning to Allah', theme: 'Tawbah, du’a, and carrying the change home with us.', tbc: true },
      { id: 'h07', date: '2026-10-27', at: 'On the coach', venue: 'Makkah → Madinah', kind: 'Reminder', title: 'The road of the Hijrah', theme: 'Retracing the journey of the Prophet ﷺ and Abu Bakr (RA) from Makkah to Madinah.', tbc: true },
      { id: 'h08', date: '2026-10-28', at: 'after:isha', venue: 'Maden Taibah Hotel (room TBC)', kind: 'Halaqah', title: 'The adab of Madinah', theme: 'Love of the Prophet ﷺ and the etiquette of his city and his masjid.', tbc: true },
      { id: 'h09', date: '2026-10-29', at: 'During the ziyarat', venue: 'Quba, Uhud and al-Khandaq', kind: 'On site', title: 'Lessons on location', theme: 'Short reminders at the sites of Quba, Uhud and the Trench.', tbc: true },
      { id: 'h10', date: '2026-10-30', at: 'After Jumu’ah', venue: 'Masjid an-Nabawi or Maden Taibah (TBC)', kind: 'Seerah', title: 'Seerah: the Madinan years', theme: 'Building a community: brotherhood, the masjid and the character of the Prophet ﷺ.', tbc: true },
      { id: 'h11', date: '2026-10-31', at: 'after:isha', venue: 'Maden Taibah Hotel (room TBC)', kind: 'Halaqah', title: 'Ahl as-Suffah', theme: 'The students of the Prophet’s ﷺ masjid, and what they teach us about seeking knowledge.', tbc: true },
      { id: 'h12', date: '2026-11-01', at: 'after:isha', venue: 'Maden Taibah Hotel (room TBC)', kind: 'Closing', title: 'Closing majlis and group du’a', theme: 'Keeping the Umrah alive at home, followed by a group du’a.', tbc: true },
    ],
  },

  /* ---------------------------------------------------------------
     ZIYARAT
     --------------------------------------------------------------- */
  ziyarat: [
    {
      id: 'makkah',
      title: 'Makkah ziyarat',
      when: 'Sunday 25 October (most likely)',
      tbc: true,
      sites: [
        { name: 'Jabal al-Nur and the Cave of Hira', ar: 'جبل النور · غار حراء', about: 'The “Mountain of Light”. In the Cave of Hira near its summit, the first verses of the Qur’an were revealed: “Read in the name of your Lord who created” (al-’Alaq 96:1–5).', tip: 'Usually seen from the foot of the mountain. The climb is steep, so speak to the group leaders before attempting it.', map: 'Jabal al-Nour Makkah' },
        { name: 'Jabal Thawr', ar: 'جبل ثور', about: 'The Prophet ﷺ and Abu Bakr (RA) sheltered in a cave here for three nights at the start of the Hijrah: “the second of two, when they were in the cave” (al-Tawbah 9:40).', map: 'Jabal Thawr Makkah' },
        { name: '’Arafat and Jabal al-Rahmah', ar: 'عرفات · جبل الرحمة', about: 'The plain where pilgrims stand on the Day of ’Arafah, the heart of Hajj. The Prophet ﷺ delivered his Farewell Sermon at ’Arafah during his only Hajj.', map: 'Jabal al-Rahmah Arafat' },
        { name: 'Muzdalifah', ar: 'مزدلفة', about: 'Where pilgrims spend the night after ’Arafah and gather pebbles: al-Mash’ar al-Haram, mentioned in the Qur’an (al-Baqarah 2:198).', map: 'Muzdalifah' },
        { name: 'Mina', ar: 'منى', about: 'The valley of tents where pilgrims stay during Hajj and stone the Jamarat, recalling the steadfastness of Ibrahim (AS).', map: 'Mina Makkah' },
        { name: 'Jannat al-Mu’alla', ar: 'جنة المعلاة', about: 'Makkah’s historic cemetery and the resting place of Sayyidah Khadijah (RA), the Prophet’s ﷺ first wife.', map: 'Jannat al-Mualla' },
      ],
    },
    {
      id: 'madinah',
      title: 'Madinah ziyarat',
      when: 'Thursday 29 October (expected)',
      tbc: true,
      sites: [
        { name: 'Masjid Quba', ar: 'مسجد قباء', about: 'The first masjid built in Islam, founded by the Prophet ﷺ when he arrived at Madinah (al-Tawbah 9:108). “Whoever purifies himself in his house, then comes to Masjid Quba and prays in it, has a reward like that of an Umrah.” (Ibn Majah)', tip: 'Make wudu at the hotel before boarding the coach.', map: 'Masjid Quba' },
        { name: 'Uhud and its martyrs', ar: 'جبل أحد · شهداء أحد', about: 'Site of the Battle of Uhud (3 AH). Sayyiduna Hamzah (RA), the Prophet’s ﷺ uncle, and the martyrs of Uhud are buried here, facing Jabal al-Rumah, the archers’ hill. “Uhud is a mountain that loves us and we love it.” (al-Bukhari, Muslim)', map: 'Uhud Martyrs Cemetery' },
        { name: 'Masjid al-Qiblatayn', ar: 'مسجد القبلتين', about: '“The Masjid of the Two Qiblahs”: where, according to well-known reports, the command to turn from Jerusalem towards the Ka’bah (al-Baqarah 2:144) reached the Companions during prayer.', map: 'Masjid al-Qiblatayn' },
        { name: 'Al-Khandaq and the Seven Mosques', ar: 'الخندق · المساجد السبعة', about: 'The area of the Battle of the Trench (al-Ahzab, 5 AH), where the Muslims dug a trench to defend Madinah. Masjid al-Fath stands here.', map: 'Seven Mosques Madinah' },
        { name: 'Date farms and market', ar: 'مزارع التمور', about: 'Madinah is famous for its dates, especially ’ajwah. “Whoever eats seven ’ajwah dates in the morning will not be harmed that day by poison or magic.” (al-Bukhari, Muslim)', tip: 'A good chance to buy dates and gifts.', map: 'Madinah dates market' },
      ],
    },
    {
      id: 'nabawi',
      title: 'In and around Masjid an-Nabawi',
      when: 'Any time during our stay',
      sites: [
        { id: 'rawdah', name: 'Al-Rawdah al-Sharifah', ar: 'الروضة الشريفة', about: '“Between my house and my minbar is a garden from the gardens of Paradise.” (al-Bukhari, Muslim)', tip: 'Visits need a permit booked in the Nusuk app. Slots are released in advance and go quickly.', map: 'Al Rawdah Al Sharifah' },
        { id: 'baqi', name: 'Jannat al-Baqi’', ar: 'البقيع', about: 'Madinah’s main cemetery, beside the masjid. ’Uthman ibn ’Affan (RA), many of the Prophet’s ﷺ family and wives, and thousands of Companions are buried here.', tip: 'Usually open to men after Fajr and after Asr.', map: 'Jannat al-Baqi' },
        { id: 'suffah', name: 'Al-Suffah', ar: 'الصفة', about: 'A shaded platform at the back of the Prophet’s ﷺ masjid where the “People of the Suffah”, poor Companions devoted to learning such as Abu Hurayrah (RA), lived and studied. It was Islam’s first school, and the name As-Suffa comes from it.', map: 'Masjid an-Nabawi' },
      ],
    },
  ],

  /* ---------------------------------------------------------------
     UMRAH GUIDE. Du’as are referenced by id from the `duas` list below.
     --------------------------------------------------------------- */
  guide: {
    intro: 'A simple walkthrough to help you follow along. On the day, always follow the guidance of the Shaykh and the group leaders, as some details differ between the madhhabs.',
    steps: [
      {
        id: 'prepare',
        title: 'Prepare for ihram',
        where: 'At home, at Manchester or during the Amman stopover',
        points: [
          'Clip your nails, remove unwanted hair and take a bath (ghusl). This is sunnah before ihram.',
          'Men may put perfume on the body (not on the ihram cloth) before making the intention.',
          'Men wear two plain white unstitched sheets, and sandals that leave the top of the foot uncovered.',
          'Women wear their normal modest clothing in any colour. The face and hands stay uncovered by niqab and gloves.',
          'If there is time, pray two rak’ahs before entering ihram. Many scholars recommend it.',
          'Tip: change into ihram in Amman and keep a spare set in your hand luggage.',
        ],
      },
      {
        id: 'ihram',
        title: 'Intention and Talbiyah at the miqat',
        where: 'On the Amman → Jeddah flight',
        points: [
          'The flight crosses the miqat before landing, and Jeddah is inside the boundary, so you must be in ihram before then.',
          'When the miqat is announced, make the intention for Umrah and begin the Talbiyah.',
          'Recite the Talbiyah often (men aloud, women quietly) until you begin tawaf.',
          'From this moment the restrictions of ihram apply. They are listed below.',
        ],
        duas: ['niyyah', 'talbiyah'],
      },
      {
        id: 'enter',
        title: 'Enter Masjid al-Haram',
        where: 'Makkah',
        points: [
          'Enter with your right foot, saying the du’a for entering the masjid.',
          'When you first see the Ka’bah, pause and make heartfelt du’a.',
          'Keep your shoes in a bag with you, and note your gate number as a meeting point.',
          'Make sure you have wudu: it is needed for tawaf.',
        ],
        duas: ['enter-masjid'],
      },
      {
        id: 'tawaf',
        title: 'Tawaf: seven circuits',
        where: 'Around the Ka’bah, starting at the Black Stone',
        points: [
          'Begin at the corner of the Black Stone (in line with the green light), keeping the Ka’bah on your left.',
          'Face the Black Stone and raise your right hand towards it, saying “Bismillahi wallahu akbar”. Kiss or touch it only if you can without pushing anyone. Repeat at the start of every circuit.',
          'Men keep the right shoulder uncovered (idtiba’) throughout this tawaf, and walk briskly (ramal) in the first three circuits if the crowd allows.',
          'Touch the Yemeni Corner if you can, without kissing it. Between it and the Black Stone, recite “Rabbana atina…”.',
          'There is no fixed du’a for each circuit. Make du’a and dhikr from the heart, in any language.',
          'Complete seven circuits, finishing at the Black Stone. The lap counter can help you keep track.',
        ],
        duas: ['tawaf-start', 'rabbana-atina'],
        tool: 'tawaf',
      },
      {
        id: 'salah',
        title: 'Two rak’ahs and Zamzam',
        where: 'Behind Maqam Ibrahim, or anywhere in the masjid',
        points: [
          'Men cover the right shoulder again.',
          'Pray two rak’ahs behind Maqam Ibrahim if there is space, otherwise anywhere in the masjid. It is sunnah to recite Surah al-Kafirun in the first and Surah al-Ikhlas in the second.',
          'Drink Zamzam to your fill, facing the qiblah, and make du’a.',
        ],
        duas: ['maqam', 'zamzam'],
      },
      {
        id: 'sai',
        title: 'Sa’i between Safa and Marwah',
        where: 'The Mas’a, inside the masjid',
        points: [
          'Go to Safa. As you approach it for the first time, recite the verse and “Abda’u bima bada’allahu bih”.',
          'Climb a little, face the Ka’bah, raise your hands and say the dhikr of Safa three times, making du’a in between.',
          'Walk to Marwah: that is one lap. Men jog lightly between the green lights.',
          'At Marwah, face the Ka’bah and repeat the same dhikr and du’a.',
          'Seven laps in total. Safa → Marwah is lap 1 and Marwah → Safa is lap 2, so you finish at Marwah.',
          'Wudu is recommended but not required for sa’i, and you may rest if you are tired.',
        ],
        duas: ['safa-approach', 'safa-marwah', 'green-markers'],
        tool: 'sai',
      },
      {
        id: 'hair',
        title: 'Shave or trim: Umrah complete',
        where: 'After sa’i',
        points: [
          'Men shave the whole head (halq), or trim evenly from all over it (taqsir). Shaving is better: the Prophet ﷺ made du’a three times for those who shave.',
          'Women gather the hair and trim about a fingertip’s length from the ends, in private.',
          'Your Umrah is complete and the restrictions of ihram are lifted. Alhamdulillah! Taqabbal Allahu minna wa minkum.',
        ],
        duas: ['taqabbal'],
      },
    ],
    restrictions: {
      title: 'Restrictions while in ihram',
      points: [
        'Perfume and scented products: soap, shampoo, deodorant, wipes and creams.',
        'Cutting or removing hair or nails.',
        'Men: stitched or fitted clothing (shirts, trousers, underwear, socks) and covering the head.',
        'Women: the niqab (face veil) and gloves.',
        'Hunting land animals.',
        'Marital relations, and proposing or contracting marriage.',
        'Arguing, swearing and sinful behaviour: “no obscenity, no wickedness, no quarrelling” (al-Baqarah 2:197).',
      ],
      note: 'If something happens by mistake or out of necessity, speak to the Shaykh. There may be an expiation (fidyah).',
    },
    madinah: {
      title: 'Visiting Madinah',
      points: [
        'Visiting Madinah is not part of Umrah, but a prayer in the Prophet’s ﷺ masjid is better than a thousand prayers elsewhere, except Masjid al-Haram. (al-Bukhari, Muslim)',
        'Enter with your right foot and the masjid du’a, and pray two rak’ahs.',
        'Then go calmly to the Prophet’s ﷺ grave, lower your voice and greet him, then Abu Bakr and ’Umar (RA). “Do not raise your voices above the voice of the Prophet” (al-Hujurat 49:2).',
        'Visits to the Rawdah need a permit booked in the Nusuk app.',
        'Pray in Masjid Quba, and greet the people of al-Baqi’ and the martyrs of Uhud.',
      ],
      duas: ['salam', 'graves'],
    },
  },

  /* ---------------------------------------------------------------
     DU’AS. category: journey | masjid | umrah | madinah | heart
     --------------------------------------------------------------- */
  duas: [
    {
      id: 'travel',
      category: 'journey',
      title: 'Du’a for travelling',
      when: 'When setting off. On return, add the final line.',
      ar: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى. اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ. اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ.',
      tr: 'Allāhu akbar, Allāhu akbar, Allāhu akbar. Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn. Allāhumma innā nas’aluka fī safarinā hādhal-birra wat-taqwā, wa minal-‘amali mā tarḍā. Allāhumma hawwin ‘alaynā safaranā hādhā waṭwi ‘annā bu‘dah. Allāhumma antaṣ-ṣāḥibu fis-safar, wal-khalīfatu fil-ahl. Allāhumma innī a‘ūdhu bika min wa‘thā’is-safar, wa ka’ābatil-manẓar, wa sū’il-munqalabi fil-māli wal-ahl.',
      en: 'Allah is the Greatest (×3). Glory be to the One who has placed this at our service, for we could never have done it ourselves, and to our Lord we shall surely return. O Allah, on this journey we ask You for righteousness and piety, and for deeds that please You. O Allah, make this journey easy for us and shorten its distance. O Allah, You are our Companion on the journey and the One who looks after our families. O Allah, I seek refuge in You from the hardships of travel, from distressing sights, and from an ill return to our wealth and family.',
      extra: { label: 'On returning, add:', ar: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ', tr: 'Āyibūna, tā’ibūna, ‘ābidūna, li-rabbinā ḥāmidūn.', en: 'We return, repenting, worshipping and praising our Lord.' },
      src: 'Muslim',
    },
    {
      id: 'enter-masjid',
      category: 'masjid',
      title: 'Entering the masjid',
      when: 'Step in with the right foot.',
      ar: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      tr: 'Bismillāh, waṣ-ṣalātu was-salāmu ‘alā Rasūlillāh. Allāhumma-ftaḥ lī abwāba raḥmatik.',
      en: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
      src: 'Muslim; Abu Dawud',
    },
    {
      id: 'leave-masjid',
      category: 'masjid',
      title: 'Leaving the masjid',
      when: 'Step out with the left foot.',
      ar: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
      tr: 'Bismillāh, waṣ-ṣalātu was-salāmu ‘alā Rasūlillāh. Allāhumma innī as’aluka min faḍlik.',
      en: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask You of Your bounty.',
      src: 'Muslim; Abu Dawud',
    },
    {
      id: 'niyyah',
      category: 'umrah',
      title: 'Intention for Umrah',
      when: 'At the miqat, then begin the Talbiyah.',
      ar: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
      tr: 'Labbayk Allāhumma ‘umratan.',
      en: 'Here I am, O Allah, for Umrah.',
      extra: { label: 'Many also say:', ar: 'اللَّهُمَّ إِنِّي أُرِيدُ الْعُمْرَةَ فَيَسِّرْهَا لِي وَتَقَبَّلْهَا مِنِّي', tr: 'Allāhumma innī urīdul-‘umrata fa-yassirhā lī wa taqabbalhā minnī.', en: 'O Allah, I intend to perform Umrah, so make it easy for me and accept it from me.' },
      src: 'Muslim',
    },
    {
      id: 'talbiyah',
      category: 'umrah',
      title: 'The Talbiyah',
      when: 'From the miqat until you begin tawaf. Men aloud, women quietly.',
      ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
      tr: 'Labbayk Allāhumma labbayk, labbayka lā sharīka laka labbayk, innal-ḥamda wan-ni‘mata laka wal-mulk, lā sharīka lak.',
      en: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. All praise, blessings and dominion belong to You. You have no partner.',
      src: 'al-Bukhari; Muslim',
    },
    {
      id: 'tawaf-start',
      category: 'umrah',
      title: 'At the Black Stone',
      when: 'At the start of each circuit of tawaf, raising the right hand towards it.',
      ar: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
      tr: 'Bismillāhi wallāhu akbar.',
      en: 'In the name of Allah, and Allah is the Greatest.',
      src: 'al-Bukhari (takbir); al-Bayhaqi',
    },
    {
      id: 'rabbana-atina',
      category: 'umrah',
      title: 'Between the Yemeni Corner and the Black Stone',
      when: 'On each circuit of tawaf.',
      ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      tr: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ‘adhāban-nār.',
      en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
      src: 'al-Baqarah 2:201; Abu Dawud',
    },
    {
      id: 'maqam',
      category: 'umrah',
      title: 'Going to Maqam Ibrahim',
      when: 'After tawaf, before the two rak’ahs.',
      ar: 'وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى',
      tr: 'Wattakhidhū min maqāmi Ibrāhīma muṣallā.',
      en: 'And take the station of Ibrahim as a place of prayer.',
      src: 'al-Baqarah 2:125; Muslim',
    },
    {
      id: 'zamzam',
      category: 'umrah',
      title: 'Drinking Zamzam',
      when: '“Zamzam water is for whatever it is drunk for.” (Ibn Majah)',
      ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ',
      tr: 'Allāhumma innī as’aluka ‘ilman nāfi‘an, wa rizqan wāsi‘an, wa shifā’an min kulli dā’.',
      en: 'O Allah, I ask You for beneficial knowledge, plentiful provision and a cure for every illness.',
      src: 'Reported from Ibn ’Abbas (al-Daraqutni)',
    },
    {
      id: 'safa-approach',
      category: 'umrah',
      title: 'Approaching Safa',
      when: 'Once, as you first approach Safa to begin sa’i.',
      ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ. أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
      tr: 'Innaṣ-ṣafā wal-marwata min sha‘ā’irillāh. Abda’u bimā bada’allāhu bih.',
      en: 'Indeed, Safa and Marwah are among the symbols of Allah. I begin with what Allah began with.',
      src: 'al-Baqarah 2:158; Muslim',
    },
    {
      id: 'safa-marwah',
      category: 'umrah',
      title: 'On Safa and Marwah',
      when: 'Facing the Ka’bah, three times, making du’a in between.',
      ar: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ. لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ',
      tr: 'Allāhu akbar, Allāhu akbar, Allāhu akbar. Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ‘alā kulli shay’in qadīr. Lā ilāha illallāhu waḥdah, anjaza wa‘dah, wa naṣara ‘abdah, wa hazamal-aḥzāba waḥdah.',
      en: 'Allah is the Greatest (×3). There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things. There is no god but Allah alone. He fulfilled His promise, helped His servant, and alone defeated the confederates.',
      src: 'Muslim',
    },
    {
      id: 'green-markers',
      category: 'umrah',
      title: 'Between the green lights',
      when: 'During sa’i. Men jog lightly here.',
      ar: 'رَبِّ اغْفِرْ وَارْحَمْ، إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ',
      tr: 'Rabbighfir warḥam, innaka antal-a‘azzul-akram.',
      en: 'My Lord, forgive and have mercy. You are the Most Mighty, the Most Generous.',
      src: 'Reported from Ibn Mas’ud and Ibn ’Umar (Ibn Abi Shaybah)',
    },
    {
      id: 'taqabbal',
      category: 'umrah',
      title: 'Du’a for acceptance',
      when: 'The du’a of Ibrahim and Isma’il (AS) as they raised the Ka’bah.',
      ar: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
      tr: 'Rabbanā taqabbal minnā innaka antas-samī‘ul-‘alīm.',
      en: 'Our Lord, accept this from us. You are the All-Hearing, the All-Knowing.',
      src: 'al-Baqarah 2:127',
    },
    {
      id: 'salam',
      category: 'madinah',
      title: 'Greeting the Prophet ﷺ',
      when: 'Facing the Prophet’s ﷺ grave, quietly. Then greet Abu Bakr and ’Umar (RA).',
      ar: 'السَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
      tr: 'As-salāmu ‘alayka yā Rasūlallāhi wa raḥmatullāhi wa barakātuh.',
      en: 'Peace be upon you, O Messenger of Allah, and the mercy of Allah and His blessings.',
      extra: { label: 'Then:', ar: 'السَّلَامُ عَلَيْكَ يَا أَبَا بَكْرٍ، السَّلَامُ عَلَيْكَ يَا عُمَرُ', tr: 'As-salāmu ‘alayka yā Abā Bakr. As-salāmu ‘alayka yā ‘Umar.', en: 'Peace be upon you, O Abu Bakr. Peace be upon you, O ’Umar.' },
      src: 'Reported from Ibn ’Umar (Malik, al-Muwatta’)',
    },
    {
      id: 'graves',
      category: 'madinah',
      title: 'Visiting the graves',
      when: 'At al-Baqi’, Uhud and al-Mu’alla.',
      ar: 'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَلَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
      tr: 'As-salāmu ‘alaykum ahlad-diyāri minal-mu’minīna wal-muslimīn, wa innā in shā’ Allāhu bikum la-lāḥiqūn, nas’alullāha lanā wa lakumul-‘āfiyah.',
      en: 'Peace be upon you, people of these dwellings, from among the believers and the Muslims. We will, if Allah wills, join you. We ask Allah for well-being for us and for you.',
      src: 'Muslim',
    },
    {
      id: 'salawat',
      category: 'madinah',
      title: 'Salawat on the Prophet ﷺ',
      when: 'Often, and especially on Fridays.',
      ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
      tr: 'Allāhumma ṣalli ‘alā Muḥammadin wa ‘alā āli Muḥammad, kamā ṣallayta ‘alā Ibrāhīma wa ‘alā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ‘alā Muḥammadin wa ‘alā āli Muḥammad, kamā bārakta ‘alā Ibrāhīma wa ‘alā āli Ibrāhīm, innaka ḥamīdun majīd.',
      en: 'O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious.',
      src: 'al-Bukhari',
    },
    {
      id: 'istighfar',
      category: 'heart',
      title: 'Sayyid al-Istighfar',
      when: 'The best way of seeking forgiveness.',
      ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      tr: 'Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ‘abduk, wa ana ‘alā ‘ahdika wa wa‘dika mastaṭa‘t, a‘ūdhu bika min sharri mā ṣana‘t, abū’u laka bi-ni‘matika ‘alayy, wa abū’u laka bi-dhanbī, faghfir lī, fa-innahū lā yaghfirudh-dhunūba illā ant.',
      en: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.',
      src: 'al-Bukhari',
    },
    {
      id: 'yunus',
      category: 'heart',
      title: 'The du’a of Yunus (AS)',
      when: 'In times of difficulty.',
      ar: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
      tr: 'Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn.',
      en: 'There is no god but You. Glory be to You! I have indeed been among the wrongdoers.',
      src: 'al-Anbiya’ 21:87',
    },
    {
      id: 'parents',
      category: 'heart',
      title: 'For parents',
      when: 'Remember them in every place of acceptance.',
      ar: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      tr: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā.',
      en: 'My Lord, have mercy on them as they raised me when I was small.',
      src: 'al-Isra’ 17:24',
    },
    {
      id: 'family',
      category: 'heart',
      title: 'For family',
      when: 'For spouses and children.',
      ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      tr: 'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata a‘yunin waj‘alnā lil-muttaqīna imāmā.',
      en: 'Our Lord, grant us from our spouses and children the coolness of our eyes, and make us leaders of the God-conscious.',
      src: 'al-Furqan 25:74',
    },
  ],

  dua_categories: [
    { id: 'journey', label: 'Journey' },
    { id: 'masjid', label: 'Masjid' },
    { id: 'umrah', label: 'Umrah' },
    { id: 'madinah', label: 'Madinah' },
    { id: 'heart', label: 'From the heart' },
  ],

  /* ---------------------------------------------------------------
     PACKING CHECKLIST. Ticks are saved on each person's phone.
     Keep ids stable so saved ticks still match.
     --------------------------------------------------------------- */
  checklist: [
    {
      id: 'docs',
      title: 'Documents and money',
      items: [
        { id: 'passport', text: 'Passport, valid for at least 6 months after we return' },
        { id: 'visa', text: 'Umrah visa: a printed copy and one on your phone' },
        { id: 'tickets', text: 'Flight booking reference / e-ticket' },
        { id: 'insurance', text: 'Travel insurance details' },
        { id: 'vaccine', text: 'Meningitis ACWY vaccination certificate, if you have been asked for one' },
        { id: 'copies', text: 'Copies of passport and visa, kept apart from the originals' },
        { id: 'money', text: 'Some Saudi riyals, plus a card that works abroad' },
        { id: 'contacts-paper', text: 'Emergency contacts written on paper' },
      ],
    },
    {
      id: 'ihram',
      title: 'Ihram and worship',
      items: [
        { id: 'ihram-sheets', text: 'Ihram sheets (men): bring a spare set' },
        { id: 'ihram-belt', text: 'Ihram belt or money pouch' },
        { id: 'pins', text: 'Safety pins' },
        { id: 'unscented', text: 'Unscented soap, shampoo and deodorant for while in ihram' },
        { id: 'scissors', text: 'Small scissors for trimming the hair after sa’i (not in hand luggage)' },
        { id: 'prayer-mat', text: 'Light travel prayer mat' },
        { id: 'quran', text: 'Pocket Qur’an or du’a book' },
        { id: 'tasbih', text: 'Tasbih' },
        { id: 'shoe-bag', text: 'Drawstring bag for your shoes in the Haram' },
        { id: 'dua-list', text: 'Your list of du’a requests from family and friends' },
      ],
    },
    {
      id: 'clothes',
      title: 'Clothing',
      items: [
        { id: 'sandals', text: 'Comfortable sandals you have already worn in' },
        { id: 'light-clothes', text: 'Loose, breathable, modest clothing for the heat' },
        { id: 'layer', text: 'A light jumper or shawl for air-conditioning and Madinah evenings' },
        { id: 'abaya', text: 'Sisters: abayas or jilbabs and hijabs' },
        { id: 'socks', text: 'Socks, sleepwear and a towel' },
      ],
    },
    {
      id: 'health',
      title: 'Health and comfort',
      items: [
        { id: 'meds', text: 'Personal medicines in hand luggage, with prescriptions' },
        { id: 'painkillers', text: 'Painkillers, plasters and blister pads' },
        { id: 'chafing', text: 'Anti-chafing balm or petroleum jelly, especially for men in ihram' },
        { id: 'rehydration', text: 'Rehydration sachets' },
        { id: 'sun', text: 'Unscented sunscreen, sunglasses and a small umbrella' },
        { id: 'sanitiser', text: 'Unscented hand sanitiser and face masks' },
        { id: 'bottle', text: 'Refillable water bottle for Zamzam' },
      ],
    },
    {
      id: 'tech',
      title: 'Phone and tech',
      items: [
        { id: 'charger', text: 'Phone and charger' },
        { id: 'powerbank', text: 'Power bank (hand luggage only)' },
        { id: 'adapter', text: 'Plug adapter. UK plugs usually fit, but bring one to be safe' },
        { id: 'nusuk', text: 'Nusuk app installed and account set up' },
        { id: 'whatsapp', text: 'Joined the group WhatsApp' },
        { id: 'esim', text: 'Saudi SIM or travel eSIM sorted, or roaming checked' },
        { id: 'app', text: 'This app added to your home screen (it works offline)' },
      ],
    },
    {
      id: 'home',
      title: 'Before you leave home',
      items: [
        { id: 'forgiveness', text: 'Ask family and friends for forgiveness and for their du’as' },
        { id: 'debts', text: 'Settle debts and leave your affairs in order' },
        { id: 'share-plan', text: 'Share this itinerary and the hotel names with family' },
        { id: 'bank', text: 'Let your bank know you are travelling' },
      ],
    },
  ],

  /* ---------------------------------------------------------------
     CONTACTS. type: phone | email | whatsapp | address | text
     --------------------------------------------------------------- */
  contacts: [
    {
      title: 'As-Suffa Tours',
      items: [
        { label: 'Tours team', value: 'tours@as-suffa.org', type: 'email' },
        { label: 'As-Suffa office', value: '0121 285 2777', tel: '+441212852777', type: 'phone' },
        { label: 'General enquiries', value: 'info@as-suffa.org', type: 'email' },
        { label: 'Address', value: 'As-Suffa Institute, Park Lane, Aston, Birmingham B6 5DA', type: 'address' },
      ],
    },
    {
      title: 'On the trip',
      items: [
        { label: 'Group scholar', value: 'Shaykh Siddiq Rahman al-Madani', type: 'text' },
        { label: 'Group leaders’ mobile and WhatsApp', value: 'To be shared before departure', type: 'text', tbc: true },
        { label: 'Makkah hotel', value: 'Al Safwah Tower 3 (فندق الصفوة البرج الثالث), Ajyad Street', type: 'text' },
        { label: 'Madinah hotel', value: 'Maden Taibah Hotel, near the Mövenpick', type: 'text' },
      ],
    },
    {
      title: 'Emergencies in Saudi Arabia',
      items: [
        { label: 'Unified emergency number (Makkah and Madinah)', value: '911', tel: '911', type: 'phone' },
        { label: 'Ambulance: Saudi Red Crescent', value: '997', tel: '997', type: 'phone' },
        { label: 'Police', value: '999', tel: '999', type: 'phone' },
        { label: 'Civil Defence (fire)', value: '998', tel: '998', type: 'phone' },
      ],
    },
    {
      title: 'UK help abroad',
      items: [
        { label: 'FCDO 24-hour consular helpline', value: '+44 20 7008 5000', tel: '+442070085000', type: 'phone' },
      ],
    },
  ],

  /* ---------------------------------------------------------------
     ESSENTIAL INFO
     --------------------------------------------------------------- */
  info: [
    { id: 'time', title: 'Time difference', body: [
      'Saudi Arabia is on UTC+3 all year, and so is Amman, our stopover.',
      'Until Saturday 24 October Saudi time is 2 hours ahead of the UK. UK clocks go back on Sunday 25 October, and from then Saudi is 3 hours ahead.',
      'All times in this app are Saudi time unless they say otherwise.',
    ] },
    { id: 'weather', title: 'Weather', body: [
      'Late October is still hot. Expect daytime highs in the mid-to-high 30s °C in Makkah and the low-to-mid 30s in Madinah, with warm nights. Madinah is a little cooler, especially in the evening.',
      'Air-conditioning in the masjids and hotels can feel cold, so carry a light layer.',
    ] },
    { id: 'money', title: 'Money', body: [
      'The currency is the Saudi riyal (SAR). Cards and phone payments are widely accepted.',
      'Carry some cash for small shops, stalls and tips, and let your bank know you are travelling.',
    ] },
    { id: 'phone', title: 'Phones and data', body: [
      'UK roaming can be expensive. Buy a Saudi SIM or eSIM (STC, Mobily or Zain) at the airport with your passport, or set up a travel eSIM before you fly.',
      'Hotels usually have Wi-Fi. Download offline maps of Makkah and Madinah before you go.',
    ] },
    { id: 'plugs', title: 'Plugs', body: [
      'Saudi Arabia mostly uses UK-style three-pin sockets (Type G), so UK plugs usually fit. A universal adapter is still handy.',
    ] },
    { id: 'health', title: 'Health and the heat', body: [
      'Drink plenty of water and Zamzam, use unscented sunscreen and an umbrella, and rest between acts of worship. Pace yourself, especially in the first days.',
      'Carry your medicines in hand luggage with your prescriptions, and tell the group leaders about any medical conditions.',
      'Saudi health rules for pilgrims include the meningitis ACWY vaccine. Check with As-Suffa what you need to show.',
    ] },
    { id: 'haram', title: 'In the Haram', body: [
      'Keep your shoes in a bag with you rather than leaving them at the doors.',
      'Agree a meeting point by gate name and number, for example King Abdul Aziz Gate (1) or King Fahd Gate (79), and stick with your group.',
      'Zamzam coolers are all around the masjid. Sisters have dedicated prayer areas, so follow the stewards’ directions.',
    ] },
    { id: 'nusuk', title: 'Nusuk app and the Rawdah', body: [
      'Install the Nusuk app before you travel and set up your account with your passport and visa details.',
      'Visits to the Rawdah in Madinah need a permit booked in the app. Slots are released in advance and go quickly, and the group leaders will help.',
    ] },
    { id: 'etiquette', title: 'Phones, photos and etiquette', body: [
      'Keep photos to a minimum, and never let them come at the expense of others’ worship. Put your phone on silent in the masjid.',
      'Be patient and gentle in the crowds. Everyone is a guest of Allah.',
    ] },
    { id: 'zamzam', title: 'Bringing Zamzam home', body: [
      'Airlines have their own rules on carrying Zamzam, usually a sealed 5-litre container bought at the airport. Check with the group leaders before you buy.',
    ] },
    { id: 'lost', title: 'Lost or unwell?', body: [
      'Stay calm, stay where you are, and call or WhatsApp a group leader. Keep your hotel card and this app with you.',
      'In an emergency dial 911, or 997 for an ambulance.',
    ] },
  ],
};
