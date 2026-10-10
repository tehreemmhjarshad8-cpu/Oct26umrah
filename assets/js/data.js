/*
  October Umrah 2026: trip content
  =================================
  This is the ONLY file you need to edit to update the app.
  Every change pushed to GitHub goes live on oct26tours.netlify.app automatically.

  • Anything unconfirmed has `tbc: true` and shows a TBC badge. When it is confirmed,
    update the text and delete `tbc: true` (and remove the line from `tbc: [...]`).
  • Times (`at`):
      '14:40'          exact time. Saudi time unless `tz: 'uk'` or `tz: 'amman'` is added
      'after:isha'     after a prayer (fajr, dhuhr, asr, maghrib, isha), calculated live
      'before:asr'     before a prayer
      'fajr'           at a prayer time
      'jumuah'         Jumu’ah (shown with the approximate Dhuhr time)
      any other text   shown as written, e.g. 'Morning', 'On arrival', 'TBC'
  • `dur` is how long something lasts, in minutes. The live "Now" banner uses it.
  • Itinerary entries can point at a flight (`flight: 'RJ 116'`) or a programme item
    (`programme: 'p-quba-walk'`), so those details are written once and shown everywhere.
  • `link` jumps to another part of the app, e.g. 'duas/talbiyah', 'steps/ihram', 'maps'.
  • After editing, bump CACHE_VERSION in sw.js so installed phones fetch the update.
*/
window.TRIP = {
  meta: {
    title: 'October Umrah',
    fullTitle: 'As-Suffa October Umrah 2026',
    scholar: 'Shaykh Siddiq Rahman al-Madani',
    organiser: 'As-Suffa Tours',
    footer: 'As-Suffa Tours • Oct 2026',
    startDate: '2026-10-21',
    endDate: '2026-11-02',
    // Live-mode boundaries (with UTC offsets; the UK is on BST until 25 October).
    tripStart: '2026-10-21T00:00:00+01:00',
    departure: '2026-10-21T15:35:00+01:00', // RJ 116 leaves Manchester: the countdown target
    homeArrival: '2026-11-02T13:30:00+00:00', // RJ 115 lands in Manchester
    lastUpdated: '2026-10-10',
    // Group chat, shown on the Home screen, in quick actions and in Contacts.
    whatsapp: 'https://chat.whatsapp.com/CFRsOIReF52HXPKXybK3OR',
    // "Latest updates" only shows updates dated on or after this day.
    updatesFrom: '2026-10-21',
    // As-Suffa Tours logo, shown at the top of the header.
    logo: 'assets/img/as-suffa-tours.png',
  },

  // Pre-departure seminar: the recording from the February 2026 trip.
  seminar: {
    title: 'Pre-Umrah Seminar',
    text: 'Watch this recording to cover all the essentials and answer your initial questions.',
    url: 'https://assuffa-my.sharepoint.com/:v:/g/personal/taz_assuffa_onmicrosoft_com/IQA3UXxeTQAJRaAYAUIP0TfQAdmioqaz_fl2jFq5xcAdpyc?e=Lxse4g',
  },

  // Coordinates for prayer times and weather (Saudi Arabia is UTC+3 all year).
  places: {
    makkah: { name: 'Makkah', lat: 21.4225, lng: 39.8262, tz: 3 },
    madinah: { name: 'Madinah', lat: 24.4672, lng: 39.6112, tz: 3 },
  },

  // Changes announced during the trip, newest first. Only those dated from `meta.updatesFrom`
  // (21 October) are shown, each with a NEW badge until that person has seen it. For example:
  //   { date: '2026-10-22', title: 'Umrah meeting time', text: 'Meet in the hotel lobby at 07:30.' },
  updates: [],

  // Shown on the Today tab until confirmed. Remove lines as they are confirmed.
  tbc: [
    'Meeting time and terminal at Manchester Airport',
    'Makkah ziyarat: most likely Sunday 25 October',
    'Farewell reminder and café social: Monday 26 October after Asr',
    'Makkah → Madinah: Tuesday 27 October, after Asr',
    'Masjid an-Nabawi walking tour: time on Wednesday',
    'Madinah ziyarat: Thursday 29 October',
    'Quba walk: time on Saturday',
    'Madinah farewell reminder: time and date',
    'Airport coach on Monday 2 November: time we leave the hotel',
  ],

  /* ---------------------------------------------------------------
     FLIGHTS. Times are local: `tz` is 'uk', 'amman' or 'saudi'.
     --------------------------------------------------------------- */
  flights: [
    {
      dir: 'Outbound',
      date: '2026-10-21',
      airline: 'Royal Jordanian',
      segments: [
        {
          no: 'RJ 116',
          from: { code: 'MAN', name: 'Manchester', date: '2026-10-21', time: '15:35', tz: 'uk' },
          to: { code: 'AMM', name: 'Amman Queen Alia', date: '2026-10-21', time: '23:00', tz: 'amman' },
          duration: '5h 25m',
          aircraft: 'Airbus A320neo',
          cabin: 'Economy',
        },
        {
          no: 'RJ 704',
          from: { code: 'AMM', name: 'Amman Queen Alia', date: '2026-10-22', time: '00:50', tz: 'amman' },
          to: { code: 'JED', name: 'Jeddah King Abdulaziz', date: '2026-10-22', time: '03:05', tz: 'saudi' },
          duration: '2h 15m',
          aircraft: 'Boeing 787-9 Dreamliner',
          cabin: 'Economy',
        },
      ],
      layovers: ['1h 50m · Change planes in Amman (AMM). Men change into ihram here.'],
    },
    {
      dir: 'Return',
      date: '2026-11-02',
      airline: 'Royal Jordanian',
      segments: [
        {
          no: 'RJ 723',
          from: { code: 'MED', name: 'Madinah Prince Mohammad bin Abdulaziz', date: '2026-11-02', time: '07:00', tz: 'saudi' },
          to: { code: 'AMM', name: 'Amman Queen Alia', date: '2026-11-02', time: '08:55', tz: 'amman' },
          duration: '1h 55m',
          aircraft: 'Boeing 787-9 Dreamliner',
          cabin: 'Economy',
        },
        {
          no: 'RJ 115',
          from: { code: 'AMM', name: 'Amman Queen Alia', date: '2026-11-02', time: '10:30', tz: 'amman' },
          to: { code: 'MAN', name: 'Manchester', date: '2026-11-02', time: '13:30', tz: 'uk' },
          duration: '6h 0m',
          aircraft: 'Airbus A320-100/200',
          cabin: 'Economy',
        },
      ],
      layovers: ['1h 35m · Change planes in Amman (AMM).'],
    },
  ],

  // Baggage allowance, shown under the flights. Replace TBC once confirmed with the booking.
  baggage: [
    { emoji: '🧳', title: 'Checked luggage', detail: 'Maximum 1 suitcase per person', value: '30 kg' },
    { emoji: '🎒', title: 'Hand luggage', detail: 'Cabin bag', value: '7 kg' },
    { emoji: '💧', title: 'Zamzam', detail: 'On the flight home', value: '5 L' },
  ],
  baggageTip: 'Take a larger suitcase than you need on the way out, so there is room to fill it up to 30 kg on the way back.',
  baggageNote: 'Only one checked bag each, so pack everything into a single suitcase. Power banks go in hand luggage only.',

  // Apps to install before travel.
  apps: [
    {
      name: 'Nusuk',
      tag: 'Mandatory',
      text: 'You MUST download this to book your Rawdah slot in Madinah.',
      steps: [
        { title: '1. Download', text: 'Search “Nusuk” on the App Store or Play Store.' },
        { title: '2. Book Rawdah', text: 'Book “Prophet’s Mosque services” as soon as you can. Slots go fast.' },
      ],
      ios: 'https://apps.apple.com/gb/app/nusuk-%D9%86%D8%B3%D9%83/id6469515422',
      android: 'https://play.google.com/store/apps/details?id=com.moh.nusukapp&hl=en_GB',
    },
  ],
  mapsTip: 'Don’t get lost without data! Open the map links before you fly. In Google Maps, tap your profile picture → Offline maps → Select your own map, then zoom into Makkah and Madinah and download them. Your GPS works even without internet.',

  /* ---------------------------------------------------------------
     HOTELS. `ar` / `arArea` are shown large on the taxi card.
     --------------------------------------------------------------- */
  hotels: [
    {
      id: 'makkah',
      city: 'Makkah',
      dates: '22–27 Oct',
      until: '2026-10-27T16:00:00+03:00', // when we leave for Madinah (approx.)
      name: 'Al Safwah Tower 3',
      aka: 'Safwa Towers',
      ar: 'فندق الصفوة البرج الثالث',
      arArea: 'شارع أجياد، بجوار المسجد الحرام',
      area: 'Ajyad Street, beside the Haram',
      distance: 'A few minutes’ walk to Masjid al-Haram',
      checkIn: 'On arrival, early Thu 22 Oct',
      checkOut: 'Tue 27 Oct',
      mapQuery: 'Al Safwah Hotel Tower 3 Makkah',
      notes: ['Room allocations and meals to be confirmed by the group leaders.'],
    },
    {
      id: 'madinah',
      city: 'Madinah',
      dates: '27 Oct – 2 Nov',
      until: '2026-11-02T07:00:00+03:00', // our flight home
      name: 'Maden Taibah Hotel',
      aka: 'Maden Taiba',
      arArea: 'بالقرب من فندق موفنبيك، المدينة المنورة',
      area: 'Near the Mövenpick Hotel',
      distance: 'About 8–10 minutes’ walk to Masjid an-Nabawi',
      checkIn: 'Late evening, Tue 27 Oct',
      checkOut: 'Early Mon 2 Nov, for the airport coach (time TBC)',
      mapQuery: 'Maden Taibah Hotel Madinah',
      notes: ['Room allocations and meals to be confirmed by the group leaders.'],
    },
  ],

  transfers: [
    { title: 'Jeddah Airport → Makkah', when: 'Thu 22 Oct, after landing at 03:05', note: 'Coach, about 1–1½ hours after immigration and baggage.' },
    { title: 'Makkah → Madinah', when: 'Tue 27 Oct, after Asr', note: 'Coach, about 450 km: roughly 5–6 hours with a rest and prayer stop.', tbc: true },
    { title: 'Ziyarat coaches', when: 'Sun 25 Oct (Makkah) and Thu 29 Oct (Madinah)', note: 'Coach tours of the historic sites with the Shaykh.', tbc: true },
    { title: 'Hotel → Madinah Airport', when: 'Early Mon 2 Nov, for the 07:00 flight', note: 'Coach, about 20–30 minutes. The time we leave the hotel will be confirmed.', tbc: true },
  ],

  /* ---------------------------------------------------------------
     ITINERARY. city: 'travel' | 'makkah' | 'madinah' | 'makkah-madinah'
     place: on a travel day, whose prayer times to show until its first flight
     type: flight | travel | hotel | ibadah | programme | ziyarah | free | info
     --------------------------------------------------------------- */
  days: [
    {
      date: '2026-10-21',
      city: 'travel',
      title: 'Bismillah, we set off',
      summary: 'Royal Jordanian from Manchester, via Amman.',
      items: [
        { at: 'Before you fly', tz: 'uk', type: 'info', title: 'Watch the essential seminar', note: 'Covers the essentials and answers your first questions.', link: 'video' },
        { at: 'TBC', tz: 'uk', type: 'travel', title: 'Meet the group at Manchester Airport', note: 'Meeting time and terminal to be confirmed. The flight leaves at 15:35, so plan to arrive around 12:30.', tbc: true },
        { at: 'Before leaving home', tz: 'uk', type: 'ibadah', title: 'Pray two rak’ahs and say the travel du’a', link: 'duas/travel' },
        { flight: 'RJ 116' },
        { at: '23:00', tz: 'amman', dur: 110, type: 'ibadah', title: 'Amman stopover (1h 50m): change into ihram', note: 'Men change into ihram here, or wear it from home. The intention is made on the next flight, before the miqat.', link: 'steps/ihram' },
      ],
    },
    {
      date: '2026-10-22',
      city: 'makkah',
      title: 'Arrival and Umrah',
      summary: 'Land in Jeddah at 03:05, coach to Makkah, then Umrah together.',
      items: [
        { flight: 'RJ 704', note: 'Make the intention for Umrah and begin the Talbiyah before the miqat, when it is announced shortly before landing.', link: 'duas/talbiyah' },
        { at: 'After landing', type: 'travel', title: 'Coach to Makkah', note: 'After immigration and baggage: about 1–1½ hours. Keep reciting the Talbiyah.' },
        { at: 'On arrival', type: 'hotel', title: 'Check in: Al Safwah Tower 3', note: 'On Ajyad Street, a few minutes’ walk from the Haram.', link: 'maps' },
        { programme: 'p-umrah' },
        { at: 'Afterwards', type: 'free', title: 'Rest after the long night' },
      ],
    },
    {
      date: '2026-10-23',
      city: 'makkah',
      title: 'Jumu’ah and the Haram walking tour',
      summary: 'Rest, Jumu’ah in Masjid al-Haram, and a walking tour of the Haram after Isha.',
      items: [
        { at: 'Morning', type: 'free', title: 'Rest and recovery' },
        { at: 'jumuah', dur: 60, type: 'ibadah', title: 'Jumu’ah in Masjid al-Haram', note: 'Arrive very early: the Haram fills well before the khutbah. Ghusl, Surah al-Kahf and plenty of salawat.', link: 'duas/salawat' },
        { programme: 'p-haram-walk' },
      ],
    },
    {
      date: '2026-10-24',
      city: 'makkah',
      title: 'Time with the Ka’bah',
      summary: 'A free day for tawaf, Qur’an and du’a.',
      items: [
        { at: 'All day', type: 'free', title: 'Personal ibadah: tawaf, Qur’an, du’a' },
        { at: 'Today', type: 'info', title: 'The white days begin (13 Jumada al-Ula)', note: 'The 13th–15th of the lunar month (Ayyam al-Bid) are sunnah fasting days for those able, by the Umm al-Qura calendar.' },
      ],
    },
    {
      date: '2026-10-25',
      city: 'makkah',
      title: 'Makkah ziyarat',
      summary: 'Coach tour of the historic sites of Makkah. Most likely today.',
      tbc: true,
      items: [
        { programme: 'p-makkah-ziyarat' },
        { at: 'Today', type: 'info', title: 'UK clocks go back one hour', note: 'Saudi time is now 3 hours ahead of the UK. Remember this when calling home.' },
        { at: 'Afternoon', type: 'free', title: 'Rest and personal ibadah' },
      ],
    },
    {
      date: '2026-10-26',
      city: 'makkah',
      title: 'Farewell reminder & café social',
      summary: 'Our last full day in Makkah.',
      items: [
        { at: 'Morning', type: 'free', title: 'Free for ibadah in the Haram', note: 'If you hope to perform an additional Umrah, speak to the Shaykh first.' },
        { programme: 'p-makkah-farewell' },
        { at: 'Night', type: 'hotel', title: 'Pack for Madinah', note: 'Check-out time and luggage arrangements to be confirmed.', tbc: true },
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
        { at: 'after:asr', dur: 360, type: 'travel', title: 'Coach departs for Madinah', note: 'About 450 km: roughly 5–6 hours with a rest and prayer stop.', tbc: true },
        { at: 'Late evening', type: 'hotel', title: 'Arrive in Madinah and check in: Maden Taibah Hotel', note: 'Near the Mövenpick, about 8–10 minutes’ walk to Masjid an-Nabawi.', link: 'maps' },
      ],
    },
    {
      date: '2026-10-28',
      city: 'madinah',
      title: 'Masjid an-Nabawi walking tour',
      summary: 'Greeting the Prophet ﷺ and a guided walk through his masjid.',
      items: [
        { at: 'after:fajr', dur: 45, type: 'ibadah', title: 'Send salam upon the Prophet ﷺ', note: 'Pray two rak’ahs, then greet the Prophet ﷺ, Abu Bakr and ’Umar (RA), calmly and quietly.', link: 'duas/salam' },
        { programme: 'p-nabawi-walk' },
        { at: 'Today', type: 'info', title: 'Book your Rawdah slot in the Nusuk app', note: 'Book “Prophet’s Mosque services” as soon as you can: slots go fast.', link: 'apps' },
      ],
    },
    {
      date: '2026-10-29',
      city: 'madinah',
      title: 'Madinah ziyarat',
      summary: 'Coach tour of Uhud and the historic sites of Madinah. Expected today.',
      tbc: true,
      items: [
        { programme: 'p-madinah-ziyarat' },
        { at: 'Evening', type: 'ibadah', title: 'The night before Jumu’ah', note: 'Increase your salawat on the Prophet ﷺ.', link: 'duas/salawat' },
      ],
    },
    {
      date: '2026-10-30',
      city: 'madinah',
      title: 'Jumu’ah in Masjid an-Nabawi',
      summary: 'Friday in the Prophet’s ﷺ masjid.',
      items: [
        { at: 'jumuah', dur: 60, type: 'ibadah', title: 'Jumu’ah in Masjid an-Nabawi', note: 'Go 2 hours early to find a place inside.' },
        { at: 'after:asr', dur: 45, type: 'free', title: 'Optional: visit Jannat al-Baqi’ (men)', note: 'Open to men after Fajr and after Asr. Greet its people with the du’a for visiting graves.', link: 'duas/graves' },
      ],
    },
    {
      date: '2026-10-31',
      city: 'madinah',
      title: 'Masjid Quba walk',
      summary: 'Walking to Quba on a Saturday, following the sunnah.',
      items: [
        { programme: 'p-quba-walk' },
        { at: 'Afternoon', type: 'free', title: 'Dates and gifts', note: 'A good time to buy ’ajwah dates.' },
      ],
    },
    {
      date: '2026-11-01',
      city: 'madinah',
      title: 'Farewell to Madinah',
      summary: 'Our last day in the city of the Prophet ﷺ. Pack tonight: we fly early tomorrow.',
      items: [
        { at: 'Morning', type: 'free', title: 'Personal ibadah in Masjid an-Nabawi' },
        { programme: 'p-madinah-farewell' },
        { at: 'Evening', type: 'ibadah', title: 'Farewell salam at the Prophet’s ﷺ masjid' },
        { at: 'Night', type: 'hotel', title: 'Pack and sleep early', note: 'Our flight leaves Madinah at 07:00, so the airport coach leaves in the early hours (time to be confirmed). Keep your passport and medicines in your hand luggage.', tbc: true },
      ],
    },
    {
      date: '2026-11-02',
      city: 'travel',
      place: 'madinah', // prayer times shown until the flight leaves
      title: 'Return home',
      summary: 'Royal Jordanian from Madinah via Amman, landing in Manchester at 13:30.',
      items: [
        { at: 'Early hours (TBC)', type: 'travel', title: 'Check out and coach to Madinah Airport', note: 'About 20–30 minutes from the hotel. The time we leave will be confirmed by the group leaders.', tbc: true },
        { at: 'fajr', dur: 30, type: 'ibadah', title: 'Pray before boarding', note: 'Most likely at the airport.' },
        { flight: 'RJ 723' },
        { at: '08:55', tz: 'amman', dur: 95, type: 'travel', title: 'Amman stopover (1h 35m): change planes' },
        { flight: 'RJ 115' },
        { at: '13:30', tz: 'uk', dur: 30, type: 'travel', title: 'Home in Manchester', note: 'Say the du’a for returning from travel. Taqabbal Allahu minna wa minkum!', link: 'duas/travel' },
      ],
    },
  ],

  /* ---------------------------------------------------------------
     PROGRAMME: group activities with the Shaykh. Each appears in the
     itinerary too. Mark one confirmed by deleting `tbc: true`.
     --------------------------------------------------------------- */
  programme: {
    intro: 'Group activities with Shaykh Siddiq Rahman al-Madani. Exact times are confirmed by the group leaders on the day.',
    items: [
      { id: 'p-umrah', date: '2026-10-22', at: 'On arrival', dur: 180, icon: '🕋', kind: 'Group Umrah', title: 'Umrah on arrival', text: 'We go together as a group. If you have performed Umrah before, you are advised to go solo.', meet: 'Time and meeting point given on arrival', link: 'steps' },
      { id: 'p-haram-walk', date: '2026-10-23', at: 'after:isha', dur: 90, icon: '🚶', kind: 'Walking tour', title: 'Walking tour of the Haram', text: 'A guided walk around Masjid al-Haram with the Shaykh.', meet: 'Hotel lobby, in sha’ Allah' },
      { id: 'p-makkah-ziyarat', date: '2026-10-25', at: '08:00', dur: 240, icon: '🚌', kind: 'Ziyarat', title: 'Makkah ziyarat by coach', text: 'Jabal Thawr, ’Arafat, Muzdalifah, Mina and Jabal al-Nur. Most likely Sunday; the route is confirmed nearer the day.', meet: 'Hotel lobby (TBC)', link: 'maps/makkah', tbc: true },
      { id: 'p-makkah-farewell', date: '2026-10-26', at: 'after:asr', dur: 90, icon: '☕', kind: 'Farewell & social', title: 'Farewell reminder & café social', text: 'A farewell reminder from the Shaykh, then a relaxed café moment together before we leave Makkah.', meet: 'TBC', tbc: true },
      { id: 'p-nabawi-walk', date: '2026-10-28', at: 'TBC', dur: 90, icon: '🚶', kind: 'Walking tour', title: 'Walking tour of Masjid an-Nabawi', text: 'A guided walk through the Prophet’s ﷺ masjid and its history.', meet: 'Hotel lobby (TBC)', tbc: true },
      { id: 'p-madinah-ziyarat', date: '2026-10-29', at: '08:00', dur: 240, icon: '🚌', kind: 'Ziyarat', title: 'Madinah ziyarat by coach', text: 'Uhud and its martyrs, Masjid al-Qiblatayn, al-Khandaq and the date farms. The route is confirmed nearer the day.', meet: 'Hotel lobby (TBC)', link: 'maps/madinah', tbc: true },
      { id: 'p-quba-walk', date: '2026-10-31', at: 'TBC', dur: 120, icon: '🚶', kind: 'Walk', title: 'Masjid Quba walk', text: 'The Prophet ﷺ used to visit Quba every Saturday, walking or riding (al-Bukhari, Muslim). Leave with wudu: a prayer in Masjid Quba carries the reward of an Umrah.', meet: 'Hotel lobby (TBC)', tbc: true },
      { id: 'p-madinah-farewell', date: '2026-11-01', at: 'TBC', dur: 60, icon: '🤲', kind: 'Farewell', title: 'Farewell reminder', text: 'Closing reminder and du’a before we leave Madinah. Time and date to be confirmed.', tbc: true },
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
        { name: 'Jabal al-Nur and the Cave of Hira', ar: 'جبل النور · غار حراء', about: 'The “Mountain of Light”. In the Cave of Hira near its summit, the first verses of the Qur’an were revealed: “Read in the name of your Lord who created” (al-’Alaq 96:1–5).', tip: 'Usually seen from the foot of the mountain. To climb up to the cave yourself, see Seerah spots.', map: 'Jabal al-Nour Makkah' },
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
        { name: 'Masjid Quba', ar: 'مسجد قباء', about: 'The first masjid built in Islam, founded by the Prophet ﷺ when he arrived at Madinah (al-Tawbah 9:108). “Whoever purifies himself in his house, then comes to Masjid Quba and prays in it, has a reward like that of an Umrah.” (Ibn Majah)', tip: 'Leave the hotel with wudu. We also walk to Quba together on Saturday 31 October.', map: 'Masjid Quba' },
        { name: 'Uhud and its martyrs', ar: 'جبل أحد · شهداء أحد', about: 'Site of the Battle of Uhud (3 AH). Sayyiduna Hamzah (RA), the Prophet’s ﷺ uncle, and the martyrs of Uhud are buried here, facing Jabal al-Rumah, the archers’ hill. “Uhud is a mountain that loves us and we love it.” (al-Bukhari, Muslim)', map: 'Uhud Martyrs Cemetery' },
        { name: 'Masjid al-Qiblatayn', ar: 'مسجد القبلتين', about: '“The Masjid of the Two Qiblahs”: where, according to well-known reports, the command to turn from Jerusalem towards the Ka’bah (al-Baqarah 2:144) reached the Companions during prayer.', map: 'Masjid al-Qiblatayn' },
        { name: 'Al-Khandaq and the Seven Mosques', ar: 'الخندق · المساجد السبعة', about: 'The area of the Battle of the Trench (al-Ahzab, 5 AH), where the Muslims dug a trench to defend Madinah. Masjid al-Fath stands here.', map: 'Seven Mosques Madinah' },
        { name: 'Date farms and market', ar: 'مزارع التمور', about: 'Madinah is famous for its dates, especially ’ajwah. “Whoever eats seven ’ajwah dates in the morning will not be harmed that day by poison or magic.” (al-Bukhari, Muslim)', tip: 'A good chance to buy dates and gifts.', map: 'Madinah dates market' },
      ],
    },
  ],


  /* ---------------------------------------------------------------
     SEERAH SPOTS: places people can visit on their own.
     `ar` is shown big on the taxi card. `taxi: true` adds a taxi card button.
     --------------------------------------------------------------- */
  seerah: {
    intro: 'Places from the life of the Prophet ﷺ you can visit yourself in your free time. Go in twos or threes, tell someone where you are going, carry water and avoid the midday heat.',
    spots: [
      {
        id: 'birthplace',
        city: 'makkah',
        name: 'Birthplace of the Prophet ﷺ',
        ar: 'مكتبة مكة المكرمة',
        where: 'Makkah Library, in Suq al-Layl on the east side of the Haram',
        go: '5–10 min walk from the Haram',
        about: 'The Prophet ﷺ was born in Makkah in the Year of the Elephant (around 570 CE). The small library here stands on the spot long remembered as the house where he was born, in the quarter of his clan, Banu Hashim.',
        tip: 'The library is usually closed to visitors, so it is seen from outside. A good moment to send salawat on the Prophet ﷺ.',
        link: 'duas/salawat',
        map: 'Makkah Al Mukarramah Library',
      },
      {
        id: 'mualla',
        city: 'makkah',
        name: 'Jannat al-Mu’alla',
        ar: 'مقبرة المعلاة',
        where: 'Al-Hajun, about 1 km north of the Haram',
        go: '15–20 min walk',
        about: 'Makkah’s historic cemetery. Sayyidah Khadijah (RA), the Prophet’s ﷺ beloved wife and the first to believe in him, was buried here in the Year of Sorrow, three years before the Hijrah. Members of his family and many Companions are also buried here.',
        tip: 'Visits are usually for men, at set times. Greet its people with the du’a for visiting graves. Masjid al-Jinn is next door.',
        link: 'duas/graves',
        map: 'Jannat al-Mualla',
      },
      {
        id: 'jinn',
        city: 'makkah',
        name: 'Masjid al-Jinn',
        ar: 'مسجد الجن',
        where: 'Al-Hajun, beside Jannat al-Mu’alla, about 900 m north of the Haram',
        go: '15 min walk',
        about: 'Built where, according to Makkan tradition, a group of jinn listened to the Prophet ﷺ reciting the Qur’an and believed. Allah tells of it in Surah al-Jinn (72:1–2) and Surah al-Ahqaf (46:29–31).',
        tip: 'Visit it together with Jannat al-Mu’alla.',
        map: 'Masjid al-Jinn Makkah',
      },
      {
        id: 'hira',
        city: 'makkah',
        name: 'Cave of Hira walk',
        ar: 'جبل النور · غار حراء',
        where: 'Jabal al-Nur, about 4 km north-east of the Haram',
        go: '15 min by taxi, then a 45–60 min climb',
        taxi: true,
        about: 'Before prophethood, the Prophet ﷺ would retreat to this cave for nights of worship. Here, in Ramadan, the angel Jibril (AS) brought the first revelation: “Read in the name of your Lord who created” (al-’Alaq 96:1–5; al-Bukhari, Muslim).',
        tip: 'About 1,200 steep, uneven steps. Go straight after Fajr, before the heat, with water, grippy shoes and a friend. Not for anyone with heart, breathing or knee problems. At the foot of the mountain, the Hira Cultural District has an exhibition on the revelation.',
        map: 'Jabal al-Nour Makkah',
      },
      {
        id: 'aisha',
        city: 'makkah',
        name: 'Masjid ’A’ishah (al-Tan’im)',
        ar: 'مسجد عائشة · التنعيم',
        where: 'Al-Tan’im, about 7.5 km north of the Haram, on the road to Madinah',
        go: '15–20 min by taxi',
        taxi: true,
        about: 'The nearest point outside the sacred boundary of Makkah. During the Farewell Hajj, the Prophet ﷺ sent ’A’ishah (RA) here with her brother ’Abd al-Rahman to enter ihram for Umrah (al-Bukhari, Muslim). People staying in Makkah enter ihram here for another Umrah.',
        tip: 'Thinking of another Umrah? Speak to the Shaykh first.',
        map: 'Masjid Aisha Al Taneem',
      },
      {
        id: 'rawdah',
        city: 'madinah',
        name: 'Al-Rawdah al-Sharifah',
        ar: 'الروضة الشريفة',
        where: 'Inside Masjid an-Nabawi, between the Prophet’s ﷺ house and his minbar',
        go: 'Inside the masjid',
        about: '“Between my house and my minbar is a garden from the gardens of Paradise.” (al-Bukhari, Muslim)',
        tip: 'You need a permit booked in the Nusuk app. Slots are released in advance and go quickly.',
        link: 'apps',
        map: 'Al Rawdah Al Sharifah',
      },
      {
        id: 'suffah',
        city: 'madinah',
        name: 'Al-Suffah',
        ar: 'الصفة',
        where: 'Inside Masjid an-Nabawi, at the back of the Prophet’s ﷺ original masjid',
        go: 'Inside the masjid',
        about: 'A shaded platform where the “People of the Suffah”, poor Companions devoted to learning such as Abu Hurayrah (RA), lived and studied. It was Islam’s first school, and the name As-Suffa comes from it.',
        tip: 'Look out for it on our walking tour of Masjid an-Nabawi.',
        link: 'programme/p-nabawi-walk',
        linkText: 'Our Nabawi walking tour',
        map: 'Masjid an-Nabawi',
      },
      {
        id: 'baqi',
        city: 'madinah',
        name: 'Jannat al-Baqi’',
        ar: 'البقيع',
        where: 'Beside Masjid an-Nabawi, to the east',
        go: '5 min walk',
        about: 'Madinah’s main cemetery. ’Uthman ibn ’Affan (RA), many of the Prophet’s ﷺ family and wives, and thousands of Companions are buried here.',
        tip: 'Usually open to men after Fajr and after Asr. Greet its people with the du’a for visiting graves.',
        link: 'duas/graves',
        map: 'Jannat al-Baqi',
      },
      {
        id: 'ghamamah',
        city: 'madinah',
        name: 'Masjid al-Ghamamah',
        ar: 'مسجد الغمامة',
        where: 'About 200 m south-west of Masjid an-Nabawi',
        go: '5 min walk',
        about: 'The Prophet’s ﷺ prayer ground (musalla), where he led the Eid prayers in his final years and prayed for rain. Its name, “the cloud”, recalls a cloud said to have shaded him here. Small masjids named after Abu Bakr and ’Ali (RA) stand nearby.',
        tip: 'An easy stop on a morning walk around the masjid.',
        map: 'Masjid Al Ghamamah',
      },
      {
        id: 'saqifah',
        city: 'madinah',
        name: 'Saqifah Bani Sa’idah',
        ar: 'سقيفة بني ساعدة',
        where: 'Just north-west of Masjid an-Nabawi',
        go: '5 min walk',
        about: 'The covered meeting place of the Banu Sa’idah, a clan of the Ansar. After the Prophet ﷺ passed away, the Companions gathered here and gave their pledge to Abu Bakr (RA) as the first caliph (al-Bukhari).',
        tip: 'Today it is a small garden: another easy stop on a walk around the masjid.',
        map: 'Saqifah Bani Saidah',
      },
      {
        id: 'ijabah',
        city: 'madinah',
        name: 'Masjid al-Ijabah',
        ar: 'مسجد الإجابة',
        where: 'Al-Sittin Street, about 600 m north-east of Masjid an-Nabawi, past al-Baqi’',
        go: '10 min walk',
        about: 'The old masjid of Banu Mu’awiyah. The Prophet ﷺ prayed here and made a long du’a, asking his Lord for three things for his Ummah: two were granted and one was withheld (Muslim). Its name means “the answering”.',
        tip: 'A quiet place to pray and make du’a.',
        map: 'Masjid Al Ijabah Madinah',
      },
      {
        id: 'museum',
        city: 'madinah',
        name: 'Seerah Museum',
        ar: 'متحف السيرة النبوية',
        where: 'Abu Ayyub al-Ansari Street, just south of Masjid an-Nabawi',
        go: '5–10 min walk',
        about: 'The International Fair and Museum of the Prophet’s Biography: models of Makkah and Madinah in the Prophet’s ﷺ time and halls on his life, in several languages including English and Urdu.',
        tip: 'A good choice in the heat of the day. Check opening times and tickets before you go.',
        map: 'International Fair and Museum of the Prophet Biography Madinah',
      },
      {
        id: 'quba',
        city: 'madinah',
        name: 'Masjid Quba on foot',
        ar: 'مسجد قباء',
        where: 'About 3 km south of Masjid an-Nabawi, along the Quba Walkway',
        go: '40–45 min walk, or 10 min by taxi',
        taxi: true,
        about: 'The first masjid in Islam, founded when the Prophet ﷺ arrived on the Hijrah (al-Tawbah 9:108). He used to visit it every Saturday, walking or riding (al-Bukhari, Muslim), and a prayer in it carries the reward of an Umrah (Ibn Majah).',
        tip: 'We walk there together on Saturday 31 October. Going another day? Leave with wudu. The walkway is shaded, with benches along the way.',
        link: 'programme/p-quba-walk',
        linkText: 'Our Saturday Quba walk',
        map: 'Masjid Quba',
      },
    ],
  },

  /* ---------------------------------------------------------------
     UMRAH GUIDE. Du’as are referenced by id from the `duas` list below.
     --------------------------------------------------------------- */
  guide: {
    intro: 'A simple walkthrough to help you follow along. We perform Umrah together on arrival; if you have performed Umrah before, you are advised to go solo. On the day, always follow the guidance of the Shaykh and the group leaders, as some details differ between the madhhabs.',
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
          'Tip: change into ihram in Amman during the 1h 50m stopover, and keep a spare set in your hand luggage.',
        ],
      },
      {
        id: 'ihram',
        title: 'Intention and Talbiyah at the miqat',
        where: 'On RJ 704, Amman → Jeddah (00:50–03:05)',
        points: [
          'The flight crosses the miqat shortly before landing, and Jeddah is inside the boundary, so you must be in ihram before then.',
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
     `optional: true` shows an "Optional" tag and doesn't count towards progress.
     `provided: '…'` means As-Suffa supplies it: shown without a tick box.
     `note` adds a short line under the item.
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
        { id: 'ihram-belt', text: 'Ihram belt (zip preferred) or money pouch' },
        { id: 'quran', text: 'Pocket Qur’an or du’a book' },
        { id: 'dua-list', text: 'Your list of du’a requests from family and friends' },
        { id: 'shoe-bag', text: 'Drawstring bag for your shoes in the Haram', provided: 'As-Suffa will provide one' },
        { id: 'pins', text: 'Safety pins', optional: true },
        { id: 'unscented', text: 'Unscented soap, shampoo and deodorant for while in ihram', optional: true },
        { id: 'scissors', text: 'Small scissors for trimming the hair after sa’i (not in hand luggage)', optional: true, note: 'Handy for sisters. Brothers usually go to a barber.' },
        { id: 'prayer-mat', text: 'Light travel prayer mat', optional: true },
        { id: 'tasbih', text: 'Tasbih', optional: true },
      ],
    },
    {
      id: 'men',
      title: 'Men’s clothing',
      items: [
        { id: 'ihram-sandals', text: 'Ihram sandals that leave the top of the foot uncovered' },
        { id: 'thobes', text: '3–5 thobes or loose clothing' },
      ],
    },
    {
      id: 'women',
      title: 'Women’s clothing',
      items: [
        { id: 'abayas', text: '4–6 lightweight abayas' },
        { id: 'hijabs', text: 'Neutral or dark hijabs' },
        { id: 'walking-shoes', text: 'Comfortable walking shoes' },
      ],
    },
    {
      id: 'clothes',
      title: 'Everyone',
      items: [
        { id: 'suitcase', text: 'One suitcase (up to 30 kg) and a hand-luggage bag (up to 7 kg)', note: 'Take a larger suitcase so there is room to fill it on the way back.' },
        { id: 'sandals', text: 'Comfortable footwear you have already worn in' },
        { id: 'layer', text: 'A light jumper or shawl for air-conditioning and Madinah evenings' },
        { id: 'socks', text: 'Socks, sleepwear and a towel' },
      ],
    },
    {
      id: 'health',
      title: 'Health and comfort',
      items: [
        { id: 'meds', text: 'Personal medicines in hand luggage, with prescriptions' },
        { id: 'painkillers', text: 'Paracetamol or ibuprofen, plasters and blister pads' },
        { id: 'rehydration', text: 'Rehydration sachets' },
        { id: 'sun', text: 'Unscented sunscreen, sunglasses and a small umbrella' },
        { id: 'sanitiser', text: 'Unscented hand sanitiser and face masks' },
        { id: 'bottle', text: 'Refillable water bottle for Zamzam', note: 'As-Suffa may provide one.', tbc: true },
        { id: 'chafing', text: 'Anti-chafing balm or Vaseline', optional: true, note: 'Most people won’t need it: we are only in ihram for a short time, and pharmacies in Makkah sell it.' },
      ],
    },
    {
      id: 'tech',
      title: 'Phone and tech',
      items: [
        { id: 'charger', text: 'Phone and charger' },
        { id: 'powerbank', text: 'Power bank (hand luggage only)' },
        { id: 'adapter', text: 'Universal plug adapter', optional: true, note: 'UK plugs usually fit Saudi sockets.' },
        { id: 'nusuk', text: 'Nusuk app installed (mandatory for the Rawdah) and account set up' },
        { id: 'offline-maps', text: 'Offline Google Maps of Makkah and Madinah downloaded' },
        { id: 'whatsapp', text: 'Joined the group WhatsApp' },
        { id: 'seminar', text: 'Watched the essential seminar recording' },
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
  // `emergency: true` contacts also appear on the home screen. Carried over from the February trip.
  contacts: [
    {
      title: 'Emergency contacts',
      items: [
        { label: 'Logistics Coordinator', value: 'Tabraz Khan', tel: '+447525536007', type: 'phone', emergency: true },
        { label: 'Admin Team', value: 'As-Suffa UK', tel: '+447804636290', type: 'phone', emergency: true },
      ],
    },
    {
      title: 'On the trip',
      items: [
        { label: 'Shaykh Siddiq Rahman al-Madani, our group scholar', value: '+966 56 838 2176', tel: '+966568382176', type: 'phone' },
        { label: 'Makkah hotel', value: 'Al Safwah Tower 3 (Safwa Towers), Ajyad Street', type: 'text' },
        { label: 'Madinah hotel', value: 'Maden Taibah Hotel, near the Mövenpick', type: 'text' },
      ],
    },
    {
      title: 'As-Suffa Tours',
      detail: true, // hidden in Simple view
      items: [
        { label: 'Tours team', value: 'tours@as-suffa.org', type: 'email' },
        { label: 'As-Suffa office', value: '0121 285 2777', tel: '+441212852777', type: 'phone' },
        { label: 'General enquiries', value: 'info@as-suffa.org', type: 'email' },
        { label: 'Address', value: 'As-Suffa Institute, Park Lane, Aston, Birmingham B6 5DA', type: 'address' },
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
      'You can bring back 5 litres of Zamzam on the flight home, on top of your 30 kg suitcase. It is usually a sealed 5-litre container bought at the airport, so check with the group leaders before you buy.',
    ] },
    { id: 'home', title: 'Flying home from Madinah', body: [
      'Our return flight, RJ 723, leaves Madinah airport (MED) at 07:00 on Monday 2 November, so expect a very early start. The time the coach leaves the hotel will be confirmed.',
      'Pack the night before, and keep your passport, medicines and anything you need for the journey in your hand luggage.',
    ] },
    { id: 'install', title: 'Putting the app on your home screen', body: [
      'You don’t have to install anything: the page works in your browser, and offline once you have opened it.',
      'iPhone: open it in Safari, tap Share, then “Add to Home Screen”. Android: in Chrome, tap ⋮ then “Add to Home screen” or “Install app”.',
      'Samsung Internet: tap the menu, then “Add page to” → “Home screen”. If Google Play Protect ever says “Unsafe app blocked”, just tap OK: nothing was installed. Use the steps above, or Chrome, instead.',
    ] },
    { id: 'lost', title: 'Lost or unwell?', body: [
      'Stay calm, stay where you are, and call or WhatsApp a group leader. Keep your hotel card and this app with you.',
      'In an emergency dial 911, or 997 for an ambulance.',
    ] },
  ],
};
