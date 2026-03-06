// --- DATA: Icons, Splits, Phases, Mobility ---
const icon = (path, col) => `<svg class="w-5 h-5 ${col}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const I = {
    gym: icon('<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>', 'text-blue-600 dark:text-blue-400'),
    run: icon('<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.67 5.71-2 8a7 7 0 0 0 2 5.18V22H5a2 2 0 0 1-2-2v-4"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 13 7.8 13 12c0 2.85 1.67 5.71 2 8a7 7 0 0 0-2 5.18V26h6a2 2 0 0 0 2-2v-4"/>', 'text-orange-500 dark:text-orange-400'),
    bike: icon('<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-5"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>', 'text-teal-600 dark:text-teal-400'),
    vol: icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', 'text-pink-600 dark:text-pink-400'),
    sparkle: icon('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>', 'text-indigo-500 dark:text-indigo-400'),
    gradient: icon('<circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/>', 'text-purple-500 dark:text-purple-400'),
    rest: icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'text-slate-400 dark:text-slate-500'),
    check: icon('<polyline points="20 6 9 17 4 12"/>', 'text-white'),
    brain: icon('<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>', 'text-indigo-600 dark:text-indigo-300'),
    chart: icon('<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>', 'text-slate-600 dark:text-slate-300'),
    plan: icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'text-slate-600 dark:text-slate-300'),
    sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', 'text-amber-500'),
    timer: icon('<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>', 'text-blue-500 dark:text-blue-400'),
    moon: icon('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', 'text-slate-400'),
    save: icon('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>', 'text-white'),
    left: icon('<polyline points="15 18 9 12 15 6"/>', 'text-slate-500 dark:text-slate-400'),
    right: icon('<polyline points="9 18 15 12 9 6"/>', 'text-slate-500 dark:text-slate-400'),
    dl: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', 'text-white'),
    ul: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', 'text-white'),
    yoga: icon('<circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 12.3-.9 5.7 6.4 1.1"/><path d="m22 17-6-1.1-2.9-5.3a2 2 0 0 0-2.8-.7L4.1 13.1"/><path d="m2 17 5.4-1.1"/>', 'text-emerald-600 dark:text-emerald-400'),
    swap: icon('<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>', 'text-slate-400'),
    alert: icon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>', 'currentColor'),
    bolt: icon('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>', 'text-amber-500 dark:text-amber-400'),
    sleep: icon('<path d="M2 4h4l2-2M22 4h-4l-2-2"/><path d="M9.5 16.5 6 20"/><path d="M14.5 16.5 18 20"/><path d="M12 12a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4Z"/><path d="M12 8V4"/>', 'text-indigo-400 dark:text-indigo-300'),
    walk: icon('<circle cx="12" cy="5" r="1.5"/><path d="m9 20 1.5-5"/><path d="M15 20l-1.5-5"/><path d="M10 15l2-7 4 1"/><path d="m7.5 11 2-2"/>', 'text-slate-500 dark:text-slate-400'),
    flag: icon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>', 'text-red-500 dark:text-red-400'),
    trophy: icon('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>', 'text-amber-500 dark:text-amber-400'),
    party: icon('<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.63-.69 1.06-1.33 1.06h-.36c-.87 0-1.52.77-1.38 1.64l.27 1.7"/><path d="M6.5 12.8 10 10l3 3-3.7 3.3"/>', 'text-yellow-500 dark:text-yellow-400'),
    rocket: icon('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>', 'text-blue-600 dark:text-blue-400'),
    target: icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', 'text-red-500 dark:text-red-400'),
    calendar: icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'text-blue-500 dark:text-blue-400'),
    heart: icon('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', 'text-red-500 dark:text-red-400'),
    seedling: icon('<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z"/>', 'text-emerald-500 dark:text-emerald-400'),
    muscle: icon('<path d="M6.5 6.5c1.7-1.3 4-1.8 5.5-.5 1.5-1.3 3.8-.8 5.5.5"/><path d="M4 10c0 4.5 3.5 8 8 8s8-3.5 8-8-3.5-8-8-8-8 3.5-8 8Z"/><path d="M8.5 12.5c0 0 1.5 2 3.5 2s3.5-2 3.5-2"/>', 'text-orange-500 dark:text-orange-400'),
    medal: icon('<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><circle cx="12" cy="17" r="5"/><path d="M12 13v4"/><path d="m14.5 16-2.5 1.5L9.5 16"/>', 'text-amber-500 dark:text-amber-400'),
    wind: icon('<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>', 'text-sky-500 dark:text-sky-400'),
    fire: icon('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>', 'text-orange-600 dark:text-orange-400'),
    star: icon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 'text-yellow-500 dark:text-yellow-400'),
    crossX: icon('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>', 'text-red-500 dark:text-red-400'),
    book: icon('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>', 'text-indigo-500 dark:text-indigo-400'),
    bulb: icon('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>', 'text-amber-500 dark:text-amber-400'),
    info: icon('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>', 'text-blue-500 dark:text-blue-400'),
    shield: icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>', 'text-emerald-500 dark:text-emerald-400'),
    legal: icon('<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/><path d="M20 12h-4"/><path d="M20 16h-4"/><path d="M20 8h-4"/><path d="M10 8h2"/><path d="M10 12h2"/><path d="M10 16h2"/>', 'text-slate-500 dark:text-slate-400')
};

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const splits = {
    Upper: { t: "Gym: Oberkörper", d: "Kraft & Hypertrophie", ex: ["Bankdrücken (Maschine)", "Rudern", "Schulterpresse", "Latzug", "Trizeps Kabel", "Bizeps Maschine"] },
    Lower: { t: "Gym: Beine", d: "Kraft (Maschine)", ex: ["Beinpresse 45°", "Beinstrecker", "Beinbeuger", "Wadenheben", "Abduktoren", "Adduktoren", "Core"] },
    Push: { t: "Gym: Push", d: "Brust, Schulter, Trizeps", ex: ["Brustpresse", "Schulterpresse", "Seitheben", "Trizepsdrücken", "Butterfly"] },
    Pull: { t: "Gym: Pull", d: "Rücken, Bizeps", ex: ["Latzug", "Rudern", "Face Pulls", "Bizeps Curls", "Butterfly Reverse"] },
    Legs: { t: "Gym: Beine", d: "Unterkörper Fokus", ex: ["Beinpresse", "Ausfallschritte", "Beinstrecker", "Beinbeuger", "Waden"] },
    Full: { t: "Gym: Ganzkörper", d: "Erhalt & Maschinen", ex: ["Beinpresse", "Brustpresse", "Rudern", "Latzug", "Schulterpresse", "Rückenstrecker"] }
};

const exAlternatives = {
    "Bankdrücken (Maschine)": ["Kurzhantel Bankdrücken", "Liegestütze", "Brustpresse"], "Rudern": ["Kabelrudern", "Kurzhantel Rudern", "T-Bar Rudern", "Klimmzüge"],
    "Schulterpresse": ["Military Press", "Kurzhantel Schulterdrücken", "Seitheben"], "Latzug": ["Klimmzüge", "Assisted Pull-ups", "Überzüge", "Rudern"],
    "Trizeps Kabel": ["Trizepsdrücken KH", "French Press", "Dips"], "Bizeps Maschine": ["Kurzhantel Curls", "Hammer Curls", "Langhantel Curls"],
    "Beinpresse 45°": ["Kniebeugen", "Bulgarian Split Squats", "Hackenschmidt"], "Beinstrecker": ["Ausfallschritte", "Sissy Squats"],
    "Beinbeuger": ["Romanian Deadlifts (RDL)", "Nordic Curls", "Good Mornings"], "Wadenheben": ["Seilspringen", "Wadenheben sitzend"],
    "Brustpresse": ["Bankdrücken", "Liegestütze"], "Seitheben": ["Aufrechtes Rudern", "Face Pulls"], "Face Pulls": ["Reverse Butterfly", "Vorgebeugtes Seitheben"],
    "Ausfallschritte": ["Beinpresse", "Kniebeugen"], "Rückenstrecker": ["Hyperextensions", "Good Mornings"]
};

const mobilityRoutine = [
    { n: "90/90 Hüftwechsel", d: "10 pro Seite. Öffnet die Hüfte." }, { n: "World's Greatest Stretch", d: "5 pro Seite. Ganzkörper." },
    { n: "Cat-Cow", d: "10 Wdh. Wirbelsäule mobilisieren." }, { n: "Ankle Rocks", d: "10 pro Seite. Sprunggelenk." },
    { n: "Deep Squat Hold", d: "30-60 Sek. halten." }, { n: "Couch Stretch", d: "30 Sek pro Seite. Hüftbeuger." }
];

const legalTemplates = {
    impressum: `
        <h3 class="font-bold text-lg mb-4">Impressum</h3>
        <p class="text-sm mb-4">Angaben gemäß § 5 TMG:</p>
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 text-xs space-y-2 mb-6">
            <p><strong>Betreiber:</strong> David Werner </p>
            <p><strong>Kontakt:</strong> littledaaviid122@gmail.com </p>
            <p><strong>Anschrift:</strong> Robert-Britsch Str. 54, 75449 Wurmberg </p>
    `,
    privacy: `
        <h3 class="font-bold text-lg mb-4">Datenschutzerklärung</h3>
        <div class="text-xs space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <section>
                <p class="font-bold mb-1">1. Datenschutz auf einen Blick</p>
                <p>Diese Webapp speichert alle Trainingsdaten <strong>lokal</strong> in deinem Browser (LocalStorage). Es findet keine Übertragung deiner Profildaten auf eigene Server statt.</p>
            </section>
            <section>
                <p class="font-bold mb-1">2. Hosting (GitHub Pages)</p>
                <p>Diese Seite wird bei GitHub Inc. gehostet. Bei der Nutzung werden technisch notwendige Daten (IP-Adresse) in Server-Logfiles verarbeitet. Details dazu findest du in der <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" class="underline">GitHub Privacy Statement</a>.</p>
            </section>
            <section>
                <p class="font-bold mb-1">3. KI-Schnittstelle (Google Gemini)</p>
                <p>Wenn du die KI-Funktionen nutzt, werden deine anonymisierten Trainings-Skelette (ohne Namen/Mail) an die Google Gemini API übertragen. Hierfür gilt die <a href="https://ai.google.dev/terms" target="_blank" class="underline">Datenschutzerklärung von Google</a>.</p>
            </section>
            <section>
                <p class="font-bold mb-1">4. Deine Rechte</p>
                <p>Du hast jederzeit das Recht auf Auskunft, Berichtigung oder Löschung deiner lokalen Daten (über die Backup/Reset-Funktion der App).</p>
            </section>
        </div>
    `
};
