// --- ONBOARDING: Splash, Multi-Step, API Key Guide, Tutorial ---

let obStep = 0;
const obData = { fitness: 'Beginner', goal: 'Halbmarathon', goalDate: '', goalTime: '', maxHR: 190, apiKey: '', teamSport: 'none', teamSportDays: ['Dienstag'], benchmarkDist: '', benchmarkTime: '', benchmarkAvgHR: '', benchmarkNotes: '' };
const obSteps = [
    { icon: 'run', title: 'Erfahrung', sub: 'Wie lange trainierst du schon?', field: 'fitness', type: 'select', options: [{ v: 'Beginner', i: 'seedling', l: 'Anfänger (0-1 Jahr)' }, { v: 'Intermediate', i: 'muscle', l: 'Fortgeschritten (1-3 Jahre)' }, { v: 'Pro', i: 'trophy', l: 'Profi (3+ Jahre)' }] },
    { icon: 'target', title: 'Dein Ziel', sub: 'Worauf arbeitest du hin?', field: 'goal', type: 'select', options: [{ v: 'Halbmarathon', i: 'medal', l: 'Halbmarathon' }, { v: '10k Lauf', i: 'wind', l: '10k Lauf' }, { v: 'Marathon', i: 'fire', l: 'Marathon' }, { v: 'Allgemeine Fitness', i: 'star', l: 'Allgemeine Fitness (Hybrid)' }] },
    { icon: 'calendar', title: 'Zieldatum', sub: 'Wann ist dein Renntag? (Optional)', field: 'goalDate', type: 'date' },
    { icon: 'timer', title: 'Zielzeit', sub: 'Hast du eine Zielzeit im Kopf? (Optional, z.B. 1:45:00)', field: 'goalTime', type: 'text', placeholder: 'hh:mm:ss oder mm:ss' },
    { icon: 'vol', title: 'Teamsport', sub: 'Hast du einen regelmäßigen Teamsport?', field: 'teamSport', type: 'teamsport' },
    { icon: 'heart', title: 'Max Herzfrequenz', sub: 'Für deine Trainingszonen', field: 'maxHR', type: 'number', placeholder: '190' },
    { icon: 'fire', title: 'Benchmark Run', sub: 'Nutze einen vergangenen Lauf als Basis für deinen Plan', field: 'benchmark', type: 'benchmark' },
    { icon: 'sparkle', title: 'KI-Power', sub: 'Gemini API Key für smarte Planung', field: 'apiKey', type: 'apikey' }
];

window.startOnboarding = () => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('onboarding-overlay').style.display = 'flex';
    obStep = 0; renderObStep();
};

function renderObStep() {
    const step = obSteps[obStep];
    let dots = '';
    for (let i = 0; i < obSteps.length; i++) {
        dots += `<div class="h-1.5 flex-1 rounded-full transition-all ${i <= obStep ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}"></div>`;
    }
    document.getElementById('ob-steps').innerHTML = dots;

    let inputHtml = '';
    if (step.type === 'select') {
        inputHtml = `<div class="space-y-3">${step.options.map(o =>
            `<button onclick="window.obSelect('${step.field}','${o.v}')" class="w-full p-4 rounded-xl border-2 text-left font-bold transition-all flex items-center gap-3 ${obData[step.field] === o.v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md' : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:border-blue-300'}"><span class="w-6 h-6 flex-shrink-0">${I[o.i]}</span><span class="text-lg">${o.l}</span></button>`
        ).join('')}</div>`;
    } else if (step.type === 'date') {
        inputHtml = `<input type="date" id="ob-input" value="${obData[step.field]}" onchange="obData['${step.field}']=this.value" class="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-lg focus:border-blue-500 outline-none">`;
    } else if (step.type === 'teamsport') {
        const sports = [
            { v: 'none', i: 'crossX', l: 'Kein Teamsport' },
            { v: 'volleyball', i: 'vol', l: 'Volleyball' },
            { v: 'fussball', i: 'vol', l: 'Fußball' },
            { v: 'basketball', i: 'vol', l: 'Basketball' },
            { v: 'handball', i: 'vol', l: 'Handball' },
            { v: 'other', i: 'medal', l: 'Anderer Sport' }
        ];
        const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
        inputHtml = `<div class="space-y-3">${sports.map(o =>
            `<button onclick="window.obSelect('teamSport','${o.v}')" class="w-full p-3 rounded-xl border-2 text-left font-bold transition-all text-sm flex items-center gap-2 ${obData.teamSport === o.v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md' : 'border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:border-blue-300'}"><span class="w-5 h-5 flex-shrink-0">${I[o.i]}</span>${o.l}</button>`
        ).join('')}</div>
        ${obData.teamSport !== 'none' ? `
            <p class="text-xs font-bold opacity-60 dark:text-slate-400 mt-4 mb-2">An welchen Tagen?</p>
            <div class="flex flex-wrap gap-2">${days.map(d =>
            `<button onclick="window.obToggleDay('${d}')" class="px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${obData.teamSportDays.includes(d) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 dark:text-slate-400'}">${d.substring(0, 2)}</button>`
        ).join('')}</div>
        ` : ''}`;
    } else if (step.type === 'apikey') {
        inputHtml = `
            <input type="password" id="ob-input" value="${obData[step.field] || ''}" onchange="obData['${step.field}']=this.value" placeholder="API Key einfügen..." class="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-lg focus:border-blue-500 outline-none mb-3">
            <details class="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-3">
                <summary class="text-xs font-bold text-indigo-700 dark:text-indigo-400 cursor-pointer flex items-center gap-1"><span class="w-4 h-4">${I.book}</span> Wie bekomme ich einen API Key?</summary>
                <ol class="text-xs text-indigo-600 dark:text-indigo-400 mt-2 space-y-1.5 pl-4 list-decimal">
                    <li>Gehe zu <a href="https://aistudio.google.com" target="_blank" class="underline font-bold">aistudio.google.com</a></li>
                    <li>Melde dich mit deinem Google-Konto an</li>
                    <li>Klicke links auf <b>"Get API Key"</b></li>
                    <li>Erstelle einen neuen Key oder wähle ein bestehendes Projekt</li>
                    <li>Kopiere den Key und füge ihn oben ein</li>
                </ol>
                <p class="text-[10px] text-indigo-500 mt-2 flex items-center gap-1"><span class="w-3 h-3">${I.bulb}</span> Der kostenlose Tier reicht völlig aus (5 RPM).</p>
            </details>`;
    } else if (step.type === 'benchmark') {
        inputHtml = `
            <div class="space-y-4">
                <p class="text-xs dark:text-slate-400 opacity-80">Je genauer dein Benchmark, desto besser kann der Plan skaliert werden (Optional).</p>
                <div>
                    <label class="block text-xs font-bold dark:text-slate-300 mb-1">Distanz (km)</label>
                    <input type="number" step="0.1" id="ob-bench-dist" value="${obData.benchmarkDist}" onchange="obData.benchmarkDist=this.value" placeholder="z.B. 5 oder 10" class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-lg focus:border-blue-500 outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold dark:text-slate-300 mb-1">Zeit (hh:mm:ss)</label>
                        <input type="text" id="ob-bench-time" value="${obData.benchmarkTime}" onchange="obData.benchmarkTime=this.value" placeholder="00:25:30" class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-lg focus:border-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold dark:text-slate-300 mb-1">Ø HF (bpm)</label>
                        <input type="number" id="ob-bench-hr" value="${obData.benchmarkAvgHR}" onchange="obData.benchmarkAvgHR=this.value" placeholder="165" class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-lg focus:border-blue-500 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold dark:text-slate-300 mb-1">Notizen zum Lauf</label>
                    <textarea id="ob-bench-notes" onchange="obData.benchmarkNotes=this.value" rows="2" placeholder="z.B. Sehr anstrengend, hügelig, heiß..." class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none">${obData.benchmarkNotes}</textarea>
                </div>
            </div>`;
    } else {
        inputHtml = `<input type="${step.type}" id="ob-input" value="${obData[step.field] || ''}" onchange="obData['${step.field}']=this.value" placeholder="${step.placeholder || ''}" class="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-lg focus:border-blue-500 outline-none">`;
    }

    const isLast = obStep === obSteps.length - 1;
    document.getElementById('ob-content').innerHTML = `
        <div class="fade-in">
            <div class="w-12 h-12 mb-4">${I[step.icon]}</div>
            <h2 class="text-2xl font-bold dark:text-white mb-1">${step.title}</h2>
            <p class="text-sm opacity-60 dark:text-slate-400 mb-6">${step.sub}</p>
            ${inputHtml}
            <div class="flex gap-3 mt-8">
                ${obStep > 0 ? '<button onclick="window.obPrev()" class="flex-1 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold dark:text-white">Zurück</button>' : ''}
                <button id="ob-next-btn" onclick="window.obNext()" class="flex-1 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">${isLast ? '<span class="w-5 h-5">' + I.rocket + '</span> Plan erstellen' : 'Weiter →'}</button>
            </div>
        </div>
    `;
}

window.obSelect = (field, val) => { obData[field] = val; renderObStep(); };
window.obToggleDay = (d) => {
    if (!obData.teamSportDays) obData.teamSportDays = [];
    if (obData.teamSportDays.includes(d)) {
        obData.teamSportDays = obData.teamSportDays.filter(day => day !== d);
    } else {
        obData.teamSportDays.push(d);
    }
    renderObStep();
};
window.obPrev = () => { if (obStep > 0) { obStep--; renderObStep(); } };
window.obNext = () => {
    const inp = document.getElementById('ob-input');
    if (inp) obData[obSteps[obStep].field] = inp.value;
    if (obStep < obSteps.length - 1) { obStep++; renderObStep(); return; }
    finalizeOnboarding();
};

async function finalizeOnboarding() {
    state.user.fitness = obData.fitness;
    state.user.goal = obData.goal;
    state.user.goalDate = obData.goalDate;
    state.user.goalTime = obData.goalTime;
    state.user.maxHR = parseInt(obData.maxHR) || 190;
    state.user.apiKey = obData.apiKey;
    state.user.teamSport = obData.teamSport;
    state.user.teamSportDays = obData.teamSportDays || [];
    state.user.benchmarkDist = obData.benchmarkDist;
    state.user.benchmarkTime = obData.benchmarkTime;
    state.user.benchmarkAvgHR = obData.benchmarkAvgHR;
    state.user.benchmarkNotes = obData.benchmarkNotes;
    state.user.initialized = true;

    // Recalculate configs for new total weeks
    const newTotal = getTotalWeeks(state.user);
    state.configs = buildDefaultConfigs(newTotal);
    // Apply team sport setting
    if (state.user.teamSport && state.user.teamSport !== 'none') {
        for (let i = 0; i < state.configs.length; i++) {
            state.configs[i].vol = [...state.user.teamSportDays];
        }
    } else {
        for (let i = 0; i < state.configs.length; i++) {
            state.configs[i].vol = false;
        }
    }
    save();

    if (state.user.apiKey) {
        document.getElementById('ob-content').innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 fade-in">
                <div class="relative w-24 h-24 mb-6">
                    <svg class="w-24 h-24 animate-spin" style="animation-duration:3s" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke-width="6" class="stroke-slate-200 dark:stroke-slate-700" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke-width="6" stroke-linecap="round" class="stroke-blue-500" stroke-dasharray="180 264" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center"><div class="w-8 h-8">${I.sparkle}</div></div>
                </div>
                <h2 class="text-xl font-bold dark:text-white mb-2">Plan wird erstellt...</h2>
                <p class="text-sm opacity-50 dark:text-slate-400 text-center">Die KI analysiert dein Profil und<br>erstellt deinen ${newTotal}-Wochen Trainingsplan</p>
            </div>
        `;
        document.getElementById('ob-steps').innerHTML = '';
        try {
            await fetchInitialGlobalAIPlan();
            // Tutorial wird erst nach Plan-Bestätigung gezeigt (via window._showTutorialAfterPlan)
            window._showTutorialAfterPlan = true;
        } catch (e) {
            console.warn('KI Onboarding fehlgeschlagen:', e);
            document.getElementById('onboarding-overlay').style.display = 'none';
            showTutorial();
        }
    } else {
        document.getElementById('onboarding-overlay').style.display = 'none';
        showTutorial();
    }
}

// --- TUTORIAL OVERLAY ---
const tutorialSteps = [
    { selector: null, title: 'Willkommen!', text: 'Hier ein kurzer Überblick über deine neue Training-App.', pos: 'center' },
    { selector: '#tut-week-nav', title: 'Wochennavigation', text: 'Hier navigierst du zwischen deinen Trainingswochen.', pos: 'below' },
    { selector: '#tut-tabs', title: 'Ansichten', text: 'Wechsle zwischen Wochenplan, Mobility und Statistiken.', pos: 'below' },
    { selector: '#tut-setup', title: 'Setup', text: 'Hier stellst du deine Gym-Tage, HR und KI ein.', pos: 'below' }
];
let tutStep = 0;

function showTutorial() {
    if (state.user.tutorialDone) { window.render(); return; }
    window.render();
    setTimeout(() => {
        tutStep = 0;
        renderTutorialStep();
    }, 300);
}

function renderTutorialStep() {
    let overlay = document.getElementById('tutorial-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;pointer-events:auto;';
        document.body.appendChild(overlay);
    }

    const step = tutorialSteps[tutStep];
    const isLast = tutStep === tutorialSteps.length - 1;

    let spotlightHtml = '';
    if (step.selector) {
        const el = document.querySelector(step.selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            const pad = 8;
            spotlightHtml = `
                <div style="position:absolute;left:${rect.left - pad}px;top:${rect.top - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px;border-radius:12px;box-shadow:0 0 0 4000px rgba(0,0,0,0.65);z-index:2001;pointer-events:none;border:2px solid rgba(96,165,250,0.8);"></div>
                <div style="position:absolute;left:${rect.left}px;top:${rect.bottom + 16}px;z-index:2002;max-width:280px;" class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border dark:border-slate-700">
                    <div style="position:absolute;top:-8px;left:20px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:8px solid white;" class="dark:border-b-slate-800"></div>
                    <h3 class="font-bold text-sm dark:text-white mb-1">${step.title}</h3>
                    <p class="text-xs opacity-70 dark:text-slate-400 mb-3">${step.text}</p>
                    <div class="flex gap-2">
                        <button onclick="window.skipTutorial()" class="flex-1 p-2 text-xs rounded-lg border dark:border-slate-600 dark:text-slate-300">Überspringen</button>
                        <button onclick="window.nextTutorial()" class="flex-1 p-2 text-xs rounded-lg bg-blue-600 text-white font-bold">${isLast ? 'Fertig ✓' : 'Weiter →'}</button>
                    </div>
                </div>
            `;
        }
    }

    if (!step.selector || !spotlightHtml) {
        // Center card
        overlay.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:2001;" onclick="event.stopPropagation()"></div>
            <div style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2002;max-width:300px;" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border dark:border-slate-700 text-center">
                <h3 class="font-bold text-lg dark:text-white mb-2">${step.title}</h3>
                <p class="text-sm opacity-70 dark:text-slate-400 mb-4">${step.text}</p>
                <div class="flex gap-2">
                    <button onclick="window.skipTutorial()" class="flex-1 p-2 text-xs rounded-lg border dark:border-slate-600 dark:text-slate-300">Überspringen</button>
                    <button onclick="window.nextTutorial()" class="flex-1 p-2 text-xs rounded-lg bg-blue-600 text-white font-bold">${isLast ? 'Fertig ✓' : 'Weiter →'}</button>
                </div>
            </div>
        `;
    } else {
        overlay.innerHTML = `
            <div style="position:fixed;inset:0;z-index:2000;" onclick="event.stopPropagation()"></div>
            ${spotlightHtml}
        `;
    }
}

window.nextTutorial = () => {
    tutStep++;
    if (tutStep >= tutorialSteps.length) {
        closeTutorial();
    } else {
        renderTutorialStep();
    }
};

window.skipTutorial = () => { closeTutorial(); };

function closeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.remove();
    state.user.tutorialDone = true;
    save();
}
