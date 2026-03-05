// --- DATA: Icons, Splits, Phases, Mobility ---
const icon = (path, col) => `<svg class="w-5 h-5 ${col}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const I = {
    gym: icon('<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>', 'text-blue-600 dark:text-blue-400'),
    run: icon('<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.67 5.71-2 8a7 7 0 0 0 2 5.18V22H5a2 2 0 0 1-2-2v-4"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 13 7.8 13 12c0 2.85 1.67 5.71 2 8a7 7 0 0 0-2 5.18V26h6a2 2 0 0 0 2-2v-4"/>', 'text-orange-500 dark:text-orange-400'),
    bike: icon('<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-5"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>', 'text-teal-600 dark:text-teal-400'),
    vol: icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', 'text-pink-600 dark:text-pink-400'),
    sparkle: icon('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>', 'text-indigo-500 dark:text-indigo-400'),
    rest: icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'text-slate-400 dark:text-slate-500'),
    check: icon('<polyline points="20 6 9 17 4 12"/>', 'text-white'),
    brain: icon('<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>', 'text-indigo-600 dark:text-indigo-300'),
    chart: icon('<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>', 'text-slate-600 dark:text-slate-300'),
    plan: icon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'text-slate-600 dark:text-slate-300'),
    sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', 'text-amber-500'),
    moon: icon('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', 'text-slate-400'),
    save: icon('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>', 'text-white'),
    left: icon('<polyline points="15 18 9 12 15 6"/>', 'text-slate-500 dark:text-slate-400'),
    right: icon('<polyline points="9 18 15 12 9 6"/>', 'text-slate-500 dark:text-slate-400'),
    dl: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', 'text-white'),
    ul: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', 'text-white'),
    yoga: icon('<circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 12.3-.9 5.7 6.4 1.1"/><path d="m22 17-6-1.1-2.9-5.3a2 2 0 0 0-2.8-.7L4.1 13.1"/><path d="m2 17 5.4-1.1"/>', 'text-emerald-600 dark:text-emerald-400'),
    swap: icon('<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>', 'text-slate-400'),
    alert: icon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>', 'currentColor')
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
